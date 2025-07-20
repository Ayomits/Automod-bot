import { codeBlock } from "discord.js";

export const PingMessages = {
  ws: {
    name: "Задержка вебсокета",
    value: (latency: number) => `${codeBlock(`${Math.max(latency, 0)}ms`)}`,
  },
  message: {
    name: "Задержка сообщений",
    value: (latency: number) => `${codeBlock(`${Math.max(latency, 0)}ms`)}`,
  },
} as const;
