import { jsPDF, AcroFormTextField, AcroFormButton } from 'jspdf'
import 'jspdf-autotable'

function getSatuan(type) {
  switch (type.toLowerCase()) {
    case 'pavement':
      return 'unit/slab'
    case 'sealant':
      return 'm'
    case 'rambu':
      return 'unit'
    case 'shotcrete':
      return 'm3'
    case 'pagar':
      return 'ruas'
    case 'marka':
      return 'm2'
    case 'guardrail':
      return 'm2'
    default:
      return 'm2'
  }
}

class ReportGenerator {
  constructor(startDate, endDate, format = 'a3') {
    this.doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: format,
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

  _renderCheckBoxText(text, config = { title: '', x: 0, y: 0 }) {
    const { title, x, y } = config

    this.doc.text(text, x + 5, y, {
      baseline: 'middle'
    })
    this._renderCheckBox({ title: title, x: x, y: y })
  }

  _renderCheckBox(config = { title: '' }) {
    const checkBox = new AcroFormButton();
    const { title, x, y } = config

    checkBox.fieldName = title

    checkBox.width = 5
    checkBox.height = 5

    checkBox.x = x - 2.5
    checkBox.y = y - 2.5

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

    if (position) {
      this.doc.text(position, x, y + 35, {
        align: 'center'
      })
    } else {
      const textWidth = 40

      this._renderTextField({
        cell: {
          x: x - textWidth / 2,
          y: y + 32,
          height: 5,
          width: textWidth
        }
      }, {
        padding: { x: 0, y: 0 },
        title: 'Position'
      })
    }

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
        { cellWidth: 8 },
        { cellWidth: 20 },
        { cellWidth: 20 },
        { cellWidth: 14 },
        { cellWidth: 14 },
        { cellWidth: 14 },
        { cellWidth: 14 },
        { cellWidth: 14 },
        { cellWidth: 10 },
        { cellWidth: 12 },
        { cellWidth: 12 },
        { cellWidth: 12 },
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

  }

  generate() {
    // Generate table inspektor
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
      margin: { top: 35 },
      styles: {
        font: 'times',
        fontSize: 8,
        textColor: 0,
        lineWidth: 0,
        cellPadding: 1
      },
      didDrawPage: () => {
        this.#header()
      }
    })

    // Generate laporan table
    this.doc.autoTable({
      html: '#laporan',
      styles: {
        font: 'times',
        fontSize: 6
      },
      headStyles: { minCellHeight: 10 },
      bodyStyles: { minCellHeight: 24 },
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
        else if (Object.keys(checkboxItem).includes(data.column.index.toString())) {
          const { x, y, height, width } = data.cell

          this._renderCheckBox({ title: `${checkboxItem[data.column.index]}_${data.row.index}`, x: x + width / 2, y: y + height / 2 })
        } else if (data.column.index === 6) {
          const { x, y, height } = data.cell


          const checkBoxText = [
            'Rutin',
            'RR',
            'Project Based',
          ]

          const space = height / checkBoxText.length
          checkBoxText.forEach((text, idx) => {
            const targetX = x + 5
            const targetY = y + (idx * space) + space / 2

            this._renderCheckBoxText(text, {
              title: `${text}_${data.row.index}`, x: targetX, y: targetY
            })
          })
        }

        if (data.column.index === 11) {
          const textField = new AcroFormTextField()

          const { x, y, height, width } = data.cell

          textField.x = x + width
          textField.y = y

          textField.height = height
          textField.width = 14

          textField.fieldName = `Catatan_Tambahan_${data.row.index}`

          this.doc.addField(textField)
        }

      }
    })

    this._signField("Disetujui oleh,", null, null, 50)
    this._signField("Diperiksa oleh,", null, "Kasie Pemeliharaan", 100)
    this._signField("Dibuat oleh,", null, "Staff Inspeksi", 230)

    return this.doc
  }
}

export class MonthlyReportGenerator extends ReportGenerator {
  constructor(startDate, endDate) {
    super(startDate, endDate, 'a4')
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
            content: 'LAPORAN INSPEKSI BULANAN',
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
  }

  generate() {
    const tables = document.getElementsByTagName('table')

    const arr = Object.values(tables);
    arr.forEach((tb, idx) => {
      const { id } = tb
      if (!id)
        return

      if (id.includes('severity')) {
        this.#severity(id, id.slice(17))
        if (idx !== arr.length - 1) this.doc.addPage()
      } else {
        this.#chart(id)
        this.#summary(id, `Aset ${id.slice(8)}`)
      }
    })

    return this.doc
  }

  #chart(id) {
    const canvasPrefix = ['pie-summary-', 'pie-volume-', 'bar-risk-']

    this.doc.autoTable({
      margin: { top: 35 },
      head: [['', '', '']],
      body: [['', '', '']],
      bodyStyles: { minCellHeight: 50 },
      theme: 'grid',
      styles: {
        textColor: 0,
        lineColor: 0,
        lineWidth: 0,
      },
      showHead: 'never',
      didDrawCell: (data) => {
        if (data.section !== 'body')
          return

        const targetId = `${canvasPrefix[data.column.index]}${id.slice(8)}`

        this.#plotChart(targetId, data.cell.width, data.cell.height, {
          x: data.cell.x,
          y: data.cell.y
        })

      },
      didDrawPage: () => {
        this.#header()
      }
    })

  }

  #calculateProportionalSize(canvasWidth, canvasHeight, maxWidth, maxHeight) {
    const aspectRatio = canvasWidth / canvasHeight;
    let width = maxWidth;
    let height = maxHeight;

    if (maxWidth / maxHeight > aspectRatio) {
      width = maxHeight * aspectRatio;
      height = maxHeight;
    } else {
      width = maxWidth;
      height = maxWidth / aspectRatio;
    }

    return { width, height };
  }

  #plotChart(id, maxWidth, maxHeight, pos = { x: 0, y: 0 }) {
    const { x, y } = pos

    const canvas = document.getElementById(id);

    const dataURL = canvas.toDataURL('image/png');

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const { width, height } = this.#calculateProportionalSize(canvasWidth, canvasHeight, maxWidth, maxHeight)

    let px = 0, py = 0

    if (width != maxWidth)
      px = (maxWidth - width) / 2
    if (height != maxHeight)
      py = (maxHeight - height) / 2

    this.doc.addImage(dataURL, 'PNG', x + px, y + py, width, height);
  }

  #summary(id, title) {
    let loc_x, loc_y

    this.doc.autoTable({
      html: `#${id}`,
      styles: {
        font: 'times',
        fontSize: 6
      },
      useCss: true,
      columnStyles: [
        { cellWidth: 8 },
        { cellWidth: 39 },
        { cellWidth: 15 },
        { cellWidth: 19 },
        { cellWidth: 21 },
        { cellWidth: 19 },
        { cellWidth: 21 },
        { cellWidth: 19 },
        { cellWidth: 21 },
      ],
      didDrawCell: (data) => {
        if (data.section === 'head' && data.column.index === 0 && data.row.index === 0) {
          loc_x = data.cell.x
          loc_y = data.cell.y
        }
      }
    })

    if (!loc_x || !loc_y) return

    this.doc.setFontSize(11);
    this.doc.setFont('times', 'bold');
    this.doc.text(title, loc_x, loc_y - 2)
  }
  #severity(id, aset) {
    let loc_x, loc_y
    this.doc.autoTable({
      html: `#${id}`,
      styles: {
        font: 'times',
        fontSize: 6,
      },
      useCss: true,
      didDrawCell: (data) => {
        if (data.section === 'head' && data.column.index === 0 && data.row.index === 0) {
          loc_x = data.cell.x
          loc_y = data.cell.y
        }

        if (data.section !== 'body')
          return

        if (data.column.index === 6) {
          this._renderTextField(data, {
            padding: {
              x: 0,
              y: 0
            },
            title: `instruksi_bujt_${data.row.index}`
          })
        }
      },
    })

    this._signField("Disetujui oleh,", null, "Site Manager", 40)

    this._signField("Diperiksa oleh,", null, "Kasie Layanan Pemeliharaan", 125)

    this._signField("Dibuat oleh,", null, "Staff Inspeksi", 175)

    if (!loc_x || !loc_y) return

    this.doc.setFontSize(7);
    this.doc.setFont('times', 'normal');
    this.doc.text(`Catatan: Satuan dalam ${getSatuan(aset)}`, loc_x, loc_y - 5)

    this.doc.setFontSize(10);
    this.doc.setFont('times', 'bold');
    this.doc.text("Level severity setiap defect", loc_x, loc_y - 1)

  }
}


