import Vue from 'vue';
import shortid from 'shortid';
import db from '~/utils/db';
import toArray from '~/utils/toArray';

export default {
  state: () => ({
    entities: {},
  }),
  getters: {
    getById: (state) => (folderId, id) => state.entities[folderId][id],
    getByIds: (state) => (ids) => ids.map((id) => {
      const { name } = state.entities[id];

      return {
        id,
        name,
      };
    }),
    getAll: (state) => toArray(state.entities),
  },
  mutations: {
    addTag(state, { name, id }) {
      Vue.set(state.entities, id, {
        name,
      });
      db.tags.add({ id, name });
    },
    deleteTag(state, id) {
      Vue.delete(state.entities, id);
      db.tags.where('id').equals(id).delete();
    },
  },
  actions: {
    insert({ commit }, name) {
      return new Promise((resolve) => {
        const id = shortid.generate();

        commit('addTag', {
          name,
          id,
        });

        resolve(id);
      });
    },
    delete({
      commit, rootGetters, rootState, dispatch,
    }, tagId) {
      return new Promise((resolve) => {
        commit('deleteTag', tagId);

        if (rootState.activeTag === tagId) {
          commit('changeState', {
            key: 'activeTag',
            data: '',
          }, { root: true });
        }

        const files = rootGetters['files/getAll'].filter((file) => file.tags.includes(tagId));
        files.forEach((file) => {
          const tagIndex = file.tags.indexOf(tagId);
          const copyTags = [...file.tags];

          copyTags.splice(tagIndex, 1);

          dispatch('files/update', {
            fileId: file.id,
            folderId: file.folderId,
            data: {
              tags: copyTags,
            },
          }, { root: true });
        });

        resolve();
      });
    },
  },
};
