<script setup>
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  BarElement,
  CategoryScale,
  Colors,
  Legend,
  LinearScale
} from 'chart.js'
import { Bar } from 'vue-chartjs'

const props = defineProps({
  chartData: Object,
  id: String
})

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, Colors, {
  id: 'noData',
  afterDraw: function (chart) {
    if (chart.data.datasets.length === 0) {
      // No data is present
      const ctx = chart.ctx;
      const width = chart.width;
      const height = chart.height;
      chart.clear();

      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "bold 20px serif";
      ctx.fillStyle = "gray";
      ctx.fillText(
        "No data Available",
        width / 2,
        height / 2
      );
      ctx.restore();
    }
  }
})

const chartOptions = {
  responsive: true,
  indexAxis: 'y',
  plugins: {
    legend: {
      display: false
    },
  }
}
</script>

<template>
  <Bar :id="id" :data="chartData" :options="chartOptions" />
</template>
