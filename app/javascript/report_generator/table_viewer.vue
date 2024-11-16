<script setup>
import { ref } from 'vue'

defineProps({
  data: Array
})


</script>

<template>
  <table v-if="data" id="laporan" class="bg-white">
    <thead>
      <tr>
        <th colspan="1" rowspan="2">No.</th>
        <th colspan="1" rowspan="2">Temuan</th>
        <th colspan="1" rowspan="2">Dokumentasi</th>
        <th colspan="3" rowspan="1">Lokasi</th>
        <th colspan="1" rowspan="2">Tingkat kerusakan</th>
        <th colspan="1" rowspan="2">Unit</th>
        <th colspan="3" rowspan="1">Volume</th>
        <th colspan="2" rowspan="1">Rekomendasi</th>
        <th colspan="2" rowspan="1">Approval BUJT</th>
      </tr>
      <tr>
        <th colspan="1">STA</th>
        <th colspan="1">Lajur</th>
        <th colspan="1">Jalur</th>
        <th colspan="1">P</th>
        <th colspan="1">L</th>
        <th colspan="1">T</th>
        <th colspan="1">Penanganan Sementara (PS)</th>
        <th colspan="1">Penanganan Permanen (PP)</th>
        <th colspan="1">PS</th>
        <th colspan="1">PP</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(it, idx) in data" :key="idx">
        <td>{{ idx + 1 }}</td>
        <td>{{ it.defect }}</td>
        <td>
          <img :src="'https://drive-proxy.raffifebriandikau.workers.dev/download?id=' + it.image" />
        </td>
        <td>{{ it.severity }}</td>
        <td>{{ it.unit }}</td>
        <td>{{ it.awal }}</td>
        <td>{{ it.lajur }}</td>
        <td>{{ it.jalur }}</td>
        <td>{{ it.panjang }}</td>
        <td>{{ it.lebar }}</td>
        <td>{{ it.tinggi }}</td>
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
