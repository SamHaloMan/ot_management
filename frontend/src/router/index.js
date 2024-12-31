import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'
import OvertimeFormView from '@/views/OvertimeFormView.vue'
import AnalyticsView from '@/views/AnalyticsView.vue'

const routes = [
  {
    path: '/',
    redirect: '/overtime-form'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    meta: { title: 'Dashboard' }
  },
  {
    path: '/overtime-form',
    name: 'OvertimeForm',
    component: OvertimeFormView,
    meta: { title: 'Overtime Form' }
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: AnalyticsView,
    meta: { title: 'Analytics' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router