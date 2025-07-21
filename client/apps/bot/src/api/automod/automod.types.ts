import type { LiteralEnum } from "@ts-fetcher/types";
import type { Snowflake } from "discord.js";

export interface AutomodMessage {
  content: string;
  user_id: Snowflake;
  createdAt: Date;
}

export const AutomodRule = {
  Caps: "CAPS",
  CapsMixed: "CAPS_MIXED",
  MessageMaxLength: "MESSAGE_MAX_LENGTH",
  EmojiMaxLength: "EMOJI_MAX_LENGTH",
  Links: "LINKS",
  Language: "LANGUAGE",
  Banword: "BANWORD",
  Toxicity: "TOXICITY",
} as const;

export type AutomodRule = LiteralEnum<typeof AutomodRule>;

export interface AutomodRequest {
  messages: AutomodMessage[];
  rules: AutomodRule[];
}

export interface AutomodMatch {
  user_id: Snowflake;
  content: string;
  createdAt: Date;
  rules: AutomodRule[];
}

export interface AutomodResponse {
  matches: AutomodMatch[];
}

export const AUTOMOD_AI_RULES = [
  AutomodRule.Banword,
  AutomodRule.Toxicity,
] as AutomodRule[];

export const AUTOMOD_ALGHORITHMIC_RULES = [
  AutomodRule.Caps,
  AutomodRule.CapsMixed,
  AutomodRule.MessageMaxLength,
  AutomodRule.EmojiMaxLength,
  AutomodRule.Language,
  AutomodRule.Links,
] as AutomodRule[];
