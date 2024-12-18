<script setup>
const props = defineProps({
  data: Array
})

const processedData = {}
props.data.forEach(it => {
  const key = `${it.jenis_aset}##${it.severity}##${it.defect}##${it.satuan}`

  if (Object.keys(processedData).includes(key)) {
    const item = processedData[key]
    processedData[key] = {
      ...item,
      banyak_temuan: Number(item.banyak_temuan) + Number(it.banyak_temuan)
    }
  } else {
    processedData[key] = {
      ...it,
      banyak_temuan: Number(it.banyak_temuan),
    }
  }
})
</script>

<template>
  <table v-if="processedData" id="laporan" class="bg-white">
    <thead>
      <tr>
        <th colspan="1" rowspan="2">No.</th>
        <th colspan="1" rowspan="2">Aset</th>
        <th colspan="1" rowspan="2">Jenis Kerusakan</th>
        <th colspan="1" rowspan="2">Volume</th>
        <th colspan="1" rowspan="2">Satuan</th>
        <th colspan="1" rowspan="2">Severity Level</th>
        <th colspan="1" rowspan="2">Jenis Penanganan</th>
        <th colspan="2" rowspan="1">Rekomendasi</th>
        <th colspan="2" rowspan="1">Approval BUJT</th>
        <th colspan="1" rowspan="2">Catatan</th>
      </tr>
      <tr>
        <th colspan="1">Penanganan Sementara (PS)</th>
        <th colspan="1">Penanganan Permanen (PP)</th>
        <th colspan="1">PS</th>
        <th colspan="1">PP</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(it, idx) in Object.values(processedData)" :key="idx">
        <td>{{ idx + 1 }}</td>
        <td>{{ it.jenis_aset }}</td>
        <td>{{ it.defect }}</td>
        <td>{{ it.banyak_temuan }}</td>
        <td>{{ it.satuan }}</td>
        <td>{{ it.severity }}</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
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
