import { configService } from "@automod/config";
import { LocalCache } from "@ts-fetcher/cache";
import { createRestInstance } from "@ts-fetcher/rest";
import type { Rest } from "@ts-fetcher/rest";

export const rest: Rest = createRestInstance(configService.get("API_URL"), {
  cache: new LocalCache(),
  defaultRequestOptions: {
    headers: {
      "Content-Type": "application/json",
    },
  },
});
