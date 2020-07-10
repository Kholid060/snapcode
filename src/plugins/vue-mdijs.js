import Vue from 'vue';
import VMdijs from 'vue-mdijs';
import {
  mdiFolderOutline,
  mdiPlus,
  mdiMagnify,
  mdiChevronDown,
  mdiStarOutline,
  mdiStar,
  mdiDeleteOutline,
  mdiArchiveOutline,
  mdiClose,
  mdiLabelOutline,
  mdiFile,
  mdiMoonWaningCrescent,
  mdiDotsHorizontal,
  mdiPencil,
  mdiMenu,
  mdiArrowCollapseDown,
} from '@mdi/js';

VMdijs.add({
  mdiFolderOutline,
  mdiPlus,
  mdiMagnify,
  mdiChevronDown,
  mdiStarOutline,
  mdiStar,
  mdiDeleteOutline,
  mdiArchiveOutline,
  mdiClose,
  mdiLabelOutline,
  mdiFile,
  mdiMoonWaningCrescent,
  mdiDotsHorizontal,
  mdiPencil,
  mdiMenu,
  mdiArrowCollapseDown,
});

Vue.use(VMdijs);
