import { AppWindowLabel } from '@/interface/app.interface';
import { DocumentCreatedSnippet } from '@/interface/document.interface';
import { EventCallback, EventName } from '@tauri-apps/api/event';
import { getCurrentWindow } from '@tauri-apps/api/window';

interface CustomWindowEvent {
  'snippet:open': string;
  'snippet:created': DocumentCreatedSnippet;
}

const currentWindow = getCurrentWindow();

export function useTauriWindowEvent<
  T extends keyof CustomWindowEvent | EventName,
  P = unknown,
>(
  name: T,
  handler: T extends keyof CustomWindowEvent
    ? EventCallback<CustomWindowEvent[T]>
    : EventCallback<P>,
) {
  const unlisten = currentWindow.listen(
    name,
    handler as EventCallback<unknown>,
  );

  onBeforeUnmount(() => unlisten.then((unlisten) => unlisten()));
}

export function useTauriUtils() {
  function emitEventTo<T extends keyof CustomWindowEvent>(
    windowLabel: AppWindowLabel,
    eventName: T,
    payload: CustomWindowEvent[T],
  ) {
    return currentWindow.emitTo(windowLabel, eventName, payload);
  }

  return {
    emitEventTo,
  };
}
