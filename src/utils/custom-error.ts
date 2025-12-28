export class CustomError extends Error {
  constructor(
    message: string,
    public readonly code: number = 400,
  ) {
    super(message);
  }
}
