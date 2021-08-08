import { getCurrentInstance, onMounted, shallowRef } from 'vue';
import { createSingleton } from 'tippy.js';
import createTippy, { defaultOptions } from '../utils/createTippy';

export default function (elements, options = {}) {
  const singleton = shallowRef(null);

  onMounted(() => {
    let tippyInstances = [];

    if (Array.isArray(elements)) {
      tippyInstances = elements.map((el) => el._tippy || createTippy(el));
    } else {
      const ctx = getCurrentInstance() && getCurrentInstance().ctx;

      tippyInstances = ctx._tooltipGroup || [];
    }

    singleton.value = createSingleton(tippyInstances, {
      ...defaultOptions,
      ...options,
      moveTransition: 'transform 0.2s ease-out',
    });
  });

  return singleton;
}
