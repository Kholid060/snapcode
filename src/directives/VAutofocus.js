import Vue from 'vue';

Vue.directive('autofocus', {
  inserted(el, { value = true }) {
    if (!value) return;

    el.focus();
  },
});
