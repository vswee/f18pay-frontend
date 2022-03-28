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
            <v-input-colorpicker v-model="storePrimaryColour" :style="'box-shadow: var(--dark) 0px 0px 0px 3px, #' + currentStore.store_colour + ' -2rem 0px 0px -3px, #' + currentStore.store_colour + ' -1rem 0px 0px -3px'"></v-input-colorpicker>
            <v-input-colorpicker v-model="storeSecondaryColour" :style="'margin-left:3rem;box-shadow: var(--dark) 0px 0px 0px 3px, #' + currentStore.store_accent_colour + ' -2rem 0px 0px -3px, #' + currentStore.store_accent_colour + ' -1rem 0px 0px -3px'"></v-input-colorpicker>
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
import InputColorPicker from 'vue-native-color-picker'
export default {
  name: "StoreSettings",
  components: {
    "v-input-colorpicker": InputColorPicker,
  },
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
      // downloadFile: false,
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
    let t = this;
    document.querySelector('.dynamic-cta-header-space') && (document.querySelector('.dynamic-cta-header-space').innerHTML = '')
    document.getElementById("imageInput").addEventListener("change", function () {
      if (this.files && this.files[0]) {
        let reader = new FileReader();
        reader.onload = function (e) {
          t.storeLogoProxy = e.target.result
          console.log(this.storeLogoProxy)
        }
        reader.readAsDataURL(this.files[0]);

      }
    })
    this.storeLogoProxy = this.currentStore.store_logo || false;
    this.url = this.currentStore.url || '';
    this.email = this.currentStore.email || '';
    this.deleted = !this.currentStore.deleted ? 0 : this.currentStore.deleted;

    if (document.querySelectorAll('.dynamic-cta-header-space').length == 1 && document.querySelector('#saveButton')) {
      let cta = document.querySelector('#saveButton').cloneNode(true);
      cta.setAttribute('id', cta.getAttribute('id') + '_' + Date.now())
      cta.addEventListener("click", function () {
        t.saveSettings()
      })
      document.querySelector('.dynamic-cta-header-space').append(cta);
    }
  },
  methods: {
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
      await fetch("https://money-api.flat18.co.uk/store-settings-bulk", {
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
