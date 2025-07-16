import { Client, GatewayIntentBits } from "discord.js";
import { configService } from "./shared/config/config";

async function bootstrap() {
  const client = new Client({
    intents: [
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
    ],
  });

  client.login(configService.get("DISCORD_TOKEN"));
}

bootstrap();
