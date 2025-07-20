import { LocalCache as LocalCacheRest } from "@ts-fetcher/cache";

export class LocalCache extends LocalCacheRest {
  getAll() {
    return this.cache;
  }
}
