import { Client } from "discordx";
import { importx, dirname } from "@discordx/importer";
import { configService } from "./shared/config/config.js";
import { GatewayIntentBits, Interaction, Message } from "discord.js";

async function bootstrap() {
  const client = new Client({
    intents: [
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
    ],

    simpleCommand: {
      prefix: "!",
    },
  });

  client.once("ready", async () => {
    await client.initApplicationCommands();
  });

  client.on("interactionCreate", (interaction: Interaction) => {
    void client.executeInteraction(interaction);
  });

  client.on("messageCreate", (message: Message) => {
    void client.executeCommand(message);
  });

  await importx(`${dirname(import.meta.url)}/modules/**/*.{ts,js}`);

  await client.login(configService.get("DISCORD_TOKEN")).then(() => {
    console.log("Successfully logged in");
  });
}

bootstrap();
