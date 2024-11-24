import { createApp } from 'vue';
import App from './App.vue';
import './assets/css/style.css';
import { migrate } from './db/migrate';
import { createPinia } from 'pinia';

await migrate();

createApp(App).use(createPinia()).mount('#app');
