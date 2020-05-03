import Vue from 'vue';
import shortid from 'shortid';
import toArray from '~/utils/toArray';

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
    },
    updateFolder(state, { folderId, data }) {
      Vue.set(state.entities, folderId, data);
    },
  },
  actions: {
    insert({ commit }, name) {
      return new Promise((resolve) => {
        const id = shortid.generate();

        commit('files/addEntity', id, { root: true });
        commit('tags/addEntity', id, { root: true });
        commit('addFolder', { id, name });

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
