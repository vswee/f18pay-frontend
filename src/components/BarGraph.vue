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
import { useMainStore } from '@/stores';
import { storeToRefs } from 'pinia';

const store = useMainStore();
const { chart } = storeToRefs(store);

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);
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
