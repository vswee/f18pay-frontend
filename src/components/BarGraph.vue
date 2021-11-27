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
    mounted() {
      this.renderChart(this.chart.chartData, this.chart.options)
    }
  }
</script>