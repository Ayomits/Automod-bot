import { type ArgsOf, Discord, On } from "discordx";
import { inject, singleton } from "tsyringe";
import { AlgsAutomodService } from "../services/algs-auto-analyze.service.js";

@Discord()
@singleton()
export class AlghoritmAutomodController {
  constructor(
    @inject(AlgsAutomodService) private automodService: AlgsAutomodService,
  ) {}

  @On({ event: "messageCreate" })
  onMessage([msg]: ArgsOf<"messageCreate">) {
    return this.automodService.execute(msg);
  }

  @On({ event: "messageUpdate" })
  onMessageUpdate([, newMessage]: ArgsOf<"messageUpdate">) {
    return this.automodService.execute(newMessage);
  }
}
