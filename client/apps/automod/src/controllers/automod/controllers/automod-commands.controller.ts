import { RateLimit, TIME_UNIT } from "@discordx/utilities";
import type {
  CommandInteraction,
  GuildMember,
  MessageContextMenuCommandInteraction,
  ModalSubmitInteraction,
  TextChannel,
  User,
  UserContextMenuCommandInteraction,
} from "discord.js";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChannelType,
} from "discord.js";
import {
  ContextMenu,
  Discord,
  Guard,
  ModalComponent,
  Slash,
  SlashOption,
} from "discordx";
import { inject, singleton } from "tsyringe";

import { ContextCommandAnalyzeMessage } from "../../../messages/automod.messages.js";
import { AutomodAnalyzeService } from "../services/analyze.service.js";

@Discord()
@singleton()
export class AutomodContextAnalyzeController {
  constructor(
    @inject(AutomodAnalyzeService)
    private automodAnalyzer: AutomodAnalyzeService
  ) {}

  @ContextMenu({
    name: "Analyze message",
    nameLocalizations: {
      ru: "Анализ сообщения",
    },
    type: ApplicationCommandType.Message,
    defaultMemberPermissions: ["ModerateMembers"],
  })
  @Guard(
    RateLimit(TIME_UNIT.seconds, 5, {
      ephemeral: true,
      rateValue: 1,
      message(_, timeLeft) {
        return ContextCommandAnalyzeMessage.validation.rate(
          (timeLeft / 1000).toFixed(1)
        );
      },
    })
  )
  analyzeLastUserMessage(interaction: MessageContextMenuCommandInteraction) {
    return this.automodAnalyzer.analyzeLastUserMessageContext(interaction);
  }

  @ContextMenu({
    name: "Analyze last messages",
    nameLocalizations: {
      ru: "Анализ последних сообщений",
    },
    type: ApplicationCommandType.User,
    defaultMemberPermissions: ["ModerateMembers"],
  })
  @Guard(
    RateLimit(TIME_UNIT.seconds, 5, {
      ephemeral: true,
      rateValue: 1,
      message(_, timeLeft) {
        return ContextCommandAnalyzeMessage.validation.rate(
          (timeLeft / 1000).toFixed(1)
        );
      },
    })
  )
  analyzeLastUserMessages(interaction: UserContextMenuCommandInteraction) {
    return this.automodAnalyzer.analyzeLastUserMessagesContext(interaction);
  }

  @ModalComponent({ id: "analyze-last-usr-messages" })
  analyzeLastUserMessagesModal(interaction: ModalSubmitInteraction) {
    return this.automodAnalyzer.analyzeLastUserMessagesModal(interaction);
  }

  @Slash({
    name: "analyze-messages",
    nameLocalizations: {
      ru: "анализ-сообщений",
    },
    descriptionLocalizations: {
      ru: "Проверять последние сообщения пользователя автомодом",
    },
    description: "Automod analyze user messages",
    defaultMemberPermissions: ["ModerateMembers"],
  })
  @Guard(
    RateLimit(TIME_UNIT.seconds, 30, {
      rateValue: 1,
      message(_, timeLeft) {
        return ContextCommandAnalyzeMessage.validation.rate(
          (timeLeft / 1000).toFixed(1)
        );
      },
    })
  )
  analyzeLastUserMessagesSlash(
    @SlashOption({
      description: "Limit of messages",
      name: "limit",
      required: true,
      nameLocalizations: {
        ru: "лимит",
      },
      descriptionLocalizations: {
        ru: "Лимит сообщений",
      },
      type: ApplicationCommandOptionType.Number,
      maxValue: 50,
      minValue: 1,
    })
    limit: number,
    @SlashOption({
      description: "Whose messages needs to analyz",
      name: "user",
      nameLocalizations: {
        ru: "пользователь",
      },
      descriptionLocalizations: {
        ru: "Чьи сообщения нужно проанализировать",
      },
      required: true,
      type: ApplicationCommandOptionType.User,
    })
    user: User,
    @SlashOption({
      description: "Where messages needs to analyze",
      name: "channel",
      nameLocalizations: {
        ru: "канал",
      },
      descriptionLocalizations: {
        ru: "Где нужен анализ сообщений",
      },
      required: false,
      type: ApplicationCommandOptionType.Channel,
      channelTypes: [ChannelType.GuildText],
    })
    channel: TextChannel,
    interaction: CommandInteraction
  ) {
    return this.automodAnalyzer.analyzeLastUserMessagesSlash(
      interaction,
      limit,
      user,
      channel
    );
  }

  @Slash({
    name: "analyze-nickname",
    nameLocalizations: {
      ru: "анализ-никнейма",
    },
    descriptionLocalizations: {
      ru: "Проанализировать никнейм",
    },
    description: "Analyze user nickname",
    defaultMemberPermissions: ["ModerateMembers"],
  })
  @Guard(
    RateLimit(TIME_UNIT.seconds, 30, {
      rateValue: 1,
      message(_, timeLeft) {
        return ContextCommandAnalyzeMessage.validation.rate(
          (timeLeft / 1000).toFixed(1)
        );
      },
    })
  )
  analyzeUserNicknameSlash(
    @SlashOption({
      description: "Whose nickname needs to analyze",
      name: "user",
      nameLocalizations: {
        ru: "пользователь",
      },
      descriptionLocalizations: {
        ru: "Чей ник нужно проанализировать",
      },
      required: true,
      type: ApplicationCommandOptionType.User,
    })
    user: GuildMember,
    interaction: CommandInteraction
  ) {
    return this.automodAnalyzer.analyzeUserUsernameSlash(interaction, user);
  }
}
