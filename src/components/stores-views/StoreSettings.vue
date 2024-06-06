<template lang="">
  <div :class="working?'store-management no-click':'store-management'">
    <div :class="working?'form page working':'form page'" @click.stop="_null()">
  
      <h1><span>Manage Store</span><a class="btn" @click="saveSettings()">Save</a></h1>
  
      <div class="message" v-if="message"><i class="fas fa-exclamation-circle"></i> {{message}}</div>
      <div class="form-section">
        <h2 class="accordian-trigger" @click="accordianIndexSet(0)">Store Identity <i :class="accordianIndex==0?'fas fa-caret-down':'fas fa-caret-right'"></i></h2>
        <div class="accordian-sect" v-if="accordianIndex==0">
  
          <div class="sub-sect">
            <label for="storeName">Store Name</label>
            <span class="help-text">This name will appear on invoices, financial reports and on the F18 Pay Dashboard.</span>
            <input v-model="storeName" type="text" :placeholder="_decode(currentStore.store_name)" />
          </div>
          <div class="sub-sect">
            <label for="storeName">Store Logo</label>
            <span class="help-text">This logo may appear on invoices and generated documents for your store.</span>
            <figure>
              <div class="figure-image-holder" :style="'background-image:url(' + (storeLogoProxy || 'data:image/png;base64,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') + ')'"></div>
              <div>
                <figcaption @click="uploadNewImage()">
                  <a class="btn"><i class="fas fa-file-upload"></i>&nbsp;Set new</a>
                  <input id="imageInput" class="invisible" type="file">
                </figcaption>
                <br>
                <figcaption class="delete" v-if="storeLogoProxy" @click="storeLogoProxy=false">
                  <a class="btn severe"><i class="fas fa-times"></i>&nbsp;Delete</a>
                </figcaption>
              </div>
            </figure>
          </div>
          <div class="sub-sect">
            <label for="">Store Colours</label>
            <div class="flex colour-pickers">
              <input type="color" v-model="storePrimaryProxy" :style="'box-shadow: var(--dark) 0px 0px 0px 3px, #' + currentStore.store_colour + ' -1.75rem 0px 0px -3px, ' + storePrimaryProxy+ ' -3rem 0px 0px -3px'"/>
              <input v-model="storeSecondaryProxy" type="color" :style="'margin-left:3rem;box-shadow: var(--dark) 0px 0px 0px 3px, #' + currentStore.store_accent_colour + ' -1.75rem 0px 0px -3px, ' + storeSecondaryProxy + ' -3rem 0px 0px -3px'"/>
            </div>
            <span class="help-text">Primary and Secondary / Accent Store colours.</span>
          </div>
        </div>
  
        <h2 class="accordian-trigger" @click="accordianIndexSet(1)">Optional <i :class="accordianIndex==1?'fas fa-caret-down':'fas fa-caret-right'"></i></h2>
        <div class="accordian-sect" v-if="accordianIndex==1">
          <div class="sub-sect">
            <label for="storeName">Store URL</label>          
            <span class="help-text">Set an optional web address for your store.</span>
  
            <input v-model="url" type="text" placeholder="https://www.example.com..." />
  
          </div>
          <div class="sub-sect">
            <label for="storeName">Store Email</label>          
            <span class="help-text">Set an optional email address for your store.</span>
  
            <input v-model="email" type="text" placeholder="store@example.com..." />
  
          </div>
        </div>
        <div class="flex">
          <a class="btn" id="saveButton" @click="saveSettings()">Save</a>
          <a v-if="deleted==0" class="btn severe" @click="deleted=1">Disable Store</a>
          <a v-if="deleted==1" class="btn good" @click="deleted=0">Enable Store</a>
        </div>
  
      </div>
    </div>
  
  </div>
  </template>

<script>
import {
  mapGetters
} from 'vuex';
import { parseImgSrc } from '@/utils/fn.js'
export default {
  name: "StoreSettings",
  components: [
  ],
  data() {
    return {
      storeNameProxy: false,
      storeLogoProxy: false,
      storePrimaryProxy: '',
      storeSecondaryProxy: '',
      message: false,
      working: false,
      accordianIndex: 0,
      deleted: false,
      confirmAddresses: false,
      addressesForConfirmation: false,
      email: false,
      url: false,
      confirmCode: false,
      code: '',
      imageChanged: false,
    }
  },
  watch: {
    deleted() {
      this.saveSettings()
    },
    working() {
      this.$store.commit("setWorking", this.working);
    },
    currentStore() {
      this.init()
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
      let current = false;
      if (this.stores) {
        for (const sto of this.stores) {
          if (`${sto.store_id.substring(0, 5)}${sto.store_id.substring(sto.store_id.length - 5)}` === this.$route.params.storeId10) {
            current = sto;
            break;
          }
        }
        return current;
      }
      return false
    },
    storeName: {
      get() {
        return !this.storeNameProxy ? this._decode(this.currentStore.store_name) : this.storeNameProxy;
      },
      set(value) {
        this.storeNameProxy = value
      }
    },
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      let t = this;
      document.querySelector('.dynamic-cta-header-space') && (document.querySelector('.dynamic-cta-header-space').innerHTML = '')
      document.getElementById("imageInput").addEventListener("change", function () {
        if (this.files && this.files[0]) {
          if (this.files[0].size > 40000) {
            t.message = `File too large. Icons are limited to 40KB. Your provided file is ${this.files[0].size / 1000}KB`
            console.log("File too large:", this.files[0].size)
          }
          let reader = new FileReader();
          reader.onload = function (e) {
            t.storeLogoProxy = e.target.result
          }
          reader.readAsDataURL(this.files[0]);
          this.imageChanged = true
        }
      })
      this.url = this.currentStore.url || '';
      this.email = this.currentStore.email || '';
      this.deleted = !this.currentStore.deleted ? 0 : this.currentStore.deleted;
      if (this.currentStore.store_logo) { this.storeLogoProxy = this.parseImgSrc(this.currentStore.store_logo) }
      if (this.currentStore.store_colour) { this.storePrimaryProxy = "#" + this.currentStore.store_colour }
      if (this.currentStore.store_accent_colour) { this.storeSecondaryProxy = "#" + this.currentStore.store_accent_colour }

      this.$store.dispatch('headerUIAppend', [{
        id: '#saveButton',
        fn: this.saveSettings,
      }]);


    },
    parseImgSrc,
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
      if(!this.currentStore.store_id){return}
      this.working = true;
      this.message = ''
      const username = await this.$store.dispatch('encrypt', {
        string: this.user,
        keyiv: this.keyiv
      });
      const storeName = await this.$store.dispatch('encrypt', {
        string: encodeURIComponent(encodeURI(this.storeName)),
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
      const updateStoreSettingsBody = {
        username: username,
        storeName: storeName,
        storePrimaryColour: this.storePrimaryProxy.replace("#", ""),
        storeSecondaryColour: this.storeSecondaryProxy.replace("#", ""),
        fingerprint: this.fingerprint,
        keyivId: this.keyivId,
        store_id: this.currentStore.store_id,
        disabled: this.deleted,
        url: url,
        email: email,
      }
      if (this.imageChanged) { updateStoreSettingsBody.logo = this.storeLogoProxy }
      await fetch(process.env.VUE_APP_APPLICATION_ENDPOINT + "/store-settings-bulk", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateStoreSettingsBody),
      })
        .then((response) => response.json())
        .then((data) => {
          this.message = data.debug ? data.debug : false
          if (data.proceed == true) {
            if (!data.extra && data.currentStore) {
              this.$store.dispatch('getStores')
              this.$store.commit("setActiveStore", data.currentStore);
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
  },
}
</script>

<style lang="">

  </style>