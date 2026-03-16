import { createRouter, createWebHistory } from 'vue-router'
import TimerView from '@ui/views/TimerView.vue'
import HistoryView from '@ui/views/HistoryView.vue'
import ExportsView from '@ui/views/ExportsView.vue'
import SettingsView from '@ui/views/SettingsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/timer',
    },
    {
      path: '/timer',
      name: 'timer',
      component: TimerView,
    },
    {
      path: '/history',
      name: 'history',
      component: HistoryView,
    },
    {
      path: '/exports',
      name: 'exports',
      component: ExportsView,
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
    },
  ],
})

export default router
