<template lang="">
<div class="dashboard-root">
  <template v-if="stores[0]?.store_id">
    <div class="stores" v-if="!$route.params.storeId10">
      <router-link v-for="(store, index) in stores" :key="store.store_id" :class="store.deleted==1?'store-tile disabled':'store-tile active'" :style="'animation-delay:'+(index+1)/10+'s;'" :to="{ name: 'StoreSummary', params: { storeId10: store.store_id.substring(0, 5) + store.store_id.substring(store.store_id.length - 5) } }">
        <h2>
          <img class="store-icon" v-if="store.store_logo" :src="parseImgSrc(store.store_logo)">
          <span class="store-name-title-text">{{decodeURIComponent(decodeURI(store.store_name))}} <i class="fab fa-bitcoin" v-if="store.network==='btc'"></i> <i class="fab fa-ethereum" v-if="store.network==='eth'"></i></span>
          <span class="store-flag">
            <i :style="'background: #' + store.store_colour"></i>
            <i :style="'background: #' + store.store_accent_colour"></i>
          </span>
        </h2>
        <span class="store-value"><span class="mono">{{store.sum?store.sum:"0.00"}}</span><small v-if="store.network" :class="'badge ' + store.network">{{store.network.toUpperCase()}}</small></span>
        <span>{{store.zpub?'External':'Internal'}} wallet</span>
        <span :class="'badge active-' + store.deleted">{{store.deleted==1?'Disabled':'Active'}}</span>
      </router-link>
    </div>
  </template>
  <template v-else>
    <div class="help-info-block">
      <h1>Let's get you started 🚀</h1>
      <p>To start receiving payments you'll need to create a Store</p>
      <a class="btn" @click="newStore()"><i class="fas fa-plus"></i><span class="collapsible">Create Your First Store</span></a>
    </div>
  </template>
  <router-view></router-view>

  <!-- <StoreSummary v-if="activeStore && storeView=='overview'"></StoreSummary>
  <StoreSettings v-if="activeStore && storeView=='settings'"></StoreSettings>
  <WalletSettings v-if="activeStore && storeView=='wallet'"></WalletSettings>
  <StoreAssets v-if="activeStore && storeView=='buttons'"></StoreAssets>
  <Invoices v-if="activeStore && storeView=='invoices'"></Invoices>
  <PaymentRequest v-if="activeStore && storeView=='requests'"></PaymentRequest> -->
</div>
</template>

<script>
import {
  mapGetters
} from 'vuex';
// import StoreSummary from '@/components/StoreSummary'
// import StoreSettings from '@/components/StoreSettings'
// import WalletSettings from '@/components/WalletSettings'
// import StoreAssets from '@/components/StoreAssets'
// import Invoices from '@/components/Invoices'
// import PaymentRequest from '@/components/PaymentRequest'
import { parseImgSrc} from '@/utils/fn.js'
export default {
  name: "Dashboard",
  components: {
    // StoreSummary,
    // StoreSettings,
    // WalletSettings,
    // StoreAssets,
    // Invoices,
    // PaymentRequest,
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
    }),
    currentRouteName(){return this.$route.name},
  },
  async created() {
    let session = await this.$store.dispatch('verifySession')
    if (!session) {
      console.log("NO SESSION")
      if (this.$router.currentRoute.name !== 'home') {
        this.$router.push({
          name: 'home'
        });
      }
    } else {
      this.fetchStores()
    }

  },
  mounted() {
    this.$store.dispatch('getStores')

    if (!this.activeStore) {
      this.$store.commit("setViewTitle", 'Dashboard');
    }
  },
  methods: {
    parseImgSrc,
    async fetchStores() {
      const username = await this.$store.dispatch('encrypt', {
        string: this.user,
        keyiv: this.keyiv
      });
      await fetch(process.env.VUE_APP_APPLICATION_ENDPOINT + "/stores", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
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
          this.message = this.message + ' \nError: ' + error + '\n';
          console.error("Error:", error);
        });
    },
    async openStore(id) {
      this.$store.commit("setStoreView", 'overview');
      this.$store.commit("setActiveStore", id);
    },
    newStore() {
      this.$store.commit("setStoreModalView", 'new');
    },
  }
}
</script>

<style lang="scss">
@import "@/assets/css/dashboard.scss";
@import "@/assets/css/fonts-mono.scss";
</style>

<style lang="scss">
.store-tile {
  position: relative;
  z-index: 1;
  margin-bottom: 0;
  box-shadow: 0 15px 50px -40px #000;
  padding: 2rem 1rem 1rem 1rem;
  border-radius: 10px;
  transition: ease;
  cursor: pointer;
  background: var(--black);
  max-width: 90vw;
  width: 250px;
  display: grid;
  grid-template-rows: auto auto auto 1fr;
  gap: 10px;
  opacity: 0;
  transform: translateY(10px);
  animation: b1 0.4s ease forwards 1;

  @keyframes b1 {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &:hover {
    box-shadow: 0 5px 15px -10px #000;

    .tooltip {
      animation: build-tooltip 0.1s ease forwards 1;
    }
  }

  &::before {
    content: "";
    height: 6px;
    width: calc(100% - 20px);
    border-radius: 6px;
    position: absolute;
    top: 10px;
    left: 10px;
  }

  &.active {
    &::before {
      background: var(--green-2);
    }
  }

  &.disabled {
    &::before {
      background: var(--red);
    }
  }

  .mono {
    display: block;
    max-width: 14rem;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
