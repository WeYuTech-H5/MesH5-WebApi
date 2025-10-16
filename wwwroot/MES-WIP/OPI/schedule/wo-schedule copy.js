let cicoDataSID = '386441309640341' //V_WIP_OPI_WDOEACICO_HIST_SCHEDULE
let cicoData;
let reasonCodeListSID = '350218189246470'
let reasonCodeList;

//URL取參數
const urlParams = new URLSearchParams(window.location.search);
const DEPT_NO = urlParams.get('DEPT_NO');
const SHIFT_DAY = urlParams.get('SHIFT_DAY');
const WIP_OPI_WDOEACICO_HIST_SID = urlParams.get('WIP_OPI_WDOEACICO_HIST_SID');
$("#DEPARTMENT").text(DEPT_NO)
//返回紐
$('#backButton').click(function () {
    window.location.href = window.location.protocol + '//' + default_ip + '/' + PROJECT_NAME + "/" + kanbanRoute + '/MES-WIP/setup/wip-query_schedule.html?SID=386440715240108&MODULE_TYPE=MES-WIP&MODULE_NAME=WIP_OPI&LEVEL=L2&BUTTON=A&OPERATION=' + DEPT_NO + '&SHIFT_DAY=' + SHIFT_DAY
})

$(document).ready(async function () {
    await initChartConfig();
    cicoData = (await getGridData(cicoDataSID)).Grid_Data.filter((e) => e.WIP_OPI_WDOEACICO_HIST_SID == WIP_OPI_WDOEACICO_HIST_SID)[0]
    reasonCodeList = (await getGridData(reasonCodeListSID)).Grid_Data;  //ex. 原因碼為 D01 or C01
    $("#progress,#loading").fadeOut(600) //API請求結束後關閉Loading frame

    //顯示紀錄資訊
    $("#ACCOUNT_NO").text(cicoData.SCHEDULE_EDIT_USER)
    $("#EQP_NO").text(cicoData.EQP_NO)
    $("#MOLD_NO").text(cicoData.TOL_NO)
    $("#WO").text(cicoData.WO)
    $("#PART_NO").text(cicoData.PART_NO)
    $("#PART_NAME").text(cicoData.PART_SPEC)
    // $("#CUR_CAV").text(cicoData.SCHEDULE_CUR_CAV)
    // $("#CYCLE_TIME").text(cicoData.SCHEDULE_CYCLE_TIME)
    // $("#TARGET_SHOT").text(cicoData.TARGET_SHOT)
    // $("#TARGET_PCS").text(cicoData.TARGET_PCS)
    const checkIn = cicoData.CHECK_IN_TIME.replace('T', ' ').slice(0, 19);
    const checkOutTimeOnly = cicoData.CHECK_OUT_TIME.split('T')[1];
    $("#SCHEDULES_TIME").text(`${checkIn}~${checkOutTimeOnly}`);

    if (WIP_OPI_WDOEACICO_HIST_SID === '387139981913686') {
        $('#CompletedCheck').prop('checked', true);
        $('#COMPLETED_TIME').text('2025-08-07 17:00:00');
    } else {
        $('#CompletedCheck').prop('checked', false);
        $('#COMPLETED_TIME').text('Not Reported');
    }


    //NG輸入
    LoadNgCodeV3()
    SetNgHistQuery()
    $('#ng-saveNgBtn').click(function () {
        var WDOEACICONG_HIST_SID = $(this).attr('ng-sid');

        $('#NGModal').modal('hide');
        $('#message-loader').show()

        if (WDOEACICONG_HIST_SID) {
            EditNgData(WDOEACICONG_HIST_SID)
        } else {
            AddNgData()
        }
    })
});
//取得已進站的工單資訊
async function getGridDataWDOEACICO(WIP_OPI_WDOEACICO_HIST_SID) {
    // 定义 GetGrid API 的 URL
    let getGridURL = window.location.protocol + '//' + default_ip + '/' + default_Api_Name + '/api/GetGrid';

    // 定义要传递的参数对象
    let params = {
        SID: cicoDataSID, //WIP_OPI_WDOEACICO_HIST
        TokenKey: localStorage.getItem(PROJECT_SAVE_NAME + '_BI_TokenKey')
        // TokenKey: '302e24cbG8xfcHU/Z/vTzA1zYjVFHLfUNtqsWonT'
    };

    // 定义查詢条件参数对象
    let conditions = {
        // 每個SID 要塞的條件皆不同,塞錯會掛
        Field: ["WIP_OPI_WDOEACICO_HIST_SID"],
        Oper: ["="],
        Value: [WIP_OPI_WDOEACICO_HIST_SID]
    };

    // 构建请求头
    let headers = new Headers({
        'Content-Type': 'application/json',
        'SID': params.SID,
        'TokenKey': params.TokenKey
        // 可以添加其他必要的请求头信息
    });

    // 构建请求体
    let requestBody = JSON.stringify(conditions);

    // 构建请求配置
    let requestOptions = {
        method: 'POST', // 将请求方法设置为 "POST"
        headers: headers,
        body: requestBody // 将条件参数放入请求体
    };

    try {
        // 发送请求并等待响应
        let response = await fetch(getGridURL, requestOptions);

        if (response.ok) {
            // 解析响应为 JSON
            let data = await response.json();
            // console.log("获取Grid数据成功:", data);
            if (data.result) {
                return data.Grid_Data[0];
            }
            else {
                Set_Clean();

            }
        } else {
            throw new Error('获取Grid数据失败，状态码：' + response.status);

        }
    } catch (error) {
        console.error(error);
    }
}
//生成NG輸入表單
async function LoadNgCodeV3() {
    if (reasonCodeList == null || reasonCodeList.length == 0) {
        reasonCodeList = $.parseJSON('[{"REASON_CODE":"NONE","REASON_NAME":"NONE"}]');
    }

    $('#ng-divData').html("");

    var $divrow = document.createElement("div");
    $divrow.setAttribute("class", "row d-flex w-100 m-0");
    for (var i = 0; i < reasonCodeList.length; i++) {
        var $divReason = document.createElement("div");
        $divReason.setAttribute("class", "p-3 w-auto border d-flex flex-column align-items-center justify-content-center ml-2");

        var $labelName = document.createElement("h5");

        $labelName.setAttribute("style", "width:150px;overflow-wrap: break-word;text-align:center");
        $labelName.innerHTML = reasonCodeList[i].REASON_CODE + "<BR>" + reasonCodeList[i].REASON_NAME + "<BR>" + reasonCodeList[i].DESCRIPTION //中榮客製

        var $labelQty = document.createElement("input");
        $labelQty.setAttribute("type", "number");
        $labelQty.setAttribute("inputmode", "numeric");
        $labelQty.setAttribute("min", "0");
        $labelQty.setAttribute("step", "any");
        $labelQty.setAttribute("autocomplete", "off");
        $labelQty.setAttribute("id", "lb_" + reasonCodeList[i].REASON_CODE);
        $labelQty.setAttribute("class", "badge-light num-right text-center fs-5");
        $labelQty.setAttribute("style", "width:80px;");
        $labelQty.setAttribute("REASON_CODE", reasonCodeList[i].REASON_CODE);
        $labelQty.innerText = "00";

        var $divReason1 = document.createElement("div");
        $divReason1.setAttribute("class", "input-group badge badge-secondary d-flex align-items-center w-100 justify-content-center");
        $divReason1.append($labelName);

        $divReason.append($divReason1);


        var $btndiv = document.createElement("div");
        $btndiv.setAttribute("class", "btn-group");
        $btndiv.setAttribute("role", "group");
        $btndiv.setAttribute("aria-label", "Basic example");


        $btndiv.append($labelQty);

        var $button = document.createElement("a");//新增數量
        $button.setAttribute("id", reasonCodeList[i].REASON_CODE + "_plus");
        $button.setAttribute("href", "#");
        $button.setAttribute("role", "button");
        $button.setAttribute("aria-disabled", "true");
        $button.setAttribute("class", "btn btn-info btn-lg w-50");
        $button.setAttribute("style", "text-decoration:none");
        $button.setAttribute("REASON_CODE", reasonCodeList[i].REASON_CODE);
        $button.innerText = "+";
        // var REASON_CODE = reasonCodeList[i].REASON_CODE;


        $button.onclick = function (event) {
            event.preventDefault(); // 阻止<a href="#">往上跳
            ModifyReasonQty($(this), "+");
        }


        $btndiv.append($button);


        var $button2 = document.createElement("a");//減少數量
        $button2.setAttribute("id", reasonCodeList[i].REASON_CODE + "_min");
        $button2.setAttribute("href", "#");
        $button2.setAttribute("role", "button");
        $button2.setAttribute("aria-disabled", "true");
        $button2.setAttribute("class", "btn btn-warning btn-lg w-50");
        $button2.setAttribute("style", "text-decoration:none");
        $button2.setAttribute("REASON_CODE", reasonCodeList[i].REASON_CODE);
        $button2.innerText = "─";

        $button2.onclick = function (event) {
            event.preventDefault(); // 阻止<a href="#">往上跳
            $(this).prop('disabled', true);
            ModifyReasonQty($(this), "-");
            $(this).prop('disabled', false);
        }

        $btndiv.append($button2);
        $divReason.append($btndiv);

        $divrow.append($divReason);
        //   $divrow.append($btndiv);

        $('#ng-divData').append($divrow);
    }

    //修改NG數量
    function ModifyReasonQty(obj, type) {
        var NG_QTY = 0;
        var lbl_REASON_CODE_QTY = $("#lb_" + obj.attr("REASON_CODE"));
        if (lbl_REASON_CODE_QTY.val().length > 0) {
            NG_QTY = parseFloat(lbl_REASON_CODE_QTY.val());
        }
        if (type == "+") {
            NG_QTY++;
        }
        else if (type == "-" && NG_QTY > 0) {
            NG_QTY--;
        }
        lbl_REASON_CODE_QTY.val(NG_QTY);

        // 更新總和
        updateTotalNG();
    }

    // 監聽輸入框直接輸入
    $(document).off('input', '.badge-light.num-right'); // 避免重複綁定
    $(document).on('input', '.badge-light.num-right', function () {
        updateTotalNG();
    });

    // 計算並更新 totalInputNG
    function updateTotalNG() {
        let totalNG = 0;
        $('.badge-light.num-right').each(function () {
            const val = parseFloat($(this).val());
            if (!isNaN(val)) {
                totalNG += val;
            }
        });
        $('#totalInputNG').val(totalNG);
    }

}

//生成修改NG紀錄介面
function LoadNgEditPage(WDOEACICONG_HIST_SID, EDIT_TIME) {
    $('#NGHISTModal').modal('hide');

    // 帶入歷史資料
    ngHistDetails.forEach((detail) => {
        if (detail.WIP_OPI_WDOEACICOOUTPUT_HIST_SID === WDOEACICONG_HIST_SID) {
            detail.NG_CODE_INFOS.forEach((info) => {
                $("#lb_" + info.NG_CODE_NO).val(info.NG_CODE_QTY);
            })
            $("#totalInputNG").val(detail.NG_TOTAL)
            $("#totalInputOK").val(detail.OK_TOTAL)
            $("#ng-comment").val(detail.COMMENT)
            $("#ng-report-time").text(EDIT_TIME)
        }
    })



    $("#NGModalModalLabel").text("Edit record")
    $("#reportTimeWrapper").show()
    $('#NGModal').modal('show');

    // 將SID記錄在按鈕
    $('#ng-saveNgBtn').attr('ng-sid', WDOEACICONG_HIST_SID)
}

async function AddNgData() {
    // 定義 API 的 URL
    let getGridURL = window.location.protocol + '//' + default_ip + '/' + default_Api_Name + '/api/WIPOPI_SCHEDULE_WDOEAQ_CICOOUTPUT';

    let NGInfo = []

    for (var i = 0; i < reasonCodeList.length; i++) {
        var NGdetail = {}
        var REASON_CODE = reasonCodeList[i].REASON_CODE;
        var REASON_QTY = $("#lb_" + reasonCodeList[i].REASON_CODE).val() | 0;
        NGdetail['NG_CODE_NO'] = REASON_CODE
        NGdetail['NG_CODE_QTY'] = REASON_QTY
        // NGdetail['NG_CODE_COMMENT'] = "NG detail comment here..."
        NGInfo.push(NGdetail)
    }

    let conditions = {
        "WIP_OPI_WDOEACICO_HIST_SID": WIP_OPI_WDOEACICO_HIST_SID,
        "NG_TOTAL": $('#totalInputNG').val(),
        "OK_TOTAL": $('#totalInputOK').val(),
        "NG_CODE_INFOS": NGInfo,
        "COMMENT": $('#ng-comment').val(),
        "EDIT_USER": username
    }

    // 构建请求头
    let headers = new Headers({
        'Content-Type': 'application/json',
        // 'TokenKey': localStorage.getItem(PROJECT_SAVE_NAME + '_BI_TokenKey')
        // 可以添加其他必要的请求头信息
    });

    // 构建请求体
    let requestBody = JSON.stringify(conditions);

    // 构建请求配置
    let requestOptions = {
        method: "POST",
        headers: headers,
        body: requestBody
    };

    try {
        // 发送请求并等待响应
        let response = await fetch(getGridURL, requestOptions);

        if (response.ok) {
            // 解析响应为 JSON
            let data = await response.json();
            // console.log("获取Grid数据成功:", data);
            if (data.result) {
                // $('#NG_QTY').text();
                $('#ng-hist-list').empty()
                SetNgHistQuery()
                $('#message-loader').hide()
                $('#success-message').attr("class", "message-show")
                // 2秒後淡出提示訊息
                setTimeout(() => {
                    $('#success-message').attr("class", "message-hide")
                }, 2000);
            }
            else {
                $('#message-loader').hide()
                $('#error-message').attr("class", "message-show")
                // 2秒後淡出提示訊息
                setTimeout(() => {
                    $('#error-message').attr("class", "message-hide")
                }, 2000);
            }
        } else {
            throw new Error('获取Grid数据失败，状态码：' + response.status);

        }
    } catch (error) {
        $('#message-loader').hide()
        $('#error-message').attr("class", "message-show")
        // 2秒後淡出提示訊息
        setTimeout(() => {
            $('#error-message').attr("class", "message-hide")
        }, 2000);
    }
}

async function EditNgData(WDOEACICONG_HIST_SID) {
    // 定義 API 的 URL
    let getGridURL = window.location.protocol + '//' + default_ip + '/' + default_Api_Name + '/api/H5_WIP_Update';

    let NGInfo = []

    for (var i = 0; i < reasonCodeList.length; i++) {
        var NGdetail = {}
        var REASON_CODE = reasonCodeList[i].REASON_CODE;
        var REASON_QTY = $("#lb_" + reasonCodeList[i].REASON_CODE).val() | 0;
        NGdetail['NG_CODE_NO'] = REASON_CODE
        NGdetail['NG_CODE_QTY'] = REASON_QTY
        // NGdetail['NG_CODE_COMMENT'] = "NG detail comment here..."
        NGInfo.push(NGdetail)
    }

    let conditions = {
        "WIP_OPI_WDOEACICOOUTPUT_HIST_SID": WDOEACICONG_HIST_SID,
        "NG_TOTAL": $('#totalInputNG').val(),
        "OK_TOTAL": $('#totalInputOK').val(),
        "NG_CODE_INFOS": NGInfo,
        "COMMENT": $('#ng-comment').val(),
        "EDIT_USER": username
    }

    // 构建请求头
    let headers = new Headers({
        'Content-Type': 'application/json',
        'TokenKey': localStorage.getItem(PROJECT_SAVE_NAME + '_BI_TokenKey')
        // 可以添加其他必要的请求头信息
    });

    // 构建请求体
    let requestBody = JSON.stringify(conditions);

    // 构建请求配置
    let requestOptions = {
        method: "POST",
        headers: headers,
        body: requestBody
    };

    try {
        // 发送请求并等待响应
        let response = await fetch(getGridURL, requestOptions);

        if (response.ok) {
            // 解析响应为 JSON
            let data = await response.json();
            // console.log("获取Grid数据成功:", data);
            if (data.result) {
                $('#ng-hist-list').empty()
                SetNgHistQuery()
                $('#message-loader').hide()
                $('#success-message').attr("class", "message-show")
                // 2秒後淡出提示訊息
                setTimeout(() => {
                    $('#success-message').attr("class", "message-hide")
                }, 2000);
            }
            else {
                $('#message-loader').hide()
                $('#error-message').attr("class", "message-show")
                // 2秒後淡出提示訊息
                setTimeout(() => {
                    $('#error-message').attr("class", "message-hide")
                }, 2000);
            }
        } else {
            throw new Error('获取Grid数据失败，状态码：' + response.status);

        }
    } catch (error) {
        $('#message-loader').hide()
        $('#error-message').attr("class", "message-show")
        // 2秒後淡出提示訊息
        setTimeout(() => {
            $('#error-message').attr("class", "message-hide")
        }, 2000);
    }
}
async function DeleteNgData(WDOEACICONG_HIST_SID) {
    var r = confirm("Are you sure you want to delete the record?");
    if (r == true) {
        x = "您按了确认！";
        // 定義 API 的 URL
        let getGridURL = window.location.protocol + '//' + default_ip + '/' + default_Api_Name + '/api/H5_WIP_Del';
        let conditions = {
            "WIP_OPI_WDOEACICOOUTPUT_HIST_SID": WDOEACICONG_HIST_SID,
            "EDIT_USER": username
        }

        // 构建请求头
        let headers = new Headers({
            'Content-Type': 'application/json',
            'TokenKey': localStorage.getItem(PROJECT_SAVE_NAME + '_BI_TokenKey')
            // 可以添加其他必要的请求头信息
        });

        // 构建请求体
        let requestBody = JSON.stringify(conditions);

        // 构建请求配置
        let requestOptions = {
            method: "POST",
            headers: headers,
            body: requestBody
        };

        try {
            // 发送请求并等待响应
            let response = await fetch(getGridURL, requestOptions);

            if (response.ok) {
                // 解析响应为 JSON
                let data = await response.json();
                // console.log("获取Grid数据成功:", data);
                if (data.result) {
                    $('#ng-hist-list').empty()
                    SetNgHistQuery()
                }
                else {
                }
            } else {
                throw new Error('获取Grid数据失败，状态码：' + response.status);

            }
        } catch (error) {
            $('#message-loader').hide()
            $('#error-message').attr("class", "message-show")
            // 2秒後淡出提示訊息
            setTimeout(() => {
                $('#error-message').attr("class", "message-hide")
            }, 2000);
        }
    }
}


async function SetNgHistQuery() {
    [ngHist, ngHistDetails] = await GetNgHist(WIP_OPI_WDOEACICO_HIST_SID);
    let sumNgQty = 0, sumOkQty = 0, summaryStr = '', rowHtml = '';

    if (ngHist.length > 0) {
        $('#EditNGBtn').attr('disabled', false)
        for (let i = 0; i < ngHist.length; i++) {
            //加總NG數量
            sumNgQty += parseInt(ngHist[i].NG_QTY);
            sumOkQty += parseInt(ngHist[i].OK_QTY);

            //明細摘要
            summaryStr = ''
            ngHistDetails[i].NG_CODE_INFOS.forEach((info) => {
                if (info.NG_CODE_QTY != 0) {
                    summaryStr += info.NG_CODE_NO + ":" + info.NG_CODE_QTY + ','
                }
            })
            summaryStr = summaryStr.slice(0, -1);
            //組出rowData
            //<td class="summary">${summaryStr}</td>
            rowHtml = `
              <tr style="vertical-align: middle" class="border-bottom">
                  <th scope="row">${ngHist[i].WIP_OPI_WDOEACICOOUTPUT_HIST_SID}</th>
                  <td>${ngHist[i].EDIT_TIME}</td>
                  <td>${ngHist[i].OK_QTY}</td>
                  <td>${ngHist[i].NG_QTY}</td>
                  
                  <td>${ngHist[i].COMMENT}</td>
                  <td>
                      <button class="btn btn-warning" onclick="LoadNgEditPage('${ngHist[i].WIP_OPI_WDOEACICOOUTPUT_HIST_SID}','${ngHist[i].EDIT_TIME}')">EDIT</button>
                      <button class="btn btn-danger" onclick="DeleteNgData('${ngHist[i].WIP_OPI_WDOEACICOOUTPUT_HIST_SID}')">DEL</button>
                  </td>
              </tr>
          `
            $('#ng-hist-list').append(rowHtml)
        }
    } else {
        $('#EditNGBtn').attr('disabled', true)
    }
    $('#NG_QTY').text(sumNgQty)
    $('#OK_QTY').text(sumOkQty)

    async function GetNgHist(WIP_OPI_WDOEACICO_HIST_SID) {
        if (WIP_OPI_WDOEACICO_HIST_SID == null) return
        let getGridURL = window.location.protocol + '//' + default_ip + '/' + default_Api_Name + '/api/H5_GetGrid';

        let params = {
            SID: '387029088326718', //WIP_OPI_WDOEACICONG_HIST
            TokenKey: localStorage.getItem(PROJECT_SAVE_NAME + '_BI_TokenKey')
        };

        let conditions = {
            Field: ["WIP_OPI_WDOEACICO_HIST_SID"],
            Oper: ["="],
            Value: [WIP_OPI_WDOEACICO_HIST_SID]
        };

        let headers = new Headers({
            'Content-Type': 'application/json',
            'SID': params.SID,
            'TokenKey': params.TokenKey
        });

        let requestBody = JSON.stringify(conditions);

        let requestOptions = {
            method: 'POST',
            headers: headers,
            body: requestBody
        };

        try {
            let response = await fetch(getGridURL, requestOptions);

            if (response.ok) {
                let data = await response.json();
                if (data.result) {
                    let master = data.Grid_Data.filter(e => e.ENABLE_FLAG === 'Y');
                    let details = [];
                    for (let i in master) {
                        let detail = await GetNgHistDetail(master[i].WIP_OPI_WDOEACICOOUTPUT_HIST_SID);
                        details.push(detail[0]);
                    }
                    return [master, details]; // 返回详情列表
                    // return data;
                }
                else {
                    Set_Clean();
                }
            } else {
                throw new Error('获取Grid数据失败，状态码：' + response.status);
            }
        } catch (error) {
            console.error(error);
        }
    }
    async function GetNgHistDetail(NG_HIST_ID) {
        // 定義 API 的 URL
        let getGridURL = window.location.protocol + '//' + default_ip + '/' + default_Api_Name + '/api/WIPOPI_SCHEDULE_WDOEAQ_CICOOUTPUT?WIP_OPI_WDOEACICOOUTPUT_HIST_SID=' + NG_HIST_ID;

        // 构建请求头
        let headers = new Headers({
            // 'Content-Type': 'application/json',
            // 'TokenKey': "WEYU54226552"
            'TokenKey': localStorage.getItem(PROJECT_SAVE_NAME + '_BI_TokenKey')
        });


        // 构建请求配置
        let requestOptions = {
            method: "GET",
            headers: headers,
        };

        try {
            // 发送请求并等待响应
            let response = await fetch(getGridURL, requestOptions);

            if (response.ok) {
                // 解析响应为 JSON
                let responseData = await response.json();
                let parseData = JSON.parse(responseData)

                // console.log("获取Grid数据成功:", data);
                if (parseData.result) {
                    let DataArrays = [];
                    for (let i = 0; i < parseData.DataArrays.length; i++) {
                        DataArrays.push(JSON.parse(parseData.DataArrays[i]))
                    }
                    return DataArrays
                }
                else {

                }
            } else {
                throw new Error('获取Grid数据失败，状态码：' + response.status);

            }
        } catch (error) {
            console.log("GetNgHistDetail Fail")
        }
    }
}

function CleanNgPage() {
    for (var i = 0; i < reasonCodeList.length; i++) {
        $("#lb_" + reasonCodeList[i].REASON_CODE).val('0');
    }
    $("#totalInputNG").val("0")
    $("#totalInputOK").val("0")
    $('#ng-comment').val("")
    $("#ng-saveNgBtn").removeAttr("ng-sid")
    $("#reportTimeWrapper").hide()
}

//出站按鈕
$('#checkOutBtn').click(async function () {
    window.location.href = window.location.protocol + '//' + default_ip + '/' + PROJECT_NAME + "/" + kanbanRoute + '/MES-WIP/setup/wip-query_schedule.html?SID=386440715240108&MODULE_TYPE=MES-WIP&MODULE_NAME=WIP_OPI&LEVEL=L2&BUTTON=A&DEPT_NO=' + DEPT_NO + '&SHIFT_DAY=' + SHIFT_DAY
})
