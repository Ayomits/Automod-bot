import { UserSelectMenuBuilder as DjsUserSelectMenuBuilder } from "discord.js";

export class InlineUserSelectMenuBuilder extends DjsUserSelectMenuBuilder {
  override setCustomId(customId: string): this {
    super.setCustomId(`${customId}:${Math.random().toFixed(10)}`);
    return this;
  }
}
