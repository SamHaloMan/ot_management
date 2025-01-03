import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import stores from './stores'

// CoreUI
import CoreuiVue from '@coreui/vue'
import CIcon from '@coreui/icons-vue'
import { iconsSet as icons } from '@/assets/icons'
import '@coreui/coreui/dist/css/coreui.min.css'

import axios from 'axios'
axios.defaults.baseURL = import.meta.env.VITE_APP_API_BASE_URL || 'http://localhost:1234/v1/api/'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(stores)
app.use(CoreuiVue)
app.provide('icons', icons)
app.component('CIcon', CIcon)

app.mount('#app')