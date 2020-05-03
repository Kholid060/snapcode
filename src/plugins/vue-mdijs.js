import Vue from 'vue';
import VMdijs from 'vue-mdijs';
import {
  mdiFolderOutline,
  mdiPlus,
  mdiMagnify,
  mdiChevronDown,
  mdiStarOutline,
  mdiDeleteOutline,
  mdiArchiveOutline,
  mdiClose,
} from '@mdi/js';

VMdijs.add({
  mdiFolderOutline,
  mdiPlus,
  mdiMagnify,
  mdiChevronDown,
  mdiStarOutline,
  mdiDeleteOutline,
  mdiArchiveOutline,
  mdiClose,
});

Vue.use(VMdijs);
