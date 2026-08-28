<template lang="">
<div class="modal" @click="closeModal()">
  <div class="modal-input">
    <div class="form" @click.stop="">
      <h1>Create New Store</h1>
      <div class="message" v-if="message"><i class="fas fa-exclamation-circle"></i> {{message}}</div>
      <div class="form-section" v-if="!storeNameConfirmed">
        <div class="sub-sect compact">
          <label for="storeName">Store Name</label>
          <input v-model="storeName" type="text" placeholder="E.g. Donations" />
          <span class="help-text">This name will appear on invoices, financial reports and on the F18 Pay Dashboard.</span>
        </div>
        <div class="sub-sect compact">
          <label for="storeName">Store Type: <span :class="'badge ' + storeType">{{storeType}}</span></label>
          <div class="switch">
            <a :class="storeType=='btc'?'btn active':'btn'" @click.stop="storeType='btc'"><i class="fab fa-bitcoin"></i> Bitcoin</a>
            <a :class="storeType=='eth'?'btn active':'btn'" @click.stop="storeType='eth'"><i class="fab fa-ethereum"></i> Ethereum</a>
          </div>
          <span class="help-text">A F18 Pay Store can collect either Bitcoin or Ethereum only. To enable your payees to choose between BTC and ETH (including ERC-20 Tokens) you should create multiple stores and setup currency-switching in the store settings.</span>
        </div>
        <div class="flex">
          <a class="btn sec" @click.stop="closeModal()"><i class="fas fa-arrow-left"></i>Cancel</a>
          <a class="btn" @click.stop="!working && (checkStoreName())">Next<i class="fas fa-arrow-right"></i></a>
        </div>
      </div>

      <template v-if="storeType=='btc'">
        <div class="form-section" v-if="storeNameConfirmed && zpubOptions && !collectZpub && !confirmAddresses">
          <div class="sub-sect compact">
            <label for="storeName">Address Derivation</label>
            <div class="switch">
              <a :class="addressDerivationType=='external'?'btn active':'btn'" @click.stop="addressDerivationType='external'">External</a>
              <a :class="addressDerivationType=='internal'?'btn active':'btn'" @click.stop="addressDerivationType='internal'">Internal</a>
            </div>
            <span class="help-text">You can use your own (external) wallet with F18 Pay as long as the addresses are Native SegWit.<br>If you'd like to use randomly generated addresses for your store invoices choose 'Internal' and we'll generate key pairs which you can sweep at any time.</span>
          </div>
          <div class="flex">
            <a class="btn sec" @click.stop="backToStart()"><i class="fas fa-arrow-left"></i>Back</a>
            <a class="btn" @click.stop="!working && (setAddressDerivationType())">Next<i class="fas fa-arrow-right"></i></a></div>
        </div>

        <div class="form-section" v-if="storeNameConfirmed && zpubOptions && collectZpub && !confirmAddresses">
          <div class="sub-sect compact">
            <label for="storeName">Native SegWit zpub</label>
            <input v-model="zpub" type="text" placeholder="E.g. zpub6nALs1VXMgnQF7eU35PHhB..." />
            <span class="help-text">For Electrum wallets; Menu > Wallet > Information > Master Public Key.</span>
          </div>
          <div class="sub-sect compact">
            <span class="help-text">F18 Pay will <b>only</b> be able to generate addresses and check balances for your wallet.<br>We recommend that you use a dedicated wallet for F18 Pay to avoid untracked transactions on your addresses.</span>
          </div>
          <div class="flex">
            <a class="btn sec" @click.stop="collectZpub=false"><i class="fas fa-arrow-left"></i>Back</a>
            <a class="btn" @click.stop="!working && (submitZpub())">Next<i class="fas fa-arrow-right"></i></a>
          </div>
        </div>

        <div class="form-section" v-if="storeNameConfirmed && zpubOptions && collectZpub && confirmAddresses">
          <div class="sub-sect compact">
            <label for="storeName">Wallet Addresses</label>
            <ol>
              <li v-for="(address, key) in confirmAddresses" :key="key">{{address}}</li>
            </ol>
            <span class="help-text"></span>
          </div>
          <div class="sub-sect compact">
            <span class="help-text">Confirm that the addresses above match the <b>first 10</b> addresses on your wallet.<br>For Wasabi wallet, you may need to generate 10 addresses manually (under the 'receive' tab).</span>
          </div>
          <div class="flex">
            <a class="btn sec" @click.stop="confirmAddresses=false"><i class="fas fa-arrow-left"></i></a>
            <a class="btn" @click.stop="!working && (confirmAddressesMatchWallet())">Confirm Addresses<i class="fas fa-arrow-right"></i></a>
          </div>
        </div>
      </template>

      <template v-if="storeType=='eth'">
        <div class="form-section" v-if="storeNameConfirmed && zpubOptions">
          <div class="sub-sect compact">
            <label for="storeName">Ethereum Account Address</label>
            <input v-model="zpub" type="text" placeholder="E.g. 0x1d15114cbF4c55c7f001a8b7..." />
            <span class="help-text">You can use any valid Ethereum address account from your wallet.</span>
          </div>
          <div class="flex">
            <a class="btn sec" @click.stop="storeNameConfirmed=false"><i class="fas fa-arrow-left"></i>Back</a>
            <a class="btn" @click.stop="!working && (submitZpub())">Finish<i class="fas fa-arrow-right"></i></a>
          </div>
        </div>
      </template>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, onBeforeMount, watch } from 'vue';
import { useMainStore } from '@/stores';
import { storeToRefs } from 'pinia';

// Reactive state
const working = ref(false);
const message = ref(false);
const storeNameConfirmed = ref(false);
const storeName = ref('');
const storeType = ref('btc');
const zpub = ref('');
const collectZpub = ref(false);
const addressDerivationType = ref('external');
const confirmAddresses = ref(false);
const zpubOptions = ref(false);

// Store state with storeToRefs for reactivity
const store = useMainStore();
const { fingerprint, user, keyiv, keyivId } = storeToRefs(store);

watch(working, (value) => {
  store.setWorking(value);
});

// Lifecycle hooks
onBeforeMount(() => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// Methods
const checkStoreName = async () => {
  working.value = true;

  try {
    const username = await store.encrypt({
      string: user.value,
      keyiv: keyiv.value
    });

    const encryptedStoreName = await store.encrypt({
      string: encodeURI(storeName.value),
      keyiv: keyiv.value
    });

    const response = await fetch(`${import.meta.env.VITE_APP_APPLICATION_ENDPOINT}/new-store-type-name-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        storeName: encryptedStoreName,
        storeType: storeType.value,
        fingerprint: fingerprint.value,
        keyivId: keyivId.value,
      }),
    });

    const data = await response.json();
    message.value = data.debug ? data.debug : false;

    if (data.proceed === true) {
      // Handle stores data
      if (!data.extra && data.currentStore) {
        store.setActiveStore(data.currentStore);
        complete();
      } else if (data.extra === 'zpub') {
        zpubOptions.value = true;
      }
      storeNameConfirmed.value = true;
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

const closeModal = () => {
  store.setStoreModalView(false);
};

const setAddressDerivationType = async () => {
  if (addressDerivationType.value === 'external') {
    collectZpub.value = true;
    return;
  }

  if (addressDerivationType.value === 'internal') {
    working.value = true;

    try {
      const username = await store.encrypt({
        string: user.value,
        keyiv: keyiv.value
      });

      const encryptedStoreName = await store.encrypt({
        string: storeName.value,
        keyiv: keyiv.value
      });

      const response = await fetch(`${import.meta.env.VITE_APP_APPLICATION_ENDPOINT}/new-store-derivation-internal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          storeName: encryptedStoreName,
          storeType: storeType.value,
          fingerprint: fingerprint.value,
          keyivId: keyivId.value,
          addressDerivationType: addressDerivationType.value,
        }),
      });

      const data = await response.json();
      message.value = data.debug ? data.debug : false;

      if (data.proceed === true) {
        if (data.currentStore) {
          store.setActiveStore(data.currentStore);
          complete();
        } else {
          message.value = data.debug ? data.debug : "There was a problem with the information provided.";
        }
      }
    } catch (error) {
      message.value = `Error: ${error}`;
      console.error("Error:", error);
    } finally {
      working.value = false;
    }
  }
};

const submitZpub = async () => {
  working.value = true;

  const regExp = /^[A-Za-z0-9]+$/;

  if (!zpub.value.match(regExp)) {
    working.value = false;
    message.value = "zpub does not appear to be valid";
    return false;
  } else {
    message.value = "Validating...";
  }

  try {
    const username = await store.encrypt({
      string: user.value,
      keyiv: keyiv.value
    });

    const encryptedStoreName = await store.encrypt({
      string: storeName.value,
      keyiv: keyiv.value
    });

    const encryptedZpub = await store.encrypt({
      string: zpub.value,
      keyiv: keyiv.value
    });

    const response = await fetch(`${import.meta.env.VITE_APP_APPLICATION_ENDPOINT}/new-store-query-zpub`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        storeName: encryptedStoreName,
        storeType: storeType.value,
        fingerprint: fingerprint.value,
        keyivId: keyivId.value,
        zpub: encryptedZpub,
      }),
    });

    const data = await response.json();
    message.value = data.debug ? data.debug : false;

    if (data.proceed === true) {
      if (data.extra === 'confirm-addresses' && data.confirmAddresses) {
        confirmAddresses.value = data.confirmAddresses;
      } else if (data.currentStore) {
        store.setActiveStore(data.currentStore);
        complete();
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

    const encryptedStoreName = await store.encrypt({
      string: encodeURIComponent(encodeURI(storeName.value)),
      keyiv: keyiv.value
    });

    const encryptedZpub = await store.encrypt({
      string: zpub.value,
      keyiv: keyiv.value
    });

    const response = await fetch(`${import.meta.env.VITE_APP_APPLICATION_ENDPOINT}/new-store-confirm-bitcoin-zpub-addresses-match`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        storeName: encryptedStoreName,
        storeType: storeType.value,
        fingerprint: fingerprint.value,
        keyivId: keyivId.value,
        zpub: encryptedZpub,
      }),
    });

    const data = await response.json();
    message.value = data.debug ? data.debug : false;

    if (data.proceed === true) {
      if (!data.extra && data.currentStore) {
        store.setActiveStore(data.currentStore);
        complete();
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

const backToStart = () => {
  zpubOptions.value = false;
  collectZpub.value = false;
  storeNameConfirmed.value = false;
  working.value = false;
};

const complete = () => {
  store.getStores();
  closeModal();
};
</script>

<style lang="">

</style>
