<template lang="">
<div :class="working?'store-management no-click':'store-management'">
  <!-- MODAL -->
  <div class="modal" @click="closeModal()" v-if="modal.payload">
    <div class="modal-input">
      <div :class="working?'form page working':'form page'" @click.stop="">
        <h1>{{modal.name}}</h1>
        <div class="message" v-if="message"><i class="fas fa-exclamation-circle"></i> {{message}}</div>
        <div class="form-section">
          <div class="sub-sect">
            <span class="help-text">Modify and copy the text below to embed a button on your website.</span>
            <div class="code-block" contenteditable="true" @click.stop="this.select()">
              {{modal.payload}}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- MODAL -->
  <div :class="working?'form page working':'form page'" @click.stop="_null()">
    <h1><span>Payment Assets</span></h1>

    <div class="message" v-if="message"><i class="fas fa-exclamation-circle"></i> {{message}}</div>
    <div class="form-section">
      <h2 class="accordian-trigger" @click="accordianIndexSet(0)">Payment Buttons <i :class="accordianIndex==0?'fas fa-caret-down':'fas fa-caret-right'"></i></h2>
      <div class="accordian-sect" v-if="accordianIndex==0">
        <div class="sub-sect">
          <label for="storeName">Assets Currency</label>
          <div class="">
            <div class="modern-select" @click.stop="select[0].open=!select[0].open">
              <span class="selected">{{select[0].selected || 'Currency'}} <i v-if="select[0].open" class="fas fa-caret-up"></i><i v-else class="fas fa-caret-down"></i></span>
              <ul v-if="select[0].open">
                <li v-for="(value, key) of select[0].options" :key="key" @click.stop="modernSelect(0,value)">{{value}}</li>
              </ul>
            </div>
          </div>
        </div>
        <div class="sub-sect">
          <label for="storeName">Basic Button</label>
          <div class="button-preview" :random="random" id="basicButton">
            <form target="_blank" method="GET" :action="base_url">
              <input type="hidden" name="store_id" :value="currentStore.store_id" />
              <input type="hidden" name="price" :value="fixedPrice" />
              <input type="hidden" name="redirectURL" :value="currentStore.url" />
              <input type="hidden" name="currency" :value="select[0].selected" />

              <button type="submit" :style="'cursor:pointer;min-width: 150px;width: max-content;background: ' + storePrimaryProxy+ ';color:' + textColor + ';border: 0;font-size: 14px;font-family: \'Arial\', sans-serif;border-radius: 100px;padding: 15px 20px;max-width: calc(200px - 40px);line-height: 14px;transition:.1s ease;'" alt="Click here to complete this payment." :onmouseenter="'this.style[\'background-color\']=\''+storeSecondaryProxy+'\';this.style.color=\'' + textAccent + '\';'" :onmouseleave="'this.style[\'background-color\']=\''+storePrimaryProxy+'\';this.style.color=\'' + textColor + '\';'">Pay <span style="display: inline-grid; grid-template: 1fr auto / 1fr;vertical-align: top;gap: 0;line-height: 1;position: relative;"><span>{{fixedPrice}}</span> <span style="font-size: 7px;position: absolute;bottom: 7px;width: 100%;text-align: center;top: 100%;opacity: .5;">{{select[0].selected}}</span></span> with F18</button>
            </form>
          </div>
          <div class="flex">
            <a class="btn" @click="copyCode('basicButton')">Copy HTML to clipboard <i v-if="basicCodeCopied" class="fas fa-check"></i></a>
            <a class="btn sec" @click="showCode('basicButton')">Show HTML Code</a>
          </div>
          <span class="help-text">Embed these on your website for quick payments. <br>*Javascript must be enabled on the client device.</span>
        </div>

        <div class="sub-sect">
          <label for="storeName">Dynamic Button</label>
          <div class="button-preview" :random="random" id="dynamicButton">
            <form target="_blank" method="GET" :action="base_url">
              <input type="hidden" name="store_id" :value="currentStore.store_id" />
              <input type="hidden" name="price" :value="fixedPrice" class="priceValue" />
              <input type="hidden" name="redirectURL" :value="currentStore.url" />
              <input type="hidden" name="currency" :value="select[0].selected" />

              <div>
                <a :style="'margin-right:.5rem;cursor:pointer;min-width: 150px;width: max-content;background: ' + storePrimaryProxy+ ';color: ' + textColor + ';border: 0;font-size: 14px;font-family: \'Arial\', sans-serif;border-radius: 100px;padding: 15px 20px;max-width: calc(200px - 40px);line-height: 14px;transition:.1s ease;'" alt="Increase value" :onmouseenter="'this.style[\'background-color\']=\''+storeSecondaryProxy+'\';this.style.color=\'' + textAccent + '\';'" :onmouseleave="'this.style[\'background-color\']=\''+storePrimaryProxy+'\';this.style.color=\'' + textColor + '\';'" onclick="this.parentNode.parentNode.querySelector('.priceValue').value=Number(this.parentNode.parentNode.querySelector('.priceValue').value)+1;this.parentNode.querySelector('.priceValueDisplay').innerHTML=Number(this.parentNode.querySelector('.priceValueDisplay').innerHTML)+1;">+</a>

                <button type="submit" :style="'cursor:pointer;min-width: 150px;width: max-content;background: ' + storePrimaryProxy+ ';color: ' + textColor + ';border: 0;font-size: 14px;font-family: \'Arial\', sans-serif;border-radius: 100px;padding: 15px 20px;max-width: calc(200px - 40px);line-height: 14px;transition:.1s ease;'" alt="Click here to complete this payment." :onmouseenter="'this.style[\'background-color\']=\''+storeSecondaryProxy+'\';this.style.color=\'' + textAccent + '\';'" :onmouseleave="'this.style[\'background-color\']=\''+storePrimaryProxy+'\';this.style.color=\'' + textColor + '\';'">Pay <span style="display: inline-grid; grid-template: 1fr auto / 1fr;vertical-align: top;gap: 0;line-height: 1;position: relative;"><span class="priceValueDisplay">{{fixedPrice}}</span> <span style="font-size: 7px;position: absolute;bottom: 7px;width: 100%;text-align: center;top: 100%;opacity: .5;">{{select[0].selected}}</span></span> with F18</button>

                <a :style="'margin-left:.5rem;cursor:pointer;min-width: 150px;width: max-content;background: ' + storePrimaryProxy+ ';color: ' + textColor + ';border: 0;font-size: 14px;font-family: \'Arial\', sans-serif;border-radius: 100px;padding: 15px 20px;max-width: calc(200px - 40px);line-height: 14px;transition:.1s ease;'" alt="Increase value" :onmouseenter="'this.style[\'background-color\']=\''+storeSecondaryProxy+'\';this.style.color=\'' + textAccent + '\';'" :onmouseleave="'this.style[\'background-color\']=\''+storePrimaryProxy+'\';this.style.color=\'' + textColor + '\';'" onclick="this.parentNode.parentNode.querySelector('.priceValue').value=Number(this.parentNode.parentNode.querySelector('.priceValue').value)-1||1;this.parentNode.querySelector('.priceValueDisplay').innerHTML=Number(this.parentNode.querySelector('.priceValueDisplay').innerHTML)-1 || 1;">-</a>
              </div>
            </form>
          </div>
          <div class="flex">
            <a class="btn" @click="copyCode('dynamicButton')">Copy HTML to clipboard <i v-if="dynamicCodeCopied" class="fas fa-check"></i></a>
            <a class="btn sec" @click="showCode('dynamicButton')">Show HTML Code</a>
          </div>
          <span class="help-text">Embed these on your website for quick payments. <br>*Javascript must be enabled on the client device.</span>
        </div>

        <div class="sub-sect">
          <label for="">Override Default Store Colours</label>
          <div class="flex colour-pickers">
              <input type="color" v-model="storePrimaryProxy" :style="'box-shadow: var(--dark) 0px 0px 0px 3px, #' + currentStore.store_colour + ' -1.75rem 0px 0px -3px, ' + storePrimaryProxy+ ' -3rem 0px 0px -3px'"/>
              <input v-model="storeSecondaryProxy" type="color" :style="'margin-left:3rem;box-shadow: var(--dark) 0px 0px 0px 3px, #' + currentStore.store_accent_colour + ' -1.75rem 0px 0px -3px, ' + storeSecondaryProxy + ' -3rem 0px 0px -3px'"/>
            </div>
          <span class="help-text flex">Primary and Secondary / Accent Store colours.</span>
        </div>
      </div>

      <h2 class="accordian-trigger" @click="accordianIndexSet(3)">API Credentials <i :class="accordianIndex==3?'fas fa-caret-down':'fas fa-caret-right'"></i></h2>
      <div class="accordian-sect" v-if="accordianIndex==3">
        <div class="sub-sect">
          <label>Generate a store API key</label>
          <span class="help-text">Use a separate key for each integration. Keys are limited to this store and the full secret is shown only once.</span>
          <input v-model="apiKeyNickname" type="text" maxlength="100" placeholder="btcpayserver" @keyup.enter="createApiKey()" />
          <label class="api-permissions-label">Permissions</label>
          <div class="api-permissions">
            <label v-for="permission in apiPermissionOptions" :key="permission.value" class="api-permission">
              <input v-model="apiKeyPermissions" type="checkbox" :value="permission.value" />
              <span>{{ permission.label }}</span>
            </label>
          </div>
          <a class="btn" :class="apiKeyWorking ? 'working' : ''" @click="createApiKey()">Generate API key</a>
        </div>

        <div v-if="apiKeyMessage" class="message"><i class="fas fa-info-circle"></i> {{ apiKeyMessage }}</div>

        <div v-if="generatedApiKey" class="sub-sect api-key-reveal">
          <label>Copy this API key now</label>
          <span class="help-text">For Invoice Ninja, use it as <code>Authorization: token &lt;key&gt;</code>. F18 Pay cannot display the full secret again.</span>
          <div class="api-key-secret">{{ generatedApiKey.secret }}</div>
          <div class="flex">
            <a class="btn" @click="copyApiKey()">{{ apiKeyCopied ? 'Copied' : 'Copy API key' }} <i v-if="apiKeyCopied" class="fas fa-check"></i></a>
            <a class="btn sec" @click="generatedApiKey = false">Dismiss</a>
          </div>
        </div>

        <div class="sub-sect api-key-list" v-if="apiKeys.length">
          <label>Existing API keys</label>
          <div v-for="apiKey in apiKeys" :key="apiKey.id" class="api-key-row" :class="apiKey.revoked ? 'revoked' : ''">
            <div>
              <strong>{{ apiKey.nickname }}</strong>
              <span class="help-text">{{ apiKey.keyPrefix }}… · created {{ formatApiKeyDate(apiKey.created) }}</span>
            </div>
            <a v-if="!apiKey.revoked" class="btn severe" @click="revokeApiKey(apiKey)">Revoke</a>
            <span v-else class="help-text">Revoked</span>
          </div>
        </div>
        <div v-else-if="!apiKeyWorking" class="sub-sect">
          <span class="help-text">No API keys have been created for this store.</span>
        </div>
      </div>

      <h2 class="accordian-trigger" @click="accordianIndexSet(1)">Payment Page <i :class="accordianIndex==1?'fas fa-caret-down':'fas fa-caret-right'"></i></h2>
      <div class="accordian-sect" v-if="accordianIndex==1">
        <div class="sub-sect" v-if="accordianIndex==1">
          <div class="switch">
            <a :target="'_blank_'+random" :class="currentStore.payment_page==='1'?'btn active':'btn'" @click.stop="setPaymentPage(1)">{{currentStore.payment_page==='1'?'Page Enabled':'Enable Page'}}</a>
            <a :class="currentStore.payment_page==='1'?'btn':'btn severe active'" @click.stop="setPaymentPage(0)">{{currentStore.payment_page==='1'?'Disable Page':'Page Disabled'}}</a>
          </div>
          <span class="help-text">A Payment page allows anyone with the link to generate invoices for this store. This may be useful as a backup POS terminal or for receiving donations.</span>
        </div>
        <div class="sub-sect">
          <label for="storeName">Payment Pgae URL <i v-if="settingPaymentPage" class="fas fa-asterisk spin"></i></label>
          <div class="input-placeholder">
            https://pay.flat18.co.uk/store/{{storeCode}} <i class="fas fa-check-circle"></i>
          </div>
          <a :href="'https://pay.flat18.co.uk/store/'+storeCode"><i class="fas fa-external-link-square-alt"></i></a>
        </div>

        <div class="sub-sect">
          <label for="storeName">Payment Pgae API <i v-if="settingPaymentPage" class="fas fa-asterisk spin"></i></label>
          <div class="input-placeholder">
            https://pay.flat18.co.uk/store/{{storeCode}}/<b>{{select[0].selected}}</b>/<i>Item name or code</i> <i class="fas fa-check-circle"></i>
          </div>
          <a :href="'https://pay.flat18.co.uk/store/'+storeCode+'/'+select[0].selected+'/Item name or code'"><i class="fas fa-external-link-square-alt"></i></a>
          <span class="help-text">Store Payment Page API is programmable by setting the currency and item name as text strings in the URL.</span>
        </div>
      </div>

      <h2 class="accordian-trigger" @click="accordianIndexSet(2)">Invoice Behaviour <i :class="accordianIndex==2?'fas fa-caret-down':'fas fa-caret-right'"></i></h2>
      <div class="accordian-sect" v-if="accordianIndex==2">
        <div class="sub-sect">
          <label for="storeName">Payee must provide email on invoice <i v-if="settingEmailRequired" class="fas fa-asterisk spin"></i></label>
          <div class="switch">
            <a :target="'_blank_'+random" :class="currentStore.require_email==='1'?'btn active':'btn'" @click.stop="setPRequireEmail(1)">{{currentStore.require_email==='1'?'Email Required':'Require Payee Email'}}</a>
            <a :class="currentStore.require_email==='1'?'btn':'btn severe active'" @click.stop="setPRequireEmail(0)">{{currentStore.require_email==='1'?'Allow Anonymous':'Not Required'}}</a>
          </div>
          <span class="help-text">Choose whether a payee should identify themselves on an invoice by entering their email before proceeding to pay, or if invoices can be paid anonymously.</span>
        </div>
      </div>

    </div>
    <input id="copy_to_clipboard_workspace" class="transparent">
  </div>

</div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useMainStore } from '@/stores';
import { storeToRefs } from 'pinia';
import { apiUrl } from '@/utils/api';

// Reactive state
const modal = ref({
  name: false,
  payload: false
});
const message = ref(false);
const working = ref(false);
const accordianIndex = ref(0);
const supportedCurrencies = ref(['USD', 'GBP', 'EUR', 'TTD']);
const fixedPrice = ref(10);
const storePrimaryProxy = ref('');
const storeSecondaryProxy = ref('');
const dynamicCopied = ref(false);
const basicCodeCopied = ref(false);
const dynamicCodeCopied = ref(false);
const text = ref(false);
const text2 = ref(false);
const settingPaymentPage = ref(false);
const settingEmailRequired = ref(false);
const apiKeys = ref([]);
const apiKeyNickname = ref('');
const apiKeyWorking = ref(false);
const apiKeyMessage = ref('');
const generatedApiKey = ref(false);
const apiKeyCopied = ref(false);
const apiPermissionOptions = [
  { value: 'btcpay.store.canviewinvoices', label: 'View invoices' },
  { value: 'btcpay.store.cancreateinvoice', label: 'Create invoices' },
  { value: 'btcpay.store.canmodifyinvoices', label: 'Modify invoices' },
  { value: 'btcpay.store.canviewstoresettings', label: 'View store' },
  { value: 'btcpay.store.webhooks.canmodifywebhooks', label: 'Modify webhooks' },
  { value: 'btcpay.store.cancreatenonapprovedpullpayments', label: 'Create non-approved pull payments' },
];
const apiKeyPermissions = ref(apiPermissionOptions.map((permission) => permission.value));
const select = ref([{
  open: false,
  selected: 'USD',
  options: false
}]);
const storeNameProxy = ref(false);

// Store state with storeToRefs for reactivity
const route = useRoute();
const store = useMainStore();
const {
  fingerprint,
  user,
  keyiv,
  keyivId,
  activeStore,
  stores,
  url: base_url
} = storeToRefs(store);

// Computed properties
const storeCode = computed(() => {
  return activeStore.value.substr(0, 4) + currentStore.value.store_id_int + activeStore.value.substr(activeStore.value.length - 4);
});

const random = computed(() => {
  return String(Math.floor(Math.random() * 100) + 2 + "" + new Date().getTime() + Math.floor(Math.random() * 100) + 2 + (Math.random().toString(36).replace(/[^a-zA-Z]+/g, '').substr(0, 5)));
});

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

const textColor = computed(() => {
  return !text.value ? "#" + currentStore.value.text_primary : "#" + text.value;
});

const textAccent = computed(() => {
  return !text2.value ? "#" + currentStore.value.text_accent : "#" + text2.value;
});

// Watchers
watch(working, (newValue) => {
  store.setWorking(newValue);
});

watch(currentStore, () => {
  init();
  if (accordianIndex.value === 3) {
    loadApiKeys();
  }
});

// Methods
const init = () => {
  const headerSpace = document.querySelector('.dynamic-cta-header-space');
  if (headerSpace) {
    headerSpace.innerHTML = '';
  }

  if (currentStore.value.network) {
    supportedCurrencies.value.push(currentStore.value.network.toUpperCase());
  }

  select.value[0].options = supportedCurrencies.value;

  if (currentStore.value.store_colour) {
    storePrimaryProxy.value = "#" + currentStore.value.store_colour;
  }

  if (currentStore.value.store_accent_colour) {
    storeSecondaryProxy.value = "#" + currentStore.value.store_accent_colour;
  }
};

const modernSelect = (index, value) => {
  select.value[index].selected = value;
  select.value[index].open = false;
};

const setPaymentPage = async (onOff) => {
  await settingsAsync('payment_page', onOff, 'settingPaymentPage');
};

const setPRequireEmail = async (onOff) => {
  await settingsAsync('require_email', onOff, 'settingEmailRequired');
};

const settingsAsync = async (parameter, value, workingParam) => {
  if (workingParam === 'settingPaymentPage') {
    settingPaymentPage.value = true;
  } else if (workingParam === 'settingEmailRequired') {
    settingEmailRequired.value = true;
  }

  try {
    const username = await store.encrypt({
      string: user.value,
      keyiv: keyiv.value
    });

    const encryptedStoreName = await store.encrypt({
      string: encodeURIComponent(encodeURI(storeName.value)),
      keyiv: keyiv.value
    });

    const response = await fetch(`${import.meta.env.VITE_APP_APPLICATION_ENDPOINT}/store-settings-async`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        storeName: encryptedStoreName,
        fingerprint: fingerprint.value,
        keyivId: keyivId.value,
        store_id: currentStore.value.store_id,
        property: parameter,
        value: value,
      }),
    });

    const data = await response.json();

    if (data.proceed === true) {
      store.getStores();
    } else {
      message.value = data.debug ? data.debug : "There was a problem with the information provided.";
    }
  } catch (error) {
    message.value = `Error: ${error}`;
    console.error("Error:", error);
  } finally {
    if (workingParam === 'settingPaymentPage') {
      settingPaymentPage.value = false;
    } else if (workingParam === 'settingEmailRequired') {
      settingEmailRequired.value = false;
    }
  }

  return value;
};

const showCode = async (id) => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });

  modal.value.payload = await document.getElementById(id).innerHTML
    .replace(/</g, "\n\n<")
    .replace(/&quot;/g, '\'');

  modal.value.name = "HTML Code";
};

const copyCode = (id) => {
  const copied = document.getElementById(id).innerHTML;
  const workspace = document.getElementById("copy_to_clipboard_workspace");

  workspace.value = copied;
  workspace.focus();
  workspace.select();

  try {
    if (document.execCommand("copy")) {
      dynamicCopied.value = copied;

      if (id === 'basicButton') {
        basicCodeCopied.value = true;
      } else if (id === 'dynamicButton') {
        dynamicCodeCopied.value = true;
      }
    }
  } catch (e) {
    console.error(e);
  }
};

const _decode = (string) => {
  return decodeURIComponent(decodeURI(string));
};

const _null = () => {
  return false;
};

const accordianIndexSet = (number) => {
  accordianIndex.value = accordianIndex.value === number ? -1 : number;
  if (accordianIndex.value === 3) {
    loadApiKeys();
  }
};

const apiKeyRequest = async (path, body = {}) => {
  const username = await store.encrypt({
    string: user.value,
    keyiv: keyiv.value
  });

  const response = await fetch(apiUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fingerprint: fingerprint.value,
      username,
      keyivId: keyivId.value,
      store_id: currentStore.value.store_id,
      ...body,
    }),
  });
  return response.json();
};

const loadApiKeys = async () => {
  if (!currentStore.value) {
    return;
  }

  apiKeyWorking.value = true;
  apiKeyMessage.value = '';
  try {
    const data = await apiKeyRequest('/store-api-keys');
    if (data.proceed) {
      apiKeys.value = data.keys || [];
    } else {
      apiKeyMessage.value = data.debug || 'Unable to load API credentials.';
    }
  } catch (error) {
    apiKeyMessage.value = 'Unable to load API credentials.';
    console.error(error);
  } finally {
    apiKeyWorking.value = false;
  }
};

const createApiKey = async () => {
  if (!apiKeyNickname.value.trim() || !apiKeyPermissions.value.length || apiKeyWorking.value) {
    apiKeyMessage.value = 'Enter a nickname and select at least one permission.';
    return;
  }

  apiKeyWorking.value = true;
  apiKeyMessage.value = '';
  apiKeyCopied.value = false;
  try {
    const data = await apiKeyRequest('/store-api-keys-create', {
      nickname: apiKeyNickname.value.trim(),
      permissions: apiKeyPermissions.value,
    });
    if (data.proceed && data.key) {
      generatedApiKey.value = data.key;
      apiKeyNickname.value = '';
      apiKeyMessage.value = data.debug || '';
      await loadApiKeys();
    } else {
      apiKeyMessage.value = data.debug || 'Unable to create API credentials.';
    }
  } catch (error) {
    apiKeyMessage.value = 'Unable to create API credentials.';
    console.error(error);
  } finally {
    apiKeyWorking.value = false;
  }
};

const revokeApiKey = async (apiKey) => {
  if (!window.confirm(`Revoke the API key “${apiKey.nickname}”? Integrations using it will stop working.`)) {
    return;
  }

  apiKeyWorking.value = true;
  apiKeyMessage.value = '';
  try {
    const data = await apiKeyRequest('/store-api-keys-revoke', { key_id: apiKey.id });
    apiKeyMessage.value = data.debug || '';
    if (data.proceed) {
      await loadApiKeys();
    }
  } catch (error) {
    apiKeyMessage.value = 'Unable to revoke API credentials.';
    console.error(error);
  } finally {
    apiKeyWorking.value = false;
  }
};

const copyApiKey = async () => {
  if (!generatedApiKey.value?.secret) {
    return;
  }

  try {
    await navigator.clipboard.writeText(generatedApiKey.value.secret);
    apiKeyCopied.value = true;
  } catch (error) {
    apiKeyMessage.value = 'Copy failed. Select the key manually.';
    console.error(error);
  }
};

const formatApiKeyDate = (date) => {
  if (!date) return 'never';
  return new Date(date).toLocaleDateString();
};

const closeModal = () => {
  modal.value.payload = false;
  modal.value.name = false;
};

// Lifecycle hooks
onMounted(() => {
  init();
});
</script>

<style lang="scss">
.code-block {
  max-width: 500px;
  max-height: 60vh;
  line-break: anywhere;
  line-height: 1.5;
  font-size: .8rem;
  overflow: scroll;
  white-space: pre-line;
  white-space: pre-wrap;
  background: #000;
  color: #fefefe;
  font-family: "Fira Code", "Courier New", monospace;
  padding: 1rem;
}

.button-preview {
  margin: 2rem 0 1rem 0;
}

.api-permissions-label {
  margin-top: 1rem;
}

.api-permissions {
  display: grid;
  gap: 0.5rem;
  margin: 0.75rem 0 1rem;
}

.api-permission {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.api-permission input {
  width: auto;
}

.api-key-reveal {
  border: 1px solid var(--green);
  background: var(--green-bg);
}

.api-key-secret {
  overflow-wrap: anywhere;
  margin: 0.75rem 0;
  padding: 0.75rem;
  color: var(--white);
  background: var(--input-background);
  font-family: "Fira Code", "Courier New", monospace;
  font-size: 0.8rem;
}

.api-key-list {
  display: grid;
  gap: 0.75rem;
}

.api-key-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem;
  border: 1px solid var(--dark);
}

.api-key-row > div {
  display: grid;
  gap: 0.25rem;
  min-width: 0;
}

.api-key-row .help-text {
  overflow-wrap: anywhere;
}

.api-key-row.revoked {
  opacity: 0.55;
}
</style>
