import { AutomodApi } from "@/api/automod/automod.api.js";
import type { Message } from "discord.js";
import { inject, injectable } from "tsyringe";
import { AutomodLogService } from "./automod-logs.service.js";

@injectable()
export class AlgsAutomodService {
  constructor(
    @inject(AutomodApi) private automodApi: AutomodApi,
    @inject(AutomodLogService) private automodLogService: AutomodLogService
  ) {}

  async execute(msg: Message) {
    const content = msg.content;
    if (msg.author.bot || !msg.guild || !content) {
      return;
    }

    const automodChecks = await this.automodApi.automodAlghorthimicRules({
      messages: [
        {
          content: content,
          user_id: msg.author.id,
          createdAt: msg.createdAt,
        },
      ],
    });

    if (automodChecks?.success && automodChecks?.data?.matches.length) {
      this.automodLogService.execute(automodChecks.data, msg.guild);
    }
    return;
  }
}
