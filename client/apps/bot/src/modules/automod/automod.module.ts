import { AutomodApi } from "@/shared/api/automod/automod.api.js";
import { type ArgsOf, Discord, On } from "discordx";

@Discord()
export class AutomodModule {
  private automodApi = new AutomodApi();

  @On({ event: "messageCreate" })
  async onMessage([msg]: ArgsOf<"messageCreate">) {
    if (msg.author.bot) {
      return;
    }
    const content = msg.content;

    const automodChecks = await this.automodApi.automod({
      messages: [
        {
          content: content,
          user_id: msg.author.id,
          createdAt: msg.createdAt,
        },
      ],
    });
    if (automodChecks.success && automodChecks.data.matches.length) {
      return await msg.reply(JSON.stringify(automodChecks.data.matches));
    }
    return;
  }
}
