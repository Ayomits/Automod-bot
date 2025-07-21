import { AutomodRule, type AutomodMatch } from "@/api/automod/automod.types.js";
import { userMention, codeBlock, bold } from "discord.js";

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

export const ContextCommandAnalyzeMessage = {
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
    title: "Поздравляем, анализ завершён успешно",
    description: (explaination: string) =>
      [bold("Результаты анализа:"), explaination].join("\n"),
  },
  failure: {
    title: "Произошла ошибка",
    description: "Во время анализа что-то пошло не так...",
  },
  validation: {
    Title: "Ошибка...",
    NaN: "Указанное число таковым не является, система выставила лимит равный 1",
    Max: "Указанное число выше 50, система выставила максимальный порог",
    Min: "Указанное число меньше или равно нулю, система выставила лимит равный 1",
    ChannelType:
      "Команда использована не в том канале. Возможно, что вы нажали на пользователя, находящегося в голосовом чате",
    User: {
      title: "Пользователь не найден",
      description: "Указанный вами ID пользователя не найден на сервере",
    },
    Bot: "Указанный вами пользователь - бот",
  },
} as const;
