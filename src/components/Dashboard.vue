<template>
  <div class="dashboard-root">
    <template v-if="fetchingStores">
      <div class="form working fetching-stores" aria-live="polite">
        <h1>Fetching stores details</h1>
        <p>Please wait while we load your stores.</p>
      </div>
    </template>
    <template v-else-if="storesStores?.[0]?.store_id">
      <div class="stores" v-if="!$route.params.storeId10">
        <router-link
          v-for="(store, index) in storesStores"
          :key="store.store_id"
          :class="store.deleted == 1 ? 'store-tile disabled' : 'store-tile active'"
          :style="'animation-delay:' + (index + 1) / 10 + 's;'"
          :to="{ name: 'StoreSummary', params: { storeId10: store.store_id.substring(0, 5) + store.store_id.substring(store.store_id.length - 5) } }"
        >
          <h2>
            <img
              class="store-icon"
              v-if="store.store_logo"
              :src="parseImgSrc(store.store_logo)"
            />
            <span class="store-name-title-text">
              {{ decodeURIComponent(decodeURI(store.store_name)) }}
              <i class="fab fa-bitcoin" v-if="store.network === 'btc'"></i>
              <i class="fab fa-ethereum" v-if="store.network === 'eth'"></i>
            </span>
            <span class="store-flag">
              <i :style="'background: #' + store.store_colour"></i>
              <i :style="'background: #' + store.store_accent_colour"></i>
            </span>
          </h2>
          <span class="store-value">
            <span class="mono">{{ store.sum ? store.sum : '0.00' }}</span>
            <small v-if="store.network" :class="'badge ' + store.network">
              {{ store.network.toUpperCase() }}
            </small>
          </span>
          <span v-if="store.linked_store_name" class="linked-store-badge">
            <i class="fas fa-link"></i> Linked to {{ decodeURIComponent(decodeURI(store.linked_store_name)) }}
          </span>
          <span>{{ store.zpub ? 'External' : 'Internal' }} wallet</span>
          <span :class="'badge active-' + store.deleted">
            {{ store.deleted == 1 ? 'Disabled' : 'Active' }}
          </span>
        </router-link>
      </div>
    </template>
    <template v-else>
      <div class="help-info-block">
        <h1>Let's get you started 🚀</h1>
        <p>To start receiving payments you'll need to create a Store</p>
        <a class="btn" @click="newStore()">
          <i class="fas fa-plus"></i>
          <span class="collapsible">Create Your First Store</span>
        </a>
      </div>
    </template>
    <router-view></router-view>
  </div>
</template>

<script setup>
defineOptions({ name: 'DashboardPage' });

import { onMounted, ref, watch } from 'vue';
import { useMainStore } from '@/stores';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { parseImgSrc } from '@/utils/fn.js';
import { apiUrl } from '@/utils/api';

const store = useMainStore();
const route = useRoute();
const router = useRouter();

const fetchingStores = ref(true);
const storesLoadInFlight = ref(null);

// Use storeToRefs to maintain reactivity when destructuring
const {
  stores: storesStores,
  activeStore,
  storeView,
  user,
  keyiv,
  keyivId,
  fingerprint
} = storeToRefs(store);

const fetchStores = async () => {
  try {
    const username = await store.encrypt({
      string: user.value,
      keyiv: keyiv.value,
    });

    const response = await fetch(apiUrl('/stores'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        fingerprint: fingerprint.value,
        keyivId: keyivId.value,
      }),
    });

    const data = await response.json();

    if (data.proceed && Array.isArray(data.stores)) {
      store.setStores(data.stores);

      if (!storeView.value) {
        store.setStoreView('overview');
      }
      return true;
    } else {
      console.error('Failed to fetch stores');
    }
  } catch (error) {
    console.error('Error:', error);
  }

  return false;
};

const newStore = () => {
  store.setStoreModalView('new');
};

const loadStoresForDashboard = async () => {
  if (storesLoadInFlight.value) {
    return storesLoadInFlight.value;
  }

  storesLoadInFlight.value = (async () => {
    fetchingStores.value = true;
    store.setWorking(true);

    try {
      const sessionValid = await store.verifySession(false);

      if (!sessionValid) {
        if (router.currentRoute.value.name !== 'home') {
          router.push({ name: 'home' });
        }
        return;
      }

      // Keep both independent reads: either successful response updates Pinia.
      await Promise.allSettled([fetchStores(), store.getStores()]);
    } finally {
      store.setWorking(false);
      fetchingStores.value = false;
      storesLoadInFlight.value = null;
    }
  })();

  return storesLoadInFlight.value;
};

onMounted(async () => {
  await loadStoresForDashboard();

  if (!activeStore.value) {
    store.setViewTitle('Dashboard');
  }
});

watch(() => route.name, async (routeName, previousRouteName) => {
  if (routeName === 'dashboard' && previousRouteName && previousRouteName !== 'dashboard') {
    if (!Array.isArray(storesStores.value) || storesStores.value.length === 0) {
      await loadStoresForDashboard();
    }
  }
});
</script>

<style lang="scss">
@import "@/assets/css/dashboard.scss";
@import "@/assets/css/fonts-mono.scss";
.store-tile {
  position: relative;
  z-index: 1;
  margin-bottom: 0;
  padding: 2rem 1rem 1rem 1rem;
  border-radius: 10px;
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
  transition: 200ms ease;
  @keyframes b1 {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &:hover {
    box-shadow: 0 0 0 10px var(--black);

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
  .badge {
    margin-top: auto;
    margin-bottom: 0;
  }
  .store-value {
    display: flex;
    gap: 5px;
  }

  .linked-store-badge {
    color: var(--green-2);
    font-size: .78rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
