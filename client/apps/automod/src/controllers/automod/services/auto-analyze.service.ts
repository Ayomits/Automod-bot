import { AutomodApi } from "@automod/api";
import type { AutomodMessage } from "@automod/types";
import type { Message, Snowflake, TextChannel } from "discord.js";
import { Events } from "discord.js";
import { inject, injectable } from "tsyringe";

import { LocalCache } from "#cache/local.cache.js";

import { AutomodLogService } from "./automod-logs.service.js";

const AI_MESSAGE_CACHE_KEYS_LIMIT = 10;
const AI_ANALYSIS_TIMEOUT_DELAY = 10_000;
const BULK_DELETE_TIMEOUT_DELAY = 5_000;

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
  private aiMessageCache: LocalCache<CacheKey, AutomodMessage>;
  // CHANNEL_ID-MESSAGE_ID
  private algsMessageCache: LocalCache<CacheKey, Message>;

  private aiTimeoutCache: LocalCache<Snowflake, NodeJS.Timeout>;
  private algsTimeoutCache: LocalCache<Snowflake, NodeJS.Timeout>;

  constructor(
    @inject(AutomodApi) private automodApi: AutomodApi,
    @inject(AutomodLogService) private automodLogService: AutomodLogService,
  ) {
    this.aiMessageCache = new LocalCache();
    this.aiTimeoutCache = new LocalCache();
    this.algsMessageCache = new LocalCache();
    this.algsTimeoutCache = new LocalCache();
  }

  async handleMessage(
    msg: Message,
    eventType:
      | Events.MessageCreate
      | Events.MessageUpdate = Events.MessageCreate,
  ) {
    if (msg.author.bot || !msg.guild || !msg.content) {
      return;
    }

    await Promise.all([
      this.handleAIAnalysis(msg),
      this.handleAlgorithmicCheck(msg, eventType),
    ]);
  }

  private async handleAIAnalysis(msg: Message) {
    this.pushAiCacheMessage(msg);
    const messages = this.getMessages(msg.channel.id, "AI", {
      returnValues: true,
    });
    this.startAiAnalysis(msg, messages.length === AI_MESSAGE_CACHE_KEYS_LIMIT);
  }

  private async handleAlgorithmicCheck(
    msg: Message,
    eventType: Events.MessageCreate | Events.MessageUpdate,
  ) {
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
      setTimeout(() => {
        this.automodLogService.sendGuildLog(result.data, msg.guild!);
      }, 500);
    }
  }

  //============STARTER=============
  private async startAiAnalysis(msg: Message, force = false) {
    return await this.scheduleJob(
      msg.channel.id,
      "AI",
      async () => await this.processAiAnalysis(msg.channel as TextChannel),
      AI_ANALYSIS_TIMEOUT_DELAY,
      force,
    );
  }

  private async startAlgsAnalysis(msg: Message, force = false) {
    return await this.scheduleJob(
      msg.channel.id,
      "ALGS",
      async () => await this.processBulkDelete(msg.channel as TextChannel),
      BULK_DELETE_TIMEOUT_DELAY,
      force,
    );
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
      await this.automodLogService.sendGuildLog(analytics.data, channel.guild!);
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

  //===========PUSHERS=========
  private pushAiCacheMessage(msg: Message) {
    this.aiMessageCache.set(
      this.generateCacheKey(msg.channel.id, msg.id),
      {
        user_id: msg.author.id,
        content: msg.content!,
        createdAt: msg.createdAt,
      },
      Infinity,
    );
  }

  private pushAlgsCacheMessage(msg: Message) {
    this.algsMessageCache.set(
      this.generateCacheKey(msg.channel.id, msg.id),
      msg,
      Infinity,
    );
  }

  //============UTILITARY===========
  private async scheduleJob(
    key: string,
    type: CacheType,
    callback: () => void | Promise<void>,
    delay: number,
    forceExisted = false,
  ) {
    const cache = this.getTimeoutCacheByType(type);
    const existed = cache.get(key);

    if (existed) {
      if (forceExisted) {
        clearTimeout(existed);
        cache.delete(key);
        await callback();
      }
      return;
    }

    cache.set(
      key,
      setTimeout(async () => {
        await callback();
        cache.delete(key);
      }, delay),
      delay,
    );
  }

  private generateCacheKey(
    channelId: Snowflake,
    messageId: Snowflake,
  ): CacheKey {
    return `${channelId}-${messageId}`;
  }

  private getMessages<T = AutomodMessage>(
    channelId: Snowflake,
    type: CacheType,
    options?: GetMessagesOptions,
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

  private getMessageCacheByType(type: CacheType) {
    return type === "AI" ? this.aiMessageCache : this.algsMessageCache;
  }

  private getTimeoutCacheByType(type: CacheType) {
    return type === "AI" ? this.aiTimeoutCache : this.algsTimeoutCache;
  }
}
