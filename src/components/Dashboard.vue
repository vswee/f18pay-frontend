<template>
  <div class="dashboard-root">
    <template v-if="stores.length > 0 && stores[0].store_id">
      <div class="stores" v-if="!activeStore">
        <div v-for="(store, index) in stores" :key="store.store_id" :class="store.deleted == 1 ? 'store-tile disabled' : 'store-tile active'" :style="'animation-delay:' + (index + 1) / 10 + 's;'" @click="openStore(store.store_id)">
          <h2>
            <img class="store-icon" v-if="store.store_logo" :src="store.store_logo" />
            <span class="store-name-title-text">{{ decodeURIComponent(decodeURI(store.store_name)) }} <i class="fab fa-bitcoin" v-if="store.network === 'btc'"></i> <i class="fab fa-ethereum" v-if="store.network === 'eth'"></i></span>
            <span class="store-flag">
              <i :style="'background: #' + store.store_colour"></i>
              <i :style="'background: #' + store.store_accent_colour"></i>
            </span>
          </h2>
          <span class="store-value"><span class="mono">{{ store.sum ? store.sum : '0.00' }}</span><small v-if="store.network" :class="'badge ' + store.network">{{ store.network.toUpperCase() }}</small></span>
          <span>{{ store.zpub ? 'External' : 'Internal' }} wallet</span>
          <span :class="'badge active-' + store.deleted">{{ store.deleted == 1 ? 'Disabled' : 'Active' }}</span>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="help-info-block">
        <h1>Let's get you started 🚀</h1>
        <p>To start receiving payments you'll need to create a Store</p>
        <a class="btn" @click="newStore"><i class="fas fa-plus"></i><span class="collapsible">Create Your First Store</span></a>
      </div>
    </template>
    <StoreSummary v-if="activeStore && storeView === 'overview'"></StoreSummary>
    <StoreSettings v-if="activeStore && storeView === 'settings'"></StoreSettings>
    <WalletSettings v-if="activeStore && storeView === 'wallet'"></WalletSettings>
    <StoreAssets v-if="activeStore && storeView === 'buttons'"></StoreAssets>
    <Invoices v-if="activeStore && storeView === 'invoices'"></Invoices>
    <PaymentRequest v-if="activeStore && storeView === 'requests'"></PaymentRequest>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import StoreSummary from '@/components/StoreSummary.vue';
import StoreSettings from '@/components/StoreSettings.vue';
import WalletSettings from '@/components/WalletSettings.vue';
import StoreAssets from '@/components/StoreAssets.vue';
import Invoices from '@/components/Invoices.vue';
import PaymentRequest from '@/components/PaymentRequest.vue';

const store = useStore();

const stores = ref([]);
const invoiceValues = ref(false);
const invoiceValues2 = ref(false);
const invoiceDates = ref(false);
const chartDestroy = ref(false);

const session = computed(() => store.getters.session);
const fingerprint = computed(() => store.getters.fingerprint);
const user = computed(() => store.getters.user);
const keyiv = computed(() => store.getters.keyiv);
const keyivId = computed(() => store.getters.keyivId);
const activeStore = computed(() => store.getters.activeStore);
const storeView = computed(() => store.getters.storeView);
const storeModalView = computed(() => store.getters.storeModalView);

const fetchStores = async () => {
  const username = await store.dispatch('encrypt', {
    string: user.value,
    keyiv: keyiv.value,
  });

  await fetch(import.meta.env.VITE_APPLICATION_ENDPOINT + "/stores", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      fingerprint: fingerprint.value,
      keyivId: keyivId.value,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.proceed) {
        stores.value = data.stores;
        store.commit('setStores', data.stores);
        if (!storeView.value) {
          store.commit('setStoreView', 'overview');
        }
      } else {
        console.error('Failed to fetch stores');
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
};

const openStore = (id) => {
  store.commit('setStoreView', 'overview');
  store.commit('setActiveStore', id);
};

const newStore = () => {
  store.commit('setStoreModalView', 'new');
};

onMounted(() => {
  store.dispatch('getStores');
  if (!activeStore.value) {
    store.commit('setViewTitle', 'Dashboard');
  }

  if (session.value) {
    fetchStores();
  } else {
    console.log('NO SESSION');
    if (store.router.currentRoute.name !== 'home') {
      store.router.push({ name: 'home' });
    }
  }
});
</script>

<style lang="scss">
@import "../assets/css/dashboard.scss";
</style>
<style lang="css">
@import "../assets/css/fonts-mono.css";
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
    content: '';
    height: 6px;
    width: calc(100% - 20px);
    border-radius: 6px;
    position: absolute;
    top: 10px;
    left: 10px;
  }

  &.active::before {
    background: var(--green-2);
  }

  &.disabled::before {
    background: var(--red);
  }

  .mono {
    display: block;
    max-width: 14rem;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
