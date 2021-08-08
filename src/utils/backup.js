import store from '~/store';
import { auth, apiFetch } from './firebase';
import { debounce } from './helper';
import dataFlag from './dataFlag';

function isEmptyArray({ files, folders }) {
  const keys = ['updated', 'deleted'];
  const isFilesEmpty = keys.every((key) => files[key].length === 0);
  const isFoldersEmpty = keys.every((key) => folders[key].length === 0);

  return isFoldersEmpty && isFilesEmpty;
}

class Backup {
  constructor() {
    this.init = debounce(this.fetch.bind(this), 1000);
    this.data = {};
    this.listeners = {};
    this.interval = null;
  }

  _fetchData() {
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
      this._fetchData();

      if (isEmptyArray(this.data)) {
        store.commit('updateState', {
          key: 'isDataChanged',
          value: false,
        });

        return;
      }

      this.fireEvent('progress', true);

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
      store.commit('updateState', {
        key: 'lastBackup',
        value: Date.now(),
      });

      localStorage.setItem('lastBackup', lastBackup);
      localStorage.setItem('isDataChanged', false);
      this.fireEvent('progress', false);
    } catch (error) {
      /* eslint-disable-next-line */
      this.fireEvent('progress', false);
      console.error(error);
    }
  }

  fireEvent(name, params) {
    this.listeners[name] && this.listeners[name](params);
  }

  on(eventName, callback) {
    this.listeners = {
      [eventName]: callback,
      ...this.listeners,
    };
  }

  timer(duration = 60000) {
    if (!auth.user) return;

    clearInterval(this.interval);

    this.interval = setInterval(() => {
      if (store.state.isDataChanged) this.fetch();
    }, duration);
  }
}

export default new Backup();
