import { createApp } from 'vue';
import App from './App.vue';
import './assets/css/style.css';
import { router } from './router';
import { migrate } from './db/migrate';

await migrate();

createApp(App).use(router).mount('#app');
