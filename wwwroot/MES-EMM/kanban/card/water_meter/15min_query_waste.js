let meterdataSID = '355661539676480' // 定義 SID

// 定義全域變數
let gridData = []

// 抓取資料
async function fetchData() {
  try {
    let meterdata = await getGridData(meterdataSID)
    console.log(meterdata)
    gridData = meterdata.Grid_Data // 取得Grid_Data內的資料
    queryData = meterdata.Query_Cond // 取得Query_Cond內的資料
    schemaData = meterdata.Grid_Schema
    schemaReportData = meterdata.Report_Schema
    setTable(gridData) // 設定表格
    setModal(queryData)// 設定 modal
    const titleName = GetLangDataV2(schemaReportData[0].QR_NAME)
    $('#queryTitle').text(titleName) 
  } catch (error) {
    console.error(error)
  }
}
fetchData()

// 表格
function setTable(data) {
  const schemaName = schemaData.filter(field => field.SHOW === "Yes")

  const fieldNames = schemaName.map(field => field.CAPTION)
  const theadHTML = `
    <tr>
        ${fieldNames.map(name => `<th>${name}</th>`).join('')}
    </tr>
  `
  $('#fuelTable thead').html(theadHTML)

  // 動態生成列
  const columnDefs = fieldNames.map((fieldName, index) => ({
    targets: index,
    title: GetLangDataV2(fieldName),
    data: null,
    render: function (data, type, row) {
      // 使用空字符串作為預設值
      return row[fieldName] !== undefined ? row[fieldName].toString() : ''
    }
  }))

  $('#fuelTable').DataTable({
    searching: false,
    info: false,
    paging: true,
    pageLength: 50,
    lengthMenu: [50, 100, 200, 500],
    data: data,
    columns: fieldNames.map(() => ({ data: null })),
    columnDefs: columnDefs,
    destroy: true,
    order: [[0, 'DESC']],
    deferRender: true 
  })
}

// 互動視窗
function setModal(queryData) {
  $('#queryModal').on('show.bs.modal', function () {
    var modalContent = $('#modalContent')
    modalContent.empty()

    queryData.forEach((query, index) => {
      var fieldContainer = $('<div>').addClass('mb-3')
      var rowContainer = $('<div>').addClass('row g-3 align-items-center align-items-center')
      var fieldElement = $('<label>').text(GetLangDataV2(query.CAPTION)).addClass('col-sm-3 col-form-label')
      var inputContainer = $('<div>').addClass('col-sm-9')
      var inputElement

      if (query.SELECT_ITEM && query.SELECT_ITEM.length > 0) {
        inputElement = $('<select>').addClass('form-control').attr('data-field', query.FIELD).attr('data-type', query.DATATYPE).attr('data-oper', query.OPER)
        inputElement.append($('<option>').val('').text(GetLangDataV2('---- Select ----')))
        query.SELECT_ITEM.forEach(item => {
          const value = item[Object.keys(item)[0]]
          inputElement.append($('<option>').val(value).text(value))
        })
      } else {
        inputElement = $('<input>').addClass('form-control')
          .attr('type', 'text')
          .attr('data-field', query.FIELD)
          .attr('data-type', query.DATATYPE)
          .attr('data-oper', query.OPER)
        if (query.DATATYPE === 'DateTime') {
          inputElement.addClass('datetimepicker').attr('placeholder', GetLangDataV2('Select Days Here'))
        }
      }

      inputContainer.append(inputElement)
      rowContainer.append(fieldElement, inputContainer)
      fieldContainer.append(rowContainer)

      // 最後一個不加 hr
      if (index < queryData.length - 1) {
        var hrElement = $('<hr>').addClass('my-3')
        fieldContainer.append(hrElement)
      }

      modalContent.append(fieldContainer)

      if (query.DATATYPE === 'DateTime') {
        inputElement.flatpickr({
          mode: 'range',
          dateFormat: 'Y-m-d',
          onClose: function(selectedDates, dateStr, instance) {
            if (selectedDates.length === 2) {
              const startDate = selectedDates[0]
              const endDate = selectedDates[1]
              const formatDate = (date) => {
                const year = date.getFullYear()
                const month = String(date.getMonth() + 1).padStart(2, '0')
                const day = String(date.getDate()).padStart(2, '0')
                const hours = String(date.getHours()).padStart(2, '0')
                const minutes = String(date.getMinutes()).padStart(2, '0')
                return `${year}-${month}-${day}`
              }
              instance.element.value = 
              `${formatDate(startDate)} ~ ${formatDate(endDate)}`
            }
          }
        })
      }
    })
  })
}

$('#searchBtn').on('click', function () {
  let queryConditions = []

  $('#modalContent').find('.form-control, select').each(function () {
    let field = $(this).attr('data-field')
    let oper = $(this).attr('data-oper')
    let value = $(this).val()

    if (value) {
      queryConditions.push({ field, oper, value })
    }
  })

  const filteredData = gridData.filter(row => {
    return queryConditions.every(cond => {
      const fieldValue = row[cond.field]
      const fieldDateTime = new Date(fieldValue)
      switch (cond.oper) {
        case 'like':
          return String(fieldValue).includes(cond.value)
        case 'between':
          const [start, end] = cond.value.split(' ~ ') // 將 ' ~ ' 作為分隔符號
          const startDate = new Date(start)
          startDate.setHours(0, 0, 0, 0) // 起始時間從凌晨開始
          const endDate = new Date(end)
          endDate.setHours(23, 59, 59, 999) // 結束時間從11:59:99結束
          return fieldDateTime >= startDate && fieldDateTime <= endDate
        case 'in':
          return cond.value.split(',').map(v => v.trim()).includes(String(fieldValue))
        case '=':
          return String(fieldValue) === cond.value
        case '!=':
          return String(fieldValue) !== cond.value
        case '<':
          return Number(fieldValue) < Number(cond.value)
        case '>':
          return Number(fieldValue) > Number(cond.value)
        case '<=':
          return Number(fieldValue) <= Number(cond.value)
        case '>=':
          return Number(fieldValue) >= Number(cond.value)
        default:
          return true
      }
    })
  })

  $('#fuelTable').DataTable().clear().rows.add(filteredData).draw()
  $('#queryModal').modal('hide') // 關閉 modal
})

// 初始化 flatpickr
function initFlatpickr() {
  $('.datepicker').flatpickr({
    // flatpickr 的設置選項
    enableTime: false,
    mode: 'range',
    dateFormat: 'Y-m-d',
  })
}

// 抓 Grid_Schema 內的欄位名稱
function gridSchema(schemaData) {
  let colNames = schemaData.map(field => field.FIELDNAME).join(',')
  let captions = schemaData.map(field => field.CAPTION).join(',')

  return {colNames, captions}
}

// 抓 Report_Schema 內的欄位名稱
function reportSchema(schemaReportData){
  let reportName = schemaReportData[0].QR_NAME
  let masterSQL = schemaReportData[0].MASTER_SQL
  let sid = schemaReportData[0].QR_SID
  return { reportName, masterSQL, sid }
}

// 輸出 Excel 
async function exportExcel () {
  // 確認 Data 是否有被抓取
  await fetchData()

  let { colNames, captions } = gridSchema(schemaData)

  let reportInfo = reportSchema(schemaReportData)

  // 把 SQL 裡面的 'WHERE {CON}' 替換掉
  let sqlQuery = reportInfo.masterSQL.replace('WHERE {CON}', '').trim()

  // 多語系 (暫時先用不到)
  // let checkCol = schemaData.map(field => GetKeyWord(field.FIELDNAME)).join(',')
  $.ajax({
    type: 'post',
    url: window.location.protocol + '//' + default_ip + '/' + default_WebSiteName + '/MasterMaintain/Model/ExtendHandler.ashx',
    data: { 
      funcName: "Exportxlsx", 
      FileName: reportInfo.reportName,
      SQL: sqlQuery,
      ColName: captions,
      CheckCol: captions,
      mode: "GridDataSmartQuery", 
      SID: reportInfo.sid
    },
      //ExportExcel ; , customNumericFieldsIndex : cnfindex 前端客製用參數
    async: false,
    success: function (result) {
        console.log(result)
          window.location.href = window.location.protocol + '//' + default_ip + '/' + default_WebSiteName + '/tmp/' + result;
    },
    error: function (jqXHR, exception) {
        JasonError("GetLangType", jqXHR, exception);
    }
  })
}

// 點擊按鈕匯出 Excel
$('#exportBtn').click(function (){
  exportExcel()
})