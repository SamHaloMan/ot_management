import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// CoreUI
import CoreuiVue from '@coreui/vue'
import CIcon from '@coreui/icons-vue'
import { iconsSet as icons } from '@/assets/icons'
import '@coreui/coreui/dist/css/coreui.min.css'

import axios from 'axios'
axios.defaults.baseURL = 'http://localhost:1234/v1/api'

const app = createApp(App)

app.use(router)
app.use(store)
app.use(CoreuiVue)
app.component('CIcon', CIcon)
app.provide('icons', icons)

app.mount('#app')
