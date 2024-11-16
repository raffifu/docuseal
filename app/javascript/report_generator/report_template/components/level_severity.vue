<script setup>
import { ref } from 'vue'

const props = defineProps({
  data: Array,
  id: String
})

const processedData = ref({})
props.data.forEach(it => {
  const key = `${it.jenis_aset}##${it.severity}##${it.defect}##${it.satuan}`

  if (Object.keys(processedData.value).includes(key)) {
    const item = processedData.value[key]
    processedData.value[key] = {
      ...item,
      volume: Number(item.banyak_temuan) + Number(it.banyak_temuan)
    }
  } else {
    processedData.value[key] = {
      ...it,
      banyak_temuan: Number(it.banyak_temuan)
    }
  }
})

function sortData(data) {
  return Object.values(data).sort((a, b) => {
    return ('' + a.severity).localeCompare(b.severity)
  });
}

</script>

<template>
  <table v-if="processedData" :id="id" class="bg-white">
    <thead>
      <tr>
        <th colspan="1" rowspan="1">No.</th>
        <th colspan="1" rowspan="1">Aset</th>
        <th colspan="1" rowspan="1">Jenis Kerusakan</th>
        <th colspan="1" rowspan="1">Volume</th>
        <th colspan="1" rowspan="1">Satuan</th>
        <th colspan="1" rowspan="1">Severity Level</th>
        <th colspan="1" rowspan="1">Intruksi dari BUJT (Jenis Penanganan)</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(it, idx) in sortData(processedData)" :key="idx">
        <td>{{ idx + 1 }}</td>
        <td>{{ it.jenis_aset }}</td>
        <td>{{ it.defect }}</td>
        <td>{{ it.banyak_temuan }}</td>
        <td>{{ it.satuan }}</td>
        <td>{{ it.severity }}</td>
        <td></td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
table {
  border-collapse: collapse;
  width: 100%;
}

th,
td {
  border: 1px solid black;
  text-align: center;
  font-size: 10px;
}
</style>
