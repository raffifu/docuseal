<script setup>

defineProps({
  data: Array
})

</script>

<template>
  <table v-if="data" id="laporan" class="bg-white">
    <thead>
      <tr>
        <th colspan="1" rowspan="2">No.</th>
        <th colspan="1" rowspan="2">Asset</th>
        <th colspan="1" rowspan="2">Jenis Kerusakan Aset</th>
        <th colspan="5" rowspan="1">Lokasi (KM)</th>
        <th colspan="1" rowspan="2">Unit</th>
        <th colspan="3" rowspan="1">Volume</th>
        <th colspan="2" rowspan="1">Severity Level</th>
        <th colspan="1" rowspan="2">Usulan</th>
        <th colspan="1" rowspan="2">Dokumentasi Kerusakan</th>
      </tr>
      <tr>
        <th colspan="1">Area</th>
        <th colspan="1">Awal</th>
        <th colspan="1">Akhir</th>
        <th colspan="1">Jalur</th>
        <th colspan="1">LAJUR</th>
        <th colspan="1">P</th>
        <th colspan="1">L</th>
        <th colspan="1">T</th>
        <th colspan="1">Fisk</th>
        <th colspan="1">Fungsi</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(it, idx) in data" :key="idx">
        <td>{{ idx + 1 }}</td>
        <td>{{ it.aset }}</td>
        <td>{{ it.defect }}</td>
        <td>{{ it.area }}</td>
        <td>{{ it.awal }}</td>
        <td>{{ it.akhir }}</td>
        <td>{{ it.jalur }}</td>
        <td>{{ it.lajur }}</td>
        <td>{{ it.unit }}</td>
        <td>{{ it.panjang }}</td>
        <td>{{ it.lebar }}</td>
        <td>{{ it.tinggi }}</td>
        <td>{{ it.severity }}</td>
        <td></td>
        <td>{{ it.usulan }}</td>
        <td>
          <img :src="'https://drive-proxy.raffifebriandikau.workers.dev/download?id=' + it.image" />
        </td>
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
