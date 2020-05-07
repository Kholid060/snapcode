import Vue from 'vue';
import shortid from 'shortid';
import debounce from 'lodash.debounce';
import db from '~/utils/db';
import toArray from '~/utils/toArray';

const updateFileDB = debounce((folderId, id, fileData) => {
  db.files.where('folderId').equals(folderId).modify((file) => {
    Vue.set(file.data, id, fileData);
  });
}, 500);

export default {
  state: () => ({
    entities: {},
  }),
  getters: {
    activeFile: (state, getters, rootState) => {
      if (rootState.activeFile === '') return null;

      const [folderId, fileId] = rootState.activeFile.split('&');

      return {
        ...state.entities[folderId][fileId],
        id: fileId,
      };
    },
    getByFolderId: (state) => (id) => toArray(state.entities[id]),
    getAll: (state) => {
      const files = Object.values(state.entities).map((file) => toArray(file));

      return files.flat();
    },
  },
  mutations: {
    addFile(state, { id, folderId }) {
      const fileData = {
        folderId,
        title: 'Untitled',
        tags: [],
        content: '',
        star: false,
        createDate: Date.now(),
        mode: 'text/javascript',
      };

      Vue.set(state.entities[folderId], id, fileData);
      updateFileDB(folderId, id, fileData);
    },
    updateFile(state, { folderId, fileId, data }) {
      Vue.set(state.entities[folderId], fileId, data);
      updateFileDB(folderId, fileId, data);
    },
    addEntity(state, id) {
      Vue.set(state.entities, id, {});
      db.files.add({ folderId: id, data: {} });
    },
    deleteEntity(state, id) {
      Vue.delete(state.entities, id);
      db.files.where('folderId').equals(id).delete();
    },
    deleteFile(state, { folderId, fileId }) {
      Vue.delete(state.entities[folderId], fileId);
      db.files.where('folderId').equals(folderId).modify((file) => {
        /* eslint-disable no-param-reassign */
        file.data = {
          ...state.entities[folderId],
        };
      });
    },
  },
  actions: {
    insert({ commit }, folderId) {
      return new Promise((resolve) => {
        const id = shortid.generate();

        commit('addFile', {
          folderId,
          id,
        });

        resolve();
      });
    },
    update({ commit, state }, { folderId, fileId, data }) {
      return new Promise((resolve) => {
        const assignData = { ...state.entities[folderId][fileId], ...data };

        commit('updateFile', {
          fileId,
          folderId,
          data: assignData,
        });

        resolve();
      });
    },
    delete({ commit, getters }, { fileId, folderId }) {
      return new Promise((resolve) => {
        commit('deleteFile', { fileId, folderId });

        const files = getters.getByFolderId(folderId);
        const activeFile = files.length !== 0 ? `${folderId}&${files[0].id}` : '';
        commit('changeState', {
          key: 'activeFile',
          data: activeFile,
        }, { root: true });

        resolve();
      });
    },
  },
};
