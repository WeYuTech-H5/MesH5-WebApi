let meterdataSID = '355053181670836'; // 定義 SID

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
    setModal(queryData);// 設定 modal
    $('#queryTitle').text(schemaReportData[0].QR_NAME)
  } catch (error) {
    console.error(error)
  }
}

fetchData();


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
  });
}

// 互動視窗
function setModal(queryData) {
    $('#queryModal').on('show.bs.modal', function () {
      var modalContent = $('#modalContent')
      modalContent.empty()

      queryData.forEach((query) => {
        var fieldContainer = $('<div>').addClass('d-flex text-center align-items-center mb-3')
        var fieldElement = $('<p>').text(query.CAPTION).addClass('me-4')
        var hrElement = $('<hr>').addClass('w-100')
        var inputElement

        if (query.SELECT_ITEM && query.SELECT_ITEM.length > 0) {
          inputElement = $('<select>').addClass('form-control').attr('data-field', query.FIELD).attr('data-type', query.DATATYPE).attr('data-oper', query.OPER);
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
  
        // 最後一個不加上 hr
        if (query === queryData[queryData.length - 1]) {
          hrElement = ''
        }
  
        fieldContainer.append(fieldElement, inputElement)
        modalContent.append(fieldContainer, hrElement)

        if (query.DATATYPE === 'DateTime') {
          inputElement.flatpickr({
            enableTime: false,
            dateFormat: 'Y-m-d',
            mode: 'single',
            allowInput: true,
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
    });
  
  const filteredData = gridData.filter(row => {
    return queryConditions.every(cond => {
      const fieldValue = row[cond.field]
      const fieldDateTime = new Date(fieldValue)
      switch (cond.oper) {
        case 'like':
          return String(fieldValue).includes(cond.value)
        case 'between':
          const filterDate = new Date(cond.value)
          return fieldDateTime.toDateString() === filterDate.toDateString()
        case 'in':
          return cond.value.split(',').map(v => v.trim()).includes(String(fieldValue))
        case '=':
          return String(fieldValue) === cond.value;
        case '!=':
          return String(fieldValue) !== cond.value;
        case '<':
          return Number(fieldValue) < Number(cond.value);
        case '>':
          return Number(fieldValue) > Number(cond.value);
        case '<=':
          return Number(fieldValue) <= Number(cond.value);
        case '>=':
          return Number(fieldValue) >= Number(cond.value);
        default:
          return true;
      }
    })
  }
)

    $('#fuelTable').DataTable().clear().rows.add(filteredData).draw()
    $('#queryModal').modal('hide'); // 關閉 modal
  })
  

// 初始化 flatpickr
function initFlatpickr() {
  $('.datepicker').flatpickr({
    // flatpickr 的設置選項
    enableTime: false,
    mode: 'singel',
    dateFormat: 'Y-m-d',
  })
}