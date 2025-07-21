import { RoleSelectMenuBuilder as DjsRoleSelectMenuBuilder } from "discord.js";

export class InlineRoleSelectMenuBuilder extends DjsRoleSelectMenuBuilder {
  override setCustomId(customId: string): this {
    super.setCustomId(`${customId}:${Math.random().toFixed(10)}`);
    return this;
  }
}
