import { AutomodAnalyzeExplanaition } from "@/shared/api/automod/automod-analyze.js";
import type {
  CommandInteraction,
  Snowflake,
  TextChannel,
  User,
} from "discord.js";
import { type MessageContextMenuCommandInteraction } from "discord.js";
import { inject, injectable } from "tsyringe";
import { ContextCommandAnalyzeMessage } from "../automod.messages.js";
import { AutomodApi } from "@/shared/api/automod/automod.api.js";
import type { AutomodMessage } from "@/shared/api/automod/automod.types.js";
import { ApiError } from "@/errors/api.error.js";

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

  async analyzeUserMessages(
    interaction: CommandInteraction,
    limit: number,
    user: User,
    channel: TextChannel,
  ) {
    channel =
      typeof channel !== "undefined"
        ? channel
        : (interaction.channel as TextChannel);
    await interaction.deferReply({ ephemeral: true });

    const apiMessages = await this.collectMessagesToAnalyze(
      channel,
      user.id,
      limit,
    );

    const explaination = new AutomodAnalyzeExplanaition();

    await interaction.editReply({
      content: explaination.explain(apiMessages).toText(),
    });
  }

  private async collectMessagesToAnalyze(
    channel: TextChannel,
    userId: Snowflake,
    limit: number,
  ) {
    const apiMessages: AutomodMessage[] = [];

    let before: Snowflake | undefined = undefined;

    while (apiMessages.length < limit) {
      try {
        const messages = await channel.messages.fetch({
          limit: 100,
          before: before ?? undefined,
        });
        const filtred: (AutomodMessage & { id: Snowflake })[] = messages
          .filter((msg) => msg.author.id === userId && msg.content)
          .map((msg) => ({
            id: msg.id,
            content: msg.content,
            user_id: userId,
            createdAt: msg.createdAt,
          }));
        apiMessages.push(...filtred);
        if (apiMessages.length < limit) {
          before = filtred[filtred.length - 1]!.id;
        }
      } catch (err) {
        console.log(err);
        break;
      }
    }
    const analytics = await this.automodApi.automod({
      messages: apiMessages.slice(0, limit),
    });

    if (!analytics) {
      throw new ApiError("automod api did not respond");
    }
    return analytics.data;
  }
}
