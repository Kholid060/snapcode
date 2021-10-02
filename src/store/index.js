import { createStore } from 'vuex';
import VuexORM from '@vuex-orm/core';
import VuexORMLocalForage from 'vuex-orm-localforage';
import { File, Folder } from '~/models';
import { auth } from '~/utils/firebase';

const database = new VuexORM.Database();

database.register(File);
database.register(Folder);

VuexORM.use(VuexORMLocalForage, {
  localforage: {
    name: 'snapcode2',
  },
  database,
});

const store = createStore({
  plugins: [VuexORM.install(database)],
  state: () => ({
    user: null,
    nextKey: null,
    filterBy: 'all',
    searchQuery: '',
    snippetsCache: [],
    isRetrieved: false,
    showSidebar: false,
    isDataChanged: false,
    editorSettings: {
      fontSize: 16,
      tabSize: 2,
      keyMap: 'default',
      lineNumbers: true,
      lineWrapping: false,
    },
    lastBackup: Date.now(),
    historyState: history.state || {},
  }),
  getters: {
    getSnippetCache: (state) => (id) => state.snippetsCache.find((item) => item.id === id),
  },
  mutations: {
    updateState(state, { key, value }) {
      state[key] = value;
    },
    addSnippetCache(state, data) {
      state.snippetsCache.push(...data);
    },
  },
  actions: {
    toggleSidebar({ commit, state }) {
      commit('updateState', {
        key: 'showSidebar',
        value: !state.showSidebar,
      });
    },
    async retrieveData({ commit, state }) {
      const isFirstTime = JSON.parse(localStorage.getItem('firstTime'));

      if (isFirstTime === null) {
        await Folder.$create({
          data: {
            name: 'My Folder',
            files: [
              {
                name: 'First snippet',
                code: "console.log('hello world')",
              },
            ],
          },
        });

        localStorage.setItem('firstTime', false);
      } else {
        await Folder.$fetch();
        await File.$fetch();
      }

      commit('updateState', { key: 'user', value: auth.user });

      auth.listen((user) => {
        commit('updateState', { key: 'user', value: user });
      });

      commit('updateState', {
        key: 'isDataChanged',
        value: JSON.parse(localStorage.getItem('isDataChanged')) || false,
      });
      commit('updateState', {
        key: 'lastBackup',
        value: JSON.parse(localStorage.getItem('lastBackup')) || Date.now(),
      });

      const editorSettings = JSON.parse(localStorage.getItem('editor-settings') || '{}');
      commit('updateState', {
        key: 'editorSettings',
        value: { ...state.editorSettings, ...editorSettings },
      });
    },
  },
});

export default store;
