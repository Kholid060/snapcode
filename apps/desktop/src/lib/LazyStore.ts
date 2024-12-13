import { LazyStore as oLazyStore } from '@snippy/tauri-plugin-store';

class LazyStore<T> extends oLazyStore {
  xGet<P extends keyof T>(key: P, def: T[P]): Promise<T[P]>;
  xGet<P extends keyof T>(key: P, def?: T[P]): Promise<T[P] | undefined>;
  async xGet<P extends keyof T>(key: P, def?: T[P]) {
    return (await this.get(key as string)) ?? def;
  }

  xSet<P extends keyof T>(key: P, value: T[P]) {
    return this.set(key as string, value);
  }
}

export default LazyStore;
