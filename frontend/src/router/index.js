import { createRouter, createWebHistory } from 'vue-router';

import DefaultLayout from '@/layouts/DefaultLayout.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: DefaultLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/pages/DashboardView.vue'),
      },
    ],
  },
  {
    path: '/overtime',
    name: 'Overtime',
    component: DefaultLayout,
    redirect: '/overtime/form',
    children: [
      {
        path: 'form',
        name: 'OvertimeForm',
        component: () => import('@/components//OvertimeForm.vue'),
      },
      {
        path: 'history',
        name: 'OvertimeHistory',
        component: () => import('@/components/OvertimeHistory.vue'),
      },
      {
        path: 'analytics',
        name: 'OvertimeAnalytics',
        component: () => import('@/views/pages/OvertimeAnalyticsView.vue'),
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'Page404',
    component: () => import('@/views/pages/Error404View.vue'),
  },
];

const router = createRouter({
  history: createWebHistory("/"),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
