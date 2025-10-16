let ItemList;
let ItemListSID = "338922502690443";
let TimeList;
let TimeListSID = "338917454530086";
let CycleData;
let CycleDataSID = "340621919953982";
let gridInfo;
let gridInfoSID = "337703789526626";

$(document).ready(function () {
    var table1;
    var table2;
    var table3;
    var Request = {};
    var getUrlParameter = function getUrlParameter() {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;
        var par = {};
        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');
            par[sParameterName[0]] = decodeURI(sParameterName[1])
        }
        return par;
    };
    Request = getUrlParameter();

    var QC_INSPECTION_PLAN_SID = Request["QC_INSPECTION_PLAN_SID"] || null;

    //backUrl參數
    var LEVEL = Request["LEVEL"] || null;
    var MODULE_NAME = Request["MODULE_NAME"] || null;
    var MODULE_TYPE = Request["MODULE_TYPE"] || null;
    var BUTTON = Request["BUTTON"] || null;

    async function fetchData() {
        ItemList = await getGridDataPlan(ItemListSID);
        TimeList = await getGridDataPlan(TimeListSID);
        CycleData = await getGridDataPlan(CycleDataSID);
        gridInfo = await getGridDataPlan(gridInfoSID);

        CycleData = CycleData.Grid_Data[0]
        
        // 長出單號標題&圖片
        $("#planName").html(gridInfo.Grid_Data[0].INSPECTION_ID + ' / ' + gridInfo.Grid_Data[0].INSPECTION_NAME)

        try{
            let src = gridInfo.Grid_Data[0].IMAGE_URL.match(/Content\\.*$/);
            $("#planImage").attr("src",`${window.location.protocol}//${default_ip}/${default_Api_Name}/${src[0]}`)
        }catch{
            // console.log("No Image")
            $("#planImage").hide()
        }

        // 組table內容數列 & 判斷是否可編輯
        if(gridInfo.Grid_Data[0].IS_ONLINE === 'Y'){
            $("#AddItem,#AddTime,#PlanCycle,#AddImage").attr("disabled",true)
        }

        let ItemDataSet = ItemList.Grid_Data.map(function(item){
            if(item.IS_ONLINE === 'Y'){
                $('#AddItem').attr('disabled',true)
                $('#AddTime').attr('disabled',true)
            }
            return Object.values(item)
        });
        let TimeDataSet = TimeList.Grid_Data.map(function(item){
            if(item.IS_ONLINE === 'Y'){
                $('#AddItem').attr('disabled',true)
                $('#AddTime').attr('disabled',true)
            }
            return Object.values(item)
        });

        // 上表格
        if(ItemList.Grid_Data[0]){ // 判斷是否有資料
            let ItemTitle = Object.keys(ItemList.Grid_Data[0]).map(key => ({"title": GetLangDataV2(key),"name": key}));
            table1 = $('#example1').DataTable({
                columns: ItemTitle,
                data: ItemDataSet,
                "scrollX": true,
                "scrollCollapse": true,
                "paging":false,
                // "scrollY": '500px',
                "lengthMenu": [5],
                "order":[[17,"asc"]] // SEQ是第18個
            });
            table1.column(0).visible(false); // Plan SID
            table1.column(1).visible(false); // Item SID
            table1.column(2).visible(false); // Plan ID
        }else{
            table1 = $('#example1').DataTable({ // 長空白Table
                columns: [{'title':"-"}],
                data: [],
                "paging": false,
            });
        }

        // 中表格
        if(TimeList.Grid_Data[0]){
            let TimeTitle = Object.keys(TimeList.Grid_Data[0]).map(key => ({"title": GetLangDataV2(key)}));
            table2 = $('#example2').DataTable({
                columns: TimeTitle,
                data: TimeDataSet,
                "scrollX": true,
                "scrollCollapse": true,
                "scrollY": '500px',
                "paging": false,
                "order":[[3,"asc"]] // TIME是第3個
            });
            table2.column(0).visible(false); // Plan SID
            table2.column(1).visible(false); // Time SID
            table2.column(2).visible(false); // Plan ID
        }else{
            table2 = $('#example2').DataTable({
                columns: [{'title':"-"}],
                data: [],
                "paging": false,
            });
        }
        // 下表格
        if(CycleData){
            table3 = $('#example3').DataTable({
                columns: [{"title":'Mon.'},{"title":'Tue.'},{"title":'Wed.'},{"title":'Thu.'},{"title":'Fri.'},{"title":'Sat.'},{"title":'Sun.'}],
                data: [
                    [CycleData.MONDAY
                    ,CycleData.TUESDAY
                    ,CycleData.WEDNESDAY
                    ,CycleData.THURSDAY
                    ,CycleData.FRIDAY
                    ,CycleData.SATURDAY
                    ,CycleData.SUNDAY]
                ],
                "scrollX": true,
                "scrollCollapse": true,
                "scrollY": '500px',
                "paging": false,
                "columnDefs": [
                    {
                        "targets": "_all",
                        "render": function (data, type, row) {
                            if(data==='Y'){
                                return '<input class="text-end" type="checkbox" value="' + data + '" style="background-color: rgba(249, 108, 114, 0.15);" checked disabled>';
                            }else{
                                return '<input class="text-end" type="checkbox" value="' + data + '" style="background-color: rgba(249, 108, 114, 0.15);" disabled>';
                            }
                        }
                    }
                ]
            });
        }else{
            table3 = $('#example3').DataTable({
                columns: [{'title':"-"}],
                data: [],
                "paging": false,
            });
        }

        $('#example1_filter').hide()
        $('#example2_filter').hide()
        $('#example3_filter').hide()
    }
    fetchData()

    // 获取具有 "Lang" 类的<span>元素
    let backButton = document.getElementById("backButton");

    // 添加点击事件处理程序
    backButton.addEventListener("click", function() {
    
        GoBack(MODULE_TYPE,LEVEL,MODULE_NAME,BUTTON);
    });

    $('#AddItem').click(function(){
        let url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+'/'+kanbanRoute+'/aiot/setup/inspection.html?SID=337432256790989&MODULE_TYPE=AIOT&LEVEL=L5&MODULE_NAME=QC&BUTTON=C&QC_INSPECTION_PLAN_SID='+QC_INSPECTION_PLAN_SID+'&ODF=SEQ'
        window.location.href = url;
    })
    $('#AddTime').click(function(){
        let url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+'/'+kanbanRoute+'/aiot/setup/inspection.html?SID=337432181226108&MODULE_TYPE=AIOT&LEVEL=L5&MODULE_NAME=QC&BUTTON=C&QC_INSPECTION_PLAN_SID='+QC_INSPECTION_PLAN_SID+'&ODF=TIME'
        window.location.href = url;
    })
    
    $('#AddImage').click(function() {
        $('#fileInput').click();
    });
    
    $('#fileInput').change(function() {
        let selectedFile = this.files[0];
        let formData = new FormData();
        formData.append('QC_INSPECTION_PLAN_SID', QC_INSPECTION_PLAN_SID);
        formData.append('EDIT_USER', username);
        formData.append('FILE', selectedFile);
        updateIMG(formData)
    });

    async function getGridDataPlan(SID) {
        // 定义 GetGrid API 的 URL
        let getGridURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/GetGrid';
      
        // 定义要传递的参数对象
        let params = {
            SID: SID,
            TokenKey: localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey')
            // TokenKey: '302e24cbG8xfcHU/Z/vTzA1zYjVFHLfUNtqsWonT'
        };
      
        // 定义查詢条件参数对象
        let conditions = {
            Field: ["QC_INSPECTION_PLAN_SID"],
            Oper: ["="],
            Value: [QC_INSPECTION_PLAN_SID]
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
                if(data.result){
                    return data;
                }
                else{
                    Set_Clean();
                }
            } else {
                 throw new Error('获取Grid数据失败，状态码：' + response.status);
                
            }
        } catch (error) {
            console.error(error);
        }
    }
    async function updateIMG(formData) {
        // 定义 GetGrid API 的 URL
        let getGridURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/QCInspectPlaniMG';
        // 构建请求头
        let headers = new Headers({
            'TokenKey': localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey')
            // 可以添加其他必要的请求头信息
        });
        let requestOptions = {
            method: 'POST',
            headers: headers,
            body: formData // 将条件参数放入请求体
        };
        try {
            // 发送请求并等待响应
            let response = await fetch(getGridURL, requestOptions);
      
            if (response.ok) {
                location.reload()
            } else {
                console.log("error")
            }
        } catch (error) {
            console.error(error);
        }
    }

    $('#PlanCycle').click(function(){
        // Edit代入現有資料
        CycleData.MONDAY==='Y' ? $("#MONDAY").prop('checked',true) : $("#MONDAY").prop('checked',false)
        CycleData.TUESDAY==='Y' ? $("#TUESDAY").prop('checked',true) : $("#TUESDAY").prop('checked',false)
        CycleData.WEDNESDAY==='Y' ? $("#WEDNESDAY").prop('checked',true) : $("#WEDNESDAY").prop('checked',false)
        CycleData.THURSDAY==='Y' ? $("#THURSDAY").prop('checked',true) : $("#THURSDAY").prop('checked',false)
        CycleData.FRIDAY==='Y' ? $("#FRIDAY").prop('checked',true) : $("#FRIDAY").prop('checked',false)
        CycleData.SATURDAY==='Y' ? $("#SATURDAY").prop('checked',true) : $("#SATURDAY").prop('checked',false)
        CycleData.SUNDAY==='Y' ? $("#SUNDAY").prop('checked',true) : $("#SUNDAY").prop('checked',false)
    })
    $('#saveButton').click(function(){
        var EditVal=""
        EditVal+=`MONDAY=N'${$("#MONDAY").prop("checked") ? 'Y' : 'N'}',`
        EditVal+=`TUESDAY=N'${$("#TUESDAY").prop("checked") ? 'Y' : 'N'}',`
        EditVal+=`WEDNESDAY=N'${$("#WEDNESDAY").prop("checked") ? 'Y' : 'N'}',`
        EditVal+=`THURSDAY=N'${$("#THURSDAY").prop("checked") ? 'Y' : 'N'}',`
        EditVal+=`FRIDAY=N'${$("#FRIDAY").prop("checked") ? 'Y' : 'N'}',`
        EditVal+=`SATURDAY=N'${$("#SATURDAY").prop("checked") ? 'Y' : 'N'}',`
        EditVal+=`SUNDAY=N'${$("#SUNDAY").prop("checked") ? 'Y' : 'N'}',`
        // 判斷是 新增 or 修改
        if(CycleData){
            $.ajax({
                type: 'post',
                url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterMaintain/Model/MasterMaintainHandler.ashx',
                data: { funcName: "UpdGridData", TableName: 'QC_INSPECTION_CYCLE', SID: 'QC_INSPECTION_CYCLE_SID='+CycleData.QC_INSPECTION_CYCLE_SID, EditVal: EditVal, USER: username,SID_VAL:'340628197190440',log_val : EditVal },
                dataType: 'json',
                async: false,
                success: function (result) {
                    location.reload()
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    if (xhr.status = 500)
                        alert("資料格式錯誤!");
                    alert(thrownError);
                    $("#progress,#loading").fadeOut(1000);
    
                }
            });
        }else{
            var AddTitle = "MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY,SUNDAY,QC_INSPECTION_PLAN_SID,QC_INSPECTION_CYCLE_SID"
            var AddVal=""
            AddVal+=`N'${$("#MONDAY").prop("checked") ? 'Y' : 'N'}',`
            AddVal+=`N'${$("#TUESDAY").prop("checked") ? 'Y' : 'N'}',`
            AddVal+=`N'${$("#WEDNESDAY").prop("checked") ? 'Y' : 'N'}',`
            AddVal+=`N'${$("#THURSDAY").prop("checked") ? 'Y' : 'N'}',`
            AddVal+=`N'${$("#FRIDAY").prop("checked") ? 'Y' : 'N'}',`
            AddVal+=`N'${$("#SATURDAY").prop("checked") ? 'Y' : 'N'}',`
            AddVal+=`N'${$("#SUNDAY").prop("checked") ? 'Y' : 'N'}',`
            AddVal+=`N'${QC_INSPECTION_PLAN_SID}',`
            $.ajax({
                type: 'post',
                url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterMaintain/Model/MasterMaintainHandler.ashx',
                data: { funcName: "AddSingleRowData", TableName: 'QC_INSPECTION_CYCLE', AddVal: AddVal, AddTitle: AddTitle, USER: username,SID_VAL : '340628197190440' ,log_val: AddVal },
                // "QC_INSPECTION_PLAN_SID,
                // ITEM_SID,SEQ,
                // QC_INSPECTION_PLAN_ITEM_RELATION_SID"
                dataType: 'json',
                async: false,
                success: function (result) {
                    location.reload()
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    if (xhr.status = 500)
                        alert("資料格式錯誤!");
                    alert(thrownError);
                }
            });
        }
    });
})
