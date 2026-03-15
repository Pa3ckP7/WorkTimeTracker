import 'reflect-metadata'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Capacitor } from '@capacitor/core'
import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader'
import { initializeCore } from './core'

import App from './ui/App.vue'
import router from './ui/router'

// Initialize jeep-sqlite for web platform
if (Capacitor.getPlatform() === 'web') {
  jeepSqlite(window)
}

try {
  await initializeCore()
} catch (error) {
  console.error('[Bootstrap] Core initialization failed:', error)
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
