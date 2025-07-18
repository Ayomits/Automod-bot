import { AutomodApi } from "@/shared/api/automod/automod.api.js";
import type { Guild } from "discord.js";
import { EmbedBuilder, type Message, type SendableChannels } from "discord.js";
import { inject, injectable } from "tsyringe";
import { AutomodLogMessages } from "./automod.messages.js";
import type {
  AutomodRule,
  AutomodMatch,
} from "@/shared/api/automod/automod.types.js";

@injectable()
export class AutomodService {
  constructor(@inject(AutomodApi) private automodApi: AutomodApi) {}

  async execute(msg: Message) {
    if (msg.author.bot) {
      return;
    }
    if (!msg.guild) {
      return;
    }
    const content = msg.content;

    const automodChecks = await this.automodApi.automod({
      messages: [
        {
          content: content,
          user_id: msg.author.id,
          createdAt: msg.createdAt,
        },
      ],
    });
    if (automodChecks?.success && automodChecks?.data?.matches.length) {
      const logChannel = await msg.guild?.channels.fetch(
        "1392969577868296384",
        {
          cache: true,
        }
      );
      const resolvedMatches = this.resolveMatches(
        msg.guild!,
        automodChecks?.data?.matches
      );
      resolvedMatches.forEach((resolved, idx) => {
        setTimeout(() => {
          this.sendLogs(logChannel as SendableChannels, resolved);
        }, 1_000 * idx);
      });
    }
    return;
  }

  private sendLogs(channel: SendableChannels, embeds: EmbedBuilder[]) {
    try {
      channel.send({ embeds });
    } catch (err) {
      console.error(err);
    }
  }

  private resolveMatches(guild: Guild, matches: AutomodMatch[]) {
    const embeds = matches.map((match) => {
      return match.rules.map((rule: AutomodRule) => {
        // @ts-expect-error idk
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

  private getLogMessagesByType(type: keyof typeof AutomodLogMessages) {
    return AutomodLogMessages[type];
  }
}
