import { AutomodAnalyzeExplanaition } from "@/shared/api/automod/automod-analyze.js";
import type { ModalSubmitInteraction } from "discord.js";
import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  type MessageContextMenuCommandInteraction,
  type UserContextMenuCommandInteraction,
} from "discord.js";
import { inject, injectable } from "tsyringe";
import { ContextCommandAnalyzeMessage } from "../automod.messages.js";
import { AutomodApi } from "@/shared/api/automod/automod.api.js";
import type { UsersUtilityAccept } from "@/shared/lib/users.utility.js";
import { UsersUtility } from "@/shared/lib/users.utility.js";

@injectable()
export class AutomodAnalyzeService {
  constructor(@inject(AutomodApi) private automodApi: AutomodApi) {}

  async analyzeOneMessage(interaction: MessageContextMenuCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
    if (interaction.targetMessage.author.bot) {
      return await interaction.editReply({
        content: ContextCommandAnalyzeMessage.validation.bot,
      });
    }
    if (!interaction.targetMessage.content) {
      return await interaction.editReply({
        content: ContextCommandAnalyzeMessage.validation.empty,
      });
    }
    const analytics = await this.automodApi.automod({
      messages: [
        {
          content: interaction.targetMessage.content,
          user_id: interaction.targetMessage.author.id,
          createdAt: interaction.targetMessage.createdAt,
        },
      ],
    });
    if (!analytics) {
      return interaction.editReply({
        content: ContextCommandAnalyzeMessage.validation.internal,
      });
    }
    if (!analytics.success) {
      return interaction.editReply({
        content: ContextCommandAnalyzeMessage.validation.request,
      });
    }
    const analyzeExplainer = new AutomodAnalyzeExplanaition();
    const text = analyzeExplainer.explain(analytics.data).toText();
    return interaction.editReply({
      content: text,
    });
  }

  async analyzeUserMessages(interaction: UserContextMenuCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
    await interaction.showModal(
      this.buildModal(
        UsersUtility.getUsername(
          (interaction.targetMember ||
            interaction.targetUser) as UsersUtilityAccept,
        ),
      ),
    );
  }

  async analyseUserMessageModal(interaction: ModalSubmitInteraction) {
    await interaction.deferReply({ ephemeral: true });
    let limit = Number(interaction.fields.getTextInputValue("limit"));
    let warnMessage = null;
    if (Number.isNaN(limit)) {
      warnMessage =
        "Вы указали не число. Система возьмёт последнее сообщение пользователя в канале";
      limit = 1;
    }
    if (limit <= 0) {
      warnMessage =
        "Вы указали число меньшее или равное нулю. Система возьмёт последнее сообщение пользователя в канале";
      limit = 1;
    }
    if (limit > 50) {
      warnMessage =
        "Вы указали число свыше 50. Система возьмёт последние 50 сообщений в канале";
      limit = 50;
    }
    await interaction.editReply({
      content: [
        "Бот начинает проверку...",
        warnMessage ? warnMessage : "",
      ].join("\n"),
    });
  }

  private buildModal(username: string) {
    const limit = new ActionRowBuilder<TextInputBuilder>().addComponents(
      new TextInputBuilder()
        .setCustomId("limit")
        .setLabel("Количество последних сообщений")
        .setStyle(TextInputStyle.Short)
        .setValue("10"),
    );

    const modal = new ModalBuilder()
      .setCustomId("analyze-modal")
      .setTitle(`Анализ пользователя ${username}`)
      .addComponents(limit);

    return modal;
  }
}
