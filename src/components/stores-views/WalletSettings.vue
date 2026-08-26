<template lang="">
<div :class="working?'store-management no-click':'store-management'">
  <!-- MODAL -->
  <WalletSettingsModal :confirmAddresses="confirmAddresses" :addressesForConfirmation="addressesForConfirmation" :confirmCode="confirmCode" :code="code" :numberOfAddressesToConfirm="numberOfAddressesToConfirm" @setConfirmAddresses="confirmAddresses=false" @setConfirmCode="confirmCode=false" @confirmAddressesMatchWallet="confirmAddressesMatchWallet()" />
  <!-- MODAL -->
  <div :class="working?'form page working':'form page'" @click.stop="_null()">

    <h1><span>Wallet</span><span :class="'badge ' + currentStore.network">{{currentStore.network}}</span><a class="btn" @click="saveSettings()">Save</a></h1>

    <div class="message" v-if="message"><i class="fas fa-exclamation-circle"></i> {{message}}</div>
    <div class="form-section">
      <h2 class="accordian-trigger" @click="accordianIndexSet(0)">{{network=='eth'?'Account ':''}}Address {{network=='btc'?'Derivation':''}} <i :class="accordianIndex==0?'fas fa-caret-down':'fas fa-caret-right'"></i></h2>
      <div class="accordian-sect" v-if="accordianIndex==0">
        <div class="sub-sect" v-if="network=='btc'">
          <label for="storeName">Address Derivation Type</label>
          <div class="switch">
            <a :class="addressDerivationType=='external'?'btn active':'btn'" @click.stop="addressDerivationType='external'">External</a>
            <a :class="addressDerivationType=='internal'?'btn active':'btn'" @click.stop="addressDerivationType='internal'">Internal</a>
          </div>
          <span class="help-text">
            <template v-if="network=='eth'">
              This address will be treated as your primary address for transfering payments and for linking ERC-20 Tokens.
            </template>
            <template v-if="network=='btc'">
              <template v-if="addressDerivationType=='external'">
                Only Native SegWit external wallets are supported. We recommend Electrum or Wasabi Wallet.
              </template>
              <template v-if="addressDerivationType=='internal'">
                Invoice Adresses will be randomly generated. You can sweep them at any time.
              </template>
            </template>
          </span>
        </div>

        <div class="sub-sect" v-if="addressDerivationType=='external'">
          <label for="storeName" v-if="network=='btc'">Native SegWit zpub</label>
          <label for="storeName" v-if="network=='eth'">Ethereum address</label>
          <div class="input-placeholder actionable" v-if="!inputFocus" @click="inputFocus=true">
            {{zpub}} <i v-if="zpub" class="fas fa-check-circle good"></i>
          </div>
          <input v-if="inputFocus" v-model="zpub" type="text" :placeholder="'E.g.' + network=='btc'? 'zpub6nALs1VXMgnQF7eU35PHhB...' : network=='eth'?'0x1d15114cbF4c55c7f001a8b7...' : ''" />
          <span class="help-text" v-if="network=='btc'">For Electrum wallets; Menu > Wallet > Information > Master Public Key.</span>
          <span class="help-text" v-if="network=='eth'">You can use any valid Ethereum address account from your wallet.<br><br>Invoice addresses are generated randomly and you will need to sweep those keys to retrieve your funds.</span>
        </div>
      </div>
      <template v-if="addressDerivationType=='internal' || network=='eth'">
        <h2 class="accordian-trigger" @click="accordianIndexSet(1)">Private Keys <i :class="accordianIndex==1?'fas fa-caret-down':'fas fa-caret-right'"></i></h2>
        <div class="accordian-sect" v-if="accordianIndex==1">

          <div class="sub-sect" v-if="addressDerivationType=='internal' || network=='eth'">
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
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useMainStore } from '@/stores';
import { storeToRefs } from 'pinia';
import WalletSettingsModal from './WalletSettingsModal.vue';

const route = useRoute();
const store = useMainStore();

// Reactive state
const message = ref(false);
const working = ref(false);
const addressDerivationType = ref(false);
const zpub = ref(false);
const accordianIndex = ref(0);
const confirmAddresses = ref(false);
const addressesForConfirmation = ref(false);
const confirmCode = ref(false);
const code = ref('');
const network = ref(false);
const numberOfAddressesToConfirm = ref(false);
const inputFocus = ref(false);

// Store state with storeToRefs for reactivity
const {
  fingerprint,
  user,
  keyiv,
  keyivId,
  stores
} = storeToRefs(store);

// Computed properties
const currentStore = computed(() => {
  let current = false;
  if (stores.value) {
    for (const sto of stores.value) {
      if (`${sto.store_id.substring(0, 5)}${sto.store_id.substring(sto.store_id.length - 5)}` === route.params.storeId10) {
        current = sto;
        break;
      }
    }
    return current;
  }
  return false;
});

// Watchers
watch(addressDerivationType, () => {
  inputFocus.value = false;
});

watch(inputFocus, () => {
  setTimeout(() => {
    const inputElement = document.querySelector("input");
    if (inputElement) {
      inputElement.select();
    }
  }, 200);
});

watch(working, (newValue) => {
  store.setWorking(newValue);
});

watch(currentStore, () => {
  init();
});

// Methods
const init = () => {
  const headerSpace = document.querySelector('.dynamic-cta-header-space');
  if (headerSpace) {
    headerSpace.innerHTML = '';
  }

  zpub.value = currentStore.value.zpub || '';
  network.value = currentStore.value.network || '';
  addressDerivationType.value = currentStore.value.zpub ? 'external' : 'internal';

  // TODO: Implement headerUIAppend in Pinia store if needed
  // store.headerUIAppend([{
  //   id: '#saveButton',
  //   fn: saveSettings,
  // }]);
};

const startRequestForKeys = async () => {
  working.value = true;
  code.value = '';

  try {
    const username = await store.encrypt({
      string: user.value,
      keyiv: keyiv.value
    });

    const storeName = await store.encrypt({
      string: currentStore.value.store_id,
      keyiv: keyiv.value
    });

    const response = await fetch(`${import.meta.env.VITE_APP_APPLICATION_ENDPOINT}/store-management-request-keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        store_id: storeName,
        fingerprint: fingerprint.value,
        keyivId: keyivId.value,
      }),
    });

    const data = await response.json();
    message.value = data.debug ? data.debug : false;

    if (data.proceed === true) {
      if (data.extra === 'confirmCode') {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
        confirmCode.value = true;
      }
    } else {
      message.value = data.debug ? data.debug : "There was a problem with the information provided.";
    }
  } catch (error) {
    message.value = `Error: ${error}`;
    console.error("Error:", error);
  } finally {
    working.value = false;
  }
};

const _null = () => {
  return false;
};

const accordianIndexSet = (number) => {
  accordianIndex.value = accordianIndex.value === number ? -1 : number;
};

const saveSettings = async () => {
  working.value = true;

  try {
    const username = await store.encrypt({
      string: user.value,
      keyiv: keyiv.value
    });

    const encryptedZpub = await store.encrypt({
      string: zpub.value,
      keyiv: keyiv.value
    });

    const response = await fetch(`${import.meta.env.VITE_APP_APPLICATION_ENDPOINT}/store-settings-change-zpub`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        addressDerivationType: addressDerivationType.value,
        zpub: encryptedZpub,
        fingerprint: fingerprint.value,
        keyivId: keyivId.value,
        store_id: currentStore.value.store_id,
      }),
    });

    const data = await response.json();
    message.value = data.debug ? data.debug : false;

    if (data.proceed === true) {
      if (!data.extra && data.currentStore) {
        store.getStores();
        store.setActiveStore(data.currentStore);
      } else if (data.extra === 'confirm-addresses') {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
        confirmAddresses.value = true;
        addressesForConfirmation.value = data.confirmAddresses;
        numberOfAddressesToConfirm.value = data.number;
      }
    } else {
      message.value = data.debug ? data.debug : "There was a problem with the information provided.";
    }
  } catch (error) {
    message.value = `Error: ${error}`;
    console.error("Error:", error);
  } finally {
    working.value = false;
  }
};

const confirmAddressesMatchWallet = async () => {
  working.value = true;

  try {
    const username = await store.encrypt({
      string: user.value,
      keyiv: keyiv.value
    });

    const encryptedZpub = await store.encrypt({
      string: zpub.value,
      keyiv: keyiv.value
    });

    const response = await fetch(`${import.meta.env.VITE_APP_APPLICATION_ENDPOINT}/store-settings-confirm-zpub-addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        addressDerivationType: addressDerivationType.value,
        zpub: encryptedZpub,
        fingerprint: fingerprint.value,
        keyivId: keyivId.value,
        store_id: currentStore.value.store_id,
      }),
    });

    const data = await response.json();
    message.value = data.debug ? data.debug : false;

    if (data.proceed === true) {
      if (!data.extra && data.currentStore) {
        store.getStores();
        store.setActiveStore(data.currentStore);
        confirmAddresses.value = false;
        addressesForConfirmation.value = false;
      } else if (data.extra === 'confirm-addresses') {
        confirmAddresses.value = true;
        addressesForConfirmation.value = data.confirmAddresses;
      }
    } else {
      message.value = data.debug ? data.debug : "There was a problem with the information provided.";
    }
  } catch (error) {
    message.value = `Error: ${error}`;
    console.error("Error:", error);
  } finally {
    working.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  init();
});
</script>

<style lang="">

</style>
