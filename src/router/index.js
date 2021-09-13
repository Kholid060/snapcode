import { createRouter, createWebHistory } from 'vue-router';
import store from '../store';

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/Home/Index.vue'),
    children: [
      {
        path: 'view/:fileId',
        name: 'view',
        component: () => import('../views/Home/View.vue'),
      },
    ],
  },
  {
    path: '/snippet/:fileId',
    name: 'snippet',
    component: () => import('../views/Snippet.vue'),
    meta: {
      hideSidebar: true,
    },
  },
  {
    path: '/auth',
    name: 'auth',
    component: () => import('../views/Auth.vue'),
    meta: {
      hideSidebar: true,
    },
  },
  {
    path: '/explore',
    name: 'explore',
    component: () => import('../views/Explore.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/404.vue'),
    meta: {
      hideSidebar: true,
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.afterEach(() => {
  store.commit('updateState', { key: 'historyState', value: history.state });
});

export default router;
