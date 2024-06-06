import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import CryptoJS from 'crypto-js'
import timeago from 'vue-timeago3'

const app = createApp(App)

// app.config.globalProperties.$crypto = CryptoJS

app.use(router)
app.use(store)
app.use(CryptoJS)
app.use(timeago)
app.mount('#app')

store.dispatch('init')
store.dispatch('ui')
