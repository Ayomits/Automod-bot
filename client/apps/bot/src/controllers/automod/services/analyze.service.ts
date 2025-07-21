import { AutomodAnalyzeExplanaition } from "@/api/automod/automod-analyze.js";
import type {
  CommandInteraction,
  ModalSubmitInteraction,
  Snowflake,
  User,
  UserContextMenuCommandInteraction,
} from "discord.js";
import { TextChannel } from "discord.js";
import { TextInputBuilder, TextInputStyle } from "discord.js";
import {
  ActionRowBuilder,
  ModalBuilder,
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

@injectable()
export class AutomodAnalyzeService {
  constructor(@inject(AutomodApi) private automodApi: AutomodApi) {}

  async analyzeLastUserMessageContext(
    interaction: MessageContextMenuCommandInteraction,
  ) {
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

  async analyzeLastUserMessagesContext(
    interaction: UserContextMenuCommandInteraction,
  ) {
    const modal = new ModalBuilder()
      .setTitle("Анализ последних сообщений пользователя")
      .setCustomId("analyze-last-usr-messages");

    const usrId = new ActionRowBuilder<TextInputBuilder>().addComponents(
      new TextInputBuilder()
        .setCustomId("usrid")
        .setLabel("User Id")
        .setRequired(true)
        .setValue(interaction.targetUser.id)
        .setMaxLength(19)
        .setMinLength(17)
        .setStyle(TextInputStyle.Short),
    );

    const limit = new ActionRowBuilder<TextInputBuilder>().addComponents(
      new TextInputBuilder()
        .setCustomId("limit")
        .setLabel("Количество сообщений")
        .setRequired(true)
        .setValue("10")
        .setMaxLength(2)
        .setMinLength(2)
        .setStyle(TextInputStyle.Short),
    );

    modal.addComponents(usrId, limit);
    return interaction.showModal(modal);
  }

  async analyzeLastUserMessagesModal(interaction: ModalSubmitInteraction) {
    await interaction.deferReply({ ephemeral: true });
    let limit = Number(interaction.fields.getTextInputValue("limit"));
    let warnMessage: string | null = null;
    const usrId = interaction.fields.getTextInputValue("usrid");

    const usr = await interaction.guild?.members.fetch(usrId);

    const baseEmbed = new EmbedBuilder();

    if (!usr) {
      const authorUsername = UsersUtility.getUsername(interaction.user);
      const authorAvatar = UsersUtility.getAvatar(interaction.user);
      return interaction.editReply({
        embeds: [
          baseEmbed
            .setTitle(
              ContextCommandAnalyzeLastUserMessages.validation.User.title,
            )
            .setDescription(
              ContextCommandAnalyzeLastUserMessages.validation.User.description,
            )
            .setThumbnail(authorAvatar)
            .setFooter({ iconURL: authorAvatar, text: authorUsername }),
        ],
      });
    }

    const usrUsername = UsersUtility.getUsername(usr);
    const usrAvatar = UsersUtility.getAvatar(usr);

    baseEmbed
      .setThumbnail(usrAvatar)
      .setFooter({ text: usrUsername, iconURL: usrAvatar });

    if (!(interaction.channel instanceof TextChannel)) {
      return interaction.editReply({
        embeds: [
          baseEmbed
            .setTitle(ContextCommandAnalyzeLastUserMessages.validation.Title)
            .setDescription(
              ContextCommandAnalyzeLastUserMessages.validation.ChannelType,
            ),
        ],
      });
    }

    if (Number.isNaN(limit)) {
      limit = 1;
      warnMessage = ContextCommandAnalyzeLastUserMessages.validation.NaN;
    }

    if (limit <= 0) {
      limit = 1;
      warnMessage = ContextCommandAnalyzeLastUserMessages.validation.Min;
    }

    if (limit > 50) {
      limit = 50;
      warnMessage = ContextCommandAnalyzeLastUserMessages.validation.Max;
    }

    interaction.followUp({
      embeds: [
        baseEmbed
          .setTitle(
            ContextCommandAnalyzeLastUserMessages.awaiting.title(usrUsername),
          )
          .setDescription(
            ContextCommandAnalyzeLastUserMessages.awaiting.description(
              warnMessage,
            ),
          ),
      ],
    });

    try {
      const explaination = await this.analyzeLastMessagesInChannel(
        interaction.channel,
        usrId,
        limit,
      );

      return interaction.editReply({
        embeds: [
          baseEmbed
            .setTitle(ContextCommandAnalyzeLastUserMessages.success.title)
            .setDescription(
              ContextCommandAnalyzeLastUserMessages.success.description(
                explaination,
              ),
            ),
        ],
      });
    } catch (err) {
      console.log(err);
      return interaction.editReply({
        embeds: [
          baseEmbed
            .setTitle(ContextCommandAnalyzeLastUserMessages.failure.title)
            .setDescription(
              ContextCommandAnalyzeLastUserMessages.failure.description,
            ),
        ],
      });
    }
    return;
  }

  async analyzeLastUserMessagesSlash(
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

    await interaction.editReply({
      content: await this.analyzeLastMessagesInChannel(channel, user.id, limit),
    });
  }

  private async analyzeLastMessagesInChannel(
    channel: TextChannel,
    userId: Snowflake,
    limit: number,
  ) {
    const apiMessages = await this.collectMessagesToAnalyze(
      channel,
      userId,
      limit,
    );

    const explaination = new AutomodAnalyzeExplanaition();

    return explaination.explain(apiMessages).toText();
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
          before: before,
        });

        const filtred: (AutomodMessage & { id: Snowflake })[] = messages
          .filter((msg) => msg.author.id === userId && msg.content)
          .map((msg) => ({
            id: msg.id,
            content: msg.content,
            user_id: userId,
            createdAt: msg.createdAt,
          }));

        if (filtred.length === 0) {
          break;
        }

        apiMessages.push(...filtred);

        if (apiMessages.length < limit) {
          const lastMessage = filtred[filtred.length - 1];
          if (lastMessage) {
            before = lastMessage.id;
          } else {
            break;
          }
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
