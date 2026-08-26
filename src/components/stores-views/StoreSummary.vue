<template lang="">
<div class="store-management" v-if="currentStore">
  <h1><img class="store-icon" v-if="currentStore.store_logo" :src="parseImgSrc(currentStore.store_logo)"><span>{{_decode(currentStore.store_name)}}</span><span :class="'badge ' + currentStore.network">{{currentStore.network}}</span></h1>
  <h2>{{currentStore.sum || '0.00'}} {{currentStore.network.toUpperCase()}}</h2>
  <small :class="currentStore.deleted==1?'status bad':'status good'">{{currentStore.deleted==1?'Disabled':'Active'}}</small>
  <p class="help-text"><i class="fas fa-info-circle"></i> F18Pay only monitors incoming transactions on addresses generated on the platform.<br>Your store balance will not reflect any outgoing transactions (sweeps, spends).</p>
  <div v-if="chart.chartData" class="subsect">
    <h3>Invoice Statistics</h3>
    <p class="help-text">Displays paid v total invoices generated over the last 6 months.</p>
    <bar-chart v-if="chart.chartData && !chartDestroy" class="graph"></bar-chart>
  </div>
</div>
</template>

<script setup>
import BarChart from '@/components/BarGraph.vue'
import { parseImgSrc } from '@/utils/fn.js'
import { useMainStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const store = useMainStore()

// Reactive state
const invoice_values = ref(false)
const invoice_values2 = ref(false)
const invoice_dates = ref(false)
const chartDestroy = ref(false)

// Store state with storeToRefs for reactivity
const { fingerprint, user, keyiv, keyivId, activeStore, chart, stores } = storeToRefs(store)

// Computed properties
const currentStore = computed(() => {
  let current = false
  if (stores.value) {
    for (const sto of stores.value) {
      if (`${sto.store_id.substring(0, 5)}${sto.store_id.substring(sto.store_id.length - 5)}` === route.params.storeId10) {
        current = sto
        break
      }
    }
    return current
  }
  return false
})

// Methods
const init = () => {
  const headerSpace = document.querySelector('.dynamic-cta-header-space')
  if (headerSpace) {
    headerSpace.innerHTML = ''
  }
  fetchInvoiceValues(activeStore.value)
}

const _decode = (string) => {
  return decodeURIComponent(decodeURI(string))
}

const fetchInvoiceValues = async (id) => {
  chartDestroy.value = true
  store.setChart({
    chartData: false,
    options: false
  })

  try {
    const username = await store.encrypt({
      string: user.value,
      keyiv: keyiv.value
    })

    const response = await fetch(`${import.meta.env.VITE_APP_APPLICATION_ENDPOINT}/store-invoice-values`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        fingerprint: fingerprint.value,
        keyivId: keyivId.value,
        storeId: id,
      }),
    })

    const data = await response.json()

    if (data.proceed === true) {
      // Handle stores data
      const array = []
      const array2 = []
      const arrayDates = []
      const year = new Date().getFullYear()

      if (data.invoiceValues.length > 0) {
        for (const invoice of data.invoiceValues) {
          const value = invoice.count ? Number(invoice.count) : 0
          const value2 = invoice.count2 ? Number(invoice.count2) : 0
          const date = invoice.date.split(" ")[0] == year ? invoice.date.replace(year + ' ', '') : invoice.date

          array.push(value)
          array2.push(value2)
          arrayDates.push(date)
        }

        invoice_values.value = array.length === 0 ? false : array
        invoice_values2.value = array2.length === 0 ? false : array2
        invoice_dates.value = arrayDates.length === 0 ? false : arrayDates

        store.setChart({
          chartData: {
            labels: invoice_dates.value,
            datasets: [
              {
                data: invoice_values.value,
                label: "Paid Invoices",
                backgroundColor: "#19d87f"
              },
              {
                data: invoice_values2.value,
                label: "Total Invoices",
                backgroundColor: "#4780fa"
              }
            ]
          },
          options: {
            scales: {
              yAxes: [{
                ticks: {
                  beginAtZero: false
                },
                gridLines: {
                  display: false
                }
              }],
              xAxes: [{
                gridLines: {
                  display: false
                }
              }]
            },
            legend: {
              display: true
            },
            responsive: true,
            maintainAspectRatio: false
          }
        })

        chartDestroy.value = false
      }
    }
  } catch (error) {
    console.error("Error:", error)
  }
}

// Watchers
watch(currentStore, (val) => {
  fetchInvoiceValues(val)
  init()
})

watch(() => route.path, () => {
  fetchInvoiceValues(activeStore.value)
  init()
})

// Lifecycle hooks
onMounted(() => {
  init()
})
</script>

<style lang="">

</style>
