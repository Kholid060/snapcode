import { appCommand } from '@/services/app-command.service';
import {
  LazyStore as oLazyStore,
  StoreOptions,
} from '@snippy/tauri-plugin-store';

class LazyStore<T> extends oLazyStore {
  constructor(
    private _path: string,
    options?: StoreOptions | undefined,
  ) {
    super(_path, options);
  }

  xGet<P extends keyof T>(key: P, def: T[P]): Promise<T[P]>;
  xGet<P extends keyof T>(key: P, def?: T[P]): Promise<T[P] | undefined>;
  async xGet<P extends keyof T>(key: P, def?: T[P]) {
    return (await this.get(key as string)) ?? def;
  }

  xSet<P extends keyof T>(key: P, value: T[P]) {
    return this.set(key as string, value);
  }

  async xDelete(key: string | string[]) {
    if (Array.isArray(key)) {
      await appCommand.invoke('store_delete_bulks', {
        path: this._path,
        keys: key,
      });
    } else {
      await this.delete(key);
    }
  }

  async xRenameRootKeys(keys: [oldKey: string, newKey: string][]) {
    await appCommand.invoke('store_rename_root_keys', {
      keys,
      path: this._path,
    });
  }
}

export default LazyStore;
