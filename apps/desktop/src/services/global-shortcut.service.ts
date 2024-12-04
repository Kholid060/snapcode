import {
  register,
  ShortcutHandler,
  unregister,
} from '@tauri-apps/plugin-global-shortcut';

class GlobalShortcut {
  private handlers = new Map<string, ShortcutHandler>();

  async register(shortcut: string, handler: ShortcutHandler) {
    await register(shortcut, handler);
    this.handlers.set(shortcut, handler);
  }

  async unregister(shortcut: string) {
    await unregister(shortcut);
    this.handlers.delete(shortcut);
  }

  async update(shortcut: string, newShortcut: string) {
    const handler = this.handlers.get(shortcut);
    if (!handler) return false;

    await unregister(shortcut);
    await register(newShortcut, handler);

    this.handlers.set(newShortcut, handler);
    this.handlers.delete(shortcut);

    return true;
  }
}

export const globalShortcut = new GlobalShortcut();
