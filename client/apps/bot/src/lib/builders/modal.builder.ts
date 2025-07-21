import { ModalBuilder as DjsModalBuilder } from "discord.js";

export class InlineModalBuilder extends DjsModalBuilder {
  override setCustomId(customId: string): this {
    super.setCustomId(`${customId}:${Math.random().toFixed(10)}`);
    return this;
  }
}
