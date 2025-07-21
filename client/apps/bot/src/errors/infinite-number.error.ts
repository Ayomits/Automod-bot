export class InfiniteNumberError extends Error {
  constructor(message: string) {
    super(`[INFINITE NUMBER] ${message}`);
  }
}
