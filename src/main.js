import { createApp } from 'vue';
import CompsUi from 'comps-ui';
import router from './router';
import store from './store';
import App from './App.vue';
import icons from './lib/icons';
import VAutoresize from './directives/VAutoresize';
import './registerServiceWorker';
import './assets/css/tailwind.css';
import './assets/css/style.css';
import 'comps-ui/dist/style.css';

const app = createApp(App);

app.directive('autoresize', VAutoresize);

app.use(CompsUi, {
  icons,
});
app.use(store);
app.use(router);

app.mount('#app');
