export class DoesNotExistsEror extends Error {
  constructor(message: string) {
    super(`[DOES NOT EXISTS] ${message}`);
  }
}
