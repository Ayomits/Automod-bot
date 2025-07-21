import { ChannelSelectMenuBuilder as DjsChannelSelectMenuBuilder } from "discord.js";

export class InlineChannelSelectMenuBuilder extends DjsChannelSelectMenuBuilder {
  override setCustomId(customId: string): this {
    super.setCustomId(`${customId}:${Math.random().toFixed(10)}`);
    return this;
  }
}
