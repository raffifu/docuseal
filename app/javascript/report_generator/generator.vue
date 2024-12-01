<script setup>
import WeeklyTable from './report_template/weekly_table.vue';
import DailyTable from './report_template/daily_table.vue';

import Loading from './loading.vue';
import EmptyData from './empty_data.vue';

import { ref, watchEffect } from 'vue';
import { DailyReportGenerator, WeeklyReportGenerator } from './helpers';

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

const getReportGenerator = () => {
  if (laporanType.value === 'harian')
    return DailyReportGenerator
  else if (laporanType.value === 'mingguan')
    return WeeklyReportGenerator

  return null
}

const updateDocumentName = () => {
  if (laporanType.value === 'harian')
    documentName.value = `Laporan Harian - ${localeDateString(startDate.value)}.pdf`
  else if (laporanType.value === 'mingguan')
    documentName.value = `Laporan Mingguan - ${localeDateString(startDate.value)} sd ${localeDateString(endDate.value)}.pdf`
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

const localeDateString = (dateString) => {
  // Create a Date object from the input string
  const date = new Date(dateString);

  // Define options for formatting
  const options = { day: 'numeric', month: 'short', year: 'numeric' };

  // Format the date using toLocaleDateString
  return date.toLocaleDateString('id-ID', options);
}

const formatDate = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');  // Months are zero-based, so add 1
  const dd = String(date.getDate()).padStart(2, '0');  // Ensure day is always 2 digits

  return `${yyyy}-${mm}-${dd}`;
}

// FIXME: endDate in harian laporanType must be same as startDate
watchEffect(async () => {
  if (!startDate.value || !endDate.value) return;

  if (!props.backendUrl) return

  isLoading.value = true
  data.value = null

  try {
    const resp = await fetch(`${props.backendUrl}/api/v1/inspeksi?start_date=${startDate.value}&end_date=${endDate.value}`)

    data.value = await resp.json()

    if (data.value.length > 0)
      updateDocumentName()

    isLoading.value = false
  } catch (err) {
    console.log(err)
  }

})

watchEffect(() => {
  const today = new Date()
  endDate.value = formatDate(today)

  if (laporanType.value === 'harian') {
    startDate.value = formatDate(today)
  } else if (laporanType.value === 'mingguan') {
    today.setDate(today.getDate() - 7)
    startDate.value = formatDate(today)
  }
})
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

    <DailyTable v-if="laporanType === 'harian'" :data="data" />
    <WeeklyTable v-else-if="laporanType === 'mingguan'" :data="data" />

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
