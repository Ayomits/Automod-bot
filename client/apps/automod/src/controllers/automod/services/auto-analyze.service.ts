import { AutomodApi } from "@automod/api";
import type { AutomodMessage } from "@automod/types";
import type {
  GuildChannel,
  Message,
  PartialMessage,
  Snowflake,
  TextChannel,
} from "discord.js";
import { Events } from "discord.js";
import { inject, injectable } from "tsyringe";

import { LocalCache } from "#cache/local.cache.js";
import { ScheduleManager } from "#lib/schedule/schedule-manager.js";

import { AutomodLogService } from "./automod-logs.service.js";

const AI_MESSAGE_CACHE_KEYS_LIMIT = 10;
const AI_ANALYSIS_TIMEOUT_DELAY = 10_000;
const BULK_DELETE_TIMEOUT_DELAY = 3_000;

// 1 - Channel id
// 2 - Message id
type CacheKey = `${Snowflake}-${Snowflake}`;

type CacheType = "AI" | "ALGS";

interface GetMessagesOptions {
  removeKeys?: boolean;
  returnValues?: boolean;
}

@injectable()
export class AutoAnalyzeAutomodService {
  constructor(
    @inject(AutomodApi) private automodApi: AutomodApi,
    @inject(AutomodLogService) private automodLogService: AutomodLogService,
    @inject(ScheduleManager)
    private aiTimeoutCache: ScheduleManager,
    @inject(ScheduleManager)
    private algsTimeoutCache: ScheduleManager,
    @inject(LocalCache)
    private aiMessageCache: LocalCache<CacheKey, AutomodMessage>,
    @inject(LocalCache) private algsMessageCache: LocalCache<CacheKey, Message>
  ) {}

  // ==========HANDLERS==========
  async handleMessage(
    msg: Message | PartialMessage,
    eventType:
      | Events.MessageCreate
      | Events.MessageUpdate
      | Events.MessageDelete = Events.MessageCreate
  ) {
    if (msg.author!.bot || !msg.guild || !msg.content) {
      return;
    }

    await Promise.all([
      this.handleAIAnalysis(msg, eventType),
      this.handleAlgorithmicCheck(msg, eventType),
    ]);
  }

  private async handleAIAnalysis(
    msg: Message | PartialMessage,
    eventType:
      | Events.MessageCreate
      | Events.MessageUpdate
      | Events.MessageDelete
  ) {
    if (msg.partial || eventType === Events.MessageDelete) {
      return this.removeAICacheMessage(msg as PartialMessage);
    }
    this.pushAiCacheMessage(msg);
    const messages = this.getMessages(msg.channel.id, "AI", {
      returnValues: true,
    });
    return this.startAiAnalysis(
      msg,
      messages.length === AI_MESSAGE_CACHE_KEYS_LIMIT
    );
  }

  private async handleAlgorithmicCheck(
    msg: Message | PartialMessage,
    eventType:
      | Events.MessageCreate
      | Events.MessageUpdate
      | Events.MessageDelete
  ) {
    if (msg.partial || eventType === Events.MessageDelete) {
      return this.removeAlgsCacheMessage(msg as PartialMessage);
    }
    const result = await this.automodApi.automodAlghorthimicRules({
      messages: [
        {
          content: msg.content,
          user_id: msg.author.id,
          createdAt: msg.createdAt,
        },
      ],
    });

    if (result?.success && result?.data?.matches.length) {
      if (eventType === Events.MessageCreate) {
        this.pushAlgsCacheMessage(msg);
        this.startAlgsAnalysis(msg);
      }
      this.automodLogService.sendGuildLog(
        result.data,
        msg.channel as GuildChannel
      );
    }
  }

  //============STARTER=============
  private startAiAnalysis(msg: Message, force = false) {
    return this.aiTimeoutCache.set(msg.channel.id, {
      callback: async () =>
        await this.processAiAnalysis(msg.channel as TextChannel),
      delay: AI_ANALYSIS_TIMEOUT_DELAY,
      force,
    });
  }

  private async startAlgsAnalysis(msg: Message, force = false) {
    return this.algsTimeoutCache.set(msg.channel.id, {
      callback: async () =>
        await this.processBulkDelete(msg.channel as TextChannel),
      delay: BULK_DELETE_TIMEOUT_DELAY,
      force,
    });
  }

  //============PROCESSORS==========
  private async processAiAnalysis(channel: TextChannel) {
    const messages = this.getMessages(channel.id, "AI", {
      returnValues: true,
    });
    if (messages.length === 0) return;

    const analytics = await this.automodApi.automodAIRules({
      messages: messages as AutomodMessage[],
    });
    if (analytics && analytics.success) {
      await this.automodLogService.sendGuildLog(analytics.data, channel);
    }
  }

  private async processBulkDelete(channel: TextChannel) {
    const messages = this.getMessages(channel.id, "ALGS", {
      returnValues: true,
    });
    if (messages.length === 0) return;

    this.getMessages<Message[]>(channel.id, "ALGS", {
      removeKeys: true,
    });

    try {
      await channel.bulkDelete(messages as unknown as Message[]);
    } catch (error) {
      console.error("Bulk delete failed:", error);
    }
  }

  //===========CACHE ACTIONS=========
  private pushAiCacheMessage(msg: Message) {
    this.aiMessageCache.set(
      this.generateCacheKey(msg.channel.id, msg.id),
      {
        user_id: msg.author.id,
        content: msg.content!,
        createdAt: msg.createdAt,
      },
      Infinity
    );
  }

  private pushAlgsCacheMessage(msg: Message) {
    this.algsMessageCache.set(
      this.generateCacheKey(msg.channel.id, msg.id),
      msg,
      Infinity
    );
  }

  private removeAICacheMessage(msg: PartialMessage) {
    this.aiMessageCache.delete(this.generateCacheKey(msg.channel.id, msg.id));
  }

  private removeAlgsCacheMessage(msg: PartialMessage) {
    this.algsMessageCache.delete(this.generateCacheKey(msg.channel.id, msg.id));
  }

  private generateCacheKey(
    channelId: Snowflake,
    messageId: Snowflake
  ): CacheKey {
    return `${channelId}-${messageId}`;
  }

  private getMessageCacheByType(type: CacheType) {
    switch (type) {
      case "AI":
        return this.aiMessageCache;
      default:
        return this.algsMessageCache;
    }
  }

  //============UTILITARY===========
  private getMessages<T = AutomodMessage>(
    channelId: Snowflake,
    type: CacheType,
    options?: GetMessagesOptions
  ): Array<T> {
    const cache = this.getMessageCacheByType(type);
    const raw = cache.raw();
    const values: {
      key: CacheKey;
      value: T;
    }[] = [];

    raw.forEach((value, key) => {
      if (!key.includes(channelId)) {
        return null;
      }
      return values.push({
        key,
        value: value.data as T,
      });
    });

    if (options?.removeKeys) {
      Array.from(raw.keys())
        .filter((key) => key.startsWith(`${channelId}-`))
        .forEach((key) => cache.delete(key as CacheKey));
    }

    return values.filter(Boolean).map((item) => item.value);
  }
}
