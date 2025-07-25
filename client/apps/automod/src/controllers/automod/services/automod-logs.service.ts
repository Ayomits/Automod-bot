import type {
  AutomodMatch,
  AutomodResponse,
  AutomodRule,
  ObjectKeys,
} from "@automod/types";
import type {
  APIEmbed,
  Guild,
  GuildChannel,
  Message,
  SendableChannels,
  Snowflake,
  User,
} from "discord.js";
import { EmbedBuilder } from "discord.js";
import { inject, injectable } from "tsyringe";

import { LocalCache } from "#cache/local.cache.js";
import { TempConfig } from "#const/temp-config.js";
import { ScheduleManager } from "#lib/schedule/schedule-manager.js";

import { AutomodLogMessages } from "../../../messages/automod.messages.js";

const EMBEDS_LIMIT = 25;
const BATCHED_LOG_DELAY = 2_000;
const SINGLE_LOG_DELAY = 500;

@injectable()
export class AutomodLogService {
  constructor(
    @inject(ScheduleManager) private logTimeoutCache: ScheduleManager,
    @inject(LocalCache)
    private logEmbedsCache: LocalCache<Snowflake, APIEmbed[]>
  ) {}

  public async sendLogs(response: AutomodResponse, msg: Message) {
    if (msg.guild) {
      return;
    }
    await Promise.allSettled([
      this.sendDmLog(response, msg.guild!, msg.author),
      this.sendGuildLog(response, msg.channel as GuildChannel),
    ]);
  }

  public async sendGuildLog(response: AutomodResponse, channel: GuildChannel) {
    const resolvedMatches = this.resolveMatches(
      channel.guild,
      response.matches
    );
    const existedTimeout = this.logTimeoutCache.get(channel.id);
    const existedEmbeds = this.logEmbedsCache.get(channel.id) ?? [];
    this.logEmbedsCache.set(
      channel.id,
      [...existedEmbeds, ...resolvedMatches.map((em) => em.toJSON())],
      Infinity
    );
    if (existedTimeout) {
      return;
    }
    this.logTimeoutCache.set(channel.id, {
      callback: async () => this.sendScheduledLogs(channel),
      delay: BATCHED_LOG_DELAY,
    });
  }

  private async sendScheduledLogs(channel: GuildChannel) {
    const logChannel = await this.fetchLogChannel(channel.guild);
    if (!logChannel) {
      console.log("no log channel");
      return;
    }

    const rawEmbeds = this.logEmbedsCache.get(channel.id);
    this.logEmbedsCache.delete(channel.id);

    if (rawEmbeds.length === 0) {
      console.log("empty raw");
      return;
    }

    for (let i = 0; i < rawEmbeds.length; i += EMBEDS_LIMIT) {
      const batch = rawEmbeds.slice(i, i + EMBEDS_LIMIT);
      try {
        await new Promise((resolve) => setTimeout(resolve, SINGLE_LOG_DELAY));
        await logChannel.send({ embeds: batch });
      } catch (error) {
        console.error("Failed to send log batch:", error);
      }
    }
  }

  public async sendDmLog(response: AutomodResponse, guild: Guild, user: User) {
    const resolvedMatches = this.resolveMatches(guild, response.matches);
    resolvedMatches.forEach((resolved, idx) => {
      setTimeout(() => {
        try {
          // TODO: разделить отчёты
          user.send({ embeds: [resolved] });
        } catch {
          return;
        }
      }, 1_000 * idx);
    });
  }

  private resolveMatches(guild: Guild, matches: AutomodMatch[]) {
    const embeds = matches.map((match) => {
      return match.rules.map((rule: AutomodRule) => {
        // @ts-expect-error temporary it needed
        const messages = this.getLogMessagesByType(rule);
        const user = guild.members.cache.get(match.user_id);
        const avatar = user?.displayAvatarURL() ?? user?.avatarURL() ?? null;
        return new EmbedBuilder()
          .setTitle(messages.title)
          .setDescription(messages.description(match))
          .setFields(messages.fields(match))
          .setThumbnail(avatar)
          .setTimestamp(Date.now())
          .setFooter({
            text:
              user?.displayName ??
              user?.user.globalName ??
              user?.user.username ??
              "Неизвестный пользователь",
            iconURL: avatar ?? undefined,
          });
      });
    });
    return embeds.flatMap((em) => em);
  }

  private async fetchLogChannel(guild: Guild) {
    // TODO: normal implementation of settings
    const channel = await guild.channels
      .fetch(TempConfig.logging, {
        cache: true,
      })
      .catch(console.error);
    if (!channel) {
      console.error("Log channel does not exists");
    }
    return channel as SendableChannels;
  }

  private getLogMessagesByType(
    type: ObjectKeys<(typeof AutomodLogMessages)["logging"]>
  ) {
    return AutomodLogMessages.logging?.[type];
  }
}
