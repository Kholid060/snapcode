import { appDataDir } from '@tauri-apps/api/path';
import { Client, Stronghold, Store } from '@tauri-apps/plugin-stronghold';

type VaultKeys = 'github-key';
type VaultValue = string | null;
abstract class VaultStore {
  abstract get(key: VaultKeys): Promise<VaultValue>;

  abstract insert(key: VaultKeys, value: string): Promise<void>;

  abstract update(key: VaultKeys, value: string): Promise<void>;

  abstract remove(key: VaultKeys): Promise<void>;

  abstract save(): Promise<void>;
}

class StrongholdStore implements VaultStore {
  #cache = new Map<string, VaultValue>();
  #stronghold: { store: Store; stronghold: Stronghold } | null = null;

  async #getStore() {
    if (this.#stronghold) return this.#stronghold;

    const vaultPath = `${await appDataDir()}/vault.hold`;
    const stronghold = await Stronghold.load(
      vaultPath,
      import.meta.env.VITE_VAULT_PASS,
    );

    let vault: Client;
    const clientName = 'keys';
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

  async get(key: VaultKeys): Promise<VaultValue> {
    const { store } = await this.#getStore();
    if (this.#cache.has(key)) {
      return this.#cache.get(key)!;
    }

    const value = this.decodeStoreValue(await store.get(key));
    this.#cache.set(key, value);

    return value;
  }

  async insert(key: VaultKeys, value: string): Promise<void> {
    const { store } = await this.#getStore();
    this.#cache.set(key, value);

    await store.insert(key, this.encodeStoreValue(value));
  }

  async update(key: VaultKeys, value: string): Promise<void> {
    const { store } = await this.#getStore();
    await store.remove(key);
    await store.insert(key, this.encodeStoreValue(value));
    this.#cache.set(key, value);
  }

  async remove(key: VaultKeys): Promise<void> {
    const { store } = await this.#getStore();
    await store.remove(key);
    this.#cache.delete(key);
  }

  async save(): Promise<void> {
    const { stronghold } = await this.#getStore();
    await stronghold.save();
  }
}

class LocalStore implements VaultStore {
  get(key: VaultKeys): Promise<VaultValue> {
    return Promise.resolve(localStorage.getItem(key));
  }

  insert(key: VaultKeys, value: string): Promise<void> {
    localStorage.setItem(key, value);
    return Promise.resolve();
  }

  update(key: VaultKeys, value: string): Promise<void> {
    return this.insert(key, value);
  }

  remove(key: VaultKeys): Promise<void> {
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

  async get(keys: VaultKeys): Promise<VaultValue>;
  async get(keys: VaultKeys[]): Promise<VaultValue[]>;
  async get(keys: VaultKeys | VaultKeys[]): Promise<VaultValue | VaultValue[]> {
    return Array.isArray(keys)
      ? Promise.all(keys.map(async (key) => this.#store.get(key)))
      : this.#store.get(keys);
  }

  async insert(key: VaultKeys, value: string): Promise<void>;
  async insert(key: Record<VaultKeys, string>, value?: string): Promise<void>;
  async insert(key: VaultKeys | Record<VaultKeys, string>, value: string) {
    if (typeof key === 'string') {
      await this.#store.insert(key, value);
    } else {
      await Promise.all(
        Object.keys(key).map((insertKey) =>
          this.#store.insert(
            insertKey as VaultKeys,
            key[insertKey as VaultKeys],
          ),
        ),
      );
    }

    await this.#store.save();
  }

  async update(key: VaultKeys, value: string) {
    await this.#store.update(key, value);
    await this.#store.save();
  }

  async remove(keys: VaultKeys | VaultKeys[]) {
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
