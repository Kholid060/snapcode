import Vue from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';

// (S)CSS
import '~/assets/css/tailwind.css';
import '~/assets/scss/base/theme.scss';
import '~/assets/scss/style.scss';

// Base Components
import '~/components/Base';

// Directives
import '~/directives/VAutofocus';

// Plugins
import '~/plugins/vue-mdijs';
import '~/plugins/v-tooltip';
import '~/plugins/vue-js-modal';

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
