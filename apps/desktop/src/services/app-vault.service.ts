import { appDataDir } from '@tauri-apps/api/path';
import { Client, Stronghold, Store } from '@tauri-apps/plugin-stronghold';

type VaultValue = string | null;
abstract class VaultStore {
  abstract get(key: string): Promise<VaultValue>;

  abstract insert(key: string, value: string): Promise<void>;

  abstract update(key: string, value: string): Promise<void>;

  abstract remove(key: string): Promise<void>;

  abstract save(): Promise<void>;
}

class StrongholdStore implements VaultStore {
  #stronghold: { store: Store; stronghold: Stronghold } | null = null;

  async #getStore() {
    if (this.#stronghold) return this.#stronghold;

    const vaultPath = `${await appDataDir()}/vault.hold`;
    const stronghold = await Stronghold.load(
      vaultPath,
      import.meta.env.VITE_VAULT_PASS,
    );

    let vault: Client;
    const clientName = 'name your client';
    try {
      vault = await stronghold.loadClient(clientName);
    } catch {
      vault = await stronghold.createClient(clientName);
    }

    this.#stronghold = {
      stronghold,
      store: vault.getStore(),
    };

    return this.#stronghold;
  }

  private decodeStoreValue(value: Uint8Array | null) {
    return value === null ? null : new TextDecoder().decode(value);
  }

  private encodeStoreValue(value: string) {
    return Array.from(new TextEncoder().encode(value));
  }

  async get(key: string): Promise<VaultValue> {
    const { store } = await this.#getStore();
    return this.decodeStoreValue(await store.get(key));
  }

  async insert(key: string, value: string): Promise<void> {
    const { store } = await this.#getStore();
    await store.insert(key, this.encodeStoreValue(value));
  }

  async update(key: string, value: string): Promise<void> {
    const { store } = await this.#getStore();
    await store.remove(key);
    await store.insert(key, this.encodeStoreValue(value));
  }

  async remove(key: string): Promise<void> {
    const { store } = await this.#getStore();
    await store.remove(key);
  }

  async save(): Promise<void> {
    const { stronghold } = await this.#getStore();
    await stronghold.save();
  }
}

class LocalStore implements VaultStore {
  get(key: string): Promise<VaultValue> {
    return Promise.resolve(localStorage.getItem(key));
  }

  insert(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value);
    return Promise.resolve();
  }

  update(key: string, value: string): Promise<void> {
    return this.insert(key, value);
  }

  remove(key: string): Promise<void> {
    localStorage.removeItem(key);
    return Promise.resolve();
  }

  save(): Promise<void> {
    return Promise.resolve();
  }
}

class AppVault {
  // Stronghold store quite slow on dev
  // https://github.com/tauri-apps/plugins-workspace/issues/2048
  #store = import.meta.env.DEV ? new LocalStore() : new StrongholdStore();

  async get(keys: string): Promise<VaultValue>;
  async get(keys: string[]): Promise<VaultValue[]>;
  async get(keys: string | string[]): Promise<VaultValue | VaultValue[]> {
    return Array.isArray(keys)
      ? Promise.all(keys.map(async (key) => this.#store.get(key)))
      : this.#store.get(keys);
  }

  async insert(key: string, value: string): Promise<void>;
  async insert(key: Record<string, string>, value?: string): Promise<void>;
  async insert(key: string | Record<string, string>, value: string) {
    if (typeof key === 'string') {
      await this.#store.insert(key, value);
    } else {
      await Promise.all(
        Object.keys(key).map((insertKey) =>
          this.#store.insert(insertKey, key[insertKey]),
        ),
      );
    }

    await this.#store.save();
  }

  async update(key: string, value: string) {
    await this.#store.update(key, value);
    await this.#store.save();
  }

  async remove(keys: string | string[]) {
    if (Array.isArray(keys)) {
      await Promise.all(keys.map((key) => this.#store.remove(key)));
    } else {
      await this.#store.remove(keys);
    }

    await this.#store.save();
  }
}

const appVault = new AppVault();

export default appVault;
