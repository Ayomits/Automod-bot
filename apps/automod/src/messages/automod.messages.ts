import type { AutomodMatch } from "@automod/types";
import { AutomodRule } from "@automod/types";
import { bold, codeBlock, userMention } from "discord.js";

export const AutomodWarningMessageExplanaition = {
  Caps: "В вашем сообщении слишком много букв в верхнем регистре",
  CapsMixed: "В вашем сообщении слишком мНоГо сЛоВ подобного регистра",
  MaxMessageLength: "Ваше сообщение слишком длинное",
} as const;

export const AutomodLogMessages = {
  logging: {
    [AutomodRule.Caps]: {
      title: "Превышение лимит верхнего регистра в тексте",
      description: (match: AutomodMatch) =>
        `${userMention(match.user_id)} превысил лимит верхнего регистра в сообщении`,
      fields: (match: AutomodMatch) => [
        {
          name: "Контент",
          value: codeBlock(match.content),
          inline: true,
        },
        {
          name: "Санкция",
          value: codeBlock(`Нет`),
          inline: true,
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
        {
          name: "Санкция",
          value: codeBlock(`Нет`),
          inline: true,
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
        {
          name: "Санкция",
          value: codeBlock(`Нет`),
          inline: true,
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
        {
          name: "Санкция",
          value: codeBlock(`Нет`),
          inline: true,
        },
      ],
    },
  },
} as const;

export const ContextCommandAnalyzeMessage = {
  awaiting: {
    title: (username: string) =>
      `Система анализирует сообщение пользователя ${username}...`,
    description: "Пожалуйста подождите...",
  },
  success: {
    title: "Анализ успешно завершён",
    description: (explaination: string) =>
      [bold("Результаты анализа:"), explaination].join("\n"),
  },
  validation: {
    title: "Ошибка...",
    bot: "Невозможно проанализировать сообщение от бота",
    empty: "Невозможно проанализировать сообщение без текста",
    internal: "Произошла внутренняя ошибка",
    request: "Произошла ошибка во время запроса к боту...",
    rate: (timeLeft: number | string) =>
      `Ошибка. Команду можно использовать через ${timeLeft} секунд`,
  },
} as const;

export const ContextCommandAnalyzeLastUserMessages = {
  awaiting: {
    title: (username: string) =>
      `Система анализирует пользователя ${username}...`,
    description: (warnMessage: string | null) =>
      [
        warnMessage && bold("[ПРЕДУПРЕЖДЕНИЕ]"),
        warnMessage,
        "Пожалуйста подождите...",
      ]
        .filter(Boolean)
        .join("\n"),
  },
  success: {
    title: "Поздравляем, анализ успешно завершён",
    description: (explaination: string) =>
      [bold("Результаты анализа:"), explaination].join("\n"),
  },
  failure: {
    title: "Произошла ошибка",
    description: "Во время анализа произошла внутренняя ошибка",
  },
  validation: {
    title: "Ошибка...",
    NaN: "Указанное число таковым не является, система выставила лимит равный 1",
    max: "Указанное число выше 50, система выставила максимальный порог",
    min: "Указанное число меньше или равно нулю, система выставила лимит равный 1",
    channelType:
      "Команда использована не в том канале. Возможно, что вы нажали на пользователя, находящегося в голосовом чате",
    usr: {
      title: "Пользователь не найден",
      description: "Указанный вами ID пользователя не найден на сервере",
    },
    bot: "Указанный вами пользователь - бот",
  },
} as const;

export const SlashCommandAnalyzeUserNickname = {
  awaiting: {
    title: (username: string) =>
      `Система анализирует пользователя ${username}...`,
    description: "Пожалуйста подождите",
  },
  validation: {
    title: "Ошибка...",
    bot: "Указанный вами пользователь - бот",
    user: {
      title: "Пользователь не найден",
      description: "Указанный вами ID пользователя не найден на сервере",
    },
  },
  success: {
    title: "Анализ завершён",
    description: (explaination: string) =>
      [bold("Результаты анализа:"), explaination].join("\n"),
  },
  failure: {
    title: "Произошла ошибка",
    description: "Во время анализа произошла внутренняя ошибка",
  },
} as const;
