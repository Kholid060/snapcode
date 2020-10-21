import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Folder from '../views/Folder.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    children: [
    	{
    		path: 'folder/:folderId',
    		name: 'folder',
    		component: Folder,
    	},
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
