import { jsPDF, AcroFormTextField, AcroFormButton } from 'jspdf'
import 'jspdf-autotable'

const drawHeader = (data) => {
  const { settings } = data

  if (settings === undefined) return

  this.doc.setFontSize(15);
  this.doc.setFont('times', 'bold');
  this.doc.text("Laporan Inspeksi Harian", settings.margin.left, 20);

  this.doc.setFontSize(10);
  this.doc.text("AIS Site", settings.margin.left, 35)
  this.doc.text("Lingkup Pekerjaan", settings.margin.left, 40)
  this.doc.text("Tanggal", settings.margin.left, 45)

  this.doc.setFont('times', 'normal')
  this.doc.text('Jombang - Mojokerto', 100, 35, {
    align: 'right',
  });
  this.doc.text('19-Jun-24', 100, 45, {
    align: 'right',
  });

  this.doc.addImage(
    "/astra-infra-logo.png",
    "PNG",
    220,
    30,
    60,
    15
  )
}

class ReportGenerator {
  constructor(startDate, endDate) {
    this.doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a3",
    })

    this.startDate = startDate
    this.endDate = endDate
  }


  _renderTextField(data, config = { padding: { x: 0, y: 0 }, title: '' }) {
    const textField = new AcroFormTextField()

    const { padding, title } = config
    const { x, y, height, width } = data.cell

    textField.x = x + padding.x
    textField.y = y + padding.y

    textField.height = height - padding.y
    textField.width = width - padding.x

    textField.fieldName = title

    this.doc.addField(textField)
  }

  _renderImage(data) {
    if (data.cell.raw === null) return
    const img = data.cell.raw.children[0]
    const dim = data.cell.height - data.cell.padding('vertical');

    const textPos = data.cell;
    this.doc.addImage(img.src, 'JPEG', textPos.x, textPos.y, dim, dim)
  }


  _renderCheckBox(data, config = { title: '' }) {
    const checkBox = new AcroFormButton();

    checkBox.fieldName = config.title

    const { x, y, height, width } = data.cell

    checkBox.width = 5
    checkBox.height = 5

    checkBox.x = x + width / 2 - 2.5
    checkBox.y = y + height / 2 - 2.5

    this.doc.addField(checkBox)
  }

  _signField(preText, name, position, location) {
    const x = location
    const y = this.doc.lastAutoTable.finalY

    if (y === undefined)
      return

    this.doc.setFontSize(10);
    this.doc.setFont('times', 'normal');

    this.doc.text(preText, x, y + 10, {
      align: 'center'
    })

    this.doc.text(position, x, y + 35, {
      align: 'center'
    })

    this.doc.setFont('times', 'bold');

    if (name) {
      this.doc.text(name, x, y + 30, {
        align: 'center'
      })

      const textWidth = this.doc.getTextWidth(name);
      this.doc.line(x - textWidth / 2, y + 31, x + textWidth / 2, y + 31)
    } else {
      const textWidth = 40

      this._renderTextField({
        cell: {
          x: x - textWidth / 2,
          y: y + 25,
          height: 5,
          width: textWidth
        }
      }, {
        padding: { x: 0, y: 0 },
        title: 'Signer'
      })

      this.doc.line(x - textWidth / 2, y + 31, x + textWidth / 2, y + 31)
    }
  }
}


export class DailyReportGenerator extends ReportGenerator {
  constructor(startDate, endDate) {
    super(startDate, endDate)
  }

  #header() {
    const docInfo = {
      'Hari/Tanggal': this.startDate,
      'Cuaca': 'Cerah/Hujan',
      'Inspektor': '',
      'Jangkauan': '',
      'Site/Lokasi': 'Jombang - Mojokerto'
    }

    const docInfoKey = Object.keys(docInfo).map(it => ({
      content: it,
      rowSpan: 1,
      styles: { font: 'times', fontSize: 10 }
    }))

    this.doc.autoTable({
      head: [[
        { colSpan: 1 },
        { colSpan: 1 },
        {
          colSpan: 1,
          styles: { cellWidth: 70 }
        },
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
          docInfoKey[0]
        ],
        [
          docInfoKey[1]
        ],
        [
          {
            content: 'LAPORAN INSPEKSI HARIAN',
            rowSpan: 3,
            styles: { halign: 'center', valign: 'middle', font: 'times', fontStyle: 'bold', fontSize: 10 },
          },
          docInfoKey[2]
        ],
        [
          docInfoKey[3]
        ],
        [
          docInfoKey[4]
        ]
      ],
      showHead: 'never',
      theme: 'grid',
      styles: {
        textColor: 0,
        lineColor: 0
      },
      didDrawCell: (data) => {
        if (data.section !== 'body')
          return

        if (data.column.index === 0) {
          const textPos = data.cell;
          this.doc.addImage(
            "/astra-infra-logo.png",
            "PNG",
            textPos.x + (textPos.width / 2) - (60 / 2),
            textPos.y + (textPos.height / 2) - (15 / 2),
            60,
            15
          )
        } else if (data.column.index === 2) {
          const { content } = data.cell.raw
          const { x, y } = data.cell.getTextPos()

          this.doc.text(`: ${docInfo[content]}`, x + 20, y, {
            baseline: 'hanging'
          });

          if (docInfo[content] === '') {
            this._renderTextField(data, {
              padding: {
                x: 25, y: 0
              },
              title: content
            })
          }
        }
      },

    })
  }

  generate() {
    this.doc.autoTable({
      html: '#laporan',
      styles: {
        font: 'times',
        fontSize: 6
      },
      headStyles: { minCellHeight: 10 },
      bodyStyles: { minCellHeight: 50 },
      margin: { top: 55, bottom: 44 },
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
      didDrawCell: (data) => {
        if (data.section !== 'body')
          return

        if (data.column.index === 13)
          this._renderTextField(data, {
            padding: {
              x: 0,
              y: 0
            },
            title: `Fungsi_${data.row.index}`
          })
        else if (data.column.index === 15)
          this._renderImage(data)
      },
      didDrawPage: () => {
        this.#header()
      }
    })

    this._signField("Diperiksa oleh,", null, "Staff Inspeksi", 230)

    return this.doc
  }
}

export class WeeklyReportGenerator extends ReportGenerator {
  constructor(startDate, endDate) {
    super(startDate, endDate)
  }

  #header() {
    this.doc.autoTable({
      head: [[
        { colSpan: 1 },
        { colSpan: 1 },
      ]],
      body: [
        [
          {
            content: '',
            rowSpan: 2,
            styles: { halign: 'center', cellWidth: 70 },
          },
          {
            content: 'PT ASTRA TOL NUSANTARA - ASTRA INFRA SOLUTIONS',
            rowSpan: 1,
            styles: { halign: 'center', valign: 'middle', font: 'times', fontStyle: 'bold', fontSize: 10 },
          }
        ],
        [
          {
            content: 'LAPORAN INSPEKSI MINGGUAN',
            rowSpan: 1,
            styles: { halign: 'center', valign: 'middle', font: 'times', fontStyle: 'bold', fontSize: 10 },
          }
        ],
      ],
      showHead: 'never',
      theme: 'grid',
      styles: {
        textColor: 0,
        lineColor: 0
      },
      didDrawCell: (data) => {
        if (data.section !== 'body')
          return

        if (data.column.index === 0) {
          const textPos = data.cell;
          this.doc.addImage(
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

    this.doc.autoTable({
      head: [[
        {
          colSpan: 1,
          styles: { cellWidth: 30 },
        },
        {
          colSpan: 1,
          styles: { cellWidth: 50 },
        },
      ]],
      body: [
        [
          {
            content: 'Periode Inspeksi',
            rowSpan: 1,
          },
          {
            content: `: ${this.startDate} s/d ${this.endDate} `,
            rowSpan: 1,
          }
        ],
        [
          {
            content: 'Inspektor',
            rowSpan: 3,
          },
          {
            content: ': 1. ',
            rowSpan: 1,
          }
        ],
        [
          {
            content: ': 2. ',
            rowSpan: 1,
          }
        ],
        [
          {
            content: ': 3. ',
            rowSpan: 1,
          }

        ]
      ],
      didDrawCell: (data) => {
        if (data.section !== 'body')
          return

        if (data.column.index === 1 && data.row.index >= 1) {
          this._renderTextField(data, {
            padding: {
              x: 6,
              y: 0
            },
            title: `inspektor_${data.row.index}`
          })
        }
      },

      showHead: 'never',
      theme: 'grid',
      styles: {
        font: 'times',
        fontSize: 8,
        textColor: 0,
        lineWidth: 0,
        cellPadding: 1
      },
    })
  }

  generate() {

    this.doc.autoTable({
      html: '#laporan',
      styles: {
        font: 'times',
        fontSize: 6
      },
      headStyles: { minCellHeight: 10 },
      bodyStyles: { minCellHeight: 42 },
      margin: { top: 60, bottom: 45 },
      columnStyles: [
        { cellWidth: 9 },
        { cellWidth: 25 },
        { cellWidth: 30 },
        { cellWidth: 15 },
        { cellWidth: 15 },
        { cellWidth: 15 },
        { cellWidth: 30 },
        { cellWidth: 40 },
        { cellWidth: 40 },
        { cellWidth: 10 },
        { cellWidth: 10 },
        { cellWidth: 30 },
      ],
      useCss: true,
      didDrawCell: (data) => {
        if (data.section !== 'body')
          return

        const textFieldItem = {
          7: 'Rekomendasi_PS',
          8: 'Rekomendasi_PP',
          11: 'Catatan'
        }

        const checkboxItem = {
          9: 'PS',
          10: 'PP'
        }

        if (Object.keys(textFieldItem).includes(data.column.index.toString()))
          this._renderTextField(data, {
            padding: {
              x: 0,
              y: 0
            },
            title: `${textFieldItem[data.column.index]}_${data.row.index}`
          })
        else if (Object.keys(checkboxItem).includes(data.column.index.toString()))
          this._renderCheckBox(data, { title: `${checkboxItem[data.column.index]}_${data.row.index}` })
      },
      didDrawPage: () => {
        this.#header()
      }
    })

    this._signField("Disetujui oleh,", "Haries Istyawan", "Kasie Layanan Pemeliharaan", 70)
    this._signField("Diperiksa oleh,", null, "Staff Inspeksi", 230)

    return this.doc
  }
}


