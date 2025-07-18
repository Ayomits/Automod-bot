import { localCacheRest } from "../lib/rest.js";
import {
  AUTOMOD_AI_RULES,
  AUTOMOD_ALGHORITHMIC_RULES,
  type AutomodRequest,
  type AutomodResponse,
} from "./automod.types.js";

export class AutomodApi {
  rest = localCacheRest;

  public async automod(payload: Omit<AutomodRequest, "rules">) {
    return await this.automodSelectedRules({ ...payload, rules: [] }).catch(console.error);;
  }

  public async automodAlghorthimicRules(
    payload: Omit<AutomodRequest, "rules">
  ) {
    return await this.automodSelectedRules({
      ...payload,
      rules: AUTOMOD_ALGHORITHMIC_RULES,
    }).catch(console.error);;
  }

  public async automodAIRules(payload: Omit<AutomodRequest, "rules">) {
    return await this.automodSelectedRules({
      ...payload,
      rules: AUTOMOD_AI_RULES,
    }).catch(console.error);;
  }

  private async automodSelectedRules(payload: AutomodRequest) {
    return await this.rest.post<AutomodResponse>("/automod", {
      body: payload,
    }).catch(console.error);
  }
}
