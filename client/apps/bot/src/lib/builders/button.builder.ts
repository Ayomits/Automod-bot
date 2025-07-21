import { ButtonBuilder as DjsButtonBuilder } from "discord.js";

export class InlineButtonBuilder extends DjsButtonBuilder {
  override setCustomId(customId: string): this {
    super.setCustomId(`${customId}:${Math.random().toFixed(10)}`);
    return this;
  }
}
