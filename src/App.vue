<template>
  <div id="app" :class="theme">
    <Header/>
    <Sidebar/>
    <div id="main">
      <router-view></router-view>
    </div>
    <Footer/>
  </div>
</template>

<script>
import Footer from './components/Footer.vue'
import Header from './components/Header.vue'
import Sidebar from './components/Sidebar.vue'
import { mapGetters } from 'vuex';
export default {
  name: 'App',
  components: {
    Header,
    Footer,
    Sidebar
  },
    computed: {
    ...mapGetters({
      theme: 'theme',
      session: 'session',
    })
    },  
  watch: {
    '$route': function() {
      this.$store.dispatch('init')
      this.$store.dispatch('verifySession')
    }
  },created(){
      this.$store.dispatch('init')
      this.$store.dispatch('verifySession')
  }
}
</script>



<style lang="css">
@import "./assets/css/fonts.css";
</style>
<style lang="scss">
@import "./assets/css/breakpoints.scss";
@import "./assets/css/mixins.scss";
@import "./assets/css/general.scss";
</style>