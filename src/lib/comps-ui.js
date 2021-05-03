import ExpandTransition from '~/components/transitions/ExpandTransition.vue';
import SlideTransition from '~/components/transitions/SlideTransition.vue';
import ListTransition from '~/components/transitions/ListTransition.vue';

import VAutoresize from '~/directives/VAutoresize';
import VClosePopover from '~/directives/VClosePopover';
import VTooltip from '~/directives/VTooltip';

const componentsUi = import.meta.globEager('../components/ui/*.vue');

import '~/assets/css/base/tippy-theme.css';

export default function (app) {
  for (const path in componentsUi) {
    const [fileName] = /[^/]*$/.exec(path);
    const [name] = fileName.split('.');

    app.component(name, componentsUi[path].default);
  }

  app.component('ExpandTransition', ExpandTransition);
  app.component('SlideTransition', SlideTransition);
  app.component('ListTransition', ListTransition);

  app.directive('autoresize', VAutoresize);
  app.directive('close-popover', VClosePopover);
  app.directive('tooltip', VTooltip);
}
