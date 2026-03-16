import { createRouter, createWebHistory } from 'vue-router'
import ProfilesView from '@ui/views/ProfilesView.vue'
import HistoryView from '@ui/views/HistoryView.vue'
import ExportsView from '@ui/views/ExportsView.vue'
import SettingsView from '@ui/views/SettingsView.vue'
import ProfileTimerView from '@ui/views/ProfileTimerView.vue'
import ProfileHistoryView from '@ui/views/ProfileHistoryView.vue'
import ProfileOverviewView from '@ui/views/ProfileOverviewView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/profiles',
    },
    {
      path: '/profiles',
      name: 'profiles',
      component: ProfilesView,
    },
    {
      path: '/history',
      name: 'history',
      component: HistoryView,
    },
    {
      path: '/overview',
      name: 'overview',
      component: ExportsView,
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
    },
    {
      path: '/profiles/:profileId',
      redirect: (to) => `/profiles/${to.params.profileId}/timer`,
    },
    {
      path: '/profiles/:profileId/timer',
      name: 'profile-timer',
      component: ProfileTimerView,
    },
    {
      path: '/profiles/:profileId/history',
      name: 'profile-history',
      component: ProfileHistoryView,
    },
    {
      path: '/profiles/:profileId/overview',
      name: 'profile-overview',
      component: ProfileOverviewView,
    },
  ],
})

export default router
