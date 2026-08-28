<template lang="">
<!-- MODAL -->
<div>
  <div class="modal" @click="closeModal()" v-if="confirmAddresses">
    <div class="modal-input">
      <div class="form page" @click.stop="">
        <h1>Confirm Addresses</h1>
        <div class="message" v-if="message"><i class="fas fa-exclamation-circle"></i> {{message}}</div>
        <div class="form-section">
          <div class="sub-sect">
            <label for="storeName">Wallet Addresses</label>
            <ol>
              <li v-for="(address, key) in addressesForConfirmation" :key="key">{{address}}</li>
            </ol>
            <span class="help-text">Confirm that the addresses above match the <b>first {{numberOfAddressesToConfirm}}</b> addresses on your wallet.<br>For Wasabi wallet, you may need to generate {{numberOfAddressesToConfirm}} addresses manually (under the 'receive' tab).</span>
          </div>
          <div class="flex">
            <a class="btn sec" @click.stop="emit('setConfirmAddresses')"><i class="fas fa-arrow-left"></i></a>
            <a class="btn" @click.stop="!working && ($emit('confirmAddressesMatchWallet'))">Confirm Addresses<i class="fas fa-arrow-right"></i></a>
          </div>
        </div>

      </div>
    </div>
  </div>
  <div class="modal" @click="$emit('setConfirmCode')" v-if="confirmCode">
    <div class="modal-input">
      <div class="form page" @click.stop="">
        <h1>Confirm Code</h1>
        <div class="message" v-if="message"><i class="fas fa-exclamation-circle"></i> {{message}}</div>
        <div class="form-section" v-if="!downloadFile">
          <div class="sub-sect">
            <label for="storeName">Enter code</label>
            <input v-model="codeProxy" type="text" placeholder="123456" v-on:keyup.enter="verifyCode()" />
            <span class="help-text">We've sent a code to the email address for this F18 Pay account owner. Enter it above to download all the internal keys associated with this Store.</span>
          </div>
          <div class="flex">
            <a class="btn sec" @click.stop="$emit('setConfirmCode')"><i class="fas fa-arrow-left"></i></a>
            <a class="btn" @click.stop="!working && (verifyCode())">Verify Code<i class="fas fa-arrow-right"></i></a>
          </div>
        </div>
        <div class="form-section" v-if="downloadFile">
          <div class="sub-sect">
            <label for="storeName">Download File</label>
            <a class="btn severe" style="margin-right: auto;" :href="downloadFile" @click.stop="downloaded()" download="keys.csv"><i class="fas fa-download"></i> Download Keys as .CSV</a>
            <span class="help-text"><i class="fas fa-exclamation-triangle"></i> Keep these keys safe. Anyone with access to these downloaded, decrypted keys can spend any existing and future balances.</span>
          </div>
          <div class="flex">
            <a class="btn sec" @click.stop="$emit('setConfirmCode')"><i class="fas fa-arrow-left"></i></a>
            <a class="btn" @click.stop="!working && (verifyCode())">Verify Code<i class="fas fa-arrow-right"></i></a>
          </div>
        </div>

      </div>
    </div>
  </div>
</div>
<!-- MODAL -->
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useMainStore } from '@/stores';
import { storeToRefs } from 'pinia';

// Props and emits
const props = defineProps({
  addressesForConfirmation: {
    type: Array,
    default: () => []
  },
  confirmAddresses: {
    type: Boolean,
    default: false
  },
  confirmCode: {
    type: Boolean,
    default: false
  },
  code: {
    type: String,
    default: ''
  },
  numberOfAddressesToConfirm: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['setConfirmAddresses', 'setConfirmCode', 'confirmAddressesMatchWallet']);

// Reactive state
const storeNameProxy = ref(false);
const storeLogoProxy = ref(false);
const storePrimaryProxy = ref(false);
const storeSecondaryProxy = ref(false);
const message = ref(false);
const working = ref(false);
const addressDerivationType = ref(false);
const zpub = ref(false);
const deleted = ref(false);
const email = ref(false);
const url = ref(false);
const downloadFile = ref(false);
const codeProxy = ref(props.code);

// Store state with storeToRefs for reactivity
const route = useRoute();
const store = useMainStore();
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

const storeName = computed({
  get: () => !storeNameProxy.value ? _decode(currentStore.value.store_name) : storeNameProxy.value,
  set: (value) => { storeNameProxy.value = value; }
});

const storePrimaryColour = computed({
  get: () => !storePrimaryProxy.value ? "#" + currentStore.value.store_colour : "#" + storePrimaryProxy.value,
  set: (value) => { storePrimaryProxy.value = value.replace("#", ""); }
});

const storeSecondaryColour = computed({
  get: () => !storeSecondaryProxy.value ? "#" + currentStore.value.store_accent_colour : "#" + storeSecondaryProxy.value,
  set: (value) => { storeSecondaryProxy.value = value.replace("#", ""); }
});

// Watchers
watch(deleted, () => {
  saveSettings();
});

watch(working, (newValue) => {
  store.setWorking(newValue);
});

// Methods
const downloaded = () => {
  setTimeout(() => {
    emit('setConfirmCode');
    codeProxy.value = '';
    downloadFile.value = false;
  }, 3000);
};

const verifyCode = async () => {
  working.value = true;

  try {
    const username = await store.encrypt({
      string: user.value,
      keyiv: keyiv.value
    });

    const encryptedStoreName = await store.encrypt({
      string: currentStore.value.store_id,
      keyiv: keyiv.value
    });

    const encryptedCode = await store.encrypt({
      string: codeProxy.value,
      keyiv: keyiv.value
    });

    const response = await fetch(`${import.meta.env.VITE_APP_APPLICATION_ENDPOINT}/store-management-request-keys-verify-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        store_id: encryptedStoreName,
        fingerprint: fingerprint.value,
        keyivId: keyivId.value,
        code: encryptedCode,
      }),
    });

    const data = await response.json();
    message.value = data.debug ? data.debug : false;

    if (data.proceed === true) {
      if (data.extra === 'downloadFile') {
        const decrypted = JSON.parse(await store.decrypt({
          string: data.keys,
          keyiv: keyiv.value
        }));

        let csvContent = 'data:text/csv;charset=utf-8,';
        for (const key of decrypted) {
          csvContent += key.private_key + ',\r\n';
        }

        downloadFile.value = encodeURI(csvContent);
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

const _decode = (string) => {
  return decodeURIComponent(decodeURI(string));
};

const saveSettings = async () => {
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

    const encryptedUrl = await store.encrypt({
      string: url.value,
      keyiv: keyiv.value
    });

    const encryptedEmail = await store.encrypt({
      string: email.value,
      keyiv: keyiv.value
    });

    const response = await fetch(`${import.meta.env.VITE_APP_APPLICATION_ENDPOINT}/store-settings-bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        storeName: encryptedStoreName,
        storePrimaryColour: storePrimaryColour.value.replace("#", ""),
        storeSecondaryColour: storeSecondaryColour.value.replace("#", ""),
        logo: storeLogoProxy.value,
        addressDerivationType: addressDerivationType.value,
        zpub: encryptedZpub,
        fingerprint: fingerprint.value,
        keyivId: keyivId.value,
        store_id: currentStore.value.store_id,
        disabled: deleted.value,
        url: encryptedUrl,
        email: encryptedEmail,
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
        emit('setConfirmAddresses', true);
        // addressesForConfirmation.value = data.confirmAddresses;
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

const closeModal = () => {
  working.value = false;
  emit('setConfirmAddresses');
};

// Lifecycle hooks
onMounted(() => {
  if (currentStore.value) {
    storeLogoProxy.value = currentStore.value.store_logo || false;
    zpub.value = currentStore.value.zpub || '';
    url.value = currentStore.value.url || '';
    email.value = currentStore.value.email || '';
    addressDerivationType.value = currentStore.value.zpub ? 'external' : 'internal';
    deleted.value = !currentStore.value.deleted ? 0 : currentStore.value.deleted;
  }
});
</script>

<style lang="">

</style>
