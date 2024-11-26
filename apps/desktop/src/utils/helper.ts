export function unimplFunc() {
  throw new Error('Function/method is not implemented');
}

export function getLogMessage<T>(scope: string, value: T): string {
  let message: T | string = value;
  if (value instanceof Error) message = value.name;

  return `[${scope}] ${message}`;
}

export async function catchAsyncFn<T extends () => Promise<unknown>, K>(
  fn: T,
  def: K,
): Promise<Awaited<ReturnType<T>> | K> {
  try {
    return (await fn()) as Awaited<ReturnType<T>>;
  } catch {
    return def;
  }
}
