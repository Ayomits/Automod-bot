import {
  ApplicationCommandOptionType,
  type CommandInteraction,
} from "discord.js";
import { Discord, Guard, Slash, SlashChoice, SlashOption } from "discordx";
import { inject, singleton } from "tsyringe";

import { DevOnly } from "#guards/dev-only.guard.js";

import { PingService, PingType } from "./ping.service.js";

@Discord()
@singleton()
export class PingController {
  constructor(@inject(PingService) private pingService: PingService) {}

  @Slash({
    name: "ping",
    nameLocalizations: {
      ru: "пинг",
    },
    description: "Check websocket and message latency",
    descriptionLocalizations: {
      ru: "Проверка задержки вебсокета и сообщений",
    },
  })
  @Guard(DevOnly)
  async ping(
    @SlashChoice(...Object.values(PingType))
    @SlashOption({
      name: "type",
      nameLocalizations: {
        ru: "тип",
      },
      description: "Тип задержки",
      descriptionLocalizations: {
        ru: "Тип задержки",
      },
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    type: PingType = PingType.All,
    interaction: CommandInteraction,
  ) {
    return this.pingService.execute(interaction, type);
  }
}
