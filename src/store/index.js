import Vue from 'vue';
import Vuex from 'vuex';
import modules from './modules';
import db from '~/utils/db';
import importdb from '~/utils/dbImport';

Vue.use(Vuex);

export default new Vuex.Store({
  modules,
  state: () => ({
    activeFile: '',
    activeTag: '',
    dark: true,
    mobileMenu: false,
  }),
  mutations: {
    changeEntityData(state, { key, data }) {
      Vue.set(state[key], 'entities', data);
    },
    changeState(state, { key, data }) {
      if (key === 'dark') {
        localStorage.setItem(key, data);
      }

      Vue.set(state, key, data);
    },
  },
  actions: {
    /* eslint-disable consistent-return */
    async retrieve({ commit }) {
      try {
        const darkStorage = JSON.parse(localStorage.getItem('dark'));
        const dark = darkStorage === null ? true : darkStorage;
        const toObject = (array, id = 'id', key = 'name') => array.reduce((obj, curr) => ({
          [curr[id]]: {
            name: curr[key],
          },
          ...obj,
        }), {});
        const count = await db.folders.count();

        commit('changeState', {
          key: 'dark',
          data: dark === null ? true : dark,
        });

        if (count === 0) {
          importdb();
        }

        const folders = await db.folders.toArray();
        commit('changeEntityData', {
          key: 'folders',
          data: toObject(folders),
        });

        const files = await db.files.toArray();
        commit('changeEntityData', {
          key: 'files',
          data: files.reduce((obj, file) => ({
            [file.folderId]: {
              ...file.data,
            },
            ...obj,
          }), {}),
        });

        const tags = await db.tags.toArray();
        commit('changeEntityData', {
          key: 'tags',
          data: toObject(tags),
        });

        return {
          folders,
          files,
          tags,
          dark,
        };
      } catch (err) {
        return err;
      }
    },
  },
});
