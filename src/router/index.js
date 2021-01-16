import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home/Index.vue';
import View from '../views/Home/View.vue';
import Snippet from '../views/Snippet.vue';
import Auth from '../views/Auth.vue';
import PageNotFound from '../views/404.vue';

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
  {
    path: '/auth',
    name: 'auth',
    component: Auth,
  },
  {
    path: '/404',
    name: 'not-found',
    component: PageNotFound,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: PageNotFound,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
