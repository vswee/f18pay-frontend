<script setup>
import { useRouter, useRoute } from 'vue-router'
import { reactive, onMounted } from 'vue'
// eslint-disable-next-line no-unused-vars
import InvoiceInterface from './InvoiceInterface.vue'
const router = useRouter()
const route = useRoute()
const state = reactive({
  invoice: null,
  loading: true,
  error: null,
})

async function fetchInvoice({ store_id, currency, price, ext, redirectURL }) {
  try {
    const response = await fetch(`${process.env.VUE_APP_APPLICATION_ENDPOINT}/invoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        store_id: store_id,
        currency: currency,
        price: price,
        ext: ext,
        redirectURL: redirectURL,
      })
    })
    const data = await response.json()
    if (data.invoice) {
      state.invoice = data.invoice
      router.push({ name: 'InvoiceAPI', query: { invoice_id: state.invoice.invoiceId } })
    } else {
      state.error = 'No invoice found'
    }
  } catch (error) {
    state.error = 'Failed to fetch invoice'
    console.error(error)
  } finally {
    state.loading = false
  }
}

async function fetchExistingInvoice({ invoice_id, redirectURL }) {
  try {
    const response = await fetch(`${process.env.VUE_APP_APPLICATION_ENDPOINT}/invoice-retrieve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoice_id: invoice_id,
        redirectURL: redirectURL,
      })
    })
    const data = await response.json()
    if (data.invoice) {
      state.invoice = data.invoice
    } else {
      state.error = data.statusText ? data.statusText : 'No invoice found'
    }
  } catch (error) {
    state.error = 'Failed to fetch invoice'
    console.error(error)
  } finally {
    state.loading = false
  }
}

onMounted(() => {
  const { store_id, currency, price, ext, redirectURL, invoice_id } = route.query
  if (invoice_id) {
    fetchExistingInvoice({ invoice_id, redirectURL })
  }
  else if (!store_id) {
    router.push({ name: 'home' })
  } else {
    fetchInvoice({ store_id, currency, price, ext, redirectURL })
  }
})
</script>

<template>
  <div id="main">
    <div class="invoice-wrapper">
      <template v-if="state.loading">
        <a class="spin-fresco"></a>
      </template>
      <template v-else-if="state.error">
        <p>{{ state.error }}</p>
      </template>
      <template v-else>
        <InvoiceInterface :invoiceData="state.invoice" />
      </template>
    </div>
  </div>
</template>

<style lang="scss">
#main {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;

  .invoice-wrapper {
    height: 100%;
    width: 100%;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;

    .spin-fresco {
      &::before {
        content: "";
        position: absolute;
        height: 120px;
        width: 120px;
        border-color: transparent transparent transparent var(--accent);
        border-style: solid;
        border-width: 5px;
        border-radius: 180px;
        animation: spin 1s linear forwards infinite;
        transform-origin: center;
        margin: auto;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      }
    }
  }
}
</style>
