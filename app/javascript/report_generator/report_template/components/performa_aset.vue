<script setup>
const props = defineProps({
  data: Array,
  id: String
})

const monthName = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]

function parseData(data, base) {
  if (!base) {
    return {
      value: '-',
      pct: '-'
    }
  }

  const value = !data || isNaN(data) ? 0 : data
  const pct = value / base * 100

  return {
    value: value.toLocaleString('id-ID'),
    pct: `${pct.toFixed(2)}%`
  }
}

const processedData = []
props.data.forEach(it => {
  processedData.push({
    header: `${monthName[it.month - 1]} ${it.year}`,
    jumlah_aset: parseData(it.jumlah_aset, it.jumlah_aset),
    total_defect_lalu: parseData(it.total_defect_lalu, it.jumlah_aset),
    total_temuan: parseData(it.total_temuan, it.jumlah_aset),
    total_perbaikan: parseData(it.total_perbaikan, it.jumlah_aset),
    total_defect: parseData(it.total_defect, it.jumlah_aset),
    total_baik: parseData(it.total_baik, it.jumlah_aset),
  })
})

while (processedData.length !== 3) {
  processedData.unshift({
    header: '-',
    jumlah_aset: parseData(null, null),
    total_defect_lalu: parseData(null, null),
    total_temuan: parseData(null, null),
    total_perbaikan: parseData(null, null),
    total_defect: parseData(null, null),
    total_baik: parseData(null, null),
  })
}

</script>
<template>
  <table v-if="processedData.length === 3" :id="id" class="bg-white">
    <thead>
      <tr>
        <th colspan="1" rowspan="2">No.</th>
        <th colspan="2" rowspan="2">Kondisi</th>
        <th colspan="2" rowspan="1">{{ processedData[0].header }}</th>
        <th colspan="2" rowspan="1">{{ processedData[1].header }}</th>
        <th colspan="2" rowspan="1">{{ processedData[2].header }}</th>
      </tr>
      <tr>
        <th colspan="1" rowspan="1">Jumlah</th>
        <th colspan="1" rowspan="1">Persentase</th>
        <th colspan="1" rowspan="1">Jumlah</th>
        <th colspan="1" rowspan="1">Persentase</th>
        <th colspan="1" rowspan="1">Jumlah</th>
        <th colspan="1" rowspan="1">Persentase</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>Jumlah aset</td>
        <td>a</td>
        <td>{{ processedData[0].jumlah_aset.value }}</td>
        <td>{{ processedData[0].jumlah_aset.pct }}</td>
        <td>{{ processedData[1].jumlah_aset.value }}</td>
        <td>{{ processedData[1].jumlah_aset.pct }}</td>
        <td>{{ processedData[2].jumlah_aset.value }}</td>
        <td>{{ processedData[2].jumlah_aset.pct }}</td>

      </tr>
      <tr>
        <td>2</td>
        <td>Defect bulan lalu</td>
        <td>b</td>
        <td>{{ processedData[0].total_defect_lalu.value }}</td>
        <td>{{ processedData[0].total_defect_lalu.pct }}</td>
        <td>{{ processedData[1].total_defect_lalu.value }}</td>
        <td>{{ processedData[1].total_defect_lalu.pct }}</td>
        <td>{{ processedData[2].total_defect_lalu.value }}</td>
        <td>{{ processedData[2].total_defect_lalu.pct }}</td>
      </tr>
      <tr>
        <td>3</td>
        <td>Temuan bulan ini</td>
        <td>c</td>
        <td>{{ processedData[0].total_temuan.value }}</td>
        <td>{{ processedData[0].total_temuan.pct }}</td>
        <td>{{ processedData[1].total_temuan.value }}</td>
        <td>{{ processedData[1].total_temuan.pct }}</td>
        <td>{{ processedData[2].total_temuan.value }}</td>
        <td>{{ processedData[2].total_temuan.pct }}</td>
      </tr>
      <tr>
        <td>4</td>
        <td>Perbaikan bulan ini</td>
        <td>d</td>
        <td>{{ processedData[0].total_perbaikan.value }}</td>
        <td>{{ processedData[0].total_perbaikan.pct }}</td>
        <td>{{ processedData[1].total_perbaikan.value }}</td>
        <td>{{ processedData[1].total_perbaikan.pct }}</td>
        <td>{{ processedData[2].total_perbaikan.value }}</td>
        <td>{{ processedData[2].total_perbaikan.pct }}</td>
      </tr>
      <tr>
        <td>5</td>
        <td>Kondisi defect</td>
        <td>e = b + c - d</td>
        <td>{{ processedData[0].total_defect.value }}</td>
        <td>{{ processedData[0].total_defect.pct }}</td>
        <td>{{ processedData[1].total_defect.value }}</td>
        <td>{{ processedData[1].total_defect.pct }}</td>
        <td>{{ processedData[2].total_defect.value }}</td>
        <td>{{ processedData[2].total_defect.pct }}</td>
      </tr>
      <tr>
        <td>6</td>
        <td>Kondisi baik</td>
        <td>f = a - e</td>
        <td>{{ processedData[0].total_baik.value }}</td>
        <td>{{ processedData[0].total_baik.pct }}</td>
        <td>{{ processedData[1].total_baik.value }}</td>
        <td>{{ processedData[1].total_baik.pct }}</td>
        <td>{{ processedData[2].total_baik.value }}</td>
        <td>{{ processedData[2].total_baik.pct }}</td>
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
