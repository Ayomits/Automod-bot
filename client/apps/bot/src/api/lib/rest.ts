import { LocalCache } from "@ts-fetcher/cache";
import type { Rest } from "@ts-fetcher/rest";
import { createRestInstance } from "@ts-fetcher/rest";

import { configService } from "@/config/config.js";

export const localCacheRest: Rest = createRestInstance(
  configService.get("API_URL"),
  {
    cache: new LocalCache(),
    defaultRequestOptions: {
      headers: {
        "Content-Type": "application/json",
      },
    },
  },
);
