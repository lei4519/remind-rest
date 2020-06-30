import { createApp } from 'vue'
import App from './App.vue'
import router from './route'

const app = createApp(App)
app.use(router)
// Note: on Server Side, you need to manually push the initial location
router.isReady().then(() => app.mount('#app'))
