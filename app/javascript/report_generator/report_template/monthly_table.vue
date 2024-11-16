<script setup>
import PerformaAset from './components/performa_aset.vue'
import LevelSeverity from './components/level_severity.vue';
import PieChart from './components/pie_chart.vue';
import BarChart from './components/bar_chart.vue';

defineProps({
  data: Object
})

function getData(it) {
  return [
    it.total_baik,
    it.total_defect
  ]
}

function getSummaryData(data) {
  return {
    labels: ['Kondisi Baik', "Kondisi Defect"],
    datasets: data.length !== 0 ? [{
      data: getData(data[data.length - 1])
    }] : []
  }
}

function getVolumeData(data) {
  const processedData = {}
  data.forEach(it => {
    const key = it.defect

    if (Object.keys(processedData).includes(key)) {
      const item = processedData[key]
      processedData[key] = {
        ...item,
        volume: Number(item.banyak_temuan) + Number(it.banyak_temuan)
      }
    } else {
      processedData[key] = {
        ...it,
        banyak_temuan: Number(it.banyak_temuan)
      }
    }
  })

  if (Object.keys(processedData).length === 0)
    return {
      labels: [],
      datasets: []
    }

  return {
    labels: Object.keys(processedData),
    datasets: [{
      data: Object.values(processedData).map(it => it.banyak_temuan)
    }]
  }
}

function getRiskData(data) {
  const processedData = {}
  data.forEach(it => {
    const key = it.severity

    if (Object.keys(processedData).includes(key)) {
      const item = processedData[key]
      processedData[key] = {
        ...item,
        volume: Number(item.banyak_temuan) + Number(it.banyak_temuan)
      }
    } else {
      processedData[key] = {
        ...it,
        banyak_temuan: Number(it.banyak_temuan)
      }
    }
  })

  if (Object.keys(processedData).length === 0)
    return {
      labels: [],
      datasets: []
    }

  return {
    labels: Object.keys(processedData),
    datasets: [{
      data: Object.values(processedData).map(it => it.banyak_temuan),
      backgroundColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(255, 205, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(201, 203, 207, 1)'
      ]
    }]
  }
}

function cleanStr(str) {
  return str.toLowerCase().replace(/[^a-z]/g, '')
}

</script>

<template>
  <div v-for="(value, key) in data" :key="key">
    <h2 class="text-2xl font-bold truncate text-center">{{ key }}</h2>

    <div class="grid grid-cols-3 gap-1">
      <div>
        <PieChart :id="`pie-summary-${cleanStr(key)}`" :chart-data="getSummaryData(value.summary)" />
      </div>
      <div>
        <PieChart :id="`pie-volume-${cleanStr(key)}`" :chart-data="getVolumeData(value.assets)" />
      </div>
      <div>
        <BarChart :id="`bar-risk-${cleanStr(key)}`" :chart-data="getRiskData(value.assets)" />
      </div>
    </div>

    <h3 class="text-xl truncate font-bold md:block ">Aset {{ key }}</h3>

    <PerformaAset :id="`laporan-${cleanStr(key)}`" :data="value.summary" />

    <h3 class="text-xl truncate font-bold md:block ">Level Severity Setiap Defect</h3>

    <LevelSeverity :id="`laporan-severity-${cleanStr(key)}`" :data="value.assets" />
  </div>
</template>
