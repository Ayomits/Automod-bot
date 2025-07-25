import { LocalCache } from "@ts-fetcher/cache";
import { injectable } from "tsyringe";

interface SetScheduleOptions {
  delay: number;
  callback: () => Promise<void | unknown> | void | unknown;
  // Позволяет удалить предыдущий, запустить нынешний колбэк, а затем создать новый таймер
  force?: boolean;
}

@injectable()
export class ScheduleManager {
  private schedules: LocalCache<string, NodeJS.Timeout>;

  constructor() {
    this.schedules = new LocalCache();
  }

  public get(key: string) {
    return this.schedules.get(key);
  }

  public set(key: string, options: SetScheduleOptions) {
    const existed = this.schedules.get(key);
    const setter = () =>
      this.schedules.set(
        key,
        setTimeout(() => options.callback(), options.delay),
        options.delay,
        (_, value) => clearTimeout(value),
      );
    if (options.force && existed) {
      void options.callback();
      setter();
      return;
    }
    return setter();
  }

  public delete(key: string) {
    const existed = this.schedules.get(key);
    if (!existed) {
      return;
    }
    clearTimeout(existed);
  }

  public stopAll() {
    return Array.from(this.schedules.values()).forEach((item) =>
      clearTimeout(item.data),
    );
  }
}
