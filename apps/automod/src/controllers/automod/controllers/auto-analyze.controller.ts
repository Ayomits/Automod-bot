import { Events } from "discord.js";
import { type ArgsOf, Discord, On } from "discordx";
import { inject, singleton } from "tsyringe";

import { AutoAnalyzeAutomodService } from "../services/auto-analyze.service.js";

@Discord()
@singleton()
export class AutoAnalyzeController {
  constructor(
    @inject(AutoAnalyzeAutomodService)
    private autoAnalyzeService: AutoAnalyzeAutomodService,
  ) {}

  @On({ event: "messageCreate" })
  async onMessageCreate([msg]: ArgsOf<"messageCreate">) {
    return this.autoAnalyzeService.handleMessage(msg, Events.MessageCreate);
  }

  @On({ event: "messageUpdate" })
  async onMessageUpdate([, newMsg]: ArgsOf<"messageUpdate">) {
    return this.autoAnalyzeService.handleMessage(newMsg, Events.MessageUpdate);
  }

  @On({ event: "messageDelete" })
  async onMessageDelete([msg]: ArgsOf<"messageDelete">) {
    return this.autoAnalyzeService.handleMessage(msg, Events.MessageDelete);
  }
}
