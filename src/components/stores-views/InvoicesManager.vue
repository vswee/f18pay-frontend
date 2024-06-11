<template>
  <div :class="storeManagementClass">
    <div :class="formPageClass" @click.stop="_null">
      <h1><span>Invoices</span><span :class="'badge ' + currentStore.network">{{ currentStore.network }}</span></h1>

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
          <a class="">{{ range }} to {{ viewing >= count ? count : viewing }} of {{ count
            }}</a>
          <a class="btn" @click="viewing = viewing + 20 > count ? count : viewing + 20"><i
              class="fas fa-chevron-right"></i></a>
          <a class="btn" @click="viewing = count"><i><i class="fas fa-chevron-right"></i><i
                class="fas fa-chevron-right"></i></i></a>
        </div>
        <div class="date-range-parent" v-if="dateRange.startDate && dateRange.endDate">
          <DateRangePicker ref="picker" :locale-data="{ firstDay: 1, format: 'dd-mm-yyyy' }" :minDate="null"
            :maxDate="null" :singleDatePicker="false" :timePicker="false" :timePicker24Hour="false"
            :showWeekNumbers="true" :showDropdowns="false" :autoApply="true" v-model="dateRange" :dateRange="dateRange"
            @update="getInvoices" :linkedCalendars="false" />
        </div>

        <div class="button-cluster">
          <a class="btn" @click="queryFilter = false" title="Clear filters"><i class="fas fa-filter"></i></a>
          <div class="modern-select" @click.stop="select[0].open = !select[0].open">
            <span class="selected">{{ select[0].selected || 'Filter' }} <i v-if="select[0].open"
                class="fas fa-caret-up"></i><i v-else class="fas fa-caret-down"></i></span>
            <ul v-if="select[0].open">
              <li v-for="(value, key) in select[0].options" :key="key"
                @click.stop="modernSelect(0, value); queryFilter = value">{{ value }}</li>
            </ul>
          </div>
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
        <template v-for="(invoice, key) in invoices" :key="key">
          <tr :class="active == key ? 'list-item active' : 'list-item'" @click="active = key">
            <td class="mono border-top-left">
              <div>
                <span>{{ (key + range) }}</span>
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
                <span v-if="active == key"><small>{{ (invoice.created) }} [UTC]</small></span>
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
                <span :class="'status ' + invoice._status"><i v-if="!invoice._status"
                    class="fas fa-asterisk spin"></i>{{ invoice._status || '' }}</span>
              </div>
            </td>
          </tr>
          <tr v-if="active == key" class="list-item active" :key="key + 'ex'">
            <td colSpan="5" class="border-bottom-right border-bottom-left">
              <div class="inline-table-notes">
                <label v-if="invoice.reqToken">Attached to Payment Request:</label><span v-if="invoice.reqToken">{{
                  invoice.reqToken.substr(0, 6) }}</span>
                <label v-if="invoice.reqEmail">Payment Request Email:</label><span v-if="invoice.reqEmail">{{
                  invoice.reqEmail }}</span>
                <label v-if="invoice.reqDesc">Payment Request Description:</label><span v-if="invoice.reqDesc">{{
                  invoice.reqDesc }}</span>
                <label v-if="invoice.tx2">Item:</label><span v-if="invoice.tx2">{{ _decode(invoice.tx2) }}</span>
                <label v-if="invoice.payee_email">Payee:</label><span v-if="invoice.payee_email">{{ invoice.payee_email
                  }}</span>
                <label>Crypto:</label><span>{{ invoice.btc_value }} {{ invoice.crypto }}</span>
                <label>Address:</label><a target="_blank"
                  :href="'https://www.blockchain.com/btc/address/' + invoice.address">{{ invoice.address }} <i
                    class="fas fa-external-link-square-alt"></i></a>
                <label>Received:</label><span>{{ invoice.tx3 | 0 }}
                  {{ invoice.crypto }}<br>{{ ((invoice.tx3 / invoice.btc_value) * 100).toFixed(2) }} <i
                    class="fas fa-percent"></i></span>
              </div>
            </td>
          </tr>
        </template>
      </table>
    </div>
    <div id="HTML2PDF">
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import DateRangePicker from 'vue3-daterange-picker';
import { PDFDocument, rgb } from 'pdf-lib';

const store = useStore();
const route = useRoute();

const storeNameProxy = ref(false);
const message = ref(false);
const working = ref(true);
const spinning = ref(true);
const viewing = ref(20);
const total = ref(false);
const queryFilter = ref(false);
const invoices = ref([]);
const count = ref(0);
const active = ref(false);
const statistics = ref({});
const dateRange = ref({ startDate: false, endDate: false });
const select = ref([{ open: false, selected: false, options: ['expired', 'confirmed', 'receiving', 'partial', '1 confirmation', '2 confirmations'] }]);

const session = computed(() => store.getters['session']);
const fingerprint = computed(() => store.getters['fingerprint']);
const user = computed(() => store.getters['user']);
const keyiv = computed(() => store.getters['keyiv']);
const keyivId = computed(() => store.getters['keyivId']);
const activeStore = computed(() => store.getters['activeStore']);
const stores = computed(() => store.getters['stores']);
const time = computed(() => store.getters['time']);
const epoch = computed(() => store.getters['epoch']);

const invoicesActive = computed(() => invoices.value && active.value !== false ? invoices.value[active.value] : false);

const reportName = computed(() => `F18Pay Report for Store: ${_decode(currentStore.value.store_name)} :: ${dateRange.value.startDate} to ${dateRange.value.endDate} :: ${queryFilter.value || 'unfiltered'}`);

const statisticsOrganised = computed(() => {
  const array = [];
  if (statistics.value.average) {
    let average = Number(statistics.value.average.sum) / Number(statistics.value.average.count);
    average = average < 0.001 ? average.toFixed(6) : average.toFixed(3);
    average = !isNaN(average) ? average : 0;
    array.push({ name: `Average value ${currentStore.value.network}`, value: average });
  }
  if (statistics.value.statuses) {
    let total = 0;
    for (const stat of statistics.value.statuses) {
      array.push({ name: capitalise(stat.status), value: stat.count });
      total += Number(stat.count);
    }
    array.push({ name: 'Total', value: total });
  }
  if (statistics.value.max) {
    let value = Number(statistics.value.max);
    value = value < 0.001 ? value.toFixed(6) : value.toFixed(3);
    array.push({ name: `Highest value ${currentStore.value.network}`, value });
  }
  return array;
});

const range = computed(() => (viewing.value > 20 ? viewing.value - 20 + 1 : 1));

const currentStore = computed(() => stores.value ? stores.value.find((sto) => `${sto.store_id.substring(0, 5)}${sto.store_id.substring(sto.store_id.length - 5)}` === route.params.storeId10) : false);

const storeManagementClass = computed(() => working.value && spinning.value ? 'store-management no-click spin-fresco' : (working.value && !spinning.value ? 'store-management no-click' : 'store-management'));
const formPageClass = computed(() => working.value ? 'form page working' : 'form page');

const init = async () => {
  if (currentStore.value) {
    storeNameProxy.value = currentStore.value.store_name
    dateRange.value.startDate = currentStore.value.created.includes(' ') ? currentStore.value.created.split(' ')[0] : currentStore.value.created;
    dateRange.value.startDate = dateRange.value.startDate.includes('T') ? dateRange.value.startDate.split('T')[0] : dateRange.value.startDate;
  } else {
    dateRange.value.startDate = epoch.value;
  }
  dateRange.value.endDate = time.value;
  if (document.querySelector('.dynamic-cta-header-space')) { document.querySelector('.dynamic-cta-header-space').innerHTML = '' }
  try {
    await getInvoiceStatistics();
    await getInvoices();
  } catch (e) { console.log("INIT ERROR:", e) }
  store.dispatch('headerUIAppend', [
    { id: '.refresh-button', fn: getInvoices },
    // { id: '.download-file', fn: downloadFile },
  ]);
};

const modernSelect = (index, value) => {
  select.value[index].selected = value;
  select.value[index].open = false;
};

const dateTime = () => {
  const currentdate = new Date();
  return `${currentdate.getFullYear()}-${((currentdate.getMonth() + 1) <= 9 ? '0' : '') + (currentdate.getMonth() + 1)}-${(currentdate.getDate() <= 9 ? '0' : '') + currentdate.getDate()} ${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()}`;
};

const downloadFile = async () => {
  const content = document.querySelector('.invoice-list').innerHTML;
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const fontSize = 30;

  page.drawText(content, {
    x: 50,
    y: height - 4 * fontSize,
    size: fontSize,
    color: rgb(0, 0, 0),
  });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'document.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const capitalise = (string) => string.charAt(0).toUpperCase() + string.slice(1);

const getInvoiceStatistics = async () => {
  if(!currentStore.value || !user.value || !keyiv.value){return}
  const username = await store.dispatch('encrypt', { string: user.value, keyiv: keyiv.value });
  const storeNameEnc = await store.dispatch('encrypt', { string: encodeURIComponent(encodeURI(storeNameProxy.value)), keyiv: keyiv.value });
  await fetch(`${import.meta.env.VITE_APP_APPLICATION_ENDPOINT}/store-invoice-statistics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      storeNameEnc,
      fingerprint: fingerprint.value,
      keyivId: keyivId.value,
      store_id: currentStore.value.store_id,
    }),
  })
    .then((response) => response.json())
    .then(async (data) => {
      if (data.proceed) {
        statistics.value = JSON.parse(await store.dispatch('decrypt', { string: data.statistics, keyiv: keyiv.value }));
      } else {
        message.value = data.debug || 'There was a problem with the information provided for fetching statistics.';
      }
    })
    .catch((error) => {
      message.value += ` \nError: ${error}\n`;
      console.error('Error:', error);
    });
};

const getInvoices = async () => {
  if(!currentStore.value || !user.value || !keyiv.value){return}

  working.value = true;
  spinning.value = true;
  active.value = false;
  const username = await store.dispatch('encrypt', { string: user.value, keyiv: keyiv.value });
  const storeNameEnc = await store.dispatch('encrypt', { string: encodeURIComponent(encodeURI(storeNameProxy.value)), keyiv: keyiv.value });
  const storeId = await store.dispatch('encrypt', { string: currentStore.value.store_id, keyiv: keyiv.value });
  const rangeStart = dateRange.value.startDate instanceof Date ? dateRange.value.startDate.toISOString().split('T')[0] : (String(dateRange.value.startDate).indexOf('T') >= 0 ? dateRange.value.startDate.split('T')[0] : dateRange.value.startDate);
  const rangeEnd = dateRange.value.endDate instanceof Date ? dateRange.value.endDate.toISOString().split('T')[0] : (String(dateRange.value.endDate).indexOf('T') >= 0 ? dateRange.value.endDate.split('T')[0] : dateRange.value.endDate);
  const invoicesFetchBody = {
    username,
    storeNameEnc,
    fingerprint: fingerprint.value,
    keyivId: keyivId.value,
    store_id: storeId,
    viewing: viewing.value,
    rangeStart,
    rangeEnd,
  };
  if (queryFilter.value) {
    invoicesFetchBody.filter = queryFilter.value;
  }
  await fetch(`${import.meta.env.VITE_APP_APPLICATION_ENDPOINT}/store-invoices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invoicesFetchBody),
  })
    .then((response) => response.json())
    .then(async (data) => {
      if (data.proceed) {
        count.value = data.count;
        invoices.value = JSON.parse(await store.dispatch('decrypt', { string: data.invoices, keyiv: keyiv.value }));
        dateRange.value.endDate = data.now;
        working.value = false;
        spinning.value = false;
        message.value = false
        invoices.value.forEach((invoice) => {
          if (invoice.status == 1) {
            invoice._status = 'receiving';
          } else if (invoice.status != 4) {
            getStatus(invoice);
          } else {
            invoice._status = 'confirmed';
          }
        });
      } else {
        message.value = data.debug || 'There was a problem with the information provided for fetching invoices.';
      }
    })
    .catch((error) => {
      message.value += ` \nError: ${error}\n`;
      console.error('Error:', error);
    });
};

const getStatus = async (invoice) => {
  if (!invoice.id) {
    return;
  }
  working.value = true;
  const username = await store.dispatch('encrypt', { string: user.value, keyiv: keyiv.value });
  const address = await store.dispatch('encrypt', { string: invoice.address, keyiv: keyiv.value });
  const created = await store.dispatch('encrypt', { string: invoice.created, keyiv: keyiv.value });
  const id = await store.dispatch('encrypt', { string: String(invoice.id).trim(), keyiv: keyiv.value });
  const crypto = await store.dispatch('encrypt', { string: invoice.crypto, keyiv: keyiv.value });
  const value = await store.dispatch('encrypt', { string: invoice.btc_value, keyiv: keyiv.value });
  const status = await store.dispatch('encrypt', { string: invoice.status, keyiv: keyiv.value });
  await fetch(`${import.meta.env.VITE_APP_APPLICATION_ENDPOINT}/invoice-check-status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      fingerprint: fingerprint.value,
      keyivId: keyivId.value,
      address,
      created,
      id,
      crypto,
      value,
      status,
    }),
  })
    .then((response) => response.json())
    .then(async (data) => {
      if (data.proceed) {
        const status_ = await store.dispatch('decrypt', { string: data.status, keyiv: keyiv.value });
        invoices.value.forEach((invoice_) => {
          if (invoice_.id === invoice.id) {
            invoice_._status = status_;
          }
        });
        working.value = false;
      } else {
        message.value = data.debug || 'There was a problem with the information provided for fetching statuses.';
      }
    })
    .catch((error) => {
      message.value += ` \nError: ${error}\n`;
      console.error('Error:', error);
    });
};

const _decode = (string) => decodeURIComponent(decodeURI(string));
const _null = () => false;

onMounted(init);
watch([viewing, queryFilter], getInvoices);
watch(working, () => {
  store.commit('setWorking', working.value);
});
watch(currentStore, init);
</script>

<style lang="scss" scoped>
@import "@/assets/css/fonts-mono.scss";

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
    cursor: pointer;

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

  .vue-moments-ago {
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
