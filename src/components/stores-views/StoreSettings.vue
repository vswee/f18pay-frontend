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
            <div class="figure-image-holder" :style="`background-image:url(${storeLogoProxy?storeLogoProxy:currentStore.storeLogo});`"></div>
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
            <input type="color" v-model="storePrimaryColour" :style="'box-shadow: var(--dark) 0px 0px 0px 3px, #' + currentStore.store_colour + ' -2rem 0px 0px -3px, #' + currentStore.store_colour + ' -1rem 0px 0px -3px'"/>
            <input type="color" v-model="storeSecondaryColour" :style="'margin-left:3rem;box-shadow: var(--dark) 0px 0px 0px 3px, #' + currentStore.store_accent_colour + ' -2rem 0px 0px -3px, #' + currentStore.store_accent_colour + ' -1rem 0px 0px -3px'"/>
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
import {parseImgSrc} from '@/utils/functions.js'
export default {
  name: "StoreSettings",
  data() {
    return {
      storeNameProxy: false,
      storeLogoProxy: false,
      storePrimaryProxy: false,
      storeSecondaryProxy: false,
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
      currentStoreProxy: false,
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
      for (const store of this.stores) {
        if (`${store.store_id.substring(0, 5)}${store.store_id.substring(store.store_id.length - 5)}` === this.$route.params.storeId10) {
          return store;
        }
      }
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
    let t = this;
    document.getElementById("imageInput").value = String('')
    document.querySelector('.dynamic-cta-header-space') && (document.querySelector('.dynamic-cta-header-space').innerHTML = '')
    document.getElementById("imageInput").addEventListener("change", function () {
      t.message = ''
      if (this.files && this.files[0]) {
        if (this.files[0].size > 20000) {
          t.message = `File too large. Icons are limited to 20KB. Your provided file is ${this.files[0].size/1000}KB`
          console.log("File too large:", this.files[0].size)
        }
        let reader = new FileReader();
        reader.onload = function (e) {
          t.storeLogoProxy = e.target.result
        }
        reader.readAsDataURL(this.files[0]);

      }
    })
    this.storeLogoProxy = this.parseImgSrc(this.currentStore.store_logo) || false;
    this.url = this.currentStore.url || '';
    this.email = this.currentStore.email || '';
    this.deleted = !this.currentStore.deleted ? 0 : this.currentStore.deleted;

    this.$store.dispatch('headerUIAppend', [{
      id: '#saveButton',
      fn: this.saveSettings,
    }]);
  },
  methods: {
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
      this.working = true;
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
      const storeUpdateBody = {
        username: username,
        storeName: storeName,
        storePrimaryColour: this.storePrimaryColour.replace("#", ""),
        storeSecondaryColour: this.storeSecondaryColour.replace("#", ""),
        fingerprint: this.fingerprint,
        keyivId: this.keyivId,
        store_id: this.currentStore.store_id,
        disabled: this.deleted,
        url: url,
        email: email,
      }
      if (this.storeLogoProxy) { storeUpdateBody.logo = this.storeLogoProxy }
      await fetch(import.meta.env.VITE_APPLICATION_ENDPOINT + "/store-settings-bulk", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(storeUpdateBody),
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
