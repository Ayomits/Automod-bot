import { DevOnly } from "@/guards/dev-only.guard.js";
import {
  ApplicationCommandOptionType,
  type CommandInteraction,
} from "discord.js";
import { Discord, Guard, Slash, SlashChoice, SlashOption } from "discordx";
import { inject, singleton } from "tsyringe";
import { PingService, PingType } from "./services/ping.service.js";

@Discord()
@singleton()
export class DeveloperController {
  constructor(@inject(PingService) private pingService: PingService) {}

  @Slash({
    name: "ping",
    description: "Проверка задержки вебсокета и сообщений",
  })
  @Guard(DevOnly)
  async ping(
    @SlashChoice(...Object.values(PingType))
    @SlashOption({
      name: "type",
      description: "Тип задержки",
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    type: PingType = PingType.All,
    interaction: CommandInteraction,
  ) {
    return this.pingService.execute(interaction, type);
  }
}
