<template lang="">
<div class="store-management">
  <h1><img class="store-icon" v-if="storeLogo()" :src="storeLogo()">{{storeName()}}</h1>
  <h2>{{storeBalance() || '0.00'}} BTC</h2>
  <small :class="storeStatus()==1?'status bad':'status good'">{{storeStatus()==1?'Disabled':'Active'}}</small>
  <p class="help-text"><i class="fas fa-info-circle"></i> We never monitor wallet addresses outside of the scope of 'incoming transactions for associated invoices'.<br>This means that your Balance won't reflect withdrawals or transactions on addresses not associated with invoices on this platform.</p>
  <div class="subsect">
    <h3>Invoice Statistics</h3>
    <p class="help-text">Displays paid v total invoices generated over the last 6 months.</p>
    <bar-chart v-if="chart.chartData && !chartDestroy" class="graph"></bar-chart>
  </div>
</div>
</template>

<script>
import {
  mapGetters
} from 'vuex';
export default {
  name: "StoreSettings",
  data() {
    return {

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
    })
  },
  mounted() {

},
  methods: {
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
          console.error("Error:", error);
        });
    },
    storeName() {
      for (const store of this.stores) {
        if (store.store_id == this.activeStore) {
          return store.store_name;
        }
      }
    },
    storeBalance() {
      for (const store of this.stores) {
        if (store.store_id == this.activeStore) {
          return store.sum;
        }
      }
    },
    storeLogo() {
      for (const store of this.stores) {
        if (store.store_id == this.activeStore) {
          return store.store_logo;
        }
      }
      return false
    },
    storeStatus() {
      for (const store of this.stores) {
        if (store.store_id == this.activeStore) {
          return store.deleted;
        }
      }
    },
    async setStoreLocal(object, value){
      let temp = []
      for (const store of this.stores) {
        let tempObj = store;
        if (store.store_id == this.activeStore) {
          tempObj[object]=store[value];
        }
        temp.push(tempObject)
      }
      this.$store.commit("setStores", temp);
    }
  }
}
</script>

<style lang="">
  
</style>
