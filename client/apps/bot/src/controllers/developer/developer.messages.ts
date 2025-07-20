import { codeBlock, quote } from "discord.js";

export const PingMessages = {
  ws: {
    name: quote("Задержка вебсокета"),
    value: (latency: number) => `${codeBlock(`${Math.max(latency, 0)} ms`)}`,
  },
  message: {
    name: quote("Задержка сообщений"),
    value: (latency: number) => `${codeBlock(`${Math.max(latency, 0)} ms`)}`,
  },
} as const;
