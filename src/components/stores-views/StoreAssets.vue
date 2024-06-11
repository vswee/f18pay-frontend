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

<script>
import {
  mapGetters
} from 'vuex';
export default {
  name: "StoreAssets",
  components: {
  },
  data() {
    return {
      modal: {
        name: false,
        payload: false
      },
      message: false,
      working: false,
      accordianIndex: 0,
      supportedCurrencies: ['USD', 'GBP', 'EUR', 'TTD'],
      fixedPrice: 10,
      storePrimaryProxy: '',
      storeSecondaryProxy: '',
      primryColour: false,
      accentColour: false,
      dynamicCopied: false,
      basicCodeCopied: false,
      dynamicCodeCopied: false,
      text: false,
      text2: false,
      settingPaymentPage: false,
      settingEmailRequired: false,
      select: [{
        open: false,
        selected: 'USD',
        options: false
      },],
    }
  },
  watch: {

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
      base_url: 'url',
    }),
    storeCode() {
      return this.activeStore.substr(0, 4) + this.currentStore.store_id_int + this.activeStore.substr(this.activeStore.length - 4)
    },
    random() {
      let random = String(Math.floor(Math.random() * 100) + 2 + "" + new Date().getTime() + Math.floor(Math.random() * 100) + 2 + (Math.random().toString(36).replace(/[^a-zA-Z]+/g, '').substr(0, 5)));
      return random;
    },
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
    textColor() {
      return !this.text ? "#" + this.currentStore.text_primary : "#" + this.text;
    },
    textAccent() {
      return !this.text2 ? "#" + this.currentStore.text_accent : "#" + this.text2;
    },
  },
  mounted() {
    this.init()


  },
  methods: {
    init() {
      document.querySelector('.dynamic-cta-header-space') && (document.querySelector('.dynamic-cta-header-space').innerHTML = '')
      if (this.currentStore.network) { this.supportedCurrencies.push(this.currentStore.network.toUpperCase()) }
      this.select[0].options = this.supportedCurrencies;
      if (this.currentStore.store_colour) { this.storePrimaryProxy = "#" + this.currentStore.store_colour }
      if (this.currentStore.store_accent_colour) { this.storeSecondaryProxy = "#" + this.currentStore.store_accent_colour }
    },
    modernSelect(index, value) {
      this.select[index].selected = value;
      this.select[index].open = false;
    },
    async setPaymentPage(onOff) {
      await this.settingsAsync('payment_page', onOff, 'settingPaymentPage');
    },
    async setPRequireEmail(onOff) {
      await this.settingsAsync('require_email', onOff, 'settingEmailRequired');
    },
    async settingsAsync(parameter, value, working) {
      this[working] = true;
      const username = await this.$store.dispatch('encrypt', {
        string: this.user,
        keyiv: this.keyiv
      });
      const storeName = await this.$store.dispatch('encrypt', {
        string: encodeURIComponent(encodeURI(this.storeName)),
        keyiv: this.keyiv
      });
      await fetch(process.env.VUE_APP_APPLICATION_ENDPOINT + "/store-settings-async", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          storeName: storeName,
          fingerprint: this.fingerprint,
          keyivId: this.keyivId,
          store_id: this.currentStore.store_id,
          property: parameter,
          value: value,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.proceed == true) {
            this.$store.dispatch('getStores')
            this[working] = false;

          } else {
            this.message = data.debug ? data.debug : "There was a problem with the information provided."
          }
        })
        .catch((error) => {
          this.message = this.message + ' \nError: ' + error + '\n';
          console.error("Error:", error);
        });
      return value
    },
    darkOrLight(hex) {
      var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
      });
      let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      let rgb = {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      };
      let brightness = (rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114);
      brightness = brightness / 255000;

      // values range from 0 to 1
      // anything greater than 0.5 should be bright enough for dark text
      console.log(brightness)
      if (brightness >= 0.6) {
        return "222";
      } else {
        return "fefefe";
      }
    },
    async showCode(id) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      this.modal.payload = await document.getElementById(id).innerHTML
        .replace(/</g, "\n\n<")
        .replace(/&quot;/g, '\'')
      this.modal.name = "HTML Code"
    },
    copyCode(id) {
      let copied = document.getElementById(id).innerHTML;
      let workspace = document.getElementById("copy_to_clipboard_workspace");
      (workspace.value = copied),
        workspace.focus(),
        workspace.select();
      try {
        if (document.execCommand("copy")) {
          this.dynamicCopied = copied
          this[id.replace(/Button/g, 'CodeCopied')] = true;
        }
      } catch (e) {
        console.error(e)
      }
    },
    _decode(string) {
      let decoded = decodeURIComponent(decodeURI(string));
      return decoded
    },
    _null() {
      return false
    },
    accordianIndexSet(number) {
      this.accordianIndex = this.accordianIndex == number ? -1 : number;
    },

    closeModal() {
      this.modal.payload = false
      this.modal.name = false
    }
  },
}
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
</style>
