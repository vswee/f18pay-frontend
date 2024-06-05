<template lang="">
  <!-- MODAL -->
  <div>
    <div class="modal" @click="closeModal()" v-if="confirmAddresses">
      <div class="modal-input">
        <div :class="working?'form page working':'form page'" @click.stop="">
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
              <a class="btn sec" @click.stop="confirmAddresses=false"><i class="fas fa-arrow-left"></i></a>
              <a class="btn" @click.stop="!working && ($emit('confirmAddressesMatchWallet'))">Confirm Addresses<i class="fas fa-arrow-right"></i></a>
            </div>
          </div>
  
        </div>
      </div>
    </div>
    <div class="modal" @click="$emit('setConfirmCode')" v-if="confirmCode">
      <div class="modal-input">
        <div :class="working?'form page working':'form page'" @click.stop="">
          <h1>Confirm Code</h1>
          <div class="message" v-if="message"><i class="fas fa-exclamation-circle"></i> {{message}}</div>
          <div class="form-section" v-if="!downloadFile">
            <div class="sub-sect">
              <label for="storeName">Enter code</label>
              <input v-model="codeBridge" type="text" placeholder="123456" v-on:keyup.enter="verifyCode()" />
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
  import { mapGetters } from 'vuex';
  import { reactive, ref, computed, onMounted } from 'vue';
  import { useStore } from 'vuex';
import {useRoute} from 'vue-router'
const route = useRoute()
  const store = useStore();

  const props = defineProps({
      addressesForConfirmation: Array,
      confirmAddresses: Boolean,
      confirmCode: Boolean,
      code: String,
    numberOfAddressesToConfirm: Number,
    currentStore:Array,
  });
  
  const storeNameProxy = ref(false);
  const storeLogoProxy = ref(false);
  const storePrimaryProxy = ref(false);
  const storeSecondaryProxy = ref(false);
  const message = ref(false);
  const working = ref(false);
  const addressDerivationType = ref(false);
  const zpub = ref(false);
  const accordianIndex = ref(0);
  const deleted = ref(false);
  const email = ref(false);
  const url = ref(false);
  const downloadFile = ref(false);
  const codeBridge = ref(props.code);
  
  const session = computed(() => store.getters.session);
const fingerprint = computed(() => store.getters.fingerprint);
const user = computed(() => store.getters.user);
const keyiv = computed(() => store.getters.keyiv);
const keyivId = computed(() => store.getters.keyivId);
const chart = computed(() => store.getters.chart);
const stores = computed(() => store.getters.stores);

  
  const storeName = computed({
      get: () => !storeNameProxy.value ? _decode(props.currentStore.store_name) : storeNameProxy.value,
      set: (value) => storeNameProxy.value = value,
  });
  
  const storePrimaryColour = computed({
      get: () => !storePrimaryProxy.value ? "#" + props.currentStore.store_colour : "#" + storePrimaryProxy.value,
      set: (value) => storePrimaryProxy.value = value.replace("#", ""),
  });
  
  const storeSecondaryColour = computed({
      get: () => !storeSecondaryProxy.value ? "#" + props.currentStore.store_accent_colour : "#" + storeSecondaryProxy.value,
      set: (value) => storeSecondaryProxy.value = value.replace("#", ""),
  });
  
  onMounted(() => {
      storeLogoProxy.value = props.currentStore.store_logo || false;
      zpub.value = props.currentStore.zpub || '';
      url.value = props.currentStore.url || '';
      email.value = props.currentStore.email || '';
      addressDerivationType.value = props.currentStore.zpub ? 'external' : 'internal';
      deleted.value = !props.currentStore.deleted ? 0 : props.currentStore.deleted;
  });
  
  const saveSettings = async () => {
      working.value = true;
      const username = await store.dispatch('encrypt', { string: user.value, keyiv: keyiv.value });
      const storeNameEncrypted = await store.dispatch('encrypt', { string: encodeURIComponent(encodeURI(storeName.value)), keyiv: keyiv.value });
      const zpubEncrypted = await store.dispatch('encrypt', { string: zpub.value, keyiv: keyiv.value });
      const urlEncrypted = await store.dispatch('encrypt', { string: url.value, keyiv: keyiv.value });
      const emailEncrypted = await store.dispatch('encrypt', { string: email.value, keyiv: keyiv.value });
      try {
          const response = await fetch(import.meta.env.VITE_APPLICATION_ENDPOINT + "/store-settings-bulk", {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  username: username,
                  storeName: storeNameEncrypted,
                  storePrimaryColour: storePrimaryColour.value.replace("#", ""),
                  storeSecondaryColour: storeSecondaryColour.value.replace("#", ""),
                  logo: storeLogoProxy.value,
                  addressDerivationType: addressDerivationType.value,
                  zpub: zpubEncrypted,
                  fingerprint: fingerprint.value,
                  keyivId: keyivId.value,
                  store_id: props.currentStore.store_id,
                  disabled: deleted.value,
                  url: urlEncrypted,
                  email: emailEncrypted,
              }),
          });
          const data = await response.json();
          message.value = data.debug ? data.debug : false;
          if (data.proceed == true) {
              if (!data.extra && data.props.currentStore) {
                  store.dispatch('getStores');
                  store.commit("setActiveStore", data.props.currentStore);
              } else if (data.extra == 'confirm-addresses') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  emit('setConfirmAddresses', true);
                  addressesForConfirmation.value = data.confirmAddresses;
              }
          } else {
              message.value = data.debug ? data.debug : "There was a problem with the information provided.";
          }
      } catch (error) {
          message.value = message.value + ' \nError: ' + error + '\n';
          console.error("Error:", error);
      } finally {
          working.value = false;
      }
  };
  
  const closeModal = () => {
      working.value = false;
      emit('setConfirmAddresses', false);
  };
  
  const _decode = (string) => {
      let decoded = decodeURIComponent(decodeURI(string));
      return decoded;
  };
  
  const downloaded = () => {
      setTimeout(() => {
          emit('setConfirmCode');
          codeBridge.value = '';
          downloadFile.value = false;
      }, 3000);
  };
  
  const verifyCode = async () => {
      working.value = true;
      const username = await store.dispatch('encrypt', { string: user.value, keyiv: keyiv.value });
      const storeNameEncrypted = await store.dispatch('encrypt', { string: props.currentStore.store_id, keyiv: keyiv.value });
      const codeEncrypted = await store.dispatch('encrypt', { string: codeBridge.value, keyiv: keyiv.value });
      try {
          const response = await fetch(import.meta.env.VITE_APPLICATION_ENDPOINT + "/store-management-request-keys-verify-code", {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  username: username,
                  store_id: storeNameEncrypted,
                  fingerprint: fingerprint.value,
                  keyivId: keyivId.value,
                  code: codeEncrypted,
              }),
          });
          const data = await response.json();
          message.value = data.debug ? data.debug : false;
          if (data.proceed == true) {
              if (data.extra == 'downloadFile') {
                  let decrypted = JSON.parse(await store.dispatch('decrypt', { string: data.keys, keyiv: keyiv.value }));
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
          message.value = message.value + ' \nError: ' + error + '\n';
          console.error("Error:", error);
      } finally {
          working.value = false;
      }
  };
  
  const uploadNewImage = () => {
      document.getElementById("imageInput").click();
  };
  
  const accordianIndexSet = (number) => {
      accordianIndex.value = accordianIndex.value == number ? -1 : number;
  };
  </script>


  <style lang="">
    
  </style>
  