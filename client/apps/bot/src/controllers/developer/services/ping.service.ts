import { EmbedBuilder } from "@/lib/embed/embed.builder.js";
import { UsersUtility } from "@/lib/embed/users.utility.js";
import type { APIEmbedField, CommandInteraction } from "discord.js";
import { injectable } from "tsyringe";
import { PingMessages } from "../developer.messages.js";
import type { LiteralEnum } from "@ts-fetcher/types";

export const PingType = {
  Ws: "ws",
  Message: "message",
  All: "all",
} as const;

export type PingType = LiteralEnum<typeof PingType>;

@injectable()
export class PingService {
  async execute(interaction: CommandInteraction, type: PingType = "all") {
    await interaction.deferReply({ ephemeral: true });

    const embed = new EmbedBuilder()
      .setTitle("Проверка задержки")
      .setThumbnail(UsersUtility.getAvatar(interaction.user))
      .setTimestamp(Date.now())
      .setFooter({
        text: UsersUtility.getUsername(interaction.user),
        iconURL: UsersUtility.getAvatar(interaction.user),
      });
    const fields: APIEmbedField[] = [];

    if (type == "ws" || type === "all") {
      fields.push({
        name: PingMessages.ws.name,
        value: PingMessages.ws.value(interaction.client.ws.ping),
        inline: true,
      });
    }

    if (type === "message" || type == "all") {
      fields.push({
        name: PingMessages.message.name,
        value: PingMessages.message.value(
          Date.now() - interaction.createdTimestamp
        ),
        inline: true,
      });
    }

    return interaction.editReply({
      embeds: [embed.setFields(fields)],
    });
  }
}
