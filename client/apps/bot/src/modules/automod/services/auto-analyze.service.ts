import { AutomodApi } from "@/shared/api/automod/automod.api.js";
import type { SendableChannels, Message } from "discord.js";
import { inject, injectable } from "tsyringe";
import { AutomodLogService } from "./automod-logs.service.js";

@injectable()
export class AutomodService {
  constructor(
    @inject(AutomodApi) private automodApi: AutomodApi,
    @inject(AutomodLogService) private automodLogService: AutomodLogService
  ) {}

  async execute(msg: Message) {
    if (msg.author.bot || !msg.guild) {
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
      if (!logChannel) {
        throw new Error("Log channel does not exists");
      }
      this.automodLogService.execute(
        automodChecks.data,
        logChannel as SendableChannels,
        msg.guild
      );
    }
    return;
  }
}
