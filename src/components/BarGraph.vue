<template>
  <div class="line-graph ui-ele">
    <!-- <div class="title">SHA256 Hash-rate (PH/s)</div> -->
    <Bar :data="chart.chartData" :options="chart.options" />
  </div>
</template>

<script setup>
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar  } from 'vue-chartjs';
import { useStore } from 'vuex';
import { computed } from 'vue';
const store = useStore();
const chart = computed(() => store.getters.chart);

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const col = ['#00ffbf', '#009be7', '#0062ff'];

const data = {
  labels: ['Increment 1', 'Increment 2', 'Increment 3', 'Increment 4', 'Increment 5'],
  datasets: randomDatasets()
};

const options = {
  responsive: true,
  borderColor: '#0062ff',
  tension: 0.2,
  maintainAspectRatio: false,
  color: '#fff',
  fill: true,
};

function randomDatasets() {
  let tmp = [];
  for (let i = 0; i < 3; i++) {
    tmp.push({
      borderColor: col[i],
      backgroundColor: (ctx) => {
        const canvas = ctx.chart.ctx;
        const gradient = canvas.createLinearGradient(0, 0, 0, 500);
        gradient.addColorStop(0, `${col[i]}75`);
        gradient.addColorStop(1, `${col[i]}00`);
        return gradient;
      },
      label: 'Dataset ' + i,
      data: Array.from({ length: 5 }, () => Math.floor(Math.random() * 10))
    });
  }
  return tmp;
}
</script>

<style lang="scss" scoped>
.line-graph {
  width: 100%;
  max-height: 50vh;
  flex-grow: 1;
  display: grid;
  contain: strict;
  height: 500px;
}
</style>


<!-- <script>
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
</script> -->