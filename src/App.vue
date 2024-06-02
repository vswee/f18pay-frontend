<template>
  <div id="app" :class="theme">
    <Header />
    <Sidebar />
    <div id="main" :class="session ? 'sessioned' : ''">
      <router-view></router-view>
    </div>
    <Footer />
    <ChatWoot />
    <NewStoreModal v-if="session && storeModalView === 'new'" />
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import Footer from './components/Footer.vue';
import Header from './components/Header.vue';
import Sidebar from './components/Sidebar.vue';
import ChatWoot from './components/ChatWoot.vue';
import NewStoreModal from '@/components/NewStoreModal.vue';

const store = useStore();
const route = useRoute();
const router = useRouter()

const theme = computed(() => store.getters.theme);
const session = computed(() => store.getters.session);
const storeModalView = computed(() => store.getters.storeModalView);
const viewTitle = computed(() => store.getters.viewTitle);

const initChecks = async () => {
  await store.dispatch('init');
  await store.dispatch('verifySession', {flag:false, route:route.name, router: router});
};

const verifySession = async () => {
  console.log('verifying session');
  await store.dispatch('verifySession', {flag:false, route:route.name, router: router});
};

const scrollUITriggers = () => {
  if (document.getElementById('main').scrollTop > 80 && viewTitle.value) {
    store.commit('setShowTitle', true);
  } else {
    store.commit('setShowTitle', false);
  }
};

watch(() => route.path, initChecks);

onMounted(() => {
  store.dispatch('init');
  store.dispatch('verifySession', {flag:false, route:route.name, router: router});

  document.getElementById('main').addEventListener('scroll', scrollUITriggers);
  window.addEventListener('focus', verifySession);
});
</script>

<style lang="css">
@import './assets/css/fonts.css';
</style>
<style lang="scss">
@import './assets/css/breakpoints.scss';
@import './assets/css/mixins.scss';
@import './assets/css/general.scss';
</style>