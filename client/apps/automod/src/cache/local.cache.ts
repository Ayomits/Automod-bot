/* eslint-disable @typescript-eslint/no-explicit-any */
import { LocalCache as LocalCacheRest } from "@ts-fetcher/cache";

export class LocalCache<
  K extends string = string,
  V = any,
> extends LocalCacheRest<K, V> {
  raw() {
    return this.cache;
  }

  findMatched<T>(matcher: string, removeAfter = false) {
    const values: {
      key: string;
      value: unknown;
    }[] = [];

    this.raw().forEach((value, key) => {
      if (!key.includes(matcher)) {
        return null;
      }
      return values.push({
        key,
        value: value.data,
      });
    });

    if (removeAfter) {
      values.forEach((item) => this.cache.delete(item.key as K));
    }

    return values.map((item) => item.value) as T[];
  }
}
