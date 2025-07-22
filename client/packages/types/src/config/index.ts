import type { ObjectKeys } from "@/utlity";

export interface EnvConfig {
  API_URL: string;
  DISCORD_TOKEN: string;
  APP_ENV: "dev" | "prod";
}

export interface ConfigService {
  get<T = string>(key: ObjectKeys<EnvConfig>, default_?: T): T;
  getOrThrow<T = string>(key: string): T;
}
