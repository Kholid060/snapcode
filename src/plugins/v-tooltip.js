import Vue from 'vue';
import VTooltip from 'v-tooltip';
import '~/assets/scss/components/_tooltip.scss';

Vue.use(VTooltip, {
  defaultClass: 'tooltip-ui',
  defaultHtml: true,
  defaultTemplate: '<div class="tooltip-ui" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
  defaultOffset: 10,
  popover: {
    defaultOffset: 10,
    defaultBoundariesElement: 'document.body',
  },
});
