import type { Guild, Message, Snowflake } from "discord.js";
import { inject, injectable } from "tsyringe";

import { AutomodApi } from "@/api/automod/automod.api.js";
import type { AutomodMessage } from "@/api/automod/automod.types.js";
import { LocalCache } from "@/cache/local.cache.js";

import { AutomodLogService } from "./automod-logs.service.js";

const MESSAGE_CACHE_KEYS_LIMIT = 10;
const CLEAN_TIMEOUT_DELAY = 10_000;

@injectable()
export class AIAutoAnalyzeService {
  // Key - `${CHANNEL_ID}-${MESSAGE_ID}`
  private cache: LocalCache;
  // Key - `${CHANNEL_ID}`
  private timeoutCache: LocalCache;

  constructor(
    @inject(AutomodApi) private automodApi: AutomodApi,
    @inject(AutomodLogService) private automodLogService: AutomodLogService,
  ) {
    this.cache = new LocalCache();
    this.timeoutCache = new LocalCache();
  }

  // cache writer
  async execute(msg: Message) {
    const content = msg.content;
    if (!content || !msg.guild || msg.author.bot) {
      return;
    }
    const channelId = msg.channelId;
    this.cache.set<AutomodMessage>(
      `${channelId}-${msg.id}`,
      {
        content: msg.content,
        createdAt: msg.createdAt,
        user_id: msg.author.id,
      },
      Infinity,
    );
    const messageKeys = this.getMessageKeys(channelId);
    if (messageKeys.length === MESSAGE_CACHE_KEYS_LIMIT) {
      return this.startJob(msg, true);
    }
    return this.startJob(msg);
  }

  /**
   *
   * @param channelId
   * @param force if provided, it will remove old timeout and start the new
   */
  private startJob(msg: Message, force: boolean = false) {
    const channelId = msg.channel.id;
    const guild = msg.guild!;
    const existed = this.timeoutCache.get(channelId);
    if (!force) {
      if (existed) {
        return;
      }
      this.startTimeout(channelId, guild);
      return;
    }
    if (existed) {
      clearTimeout(existed);
      this.timeoutCache.delete(channelId);
    }
    this.analyzeMessages(channelId, guild);
    this.startJob(msg);
  }

  private async analyzeMessages(channelId: Snowflake, guild: Guild) {
    const messages = this.getMessageKeys(channelId, {
      returnObject: true,
      removeKeys: true,
    });
    const analytics = await this.automodApi.automodAIRules({
      messages: Object.values(messages) as AutomodMessage[],
    });
    if (analytics && analytics.success) {
      await this.automodLogService.execute(analytics.data, guild);
    }
  }

  private startTimeout(channelId: Snowflake, guild: Guild) {
    this.timeoutCache.set(
      channelId,
      setTimeout(
        async () => await this.analyzeMessages(channelId, guild),
        CLEAN_TIMEOUT_DELAY,
      ),
      CLEAN_TIMEOUT_DELAY,
    );
  }

  private getMessageKeys(
    channelId: Snowflake,
    options?: { returnObject: boolean; removeKeys: boolean },
  ) {
    const allEntries = this.cache.getAll().entries();
    const filteredEntries = Array.from(allEntries).filter(([key]) =>
      key.startsWith(`${channelId}-`),
    );

    if (options?.removeKeys) {
      for (const key of Object.keys(filteredEntries)) {
        this.cache.delete(key);
      }
    }

    if (options?.returnObject) {
      return Object.fromEntries(
        filteredEntries.map(([key, entry]) => [key, entry.data]),
      );
    }
    return filteredEntries.map(([key]) => key);
  }
}
