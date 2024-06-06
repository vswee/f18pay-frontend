<!-- eslint-disable vue/require-v-for-key -->
<!-- eslint-disable vue/no-template-key -->
<template lang="html">
  <div
    :class="working && spinning ? 'store-management no-click spin-fresco' : (working && !spinning ? 'store-management no-click' : 'store-management')">
    <div :class="working ? 'form page working' : 'form page'" @click.stop="_null()">
      <h1><span>Invoices</span><span :class="'badge ' + currentStore.network">{{ currentStore.network }}</span></h1>

      <div class="message" v-if="message"><i class="fas fa-exclamation-circle"></i> {{ message }}</div>

      <div class="form-section">
        <div class="sub-sect compact">
          <label for="">Invoice Statistics</label>
          <div class="flex info-combo-parent">
            <div class="info-combo" v-for="(stat, key) of statisticsOrganised" :key="key">
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
          <a class="btn" @click="viewing = viewing - 20 < 20 ? 20 : viewing = viewing - 20"><i class="fas fa-chevron-left"></i></a>
          <a class="">{{ range }} to {{ viewing >= count ? count : viewing }} of {{ count }}</a>
          <a class="btn" @click="viewing = viewing + 20 > count ? count : viewing + 20"><i class="fas fa-chevron-right"></i></a>
          <a class="btn" @click="viewing = count"><i><i class="fas fa-chevron-right"></i><i
                class="fas fa-chevron-right"></i></i></a>
        </div>
        <div class="date-range-parent">
          <DateRangePicker ref="picker" :locale-data="{ firstDay: 1, format: 'dd-mm-yyyy' }" :minDate="null"
            :maxDate="null" :singleDatePicker="false" :timePicker="false" :timePicker24Hour="false"
            :showWeekNumbers="true" :showDropdowns="false" :autoApply="true" v-model="dateRange" :dateRange="dateRange"
            @update="getInvoices" :linkedCalendars="false" />
        </div>

        <div class="button-cluster">
          <a class="btn" @click="queryFilter = false" title="Clear filters"><i class="fas fa-filter"></i></a>
          <!-- <select v-model="filter">
          <option value="false">No Filter</option>
          <option v-for="filter_ of filters" :key="filter_" v-bind:value="filter_">{{capitalise(filter_)}}</option>
        </select> -->
          <div class="modern-select" @click.stop="select[0].open = !select[0].open">
            <span class="selected">{{ select[0].selected || 'Filter' }} <i v-if="select[0].open"
                class="fas fa-caret-up"></i><i v-else class="fas fa-caret-down"></i></span>
            <ul v-if="select[0].open">
              <li v-for="(value, key) of select[0].options" :key="key"
                @click.stop="modernSelect(0, value); queryFilter = value">{{ value }}</li>
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
        <template v-for="(invoice, key) of invoices" :key="key">
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
                <span>{{ Number(invoice.invoice_value).toFixed(2) }} <span
                    class="badge">{{ invoice.currency }}</span></span>
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
          <tr v-if="active==key" class="list-item active" :key="key+'ex'">
          <td colSpan="5" class="border-bottom-right border-bottom-left">
            <div class="inline-table-notes">
                  <label v-if="invoice.reqToken">Attached to Payment Request:</label><span
                    v-if="invoice.reqToken">{{ invoice.reqToken.substr(0, 6) }}</span>
                  <label v-if="invoice.reqEmail">Payment Request Email:</label><span
                    v-if="invoice.reqEmail">{{ invoice.reqEmail }}</span>
                  <label v-if="invoice.reqDesc">Payment Request Description:</label><span
                    v-if="invoice.reqDesc">{{ invoice.reqDesc }}</span>
                  <label v-if="invoice.tx2">Item:</label><span v-if="invoice.tx2">{{ _decode(invoice.tx2) }}</span>
                  <label v-if="invoice.payee_email">Payee:</label><span
                    v-if="invoice.payee_email">{{ invoice.payee_email }}</span>
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
    <div>
      <vue3-html2pdf :show-layout="false" :float-layout="true" :enable-download="true" :preview-modal="false"
        :filename="reportName" :pdf-quality="2" :manual-pagination="true" pdf-format="a4" pdf-orientation="portrait"
        pdf-content-width="800px" @progress="onProgress($event)" @hasStartedGeneration="working = true"
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
            <br><i>for store: </i>{{ _decode(this.currentStore.store_name) }}
            <br><br>
            <table class="print-view">
              <tr>
                <th>#</th>
                <th>ID</th>
                <th>Created</th>
                <th>Value</th>
                <th>Status</th>
              </tr>
              <template v-for="(invoice, key) of invoices" :key="key" >
                <tr :class="key % 6 == 5 ? 'html2pdf__page-break' : ''">
                  <td>
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
                        {{ (invoice.created) }} [UTC]</span>
                    </div>
                  </td>
                  <td>
                    <div>
                      <span>{{ Number(invoice.invoice_value).toFixed(2) }} <span
                          class="badge">{{ invoice.currency }}</span></span>
                      <span><small>@{{ invoice.exchange }}</small></span>
                    </div>
                  </td>
                  <td>
                    <div>
                      <span :class="'status ' + invoice._status">{{ invoice._status || '' }}</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td></td>
                  <td><b>Details:</b></td>
                  <td colSpan="3" class="border-bottom-right border-bottom-left">
                    <div class="inline-table-notes">
                      <label v-if="invoice.tx2">Item:</label><span
                        v-if="invoice.tx2">{{ _decode(invoice.tx2) }}<br></span>
                      <label v-if="invoice.payee_email">Payee:</label><span
                        v-if="invoice.payee_email">{{ invoice.payee_email }}<br></span>
                      <label>Crypto:</label><span>{{ invoice.btc_value }} {{ invoice.crypto }}</span><br>
                      <label>Address:</label><span>{{ invoice.address }}</span><br>
                      <label>Received:</label><span>{{ invoice.received }}
                        {{ invoice.crypto }}<br>{{ ((invoice.received / invoice.btc_value) * 100).toFixed(2) }} %</span>
                    </div>
                  </td>
                </tr>
              </template>
            </table>
          </div>
        </section>
      </vue3-html2pdf>
    </div>
  </div>
</template>

<script>
import {
  mapGetters
} from 'vuex';
import DateRangePicker from 'vue3-daterange-picker'
import Vue3Html2pdf from 'vue3-html2pdf'
export default {
  name: "InvoicesManager",
  components: {
    // eslint-disable-next-line vue/no-unused-components
    DateRangePicker,
    Vue3Html2pdf,
  },
  data() {
    return {
      message: false,
      working: true,
      spinning: true,
      viewing: 20,
      total: false,
      queryFilter: false,
      // filters: ['expired', 'confirmed', 'receiving', 'partial', '1 conf.', '2 confs'],
      invoices: false,
      count: 0,
      active: false,
      statistics: false,
      dateRange: {
        startDate: false,
        endDate: false,
      },
      select: [{
        open: false,
        selected: false,
        options: ['expired', 'confirmed', 'receiving', 'partial', '1 confirmation', '2 confirmations']
      },],
    }
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
      time: 'time',
      epoch: 'epoch',
    }),
    invoicesActive() {
      let active = false
      if (this.invoices && this.active) {
        active = this.invoices[this.active]
      }
      return active
    },
    reportName() {
      return 'F18Pay Report for Store: ' + this._decode(this.currentStore.store_name) + ' ::' + this.dateRange.startDate + ' to ' + this.dateRange.endDate + ' ::' + (this.queryFilter ? this.queryFilter : 'unfiltered')
    },
    computedDateRange() {
      return new Date();
    },
    statisticsOrganised() {
      let array = [];

      if (this.statistics.average) {
        let average = Number(this.statistics.average.sum) / Number(this.statistics.average.count);
        average = average < 0.001 ? average.toFixed(6) : average.toFixed(3);
        average = !isNaN(average) ? average : 0;
        array.push({
          name: 'Average value ' + this.currentStore.network,
          value: average
        });
      }

      if (this.statistics.statuses) {
        let total = 0;
        for (const stat of this.statistics.statuses) {
          array.push({
            name: this.capitalise(stat.status),
            value: stat.count
          })
          total += Number(stat.count)
        }
        array.push({
          name: "Total",
          value: total
        })
      }
      if (this.statistics.max) {
        let value = Number(this.statistics.max);
        value = value < 0.001 ? value.toFixed(6) : value.toFixed(3);
        array.push({
          name: 'Highest value ' + this.currentStore.network,
          value: value
        });
      }

      return array
    },
    range() {
      let range = this.viewing > 20 ? this.viewing - 20 + 1 : 1
      return range
    },
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
  },
  watch: {
    viewing: function () {
      this.getInvoices()
    },
    queryFilter: function () {
      this.viewing = 20;
      this.getInvoices()
    },
    working() {
      this.$store.commit("setWorking", this.working);
    },
    currentStore() {
      this.init()
    },
  },
  mounted() {
    this.init()
  },
  created() {

  },
  methods: {
    init() {

      if (this.currentStore) {
        this.dateRange.startDate = this.currentStore.created.indexOf(' ') >= 0 ? this.currentStore.created.split(' ')[0] : this.currentStore.created;
        this.dateRange.startDate = this.dateRange.startDate.indexOf('T') > 0 ? this.dateRange.startDate.split('T')[0] : this.dateRange.startDate;
      } else {
        this.dateRange.startDate = this.epoch
      }
      this.dateRange.endDate = this.time;

      document.querySelector('.dynamic-cta-header-space') && (document.querySelector('.dynamic-cta-header-space').innerHTML = '')
      this.getInvoiceStatistics();
      this.getInvoices();

      this.$store.dispatch('headerUIAppend', [{
        id: '.refresh-button',
        fn: this.getInvoices,
      }, {
        id: '.download-file',
        fn: this.downloadFile,
      }]);
    },
    modernSelect(index, value) {
      this.select[index].selected = value;
      this.select[index].open = false;
    },
    dateTime() {
      let currentdate = new Date();
      return currentdate.getFullYear() + "-" +
        +((currentdate.getMonth() + 1) <= 9 ? '0' + (currentdate.getMonth() + 1) : (currentdate.getMonth() + 1)) + "-" + (currentdate.getDate() <= 9 ? '0' + currentdate.getDate() : currentdate.getDate()) + "-" +
        +" " +
        currentdate.getHours() + ":" +
        currentdate.getMinutes() + ":" +
        currentdate.getSeconds()
    },
    downloadFile() {
      this.$refs.html2Pdf.generatePdf()
    },
    capitalise(string) {
      return string.substr(0, 1).toUpperCase() + string.substr(1);
    },
    async getInvoiceStatistics() {
      const username = await this.$store.dispatch('encrypt', {
        string: this.user,
        keyiv: this.keyiv
      });
      const storeName = await this.$store.dispatch('encrypt', {
        string: encodeURIComponent(encodeURI(this.storeName)),
        keyiv: this.keyiv
      });
      await fetch(process.env.VUE_APP_APPLICATION_ENDPOINT + "/store-invoice-statistics", {
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
        }),
      })
        .then((response) => response.json())
        .then(async (data) => {
          if (data.proceed == true) {
            this.statistics = JSON.parse(await this.$store.dispatch('decrypt', {
              string: data.statistics,
              keyiv: this.keyiv
            }))
          } else {
            this.message = data.debug ? data.debug : "There was a problem with the information provided."
          }
        })
        .catch((error) => {
          this.message = this.message + ' \nError: ' + error + '\n';
          console.error("Error:", error);
        });
    },
    async getInvoices() {
      this.working = true;
      this.spinning = true;

      this.active = false;
      const username = await this.$store.dispatch('encrypt', {
        string: this.user,
        keyiv: this.keyiv
      });
      const storeName = await this.$store.dispatch('encrypt', {
        string: encodeURIComponent(encodeURI(this.storeName)),
        keyiv: this.keyiv
      });
      const storeId = await this.$store.dispatch('encrypt', {
        string: this.currentStore.store_id,
        keyiv: this.keyiv
      });
      Date.prototype.yyyymmdd = function () {
        var mm = this.getMonth() + 1; // getMonth() is zero-based
        var dd = this.getDate();
        return [this.getFullYear(),
        (mm > 9 ? '-' : '-0') + mm,
        (dd > 9 ? '-' : '-0') + dd
        ].join('');
      };
      let rangeStart = this.dateRange.startDate instanceof Date ? this.dateRange.startDate.yyyymmdd() : String(this.dateRange.startDate);
      rangeStart = rangeStart.indexOf("T") >= 0 ? rangeStart.split('T')[0] : (rangeStart.indexOf(" ") >= 0 ? rangeStart.split(' ')[0] : rangeStart);
      let rangeEnd = this.dateRange.endDate instanceof Date ? this.dateRange.endDate.yyyymmdd() : String(this.dateRange.endDate);
      rangeEnd = rangeEnd.indexOf("T") >= 0 ? rangeEnd.split('T')[0] : (rangeEnd.indexOf(" ") >= 0 ? rangeEnd.split(' ')[0] : rangeEnd);
      let viewing = this.viewing; //==this.count?this.range:this.viewing;
      const invoicesFetchBody = {
        username: username,
        storeName: storeName,
        fingerprint: this.fingerprint,
        keyivId: this.keyivId,
        store_id: storeId,
        viewing: viewing,
        rangeStart: rangeStart,
        rangeEnd: rangeEnd,
      }
      if (this.queryFilter) { invoicesFetchBody.filter = this.queryFilter }
      await fetch(process.env.VUE_APP_APPLICATION_ENDPOINT + "/store-invoices", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invoicesFetchBody),
      })
        .then((response) => response.json())
        .then(async (data) => {
          if (data.proceed == true) {
            this.count = data.count;
            this.invoices = JSON.parse(await this.$store.dispatch('decrypt', {
              string: data.invoices,
              keyiv: this.keyiv
            })),
              this.dateRange.endDate = data.now;
            this.working = false;
            this.spinning = false;
            for (const invoice of this.invoices) {

              if (invoice.status == 1) {
                invoice._status = "receiving";
              } else if (invoice.status != 4) {
                this.getStatus(invoice)
              } else {
                invoice._status = "confirmed";
              }
            }
          } else {
            this.message = data.debug ? data.debug : "There was a problem with the information provided."
          }
        })
        .catch((error) => {
          this.message = this.message + ' \nError: ' + error + '\n';
          console.error("Error:", error);
        });
    },
    async getStatus(invoice) {
      if (!invoice.id) { return }
      this.working = true;
      const username = await this.$store.dispatch('encrypt', {
        string: this.user,
        keyiv: this.keyiv
      });
      const address = await this.$store.dispatch('encrypt', {
        string: invoice.address,
        keyiv: this.keyiv
      });
      const created = await this.$store.dispatch('encrypt', {
        string: invoice.created,
        keyiv: this.keyiv
      });
      const id = await this.$store.dispatch('encrypt', {
        string: String(invoice.id).trim(),
        keyiv: this.keyiv
      });
      const crypto = await this.$store.dispatch('encrypt', {
        string: invoice.crypto,
        keyiv: this.keyiv
      });
      const value = await this.$store.dispatch('encrypt', {
        string: invoice.btc_value,
        keyiv: this.keyiv
      });
      const status = await this.$store.dispatch('encrypt', {
        string: invoice.status,
        keyiv: this.keyiv
      });
      await fetch(process.env.VUE_APP_APPLICATION_ENDPOINT + "/invoice-check-status", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          fingerprint: this.fingerprint,
          keyivId: this.keyivId,
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
            let status_ = await this.$store.dispatch('decrypt', {
              string: data.status,
              keyiv: this.keyiv
            })
            for (const invoice_ of this.invoices) {
              if (invoice_.id === invoice.id) {
                invoice_._status = status_;
                break;
              }
            }
            this.working = false;

          } else {
            this.message = data.debug ? data.debug : "There was a problem with the information provided."
          }
        })
        .catch((error) => {
          this.message = this.message + ' \nError: ' + error + '\n';
          console.error("Error:", error);
        });
    },
    _decode(string) {
      let decoded = decodeURIComponent(decodeURI(string));
      return decoded
    },
    _null() {
      return false
    },
  },
}
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