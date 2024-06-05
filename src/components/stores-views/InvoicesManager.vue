<template>
  <div
    :class="working && spinning ? 'store-management no-click spin-fresco' : (working && !spinning ? 'store-management no-click' : 'store-management')">
    <div :class="working ? 'form page working' : 'form page'" @click.stop="handleClickStop">
      <h1>
        <span>Invoices</span>
        <span :class="'badge ' + currentStore.network">{{ currentStore.network }}</span>
      </h1>

      <div class="message" v-if="message"><i class="fas fa-exclamation-circle"></i> {{ message }}</div>

      <div class="form-section">
        <div class="sub-sect compact">
          <label for="">Invoice Statistics</label>
          <div class="flex info-combo-parent">
            <div class="info-combo" v-for="(stat, key) in statisticsOrganised" :key="key">
              <span class="mono">{{ stat.value }}</span>
              <span>{{ stat.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex">
        <div class="button-cluster">
          <a class="btn refresh-button" @click="getInvoices" title="Refresh"><i class="fas fa-sync"></i></a>
        </div>
        <div class="button-cluster">
          <a class="btn" @click="viewing = 20"><i><i class="fas fa-chevron-left"></i><i
                class="fas fa-chevron-left"></i></i></a>
          <a class="btn" @click="viewing = viewing - 20 < 20 ? 20 : viewing - 20"><i
              class="fas fa-chevron-left"></i></a>
          <a class="">{{ range }} to {{ viewing >= count ? count : viewing }} of {{ count }}</a>
          <a class="btn" @click="viewing = viewing + 20 > count ? count : viewing + 20"><i
              class="fas fa-chevron-right"></i></a>
          <a class="btn" @click="viewing = count"><i><i class="fas fa-chevron-right"></i><i
                class="fas fa-chevron-right"></i></i></a>
        </div>
        <div class="date-range-parent">
          <!-- <date-range-picker ref="picker" v-if="dateRange.startDate" :locale-data="{ firstDay: 1, format: 'dd-mm-yyyy' }" :singleDatePicker="false"
            :timePicker="false" :timePicker24Hour="false" :showWeekNumbers="true" :showDropdowns="false"
            :autoApply="true" v-model="dateRange" @update="getInvoices" :linkedCalendars="false">
          </date-range-picker> -->
          {{ dateRange.startDate }}
        </div>

        <div class="button-cluster">
          <a class="btn" @click="filter = false" title="Clear filters"><i class="fas fa-filter"></i></a>
          <div class="modern-select" @click.stop="select[0].open = !select[0].open">
            <span class="selected">{{ select[0].selected || 'Filter' }} <i v-if="select[0].open"
                class="fas fa-caret-up"></i><i v-else class="fas fa-caret-down"></i></span>
            <ul v-if="select[0].open">
              <li v-for="(value, key) in select[0].options" :key="key"
                @click.stop="modernSelect(0, value); filter = value">{{ value }}</li>
            </ul>
          </div>
        </div>

        <div class="button-cluster" v-if="!working">
          <a class="btn download-file" @click="downloadFile()" title="Download Report"><i
              class="fas fa-file-download"></i></a>
        </div>
      </div>
      <table class="invoice-list">
        <tr>
          <th>#</th>
          <th>ID</th>
          <th>Created</th>
          <th>Value</th>
          <th>Status</th>
        </tr>
        <tr v-for="(invoice, key) in invoices" :class="active == key ? 'list-item active' : 'list-item'"
          @click="active = key" :key="key">
          <td class="mono border-top-left">
            <div>
              <span>{{ key + range }}</span>
            </div>
          </td>
          <td class="mono">
            <div>
              <span>{{ invoice.invoice_id.substr(0, 6) }}</span>
            </div>
          </td>
          <td>
            <div>
              <span>
                <timeago prefix="" suffix="ago" :datetime="invoice.created" lang="en" />
              </span>
              <span v-if="active == key"><small>{{ invoice.created }} [UTC]</small></span>
            </div>
          </td>
          <td>
            <div>
              <span>{{ Number(invoice.invoice_value).toFixed(2) }} <span class="badge">{{ invoice.currency
                  }}</span></span>
              <span v-if="active == key"><small>@{{ invoice.exchange }}</small></span>
            </div>
          </td>
          <td class="border-top-right">
            <div>
              <span :class="'status ' + invoice._status"><i v-if="!invoice._status" class="fas fa-asterisk spin"></i>{{
                invoice._status || '' }}</span>
            </div>
          </td>
        </tr>
        <tr v-for="(invoice, key) in invoices" v-if="active == key" class="list-item active" :key="key + 'ex'">
          <td colSpan="5" class="border-bottom-right border-bottom-left">
            <div class="inline-table-notes">
              <label v-if="invoice.reqToken">Attached to Payment Request:</label><span v-if="invoice.reqToken">{{
                invoice.reqToken.substr(0, 6) }}</span>
              <label v-if="invoice.reqEmail">Payment Request Email:</label><span v-if="invoice.reqEmail">{{
                invoice.reqEmail }}</span>
              <label v-if="invoice.reqDesc">Payment Request Description:</label><span v-if="invoice.reqDesc">{{
                invoice.reqDesc }}</span>
              <label v-if="invoice.tx2">Item:</label><span v-if="invoice.tx2">{{ decode(invoice.tx2) }}</span>
              <label v-if="invoice.payee_email">Payee:</label><span v-if="invoice.payee_email">{{ invoice.payee_email
                }}</span>
              <label>Crypto:</label><span>{{ invoice.btc_value }} {{ invoice.crypto }}</span>
              <label>Address:</label><a target="_blank"
                :href="'https://www.blockchain.com/btc/address/' + invoice.address">{{ invoice.address }} <i
                  class="fas fa-external-link-square-alt"></i></a>
              <label>Received:</label><span>{{ invoice.tx3 }} {{ invoice.crypto }}<br>{{ ((invoice.tx3 /
                invoice.btc_value) * 100).toFixed(2) }} <i class="fas fa-percent"></i></span>
            </div>
          </td>
        </tr>
      </table>
    </div>
    <div>
      <!-- <vue-html2pdf :show-layout="false" :float-layout="true" :enable-download="true" :preview-modal="false"
        :filename="reportName" :pdf-quality="2" :manual-pagination="true" pdf-format="a4" pdf-orientation="portrait"
        pdf-content-width="800px" @progress="onProgress" @hasStartedGeneration="working = true"
        @hasGenerated="working = false" ref="html2Pdf">
        <section slot="pdf-content" class="pdf-content">
          <div>
            <h1><svg class="f18" clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2"
                viewBox="0 0 158 201" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                <clipPath id="a">
                  <path clip-rule="evenodd"
                    d="m100 10.547c49.37 0 89.453 40.083 89.453 89.453 0 93.284-109.752 139.496-157.332 155.146-5.028 1.597-10.516.699-14.774-2.416s-6.774-8.074-6.774-13.35c-.026-44.211-.026-139.38-.026-139.38 0-49.37 40.083-89.453 89.453-89.453z" />
                </clipPath>
                <g fill="none" transform="matrix(.783337 0 0 1 -354.093 -485.418639)">
                  <path d="m452.032 485.419h200.428v200.428h-200.428z" />
                  <g transform="matrix(.887335 0 0 .695083 463.512 491.096)">
                    <path
                      d="m100 10.547c49.37 0 89.453 40.083 89.453 89.453 0 93.284-109.752 139.496-157.332 155.146-5.028 1.597-10.516.699-14.774-2.416s-6.774-8.074-6.774-13.35c-.026-44.211-.026-139.38-.026-139.38 0-49.37 40.083-89.453 89.453-89.453z" />
                    <g style="opacity:.4" clip-path="url(#a)" stroke="var(--accent)">
                      <path d="m152.859 88.576c0 36.334-29.498 65.832-65.832 65.832-18.819 0-35.804-7.914-47.807-20.592"
                        stroke-width="12.52" transform="matrix(1.8383 0 0 1.8383 -83.7675 -82.1042)" />
                      <circle cx="87.027" cy="88.576" r="65.832" stroke-width="23.27"
                        transform="matrix(.989007 0 0 .989007 -4.79082 -6.87718)" />
                    </g>
                    <path
                      d="m100 10.547c49.37 0 89.453 40.083 89.453 89.453 0 93.284-109.752 139.496-157.332 155.146-5.028 1.597-10.516.699-14.774-2.416s-6.774-8.074-6.774-13.35c-.026-44.211-.026-139.38-.026-139.38 0-49.37 40.083-89.453 89.453-89.453z"
                      stroke="var(--accent)" stroke-width="23.02" />
                  </g>
                </g>
              </svg> F18Pay</h1>
            Generated Report
            <br><i>by: </i>{{ user }}
            <br><i>on: </i>{{ dateTime() }}
            <br><i>for store: </i>{{ decode(currentStore.store_name) }}
            <br><br>
            <table class="print-view">
              <tr>
                <th>#</th>
                <th>ID</th>
                <th>Created</th>
                <th>Value</th>
                <th>Status</th>
              </tr>
              <tr v-for="(invoice, key) in invoices" :key="key" :class="key % 6 == 5 ? 'html2pdf__page-break' : ''">
                <td>
                  <div>
                    <span>{{ key + range }}</span>
                  </div>
                </td>
                <td class="mono">
                  <div>
                    <span>{{ invoice.invoice_id.substr(0, 6) }}</span>
                  </div>
                </td>
                <td>
                  <div>
                    <span>
                      {{ invoice.created }} [UTC]</span>
                  </div>
                </td>
                <td>
                  <div>
                    <span>{{ Number(invoice.invoice_value).toFixed(2) }} <span class="badge">{{ invoice.currency
                        }}</span></span>
                    <span><small>@{{ invoice.exchange }}</small></span>
                  </div>
                </td>
                <td>
                  <div>
                    <span :class="'status ' + invoice._status">{{ invoice._status || '' }}</span>
                  </div>
                </td>
              </tr>
              <tr :key="key + 'ex'">
                <td></td>
                <td><b>Details:</b></td>
                <td colSpan="3" class="border-bottom-right border-bottom-left">
                  <div class="inline-table-notes">
                    <label v-if="invoice.tx2">Item:</label><span v-if="invoice.tx2">{{ decode(invoice.tx2) }}<br></span>
                    <label v-if="invoice.payee_email">Payee:</label><span v-if="invoice.payee_email">{{
                      invoice.payee_email }}<br></span>
                    <label>Crypto:</label><span>{{ invoice.btc_value }} {{ invoice.crypto }}</span><br>
                    <label>Address:</label><span>{{ invoice.address }}</span><br>
                    <label>Received:</label><span>{{ invoice.received }} {{ invoice.crypto }}<br>{{ ((invoice.received /
                      invoice.btc_value) * 100).toFixed(2) }} %</span>
                  </div>
                </td>
              </tr>
            </table>
          </div>
        </section>
      </vue-html2pdf> -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import DateRangePicker from 'vue3-daterange-picker';
import VueHtml2pdf from 'vue-html2pdf';
import { useRoute } from 'vue-router';
const route = useRoute();

const store = useStore();

const message = ref(false);
const working = ref(true);
const spinning = ref(true);
const viewing = ref(20);
const filter = ref(false);
const invoices = ref(false);
const count = ref(0);
const active = ref(false);
const statistics = ref(false);
const dateRange = ref({
  startDate: false,
  endDate: false,
});
const select = ref([
  {
    open: false,
    selected: false,
    options: ['expired', 'confirmed', 'receiving', 'partial', '1 confirmation', '2 confirmations'],
  },
]);

const session = computed(() => store.getters.session);
const fingerprint = computed(() => store.getters.fingerprint);
const user = computed(() => store.getters.user);
const keyiv = computed(() => store.getters.keyiv);
const keyivId = computed(() => store.getters.keyivId);
const activeStore = computed(() => store.getters.activeStore);
const stores = computed(() => store.getters.stores);
const time = computed(() => store.getters.time);

const currentStore = computed(() => {
  let current = false;
  for (const store of stores.value) {
    if (`${store.store_id.substring(0, 5)}${store.store_id.substring(store.store_id.length - 5)}` === route.params.storeId10) {
      current = store;
      break;
    }
  }
  return current;
});

const reportName = computed(() => {
  return 'F18Pay Report for Store: ' + decode(currentStore.value.store_name) + ' ::' + dateRange.value.startDate + ' to ' + dateRange.value.endDate + ' ::' + (filter.value ? filter.value : 'unfiltered');
});

const statisticsOrganised = computed(() => {
  let array = [];
  if (statistics.value.average) {
    let average = Number(statistics.value.average.sum) / Number(statistics.value.average.count);
    average = average < 0.001 ? average.toFixed(6) : average.toFixed(3);
    average = !isNaN(average) ? average : 0;
    array.push({
      name: 'Average value ' + currentStore.value.network,
      value: average,
    });
  }
  if (statistics.value.statuses) {
    let total = 0;
    for (const stat of statistics.value.statuses) {
      array.push({
        name: capitalise(stat.status),
        value: stat.count,
      });
      total += Number(stat.count);
    }
    array.push({
      name: 'Total',
      value: total,
    });
  }
  if (statistics.value.max) {
    let value = Number(statistics.value.max);
    value = value < 0.001 ? value.toFixed(6) : value.toFixed(3);
    array.push({
      name: 'Highest value ' + currentStore.value.network,
      value: value,
    });
  }
  return array;
});

const range = computed(() => {
  return viewing.value > 20 ? viewing.value - 20 + 1 : 1;
});

const storeCode = computed(() => {
  return activeStore.value.substr(0, 4) + currentStore.value.store_id_int + activeStore.value.substr(activeStore.value.length - 4);
});

const random = computed(() => {
  return String(Math.floor(Math.random() * 100) + 2 + '' + new Date().getTime() + Math.floor(Math.random() * 100) + 2 + (Math.random().toString(36).replace(/[^a-zA-Z]+/g, '').substr(0, 5)));
});

watch(viewing, () => {
  getInvoices();
});

watch(filter, () => {
  viewing.value = 20;
  getInvoices();
});

watch(working, (newVal) => {
  store.commit('setWorking', newVal);
});

onMounted(() => {
  document.querySelector('.dynamic-cta-header-space') && (document.querySelector('.dynamic-cta-header-space').innerHTML = '');


  store.dispatch('headerUIAppend', [
    {
      id: '.refresh-button',
      fn: getInvoices,
    },
    {
      id: '.download-file',
      fn: downloadFile,
    },
  ]);
});

const modernSelect = (index, value) => {
  select.value[index].selected = value;
  select.value[index].open = false;
};

const dateTime = () => {
  let currentdate = new Date();
  return (
    currentdate.getFullYear() +
    '-' +
    ((currentdate.getMonth() + 1 <= 9 ? '0' + (currentdate.getMonth() + 1) : currentdate.getMonth() + 1) + '-') +
    (currentdate.getDate() <= 9 ? '0' + currentdate.getDate() : currentdate.getDate()) +
    ' ' +
    currentdate.getHours() +
    ':' +
    currentdate.getMinutes() +
    ':' +
    currentdate.getSeconds()
  );
};

const downloadFile = () => {
  html2Pdf.value.generatePdf();
};

const capitalise = (string) => {
  return string.substr(0, 1).toUpperCase() + string.substr(1);
};

const getInvoiceStatistics = async () => {
  const username = await store.dispatch('encrypt', {
    string: user.value,
    keyiv: keyiv.value,
  });
  const storeName = await store.dispatch('encrypt', {
    string: encodeURIComponent(encodeURI(currentStore.value.store_name)),
    keyiv: keyiv.value,
  });
  await fetch(import.meta.env.VITE_APPLICATION_ENDPOINT + '/store-invoice-statistics', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: username,
      storeName: storeName,
      fingerprint: fingerprint.value,
      keyivId: keyivId.value,
      store_id: currentStore.value.store_id,
    }),
  })
    .then((response) => response.json())
    .then(async (data) => {
      if (data.proceed == true) {
        statistics.value = JSON.parse(await store.dispatch('decrypt', {
          string: data.statistics,
          keyiv: keyiv.value,
        }));
      } else {
        message.value = data.debug ? data.debug : 'There was a problem with the information provided.';
      }
    })
    .catch((error) => {
      message.value = message.value + ' \nError: ' + error + '\n';
      console.error('Error:', error);
    });
};

const getInvoices = async () => {
  working.value = true;
  spinning.value = true;

  active.value = false;
  const username = await store.dispatch('encrypt', {
    string: user.value,
    keyiv: keyiv.value,
  });
  const storeName = await store.dispatch('encrypt', {
    string: encodeURIComponent(encodeURI(currentStore.value.store_name)),
    keyiv: keyiv.value,
  });
  const storeId = await store.dispatch('encrypt', {
    string: currentStore.value.store_id,
    keyiv: keyiv.value,
  });
  Date.prototype.yyyymmdd = function () {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();
    return [this.getFullYear(), (mm > 9 ? '-' : '-0') + mm, (dd > 9 ? '-' : '-0') + dd].join('');
  };
  let rangeStart = dateRange.value.startDate instanceof Date ? dateRange.value.startDate.yyyymmdd() : String(dateRange.value.startDate);
  rangeStart = rangeStart.indexOf('T') >= 0 ? rangeStart.split('T')[0] : rangeStart.indexOf(' ') >= 0 ? rangeStart.split(' ')[0] : rangeStart;
  let rangeEnd = dateRange.value.endDate instanceof Date ? dateRange.value.endDate.yyyymmdd() : String(dateRange.value.endDate);
  rangeEnd = rangeEnd.indexOf('T') >= 0 ? rangeEnd.split('T')[0] : rangeEnd.indexOf(' ') >= 0 ? rangeEnd.split(' ')[0] : rangeEnd;
  let viewingVal = viewing.value;
  await fetch(import.meta.env.VITE_APPLICATION_ENDPOINT + '/store-invoices', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: username,
      storeName: storeName,
      fingerprint: fingerprint.value,
      keyivId: keyivId.value,
      store_id: storeId,
      viewing: viewingVal,
      filter: filter.value,
      rangeStart: rangeStart,
      rangeEnd: rangeEnd,
    }),
  })
    .then((response) => response.json())
    .then(async (data) => {
      if (data.proceed == true) {
        count.value = data.count;
        invoices.value = JSON.parse(await store.dispatch('decrypt', {
          string: data.invoices,
          keyiv: keyiv.value,
        }));
        dateRange.value.endDate = data.now;
        working.value = false;
        spinning.value = false;
        for (const invoice of invoices.value) {
          if (invoice.status == 1) {
            invoice._status = 'receiving';
          } else if (invoice.status != 4) {
            getStatus(invoice);
          } else {
            invoice._status = 'confirmed';
          }
        }
      } else {
        message.value = data.debug ? data.debug : 'There was a problem with the information provided.';
      }
    })
    .catch((error) => {
      message.value = message.value + ' \nError: ' + error + '\n';
      console.error('Error:', error);
    });
};

const getStatus = async (invoice) => {
  working.value = true;
  const username = await store.dispatch('encrypt', {
    string: user.value,
    keyiv: keyiv.value,
  });
  const address = await store.dispatch('encrypt', {
    string: invoice.address,
    keyiv: keyiv.value,
  });
  const created = await store.dispatch('encrypt', {
    string: invoice.created,
    keyiv: keyiv.value,
  });
  const id = await store.dispatch('encrypt', {
    string: invoice.id,
    keyiv: keyiv.value,
  });
  const crypto = await store.dispatch('encrypt', {
    string: invoice.crypto,
    keyiv: keyiv.value,
  });
  const value = await store.dispatch('encrypt', {
    string: invoice.btc_value,
    keyiv: keyiv.value,
  });
  const status = await store.dispatch('encrypt', {
    string: invoice.status,
    keyiv: keyiv.value,
  });
  await fetch(import.meta.env.VITE_APPLICATION_ENDPOINT + '/invoice-check-status', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: username,
      fingerprint: fingerprint.value,
      keyivId: keyivId.value,
      address: address,
      created: created,
      id: id,
      crypto: crypto,
      value: value,
      status: status,
    }),
  })
    .then((response) => response.json())
    .then(async (data) => {
      if (data.proceed == true) {
        let status_ = await store.dispatch('decrypt', {
          string: data.status,
          keyiv: keyiv.value,
        });
        for (const invoice_ of invoices.value) {
          if (invoice_.id === invoice.id) {
            invoice_._status = status_;
            break;
          }
        }
        working.value = false;
      } else {
        message.value = data.debug ? data.debug : 'There was a problem with the information provided.';
      }
    })
    .catch((error) => {
      message.value = message.value + ' \nError: ' + error + '\n';
      console.error('Error:', error);
    });
};

const decode = (string) => {
  let decoded = decodeURIComponent(decodeURI(string));
  return decoded;
};

const handleClickStop = () => false;

// Perform initialization previously done in the created hook
dateRange.value.startDate = currentStore.value.created.indexOf(' ') >= 0 ? currentStore.value.created.split(' ')[0] : currentStore.value.created;
dateRange.value.startDate = currentStore.value.created.indexOf('T') >= 0 ? currentStore.value.created.split('T')[0] : dateRange.value.startDate;
dateRange.value.endDate = time.value;

getInvoiceStatistics();
  getInvoices();
</script>

<style lang="scss" scoped>
.invoice-list {
  min-height: 500px;
  border-collapse: collapse;

  .list-item {
    &:not(.active) {
      &:hover {
        box-shadow: -2px 0px 0px 0px;
      }
    }

    transition: ease;
    cursor:pointer;

    &.active {
      td {
        background: var(--dark);
      }

      .border-top-left {
        border-top-left-radius: 10px;
      }

      .border-top-right {
        border-top-right-radius: 10px;
      }

      .border-bottom-left {
        border-bottom-left-radius: 10px;
      }

      .border-bottom-right {
        border-bottom-right-radius: 10px;
      }
    }
  }

  .timeago {
    font-size: inherit;
  }

  td {
    div {
      margin: 1rem;
      display: grid;
      grid-template: 1fr auto auto / 1fr;
      align-items: center;
      gap: .5rem;
      text-align: center;

      &.inline-table-notes {
        display: grid;
        grid-template-columns: auto 1fr !important;
        text-align: left !important;

        label {
          font-weight: 700;
        }
      }

      animation: sectBin 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards 1;

      @keyframes sectBin {
        from {
          opacity: 0;
          transform: scale(0.9);
        }

        to {
          opacity: 1;
          transform: scale(1);
        }
      }
    }
  }

  th {
    padding: 30px 0px 15px 0;
    vertical-align: top;
  }

}

.info-combo-parent {
  gap: 2rem;
  margin-bottom: 2rem;

  .info-combo {
    display: grid;
    justify-items: center;

    span {
      &:first-of-type {
        font-size: 2.4rem;
        font-weight: 100;
        opacity: .5;
      }

      &:last-of-type {
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
      }
    }
  }
}

.pdf-content {
  padding: .5rem;

  .f18 {
    height: 2rem;
  }

  h1 {
    font-size: 2rem;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: .5rem;
    align-items: center;
    margin: 0;
  }

  .print-view {
    td {
      div {
        padding: 10px;
      }
    }
  }
}
</style>
<style lang="css">
@import "@/assets/css/fonts-mono.css";
</style>
