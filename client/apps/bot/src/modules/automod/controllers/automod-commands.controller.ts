import type {
  CommandInteraction,
  MessageContextMenuCommandInteraction,
  TextChannel,
  User,
} from "discord.js";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChannelType,
} from "discord.js";
import { ContextMenu, Discord, Guard, Slash, SlashOption } from "discordx";
import { inject, singleton } from "tsyringe";
import { ContextCommandAnalyzeMessage } from "../automod.messages.js";
import { RateLimit, TIME_UNIT } from "@discordx/utilities";
import { AutomodAnalyzeService } from "../services/analyze.service.js";

@Discord()
@singleton()
export class AutomodContextAnalyzeController {
  constructor(
    @inject(AutomodAnalyzeService)
    private automodAnalyzer: AutomodAnalyzeService,
  ) {}

  @ContextMenu({
    name: "Analyze message",
    type: ApplicationCommandType.Message,
  })
  @Guard(
    RateLimit(TIME_UNIT.seconds, 5, {
      ephemeral: true,
      rateValue: 1,
      message(_, timeLeft) {
        return ContextCommandAnalyzeMessage.validation.rate(
          (timeLeft / 1000).toFixed(1),
        );
      },
    }),
  )
  analyzeOneMessage(interaction: MessageContextMenuCommandInteraction) {
    return this.automodAnalyzer.analyzeOneMessage(interaction);
  }
}

@Discord()
@singleton()
export class AutomodCommandAnalyzeController {
  constructor(
    @inject(AutomodAnalyzeService)
    private automodAnalyzer: AutomodAnalyzeService,
  ) {}

  @Slash({
    name: "analyze-messages",
    description: "Automod analyze user messages",
  })
  @Guard(
    RateLimit(TIME_UNIT.seconds, 30, {
      rateValue: 1,
      message(_, timeLeft) {
        return ContextCommandAnalyzeMessage.validation.rate(
          (timeLeft / 1000).toFixed(1),
        );
      },
    }),
  )
  message(
    @SlashOption({
      description: "Limit of messages",
      name: "limit",
      required: true,
      type: ApplicationCommandOptionType.Number,
      maxValue: 50,
      minValue: 1,
    })
    limit: number,
    @SlashOption({
      description: "Whose messages needs to automod",
      name: "user",
      required: true,
      type: ApplicationCommandOptionType.User,
    })
    user: User,
    @SlashOption({
      description: "Whose messages needs to automod",
      name: "channel",
      required: false,
      type: ApplicationCommandOptionType.Channel,
      channelTypes: [ChannelType.GuildText],
    })
    channel: TextChannel,
    interaction: CommandInteraction,
  ) {
    return this.automodAnalyzer.analyzeUserMessages(
      interaction,
      limit,
      user,
      channel,
    );
  }
}
