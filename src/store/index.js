import { createStore } from 'vuex';
import VuexORM from '@vuex-orm/core';
import VuexORMLocalForage from 'vuex-orm-localforage';
import * as models from '~/models';

const database = new VuexORM.Database();
Object.keys(models).forEach((name) => {
  database.register(models[name]);
});

VuexORM.use(VuexORMLocalForage, {
  localforage: {
    name: 'snapcode',
  },
  database,
});

const store = createStore({
  plugins: [VuexORM.install(database)],
  state: () => ({
  	searchQuery: '',
    filterBy: 'all',
    showSidebar: false,
  }),
  mutations: {
  	updateState(state, { key, value }) {
  		state[key] = value;
  	},
  },
});

export default store;
