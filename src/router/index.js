import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import View from '../views/View.vue';
import Snippet from '../views/Snippet.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    children: [
      {
        path: 'view/:fileId',
        name: 'view',
        component: View,
      },
    ],
  },
  {
    path: '/snippet/:fileId',
    name: 'snippet',
    component: Snippet,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
