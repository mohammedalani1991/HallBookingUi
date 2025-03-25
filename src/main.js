import { createApp } from 'vue'
import App from './App.vue'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import router from './router'

const app = createApp(App)

app.use(Toast, {
  position: 'top-right',
  timeout: 3000,
  transition: 'Vue-Toastification__fade',
  closeOnClick: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: true,
  pauseOnHover: true,
  newestOnTop: true,
})
app.use(router)
app.mount('#app')
