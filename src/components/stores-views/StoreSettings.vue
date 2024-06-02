<template>
  <div :class="state.working ? 'store-management no-click' : 'store-management'">
    <div :class="state.working ? 'form page working' : 'form page'" @click.stop="nullify">
      <h1>
        <span>Manage Store</span>
        <a class="btn" @click="saveSettings">Save</a>
      </h1>

      <div class="message" v-if="state.message">
        <i class="fas fa-exclamation-circle"></i> {{ state.message }}
      </div>
      <template v-if="currentStore">
        <div class="form-section">
          <h2 class="accordian-trigger" @click="toggleAccordian(0)">
            Store Identity
            <i :class="state.accordianIndex === 0 ? 'fas fa-caret-down' : 'fas fa-caret-right'"></i>
          </h2>

          <div class="accordian-sect" v-if="state.accordianIndex === 0">
            <div class="sub-sect">
              <label for="storeName">Store Name</label>
              <span class="help-text">This name will appear on invoices, financial reports and on the F18 Pay
                Dashboard.</span>
              <input v-model="state.storeName" type="text" :placeholder="decode(currentStore.store_name)" />
            </div>

            <div class="sub-sect">
              <label for="storeName">Store Logo</label>
              <span class="help-text">This logo may appear on invoices and generated documents for your store.</span>
              <figure>
                <div class="figure-image-holder" :style="'background-image:url(' + state.storeLogo + ')'"></div>
                <div>
                  <figcaption @click="uploadNewImage()">
                    <a class="btn"><i class="fas fa-file-upload"></i>&nbsp;Set new</a>
                    <input ref="imageInput" @change="changeImgInputFn" class="invisible" type="file">
                  </figcaption>
                  <br>
                  <figcaption class="delete" v-if="state.storeLogo" @click="state.storeLogo = ''">
                    <a class="btn severe"><i class="fas fa-times"></i>&nbsp;Delete</a>
                  </figcaption>
                </div>
              </figure>
            </div>

            <div class="sub-sect">
              <label for="">Store Colours</label>
              <div class="flex colour-pickers">
                <v-input-colorpicker v-model="state.storePrimaryColour"></v-input-colorpicker>
                <v-input-colorpicker v-model="state.storeSecondaryColour"
                  style="margin-left: 3rem;"></v-input-colorpicker>
              </div>
              <span class="help-text">Primary and Secondary / Accent Store colours.</span>
            </div>
          </div>

          <h2 class="accordian-trigger" @click="toggleAccordian(1)">
            Optional
            <i :class="state.accordianIndex === 1 ? 'fas fa-caret-down' : 'fas fa-caret-right'"></i>
          </h2>

          <div class="accordian-sect" v-if="state.accordianIndex === 1">
            <div class="sub-sect">
              <label for="storeName">Store URL</label>
              <span class="help-text">Set an optional web address for your store.</span>
              <input v-model="state.url" type="text" placeholder="https://www.example.com..." />
            </div>

            <div class="sub-sect">
              <label for="storeName">Store Email</label>
              <span class="help-text">Set an optional email address for your store.</span>
              <input v-model="state.email" type="text" placeholder="store@example.com..." />
            </div>
          </div>

          <div class="flex">
            <a class="btn" id="saveButton" @click="saveSettings">Save</a>
            <a v-if="state.deleted === 0" class="btn severe" @click="state.deleted = 1">Disable Store</a>
            <a v-if="state.deleted === 1" class="btn good" @click="state.deleted = 0">Enable Store</a>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import { reactive } from 'vue';
import { InputColorPicker } from 'vue-native-color-picker';

const store = useStore();

const state = reactive({
  storeName: '',
  storeLogo: '',
  storePrimaryColour: '',
  storeSecondaryColour: '',
  message: '',
  working: false,
  accordianIndex: 0,
  deleted: false,
  url: '',
  email: '',
});

const decode = (string) => decodeURIComponent(decodeURI(string));
const nullify = () => false;

const uploadNewImage = () => {
  $refs.imageInput.click();
};

const saveSettings = async () => {
  alert("fn called")
  state.working = true;

  const username = await store.dispatch('encrypt', {
    string: store.state.user,
    keyiv: store.state.keyiv
  });

  const storeNameEncrypted = await store.dispatch('encrypt', {
    string: encodeURIComponent(encodeURI(state.storeName)),
    keyiv: store.state.keyiv
  });

  const urlEncrypted = await store.dispatch('encrypt', {
    string: state.url,
    keyiv: store.state.keyiv
  });

  const emailEncrypted = await store.dispatch('encrypt', {
    string: state.email,
    keyiv: store.state.keyiv
  });

  await fetch(import.meta.env.VITE_APPLICATION_ENDPOINT + "/store-settings-bulk", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: username,
      storeName: storeNameEncrypted,
      storePrimaryColour: state.storePrimaryColour.replace("#", ""),
      storeSecondaryColour: state.storeSecondaryColour.replace("#", ""),
      logo: state.storeLogo,
      fingerprint: store.state.fingerprint,
      keyivId: store.state.keyivId,
      store_id: store.state.activeStore.store_id,
      disabled: state.deleted ? 1 : 0,
      url: urlEncrypted,
      email: emailEncrypted,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      state.message = data.debug ? data.debug : false;
      if (data.proceed === true) {
        if (!data.extra && data.currentStore) {
          store.dispatch('getStores');
          store.commit("setActiveStore", data.currentStore);
        }
      } else {
        state.message = data.debug ? data.debug : "There was a problem with the information provided.";
      }
      state.working = false;
    })
    .catch((error) => {
      state.message = state.message + ' \nError: ' + error + '\n';
      console.error("Error:", error);
    });
};

const changeImgInputFn = () => {
  if (this.files && this.files[0]) {
    let reader = new FileReader();
    reader.onload = function (e) {
      state.storeLogo = e.target.result;
    };
    reader.readAsDataURL(this.files[0]);
  }
};

onMounted(() => {
  document.querySelector('.dynamic-cta-header-space') && (document.querySelector('.dynamic-cta-header-space').innerHTML = '');
  state.storeLogo = store.state.activeStore.store_logo || '';
  state.url = store.state.activeStore.url || '';
  state.email = store.state.activeStore.email || '';
  state.deleted = !store.state.activeStore.deleted ? 0 : store.state.activeStore.deleted;
  store.dispatch('headerUIAppend', [{ id: '#saveButton', fn: saveSettings }]);
});

// watch(() => state.deleted, () => { saveSettings(); });
watch(() => state.working, () => { store.commit("setWorking", state.working); });
</script>

<style></style>
