import { createApp } from 'vue';
import Toast from 'vue-toastification';
import CompsUi from './lib/comps-ui';
import router from './router';
import store from './store';
import App from './App.vue';
import './registerServiceWorker';
import 'vue-toastification/dist/index.css';
import './assets/css/base/tailwind.css';
import './assets/css/base/style.css';

const app = createApp(App);

app.use(store);
app.use(CompsUi);
app.use(router);
app.use(Toast);

app.mount('#app');
