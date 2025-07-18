import { configService } from "@/shared/config/config.js";
import { LocalCache } from "@ts-fetcher/cache";
import { createRestInstance } from "@ts-fetcher/rest";


export const localCacheRest = createRestInstance(
  configService.get("API_URL"),
  {
    cache: new LocalCache(),
    defaultRequestOptions: {
      headers: {
        "Content-Type": "application/json"
      }
    }
  }
);
