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
            <input v-model="code" type="text" placeholder="123456" v-on:keyup.enter="verifyCode()" />
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

<script>
import {
  mapGetters
} from 'vuex';
export default {
  name: "WalletSettingsModal",
  components: {
  },
  props: ['addressesForConfirmation', 'confirmAddresses','confirmCode', 'code', 'numberOfAddressesToConfirm' ],
  emits:['setConfirmAddresses', 'setConfirmCode','confirmAddressesMatchWallet'],
  data() {
    return {
      storeNameProxy: false,
      storeLogoProxy: false,
      storePrimaryProxy: false,
      storeSecondaryProxy: false,
      message: false,
      working: false,
      addressDerivationType: false,
      zpub: false,
      accordianIndex: 0,
      deleted: false,
      email: false,
      url: false,
      downloadFile: false,
    }
  },
  watch: {
    deleted() {
      this.saveSettings()
    },
    working() {
      this.$store.commit("setWorking", this.working);
    },
  },
  computed: {
    ...mapGetters({
      session: 'session',
      fingerprint: 'fingerprint',
      user: 'user',
      keyiv: 'keyiv',
      keyivId: 'keyivId',
      activeStore: 'activeStore',
      stores: 'stores',
    }),
    currentStore() {
      let current = false
      for (const store of this.stores) {
        if (store.store_id == this.activeStore) {
          current = store;
        }
      }
      return current;
    },
    storeName: {
      get() {
        return !this.storeNameProxy ? this._decode(this.currentStore.store_name) : this.storeNameProxy;
      },
      set(value) {
        this.storeNameProxy = value
      }
    },
    storePrimaryColour: {
      get() {
        return !this.storePrimaryProxy ? "#" + this.currentStore.store_colour : "#" + this.storePrimaryProxy;
      },
      set(value) {
        this.storePrimaryProxy = value.replace("#", "")
      }
    },
    storeSecondaryColour: {
      get() {
        return !this.storeSecondaryProxy ? "#" + this.currentStore.store_accent_colour : "#" + this.storeSecondaryProxy;
      },
      set(value) {
        this.storeSecondaryProxy = value.replace("#", "")
      }
    },
  },
  mounted() {
    this.storeLogoProxy = this.currentStore.store_logo || false;
    this.zpub = this.currentStore.zpub || '';
    this.url = this.currentStore.url || '';
    this.email = this.currentStore.email || '';
    this.addressDerivationType = this.currentStore.zpub ? 'external' : 'internal'
    this.deleted = !this.currentStore.deleted ? 0 : this.currentStore.deleted;

  },
  methods: {
    downloaded() {
      let t = this
      setTimeout(function () {
        t.$emit('setConfirmCode')
        t.code = ''
        t.downloadFile = false
      }, 3000)
    },
    async verifyCode() {
      //COMPLETE
      this.working = true;
      const username = await this.$store.dispatch('encrypt', {
        string: this.user,
        keyiv: this.keyiv
      });
      const storeName = await this.$store.dispatch('encrypt', {
        string: this.currentStore.store_id,
        keyiv: this.keyiv
      });
      const code = await this.$store.dispatch('encrypt', {
        string: this.code,
        keyiv: this.keyiv
      });
      await fetch("https://f18pay-api.flat18.co.uk/store-management-request-keys-verify-code", {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          body: JSON.stringify({
            username: username,
            store_id: storeName,
            fingerprint: this.fingerprint,
            keyivId: this.keyivId,
            code: code,
          }),
        })
        .then((response) => response.json())
        .then(async (data) => {
          this.message = data.debug ? data.debug : false
          if (data.proceed == true) {
            if (data.extra == 'downloadFile') {
              let decrypted = JSON.parse(await this.$store.dispatch('decrypt', {
                string: data.keys,
                keyiv: this.keyiv
              }))
              let csvContent = 'data:text/csv;charset=utf-8,'
              for (const key of decrypted) {
                csvContent += key.private_key + ',\r\n'
              }
              this.downloadFile = encodeURI(csvContent);
            }
          } else {
            this.message = data.debug ? data.debug : "There was a problem with the information provided."
          }
          this.working = false;
        })
        .catch((error) => {
          this.message = this.message + ' \nError: ' + error + '\n';
          console.error("Error:", error);
        });
    },
    _decode(string) {
      let decoded = decodeURIComponent(decodeURI(string));
      return decoded
    },
    _null() {
      return false
    },
    uploadNewImage() {
      document.getElementById("imageInput").click();
    },
    accordianIndexSet(number) {
      this.accordianIndex = this.accordianIndex == number ? -1 : number;
    },
    async saveSettings() {
      //COMPLETE
      this.working = true;
      const username = await this.$store.dispatch('encrypt', {
        string: this.user,
        keyiv: this.keyiv
      });
      const storeName = await this.$store.dispatch('encrypt', {
        string: encodeURIComponent(encodeURI(this.storeName)),
        keyiv: this.keyiv
      });
      const zpub = await this.$store.dispatch('encrypt', {
        string: this.zpub,
        keyiv: this.keyiv
      });
      const url = await this.$store.dispatch('encrypt', {
        string: this.url,
        keyiv: this.keyiv
      });
      const email = await this.$store.dispatch('encrypt', {
        string: this.email,
        keyiv: this.keyiv
      });
      await fetch("https://f18pay-api.flat18.co.uk/store-settings-bulk", {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          body: JSON.stringify({
            username: username,
            storeName: storeName,
            storePrimaryColour: this.storePrimaryColour.replace("#", ""),
            storeSecondaryColour: this.storeSecondaryColour.replace("#", ""),
            logo: this.storeLogoProxy,
            addressDerivationType: this.addressDerivationType,
            zpub: zpub,
            fingerprint: this.fingerprint,
            keyivId: this.keyivId,
            store_id: this.currentStore.store_id,
            disabled: this.deleted,
            url: url,
            email: email,
          }),
        })
        .then((response) => response.json())
        .then((data) => {
          this.message = data.debug ? data.debug : false
          if (data.proceed == true) {
            if (!data.extra && data.currentStore) {
              this.$store.dispatch('getStores')
              this.$store.commit("setActiveStore", data.currentStore);
            } else if (data.extra == 'confirm-addresses') {
              window.scrollTo({
                top: 0,
                behavior: 'smooth'
              });
              this.setConfirmAddresses = true;
              this.addressesForConfirmation = data.confirmAddresses
            }
          } else {
            this.message = data.debug ? data.debug : "There was a problem with the information provided."
          }
          this.working = false;
        })
        .catch((error) => {
          this.message = this.message + ' \nError: ' + error + '\n';
          console.error("Error:", error);
        });
    },
    closeModal() {
      this.working = false
      this.setConfirmAddresses = false
    }
  },
}
</script>

<style lang="">
  
</style>
