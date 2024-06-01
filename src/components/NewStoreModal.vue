<template lang="">
<div class="modal" @click="closeModal()">
  <div class="modal-input">
    <div :class="working?'form working':'form'" @click.stop="">
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

<script>
import {
  mapGetters
} from 'vuex';
export default {
  name: "NewStoreModal",
  data() {
    return {
      working: false,
      message: false,
      storeNameConfirmed: false,
      storeName: '',
      storeType: 'btc',
      zpub: '',
      collectZpub: false,
      addressDerivationType: 'external',
      confirmAddresses: false,
      zpubOptions: false,
    }
  },
  computed: {
    ...mapGetters({
      fingerprint: 'fingerprint',
      user: 'user',
      keyiv: 'keyiv',
      keyivId: 'keyivId',
      stores: 'stores',
    })
  },
  created() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  },
  methods: {
    async checkStoreName() {
      this.working = true;
      const username = await this.$store.dispatch('encrypt', {
        string: this.user,
        keyiv: this.keyiv
      });
      const storeName = await this.$store.dispatch('encrypt', {
        string: encodeURI(this.storeName),
        keyiv: this.keyiv
      });
      await fetch(import.meta.env.VITE_APPLICATION_ENDPOINT + "/new-store-type-name-check", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: username,
            storeName: storeName,
            storeType: this.storeType,
            fingerprint: this.fingerprint,
            keyivId: this.keyivId,
          }),
        })
        .then((response) => response.json())
        .then((data) => {
          this.message = data.debug ? data.debug : false
          if (data.proceed == true) {
            //HANDLE STORES DATA
            if (!data.extra && data.currentStore) {
              this.$store.commit("setActiveStore", data.currentStore);
              this.complete()
            } else if (data.extra == 'zpub') {
              this.zpubOptions = true;
            }
            this.storeNameConfirmed = true;
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
    async setStoreLocal(object, value) {
      let temp = []
      for (const store of this.stores) {
        let tempObject = store;
        if (store.store_id == this.activeStore) {
          tempObject[object] = store[value];
        }
        temp.push(tempObject)
      }
      this.$store.commit("setStores", temp);
    },
    closeModal() {
      this.$store.commit("setStoreModalView", false);

    },
    async setAddressDerivationType() {
      if (this.addressDerivationType === 'external') {
        this.collectZpub = true;
      }
      if (this.addressDerivationType === 'internal') {
        //COMPLETE
        this.working = true;
        const username = await this.$store.dispatch('encrypt', {
          string: this.user,
          keyiv: this.keyiv
        });
        const storeName = await this.$store.dispatch('encrypt', {
          string: this.storeName,
          keyiv: this.keyiv
        });
        await fetch(import.meta.env.VITE_APPLICATION_ENDPOINT + "/new-store-derivation-internal", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              username: username,
              storeName: storeName,
              storeType: this.storeType,
              fingerprint: this.fingerprint,
              keyivId: this.keyivId,
              addressDerivationType: this.addressDerivationType,
            }),
          })
          .then((response) => response.json())
          .then((data) => {
            this.message = data.debug ? data.debug : false
            if (data.proceed == true) {
              //HANDLE STORES DATA
              if (data.currentStore) {
                this.$store.commit("setActiveStore", data.currentStore);
                this.complete()
              } else {
                this.message = data.debug ? data.debug : "There was a problem with the information provided."
              }
            }
            this.working = false;
          })
          .catch((error) => {
            this.message = this.message + ' \nError: ' + error + '\n';
            console.error("Error:", error);
          });

      }
    },
    async submitZpub() {
      this.working = true;
      let regExp = /^[A-Za-z0-9]+$/;
      if (!this.zpub.match(regExp)) {
        this.working = false;
        this.message = "zpub does not appear to be valid";
        return false;
      } else {
        this.message = "Validating...";
      }
      const username = await this.$store.dispatch('encrypt', {
        string: this.user,
        keyiv: this.keyiv
      });
      const storeName = await this.$store.dispatch('encrypt', {
        string: this.storeName,
        keyiv: this.keyiv
      });
      const zpub = await this.$store.dispatch('encrypt', {
        string: this.zpub,
        keyiv: this.keyiv
      });
      await fetch(import.meta.env.VITE_APPLICATION_ENDPOINT + "/new-store-query-zpub", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: username,
            storeName: storeName,
            storeType: this.storeType,
            fingerprint: this.fingerprint,
            keyivId: this.keyivId,
            zpub: zpub,
          }),
        })
        .then((response) => response.json())
        .then((data) => {
          this.message = data.debug ? data.debug : false
          if (data.proceed == true) {
            if (data.extra == 'confirm-addresses' && data.confirmAddresses) {
              this.confirmAddresses = data.confirmAddresses;
            } else if (data.currentStore) {
              this.$store.commit("setActiveStore", data.currentStore);
              this.complete()
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
    async confirmAddressesMatchWallet() {
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
      await fetch(import.meta.env.VITE_APPLICATION_ENDPOINT + "/new-store-confirm-bitcoin-zpub-addresses-match", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: username,
            storeName: storeName,
            storeType: this.storeType,
            fingerprint: this.fingerprint,
            keyivId: this.keyivId,
            zpub: zpub,
          }),
        })
        .then((response) => response.json())
        .then((data) => {
          this.message = data.debug ? data.debug : false
          if (data.proceed == true) {
            if (!data.extra && data.currentStore) {
              this.$store.commit("setActiveStore", data.currentStore);
              this.complete()
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
    backToStart() {
      this.zpubOptions = false;
      this.collectZpub = false;
      this.storeNameConfirmed = false;
      this.working = false;
    },
    complete() {
      this.$store.dispatch('getStores')
      this.closeModal()
    },
  }
}
</script>

<style lang="">
  
</style>
