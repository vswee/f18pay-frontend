<template>
  <main class="invoice-page">
    <section id="invoice" class="invoice-shell" :style="themeStyle">
      <header class="invoice-header">
        <div class="brand-lockup">
          <span class="brand-mark" aria-hidden="true">F</span>
          <span class="brand-name">F18 Pay</span>
        </div>
        <span class="secure-label"><span class="secure-dot"></span> Secure checkout</span>
      </header>

      <section class="status-card" :class="{ expired: !state.verifyInvoiceValidTime }" aria-live="polite">
        <div class="status-heading">
          <span class="status-indicator" :class="{ spinning: state.verifyInvoiceValidTime }" aria-hidden="true"></span>
          <strong>{{ state.verifyInvoiceValidTime ? 'Awaiting payment' : 'Invoice expired' }}</strong>
          <span v-if="state.verifyInvoiceValidTime" class="countdown-time">{{ countdown }}</span>
        </div>
        <div v-if="state.verifyInvoiceValidTime" class="progress-track" aria-hidden="true">
          <span class="progress-value" :style="{ width: `${progress}%` }"></span>
        </div>
      </section>

      <section v-if="!isPaid" class="invoice-content">
        <div class="merchant-row">
          <span class="merchant-avatar">{{ merchantInitial }}</span>
          <div>
            <p class="eyebrow">Payment request</p>
            <h1>{{ activeStoreName }}</h1>
          </div>
          <span class="network-pill">{{ activePaymentOption.crypto || 'Crypto' }}</span>
        </div>

        <div class="amount-card">
          <div>
            <p class="eyebrow">Amount due</p>
            <p class="amount-value">{{ cryptoAmount }} <span>{{ activePaymentOption.crypto }}</span></p>
            <p v-if="fiatAmount" class="fiat-value">≈ {{ fiatAmount }} {{ invoice.fiatShortName }}</p>
          </div>
          <span class="amount-symbol">{{ cryptoSymbol }}</span>
        </div>

        <section v-if="paymentOptions.length > 1" class="payment-methods" aria-labelledby="payment-method-heading">
          <div class="section-heading">
            <div>
              <p class="eyebrow">Payment method</p>
              <h2 id="payment-method-heading">Choose how to pay</h2>
            </div>
            <span class="method-count">{{ paymentOptions.length }} options</span>
          </div>
          <div class="payment-option-list">
            <button
              v-for="(option, index) in paymentOptions"
              :key="option.id || `${option.storeId}-${option.crypto}-${index}`"
              type="button"
              :class="['payment-option', { selected: selectedPaymentOption === index }]"
              @click="selectPaymentOption(index)"
            >
              <span class="option-icon">{{ cryptoSymbolFor(option.crypto) }}</span>
              <span class="option-copy">
                <strong>{{ option.crypto || 'Crypto' }}</strong>
                <small>{{ decodeText(option.storeName || activeStoreName) }}</small>
              </span>
              <span class="option-amount">{{ formatCryptoAmount(option.amount, option.fee) }} {{ option.crypto }}</span>
              <span class="option-check" aria-hidden="true">✓</span>
            </button>
          </div>
        </section>

        <dl class="invoice-details">
          <div v-if="invoice.tx2" class="detail-row">
            <dt>Reference</dt>
            <dd>{{ invoice.tx2 }}</dd>
          </div>
          <div v-if="invoice.fiatValue" class="detail-row">
            <dt>Invoice value</dt>
            <dd>{{ invoice.fiatValue }} {{ invoice.fiatShortName }}</dd>
          </div>
          <div v-if="activePaymentOption.exchange" class="detail-row">
            <dt>Exchange rate</dt>
            <dd>1 {{ activePaymentOption.crypto }} = {{ activePaymentOption.exchange }} {{ invoice.fiatShortName }}</dd>
          </div>
          <div v-if="Number(activePaymentOption.fee || 0) > 0" class="detail-row">
            <dt>Network fee</dt>
            <dd>{{ formatCryptoAmount(0, activePaymentOption.fee) }} {{ activePaymentOption.crypto }}</dd>
          </div>
        </dl>

        <div v-if="!state.verifyInvoiceValidTime" class="response expired-response">
          <h2>What happened?</h2>
          <p>This invoice has expired before a payment was received. If you have already sent the payment, it may be delayed by network conditions.</p>
        </div>

        <div v-else-if="requiresEmail" class="email-panel">
          <div class="payment-heading">
            <span class="step-number">1</span>
            <div><p class="eyebrow">Before you continue</p><h2>Email required</h2></div>
          </div>
          <form :action="`?${window.location.search}`" method="post">
            <input name="email" type="email" class="form-input" placeholder="mail@example.com" required />
            <p class="help-text">This store requires a valid email address before you can proceed.</p>
            <button class="primary-button" type="submit">Continue <span>→</span></button>
          </form>
        </div>

        <section v-else class="payment-panel" aria-labelledby="scan-heading">
          <div class="payment-heading">
            <span class="step-number">1</span>
            <div><p class="eyebrow">Pay with {{ activePaymentOption.crypto }}</p><h2 id="scan-heading">Scan to pay</h2></div>
          </div>
          <p class="instruction">Scan the QR code with your wallet, or copy the address below.</p>
          <div class="qr-frame">
            <QrcodeVue :value="qrCode" :size="state.qrCodeWidth" level="H" foreground="#111827" />
          </div>
          <div class="address-field">
            <span class="address-label">Wallet address</span>
            <span class="address-value">{{ activePaymentOption.address }}</span>
            <button type="button" class="copy-button" @click="copyAddress">
              <span>{{ copiedAddress ? 'Copied' : 'Copy' }}</span>
            </button>
          </div>
          <a id="payLink" :href="payLink" class="primary-button wallet-button">Open in wallet <span>↗</span></a>
          <p class="security-note"><span>✓</span> Your payment is verified on the blockchain.</p>
        </section>
      </section>

      <section v-else class="success-panel">
        <div class="success-mark">✓</div>
        <p class="eyebrow">Payment received</p>
        <h1>Thank you</h1>
        <p>Your payment has been detected and is being confirmed on the network.</p>
        <a v-if="invoice.redirectURL" class="primary-button" :href="invoice.redirectURL">Continue <span>→</span></a>
        <button v-else class="primary-button" type="button" @click="closeWindow">Completed</button>
        <a v-if="state.tx3" class="transaction-link" :href="`https://mempool.space/tx/${state.tx3}`" target="_blank" rel="noreferrer">View transaction ↗</a>
      </section>

      <footer class="invoice-footer">Powered by <strong>F18 Pay</strong></footer>
    </section>
    <input id="copy_to_clipboard_workspace" class="copy-workspace" :value="activePaymentOption.address" readonly />
  </main>
</template>

<script setup>
import { computed, defineProps, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import QrcodeVue from 'qrcode.vue'

const props = defineProps({ invoiceData: { type: Object, default: () => ({}) } })
const invoice = reactive({ ...(props.invoiceData || {}) })
const selectedPaymentOption = ref(0)
const copiedAddress = ref(false)
const state = reactive({
  invoiceStatusInterval: null,
  invoiceStatusIntervalIterations: 0,
  timingFunction: null,
  minutes: 0,
  seconds: 0,
  pcTimeLeft: Math.max(0, Number(invoice.end || 0) - Number(invoice.now || Math.floor(Date.now() / 1000))),
  fullTime: Math.max(1, Number(invoice.end || 0) - Number(invoice.created || Math.floor(Date.now() / 1000))),
  verifyInvoiceValidTime: Number(invoice.end || 0) > Math.floor(Date.now() / 1000),
  qrCodeWidth: 280,
  statusInt: 0,
  status: false,
  tx3: false,
  error: false,
})

const normaliseColour = (value, fallback) => {
  const colour = String(value || '').trim().replace(/^#/, '')
  if (/^[0-9a-f]{3}$/i.test(colour)) return `#${colour.split('').map((char) => char + char).join('')}`
  if (/^[0-9a-f]{6}$/i.test(colour)) return `#${colour}`
  return fallback
}

const decodeText = (value) => {
  try { return decodeURI(decodeURIComponent(String(value || ''))) } catch { return String(value || '') }
}

const basePaymentOption = computed(() => ({
  crypto: invoice.cryptoShortName,
  amount: invoice.btc_value || invoice.total,
  fee: invoice.fee,
  address: invoice.address,
  exchange: invoice.exchange,
  storeName: invoice.storeName,
  storeColour: invoice.store?.colour,
  storeAccentColour: invoice.store?.accent_colour,
  requiresEmail: invoice.requiresEmail === true || invoice.requiresEmail === 1,
}))

const paymentOptions = computed(() => invoice.paymentOptions?.length ? invoice.paymentOptions : [basePaymentOption.value])
const activePaymentOption = computed(() => paymentOptions.value[selectedPaymentOption.value] || paymentOptions.value[0] || basePaymentOption.value)
const activeStoreName = computed(() => decodeText(activePaymentOption.value.storeName || invoice.storeName || 'F18 Pay'))
const merchantInitial = computed(() => activeStoreName.value.charAt(0).toUpperCase() || 'F')
const fiatAmount = computed(() => invoice.fiatValue || '')
const isPaid = computed(() => Number(state.statusInt) >= 2)
const requiresEmail = computed(() => activePaymentOption.value.requiresEmail === true || activePaymentOption.value.requiresEmail === 1 || invoice.requiresEmail === true || invoice.requiresEmail === 1)
const cryptoSymbolFor = (crypto) => String(crypto || '').toUpperCase() === 'BTC' ? '₿' : String(crypto || '₿').slice(0, 1).toUpperCase()
const cryptoSymbol = computed(() => cryptoSymbolFor(activePaymentOption.value.crypto))

const numericAmount = (value) => Number(value || 0)
const formatCryptoAmount = (amount, fee = 0) => {
  const total = numericAmount(amount) + numericAmount(fee)
  return total.toFixed(8).replace(/0+$/, '').replace(/\.$/, '')
}
const cryptoAmount = computed(() => formatCryptoAmount(activePaymentOption.value.amount, activePaymentOption.value.fee))
const countdown = computed(() => `${String(state.minutes).padStart(2, '0')}:${String(state.seconds).padStart(2, '0')}`)
const progress = computed(() => Math.max(0, Math.min(100, (state.pcTimeLeft / state.fullTime) * 100)))

const activeColour = computed(() => normaliseColour(activePaymentOption.value.storeColour || invoice.store?.colour, '#5b45d6'))
const activeAccent = computed(() => normaliseColour(activePaymentOption.value.storeAccentColour || invoice.store?.accent_colour, '#4797ff'))
const themeStyle = computed(() => ({
  '--primary': activeColour.value,
  '--accent': activeAccent.value,
  '--primary-soft': `${activeColour.value}12`,
  '--primary-border': `${activeColour.value}30`,
  '--accent-soft': `${activeAccent.value}16`,
}))

const networkScheme = computed(() => String(activePaymentOption.value.crypto || invoice.cryptoShortName || 'BTC').toUpperCase() === 'BTC' ? 'bitcoin' : 'eth')
const paymentTotal = computed(() => numericAmount(activePaymentOption.value.amount || invoice.btc_value || invoice.total) + numericAmount(activePaymentOption.value.fee || invoice.fee))
const paymentUri = computed(() => `${networkScheme.value}:${activePaymentOption.value.address || invoice.address}?amount=${paymentTotal.value.toFixed(16)}&label=${encodeURIComponent(activeStoreName.value)}&message=${encodeURIComponent(invoice.tx2 || '')}`)
const qrCode = computed(() => paymentUri.value)
const payLink = computed(() => paymentUri.value)

const selectPaymentOption = (index) => {
  if (paymentOptions.value[index]) selectedPaymentOption.value = index
}

const copyAddress = async () => {
  const address = activePaymentOption.value.address || ''
  try {
    await navigator.clipboard.writeText(address)
  } catch {
    const input = document.getElementById('copy_to_clipboard_workspace')
    input.focus()
    input.select()
    document.execCommand('copy')
  }
  copiedAddress.value = true
  window.setTimeout(() => { copiedAddress.value = false }, 1800)
}

const invoiceStatus = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_APP_APPLICATION_ENDPOINT}/invoice-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoice_id: invoice.invoiceId, payment_option_id: activePaymentOption.value.id || undefined }),
    })
    const data = await response.json()
    if (data.status) {
      state.status = data.status
      state.statusInt = data.statusInt
      state.tx3 = data.tx3 || false
      if (Number(data.statusInt) < 2 && state.verifyInvoiceValidTime) scheduleStatusCheck()
    } else state.error = data.statusText || 'No invoice found'
  } catch (error) {
    state.error = 'Failed to fetch invoice'
    console.error(error)
  }
}

const scheduleStatusCheck = () => {
  clearTimeout(state.invoiceStatusInterval)
  const delay = 5000 + (state.invoiceStatusIntervalIterations * 1000)
  state.invoiceStatusInterval = window.setTimeout(async () => {
    state.invoiceStatusIntervalIterations = state.invoiceStatusIntervalIterations >= 5 ? 0 : state.invoiceStatusIntervalIterations + 1
    await invoiceStatus()
  }, delay)
}

const updateCountdown = () => {
  state.pcTimeLeft = Math.max(0, state.pcTimeLeft - 1)
  state.minutes = Math.floor(state.pcTimeLeft / 60)
  state.seconds = state.pcTimeLeft % 60
  if (state.pcTimeLeft <= 0) {
    state.verifyInvoiceValidTime = false
    clearInterval(state.timingFunction)
    clearTimeout(state.invoiceStatusInterval)
  }
}

const layout = () => {
  const invoiceElement = document.getElementById('invoice')
  if (!invoiceElement) return
  state.qrCodeWidth = Math.max(180, Math.min(280, invoiceElement.clientWidth - 96))
}

const closeWindow = () => window.close()

onMounted(() => {
  layout()
  window.addEventListener('resize', layout)
  state.timingFunction = window.setInterval(updateCountdown, 1000)
  scheduleStatusCheck()
})

onBeforeUnmount(() => {
  clearInterval(state.timingFunction)
  clearTimeout(state.invoiceStatusInterval)
  window.removeEventListener('resize', layout)
})
</script>

<style scoped lang="scss">
:global(body) { margin: 0; }

.invoice-page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 32px 16px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: #f5f5fb;
  color: #172033;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.invoice-shell {
  width: min(100%, 480px);
  overflow: hidden;
  border: 1px solid var(--primary-border);
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 24px 64px rgba(37, 34, 78, .12), 0 4px 12px rgba(37, 34, 78, .05);
}

.invoice-header, .invoice-content, .success-panel { padding-left: 28px; padding-right: 28px; }
.invoice-header { display: flex; justify-content: space-between; align-items: center; padding-top: 25px; padding-bottom: 22px; }
.brand-lockup, .secure-label, .status-heading, .merchant-row, .section-heading, .payment-heading, .security-note { display: flex; align-items: center; }
.brand-mark { display: grid; place-items: center; width: 28px; height: 28px; margin-right: 8px; border-radius: 9px; background: var(--primary); color: #fff; font-weight: 800; font-size: 16px; }
.brand-name { color: #222b3f; font-size: 16px; font-weight: 750; letter-spacing: -.02em; }
.secure-label { gap: 6px; color: #6a7283; font-size: 11px; font-weight: 650; }
.secure-dot { width: 6px; height: 6px; border-radius: 50%; background: #42b883; }
.status-card { padding: 14px 28px 16px; background: var(--primary-soft); color: var(--primary); }
.status-card.expired { background: #f8eaea; color: #b54747; }
.status-heading { gap: 8px; font-size: 13px; }
.status-indicator { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
.status-indicator.spinning { box-shadow: 0 0 0 4px var(--primary-border); }
.countdown-time { margin-left: auto; font-variant-numeric: tabular-nums; font-weight: 750; }
.progress-track { height: 3px; margin-top: 12px; overflow: hidden; border-radius: 3px; background: rgba(91, 69, 214, .13); }
.progress-value { display: block; height: 100%; border-radius: inherit; background: var(--primary); transition: width .4s ease; }
.invoice-content { padding-top: 26px; padding-bottom: 18px; }
.merchant-row { gap: 12px; }
.merchant-avatar { display: grid; place-items: center; flex: 0 0 42px; width: 42px; height: 42px; border-radius: 13px; background: var(--accent-soft); color: var(--primary); font-size: 17px; font-weight: 800; }
.merchant-row h1, .section-heading h2, .payment-heading h2, .success-panel h1 { margin: 2px 0 0; color: #1b2436; font-size: 17px; line-height: 1.2; letter-spacing: -.025em; }
.network-pill { margin-left: auto; padding: 6px 9px; border: 1px solid var(--primary-border); border-radius: 99px; color: var(--primary); font-size: 11px; font-weight: 750; }
.eyebrow { margin: 0; color: #8991a1; font-size: 10px; font-weight: 800; letter-spacing: .1em; line-height: 1.2; text-transform: uppercase; }
.amount-card { display: flex; align-items: center; justify-content: space-between; margin: 24px 0 23px; padding: 20px; border-radius: 17px; background: linear-gradient(135deg, var(--primary-soft), var(--accent-soft)); }
.amount-value { margin: 7px 0 0; color: #161d2d; font-size: 30px; font-weight: 800; letter-spacing: -.055em; line-height: 1; }
.amount-value span { margin-left: 4px; color: var(--primary); font-size: 14px; letter-spacing: 0; }
.fiat-value { margin: 8px 0 0; color: #687184; font-size: 12px; }
.amount-symbol { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 14px; background: var(--primary); color: #fff; font-size: 25px; font-weight: 700; }
.payment-methods { padding-top: 2px; }
.section-heading { justify-content: space-between; margin-bottom: 11px; }
.method-count { color: #9299a8; font-size: 11px; }
.payment-option-list { display: grid; gap: 8px; }
.payment-option { width: 100%; display: flex; align-items: center; gap: 10px; padding: 11px; border: 1px solid #e9ebf1; border-radius: 13px; background: #fff; color: #20283a; text-align: left; cursor: pointer; transition: border-color .2s ease, background .2s ease, box-shadow .2s ease; }
.payment-option:hover, .payment-option.selected { border-color: var(--primary); background: var(--primary-soft); box-shadow: 0 4px 12px rgba(37, 34, 78, .05); }
.option-icon { display: grid; place-items: center; flex: 0 0 30px; width: 30px; height: 30px; border-radius: 9px; background: var(--accent-soft); color: var(--primary); font-size: 17px; font-weight: 750; }
.option-copy { display: grid; min-width: 0; gap: 3px; }
.option-copy strong { font-size: 13px; }
.option-copy small { overflow: hidden; color: #858d9d; font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
.option-amount { margin-left: auto; color: #687184; font-size: 11px; white-space: nowrap; }
.option-check { display: grid; place-items: center; width: 18px; height: 18px; border: 1px solid #dfe2e9; border-radius: 50%; color: transparent; font-size: 11px; }
.payment-option.selected .option-check { border-color: var(--primary); background: var(--primary); color: #fff; }
.invoice-details { display: grid; gap: 10px; margin: 22px 0 24px; padding: 16px 0; border-top: 1px solid #eef0f4; border-bottom: 1px solid #eef0f4; }
.detail-row { display: flex; justify-content: space-between; gap: 20px; color: #81899a; font-size: 11px; }
.detail-row dd { margin: 0; color: #354055; font-weight: 650; text-align: right; }
.payment-panel, .email-panel { padding-top: 2px; }
.payment-heading { gap: 10px; }
.step-number { display: grid; place-items: center; width: 25px; height: 25px; border-radius: 8px; background: var(--primary); color: #fff; font-size: 11px; font-weight: 800; }
.instruction, .response p, .success-panel > p:not(.eyebrow) { margin: 12px 0 18px; color: #747e90; font-size: 12px; line-height: 1.55; }
.qr-frame { display: grid; place-items: center; margin: 15px auto 17px; padding: 18px; width: fit-content; border: 1px solid #eef0f4; border-radius: 18px; background: #fff; box-shadow: 0 8px 24px rgba(31, 38, 61, .06); }
.qr-frame :deep(canvas), .qr-frame :deep(svg) { display: block; max-width: 100%; height: auto; }
.address-field { display: grid; grid-template-columns: 1fr auto; gap: 5px 10px; align-items: center; padding: 12px 13px; border: 1px solid #e4e7ed; border-radius: 12px; }
.address-label { grid-column: 1 / -1; color: #99a0ae; font-size: 10px; font-weight: 750; text-transform: uppercase; letter-spacing: .06em; }
.address-value { min-width: 0; overflow: hidden; color: #4b566b; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
.copy-button { border: 0; background: transparent; color: var(--primary); font-size: 11px; font-weight: 750; cursor: pointer; }
.primary-button { display: flex; align-items: center; justify-content: center; gap: 10px; box-sizing: border-box; width: 100%; margin-top: 12px; padding: 13px 16px; border: 0; border-radius: 11px; background: var(--primary); color: #fff; font-size: 13px; font-weight: 750; text-decoration: none; cursor: pointer; transition: filter .2s ease, transform .2s ease; }
.primary-button:hover { filter: brightness(.94); transform: translateY(-1px); }
.wallet-button { margin-top: 10px; }
.security-note { justify-content: center; gap: 6px; margin: 14px 0 0; color: #8992a1; font-size: 10px; }
.security-note span { color: #42a879; font-weight: 800; }
.expired-response { margin: 15px 0 0; padding: 16px; border-radius: 13px; background: #fff5f5; }
.response h2 { margin: 0; color: #923f3f; font-size: 14px; }
.email-panel { margin-top: 8px; }
.form-input { box-sizing: border-box; width: 100%; margin-top: 17px; padding: 12px 13px; border: 1px solid #dfe3eb; border-radius: 11px; color: #283246; font: inherit; font-size: 12px; }
.help-text { margin: 8px 0 0; color: #858d9d; font-size: 11px; }
.success-panel { padding-top: 62px; padding-bottom: 54px; text-align: center; }
.success-mark { display: grid; place-items: center; width: 68px; height: 68px; margin: 0 auto 20px; border-radius: 22px; background: #e8f7ee; color: #2e9f66; font-size: 36px; font-weight: 500; }
.success-panel h1 { margin-top: 8px; font-size: 28px; }
.success-panel > p:not(.eyebrow) { max-width: 280px; margin: 13px auto 25px; }
.transaction-link { display: inline-block; margin-top: 17px; color: var(--primary); font-size: 11px; font-weight: 700; text-decoration: none; }
.invoice-footer { padding: 16px 28px 21px; color: #a0a6b2; font-size: 10px; text-align: center; }
.invoice-footer strong { color: #70798a; }
.copy-workspace { position: fixed; top: 100vh; width: 1px; height: 1px; opacity: 0; }

@media (max-width: 420px) {
  .invoice-page { padding: 0; }
  .invoice-shell { min-height: 100vh; border: 0; border-radius: 0; }
  .invoice-header, .invoice-content, .success-panel { padding-left: 22px; padding-right: 22px; }
  .status-card { padding-left: 22px; padding-right: 22px; }
}
</style>
