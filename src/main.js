import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import CryptoJS from 'crypto-js'
import timeago from 'vue-timeago3'
import { useMainStore } from './stores'
import { getApplicationEndpoint } from './utils/api'
import {
  installDemoFetch,
  seedDemoDashboardState,
  shouldUseDemoMode,
} from './utils/demo'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(CryptoJS)
app.use(timeago)

const store = useMainStore(pinia)
const configuredApplicationEndpoint = String(import.meta.env.VITE_APP_APPLICATION_ENDPOINT || '').replace(/\/+$/, '')
const runtimeApplicationEndpoint = getApplicationEndpoint()
const demoMode = shouldUseDemoMode()

if (
  typeof window !== 'undefined' &&
  configuredApplicationEndpoint &&
  runtimeApplicationEndpoint &&
  configuredApplicationEndpoint !== runtimeApplicationEndpoint
) {
  const originalFetch = window.fetch.bind(window)

  window.fetch = (input, init) => {
    if (typeof input === 'string' && input.startsWith(configuredApplicationEndpoint)) {
      const rewrittenInput = `${runtimeApplicationEndpoint}${input.slice(configuredApplicationEndpoint.length)}`
      return originalFetch(rewrittenInput, init)
    }

    return originalFetch(input, init)
  }
}

if (demoMode) {
  installDemoFetch()
}

const bootstrap = async () => {
  store.init()
  if (demoMode) {
    store.setTheme('dark')
  }

  await router.isReady()

  if (demoMode) {
    const currentRoute = router.currentRoute.value
    if (currentRoute?.path?.startsWith('/dashboard') || currentRoute?.path?.startsWith('/account')) {
      seedDemoDashboardState(store, currentRoute)
    } else {
      store.setSession(false)
      store.setUser(false)
      store.setFingerprint(false)
      store.setKeyivId(false)
      store.setStores(false)
      store.setActiveStore(false)
      store.setStoreView(false)
      store.setViewTitle(false)
      store.setShowTitle(false)
      store.setStoreModalView(false)
      store.setSidebarCollapse(false)
    }
  }

  app.mount('#app')

  void store.verifySession(false)
}

void bootstrap()
