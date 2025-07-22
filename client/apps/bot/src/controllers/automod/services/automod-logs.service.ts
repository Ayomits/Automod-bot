import type {
  AutomodMatch,
  AutomodResponse,
  AutomodRule,
  ObjectKeys,
} from "@automod/types";
import type {
  Guild,
  MessageCreateOptions,
  MessagePayload,
  SendableChannels,
} from "discord.js";
import { EmbedBuilder } from "discord.js";
import { injectable } from "tsyringe";

import { AutomodLogMessages } from "../../../messages/automod.messages.js";

@injectable()
export class AutomodLogService {
  public async execute(response: AutomodResponse, guild: Guild) {
    const resolvedMatches = this.resolveMatches(guild, response.matches);
    const channel = await this.getLogChannel(guild);
    resolvedMatches.forEach((resolved, idx) => {
      setTimeout(() => {
        this.sendLogs(channel, {
          embeds: resolved,
        });
      }, 1_000 * idx);
    });
  }

  private sendLogs(
    channel: SendableChannels,
    options: MessagePayload | MessageCreateOptions,
  ) {
    try {
      channel.send(options);
    } catch (err) {
      console.error(err);
    }
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
    return embeds;
  }

  private async getLogChannel(guild: Guild) {
    const channel = await guild.channels.fetch("1396851019719376916", {
      cache: true,
    });
    if (!channel) {
      throw new Error("Log channel does not exists");
    }
    return channel as SendableChannels;
  }

  private getLogMessagesByType(type: ObjectKeys<typeof AutomodLogMessages>) {
    return AutomodLogMessages[type];
  }
}
