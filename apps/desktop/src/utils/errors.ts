interface FetchErrorOptions {
  data: unknown;
  status: number;
  message: string;
  statusText: string;
}

export class FetchError extends Error {
  readonly data: unknown;
  readonly status: number;
  readonly statusText: string;

  constructor({ message, status, statusText }: FetchErrorOptions) {
    super(message);

    this.status = status;
    this.statusText = statusText;
  }
}
