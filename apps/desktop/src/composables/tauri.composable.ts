import { EventCallback, EventName } from '@tauri-apps/api/event';
import { getCurrentWindow } from '@tauri-apps/api/window';

interface CustomWindowEvent {
  'snippet:open': string;
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

  onBeforeUnmount(unlisten);
}
