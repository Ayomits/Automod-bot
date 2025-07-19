import type { LiteralEnum } from "ts-fetcher";

export const AnalyzeStep = {
  Rules: "rules",
  Users: "users",
  Messages: "messages",
} as const;

export type AnalyzeStep = LiteralEnum<typeof AnalyzeStep>;

export function createAnalyzerQuiz() {
  let currentStep: AnalyzeStep = AnalyzeStep.Rules;

  const values: Record<AnalyzeStep, string[]> = {
    rules: [],
    users: [],
    messages: [],
  };

  function setStep(step: AnalyzeStep, stepValues: string[]) {
    currentStep = step;
    values[step] = stepValues;
    return true;
  }

  function getValues() {
    return values;
  }

  function getCurrentStep() {
    return currentStep;
  }

  function getValuesByStep(step: AnalyzeStep) {
    return values[step];
  }

  return {
    setStep,
    step: getCurrentStep,
    values: getValues,
    getValue: getValuesByStep,
  };
}
