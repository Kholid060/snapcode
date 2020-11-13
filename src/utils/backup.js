import store from '~/store';
import { auth, apiFetch } from './firebase';
import debounce from './debounce';
import dataFlag from './dataFlag';

function isEmptyArray({ files, folders }) {
  const keys = ['updated', 'deleted'];
  const isValidFiles = keys.every((key) => files[key].length === 0);
  const isValidFolders = keys.every((key) => folders[key].length === 0);

  return isValidFolders && isValidFiles;
}

class Backup {
  constructor() {
    this.init = debounce(this.fetch.bind(this), 1000);
    this.data = {};
  }

  fetchData() {
    this.data = {
      files: {
        updated: dataFlag.getAllUpdated('files'),
        deleted: dataFlag.getAllDeleted('files'),
      },
      folders: {
        updated: dataFlag.getAllUpdated('folders'),
        deleted: dataFlag.getAllDeleted('folders'),
      },
    };
  }

  async fetch() {
    if (!auth.user) return;

    try {
      this.fetchData();

      if (isEmptyArray(this.data)) return;

      const lastBackup = Date.now();

      await apiFetch('/sync', {
        method: 'POST',
        body: JSON.stringify({
          ...this.data,
          lastBackup,
        }),
      });

      await dataFlag.cleanAllFlag('files', this.data.files.updated);
      await dataFlag.cleanAllFlag('folders', this.data.folders.updated);

      store.commit('updateState', {
        key: 'isDataChanged',
        value: false,
      });

      localStorage.setItem('lastBackup', lastBackup);
      localStorage.setItem('isDataChanged', false);
    } catch (error) {
      /* eslint-disable-next-line */
      console.error(error);
    }
  }
}

export default new Backup();
