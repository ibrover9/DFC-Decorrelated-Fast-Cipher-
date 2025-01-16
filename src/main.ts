import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import HomeDfs from './pages/HomeDfs.vue'

const app = createApp(App)

const routes = [
  { path: '/', name: 'Home', component: HomeDfs },
  // { path: '/favorites', name: 'Favorites', component: Favorites }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

app.use(createPinia())
app.use(router)

app.mount('#app')
