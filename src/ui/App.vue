<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute()

const title = computed(() => {
  switch (route.name) {
    case 'timer':
      return 'Timer'
    case 'history':
      return 'History'
    case 'exports':
      return 'PDF Exports'
    case 'settings':
      return 'Settings'
    default:
      return 'WorkTimeTracker'
  }
})

const tabs = [
  { to: '/timer', label: 'Timer' },
  { to: '/history', label: 'History' },
  { to: '/exports', label: 'Exports' },
  { to: '/settings', label: 'Settings' },
]
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <h1>{{ title }}</h1>
    </header>

    <main class="app-content">
      <RouterView />
    </main>

    <nav class="tab-bar" aria-label="Bottom navigation">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="tab-item"
        active-class="active"
      >
        {{ tab.label }}
      </RouterLink>
    </nav>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100dvh;
  display: grid;
  grid-template-rows: auto 1fr auto;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 5;
  background: inherit;
  border-bottom: 1px solid;
  padding: 1rem;
}

.app-header h1 {
  margin: 0;
  font-size: 1.15rem;
}

.app-content {
  padding: 1rem;
  padding-bottom: calc(5rem + env(safe-area-inset-bottom));
  max-width: 720px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  border-top: 1px solid;
  background: inherit;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  padding: 0.5rem 0.5rem calc(0.5rem + env(safe-area-inset-bottom));
  gap: 0.35rem;
}

.tab-item {
  text-align: center;
  text-decoration: none;
  color: inherit;
  padding: 0.55rem 0.45rem;
  border-radius: 0.65rem;
  border: 1px solid transparent;
  font-weight: 500;
}

.tab-item.active {
  border-color: currentColor;
  font-weight: 700;
}
</style>
