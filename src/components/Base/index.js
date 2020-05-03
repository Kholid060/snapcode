import Vue from 'vue';

const requireComponent = require.context(
  // The relative path of the components folder
  './',
  // Whether or not to look in subfolders
  false,
  // The regular expression used to match base component filenames
  /Base[A-Z]\w+\.(vue)$/,
);
requireComponent.keys().forEach((fileName) => {
  const componentConfig = requireComponent(fileName);

  Vue.component(
    componentConfig.default.name,
    // Look for the component options on `.default`, which will
    // exist if the component was exported with `export default`,
    // otherwise fall back to module's root.
    componentConfig.default || componentConfig,
  );
});
