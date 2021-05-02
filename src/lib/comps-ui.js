import AvatarUi from '~/components/ui/AvatarUi.vue';
import ButtonGroupUi from '~/components/ui/ButtonGroupUi.vue';
import ButtonUi from '~/components/ui/ButtonUi.vue';
import CardUi from '~/components/ui/CardUi.vue';
import IconUi from '~/components/ui/IconUi.vue';
import InputUi from '~/components/ui/InputUi.vue';
import ListItemUi from '~/components/ui/ListItemUi.vue';
import ListUi from '~/components/ui/ListUi.vue';
import ModalUi from '~/components/ui/ModalUi.vue';
import PopoverUi from '~/components/ui/PopoverUi.vue';
import SelectUi from '~/components/ui/SelectUi.vue';
import SpinnerUi from '~/components/ui/SpinnerUi.vue';
import SwitchUi from '~/components/ui/SwitchUi.vue';

import ExpandTransition from '~/components/transitions/ExpandTransition.vue';
import SlideTransition from '~/components/transitions/SlideTransition.vue';

import VAutoresize from '~/directives/VAutoresize';
import VClosePopover from '~/directives/VClosePopover';
import VTooltip from '~/directives/VTooltip';

import '~/assets/css/base/tippy-theme.css';

export default function (app) {
  app.component('AvatarUi', AvatarUi);
  app.component('ButtonGroupUi', ButtonGroupUi);
  app.component('ButtonUi', ButtonUi);
  app.component('CardUi', CardUi);
  app.component('IconUi', IconUi);
  app.component('InputUi', InputUi);
  app.component('ListItemUi', ListItemUi);
  app.component('ListUi', ListUi);
  app.component('ModalUi', ModalUi);
  app.component('PopoverUi', PopoverUi);
  app.component('SelectUi', SelectUi);
  app.component('SpinnerUi', SpinnerUi);
  app.component('SwitchUi', SwitchUi);

  app.component('ExpandTransition', ExpandTransition);
  app.component('SlideTransition', SlideTransition);

  app.directive('autoresize', VAutoresize);
  app.directive('close-popover', VClosePopover);
  app.directive('tooltip', VTooltip);
}
