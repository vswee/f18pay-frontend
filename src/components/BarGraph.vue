<script>
  import { Bar } from 'vue-chartjs'
import {
  mapGetters
} from 'vuex';
  export default {
    extends: Bar,
    computed: {
    ...mapGetters({
      chart: 'chart',
    })
  },
    async mounted() {
      let chartData = {copiedData: this.chart.chartData};
      this.renderChart(chartData.copiedData, this.chart.options)
    }
  }
</script>