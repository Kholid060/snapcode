import camelCase from 'lodash.camelcase';

const requireModule = require.context('.', false, /\.store\.js$/);
const modules = {};

requireModule.keys().forEach((fileName) => {
  if (fileName === './index.js') return;
  const moduleName = camelCase(fileName.replace(/\.store\.js$/, ''));
  modules[moduleName] = {
    namespaced: true,
    ...requireModule(fileName).default,
  };
});
export default modules;
