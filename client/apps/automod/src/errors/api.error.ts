export class ApiError extends Error {
  constructor(message: string) {
    super(`[API ERROR] ${message}`);
  }
}
