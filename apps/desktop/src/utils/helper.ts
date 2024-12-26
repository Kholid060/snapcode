export function unimplFunc() {
  throw new Error('Function/method is not implemented');
}

export function getLogMessage(scope: unknown, value?: unknown): string {
  let message = value || scope;
  if (message instanceof Error) message = `${message.name}: ${message.message}`;

  return typeof value === 'undefined'
    ? `${message}`
    : formatLogMessage(scope + '', message + '');
}

export function formatLogMessage(scope: string, message: string) {
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

export async function fontLoader(
  family: string,
  fonts: (string | { url: string; descriptors?: FontFaceDescriptors })[],
) {
  const promises = fonts.map(async (font) => {
    const fontFace =
      typeof font === 'string'
        ? new FontFace(family, font)
        : new FontFace(family, font.url, font.descriptors);
    await fontFace.load();

    document.fonts.add(fontFace);
  });

  await Promise.all(promises);
}

export function createDebounce() {
  let timeout: null | ReturnType<typeof setTimeout> = null;

  return (callback: () => void, timeoutMs: number) => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = setTimeout(callback, timeoutMs);
      return;
    }

    timeout = setTimeout(callback, timeoutMs);
  };
}

export function updateObject<T extends object>(target: T, source: Partial<T>) {
  Object.assign(target, source);
}

export function preventGlobalContextMenu() {
  document.body.addEventListener('contextmenu', (event) => {
    if (
      event.target instanceof HTMLElement &&
      event.target.hasAttribute('data-contextmenu')
    ) {
      return;
    }

    event.preventDefault();
  });

  document.body.addEventListener(
    'touchmove',
    (event) => {
      event.preventDefault();
    },
    { passive: false },
  );
}
