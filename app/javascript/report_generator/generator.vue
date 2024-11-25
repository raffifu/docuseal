<script setup>
import TableViewer from './table_viewer.vue';
import Loading from './loading.vue';
import EmptyData from './empty_data.vue';

import { onMounted, ref, watchEffect } from 'vue';
import { jsPDF, AcroFormTextField, AcroFormButton } from 'jspdf'
import 'jspdf-autotable'

const props = defineProps({
  authenticityToken: String,
  formId: String,
  backendUrl: String
})

const isLoading = ref(false)
const startDate = ref(null)
const endDate = ref(null)
const document_name = ref(null)
const data = ref(null)

const drawHeaderNew = (doc, data) => {
  const docInfo = {
    'Hari/Tanggal': '30 April 2024',
    'Cuaca': 'Cerah/Hujan',
    'Inspektor': '',
    'Jangkauan': '',
    'Site/Lokasi': 'Jombang - Mojokerto'
  }

  const docInfoTable = Object.keys(docInfo).map(key => {
    return {
      content: `${key} : ${docInfo[key]}`,
      rowSpan: 1,
      styles: { valign: 'middle', fontSize: 8 },
    }
  })

  doc.autoTable({
    head: [[
      { colSpan: 1 },
      { colSpan: 1 },
      { colSpan: 1 },
    ]],
    body: [
      [
        {
          content: '',
          rowSpan: 5,
          styles: { halign: 'center', cellWidth: 70 },
        },
        {
          content: 'PT ASTRA TOL NUSANTARA - ASTRA INFRA SOLUTIONS',
          rowSpan: 2,
          styles: { halign: 'center', valign: 'middle', font: 'times', fontStyle: 'bold', fontSize: 10 },
        },
        docInfoTable[0]
      ],
      [
        docInfoTable[1]
      ],
      [
        {
          content: 'LAPORAN INSPEKSI HARIAN',
          rowSpan: 3,
          styles: { halign: 'center', valign: 'middle', font: 'times', fontStyle: 'bold', fontSize: 10 },
        },
        docInfoTable[2]
      ],
      [
        docInfoTable[3]
      ],
      [
        docInfoTable[4]
      ]
    ],
    showHead: 'never',
    theme: 'grid',
    styles: {
      textColor: 0,
      lineColor: 0
    },
    didDrawCell: function (data) {
      if (data.section !== 'body')
        return

      if (data.column.index === 0) {
        console.log(data)
        const textPos = data.cell;
        doc.addImage(
          "/astra-infra-logo.png",
          "PNG",
          textPos.x + (textPos.width / 2) - (60 / 2),
          textPos.y + (textPos.height / 2) - (15 / 2),
          60,
          15
        )
      }
    },

  })
}

const drawHeader = (doc, data) => {
  const { settings } = data

  if (settings === undefined) return

  doc.setFontSize(15);
  doc.setFont('times', 'bold');
  doc.text("Laporan Inspeksi Harian", settings.margin.left, 20);

  doc.setFontSize(10);
  doc.text("AIS Site", settings.margin.left, 35)
  doc.text("Lingkup Pekerjaan", settings.margin.left, 40)
  doc.text("Tanggal", settings.margin.left, 45)

  doc.setFont('times', 'normal')
  doc.text('Jombang - Mojokerto', 100, 35, {
    align: 'right',
  });
  doc.text('19-Jun-24', 100, 45, {
    align: 'right',
  });

  doc.addImage(
    "/astra-infra-logo.png",
    "PNG",
    220,
    30,
    60,
    15
  )
}

const signField = (doc, name) => {
  const x = 230
  const y = doc.lastAutoTable.finalY

  if (y === undefined)
    return

  doc.setFontSize(10);
  doc.setFont('times', 'normal');

  doc.text("PT. Astra Tol Nusantara - Astra Infra Solutions", x, y + 10, {
    align: 'center'
  })

  doc.text("Staff Inspeksi", x, y + 35, {
    align: 'center'
  })

  doc.setFont('times', 'bold');

  doc.text(name, x, y + 30, {
    align: 'center'
  })

  const textWidth = doc.getTextWidth(name);
  doc.line(x - textWidth / 2, y + 31, x + textWidth / 2, y + 31)
}
const renderImage = (doc, data) => {
  if (data.cell.raw === null) return
  const img = data.cell.raw.children[0]
  const dim = data.cell.height - data.cell.padding('vertical');

  const textPos = data.cell;
  doc.addImage(img.src, 'JPEG', textPos.x, textPos.y, dim, dim)
}

const renderTextField = (doc, data) => {
  const textField = new AcroFormTextField()

  const { x, y, height, width } = data.cell

  textField.x = x
  textField.y = y

  textField.height = height
  textField.width = width

  textField.fieldName = `Rekomendasi Penanganan ${data.column.index % 2 === 0 ? 'Sementara' : 'Permanen'} ${data.row.index + 1}`

  doc.addField(textField)
}

const renderCheckBox = (doc, data) => {
  const checkBox = new AcroFormButton();

  checkBox.fieldName = `Approval Penanganan ${data.column.index % 2 === 0 ? 'Sementara' : 'Permanen'} ${data.row.index + 1}`

  const { x, y, height, width } = data.cell

  checkBox.width = 5
  checkBox.height = 5

  checkBox.x = x + width / 2 - 2.5
  checkBox.y = y + height / 2 - 2.5

  doc.addField(checkBox)

}

const generatePDF = () => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a3",
  })

  doc.autoTable({
    html: '#laporan',
    styles: {
      font: 'times',
      fontSize: 6
    },
    headStyles: { minCellHeight: 10 },
    bodyStyles: { minCellHeight: 50 },
    margin: { top: 55, bottom: 49 },
    columnStyles: [
      { cellWidth: 9 },
      { cellWidth: 20 },
      { cellWidth: 20 },
      { cellWidth: 15 },
      { cellWidth: 15 },
      { cellWidth: 15 },
      { cellWidth: 15 },
      { cellWidth: 15 },
      { cellWidth: 10 },
      { cellWidth: 10 },
      { cellWidth: 10 },
      { cellWidth: 10 },
      { cellWidth: 15 },
      { cellWidth: 15 },
      { cellWidth: 25 },
      { cellWidth: 50 },
    ],
    useCss: true,
    didDrawCell: function (data) {
      if (data.section !== 'body')
        return

      if (data.column.index === 15)
        renderImage(doc, data)
    },
    didDrawPage: function (data) {
      drawHeaderNew(doc, data)
    }
  })

  signField(doc, "M. Defit Hermanto")

  return doc
}

const downloadPDF = (arg) => {
  const doc = generatePDF()

  const document_name = typeof arg === "string" ? arg : "Generate Document"

  doc.save(`${document_name}.pdf`)
}

const handleSubmit = async () => {
  if (!document_name.value) {
    console.error("Document name not specified")
    return
  }

  const formData = new FormData();
  formData.append('authenticity_token', props.authenticityToken);
  formData.append('form_id', props.formId);

  const doc = generatePDF()
  const blob = new Blob([doc.output('blob')], { type: "application/pdf" });
  formData.append("files[]", blob, `${document_name.value}.pdf`);

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

const formatDate = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');  // Months are zero-based, so add 1
  const dd = String(date.getDate()).padStart(2, '0');  // Ensure day is always 2 digits

  return `${yyyy}-${mm}-${dd}`;
}

watchEffect(async () => {
  if (!startDate.value || !endDate.value) return;

  if (!props.backendUrl) return

  isLoading.value = true
  data.value = null

  try {
    const resp = await fetch(`${props.backendUrl}/api/v1/inspeksi?start_date=${startDate.value}&end_date=${endDate.value}`)

    data.value = await resp.json()
    isLoading.value = false
  } catch (err) {
    console.log(err)
  }
})

onMounted(async () => {
  const today = new Date()
  endDate.value = formatDate(today)

  today.setDate(today.getDate() - 30)
  startDate.value = formatDate(today)
})


</script>


<template>

  <div class="flex mb-2">
    <label class="mx-1 form-control">
      <div class="label">
        <span class="label-text">Start Date</span>
      </div>
      <input id="startDate" type="date" class="input input-md input-bordered" v-model="startDate" />
    </label>
    <label class="mx-1 form-control">
      <div class="label">
        <span class="label-text">End Date</span>
      </div>
      <input id="endDate" type="date" class="input input-md input-bordered" v-model="endDate" />
    </label>
  </div>

  <Loading v-if="isLoading" />
  <EmptyData v-else-if="!data || data.length === 0" />
  <template v-else>

    <TableViewer :data="data" />
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
              v-model="document_name" />

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
