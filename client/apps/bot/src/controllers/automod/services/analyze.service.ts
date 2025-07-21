import { AutomodAnalyzeExplanaition } from "@/api/automod/automod-analyze.js";
import type {
  CommandInteraction,
  Snowflake,
  User,
  UserContextMenuCommandInteraction,
} from "discord.js";
import { TextChannel } from "discord.js";
import { TextInputBuilder, TextInputStyle } from "discord.js";
import {
  ActionRowBuilder,
  type MessageContextMenuCommandInteraction,
} from "discord.js";
import { inject, injectable } from "tsyringe";
import {
  ContextCommandAnalyzeLastUserMessages,
  ContextCommandAnalyzeMessage,
} from "../automod.messages.js";
import { AutomodApi } from "@/api/automod/automod.api.js";
import type { AutomodMessage } from "@/api/automod/automod.types.js";
import { ApiError } from "@/errors/api.error.js";
import { EmbedBuilder } from "@/lib/embed/embed.builder.js";
import { UsersUtility } from "@/lib/embed/users.utility.js";
import { InlineModalBuilder } from "@/lib/builders/modal.builder.js";
import { InlineHanderService } from "@/lib/handling/inline.handerl.js";

@injectable()
export class AutomodAnalyzeService {
  constructor(
    @inject(AutomodApi) private automodApi: AutomodApi,
    @inject(InlineHanderService)
    private inlineHandlerService: InlineHanderService
  ) {}

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

  async analyzeUserMessagesContext(
    interaction: UserContextMenuCommandInteraction
  ) {
    const modalCustomId = `analyze-last-usr-messages`;
    const modal = new InlineModalBuilder()
      .setTitle("Анализ последних сообщений")
      .setCustomId(modalCustomId);
    const limit = new ActionRowBuilder<TextInputBuilder>().addComponents(
      new TextInputBuilder()
        .setCustomId("limit")
        .setLabel("Количество сообщений")
        .setPlaceholder("Натуральное число до 50")
        .setStyle(TextInputStyle.Short)
        .setValue("10")
    );

    modal.addComponents(limit);

    const targetUsername = UsersUtility.getUsername(interaction.targetUser);
    const targetAvatar = UsersUtility.getAvatar(interaction.targetUser);

    interaction.showModal(modal);

    this.inlineHandlerService
      .initialize(interaction.client)
      .registerModalHandler(modal.toJSON().custom_id, async (inter) => {
        await inter.deferReply({ ephemeral: true });
        let limit = Number(inter.fields.getTextInputValue("limit"));
        let warnMessage = null;

        if (Number.isNaN(limit)) {
          limit = 1;
          warnMessage = ContextCommandAnalyzeLastUserMessages.validation.NaN;
        }

        if (limit <= 0) {
          warnMessage = ContextCommandAnalyzeLastUserMessages.validation.Min;
        }

        if (limit > 50) {
          limit = 50;
          warnMessage = ContextCommandAnalyzeLastUserMessages.validation.Max;
        }

        const baseEmbed = new EmbedBuilder()
          .setThumbnail(targetAvatar)
          .setFooter({
            iconURL: targetAvatar,
            text: targetUsername,
          });

        if (!(inter.channel instanceof TextChannel)) {
          return inter.followUp({
            embeds: [
              baseEmbed
                .setTitle(
                  ContextCommandAnalyzeLastUserMessages.validation.title
                )
                .setDescription(
                  ContextCommandAnalyzeLastUserMessages.validation.ChannelType
                ),
            ],
          });
        }

        inter.followUp({
          embeds: [
            baseEmbed
              .setTitle(
                ContextCommandAnalyzeLastUserMessages.awaiting.title(
                  targetUsername
                )
              )
              .setDescription(
                ContextCommandAnalyzeLastUserMessages.awaiting.description(
                  warnMessage
                )
              ),
          ],
        });

        try {
          const explaination = await this.analyzeLastUserMessages(
            inter.channel,
            interaction.targetUser.id,
            limit
          );
          return inter.editReply({
            embeds: [
              baseEmbed
                .setTitle(ContextCommandAnalyzeLastUserMessages.success.title)
                .setDescription(
                  ContextCommandAnalyzeLastUserMessages.success.description(
                    explaination
                  )
                ),
            ],
          });
        } catch {
          return inter.editReply({
            embeds: [
              baseEmbed
                .setTitle(ContextCommandAnalyzeLastUserMessages.failure.title)
                .setDescription(
                  ContextCommandAnalyzeLastUserMessages.failure.description
                ),
            ],
          });
        }
      });
  }

  async analyzeUserMessagesSlash(
    interaction: CommandInteraction,
    limit: number,
    user: User,
    channel: TextChannel
  ) {
    channel =
      typeof channel !== "undefined"
        ? channel
        : (interaction.channel as TextChannel);
    await interaction.deferReply({ ephemeral: true });

    const explaination = await this.analyzeLastUserMessages(
      channel,
      user.id,
      limit
    );

    await interaction.editReply({
      content: explaination,
    });
  }

  private async analyzeLastUserMessages(
    channel: TextChannel,
    userId: Snowflake,
    limit: number
  ) {
    const apiMessages = await this.collectMessagesToAnalyze(
      channel,
      userId,
      limit
    );

    const explaination = new AutomodAnalyzeExplanaition();
    return explaination.explain(apiMessages).toText();
  }

  private async collectMessagesToAnalyze(
    channel: TextChannel,
    userId: Snowflake,
    limit: number
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
