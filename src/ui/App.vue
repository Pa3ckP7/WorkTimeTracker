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
  background: color-mix(in srgb, var(--surface), transparent 6%);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(8px);
  padding: 1rem 1rem 0.9rem;
}

.app-header h1 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 800;
}

.app-content {
  padding: 1rem;
  padding-bottom: calc(5.4rem + env(safe-area-inset-bottom));
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
  border-top: 1px solid var(--border);
  background: color-mix(in srgb, var(--surface), transparent 7%);
  backdrop-filter: blur(8px);
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  padding: 0.6rem 0.6rem calc(0.7rem + env(safe-area-inset-bottom));
  gap: 0.35rem;
}

.tab-item {
  text-align: center;
  text-decoration: none;
  color: var(--text-muted);
  padding: 0.6rem 0.45rem;
  border-radius: 999px;
  border: 1px solid transparent;
  font-weight: 700;
  font-size: 0.9rem;
}

.tab-item.active {
  color: var(--primary);
  border-color: color-mix(in srgb, var(--primary), white 65%);
  background: color-mix(in srgb, var(--primary), white 86%);
}
</style>
