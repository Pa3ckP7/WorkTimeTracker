import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './ui/App.vue'
import router from './ui/router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
