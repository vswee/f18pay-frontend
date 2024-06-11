<template>
  <div class="-main-body-container-theme">
    <div class="body-inner">
      <div id="invoice">
        <div class="ta-c">
          <h1>
            <svg enable-background="new 0 0 200 200" height="30" viewBox="0 0 200 200" width="30"
              xmlns="http://www.w3.org/2000/svg">
              <clipPath id="a">
                <path clip-rule="evenodd"
                  d="m100 10.547c49.37 0 89.453 40.083 89.453 89.453 0 93.284-109.752 139.496-157.332 155.146-5.028 1.597-10.516.699-14.774-2.416s-6.774-8.074-6.774-13.35c-.026-44.211-.026-139.38-.026-139.38 0-49.37 40.083-89.453 89.453-89.453z" />
              </clipPath>
              <g fill="none" transform="matrix(.783337 0 0 1 -354.093 -485.418639)">
                <path d="m452.032 485.419h200.428v200.428h-200.428z" />
                <g transform="matrix(.887335 0 0 .695083 463.512 491.096)">
                  <path
                    d="m100 10.547c49.37 0 89.453 40.083 89.453 89.453 0 93.284-109.752 139.496-157.332 155.146-5.028 1.597-10.516.699-14.774-2.416s-6.774-8.074-6.774-13.35c-.026-44.211-.026-139.38-.026-139.38 0-49.37 40.083-89.453 89.453-89.453z" />
                  <g clip-path="url(#a)" stroke="#4797ff">
                    <path d="m152.859 88.576c0 36.334-29.498 65.832-65.832 65.832-18.819 0-35.804-7.914-47.807-20.592"
                      stroke-width="12.52" transform="matrix(1.8383 0 0 1.8383 -83.7675 -82.1042)" />
                    <circle cx="87.027" cy="88.576" r="65.832" stroke-width="23.27"
                      transform="matrix(.989007 0 0 .989007 -4.79082 -6.87718)" />
                  </g>
                  <path
                    d="m100 10.547c49.37 0 89.453 40.083 89.453 89.453 0 93.284-109.752 139.496-157.332 155.146-5.028 1.597-10.516.699-14.774-2.416s-6.774-8.074-6.774-13.35c-.026-44.211-.026-139.38-.026-139.38 0-49.37 40.083-89.453 89.453-89.453z"
                    stroke="#0051fa" stroke-width="23.02" />
                </g>
              </g>
            </svg>&nbsp;F18 Pay
          </h1>
        </div>
        <div id="perCent">
          <div class="percent-bar" :style="`left:${state.percentTimeLeftSliderPosition * -1}%;`"></div>
          <div v-if="state.verifyInvoiceValidTime" class="spinner"></div>
          <span v-if="state.verifyInvoiceValidTime" class="cb-tx">Awaiting Payment</span>
          <span v-else class="cb-tx">Invoice Expired</span>
          <span id="countdown-time" v-if="state.minutes && state.seconds">{{ state.minutes }}:{{ state.seconds }}</span>
        </div>
        <div id="breakdown">
          <input class="more-less" type="checkbox" checked="checked" />
          <span class="more-less-icon"></span>
          <span class="pri"><b class="store-name">{{ decodeURI(decodeURIComponent(invoice.storeName)) }}</b></span>
          <span class="sec">
            <svg height="17" viewBox="0 0 64 64" width="17" xmlns="http://www.w3.org/2000/svg">
              <g transform="translate(.006309 -.00302)" class="crypto-icon"></g>
            </svg>&nbsp;<span class="currencyLongName">{{ invoice.currencyLongName }}</span>
          </span>
          <span class="pri c-2"><b class="tx2">{{ invoice.tx2 && invoice.tx2 !== 'undefined' ? invoice.tx2 :
            ''
              }}</b></span>
          <span class="pri collapsible">Invoice value</span><span class="sec collapsible"><span class="fiatValue">{{
            invoice.fiatValue }}</span> <i class='-cur'><span class="fiatShortName">{{ invoice.fiatShortName
                }}</span></i></span>
          <span class="pri collapsible">Exchange rate</span><span class="sec collapsible">1 <i class='-cur btc'><span
                class="currencyShortName">{{ invoice.cryptoShortName }}</span></i> : <span class="exchange">{{
                  invoice.exchange }}</span> <i class='-cur'><span class="fiatShortName">{{ invoice.fiatShortName
                }}</span></i></span>
          <span class="pri"><span class="currencyShortName">{{ invoice.cryptoShortName }}</span> Amount
            Due</span><span class="sec total"><span class="total-due">{{ invoice.total }}</span> <i
              class='-cur btc'><span class="currencyShortName">{{ invoice.cryptoShortName }}</span></i></span>
          <span class="pri collapsible">Fee rate</span><span class="sec total collapsible"><span class="fee">{{
            invoice.fee }}</span> <i class='-cur fee-rate'></i></span>
        </div>
        <div id="code_payment_combo" v-if="state.statusInt < 2">
          <div v-if="!state.verifyInvoiceValidTime" class='response bad_'>
            <h3>What happened?</h3>
            <p>This invoice has expired before a payment was received.</p>
            <p>If you have already sent the payment, it may have been delayed due to slow network conditions. We will be
              able to process your payment once the transaction is confirmed by the network. Otherwise, feel free to go
              back and try your transaction again.</p>
          </div>
          <div v-else-if="!state.requiresEmail">
            <div id="qr-code">
              <QrcodeVue :value="invoice.qrCode" :size="state.qrCodeWidth" level="H" :foreground="state.colours.text" />
              <svg class="svg-overlay-btc" height='64' viewBox='0 0 64 64' width='64'
                xmlns='http://www.w3.org/2000/svg'>
                <g transform='translate(.006309 -.00302)' class="crypto-icon"></g>
              </svg>
            </div>
            <div class="address-holder" id="addressBlock">
              <span id="address_" class="address">{{ invoice.address }}</span>
              <button id="copy_to_clipboard">
                <svg id="copyButtonIcon" version="1.1" xmlns="http://www.w3.org/2000/svg"
                  xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="20px" height="20px"
                  viewBox="0 0 20 20" enable-background="new 0 0 20 20" xml:space="preserve">
                  <path d="M14.108,5.543c0.191,0,0.348,0.156,0.348,0.349v11.761c0,0.191-0.156,0.348-0.348,0.348H2.349C2.156,18,2,17.844,2,17.652
	V5.892c0-0.192,0.156-0.349,0.349-0.349H14.108 M14.108,3.543H2.349C1.052,3.543,0,4.595,0,5.892v11.761C0,18.948,1.052,20,2.349,20
	h11.76c1.297,0,2.348-1.052,2.348-2.348V5.892C16.456,4.595,15.405,3.543,14.108,3.543L14.108,3.543z" />
                  <path d="M19,16.505c-0.553,0-1-0.447-1-1V3.414C18,2.634,17.366,2,16.587,2H4.5c-0.552,0-1-0.448-1-1s0.448-1,1-1h12.087
	C18.469,0,20,1.532,20,3.414v12.091C20,16.058,19.553,16.505,19,16.505z" />
                </svg>
              </button>
            </div>
            <a id="payLink" :href="payLink" class="btn">Open in wallet&nbsp;<svg enable-background="new 0 0 20 20"
                height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="m16.158 17.376c0 .214-.175.39-.39.39h-13.143c-.215-.001-.39-.176-.39-.39v-13.145c0-.214.175-.39.39-.39h3.555 2.459c.617 0 1.117-.501 1.117-1.118s-.5-1.118-1.117-1.118h-2.459-3.555c-1.449 0-2.625 1.177-2.625 2.626v13.145c0 1.448 1.176 2.624 2.625 2.624h13.145c1.449 0 2.624-1.176 2.624-2.624v-1.818-1.574-2.062c0-.618-.501-1.118-1.119-1.118-.615 0-1.117.5-1.117 1.118l.001 2.062v1.574z" />
                <path
                  d="m18.247 0h-3.055-2.134c-.684 0-1.239.556-1.239 1.241s.556 1.241 1.239 1.241h2.134.573c.01 0 .018.002.027.003l-10.087 10.088c-.484.483-.484 1.269 0 1.753.483.484 1.27.484 1.754 0l10.06-10.057v1.431 1.118c0 .686.557 1.241 1.241 1.241s1.24-.556 1.24-1.241v-1.118-3.946c0-.968-.786-1.754-1.753-1.754z" />
              </svg></a>
          </div>
          <div v-else class="form-component">
            <form :action="`?${window.location.search}`" method="post">
              <input name="email" type="email" data-val="true"
                data-val-email="The Email field is not a valid e-mail address."
                data-val-maxlength="The field Email must be a string or array type with a maximum length of '50'."
                data-val-maxlength-max="50" data-val-required="The Email field is required." class="form-input"
                placeholder="mail@example.com" required="required" />
              <span class="help-text">This store requires a valid email address before you can proceed.</span>
              <button class="btn">Next <i class="chevron-right"></i></button>
            </form>
          </div>
        </div>
        <div class="combo-class" v-else>

          <svg class="received-confirmation" enable-background="new 0 0 200 200" height="200" viewBox="0 0 200 200"
            width="200" xmlns="http://www.w3.org/2000/svg">
            <path id="confirmPath"
              d="m155.63 25.961c-32.302-24.299-78.024-25.308-111.756.404-40.666 30.997-48.506 89.094-17.509 129.762 30.999 40.667 89.095 48.504 129.762 17.507s48.506-89.092 17.508-129.76l-88.041 88.056-33.734-43.209"
              style="fill:none;stroke:var(--green);stroke-width:13;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10" />
          </svg>

          <a v-if="invoice.redirectURL" class='redirectURL btn' :href="invoice.redirectURL">Continue <i
              class='chevron-right'></i></a>
          <a v-else class='redirectURL btn' onclick='window.close();'>Completed</a>
          <a class="btn-link" title="View transaction on mempool.space blockchain explorer."
            :href="`https://mempool.space/tx/${state.tx3}`" target="_blank2">View transaction&nbsp;<i
              class="fas fa-caret-square-right"></i></a>
        </div>
      </div>
    </div>
    <input id="copy_to_clipboard_workspace"
      style="height:1px; width: 1px; font-size: 1px; opacity:0;position:fixed; top: 100vh; z-index: -100;"
      :value="invoice.address">
  </div>

</template>

<script setup>
// eslint-disable no-unused-vars
import { onMounted, ref, defineProps, reactive } from 'vue';
// eslint-disable-next-line no-unused-vars
import QrcodeVue from 'qrcode.vue'

const props = defineProps({
  invoiceData: Object
});

const invoice = props?.invoiceData

const state = reactive({
  error: false,
  timingFunction: false,
  invoiceStatusInterval: false,
  invoiceStatusIntervalIterations: 0,
  visPer: false,
  visPerL: false,
  minutes: false,
  seconds: false,
  hasAConfirmation: false,
  pcTimeLeft: false,
  fullTime: false,
  secondsElapsed: 0,
  percentTimeLeftSliderPosition: false,
  colours: false,
  verifyInvoiceValidTime: false,
  qrCodeWidth: 280,
  requiresEmail: false,
  status: false,
  statusInt: false,
  tx3: false,
})

if (invoice) {
  state.pcTimeLeft = Number(invoice.end) - Number(invoice.now)
  state.fullTime = Number(invoice.end) - Number(invoice.created)
  state.colours = [invoice.store.colour, invoice.store.accent_colour]
  state.verifyInvoiceValidTime = invoice.created > (Math.floor(Date.now() / 1000) - 900)
  state.invoiceStatusInterval = setTimeout(async () => { await invoiceStatus() }, 5000)

}

const invoiceStatus = async () => {
  try {
    const response = await fetch(`${process.env.VUE_APP_APPLICATION_ENDPOINT}/invoice-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoice_id: invoice.invoiceId,
      })
    })
    const data = await response.json()
    if (data.status) {
      state.status = data.status
      state.statusInt = data.statusInt
      state.tx3 = data.tx3 ? data.tx3 : false
      state.invoiceStatusInterval = state.statusInt < 2 ? setTimeout(async () => { await invoiceStatus() }, 5000 + (state.invoiceStatusIntervalIterations * 1000)) : false
    } else {
      state.error = data.statusText ? data.statusText : 'No invoice found'
    }
  } catch (error) {
    state.error = 'Failed to fetch invoice'
    console.error(error)
  }
  state.invoiceStatusIntervalIterations = state.invoiceStatusIntervalIterations > 5 ? 0 : state.invoiceStatusIntervalIterations
  state.invoiceStatusIntervalIterations++
}

const payLink = ref('');



state.timingFunction = setInterval(() => {
  let timer = state.pcTimeLeft--;
  state.visPer = (state.fullTime / timer * 10).toFixed(2);
  state.visPerL = (100 - (state.fullTime / timer * 10)).toFixed(2);

  state.minutes = parseInt(timer / 60, 10);
  state.seconds = parseInt(timer % 60, 10);

  state.minutes = state.minutes < 10 ? "0" + state.minutes : state.minutes;
  state.seconds = state.seconds < 10 ? "0" + state.seconds : state.seconds;

  let secondsLeft = state.pcTimeLeft - state.secondsElapsed;
  state.percentTimeLeftSliderPosition = Number(((secondsLeft / state.fullTime) * 100) - 10).toFixed(2);

  if (--timer < 0) {
    timer = state.pcTimeLeft;
  }

  if (state.minutes <= 0) {
    invalidate();
  }

  state.secondsElapsed++;
}, 1000);

function invalidate() {
  clearInterval(state.timingFunction)
  clearTimeout(state.invoiceStatusInterval)
  state.verifyInvoiceValidTime = false
}


function darkOrLight(hex, contrast) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  let rgb = { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) };
  let brightness = (rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114);
  brightness = brightness / 255000;

  if (!contrast) {
    return brightness <= 0.6 ? "222" : "fefefe";
  } else {
    return brightness <= 0.6 ? "fefefe" : "222";
  }
}

window.addEventListener("resize", layout)
function layout() {
  let maxW = document.getElementById("invoice").clientWidth;
  maxW -= 80
  maxW = maxW > 0 ? maxW : 280;
  state.qrCodeWidth = maxW
}

onMounted(() => {
  try {
    const invoiceDOM = document.getElementById("invoice")
    invoiceDOM.style.setProperty('--primary', '#' + state.colours[0]);
    invoiceDOM.style.setProperty('--primary-2', '#' + state.colours[0] + '80');
    invoiceDOM.style.setProperty('--primary-3', '#' + state.colours[0] + '60');
    invoiceDOM.style.setProperty('--accent', '#' + state.colours[1]);
    state.colours.text = '#' + darkOrLight('#' + state.colours[0]);
    state.colours.accentText = '#' + darkOrLight('#' + state.colours[1], true);
    state.colours.white = '#' + darkOrLight('#' + state.colours[0], true);
    invoiceDOM.style.setProperty('--text', state.colours.text);
    invoiceDOM.style.setProperty('--accent-text', state.colours.accentText);
    invoiceDOM.style.setProperty('--white', state.colours.white);
    invoiceDOM.style.setProperty('--shadow-20', state.colours.text === "#222" ? 'rgba(15, 33, 133, 0.2)' : '#000');
    invoiceDOM.style.setProperty('--shadow-5', state.colours.text === "#222" ? 'rgba(15, 33, 133, 0.05)' : '#2d2d2d');

    layout()

    payLink.value = `${invoice.cryptoShortName === 'BTC' ? 'bitcoin' : 'eth'}:${invoice.address}?amount=${Number(invoice.btc_value).toFixed(16)}&label=${encodeURIComponent(invoice.storeName)}&message=${invoice.tx2}`;
  } catch (e) { console.log(e) }
});
</script>

<style scoped lang="scss">
@import 'src/assets/css/invoice-style';
</style>
