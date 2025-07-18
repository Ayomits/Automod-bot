import { type ArgsOf, Discord, On } from "discordx";
import { inject, singleton } from "tsyringe";
import { AutomodService } from "./automod.service.js";

@Discord()
@singleton()
export class AutomodController {
  constructor(@inject(AutomodService) private automodService: AutomodService) {}

  @On({ event: "messageCreate" })
  async onMessage([msg]: ArgsOf<"messageCreate">) {
    return this.automodService.execute(msg);
  }
}
