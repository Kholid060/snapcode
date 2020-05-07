import Vue from 'vue';
import shortid from 'shortid';
import db from '~/utils/db';
import toArray from '../../utils/toArray';

export default {
  state: () => ({
    entities: {},
  }),
  getters: {
    getAll: ({ entities }) => toArray(entities),
  },
  mutations: {
    addFolder(state, { id, name }) {
      Vue.set(state.entities, id, {
        name,
      });
      db.folders.add({ id, name });
    },
    updateFolder(state, { folderId, data }) {
      Vue.set(state.entities, folderId, data);
      db.folders.where('id').equals(folderId).modify({ ...data });
    },
    deleteFolder(state, folderId) {
      Vue.delete(state.entities, folderId);
      db.folders.where('id').equals(folderId).delete();
    },
  },
  actions: {
    insert({ commit }, name) {
      return new Promise((resolve) => {
        const id = shortid.generate();

        commit('files/addEntity', id, { root: true });
        commit('addFolder', { id, name });

        resolve();
      });
    },
    delete({ commit, rootState }, folderId) {
      return new Promise((resolve) => {
        const files = rootState.files.entities[folderId];
        const activeFile = rootState.activeFile.split('&')[1];

        if (files[activeFile]) {
          commit('changeState', {
            key: 'activeFile',
            data: '',
          }, { root: true });
        }

        commit('files/deleteEntity', folderId, { root: true });
        commit('deleteFolder', folderId);

        resolve();
      });
    },
    update({ commit, state }, { folderId, data }) {
      const editData = state.entities[folderId];
      const assignData = { ...editData, ...data };

      commit('updateFolder', { folderId, data: assignData });
    },
  },
};
