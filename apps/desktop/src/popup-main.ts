import { createApp } from 'vue';
import '@/assets/css/style.css';
import AppPopup from './AppPopup.vue';
import { createPinia } from 'pinia';
import documentService from './services/document.service';

await documentService.init();

createApp(AppPopup).use(createPinia()).mount('#app');
