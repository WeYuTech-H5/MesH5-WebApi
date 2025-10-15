let meterdataSID = '355055332510986' // 定義 SID

// 定義全域變數
let gridData = []

// 抓取資料
async function fetchData() {
  try {
    let meterdata = await getGridData(meterdataSID)
    console.log(meterdata)
    gridData = meterdata.Grid_Data // 取得Grid_Data內的資料
    queryData = meterdata.Query_Cond // 取得Query_Cond內的資料
    setTable(gridData) // 設定表格
    setModal(queryData)// 設定 modal
  } catch (error) {
    console.error(error)
  }
}

fetchData()

// 設定表格
function setTable(data) {
  const fieldNames = Object.keys(data[0] || {})
  const columnsConfig = fieldNames.map(fieldName => {
    return {
      title: fieldName,
      data: fieldName
    }
  })

  $('#fuelTable').DataTable({
    searching: false,
    info: false,
    paging: true,
    data: data,
    columns: columnsConfig,
    destroy: true,
    order: [[0, 'DESC']]
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
      var fieldElement = $('<label>').text(query.CAPTION).addClass('col-sm-3 col-form-label')
      var inputContainer = $('<div>').addClass('col-sm-9')
      var inputElement

      if (query.SELECT_ITEM && query.SELECT_ITEM.length > 0) {
        inputElement = $('<select>').addClass('form-control').attr('data-field', query.FIELD).attr('data-type', query.DATATYPE).attr('data-oper', query.OPER)
        inputElement.append($('<option>').val('').text('---- Select ----'))
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
          inputElement.addClass('datetimepicker').attr('placeholder', 'Select Days Here')
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
              instance.element.value = 
              `${startDate.toISOString().split('T')[0]} ~ ${endDate.toISOString().split('T')[0]}`
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
          const endDate = new Date(end)
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
