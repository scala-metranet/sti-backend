export class HttpException extends Error {
  public status: number;
  public message: string;
  public errors?: Array<{ property: string; constraints: string }>;

  constructor(status: number, message: string, errors: { property: string; constraints: string }[] = []) {
    super(message);
    this.status = status;
    this.message = message;
    this.errors = errors;
  }
}
