import "reflect-metadata";
import { Client, DIService, tsyringeDependencyRegistryEngine } from "discordx";
import { importx, dirname } from "@discordx/importer";
import { configService } from "./shared/config/config.js";
import type { Interaction, Message } from "discord.js";
import { GatewayIntentBits } from "discord.js";
import { container } from "tsyringe";

async function bootstrap() {
  DIService.engine = tsyringeDependencyRegistryEngine.setInjector(container);
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
    silent: configService.get("APP_ENV") !== "dev",
  });

  client.once("ready", async () => {
    async function initCommands(__retries = 0) {
      if (__retries < 3) {
        try {
          await client.initApplicationCommands();
        } catch {
          await client.clearApplicationCommands();
          await initCommands(__retries + 1);
        }
      }
    }
    await initCommands();
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
