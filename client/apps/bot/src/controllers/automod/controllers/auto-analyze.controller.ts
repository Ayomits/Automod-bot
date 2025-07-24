import { type ArgsOf, Discord, On } from "discordx";
import { inject, singleton } from "tsyringe";

import { AIAutoAnalyzeService } from "../services/ai-auto-analyze.service.js";
import { AlgsAutomodService } from "../services/algs-auto-analyze.service.js";

@Discord()
@singleton()
export class AutoAnalyzeController {
  constructor(
    @inject(AIAutoAnalyzeService)
    private aiAutomodService: AIAutoAnalyzeService,
    @inject(AlgsAutomodService) private algsAutomodService: AlgsAutomodService
  ) {}

  @On({ event: "messageCreate" })
  async onMessageCreate([msg]: ArgsOf<"messageCreate">) {
    await Promise.all([
      this.aiAutomodService.execute(msg),
      this.algsAutomodService.execute(msg),
    ]);
  }

  @On({ event: "messageUpdate" })
  async onMessageUpdate([, newMsg]: ArgsOf<"messageUpdate">) {
    await Promise.all([
      this.aiAutomodService.execute(newMsg),
      this.algsAutomodService.execute(newMsg),
    ]);
  }
}
