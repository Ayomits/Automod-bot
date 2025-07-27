import type {
  CommandInteraction,
  InteractionEditReplyOptions,
  InteractionReplyOptions,
} from "discord.js";
import type { GuardFunction } from "discordx";

import { DEVELOPERS } from "#const/developers.js";
import { EmbedBuilder } from "#lib/embed/embed.builder.js";
import { UsersUtility } from "#lib/embed/users.utility.js";

export const DevOnly: GuardFunction<CommandInteraction> = async (
  interaction,
  _client,
  next,
) => {
  function reply(options: InteractionReplyOptions) {
    if (interaction.replied) {
      return interaction.followUp(options);
    }
    if (interaction.deferred) {
      return interaction.editReply(options as InteractionEditReplyOptions);
    }
    return interaction.reply({ ...options, ephemeral: true });
  }

  if (!DEVELOPERS.includes(interaction.user?.id)) {
    return reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Вы не являетесь разработчиком")
          .setDescription("К сожалению, вы не можете выполнить эту команду")
          .setThumbnail(UsersUtility.getAvatar(interaction.user))
          .setTimestamp(Date.now())
          .setFooter({
            text: UsersUtility.getUsername(interaction.user),
            iconURL: UsersUtility.getAvatar(interaction.user),
          }),
      ],
    });
  }
  return await next();
};
