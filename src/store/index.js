import { createStore } from 'vuex';
import VuexORM from '@vuex-orm/core';
import * as models from '~/models';

const database = new VuexORM.Database();
Object.keys(models).forEach((name) => {
  database.register(models[name]);
});

const store = createStore({
  plugins: [VuexORM.install(database)],
});

export default store;
