import {
  SpinnerUi,
  IconUi,
  ButtonUi,
  ListItemUi,
  ListUi,
  SelectUi,
  AvatarUi,
  PopoverUi,
  ModalUi,
  ButtonGroupUi,
  SwitchUi,
  SlideTransition,
  ExpandTransition,
  VTooltip,
  VClosePopover,
  addIcon,
} from 'comps-ui';
import icons from './icons';

export default {
  install(app) {
    addIcon(icons);

	  app.use(SpinnerUi);
	  app.use(IconUi);
	  app.use(ButtonUi);
	  app.use(ListItemUi);
	  app.use(ListUi);
	  app.use(SelectUi);
	  app.use(AvatarUi);
	  app.use(PopoverUi);
	  app.use(ModalUi);
	  app.use(ButtonGroupUi);
	  app.use(SwitchUi);
	  app.use(SlideTransition);
	  app.use(ExpandTransition);
	  
	  app.directive('tooltip', VTooltip);
	  app.directive('close-popover', VClosePopover);
  },
};
