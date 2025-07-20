import { type ArgsOf, Discord, On } from "discordx";
import { inject, singleton } from "tsyringe";
import { AIAutoAnalyzeService } from "../services/ai-auto-analyze.service.js";

@singleton()
@Discord()
export class AIAutomodController {
  constructor(
    @inject(AIAutoAnalyzeService)
    private aiAutomodService: AIAutoAnalyzeService,
  ) {}

  @On({ event: "messageCreate" })
  onMessageCreate([msg]: ArgsOf<"messageCreate">) {
    return this.aiAutomodService.execute(msg);
  }

  @On({ event: "messageUpdate" })
  async onMessageUpdate([, newMsg]: ArgsOf<"messageUpdate">) {
    return this.aiAutomodService.execute(newMsg);
  }
}
