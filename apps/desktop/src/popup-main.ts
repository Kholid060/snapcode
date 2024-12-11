import { createApp } from 'vue';
import '@/assets/css/style.css';
import AppPopup from './AppPopup.vue';
import { createPinia } from 'pinia';

createApp(AppPopup).use(createPinia()).mount('#app');
