<template>
  <div :class="working ? 'store-management no-click' : 'store-management'">
    <!-- MODAL -->
    <WalletSettingsModal
      :confirmAddresses="confirmAddresses"
      :addressesForConfirmation="addressesForConfirmation"
      :confirmCode="confirmCode"
      :code="code"
      :currentStore="currentStore"
      :numberOfAddressesToConfirm="numberOfAddressesToConfirm"
      @setConfirmAddresses="confirmAddresses=false"
      @setConfirmCode="confirmCode=false"
      @confirmAddressesMatchWallet="confirmAddressesMatchWallet()"
    />
    <!-- MODAL -->
    <div :class="working ? 'form page working' : 'form page'" @click.stop="_null()">

      <h1>
        <span>Wallet</span>
        <span :class="'badge ' + currentStore.network">{{ currentStore.network }}</span>
        <a class="btn" @click="saveSettings()">Save</a>
      </h1>

      <div class="message" v-if="message">
        <i class="fas fa-exclamation-circle"></i> {{ message }}
      </div>

      <div class="form-section">
        <h2 class="accordian-trigger" @click="accordianIndex=0">
          {{ currentStore.network  == 'eth' ? 'Account ' : '' }}Address {{ currentStore.network  == 'btc' ? 'Derivation' : '' }}
          <i :class="accordianIndex == 0 ? 'fas fa-caret-down' : 'fas fa-caret-right'"></i>
        </h2>

        <div class="accordian-sect" v-if="accordianIndex == 0">
          <div class="sub-sect" v-if="currentStore.network  == 'btc'">
            <label for="storeName">Address Derivation Type</label>
            <div class="switch">
              <a :class="addressDerivationType == 'external' ? 'btn active' : 'btn'" @click.stop="addressDerivationType = 'external'">External</a>
              <a :class="addressDerivationType == 'internal' ? 'btn active' : 'btn'" @click.stop="addressDerivationType = 'internal'">Internal</a>
            </div>
            <span class="help-text">
              <template v-if="currentStore.network  == 'eth'">
                This address will be treated as your primary address for transferring payments and for linking ERC-20 Tokens.
              </template>
              <template v-if="currentStore.network  == 'btc'">
                <template v-if="addressDerivationType == 'external'">
                  Only Native SegWit external wallets are supported. We recommend Electrum or Wasabi Wallet.
                </template>
                <template v-if="addressDerivationType == 'internal'">
                  Invoice Addresses will be randomly generated. You can sweep them at any time.
                </template>
              </template>
            </span>
          </div>

          <div class="sub-sect" v-if="addressDerivationType == 'external'">
            <label v-if="currentStore.network  == 'btc'" for="storeName">Native SegWit zpub</label>
            <label v-if="currentStore.network  == 'eth'" for="storeName">Ethereum address</label>
            <div class="input-placeholder actionable" v-if="!inputFocus" @click="inputFocus = true">
              {{ zpub }} <i v-if="zpub" class="fas fa-check-circle good"></i>
            </div>
            <input v-if="inputFocus" v-model="zpub" type="text" :placeholder="'E.g.' + (currentStore.network  == 'btc' ? 'zpub6nALs1VXMgnQF7eU35PHhB...' : (currentStore.network  == 'eth' ? '0x1d15114cbF4c55c7f001a8b7...' : ''))" />
            <span class="help-text" v-if="currentStore.network  == 'btc'">For Electrum wallets; Menu > Wallet > Information > Master Public Key.</span>
            <span class="help-text" v-if="currentStore.network  == 'eth'">You can use any valid Ethereum address account from your wallet.<br><br>Invoice addresses are generated randomly and you will need to sweep those keys to retrieve your funds.</span>
          </div>
        </div>

        <template v-if="addressDerivationType == 'internal' || currentStore.network  == 'eth'">
          <h2 class="accordian-trigger" @click="accordianIndex=1">Private Keys <i :class="accordianIndex == 1 ? 'fas fa-caret-down' : 'fas fa-caret-right'"></i></h2>
          <div class="accordian-sect" v-if="accordianIndex == 1">
            <div class="sub-sect" v-if="addressDerivationType == 'internal' || currentStore.network  == 'eth'">
              <label for="">Internal wallet keys</label>
              <a class="btn severe" style="margin-right: auto;" @click="startRequestForKeys()"><i class="fas fa-download"></i> Request Keys Download</a>
              <span class="help-text">Download the keys for your Store Invoices so you can manage funds in an external wallet.</span>
            </div>
          </div>
        </template>

        <div class="flex">
          <a class="btn" id="saveButton" @click="saveSettings()">Save</a>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import WalletSettingsModal from './WalletSettingsModal.vue';
import {useRoute} from 'vue-router'

// Vuex store
const store = useStore();
const route = useRoute()

// Computed properties
const currentStore = computed(() => {
  let current = false;
  for (const sto of store.getters.stores) {
    if (`${sto.store_id.substring(0,5)}${sto.store_id.substring(sto.store_id.length-5)}` === route.params.storeId10) {
      current = sto;
      break;
    }
  }
  return current;
});
// Reactive state
const message = ref(false);
const working = ref(false);
const addressDerivationType = ref(currentStore.value.zpub?'external':'internal');
const zpub = ref(currentStore.value.zpub);
const accordianIndex = ref(0);
const confirmAddresses = ref(false);
const addressesForConfirmation = ref(false);
const confirmCode = ref(false);
const code = ref('');
const numberOfAddressesToConfirm = ref(false);
const inputFocus = ref(false);


// Watchers
const inputFocusHandler = () => {
  inputFocus.value = false;
};

const inputFocusTimeout = () => {
  setTimeout(() => {
    document.querySelector("input").select()
  }, 200);
};

// Methods
const saveSettings = async () => {
  working.value = true;
  const username = await store.dispatch('encrypt', { string: store.getters.user, keyiv: store.getters.keyiv });
  const zpubEncrypted = await store.dispatch('encrypt', { string: zpub.value, keyiv: store.getters.keyiv });
  await fetch(import.meta.env.VITE_APPLICATION_ENDPOINT + "/store-settings-change-zpub", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: username,
      addressDerivationType: addressDerivationType.value,
      zpub: zpubEncrypted,
      fingerprint: store.getters.fingerprint,
      keyivId: store.getters.keyivId,
      store_id: currentStore.value.store_id,
    }),
  })
  .then((response) => response.json())
  .then((data) => {
    message.value = data.debug ? data.debug : false;
    if (data.proceed == true) {
      if (!data.extra && data.currentStore) {
        store.dispatch('getStores');
        store.commit("setActiveStore", data.currentStore);
      } else if (data.extra == 'confirm-addresses') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        confirmAddresses.value = true;
        addressesForConfirmation.value = data.confirmAddresses;
        numberOfAddressesToConfirm.value = data.number;
      }
    } else {
      message.value = data.debug ? data.debug : "There was a problem with the information provided.";
    }
    working.value = false;
  })
  .catch((error) => {
    message.value = message.value + ' \nError: ' + error + '\n';
    console.error("Error:", error);
  });
};

const startRequestForKeys = async () => {
  working.value = true;
  code.value = '';
  const username = await store.dispatch('encrypt', { string: store.getters.user, keyiv: store.getters.keyiv });
  const storeName = await store.dispatch('encrypt', { string: currentStore.value.store_id, keyiv: store.getters.keyiv });
  await fetch(import.meta.env.VITE_APPLICATION_ENDPOINT + "/store-management-request-keys", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: username,
      store_id: storeName,
      fingerprint: store.getters.fingerprint,
      keyivId: store.getters.keyivId,
    }),
  })
  .then((response) => response.json())
  .then((data) => {
    message.value = data.debug ? data.debug : false;
    if (data.proceed == true) {
      if (data.extra == 'confirmCode') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        confirmCode.value = true;
      }
    } else {
      message.value = data.debug ? data.debug : "There was a problem with the information provided.";
    }
    working.value = false;
  })
  .catch((error) => {
    message.value = message.value + ' \nError: ' + error + '\n';
    console.error("Error:", error);
  });
};

const confirmAddressesMatchWallet = async () => {
  working.value = true;
  const username = await store.dispatch('encrypt', { string: store.getters.user, keyiv: store.getters.keyiv });
  const zpubEncrypted = await store.dispatch('encrypt', { string: zpub.value, keyiv: store.getters.keyiv });
  await fetch(import.meta.env.VITE_APPLICATION_ENDPOINT + "/store-settings-confirm-zpub-addresses", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: username,
      addressDerivationType: addressDerivationType.value,
      zpub: zpubEncrypted,
      fingerprint: store.getters.fingerprint,
      keyivId: store.getters.keyivId,
      store_id: currentStore.value.store_id,
    }),
  })
  .then((response) => response.json())
  .then((data) => {
    message.value = data.debug ? data.debug : false;
    if (data.proceed == true) {
      if (!data.extra && data.currentStore) {
        store.dispatch('getStores');
        store.commit("setActiveStore", data.currentStore);
        confirmAddresses.value = false;
        addressesForConfirmation.value = false;
      } else if (data.extra == 'confirm-addresses') {
        confirmAddresses.value = true;
        addressesForConfirmation.value = data.confirmAddresses;
      }
    } else {
      message.value = data.debug ? data.debug : "There was a problem with the information provided.";
    }
    working.value = false;
  })
  .catch((error) => {
    message.value = message.value + ' \nError: ' + error + '\n';
    console.error("Error:", error);
  });
};

const _null = () => false;

</script>


<style scoped>
  /* Add your styles here */
</style>
