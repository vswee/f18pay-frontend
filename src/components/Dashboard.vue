<template>
  <div class="dashboard-root">
    <template v-if="state.stores.length>0">
      <div class="stores" v-if="!$route.params.storeId10">
        <router-link v-for="(store, index) in state.stores" :key="store.store_id"
          :class="store.deleted == 1 ? 'store-tile disabled' : 'store-tile active'"
          :style="'animation-delay:' + (index + 1) / 10 + 's;'"
          :to="{ name: 'StoreSummary', params: { storeId10: store.store_id.substring(0, 5) + store.store_id.substring(store.store_id.length - 5) } }">
          <h2>
            <img class="store-icon" :src="store.storeLogo">
            <span class="store-name-title-text">{{ decodeURIComponent(decodeURI(store.store_name)) }} <i
                class="fab fa-bitcoin" v-if="store.network === 'btc'"></i> <i class="fab fa-ethereum"
                v-if="store.network === 'eth'"></i></span>
            <span class="store-flag">
              <i :style="'background: #' + store.store_colour"></i>
              <i :style="'background: #' + store.store_accent_colour"></i>
            </span>
          </h2>
          <span class="store-value"><span class="mono">{{ store.sum ? store.sum : "0.00" }}</span><small v-if="store.network"
              :class="'badge ' + store.network">{{ store.network.toUpperCase() }}</small></span>
          <span>{{ store.zpub ? 'External' : 'Internal' }} wallet</span>
          <span :class="'badge active-' + store.deleted">{{ store.deleted == 1 ? 'Disabled' : 'Active' }}</span>
        </router-link>
      </div>
    </template>
    <template v-else>
      <div class="help-info-block">
        <h1>Let's get you started 🚀</h1>
        <p>To start receiving payments you'll need to create a Store</p>
        <a class="btn" @click="newStore"><i class="fas fa-plus"></i><span class="collapsible">Create Your First
            Store</span></a>
      </div>
    </template>
    <router-view></router-view>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';

const store = useStore();
const route = useRoute()
const router = useRouter()

const state = reactive({stores: false,});

const session = computed(() => store.getters.session);
const fingerprint = computed(() => store.getters.fingerprint);
const user = computed(() => store.getters.user);
const keyiv = computed(() => store.getters.keyiv);
const keyivId = computed(() => store.getters.keyivId);
const activeStore = computed(() => store.getters.activeStore);
const storeView = computed(() => store.getters.storeView);
const storeModalView = computed(() => store.getters.storeModalView);
const img = computed(() => store.state.placeholderLogo);

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
        const stores = []
        for (const item of data.stores) {
          let inst = item
          let logo = parseImgSrc(inst.store_logo)
          inst.storeLogo = logo
          stores.push(inst)
        }
        state.stores = stores;
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

const parseImgSrc = (logo) => {
  if(!logo || logo.data.length==0){return img.value}
  let bufferArray = new Uint8Array(logo.data)
  let binary = '';
  const bytes = new Uint8Array(bufferArray);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  let base64String = binary//btoa(btoa(binary))
  let storeLogo = `${base64String}`
  return storeLogo
}

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
    if (route.name !== 'home') {
      router.push({ name: 'Home' });
    }
  }
});
</script>

<style lang="scss">
@import "@/assets/css/dashboard.scss";
</style>
<style lang="css">
@import "@/assets/css/fonts-mono.css";
</style>

<style lang="scss">
.store-tile {
  position: relative;
  z-index: 1;
  margin-bottom: 0;
  // box-shadow: 0 0 0 10px transparent, 0 15px 50px -40px #000;
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
  .badge{
    margin-top: auto;
    margin-bottom: 0;
  }
  .store-value{
    display: flex;
    gap: 5px;
  }
}
</style>
