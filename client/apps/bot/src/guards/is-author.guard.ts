import type { ArgsOf,GuardFunction } from "discordx";

export const ComponentAuthorOnly: GuardFunction<
  ArgsOf<"interactionCreate">
> = async ([interaction], _client, next) => {
  const message = "message" in interaction ? interaction.message : null;
  if (!message) {
    return;
  }

  if (message.author.id === interaction.user.id) {
    return next();
  }
  return false;
};
