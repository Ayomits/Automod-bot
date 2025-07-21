import { StringSelectMenuBuilder as DjsStringSelectMenuBuilder } from "discord.js";

export class InlineStringSelectMenuBuilder extends DjsStringSelectMenuBuilder {
  override setCustomId(customId: string): this {
    super.setCustomId(`${customId}:${Math.random().toFixed(10)}`);
    return this;
  }
}
