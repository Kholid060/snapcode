import { AppSidebarItems } from '@/interface/app.interface';
import { defineStore } from 'pinia';

export const useAppStore = defineStore('app-store', () => {
  const activeSidebar = ref<AppSidebarItems>('snippets');

  function setActiveSidebar(value: AppSidebarItems) {
    activeSidebar.value = value;
  }

  return {
    activeSidebar,
    setActiveSidebar,
  };
});
