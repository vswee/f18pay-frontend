<template>
  <div class="store-management" v-if="currentStore">
    <h1>
      <div class="store-icon" v-if="currentStore.store_logo" :style="`background-image: url(${currentStore.storeLogo});`" ></div>
      <span>{{ _decode(currentStore.store_name) }}</span>
      <span :class="'badge ' + currentStore.network">{{ currentStore.network }}</span>
    </h1>
    <h2>{{ currentStore.sum || '0.00' }} {{ currentStore.network.toUpperCase() }}</h2>
    <small :class="currentStore.deleted == 1 ? 'status bad' : 'status good'">
      {{ currentStore.deleted == 1 ? 'Disabled' : 'Active' }}
    </small>
    <p class="help-text">
      <i class="fas fa-info-circle"></i> F18Pay only monitors incoming transactions on addresses generated on the
      platform.<br />
      Your store balance will not reflect any outgoing transactions (sweeps, spends).
    </p>
    <div v-if="chart.chartData" class="subsect">
      <h3>Invoice Statistics</h3>
      <p class="help-text">Displays paid v total invoices generated over the last 6 months.</p>
      <BarGraph v-if="chart.chartData && !chartDestroy" class="graph" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted , reactive} from 'vue';
import { useStore } from 'vuex';
import {useRoute} from 'vue-router'
import BarGraph from '../BarGraph.vue'
const route = useRoute()
const store = useStore();
const invoice_values = ref(false);
const invoice_values2 = ref(false);
const invoice_dates = ref(false);
const chartDestroy = ref(false);
const state = {message:false,}

const session = computed(() => store.getters.session);
const fingerprint = computed(() => store.getters.fingerprint);
const user = computed(() => store.getters.user);
const keyiv = computed(() => store.getters.keyiv);
const keyivId = computed(() => store.getters.keyivId);
const chart = computed(() => store.getters.chart);
const stores = computed(() => store.getters.stores);

const currentStore = computed(() => {
  let current = false;
  for (const store of stores.value) {
    console.log(`${store.store_id.substring(0,5)}${store.store_id.substring(store.store_id.length-5)}`, route.params.storeId10)
    if (`${store.store_id.substring(0,5)}${store.store_id.substring(store.store_id.length-5)}` === route.params.storeId10) {
      current = store;
      let bufferArray = new Uint8Array(current.store_logo.data)
      let base64String = arrayBufferToBase64(bufferArray)
      let storeLogo = `data:image/png;base64,${base64String}`
      current.storeLogo = storeLogo
      break;
    }
  }
  return current;
});

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

watch(currentStore, (val) => {
  fetchInvoiceValues(val.store_id);
});

onMounted(() => {
  document.querySelector('.dynamic-cta-header-space') && (document.querySelector('.dynamic-cta-header-space').innerHTML = '');
  fetchInvoiceValues(currentStore.value.store_id);
});


const _decode = (string) => {
  let decoded = decodeURIComponent(decodeURI(string));
  return decoded;
};

const fetchInvoiceValues = async (id) => {
  chartDestroy.value = true;
  store.commit("setChart", {
    chartData: false,
    options: false
  });

  const username = await store.dispatch('encrypt', {
    string: user.value,
    keyiv: keyiv.value
  });

  try {
    const response = await fetch(import.meta.env.VITE_APPLICATION_ENDPOINT + "/store-invoice-values", {
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
    });

    const data = await response.json();

    if (data.proceed == true) {
      let array = [];
      let array2 = [];
      let arrayDates = [];
      const year = new Date().getFullYear();

      if (data.invoiceValues.length > 0) {
        for (const invoice of data.invoiceValues) {
          let value = invoice.count ? Number(invoice.count) : 0;
          let value2 = invoice.count2 ? Number(invoice.count2) : 0;
          let date = invoice.date.split(" ")[0] == year ? invoice.date.replace(year + ' ', '') : invoice.date;
          array.push(value);
          array2.push(value2);
          arrayDates.push(date);
        }

        invoice_values.value = array.length == 0 ? false : array;
        invoice_values2.value = array2.length == 0 ? false : array2;
        invoice_dates.value = arrayDates.length == 0 ? false : arrayDates;

        store.commit("setChart", {
          chartData: {
            labels: invoice_dates.value,
            datasets: [{
              data: invoice_values.value,
              label: "Paid Invoices",
              backgroundColor: "#19d87f"
            },
            {
              data: invoice_values2.value,
              label: "Total Invoices",
              backgroundColor: "#4780fa"
            },
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
        });

        chartDestroy.value = false;
      }
    } else {
     state.message = "Failed to fetch values";
    }
  } catch (error) {
   state.message = this.message.value + ' \nError: ' + error + '\n';
    console.error("Error:", error);
  }
};
</script>

<style lang="">

</style>
