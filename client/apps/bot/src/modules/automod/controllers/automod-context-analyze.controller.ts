import { AutomodAnalyzeExplanaition } from "@/shared/api/automod/automod-analyze.js";
import { AutomodApi } from "@/shared/api/automod/automod.api.js";
import type { MessageContextMenuCommandInteraction } from "discord.js";
import { ApplicationCommandType } from "discord.js";
import { ContextMenu, Discord } from "discordx";
import { inject, singleton } from "tsyringe";

@Discord()
@singleton()
export class AutomodContextAnalyze {
  constructor(@inject(AutomodApi) private automodApi: AutomodApi) {}

  @ContextMenu({
    name: "Analyze message",
    type: ApplicationCommandType.Message,
  })
  async analyze(interaction: MessageContextMenuCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
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
        content: "Произошла внутренняя ошибка",
      });
    }
    if (!analytics.success) {
      return interaction.editReply({
        content: "Произошла ошибка во время запроса к боту...",
      });
    }
    const analyzeExplainer = new AutomodAnalyzeExplanaition();
    const text = analyzeExplainer.explain(analytics.data).toText();
    return interaction.editReply({
      content: text,
    });
  }
}
