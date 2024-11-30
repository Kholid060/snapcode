import { createApp } from 'vue';
import App from './App.vue';
import './assets/css/style.css';
import { migrate } from './db/migrate';
import { createPinia } from 'pinia';
import { attachConsole } from '@tauri-apps/plugin-log';

await migrate();

if (import.meta.env.DEV) {
  await attachConsole();
}

createApp(App).use(createPinia()).mount('#app');
