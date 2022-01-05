<template lang="">
<div id="sidebar" :class="sidebarCollapse?'sidebar':'sidebar collapse'" v-if="session">
  <div class="sidebar-shortcuts">
    <a class="sidebar-shortcut" @click="toggleCollapse()"><i :class="sidebarCollapse?'fas fa-caret-square-left':'fas fa-caret-square-right'"></i><span class="collapsible">{{sidebarCollapse?'Compact':'Expand Sidebar'}}</span></a>
  </div>
  <div class="sidebar-shortcuts">
    <div :class="activeStore==store.store_id?'sidebar-shortcut active':'sidebar-shortcut'" v-for="store in stores" :key="store.store_id" @click="openStore(store.store_id)">
      <span class="store-flag">
        <i :style="'background: #' + store.store_colour"></i>
        <i :style="'background: #' + store.store_accent_colour"></i>
      </span>
      <span class="collapsible">{{decodedString(store.store_name)}} | <i class="fab fa-btc" v-if="store.network==='btc'"></i> <i class="fab fa-ethereum" v-if="store.network==='eth'"></i></span>
    </div>
  </div>
  <div></div>
  <div class="sidebar-shortcuts" v-if="activeStore && activeStore!=='false'">
    <a :class="storeView=='overview'?'sidebar-shortcut active-bar':'sidebar-shortcut'" @click="summaryView()"><i class="fas fa-chart-area"></i><span class="collapsible">Store Overview</span></a>

    <a :class="storeView=='settings'?'sidebar-shortcut active-bar':'sidebar-shortcut'" @click="settingsView()"><i class="fas fa-sliders-h"></i><span class="collapsible">Manage Store</span></a>

    <a :class="storeView=='buttons'?'sidebar-shortcut active-bar':'sidebar-shortcut'" @click="assetsView()"><i class="fas fa-code"></i><span class="collapsible">Payment Assets</span></a>

    <a :class="storeView=='invoices'?'sidebar-shortcut active-bar':'sidebar-shortcut'" @click="invoicesView()"><i class="fas fa-file-invoice"></i><span class="collapsible">Invoices</span></a>

    <a :class="storeView=='requests'?'sidebar-shortcut active-bar':'sidebar-shortcut'" @click="requestsView()"><i class="fas fa-inbox"></i><span class="collapsible">Payment Requests</span></a>
  </div>
  <div></div>
  <div class="sidebar-shortcuts">
    <a class="sidebar-shortcut" @click="newStore()"><i class="fas fa-plus"></i><span class="collapsible">Create New Store</span></a>
  </div>
</div>
</template>

<script>
import {
  mapGetters
} from 'vuex';
export default {
  name: "Sidebar",
  data() {
    return {

    }
  },
  computed: {
    ...mapGetters({
      session: 'session',
      stores: 'stores',
      sidebarCollapse: 'sidebarCollapse',
      activeStore: 'activeStore',
      storeView: 'storeView',
    })
  },
  async created() {
    let session = await this.$store.dispatch('verifySession')
    if (!session) {
      console.log("NO SESSION")
      this.$store.commit("setStores", false);
    }
  },
  mounted(){
    if(document.getElementById("main")){document.documentElement.style.setProperty('--main', document.getElementById("main").getBoundingClientRect().width + "px")}
    if(!this.activeStore && this.activeStore!=='false'){
        this.$store.commit('setActiveStore', false)
      this.$store.commit('setStoreView', false);
      this.$store.commit('setViewTitle', false);
    }
  },
  methods: {
    decodedString(string){
      return decodeURIComponent(decodeURI(string));
    },
    toggleCollapse() {
      this.$store.commit("setSidebarCollapse", !this.sidebarCollapse);
      if(document.getElementById("main")){document.documentElement.style.setProperty('--main', document.getElementById("main").getBoundingClientRect().width + "px")}
    },
    openStore(id) {
      this.$store.commit("setActiveStore", id);
      this.$store.commit("setStoreView", 'overview');
      this.$store.commit("setViewTitle", 'Store Overview');
    },
    summaryView(){
      this.$store.commit("setStoreView", 'overview');
      this.$store.commit("setViewTitle", 'Store Overview');
    },
    settingsView() {
      this.$store.commit("setStoreView", 'settings');
      this.$store.commit("setViewTitle", 'Manage Store');
    },
    assetsView() {
      this.$store.commit("setStoreView", 'buttons');
      this.$store.commit("setViewTitle", 'Payment Assets');
    },
    invoicesView() {
      this.$store.commit("setStoreView", 'invoices');
      this.$store.commit("setViewTitle", 'Invoices');
    },
    requestsView(){
      this.$store.commit("setStoreView", 'requests');
      this.$store.commit("setViewTitle", 'Payment Requests');
    },
    newStore(){
      this.$store.commit("setStoreModalView", 'new');
    },
  }
}
</script>

<style lang="scss">
@import "../assets/css/dashboard.scss";
</style>
