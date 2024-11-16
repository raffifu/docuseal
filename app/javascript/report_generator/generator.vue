<script setup>
import WeeklyTable from './report_template/weekly_table.vue';
import DailyTable from './report_template/daily_table.vue';
import MonthlyTable from './report_template/monthly_table.vue';

import Loading from './loading.vue';
import EmptyData from './empty_data.vue';

import { ref, watch } from 'vue';
import { DailyReportGenerator, WeeklyReportGenerator, MonthlyReportGenerator } from './helpers';

const props = defineProps({
  authenticityToken: String,
  formId: String,
  backendUrl: String
})

const isLoading = ref(false)

const laporanType = ref('harian')
const startDate = ref(null)
const endDate = ref(null)

const documentName = ref('Generated Document')
const data = ref(null)

let controller = null

const getReportGenerator = () => {
  if (laporanType.value === 'harian')
    return DailyReportGenerator
  else if (laporanType.value === 'mingguan')
    return WeeklyReportGenerator
  else if (laporanType.value === 'bulanan')
    return MonthlyReportGenerator

  return null
}

const updateDocumentName = () => {
  if (laporanType.value === 'harian')
    documentName.value = `Laporan Harian - ${localeDateString(startDate.value)}.pdf`
  else if (laporanType.value === 'mingguan')
    documentName.value = `Laporan Mingguan - ${localeDateString(startDate.value)} sd ${localeDateString(endDate.value)}.pdf`
  else if (laporanType.value === 'bulanan')
    documentName.value = `Laporan Bulanan - ${localeDateString(startDate.value, { month: 'long', year: 'numeric' })}.pdf`
}

const downloadPDF = () => {
  const ReportGenerator = getReportGenerator()
  if (!ReportGenerator)
    throw new Error("Report Generator is not available")

  const reportGenerator = new ReportGenerator(localeDateString(startDate.value), localeDateString(endDate.value))
  const doc = reportGenerator.generate()

  doc.save(documentName.value)
}

const handleSubmit = async () => {
  if (!documentName.value) {
    console.error("Document name not specified")
    return
  }

  const formData = new FormData();
  formData.append('authenticity_token', props.authenticityToken);
  formData.append('form_id', props.formId);

  const ReportGenerator = getReportGenerator()
  if (!ReportGenerator)
    throw new Error("Report Generator is not available")

  const reportGenerator = new ReportGenerator(localeDateString(startDate.value), localeDateString(endDate.value))
  const doc = reportGenerator.generate()

  const blob = new Blob([doc.output('blob')], { type: "application/pdf" });
  formData.append("files[]", blob, `${documentName.value}.pdf`);

  try {
    const response = await fetch('/templates_upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (response.redirected)
      window.location.href = response.url;

  } catch (error) {
    console.error('Error uploading template:', error);
  }
}

const localeDateString = (dateString, options = { day: 'numeric', month: 'short', year: 'numeric' }) => {
  // Create a Date object from the input string
  const date = new Date(dateString);

  // Format the date using toLocaleDateString
  return date.toLocaleDateString('id-ID', options);
}

const formatDate = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');  // Months are zero-based, so add 1
  const dd = String(date.getDate()).padStart(2, '0');  // Ensure day is always 2 digits

  return `${yyyy}-${mm}-${dd}`;
}

const getUrl = () => {
  if (laporanType.value === 'bulanan') {
    return `${props.backendUrl}/api/v1/report?start_date=${startDate.value}&end_date=${endDate.value}`
  } else if (laporanType.value === 'harian') {
    const date = new Date(startDate.value)
    date.setDate(date.getDate() + 1)

    return `${props.backendUrl}/api/v1/inspeksi?start_date=${startDate.value}&end_date=${formatDate(date)}`
  } else if (laporanType.value === 'mingguan')
    return `${props.backendUrl}/api/v1/looker?start_date=${startDate.value}&end_date=${endDate.value}`
}


watch(
  [startDate, endDate],
  async ([newStartDate, newEndDate], _) => {
    if (controller) {
      controller.abort()
    }

    controller = new AbortController()

    if (!newStartDate || !newEndDate) return;
    if (!props.backendUrl) return

    isLoading.value = true
    data.value = null

    try {
      const url = getUrl()
      const resp = await fetch(url, { signal: controller.signal })

      data.value = await resp.json()

      updateDocumentName()
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {

        console.error(error)
        data.value = null
      }
    }

    isLoading.value = false
  }
)

watch(
  laporanType,
  (newLaporanType, _) => {
    const today = new Date()
    today.setDate(today.getDate() + 1)
    endDate.value = formatDate(today)

    if (newLaporanType === 'harian') {
      today.setDate(today.getDate() - 1)
      startDate.value = formatDate(today)
    } else if (newLaporanType === 'mingguan') {
      today.setDate(today.getDate() - 7)
      startDate.value = formatDate(today)
    } else if (newLaporanType === 'bulanan') {
      today.setDate(today.getDate() - 30)
      startDate.value = formatDate(today)
    }

  },
  { immediate: true }
)
</script>


<template>

  <div class="flex mb-2">
    <label class="mx-1 form-control">
      <div class="label">
        <span class="label-text">Laporan Type</span>
      </div>
      <select class="select select-bordered" v-model="laporanType">
        <option value="harian">Laporan Harian</option>
        <option value="mingguan">Laporan Mingguan</option>
        <option value="bulanan">Laporan Bulanan</option>
      </select>
    </label>
    <label class="mx-1 form-control">
      <div class="label">
        <span class="label-text" v-if="laporanType === 'harian'">Date</span>
        <span class="label-text" v-else>Start Date</span>
      </div>
      <input id="startDate" type="date" class="input input-md input-bordered" v-model="startDate" />
    </label>
    <label class="mx-1 form-control" v-if="laporanType !== 'harian'">
      <div class="label">
        <span class="label-text">End Date</span>
      </div>
      <input id="endDate" type="date" class="input input-md input-bordered" v-model="endDate" />
    </label>
  </div>

  <Loading v-if="isLoading" />
  <EmptyData v-else-if="!data || data.length === 0" />
  <template v-else>

    <DailyTable v-if="laporanType === 'harian'" :data="data" :backend="backendUrl" />
    <WeeklyTable v-else-if="laporanType === 'mingguan'" :data="data" />
    <MonthlyTable v-else-if="laporanType === 'bulanan'" :data="data" />

    <div class="flex gap-2 p-2 justify-center">
      <button class="btn" @click="downloadPDF">Download PDF</button>
      <button class="btn btn-warning" onclick="doc_modal.showModal()">Sign Request</button>
    </div>

    <dialog id="doc_modal" class="modal modal-bottom sm:modal-middle">
      <div class="modal-box">
        <h3 class="text-lg font-bold">Create Report</h3>

        <form @submit.prevent="handleSubmit" action="/templates_upload" method="post" enctype="multipart/form-data">
          <label class="form-control w-full">
            <div class="label">
              <span class="label-text-alt">Document Name</span>
            </div>
            <input type="text" placeholder="Laporan Mingguan - I" class="input input-bordered w-full"
              v-model="documentName" />

            <div class="label">
              <span class="label-text-alt">Name must be more than 1 character</span>
            </div>
          </label>

          <div class="modal-action">
            <button type="button" class="btn" onclick="doc_modal.close()">Close</button>
            <button type="submit" class="btn btn-warning">Next</button>
          </div>
        </form>
      </div>
    </dialog>
  </template>
</template>
