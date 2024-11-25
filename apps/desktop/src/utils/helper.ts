export function unimplFunc() {
  throw new Error('Function/method is not implemented');
}

export function getLogMessage<T>(scope: string, value: T): string {
  let message: T | string = value;
  if (value instanceof Error) message = value.name;

  return `[${scope}] ${message}`;
}
