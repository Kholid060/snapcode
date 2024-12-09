import { appDataDir } from '@tauri-apps/api/path';
import { Client, Stronghold } from '@tauri-apps/plugin-stronghold';

function decodeStoreValue(value: Uint8Array | null) {
  return value === null ? null : new TextDecoder().decode(value);
}

type VaultValue = string | null;

class AppVault {
  #stronghold: { vault: Client; stronghold: Stronghold } | null = null;

  async #getStronghold() {
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
      vault,
      stronghold,
    };

    return this.#stronghold;
  }

  #getStore() {
    return this.#getStronghold().then(({ vault }) => vault.getStore());
  }

  async get(keys: string): Promise<VaultValue>;
  async get(keys: string[]): Promise<VaultValue[]>;
  async get(keys: string | string[]): Promise<VaultValue | VaultValue[]> {
    const store = await this.#getStore();
    return Array.isArray(keys)
      ? Promise.all(
          keys.map(async (key) => store.get(key).then(decodeStoreValue)),
        )
      : store.get(keys).then(decodeStoreValue);
  }

  async insert(key: string, value: string) {
    const store = await this.#getStore();
    await store.insert(key, Array.from(new TextEncoder().encode(value)));
  }

  async update(key: string, value: string) {
    await this.remove(key);
    await this.insert(key, value);
  }

  async remove(keys: string | string[]) {
    const store = await this.#getStore();
    if (Array.isArray(keys)) {
      await Promise.all(keys.map((key) => store.remove(key)));
    } else {
      await store.remove(keys);
    }
  }
}

const appVault = new AppVault();

export default appVault;
