<template lang="">
<div :class="working && spinning?'store-management no-click spin-fresco':(working && !spinning?'store-management no-click':'store-management')">
  <!-- MODAL -->
  <div class="modal" @click="modal=false" v-if="modal">
    <div :class="working?'form page working':'form page'" @click.stop="false">
      <h1>New Payment request</h1>
      <div class="message" v-if="message"><i class="fas fa-exclamation-circle"></i> {{message}}</div>
      <template v-if="confirmedCreatedAddress">
        <div class="form-section">
          <label for="storeName">Payment Pgae API <i v-if="settingPaymentPage" class="fas fa-asterisk spin"></i></label>
          <div class="input-placeholder">
            https://money.flat18.co.uk/api/v1/payment-requests/{{confirmedCreatedAddress}} <i class="fas fa-check-circle"></i>
          </div><a :href="'https://money.flat18.co.uk/api/v1/payment-requests/'+confirmedCreatedAddress">Payment Link <i class="fas fa-external-link-square-alt"></i></a>
          <div class="flex">
          
<a class="btn" @click="copyCode('https://money.flat18.co.uk/api/v1/payment-requests/'+confirmedCreatedAddress)">Copy link to clipboard <i v-if="copied" class="fas fa-check"></i></a>
        </div>
          <span class="help-text">{{sendEmail?'Request has been emailed to the recipient.':''}}<br>You can copy the payment link to share it on any platform.</span>
        </div>
  <input id="copy_to_clipboard_workspace" class="transparent">

      </template>
      <template v-if="!confirmedCreatedAddress">
        <div class="form-section">
          <div class="sub-sect">
            <label for="">Description</label>
            <div class="switch" v-if="select[0].options.length>0">
              <a :class="descriptionTypeExisting?'btn active':'btn'" @click.stop="descriptionTypeExisting=true">Use previous</a>
              <a :class="!descriptionTypeExisting?'btn active':'btn'" @click.stop="descriptionTypeExisting=false">New description</a>
            </div>
            <input v-if="!descriptionTypeExisting" v-model="description" type="text" placeholder="E.g. Item Name..." />
            <div v-if="descriptionTypeExisting" class="modern-select" @click.stop="select[0].open=!select[0].open">
              <span class="selected">{{select[0].selected || 'Choose an item description...'}} <i v-if="select[0].open" class="fas fa-caret-up"></i><i v-else class="fas fa-caret-down"></i></span>
              <ul v-if="select[0].open">
                <li v-for="(value, key) of select[0].options" :key="key" @click.stop="modernSelect(0,_decode(value))">{{_decode(value)}}</li>
              </ul>
            </div>
            <span class="help-text"></span>
          </div>
        </div>

        <div class="form-section">
          <div class="sub-sect">
            <label for="">Recipient Email</label>
            <div class="switch" v-if="select[1].options.length>0">
              <a :class="emailTypeExisting?'btn active':'btn'" @click.stop="emailTypeExisting=true">Use previous</a>
              <a :class="!emailTypeExisting?'btn active':'btn'" @click.stop="emailTypeExisting=false">New email</a>
            </div>
            <input v-if="!emailTypeExisting" v-model="email" type="text" placeholder="mail@example.com" />
            <div v-if="emailTypeExisting" class="modern-select" @click.stop="select[1].open=!select[1].open">
              <span class="selected">{{select[1].selected || 'Choose a previously-used email...'}} <i v-if="select[1].open" class="fas fa-caret-up"></i><i v-else class="fas fa-caret-down"></i></span>
              <ul v-if="select[1].open">
                <li v-for="(value, key) of select[1].options" :key="key" @click.stop="modernSelect(1,value)">{{value}}</li>
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
              <div class="modern-select" @click.stop="select[2].open=!select[2].open">
                <span class="selected">{{select[2].selected || 'Currency'}} <i v-if="select[2].open" class="fas fa-caret-up"></i><i v-else class="fas fa-caret-down"></i></span>
                <ul v-if="select[2].open">
                  <li v-for="(value, key) of select[2].options" :key="key" @click.stop="modernSelect(2,value)">{{value}}</li>
                </ul>
              </div>
            </div>
            <span class="help-text"></span>
          </div>
        </div>
        <div class="form-section">

          <div class="sub-sect">
            <label for="">Send Email to Recipient?</label>
            <div class="switch" v-if="select[0].options.length>0">
              <a :class="sendEmail?'btn active':'btn'" @click.stop="sendEmail=true">Send via email</a>
              <a :class="!sendEmail?'btn active severe':'btn'" @click.stop="sendEmail=false">Do not notify</a>
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
  <div :class="working?'form page working':'form page'" @click.stop="_null()">
    <h1><span>Payment Requests</span><span>{{_decode(currentStore.store_name)}} <i class="fab fa-bitcoin" v-if="currentStore.network==='btc'"></i> <i class="fab fa-ethereum" v-if="currentStore.network==='eth'"></i> </span></h1>

    <div class="message" v-if="message"><i class="fas fa-exclamation-circle"></i> {{message}}</div>
    <div class="flex">
      <div class="button-cluster">
        <a class="btn" @click="newRequest()" title="Create Payment Request"><i class="fas fa-plus"></i> <span>New Request</span></a>
      </div>
      <div class="button-cluster">
        <a class="btn" @click="viewing=20"><i><i class="fas fa-chevron-left"></i><i class="fas fa-chevron-left"></i></i></a>
        <a class="btn" @click="viewing=viewing-20<20?20:viewing=viewing-20"><i class="fas fa-chevron-left"></i></a>
        <a class="">{{range}} to {{viewing>=count?count:viewing}} of {{count}}</a>
        <a class="btn" @click="viewing=viewing+20>count?count:viewing+20"><i class="fas fa-chevron-right"></i></a>
        <a class="btn" @click="viewing=count"><i><i class="fas fa-chevron-right"></i><i class="fas fa-chevron-right"></i></i></a>
      </div>

      <div class="date-range-parent">
        <date-range-picker ref="picker" :locale-data="{ firstDay: 1, format: 'dd-mm-yyyy' }" :minDate="null" :maxDate="null" :singleDatePicker="false" :timePicker="false" :timePicker24Hour="false" :showWeekNumbers="true" :showDropdowns="false" :autoApply="true" v-model="dateRange" @update="getPaymentRequests" :linkedCalendars="false">

        </date-range-picker>
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
      <template v-for="(request, key) of requests">
        <tr :class="active==key?'list-item active':'list-item'" @click="active=key" :key="key">
          <td class="mono border-top-left">
            <div>
              <span>{{(key+range)}}</span>
            </div>
          </td>
          <td class="mono">
            <div>
              <span>{{request.token.substr(0,6)}}</span>
            </div>
          </td>
          <td>
            <div>
              <span>
                <vue-moments-ago prefix="" suffix="ago" :date="request.created" lang="en" /></span>
              <span v-if="active==key"><small>{{(request.created)}} [UTC]</small></span>
            </div>
          </td>
          <td>
            <div>
              <span>{{Number(request.invoice_value).toFixed(2)}} <span class="badge">{{request.currency}}</span></span>
            </div>
          </td>
          <td class="border-top-right">
            <div>
              <span :class="'status ' + request._status"><i v-if="!request._status" class="fas fa-asterisk spin"></i>{{request._status || ''}}</span>
            </div>
          </td>
        </tr>
        <tr v-if="active==key" class="list-item active" :key="key+'ex'">
          <td colSpan="5" class="border-bottom-right border-bottom-left">
            <div class="inline-table-notes">
              <label v-if="request.description">Description:</label><span v-if="request.description">{{_decode(request.description)}}</span>
              <label v-if="request.payee_email">Payee:</label><span v-if="request.payee_email">{{request.payee_email}}</span>
              <label>Received:</label><span>{{request.assocReceived}} {{request.crypto}} </span>
              <label v-if="request.invCount>0">Invoices<br>generated:</label><span v-if="request.invCount>0">{{request.invCount}} </span>

            </div>
          </td>
        </tr>
      </template>
    </table>
  </div>

</div>
</template>

<script>
import {
  mapGetters
} from 'vuex';
import VueMomentsAgo from 'vue-moments-ago'
import DateRangePicker from 'vue2-daterange-picker'
export default {
  name: "PaymentRequest",
  components: {
    VueMomentsAgo,
    DateRangePicker,
  },
  data() {
    return {
      message: false,
      working: true,
      spinning: true,
      viewing: 20,
      total: false,
      filter: false,
      filters: ['expired', 'confirmed', 'receiving', 'partial', '1 conf.', '2 confs'],
      requests: false,
      count: 0,
      active: false,
      statistics: false,
      dateRange: {
        startDate: false,
        endDate: false,
      },
      modal: false,
      descriptionTypeExisting: false,
      description: '',
      emailTypeExisting: false,
      email: '',
      sendEmail: false,
      value: '',
      select: [{
        open: false,
        selected: false,
        options: false
      }, {
        open: false,
        selected: false,
        options: false
      }, {
        open: false,
        selected: false,
        options: ['USD', 'GBP', 'EUR', 'TTD'],
      }],
      confirmedCreatedAddress: false,
      copied:true,
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
    }),
    newRequestCheck() {
      let issues = 0;
      if (!this.value || isNaN(this.value) || this.value < 0) {
        issues++
      }
      if (!this.select[2].selected) {
        issues++
      }
      if (this.emailTypeExisting && !this.select[1].selected) {
        issues++
      }
      if ((this.emailTypeExisting && this.select[1].selected) && (this.select[1].selected.indexOf("@") < 0 || this.select[1].selected.indexOf(".") < 0 || this.select[1].selected.indexOf(".") > this.select[1].selected.length - 3) || (this.emailTypeExisting && !this.select[1].selected)) {
        issues++
      }
      if (this.descriptionTypeExisting && !this.select[0].selected) {
        issues++
      }
      if (!this.emailTypeExisting && !this.email) {
        issues++
      }
      if ((!this.emailTypeExisting && this.email) && (this.email.indexOf("@") < 0 || this.email.indexOf(".") < 0 || this.email.indexOf(".") > this.email.length - 3) || (!this.emailTypeExisting && !this.email)) {
        issues++
      }
      if (!this.descriptionTypeExisting && !this.description) {
        issues++
      }
      return issues > 0 ? false : true;
    },
    reportName() {
      return 'F18Pay Report for Store: ' + this._decode(this.currentStore.store_name) + ' ::' + this.dateRange.startDate + ' to ' + this.dateRange.endDate + ' ::' + (this.filter ? this.filter : 'unfiltered')
    },
    computedDateRange() {
      return new Date(); //"hello"
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
      let current = false
      for (const store of this.stores) {
        if (store.store_id == this.activeStore) {
          current = store;
        }
      }
      return current;
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
      this.getPaymentRequests()
    },
    filter: function () {
      this.viewing = 20;
      this.getPaymentRequests()
    }
  },
  mounted() {
    this.getPrePopulate();
    this.getPaymentRequests();
    this.select[2].options.push(this.currentStore.network.toUpperCase())

  },
  created() {
    this.dateRange.startDate = this.currentStore.created;
  },
  methods: {
        copyCode(copied) {
 
      let workspace = document.getElementById("copy_to_clipboard_workspace");
      (workspace.value = copied),
      workspace.focus(),
        workspace.select();
      try {
        if (document.execCommand("copy")) {
          this.copied = true
        }
      } catch (e) {
        console.error(e)
      }
    },
    async doNewRequest() {
      this.working = true;
      let value = this.value && !isNaN(this.value) && this.value > 0 ? this.value : false;
      let currency = this.select[2].selected
      let email = !this.emailTypeExisting && this.email ? this.email : this.emailTypeExisting && this.select[1].selected ? this.select[1].selected : false
      let description = this.descriptionTypeExisting && this.select[0].selected ? this.select[0].selected : !this.descriptionTypeExisting && this.description ? this.description : false
      if (value && currency && email && description) {
        const username = await this.$store.dispatch('encrypt', {
          string: this.user,
          keyiv: this.keyiv
        });
        const storeId = await this.$store.dispatch('encrypt', {
          string: this.currentStore.store_id,
          keyiv: this.keyiv
        });
        description = await this.$store.dispatch('encrypt', {
          string: encodeURIComponent(encodeURI(description)),
          keyiv: this.keyiv
        });
        email = await this.$store.dispatch('encrypt', {
          string: email,
          keyiv: this.keyiv
        });
        value = await this.$store.dispatch('encrypt', {
          string: value,
          keyiv: this.keyiv
        });
        currency = await this.$store.dispatch('encrypt', {
          string: currency,
          keyiv: this.keyiv
        });

        await fetch("https://money-api.flat18.co.uk/store-requests-create-new", {
            method: 'POST',
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            body: JSON.stringify({
              username: username,
              fingerprint: this.fingerprint,
              keyivId: this.keyivId,
              store_id: storeId,
              description: description,
              email: email,
              value: value,
              currency: currency,
              notify:this.sendEmail,
            }),
          })
          .then((response) => response.json())
          .then(async (data) => {
            if (data.proceed == true) {
              console.log("debug", data.debug)
              if (data.extra == 'viewAddress') {
                let decrypted = JSON.parse(await this.$store.dispatch('decrypt', {
                  string: data.address,
                  keyiv: this.keyiv
                }))
                this.confirmedCreatedAddress = decrypted
                this.working = false;
              }
            } else {
              this.message = data.debug ? data.debug : "There was a problem with the information provided."
            }
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      } else {
        this.message = "Please complete the entire form."
      }
    },
    modernSelect(index, value) {
      this.select[index].selected = value;
      this.select[index].open = false;
    },
    newRequest() {
      this.modal = true;
      this.confirmedCreatedAddress = false;
      this.copied=false;
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
    async getPrePopulate() {
      const username = await this.$store.dispatch('encrypt', {
        string: this.user,
        keyiv: this.keyiv
      });
      const storeId = await this.$store.dispatch('encrypt', {
        string: this.currentStore.store_id,
        keyiv: this.keyiv
      });
      await fetch("https://money-api.flat18.co.uk/store-requests-pre-populate", {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          body: JSON.stringify({
            username: username,
            fingerprint: this.fingerprint,
            keyivId: this.keyivId,
            store_id: storeId,
          }),
        })
        .then((response) => response.json())
        .then(async (data) => {
          if (data.proceed == true) {
            console.log("debug", data.debug)
            let decrypted = JSON.parse(await this.$store.dispatch('decrypt', {
              string: data['pre-populate'],
              keyiv: this.keyiv
            }))
            this.select[0].options = await this.unique(decrypted.descriptions)
            this.select[1].options = await this.unique(decrypted.emails)
          } else {
            this.message = data.debug ? data.debug : "There was a problem with the information provided."
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
    async unique(array){
      let temp = Array();
      for(const item of array){
        if(temp.indexOf(item)<0){
          temp.push(item)
        }
      }
  return temp;
    },
    async getPaymentRequests() {
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
      await fetch("https://money-api.flat18.co.uk/store-requests", {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          body: JSON.stringify({
            username: username,
            storeName: storeName,
            fingerprint: this.fingerprint,
            keyivId: this.keyivId,
            store_id: storeId,
            viewing: viewing,
            filter: this.filter,
            rangeStart: rangeStart,
            rangeEnd: rangeEnd,
          }),
        })
        .then((response) => response.json())
        .then(async (data) => {
          if (data.proceed == true) {
            this.count = data.count;
            this.requests = JSON.parse(await this.$store.dispatch('decrypt', {
                string: data.requests,
                keyiv: this.keyiv
              })),
              this.dateRange.endDate = data.now;
            this.working = false;
            this.spinning = false;
            for (const request of this.requests) {

              if (request.status == 1) {
                request._status = "receiving";
              }
            }
          } else {
            this.message = data.debug ? data.debug : "There was a problem with the information provided."
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
    async getStatus(request) {
      this.working = true;
      const username = await this.$store.dispatch('encrypt', {
        string: this.user,
        keyiv: this.keyiv
      });
      const address = await this.$store.dispatch('encrypt', {
        string: request.address,
        keyiv: this.keyiv
      });
      const created = await this.$store.dispatch('encrypt', {
        string: request.created,
        keyiv: this.keyiv
      });
      const id = await this.$store.dispatch('encrypt', {
        string: request.id,
        keyiv: this.keyiv
      });
      const crypto = await this.$store.dispatch('encrypt', {
        string: request.crypto,
        keyiv: this.keyiv
      });
      const value = await this.$store.dispatch('encrypt', {
        string: request.btc_value,
        keyiv: this.keyiv
      });
      const status = await this.$store.dispatch('encrypt', {
        string: request.status,
        keyiv: this.keyiv
      });
      await fetch("https://money-api.flat18.co.uk/request-check-status", {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data'
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
            for (const request_ of this.requests) {
              if (request_.id === request.id) {
                request_._status = status_;
                break;
              }
            }
            this.working = false;

          } else {
            this.message = data.debug ? data.debug : "There was a problem with the information provided."
          }
        })
        .catch((error) => {
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
.request-list {
  min-height: 500px;
  border-collapse: collapse;

  .list-item {
    &:not(.active){&:hover{box-shadow: -2px 0px 0px 0px;}}

cursor:pointer;
    &.active {
      td {
        background: var(--accent-3);
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
<style lang="css">
@import "../assets/css/fonts-mono.css";
</style>
