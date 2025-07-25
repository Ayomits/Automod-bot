import {
  AUTOMOD_AI_RULES,
  AUTOMOD_ALGHORITHMIC_RULES,
  type AutomodRequest,
  type AutomodResponse,
} from "@automod/types";
import { injectable } from "tsyringe";

import { rest } from "@/rest.js";
import type { ApiResponse } from "@ts-fetcher/types";

@injectable()
export class AutomodApi {
  public async automod(payload: Omit<AutomodRequest, "rules">) {
    return await this.automodSelectedRules({ ...payload, rules: [] }).catch(
      console.error,
    );
  }

  public async automodAlghorthimicRules(
    payload: Omit<AutomodRequest, "rules">,
  ) {
    return await this.automodSelectedRules({
      ...payload,
      rules: AUTOMOD_ALGHORITHMIC_RULES,
    }).catch(console.error);
  }

  public async automodAIRules(payload: Omit<AutomodRequest, "rules">) {
    return await this.automodSelectedRules({
      ...payload,
      rules: AUTOMOD_AI_RULES,
    }).catch(console.error);
  }

  private async automodSelectedRules(
    payload: AutomodRequest,
  ): Promise<ApiResponse<AutomodResponse, AutomodRequest, "POST">> {
    // @ts-expect-error TS2742
    return await rest.post<AutomodResponse, AutomodRequest>("/automod", {
      body: payload,
    });
  }
}
