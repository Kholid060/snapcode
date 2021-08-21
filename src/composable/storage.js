import { useStore } from 'vuex';

class Methods {
  constructor({ model, store, options }) {
    this.store = store;
    this.model = model;
    this.options = options;
  }

  _backup() {
    if (this.options.triggerBackup) {
      this.store.commit('updateState', {
        key: 'isDataChanged',
        value: true,
      });
    }
  }

  update(payload) {
    return new Promise((resolve) => {
      this.model.$update(payload).then((result) => {
        this._backup();

        resolve(result);
      });
    });
  }

  delete(id) {
    function addDeletedIdToLS({ id, isNew }) {
      if (isNew) return;

      const deletedFiles = JSON.parse(localStorage.getItem('deletedFiles')) || [];

      deletedFiles.push(id);

      localStorage.setItem('deletedFiles', JSON.stringify(deletedFiles));
    }

    return new Promise((resolve) => {
      this.model.$delete(id).then((result) => {
        this._backup();

        if (Array.isArray(result)) {
          result.forEach(addDeletedIdToLS);
        } else {
          addDeletedIdToLS(result);
        }

        resolve(result);
      });
    });
  }

  deleteAll() {
    return this.model.$deleteAll();
  }
}

export default function (generalOptions = { triggerBackup: true }) {
  const store = useStore();

  function model(name, options = {}) {
    const methodsOptions = { ...generalOptions, ...options };
    const model = store.$db().model(name || methodsOptions.defaultModel);

    return new Methods({ store, model, options: methodsOptions });
  }

  return { model };
}
