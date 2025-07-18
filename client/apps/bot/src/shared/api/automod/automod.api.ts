import { localCacheRest } from "../lib/rest.js";
import {
  AUTOMOD_AI_RULES,
  AUTOMOD_ALGHORITHMIC_RULES,
  AutomodRequest,
  AutomodResponse,
} from "./automod.types.js";

export class AutomodApi {
  rest = localCacheRest;

  public async automod(payload: Omit<AutomodRequest, "rules">) {
    return await this.automodSelectedRules({ ...payload, rules: [] });
  }

  public async automodAlghorthimicRules(
    payload: Omit<AutomodRequest, "rules">
  ) {
    return await this.automodSelectedRules({
      ...payload,
      rules: AUTOMOD_ALGHORITHMIC_RULES,
    });
  }

  public async automodAIRules(payload: Omit<AutomodRequest, "rules">) {
    return await this.automodSelectedRules({
      ...payload,
      rules: AUTOMOD_AI_RULES,
    });
  }

  private async automodSelectedRules(payload: AutomodRequest) {
    return await this.rest.post<AutomodResponse>("/automod", {
      body: payload,
    });
  }
}
