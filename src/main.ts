import 'reflect-metadata'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Capacitor } from '@capacitor/core'
import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader'
import { ensureCoreInitialized } from './core'

import App from './ui/App.vue'
import router from './ui/router'
import './ui/styles/global.css'

type WebInitWindow = Window & {
  __workTimeJeepSqliteRegistered?: boolean
}

async function initializeWebJeepSqliteHost(): Promise<void> {
  if (Capacitor.getPlatform() !== 'web') return

  const webWindow = window as WebInitWindow
  if (!customElements.get('jeep-sqlite') && !webWindow.__workTimeJeepSqliteRegistered) {
    await jeepSqlite(window)
    webWindow.__workTimeJeepSqliteRegistered = true
  }

  await customElements.whenDefined('jeep-sqlite')

  let jeepSqliteEl = document.querySelector('jeep-sqlite') as
    | (HTMLElement & { componentOnReady?: () => Promise<unknown> })
    | null

  if (!jeepSqliteEl) {
    jeepSqliteEl = document.createElement('jeep-sqlite') as HTMLElement & {
      componentOnReady?: () => Promise<unknown>
    }
    document.body.appendChild(jeepSqliteEl)
  }

  jeepSqliteEl.setAttribute('wasmpath', '/assets')
  if (typeof jeepSqliteEl.componentOnReady === 'function') {
    await jeepSqliteEl.componentOnReady()
  }
}

await initializeWebJeepSqliteHost()

try {
  await ensureCoreInitialized()
} catch (error) {
  console.error('[Bootstrap] Core initialization failed:', error)
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
