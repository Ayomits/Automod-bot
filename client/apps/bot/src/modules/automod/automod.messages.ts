import {
  AutomodRule,
  type AutomodMatch,
} from "@/shared/api/automod/automod.types.js";
import { userMention, codeBlock } from "discord.js";

export const AutomodWarningMessageExplanaition = {
  Caps: "В вашем сообщении слишком много букв в верхнем регистре",
  CapsMixed: "В вашем сообщении слишком мНоГо сЛоВ подобного регистра",
  MaxMessageLength: "Ваше сообщение слишком длинное",
} as const;

export const AutomodLogMessages = {
  [AutomodRule.Caps]: {
    title: "Превышение лимит верхнего регистра в тексте",
    description: (match: AutomodMatch) =>
      `${userMention(match.user_id)} превысил лимит верхнего регистра в сообщении`,
    fields: (match: AutomodMatch) => [
      {
        name: "Контент",
        value: codeBlock(match.content),
      },
    ],
  },
  [AutomodRule.CapsMixed]: {
    title: "Превышение лимит комбинированного верхнего регистра в тексте",
    description: (match: AutomodMatch) =>
      `${userMention(match.user_id)} превысил лимит комбинированного верхнего регистра в сообщении`,
    fields: (match: AutomodMatch) => [
      {
        name: "Контент",
        value: codeBlock(match.content),
      },
    ],
  },
  [AutomodRule.Toxicity]: {
    title: "Токсичность (нейросетевой анализ)",
    description: (match: AutomodMatch) =>
      `${userMention(match.user_id)} проявил токсичность в своём сообщении`,
    fields: (match: AutomodMatch) => [
      {
        name: "Контент",
        value: codeBlock(match.content),
      },
    ],
  },
  [AutomodRule.MessageMaxLength]: {
    title: "Превышение лимит символов в тексте",
    description: (match: AutomodMatch) =>
      `${userMention(match.user_id)} превысил лимит символов в сообщении`,
    fields: (match: AutomodMatch) => [
      {
        name: "Контент",
        value: codeBlock(match.content),
      },
    ],
  },
} as const;

export const AutomodAnalyzeMessages = {
  rules: {
    title: "Выбор правил",
    description: [
      "Выберите нужные правила с использованием селект меню ниже",
      "Чем больше правил вы выберите, тем дольше будет анализ",
    ].join("\n"),
  },
  users: {
    title: "Выбор пользователей",
    text: [
      "Выбор пользователей может быть полезен при выяснении наличия конфликта",
    ],
  },
} as const;
