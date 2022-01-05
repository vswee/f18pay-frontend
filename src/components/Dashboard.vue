<template lang="">
<div>
  <div class="stores" v-if="!activeStore || activeStore==='false'">
    <div v-for="store in stores" :key="store.store_id" :class="store.deleted==1?'store-tile disabled':'store-tile active'" @click="openStore(store.store_id)">
      <h2>
        <img class="store-icon" v-if="store.store_logo" :src="store.store_logo">
        <span class="store-name-title-text">{{decodeURIComponent(decodeURI(store.store_name))}} <i class="fab fa-bitcoin" v-if="store.network==='btc'"></i> <i class="fab fa-ethereum" v-if="store.network==='eth'"></i></span>
        <span class="store-flag">
          <i :style="'background: #' + store.store_colour"></i>
          <i :style="'background: #' + store.store_accent_colour"></i>
        </span>
      </h2>
      <span class="store-value"><span class="mono">{{store.sum?store.sum:"0.00"}}</span><small>{{store.network.toUpperCase()}}</small></span>
      <span>{{store.zpub?'External':'Internal'}} wallet</span>
      <span>{{store.deleted==1?'Disabled':'Active'}}</span>
    </div>
  </div>
  <StoreSummary v-if="activeStore && storeView=='overview'"></StoreSummary>
  <StoreSettings v-if="activeStore && storeView=='settings'"></StoreSettings>
  <StoreAssets v-if="activeStore && storeView=='buttons'"></StoreAssets>
  <Invoices v-if="activeStore && storeView=='invoices'"></Invoices>
  <PaymentRequest v-if="activeStore && storeView=='requests'"></PaymentRequest>
</div>
</template>

<script>
import {
  mapGetters
} from 'vuex';
import StoreSummary from '@/components/StoreSummary'
import StoreSettings from '@/components/StoreSettings'
import StoreAssets from '@/components/StoreAssets'
import Invoices from '@/components/Invoices'
import PaymentRequest from '@/components/PaymentRequest'
export default {
  name: "Dashboard",
  components: {
    StoreSummary,
    StoreSettings,
    StoreAssets,
    Invoices,
    PaymentRequest,
  },
  data() {
    return {
      stores: [],
      invoice_values: false,
      invoice_values2: false,
      invoice_dates: false,
      chartDestroy: false,
    }
  },
  computed: {
    ...mapGetters({
      session: 'session',
      fingerprint: 'fingerprint',
      user: 'user',
      keyiv: 'keyiv',
      keyivId: 'keyivId',
      activeStore: 'activeStore',
      storeView: 'storeView',
      storeModalView: 'storeModalView',
    })
  },
  async created() {
    let session = await this.$store.dispatch('verifySession')
    if (!session) {
      console.log("NO SESSION")
      this.$router.push({
        name: 'home'
      });
    } else {
      this.fetchStores()
    }
    window.addEventListener('scroll', this.scrollUITriggers);
  },
  mounted(){
      
    if(!this.activeStore){this.$store.commit("setViewTitle", 'Dashboard');}
  },
  methods: {
    scrollUITriggers() {
      if (window.scrollY>80) {
        this.$store.commit('setShowTitle', true);
      } else {
        this.$store.commit('setShowTitle', false);
      }
    },
    async fetchStores() {
      const username = await this.$store.dispatch('encrypt', {
        string: this.user,
        keyiv: this.keyiv
      });
      await fetch("https://money-api.flat18.co.uk/stores", {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          body: JSON.stringify({
            username: username,
            fingerprint: this.fingerprint,
            keyivId: this.keyivId
          }),
        })
        .then((response) => response.json())
        .then((data) => {
          this.message = data.debug ? data.debug : false
          if (data.proceed == true) {
            //HANDLE STORES DATA
            this.stores = data.stores
            this.$store.commit("setStores", data.stores);
            if (!this.storeView) {
              this.$store.commit("setStoreView", 'overview');
            }
          } else {
            this.message = "Failed to fetch stores"
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
    async openStore(id) {
      this.$store.commit("setStoreView", 'overview');
      this.$store.commit("setActiveStore", id);
    },
  }
}
</script>

<style lang="scss">
@import "../assets/css/dashboard.scss";
</style>
<style lang="css">
@import "../assets/css/fonts-mono.css";
</style>
