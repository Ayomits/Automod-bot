import { configService } from "@/shared/config/config";
import { createLocalCacheRestInstance } from "ts-fetcher";

export const localCacheRest = createLocalCacheRestInstance(
  configService.get("API_URL")
);
