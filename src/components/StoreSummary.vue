<template lang="">
<div class="store-management">
  <h1><img class="store-icon" v-if="currentStore.store_logo" :src="currentStore.store_logo"><span>{{_decode(currentStore.store_name)}} <i class="fab fa-bitcoin" v-if="currentStore.network==='btc'"></i> <i class="fab fa-ethereum" v-if="currentStore.network==='eth'"></i> </span></h1>
  <h2>{{currentStore.sum || '0.00'}} {{currentStore.network.toUpperCase()}}</h2>
  <small :class="currentStore.deleted==1?'status bad':'status good'">{{currentStore.deleted==1?'Disabled':'Active'}}</small>
  <p class="help-text"><i class="fas fa-info-circle"></i> We never monitor wallet addresses outside of the scope of 'incoming transactions for associated invoices'.<br>This means that your Balance won't reflect withdrawals or transactions on addresses not associated with invoices on this platform.</p>
  <div v-if="chart.chartData" class="subsect">
    <h3>Invoice Statistics</h3>
    <p class="help-text">Displays paid v total invoices generated over the last 6 months.</p>
    <bar-chart v-if="chart.chartData && !chartDestroy" class="graph"></bar-chart>
  </div>
</div>
</template>

<script>
import BarChart from '@/components/BarGraph'
import {
  mapGetters
} from 'vuex';
export default {
  name: "StoreSummary",
  components: {
    BarChart
  },
  data() {
    return {
      invoice_values: false,
      invoice_values2: false,
      invoice_dates: false,
      chartDestroy: false,
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
      chart: 'chart',
      stores: 'stores',
    }),
    currentStore() {
      let current = false
      for (const store of this.stores) {
        if (store.store_id == this.activeStore) {
          current = store;
        }
      }
      return current;
    },
  },
  watch: {
    activeStore: function (val) {
      this.fetchInvoiceValues(val)
    },
  },
  mounted() {
    document.querySelector('.dynamic-cta-header-space')&&(document.querySelector('.dynamic-cta-header-space').innerHTML = '')
    this.fetchInvoiceValues(this.activeStore)
  },
  methods: {
    _decode(string) {
      let decoded = decodeURIComponent(decodeURI(string));
      return decoded
    },
    async fetchInvoiceValues(id) {
      this.chartDestroy = true;
      this.$store.commit("setChart", {
        chartData: false,
        options: false
      });
      const username = await this.$store.dispatch('encrypt', {
        string: this.user,
        keyiv: this.keyiv
      });
      await fetch("https://money-api.flat18.co.uk/store-invoice-values", {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          body: JSON.stringify({
            username: username,
            fingerprint: this.fingerprint,
            keyivId: this.keyivId,
            storeId: id,
          }),
        })
        .then((response) => response.json())
        .then((data) => {
          this.message = data.debug ? data.debug : false
          if (data.proceed == true) {
            //HANDLE STORES DATA
            let array = []
            let array2 = []
            let arrayDates = []
            const year = new Date().getFullYear();
            if (data.invoiceValues.length > 0) {
              for (const invoice of data.invoiceValues) {
                let value = invoice.count ? Number(invoice.count) : 0;
                let value2 = invoice.count2 ? Number(invoice.count2) : 0;
                let date = invoice.date.split(" ")[0] == year ? invoice.date.replace(year + ' ', '') : invoice.date;
                array.push(value)
                array2.push(value2)
                arrayDates.push(date)
              }
              this.invoice_values = array.length == 0 ? false : array
              this.invoice_values2 = array2.length == 0 ? false : array2
              this.invoice_dates = arrayDates.length == 0 ? false : arrayDates
              this.$store.commit("setChart", {
                chartData: {
                  labels: this.invoice_dates,
                  datasets: [{
                      data: this.invoice_values,
                      label: "Paid Invoices",
                      backgroundColor: "#19d87f"
                    },
                    {
                      data: this.invoice_values2,
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
              this.chartDestroy = false;
            }

          } else {
            this.message = "Failed to fetch values"
          }
        })
        .catch((error) => {
          this.message = this.message + ' \nError: ' + error + '\n';
          console.error("Error:", error);
        });
    },
  }
}
</script>

<style lang="">
  
</style>
