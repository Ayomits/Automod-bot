import type { APIEmbed, EmbedData } from "discord.js";
import { Colors, EmbedBuilder as DjsEmbedBuild } from "discord.js";

export class EmbedBuilder extends DjsEmbedBuild {
  constructor(data?: EmbedData | APIEmbed) {
    super(data);

    super.setColor(Colors.Default);
    super.setTimestamp(Date.now());
  }
}
