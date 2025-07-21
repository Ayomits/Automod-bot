/* eslint-disable @typescript-eslint/no-explicit-any */
import { LocalCache as LocalCacheRest } from "@ts-fetcher/cache";

export class LocalCache<
  K extends string = string,
  V = any,
> extends LocalCacheRest<K, V> {
  getAll() {
    return this.cache;
  }
}
