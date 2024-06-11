<template>
  <div :class="storeManagementClass">
    <!-- MODAL -->
    <div class="modal" @click="modal = false" v-if="modal">
      <div :class="formPageClass" @click.stop="">
        <h1>New Payment request</h1>
        <div class="message" v-if="message"><i class="fas fa-exclamation-circle"></i> {{ message }}</div>
        <template v-if="confirmedCreatedAddress">
          <div class="form-section">
            <label for="storeName">Payment Page API <i v-if="settingPaymentPage" class="fas fa-asterisk spin"></i></label>
            <div class="input-placeholder">
              https://pay.flat18.co.uk/api/v1/payment-requests/{{ confirmedCreatedAddress }} <i class="fas fa-check-circle"></i>
            </div>
            <a :href="'https://pay.flat18.co.uk/api/v1/payment-requests/' + confirmedCreatedAddress">Payment Link <i class="fas fa-external-link-square-alt"></i></a>
            <div class="flex">
              <a class="btn" @click="copyCode('https://pay.flat18.co.uk/api/v1/payment-requests/' + confirmedCreatedAddress)">Copy link to clipboard <i v-if="copied" class="fas fa-check"></i></a>
            </div>
            <span class="help-text">{{ sendEmail ? 'Request has been emailed to the recipient.' : '' }}<br>You can copy the payment link to share it on any platform.</span>
          </div>
          <input id="copy_to_clipboard_workspace" class="transparent">
        </template>
        <template v-if="!confirmedCreatedAddress">
          <div class="form-section">
            <div class="sub-sect">
              <label for="">Description</label>
              <div class="switch" v-if="select[0].options.length > 0">
                <a :class="descriptionTypeExisting ? 'btn active' : 'btn'" @click.stop="descriptionTypeExisting = true">Use previous</a>
                <a :class="!descriptionTypeExisting ? 'btn active' : 'btn'" @click.stop="descriptionTypeExisting = false">New description</a>
              </div>
              <input v-if="!descriptionTypeExisting" v-model="description" type="text" placeholder="E.g. Item Name..." />
              <div v-if="descriptionTypeExisting" class="modern-select" @click.stop="select[0].open = !select[0].open">
                <span class="selected">{{ select[0].selected || 'Choose an item description...' }} <i v-if="select[0].open" class="fas fa-caret-up"></i><i v-else class="fas fa-caret-down"></i></span>
                <ul v-if="select[0].open">
                  <li v-for="(value, key) in select[0].options" :key="key" @click.stop="modernSelect(0, _decode(value))">{{ _decode(value) }}</li>
                </ul>
              </div>
              <span class="help-text"></span>
            </div>
          </div>
          <div class="form-section">
            <div class="sub-sect">
              <label for="">Recipient Email</label>
              <div class="switch" v-if="select[1].options.length > 0">
                <a :class="emailTypeExisting ? 'btn active' : 'btn'" @click.stop="emailTypeExisting = true">Use previous</a>
                <a :class="!emailTypeExisting ? 'btn active' : 'btn'" @click.stop="emailTypeExisting = false">New email</a>
              </div>
              <input v-if="!emailTypeExisting" v-model="email" type="text" placeholder="mail@example.com" />
              <div v-if="emailTypeExisting" class="modern-select" @click.stop="select[1].open = !select[1].open">
                <span class="selected">{{ select[1].selected || 'Choose a previously-used email...' }} <i v-if="select[1].open" class="fas fa-caret-up"></i><i v-else class="fas fa-caret-down"></i></span>
                <ul v-if="select[1].open">
                  <li v-for="(value, key) in select[1].options" :key="key" @click.stop="modernSelect(1, value)">{{ value }}</li>
                </ul>
              </div>
              <span class="help-text"></span>
            </div>
          </div>
          <div class="form-section">
            <div class="sub-sect">
              <label for="">Request Value</label>
              <div class="message" v-if="value < 0">Invalid value</div>
              <div class="flex">
                <input v-model="value" type="number" placeholder="10.00" />
                <div class="modern-select" @click.stop="select[2].open = !select[2].open">
                  <span class="selected">{{ select[2].selected || 'Currency' }} <i v-if="select[2].open" class="fas fa-caret-up"></i><i v-else class="fas fa-caret-down"></i></span>
                  <ul v-if="select[2].open">
                    <li v-for="(value, key) in select[2].options" :key="key" @click.stop="modernSelect(2, value)">{{ value }}</li>
                  </ul>
                </div>
              </div>
              <span class="help-text"></span>
            </div>
          </div>
          <div class="form-section">
            <div class="sub-sect">
              <label for="">Send Email to Recipient?</label>
              <div class="switch" v-if="select[0].options.length > 0">
                <a :class="sendEmail ? 'btn active' : 'btn'" @click.stop="sendEmail = true">Send via email</a>
                <a :class="!sendEmail ? 'btn active severe' : 'btn'" @click.stop="sendEmail = false">Do not notify</a>
              </div>
              <span class="help-text">F18 Pay can notify the recipient directly <br>or you can copy and paste the Payment Request link <br>to distribute via social media etc.</span>
            </div>
          </div>
          <div class="form-section" v-if="newRequestCheck">
            <div class="flex">
              <a class="btn" @click.stop="doNewRequest()">Next<i class="fas fa-arrow-right"></i></a>
            </div>
          </div>
        </template>
      </div>
    </div>
    <!-- MODAL -->
    <div :class="formPageClass" @click.stop="_null()">
      <h1><span>Payment Requests</span><span :class="'badge ' + currentStore.network">{{ currentStore.network }}</span></h1>
      <div class="message" v-if="message"><i class="fas fa-exclamation-circle"></i> {{ message }}</div>
      <div class="flex">
        <div class="button-cluster">
          <a class="btn refresh-button" @click="getPaymentRequests" title="Refresh"><i class="fas fa-sync"></i></a>
        </div>
        <div class="button-cluster">
          <a class="btn" id="newRequests" @click="newRequest()" title="Create Payment Request"><i class="fas fa-plus"></i><span>New Request</span></a>
        </div>
        <div class="button-cluster">
          <a class="btn" @click="viewing = 20"><i><i class="fas fa-chevron-left"></i><i class="fas fa-chevron-left"></i></i></a>
          <a class="btn list-back" @click="viewing = viewing - 20 < 20 ? 20 : viewing = viewing - 20"><i class="fas fa-chevron-left"></i></a>
          <a class="">{{ range }} to {{ viewing >= count ? count : viewing }} of {{ count }}</a>
          <a class="btn" @click="viewing = viewing + 20 > count ? count : viewing + 20"><i class="fas fa-chevron-right"></i></a>
          <a class="btn" @click="viewing = count"><i><i class="fas fa-chevron-right"></i><i class="fas fa-chevron-right"></i></i></a>
        </div>
        <div class="date-range-parent" v-if="dateRange.startDate && dateRange.endDate">
          <DateRangePicker ref="picker" :locale-data="{ firstDay: 1, format: 'dd-mm-yyyy' }" :minDate="null"
            :maxDate="null" :singleDatePicker="false" :timePicker="false" :timePicker24Hour="false"
            :showWeekNumbers="true" :showDropdowns="false" :autoApply="true" v-model="dateRange" :dateRange="dateRange"
            @update="getPaymentRequests" :linkedCalendars="false" />
        </div>
      </div>
      <table class="request-list">
        <tr>
          <th>#</th>
          <th>ID</th>
          <th>Created</th>
          <th>Value</th>
          <th>Status</th>
        </tr>
        <template v-for="(request, key) in requests" :key="key">
          <tr :class="active == key ? 'list-item active' : 'list-item'" @click.stop="active = key">
            <td class="mono border-top-left">
              <div>
                <span>{{ key + range }}</span>
              </div>
            </td>
            <td class="mono">
              <div>
                <span>{{ request.token.substr(0, 6) }}</span>
              </div>
            </td>
            <td>
              <div>
                <span><timeago prefix="" suffix="ago" :datetime="request.created" lang="en" /></span>
                <span v-if="active == key"><small>{{ request.created }} [UTC]</small></span>
              </div>
            </td>
            <td>
              <div>
                <span>{{ Number(request.invoice_value).toFixed(2) }} <span class="badge">{{ request.currency }}</span></span>
              </div>
            </td>
            <td class="border-top-right">
              <div>
                <span :class="'status ' + request._status"><i v-if="!request._status" class="fas fa-asterisk spin"></i>{{ request._status || '' }}</span>
              </div>
            </td>
          </tr>
          <tr v-if="active == key" class="list-item active" :key="key + 'ex'">
            <td colSpan="5" class="border-bottom-right border-bottom-left">
              <div class="inline-table-notes">
                <label v-if="request.reqToken">Attached to Payment Request:</label><span v-if="request.reqToken">{{ request.reqToken.substr(0, 6) }}</span>
                <label v-if="request.reqEmail">Payment Request Email:</label><span v-if="request.reqEmail">{{ request.reqEmail }}</span>
                <label v-if="request.reqDesc">Payment Request Description:</label><span v-if="request.reqDesc">{{ request.reqDesc }}</span>
                <label v-if="request.tx2">Item:</label><span v-if="request.tx2">{{ _decode(request.tx2) }}</span>
                <label v-if="request.payee_email">Payee:</label><span v-if="request.payee_email">{{ request.payee_email }}</span>
                <label>Crypto:</label><span>{{ request.btc_value }} {{ request.crypto }}</span>
                <label>Address:</label><a target="_blank" :href="'https://www.blockchain.com/btc/address/' + request.address">{{ request.address }} <i class="fas fa-external-link-square-alt"></i></a>
                <label>Received:</label><span>{{ request.tx3 | 0 }} {{ request.crypto }}<br>{{ ((request.tx3 / request.btc_value) * 100).toFixed(2) }} <i class="fas fa-percent"></i></span>
              </div>
            </td>
          </tr>
        </template>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import DateRangePicker from 'vue3-daterange-picker';

const route = useRoute();
const store = useStore();

const session = computed(() => store.getters['session']);
const fingerprint = computed(() => store.getters['fingerprint']);
const user = computed(() => store.getters['user']);
const keyiv = computed(() => store.getters['keyiv']);
const keyivId = computed(() => store.getters['keyivId']);
const activeStore = computed(() => store.getters['activeStore']);
const stores = computed(() => store.getters['stores']);
const currentStore = computed(() => stores.value ? stores.value.find((sto) => `${sto.store_id.substring(0, 5)}${sto.store_id.substring(sto.store_id.length - 5)}` === route.params.storeId10) : false);

const message = ref(false);
const working = ref(true);
const spinning = ref(true);
const viewing = ref(20);
const filter = ref(false);
const filters = ref(['expired', 'confirmed', 'receiving', 'partial', '1 conf.', '2 confs']);
const requests = ref(false);
const count = ref(0);
const active = ref(false);
const statistics = ref(false);
const dateRange = ref({ startDate: false, endDate: false });
const modal = ref(false);
const descriptionTypeExisting = ref(false);
const description = ref('');
const emailTypeExisting = ref(false);
const email = ref('');
const sendEmail = ref(false);
const value = ref('');
const select = ref([
  { open: false, selected: false, options: false },
  { open: false, selected: false, options: false },
  { open: false, selected: false, options: ['USD', 'GBP', 'EUR', 'TTD'] },
]);
const confirmedCreatedAddress = ref(false);
const copied = ref(true);
const epoch = computed(() => store.getters['epoch']);
const time = computed(() => store.getters['time']);

const storeManagementClass = computed(() => {
  if (working.value && spinning.value) {
    return 'store-management no-click spin-fresco';
  } else if (working.value && !spinning.value) {
    return 'store-management no-click';
  } else {
    return 'store-management';
  }
});

const formPageClass = computed(() => (working.value ? 'form page working' : 'form page'));

const range = computed(() => (viewing.value > 20 ? viewing.value - 20 + 1 : 1));

const newRequestCheck = computed(() => {
  let issues = 0;
  if (!value.value || isNaN(value.value) || value.value < 0) issues++;
  if (!select.value[2].selected) issues++;
  if (emailTypeExisting.value && !select.value[1].selected) issues++;
  if (
    (emailTypeExisting.value && select.value[1].selected && (select.value[1].selected.indexOf('@') < 0 || select.value[1].selected.indexOf('.') < 0 || select.value[1].selected.indexOf('.') > select.value[1].selected.length - 3)) ||
    (emailTypeExisting.value && !select.value[1].selected)
  ) {
    issues++;
  }
  if (descriptionTypeExisting.value && !select.value[0].selected) issues++;
  if (!emailTypeExisting.value && !email.value) issues++;
  if ((!emailTypeExisting.value && email.value) && (email.value.indexOf('@') < 0 || email.value.indexOf('.') < 0 || email.value.indexOf('.') > email.value.length - 3)) issues++;
  if (!descriptionTypeExisting.value && !description.value) issues++;
  return issues > 0 ? false : true;
});

const requestsActive = computed(() => {
  let activeRequest = false;
  if (requests.value && active.value) {
    activeRequest = requests.value[active.value];
  }
  return activeRequest;
});

const reportName = computed(() => `F18Pay Report for Store: ${_decode(currentStore.value.store_name)} ::${dateRange.value.startDate} to ${dateRange.value.endDate} ::${filter.value ? filter.value : 'unfiltered'}`);

const statisticsOrganised = computed(() => {
  let array = [];

  if (statistics.value.average) {
    let average = Number(statistics.value.average.sum) / Number(statistics.value.average.count);
    average = average < 0.001 ? average.toFixed(6) : average.toFixed(3);
    average = !isNaN(average) ? average : 0;
    array.push({ name: 'Average value ' + currentStore.value.network, value: average });
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
    array.push({ name: 'Highest value ' + currentStore.value.network, value: value });
  }

  return array;
});

function _null() {
  return false;
}

function _decode(string) {
  return decodeURIComponent(decodeURI(string));
}

function dateTime() {
  let currentdate = new Date();
  return (
    currentdate.getFullYear() +
    '-' +
    +((currentdate.getMonth() + 1) <= 9 ? '0' + (currentdate.getMonth() + 1) : currentdate.getMonth() + 1) +
    '-' +
    (currentdate.getDate() <= 9 ? '0' + currentdate.getDate() : currentdate.getDate()) +
    '-' +
    ' ' +
    currentdate.getHours() +
    ':' +
    currentdate.getMinutes() +
    ':' +
    currentdate.getSeconds()
  );
}

function modernSelect(index, value) {
  select.value[index].selected = value;
  select.value[index].open = false;
}

function capitalise(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

async function copyCode(copied) {
  let workspace = document.getElementById('copy_to_clipboard_workspace');
  workspace.value = copied;
  workspace.focus();
  workspace.select();
  try {
    if (document.execCommand('copy')) {
      copied.value = true;
    }
  } catch (e) {
    console.error(e);
  }
}

async function getPaymentRequests() {
  if(!currentStore.value || !user.value || !keyiv.value){return}
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
    return [
      this.getFullYear(),
      (mm > 9 ? '-' : '-0') + mm,
      (dd > 9 ? '-' : '-0') + dd,
    ].join('');
  };

  let rangeStart = dateRange.value.startDate instanceof Date ? dateRange.value.startDate.yyyymmdd() : String(dateRange.value.startDate);
  rangeStart = rangeStart.indexOf('T') >= 0 ? rangeStart.split('T')[0] : rangeStart.indexOf(' ') >= 0 ? rangeStart.split(' ')[0] : rangeStart;
  let rangeEnd = dateRange.value.endDate instanceof Date ? dateRange.value.endDate.yyyymmdd() : String(dateRange.value.endDate);
  rangeEnd = rangeEnd.indexOf('T') >= 0 ? rangeEnd.split('T')[0] : rangeEnd.indexOf(' ') >= 0 ? rangeEnd.split(' ')[0] : rangeEnd;

  let viewingCount = viewing.value;

  await fetch(import.meta.env.VITE_APP_APPLICATION_ENDPOINT + '/store-requests', {
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
      viewing: viewingCount,
      filter: filter.value,
      rangeStart: rangeStart,
      rangeEnd: rangeEnd,
    }),
  })
    .then((response) => response.json())
    .then(async (data) => {
      if (data.proceed == true) {
        count.value = data.count;
        requests.value = JSON.parse(await store.dispatch('decrypt', {
          string: data.requests,
          keyiv: keyiv.value,
        }));
        dateRange.value.endDate = data.now;
        working.value = false;
        spinning.value = false;
        message.value = false

        for (const request of requests.value) {
          if (request.status == 1) {
            request._status = 'receiving';
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
}

function newRequest() {
  document.getElementById('main').scrollTo({
    top: 0,
    behavior: 'smooth',
  });
  modal.value = true;
  confirmedCreatedAddress.value = false;
  copied.value = false;
}

async function doNewRequest() {
  working.value = true;
  let requestValue = value.value && !isNaN(value.value) && value.value > 0 ? value.value : false;
  let currency = select.value[2].selected;
  let emailAddress = !emailTypeExisting.value && email.value ? email.value : emailTypeExisting.value && select.value[1].selected ? select.value[1].selected : false;
  let requestDescription = descriptionTypeExisting.value && select.value[0].selected ? select.value[0].selected : !descriptionTypeExisting.value && description.value ? description.value : false;

  if (requestValue && currency && emailAddress && requestDescription) {
    const username = await store.dispatch('encrypt', {
      string: user.value,
      keyiv: keyiv.value,
    });
    const storeId = await store.dispatch('encrypt', {
      string: currentStore.value.store_id,
      keyiv: keyiv.value,
    });
    const encryptedDescription = await store.dispatch('encrypt', {
      string: encodeURIComponent(encodeURI(requestDescription)),
      keyiv: keyiv.value,
    });
    const encryptedEmail = await store.dispatch('encrypt', {
      string: emailAddress,
      keyiv: keyiv.value,
    });
    const encryptedValue = await store.dispatch('encrypt', {
      string: requestValue,
      keyiv: keyiv.value,
    });
    const encryptedCurrency = await store.dispatch('encrypt', {
      string: currency,
      keyiv: keyiv.value,
    });

    await fetch(import.meta.env.VITE_APP_APPLICATION_ENDPOINT + '/store-requests-create-new', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        fingerprint: fingerprint.value,
        keyivId: keyivId.value,
        store_id: storeId,
        description: encryptedDescription,
        email: encryptedEmail,
        value: encryptedValue,
        currency: encryptedCurrency,
        notify: sendEmail.value,
      }),
    })
      .then((response) => response.json())
      .then(async (data) => {
        if (data.proceed == true) {
          if (data.extra == 'viewAddress') {
            let decrypted = JSON.parse(await store.dispatch('decrypt', {
              string: data.address,
              keyiv: keyiv.value,
            }));
            confirmedCreatedAddress.value = decrypted;
            working.value = false;
          }
        } else {
          message.value = data.debug ? data.debug : 'There was a problem with the information provided.';
        }
      })
      .catch((error) => {
        message.value = message.value + ' \nError: ' + error + '\n';
        console.error('Error:', error);
      });
  } else {
    message.value = 'Please complete the entire form.';
  }
}

async function getPrePopulate() {
  const username = await store.dispatch('encrypt', {
    string: user.value,
    keyiv: keyiv.value,
  });
  const storeId = await store.dispatch('encrypt', {
    string: currentStore.value.store_id,
    keyiv: keyiv.value,
  });

  await fetch(import.meta.env.VITE_APP_APPLICATION_ENDPOINT + '/store-requests-pre-populate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: username,
      fingerprint: fingerprint.value,
      keyivId: keyivId.value,
      store_id: storeId,
    }),
  })
    .then((response) => response.json())
    .then(async (data) => {
      if (data.proceed == true) {
        let decrypted = JSON.parse(await store.dispatch('decrypt', {
          string: data['pre-populate'],
          keyiv: keyiv.value,
        }));
        select.value[0].options = await unique(decrypted.descriptions);
        select.value[1].options = await unique(decrypted.emails);
      } else {
        message.value = data.debug ? data.debug : 'There was a problem with the information provided.';
      }
    })
    .catch((error) => {
      message.value = message.value + ' \nError: ' + error + '\n';
      console.error('Error:', error);
    });
}

async function unique(array) {
  let temp = Array();
  for (const item of array) {
    if (temp.indexOf(item) < 0) {
      temp.push(item);
    }
  }
  return temp;
}

onMounted(() => {
  init();
});

watch(viewing, () => {
  getPaymentRequests();
});

watch(filter, () => {
  viewing.value = 20;
  getPaymentRequests();
});

watch(working, () => {
  store.commit('setWorking', working.value);
});

watch(modal, () => {
  getPaymentRequests();
});

watch(currentStore, () => {
  init();
});

async function init() {
  document.querySelector('.dynamic-cta-header-space') && (document.querySelector('.dynamic-cta-header-space').innerHTML = '');

  if (currentStore.value) {
    select.value[2].options.push(currentStore.value.network.toUpperCase());
    dateRange.value.startDate = currentStore.value.created.includes(' ') ? currentStore.value.created.split(' ')[0] : currentStore.value.created;
    dateRange.value.startDate = dateRange.value.startDate.includes('T') ? dateRange.value.startDate.split('T')[0] : dateRange.value.startDate;
  } else {
    dateRange.value.startDate = epoch.value;
  }
  dateRange.value.endDate = time.value;

  await getPrePopulate();
  await getPaymentRequests();

  store.dispatch('headerUIAppend', [
    {
      id: '#newRequests',
      fn: newRequest,
    },
    {
      id: '.refresh-button',
      fn: getPaymentRequests,
    },
  ]);
}
</script>

<style lang="scss" scoped>
@import "@/assets/css/fonts-mono.scss";

.request-list {
  min-height: 500px;
  border-collapse: collapse;

  .list-item {
    &:not(.active) {
      &:hover {
        box-shadow: -2px 0px 0px 0px;
      }
    }

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
