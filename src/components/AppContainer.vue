<template lang="">
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
<script>
import Footer from '@/components/Footer.vue'
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'
import ChatWoot from "@/components/ChatWoot.vue";
import NewStoreModal from '@/components/NewStoreModal.vue'
import {
  mapGetters
} from 'vuex';
export default {
  components: {
    Header,
    Footer,
    Sidebar,
    NewStoreModal,
    ChatWoot,
  },
  computed: {
    ...mapGetters({
      theme: 'theme',
      session: 'session',
      storeModalView: 'storeModalView',
      viewTitle: 'viewTitle',
    })
  },
  watch: {
    '$route': function () { this.initChecks() }
  },
  async created() {
    this.$store.dispatch('init')
    this.$store.dispatch('verifySession', false)
  },
  mounted() {
    document.getElementById("main").addEventListener('scroll', this.scrollUITriggers);
    let t = this
    window.addEventListener("focus", t.verifySession)
  },
  methods: {
    async initChecks() {
      this.$store.dispatch('init')
      this.$store.dispatch('verifySession', false)
    },
    verifySession() {
      console.log("verifying session")
      this.$store.dispatch('verifySession', false)
    },
    scrollUITriggers() {
      if (document.getElementById("main").scrollTop > 80 && this.viewTitle) {
        this.$store.commit('setShowTitle', true);
      } else {
        this.$store.commit('setShowTitle', false);
      }
    },
  }
}
</script>
<style lang="scss">
  @import "@/assets/css/breakpoints.scss";
  @import "@/assets/css/mixins.scss";
  @import "@/assets/css/general.scss";
</style>