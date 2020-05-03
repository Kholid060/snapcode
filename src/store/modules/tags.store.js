import Vue from 'vue';
import shortid from 'shortid';

export default {
  state: () => ({
    entities: {
      adoio: {
        blabla11: {
          name: 'project',
        },
      },
    },
  }),
  getters: {
    getById: (state) => (folderId, id) => state.entities[folderId][id],
  },
  mutations: {
    addEntity(state, id) {
      Vue.set(state.entities, id, {});
    },
    addTag(state, { folderId, name, id }) {
      Vue.set(state.entities, folderId, {
        [id]: name,
      });
    },
  },
  actions: {
    insert({ commit }, { folderId, name }) {
      return new Promise((resolve) => {
        const id = shortid.generate();

        commit('addTag', {
          folderId,
          name,
          id,
        });

        resolve();
      });
    },
  },
};
