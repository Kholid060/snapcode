import Vue from 'vue';
import Vuex from 'vuex';
// import shortid from 'shortid';
import faker from 'faker';
import modules from './modules';

Vue.use(Vuex);

export default new Vuex.Store({
  modules,
  mutations: {
    changeEntityData(state, { key, data }) {
      Vue.set(state[key], 'entities', data);
    },
  },
  actions: {
    retrieve({ commit }) {
      return new Promise((resolve) => {
        commit('changeEntityData', {
          key: 'folders',
          data: {
            aaaa1: {
              name: 'my project',
              activeFile: 'aaaa1_1',
            },
            aaaa2: {
              name: 'another project',
              activeFile: '',
            },
          },
        });

        commit('changeEntityData', {
          key: 'tags',
          data: {
            aaaa1: {
              anu1: {
                name: 'project',
              },
              anu2: {
                name: 'javascript',
              },
              anu3: {
                name: 'css',
              },
              anu4: {
                name: 'Vue',
              },
            },
            aaaa2: {},
          },
        });

        commit('changeEntityData', {
          key: 'files',
          data: {
            aaaa1: {
              aaaa1_1: {
                title: faker.random.words(),
                tags: ['anu1', 'anu3'],
                content: 'console.log(func())',
                star: false,
                createDate: Date.now(),
                folderId: 'aaaa1',
              },
              aaaa1_2: {
                title: faker.random.words(),
                tags: ['anu2'],
                content: 'console.log(func())',
                star: false,
                createDate: Date.now(),
                folderId: 'aaaa1',
              },
              aaaa1_3: {
                title: faker.random.words(),
                tags: ['anu2', 'anu3', 'anu4'],
                content: 'console.log(func())',
                star: false,
                createDate: Date.now(),
                folderId: 'aaaa1',
              },
            },
            aaaa2: {},
          },
        });

        resolve();
      });
    },
  },
});
