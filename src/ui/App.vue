<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const title = computed(() => {
  switch (route.name) {
    case 'profiles':
      return 'Profiles'
    case 'history':
      return 'History'
    case 'overview':
      return 'Overview'
    case 'profile-timer':
      return 'Profile Timer'
    case 'profile-history':
      return 'Profile History'
    case 'profile-overview':
      return 'Profile Overview'
    case 'settings':
      return 'Settings'
    default:
      return 'WorkTimeTracker'
  }
})

const mainTabs = [
  { to: '/profiles', label: 'Profile' },
  { to: '/history', label: 'History' },
  { to: '/overview', label: 'Overview' },
]

const isProfileDetail = computed(() => route.path.startsWith('/profiles/') && route.path !== '/profiles')

const detailTabs = computed(() => {
  const profileId = String(route.params.profileId ?? '')
  return [
    { to: `/profiles/${profileId}/timer`, label: 'Timer' },
    { to: `/profiles/${profileId}/history`, label: 'History' },
    { to: `/profiles/${profileId}/overview`, label: 'Overview' },
  ]
})

const tabs = computed(() => (isProfileDetail.value ? detailTabs.value : mainTabs))

const transitionDirection = ref<'left' | 'right'>('left')
const touchStartX = ref<number | null>(null)
const touchStartY = ref<number | null>(null)
const theme = ref<'dark' | 'light'>('dark')

const currentTabIndex = computed(() => tabs.value.findIndex((tab) => tab.to === route.path))

const showBackButton = computed(() => isProfileDetail.value)
const showSettingsButton = computed(() => route.name !== 'settings')
const themeIcon = computed(() => (theme.value === 'dark' ? '☀' : '☾'))

function navigateToTab(nextPath: string): void {
  if (nextPath === route.path) return

  const nextIndex = tabs.value.findIndex((tab) => tab.to === nextPath)
  transitionDirection.value = nextIndex > currentTabIndex.value ? 'left' : 'right'
  void router.push(nextPath)
}

function navigateBack(): void {
  void router.push('/profiles')
}

function navigateByDelta(delta: number): void {
  const currentIndex = currentTabIndex.value
  if (currentIndex === -1) return

  const nextIndex = currentIndex + delta
  if (nextIndex < 0 || nextIndex >= tabs.value.length) return

  transitionDirection.value = delta > 0 ? 'left' : 'right'
  void router.push(tabs.value[nextIndex].to)
}

function onTouchStart(event: TouchEvent): void {
  if (event.touches.length !== 1) return
  touchStartX.value = event.touches[0].clientX
  touchStartY.value = event.touches[0].clientY
}

function onTouchEnd(event: TouchEvent): void {
  if (touchStartX.value === null || touchStartY.value === null) return
  if (event.changedTouches.length !== 1) return

  const deltaX = event.changedTouches[0].clientX - touchStartX.value
  const deltaY = event.changedTouches[0].clientY - touchStartY.value

  touchStartX.value = null
  touchStartY.value = null

  const horizontalSwipe = Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2
  if (!horizontalSwipe) return

  if (deltaX < 0) {
    navigateByDelta(1)
    return
  }

  navigateByDelta(-1)
}

function applyTheme(nextTheme: 'dark' | 'light'): void {
  theme.value = nextTheme

  if (nextTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light')
    localStorage.setItem('wtt-theme', 'light')
    return
  }

  document.documentElement.removeAttribute('data-theme')
  localStorage.removeItem('wtt-theme')
}

function toggleTheme(): void {
  applyTheme(theme.value === 'dark' ? 'light' : 'dark')
}

onMounted(() => {
  const savedTheme = localStorage.getItem('wtt-theme')
  if (savedTheme === 'light') {
    applyTheme('light')
    return
  }

  applyTheme('dark')
})
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="header-row">
        <button v-if="showBackButton" class="back-btn btn-soft" @click="navigateBack">←</button>
        <h1>{{ title }}</h1>
        <div class="header-actions">
          <button class="theme-btn btn-soft" :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`" @click="toggleTheme">
            {{ themeIcon }}
          </button>
          <RouterLink v-if="showSettingsButton" to="/settings" class="settings-btn btn-soft" aria-label="Settings">
            ⚙
          </RouterLink>
        </div>
      </div>
      <nav class="tab-bar" aria-label="Top navigation">
        <RouterLink
          v-for="tab in tabs"
          :key="tab.to"
          :to="tab.to"
          class="tab-item"
          active-class="active"
          @click.prevent="navigateToTab(tab.to)"
        >
          {{ tab.label }}
        </RouterLink>
      </nav>
    </header>

    <main class="app-content" @touchstart.passive="onTouchStart" @touchend.passive="onTouchEnd">
      <RouterView v-slot="{ Component }">
        <Transition :name="transitionDirection === 'left' ? 'slide-left' : 'slide-right'" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100dvh;
  display: grid;
  grid-template-rows: auto 1fr;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 5;
  background: color-mix(in srgb, var(--surface), transparent 6%);
  border-bottom: none;
  backdrop-filter: blur(8px);
  padding: 1rem 1rem 0.85rem;
}

.app-header h1 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 800;
}

.header-row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.header-row h1 {
  flex: 1;
}

.header-actions {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.back-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  padding: 0;
  font-size: 1.05rem;
}

.settings-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-size: 1.05rem;
}

.theme-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  padding: 0;
  font-size: 1rem;
}

.app-content {
  padding: 0 1rem 1rem;
  padding-bottom: calc(1.2rem + env(safe-area-inset-bottom));
  max-width: 720px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  overflow-x: hidden;
}

.tab-bar {
  margin-top: 0.8rem;
  margin-left: -1rem;
  margin-right: -1rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  padding: 0.2rem;
  gap: 0;
  border: 1px solid var(--border);
  border-left: none;
  border-right: none;
  border-radius: 0;
  background: var(--surface-soft);
  overflow: hidden;
}

.tab-item {
  position: relative;
  text-align: center;
  text-decoration: none;
  color: var(--text-muted);
  padding: 0.62rem 0.45rem 0.78rem;
  border-radius: 0;
  border: none;
  background: transparent;
  font-weight: 700;
  font-size: 0.9rem;
}

.tab-item + .tab-item {
  border-left: 1px solid var(--border);
}

.tab-item.active {
  color: var(--primary);
  background: transparent;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 6px;
  height: 3px;
  border-radius: 999px;
  background: var(--primary);
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.24s ease, opacity 0.24s ease;
}

.slide-left-enter-from {
  transform: translateX(14px);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-14px);
  opacity: 0;
}

.slide-right-enter-from {
  transform: translateX(-14px);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(14px);
  opacity: 0;
}
</style>
