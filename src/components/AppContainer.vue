<template>
  <div id="appContainer" :class="theme">
    <Header />
    <Sidebar />

    <div id="main" :class="session ? 'sessioned' : ''">
      <router-view></router-view>
    </div>

    <Footer />
    <ChatWoot />
    <NewStoreModal v-if="session && storeModalView == 'new'"></NewStoreModal>
  </div>
</template>

<script setup>
import Footer from '@/components/Footer.vue'
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'
import ChatWoot from "@/components/ChatWoot.vue"
import NewStoreModal from '@/components/NewStoreModal.vue'
import { useMainStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const store = useMainStore()

// Use storeToRefs to maintain reactivity when destructuring
const { theme, session, storeModalView, viewTitle } = storeToRefs(store)

// Re-check session when navigation changes or the window regains focus.
watch(() => route.fullPath, () => {
  store.verifySession(false)
})

const verifySession = () => {
  store.verifySession(false)
}

const scrollUITriggers = () => {
  const mainElement = document.getElementById("main")
  if (mainElement && mainElement.scrollTop > 80 && viewTitle.value) {
    store.setShowTitle(true)
  } else {
    store.setShowTitle(false)
  }
}

// Lifecycle hooks
onMounted(() => {
  const mainElement = document.getElementById("main")
  if (mainElement) {
    mainElement.addEventListener('scroll', scrollUITriggers)
  }
  window.addEventListener("focus", verifySession)
})

onBeforeUnmount(() => {
  const mainElement = document.getElementById("main")
  if (mainElement) {
    mainElement.removeEventListener('scroll', scrollUITriggers)
  }
  window.removeEventListener("focus", verifySession)
})
</script>
<style lang="scss">
  @import "@/assets/css/breakpoints.scss";
  @import "@/assets/css/mixins.scss";
  @import "@/assets/css/general.scss";
</style>
