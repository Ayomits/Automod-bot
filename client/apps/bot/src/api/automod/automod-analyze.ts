import { type Snowflake,userMention } from "discord.js";
import { injectable } from "tsyringe";

import type { AutomodResponse, AutomodRule } from "./automod.types.js";

type UserViolations = Record<Snowflake, Partial<Record<AutomodRule, number>>>;

@injectable()
export class AutomodAnalyzeExplanaition {
  private violations: UserViolations;
  private arrText: string[];
  private text: string;

  constructor() {
    this.violations = {};
    this.text = "";
    this.arrText = [];
  }

  public explain(response: AutomodResponse) {
    const matches = response.matches;
    if (matches.length <= 0) {
      return this;
    }
    for (const match of matches) {
      match.rules.forEach((rule) => {
        const existed = this.violations[match.user_id];
        if (!existed) {
          this.violations[match.user_id] = { [rule]: 1 };
          return;
        }
        this.violations[match.user_id] = {
          ...existed,
          [rule]: existed?.[rule] ? existed[rule] + 1 : 1,
        };
      });
    }
    return this;
  }

  public toRaw() {
    return this.violations;
  }

  public toText() {
    if (this.text.length) {
      return this.text;
    }
    if (!this.arrText.length) {
      this.toArrText();
    }
    this.text = this.arrText.join("\n");
    return this.text;
  }

  public toEmbeds() {}

  public toArrText() {
    if (this.arrText.length) {
      return this.arrText;
    }
    if (Object.keys(this.violations).length === 0) {
      this.arrText = ["Нарушений нет"];
      return this.arrText;
    }
    this.arrText = Object.entries(this.violations).flatMap(([key, value]) => {
      return [
        `Нарушения пользователя ${userMention(key)}`,
        // TODO: нормальное объяснение
        Object.entries(value)
          .map(([key, value]) => `${key}:${value}`)
          .join("\n"),
      ];
    });
    return this.arrText;
  }

  public clean() {
    this.violations = {};
    this.text = "";
    this.arrText = [];
  }
}
