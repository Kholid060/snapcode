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
  app.component('avatar-ui', AvatarUi);
  app.component('button-group-ui', ButtonGroupUi);
  app.component('button-ui', ButtonUi);
  app.component('card-ui', CardUi);
  app.component('icon-ui', IconUi);
  app.component('input-ui', InputUi);
  app.component('list-item-ui', ListItemUi);
  app.component('list-ui', ListUi);
  app.component('modal-ui', ModalUi);
  app.component('popover-ui', PopoverUi);
  app.component('select-ui', SelectUi);
  app.component('spinner-ui', SpinnerUi);
  app.component('switch-ui', SwitchUi);

  app.component('expand-transition', ExpandTransition);
  app.component('slide-transition', SlideTransition);

  app.directive('autoresize', VAutoresize);
  app.directive('close-popover', VClosePopover);
  app.directive('tooltip', VTooltip);
}
