import { createApp } from 'vue';
import Toast from 'vue-toastification';
import { registerSW } from 'virtual:pwa-register';
import CompsUi from './lib/comps-ui';
import router from './router';
import store from './store';
import App from './App.vue';
import 'vue-toastification/dist/index.css';
import './assets/css/base/tailwind.css';
import './assets/css/base/style.css';
import './assets/css/base/tippy-theme.css';

const app = createApp(App);

registerSW();

app.use(store).use(router).use(CompsUi).use(Toast).mount('#app');
