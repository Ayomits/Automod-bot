import type {
  MessageContextMenuCommandInteraction,
  ModalSubmitInteraction,
  UserContextMenuCommandInteraction,
} from "discord.js";
import { ApplicationCommandType } from "discord.js";
import { ContextMenu, Discord, Guard, ModalComponent } from "discordx";
import { inject, singleton } from "tsyringe";
import { ContextCommandAnalyzeMessage } from "../automod.messages.js";
import { RateLimit, TIME_UNIT } from "@discordx/utilities";
import { AutomodAnalyzeService } from "../services/analyze.service.js";

@Discord()
@singleton()
export class AutomodContextAnalyze {
  constructor(
    @inject(AutomodAnalyzeService)
    private automodAnalyzer: AutomodAnalyzeService
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
          (timeLeft / 1000).toFixed(1)
        );
      },
    })
  )
  analyzeOneMessage(interaction: MessageContextMenuCommandInteraction) {
    return this.automodAnalyzer.analyzeOneMessage(interaction);
  }

  @ContextMenu({
    name: "Analyze last user messages",
    type: ApplicationCommandType.User,
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
  analyLastUserMessages(interaction: UserContextMenuCommandInteraction) {
    return this.automodAnalyzer.analyzeUserMessages(interaction);
  }

  @ModalComponent({ id: "analyze-modal" })
  analyzeLastUserMessagesModal(interaction: ModalSubmitInteraction) {
    return this.automodAnalyzer.analyseUserMessageModal(interaction);
  }
}
