import { hideAll } from 'tippy.js';

export default {
  mounted(el, { value = true }) {
    el.addEventListener('click', () => {
      if (value) hideAll();
    });
  },
};
