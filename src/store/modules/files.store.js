import Vue from 'vue';
import shortid from 'shortid';
import toArray from '~/utils/toArray';

export default {
  state: () => ({
    entities: {
      adoio: {
        alda: {
          title: 'anu anu',
          tags: ['blabla11'],
          content: 'console.log(func())',
          star: false,
        },
      },
    },
  }),
  getters: {
    getByFolderId: (state) => (id) => toArray(state.entities[id]),
    getAll: (state) => {
      const files = Object.values(state.entities).map((file) => toArray(file));

      return files.flat();
    },
  },
  mutations: {
    addFile(state, { id, folderId }) {
      Vue.set(state.entities[folderId], id, {
        folderId,
        title: 'Untitled',
        tags: [],
        content: '',
        star: false,
        createDate: Date.now(),
      });
    },
    addEntity(state, id) {
      Vue.set(state.entities, id, {});
    },
  },
  actions: {
    insert({ commit, dispatch }, folderId) {
      return new Promise((resolve) => {
        const id = shortid.generate();

        commit('addFile', {
          folderId,
          id,
        });
        dispatch('folders/update', {
          folderId,
          data: {
            activeFile: id,
          },
        }, { root: true });

        resolve();
      });
    },
  },
};
