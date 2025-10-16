ChangeLang();//多國語言翻譯

// 準備參數
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
var currentSID = Request["SID"];
var CUSTOMER_COMPLAINTS_SID = Request["CUSTOMER_COMPLAINTS_SID"]
var OPERATION_CODE = Request["OPERATION_CODE"]
var QC_INSPECTION_PLAN_SID = Request["QC_INSPECTION_PLAN_SID"]
var MODULE_NAME = Request["MODULE_NAME"]
var url = ''

var ifDisabledFunction = false
var ifDisabledFunction_CustomerComplaint = false

// 客製按鈕的HTML
let StatusButtonHTML = '<button id="SwitchStatus" class="btn btn-outline-primary"><img src="../img/comm/master-maintain/edit.png" alt="Edit"><span class="Lang">'+GetLangDataV2('Status Change')+'</span></button>'
let MoudlesButtonHTML = `<button id="SwitchMoudles" class="btn btn-outline-primary"><img src="../img/comm/master-maintain/edit.png" alt="Edit"><span class="Lang">${GetLangDataV2('Mold Lock/Unlock')}</span></button>`
let MaintainButtonHTML = `<button id="Maintain" class="btn btn-outline-primary"><img src="../img/comm/master-maintain/edit.png" alt="Edit"><span class="Lang">${GetLangDataV2('Maintain')}</span></button>`
let QueryButtonHTML = `<button id="QueryButton" class="btn btn-outline-primary"><img src="../img/weyu/Inquire.png" alt="Query"><span class="Lang">${GetLangDataV2('History Query')}</span></button>`
let RefrigerantButtonHTML = `<button id="RefrigerantButton" class="btn btn-outline-primary""><img src="../img/weyu/freeze-svgrepo-com.svg" alt="Query"><span class="Lang">${GetLangDataV2('Refrigerant mgt.')}</span></button>`
let ModelButtonHTML = `<button id="ModelButton" class="btn btn-outline-primary"><img src="../img/weyu/air-conditioner.svg" alt="Query"><span class="Lang">${GetLangDataV2('Model mgt.')}</span></button>`
let VehicleButtonHTML = `<button id="VehicleButton" class="btn btn-outline-primary"><img src="../img/weyu/air-conditioner.svg" alt="Query"><span class="Lang">${GetLangDataV2('Vehicle mgt.')}</span></button>`
let GeneratorButtonHTML = `<button id="GeneratorButton" class="btn btn-outline-primary"><img src="../img/weyu/electric.svg" alt="Query"><span class="Lang">${GetLangDataV2('Generator mgt.')}</span></button>`
let ComplaintHandlingButtonHTML =`<button id="ComplaintHandling" class="btn btn-outline-primary"><img src="../img/weyu/complain-handling.svg" alt="Query"><span class="Lang">${GetLangDataV2('Complaint Handling')}</span></button>`
//加按鈕1.
let CustomerComplaintsUploadButtonHTML =`<button id="CustomerComplaintsUpload" class="btn btn-outline-primary"><img src="../img/weyu/complain-handling.svg" alt="Query"><span class="Lang">${GetLangDataV2('Upload File')}</span></button>`

let ResetPasswordButtonHTML = `<button id="ResetPassword" class="btn btn-outline-primary"><img src="../img/weyu/complain-handling.svg" alt="Query"><span class="Lang">${GetLangDataV2('Reset Password')}</span></button>`

let GroupUserSetupButtonHTML = `<button id="GroupUserSetup" class="btn btn-outline-primary"><img src="../img/weyu/complain-handling.svg" alt="Query"><span class="Lang">${GetLangDataV2('Group User Setup')}</span></button>`
let GroupFunctionButtonHTML = `<button id="GroupFunction" class="btn btn-outline-primary"><img src="../img/weyu/complain-handling.svg" alt="Query"><span class="Lang">${GetLangDataV2('Group Function')}</span></button>`
//報工
let ReportButtonHTML = `<button id="Report" class="btn btn-outline-primary"><img src="../img/weyu/complain-handling.svg" alt="Query"><span class="Lang">${GetLangDataV2('OPI')}</span></button>`

//QC品質管理
let CheckHTML = `<button id="CheckButton" class="btn btn-outline-primary"><img src="../img/weyu/complain-handling.svg" alt="Query"><span class="Lang">${GetLangDataV2('Check')}</span></button>`
let InspectionHTML2 = `<button id="Inspection2" class="btn btn-outline-primary"><img src="../img/weyu/complain-handling.svg" alt="Query"><span class="Lang">${GetLangDataV2('Inspection')}</span></button>`
let InspectionHTML3 = `<button id="Inspection3" class="btn btn-outline-primary"><img src="../img/weyu/complain-handling.svg" alt="Query"><span class="Lang">${GetLangDataV2('Inspection')}</span></button>`
let QCHistQuery = `<button id="QCHistQuery" class="btn btn-outline-primary"><img src="../img/weyu/complain-handling.svg" alt="Query"><span class="Lang">${GetLangDataV2('VIEW')}</span></button>`


// 每個查詢的客製選項
let SID_BUTTON_REALATION = [
    {SID:'331903774523639', STATUS_ON:true, MOUDLES_ON:true, MAINTAIN_ON:true, QUERY_ON:true },  //L1 設備維護
    {SID:'334339875776290', STATUS_ON:true, MOUDLES_ON:true, MAINTAIN_ON:true, QUERY_ON:true },  //L1 模具管理
    {SID:'335037058616164', MAINTAIN_ON:true, QUERY_ON:true, COMPLAINT_ON:true , ComplaintsUpload_ON:true},  //L1 客訴 //加按鈕2.
    {SID:'335550119320875', MAINTAIN_ON:true, QUERY_ON:true, PWD_ON:true},  //L2 人員維護
    {SID:'335551651173289', MAINTAIN_ON:true, QUERY_ON:true, GROUPUSERSETUP_ON:true, GROUPFUNCTION_ON:true},  //L2 群組維護
    
    {SID:'335716388106018', REPORT_ON:true},  //L2 工單報工
    {SID:'315237389923330', REPORT_ON:true},  //L2 批號報工
    {SID:'338202757246519', REPORT_ON:true},  //L2 機台報工
    {SID:'336221896170852', REPORT_ON:true},  //L2 工作站報工 更工作站清單 2023-12-26
    {SID:'336145865093682', MAINTAIN_ON:true,REPORT_ON:true},  //L3 工作站報工
    {SID:'336407516436566', REPORT_ON:true,QUERY_ON:true},  //L3 部門報工
    {SID:'337439812260107', REPORT_ON:true,QUERY_ON:true},  //L3 人員報工


    {SID:'308655185830894', MAINTAIN_ON:true},  //L1 專案管理

    {SID:'335093094600275', MAINTAIN_ON:true, ComplaintsUpload_ON:true},  //L2 客訴處理
    {SID:'333738231483431'}, //L4 機台狀態切換查詢
    {SID:'333813350873180'}, //L4 機台主檔編輯維護查詢
    
    {SID:'334678382406938', MAINTAIN_ON:true, QUERY_ON:true, VEHICLE_ON:true },  //L2 ESG 燃料 車輛
    {SID:'334678600646924', MAINTAIN_ON:true, QUERY_ON:true },  //L2 ESG 燃料 鍋爐
    {SID:'334593603730992', MAINTAIN_ON:true, QUERY_ON:true, GENERATOR_ON:true},  //L2 ESG 燃料 發電機
    {SID:'334604856230277', MAINTAIN_ON:true, QUERY_ON:true},  //L2 ESG 燃料 燃料維護
    {SID:'334579037386718', MAINTAIN_ON:true, QUERY_ON:true, REFRIGERANT_ON:true, MODEL_ON:true},  //L2 ESG 冷卻設備
    {SID:'334504847103017', MAINTAIN_ON:true, QUERY_ON:true },  //L2 ESG 電力
    {SID:'334504927206022', MAINTAIN_ON:true, QUERY_ON:true },  //L2 ESG 天然氣(NG)
    {SID:'334504970126548', MAINTAIN_ON:true, QUERY_ON:true },  //L2 ESG 液化石油氣(LPG)
    {SID:'334505054050647', MAINTAIN_ON:true, QUERY_ON:true },  //L2 ESG 生活垃圾
    {SID:'334505098153042', MAINTAIN_ON:true, QUERY_ON:true },  //L2 ESG 購買的氣體(Purchased steam)
    {SID:'334575797153509', MAINTAIN_ON:true, QUERY_ON:true },  //L3 ESG Setting Coefficient
    {SID:'334576159696574', MAINTAIN_ON:true, QUERY_ON:true },  //L3 ESG Setting GWP

    {SID:'337434168663049', CHECK_ON:true },  //L4 QC 定期巡檢
    {SID:'337703789526626', INSPECTION2_ON:true },  //L3 QC 定期巡檢
    {SID:'337710329736303', INSPECTION3_ON:true },  //L3 QC 定期巡檢
    {SID:'353163959260376', QC_HIST_NO:true },  //L3 QC 定期巡檢

    // {SID:'337105947593915', QC_ITEM_ON:true, QC_PERIOD_ON:true },  //L3 QC 定期巡檢

]
function CreateCustomButton(SID) {
    SID_BUTTON_REALATION.forEach(buttonRelation => {
        if (buttonRelation.SID === SID) {
            if (buttonRelation.MAINTAIN_ON) {$('.divider').after(MaintainButtonHTML)}
            if (buttonRelation.QUERY_ON) {$('.divider').after(QueryButtonHTML)}
            if (buttonRelation.MOUDLES_ON) {$('.divider').after(MoudlesButtonHTML)}
            if (buttonRelation.STATUS_ON) {$('.divider').after(StatusButtonHTML)}
            if (buttonRelation.REFRIGERANT_ON) {$('.divider').after(RefrigerantButtonHTML)}
            if (buttonRelation.MODEL_ON) {$('.divider').after(ModelButtonHTML)}
            if (buttonRelation.VEHICLE_ON) {$('.divider').after(VehicleButtonHTML)}
            if (buttonRelation.GENERATOR_ON) {$('.divider').after(GeneratorButtonHTML)}
            if (buttonRelation.COMPLAINT_ON) {$('.divider').after(ComplaintHandlingButtonHTML)}
            //加按鈕3.
            if (buttonRelation.ComplaintsUpload_ON) {$('.divider').after(CustomerComplaintsUploadButtonHTML)}
            if (buttonRelation.GROUPUSERSETUP_ON) {$('.divider').after(GroupUserSetupButtonHTML)}
            if (buttonRelation.GROUPFUNCTION_ON) {$('.divider').after(GroupFunctionButtonHTML)}
            if (buttonRelation.PWD_ON) {$('.divider').after(ResetPasswordButtonHTML)}
            if (buttonRelation.REPORT_ON) {$('.divider').after(ReportButtonHTML)}
            if (buttonRelation.CHECK_ON) {$('.divider').after(CheckHTML)}
            if (buttonRelation.INSPECTION2_ON) {$('.divider').after(InspectionHTML2)}
            if (buttonRelation.INSPECTION3_ON) {$('.divider').after(InspectionHTML3)}
            if (buttonRelation.QC_HIST_NO) {$('.divider').after(QCHistQuery)}

        }

    });
}

CreateCustomButton(currentSID);  // 創建按鈕

// 2023-12-04 抽出 根據功能種類 返回keyword(SQL資料欄的名稱)內的參數
function findNO(keyword){
    for (var i = 0; i < tmpALLTitle.split(",").length; i++) {
        if(tmpALLTitle.split(",")[i] == keyword){
            return $('#example').DataTable().row('.selected').data()[i];
        }
    }
}

$('#Maintain').click(function(){
    switch(currentSID){
        case '331903774523639': // 機台維護
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+'setup/master-maintain.html?'+"SID=102785271380810&EQP_NO="+findNO('EQP_NO')+"&LEVEL=L3&MODULE_NAME=EQP_MAINTAIN&BUTTON=B";
            break;
        case '334339875776290': // 模具維護
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+'setup/master-maintain.html?'+"SID=334340636776805&MOLD_NO="+findNO('MOLD_NO')+"&LEVEL=L2&MODULE_NAME=MOLD_MAINTAIN&BUTTON=A";
            break;
        case '335550119320875': // 人員維護
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+'setup/user.html?SID=304100717100290&MODULE_NAME=ADM&LEVEL=L4&BUTTON=C';
            break;
        case '335551651173289': // 群組維護
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+'setup/master-maintain.html?SID=50603545907267&MODULE_NAME=ADM&LEVEL=L4&BUTTON=B';
            break;
        case '335037058616164': // 客訴
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+'setup/master-maintain.html?'+"SID=335035484546344&LEVEL=L2&MODULE_NAME=CUSTOMER_COMPLAINTS&BUTTON=A";
            break;
        case '335093094600275': // 客訴處理
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+'setup/master-maintain.html?CUSTOMER_COMPLAINTS_SID='+CUSTOMER_COMPLAINTS_SID+"&SID=335036498080839&LEVEL=L3&MODULE_NAME=CUSTOMER_COMPLAINTS&BUTTON=A";
            break;
        case '334678382406938': // ESG 燃料 車輛
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+'setup/master-maintain.html?'+"SID=321383006500146&LEVEL=L4&MODULE_NAME=ESG&BUTTON=C";
            break;
        case '334678600646924': // ESG 燃料 鍋爐
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+'setup/master-maintain.html?'+"SID=321793858546350&LEVEL=L4&MODULE_NAME=ESG&BUTTON=D";
            break;
        case '334593603730992': // ESG 燃料 發電機
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+'setup/master-maintain.html?'+"SID=321795623073756&LEVEL=L4&MODULE_NAME=ESG&BUTTON=E";
            break;
        case '334604856230277': // ESG 燃料 燃料維護
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+'setup/master-maintain.html?'+"SID=321381932720898&LEVEL=L4&MODULE_NAME=ESG&BUTTON=F";
            break;
        case '334579037386718': // ESG 冷卻設備
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+'setup/master-maintain.html?'+"SID=321729494410883&LEVEL=L3&MODULE_NAME=ESG&BUTTON=B";
            break;
        case '334504847103017': // ESG 電力
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+'setup/master-maintain.html?'+"SID=321296996343266&LEVEL=L3&MODULE_NAME=ESG&BUTTON=C";
            break;
        case '334504927206022': // ESG 天然氣(NG)
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+'setup/master-maintain.html?'+"SID=321297894990697&LEVEL=L3&MODULE_NAME=ESG&BUTTON=D";
            break;
        case '334504970126548': // ESG 液化石油氣(LPG)
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+'setup/master-maintain.html?'+"SID=321288860720771&LEVEL=L3&MODULE_NAME=ESG&BUTTON=E";
            break;
        case '334505054050647': // ESG 生活垃圾
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+'setup/master-maintain.html?'+"SID=321796402880564&LEVEL=L3&MODULE_NAME=ESG&BUTTON=F";
            break;
        case '334505098153042': // ESG 購買的氣體(Purchased steam)
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+'setup/master-maintain.html?'+"SID=321299241743751&LEVEL=L3&MODULE_NAME=ESG&BUTTON=G";
            break;
        case '334575797153509': // ESG Setting Coefficient
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+'setup/master-maintain.html?'+"SID=321980993826731&LEVEL=L4&MODULE_NAME=ESG&BUTTON=A";
            break;
        case '334576159696574': // ESG Setting GWP
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+'setup/master-maintain.html?'+"SID=321981501686763&LEVEL=L4&MODULE_NAME=ESG&BUTTON=B";
            break;
        case '336145865093682': // 工作站報工
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+'setup/master-maintain.html?'+"SID=336144755800209&LEVEL=L3&MODULE_NAME=PRODUCTION&BUTTON=A&OPERATION_CODE="+OPERATION_CODE;
            break;
        case '308655185830894': // 專案管理
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+'setup/master-maintain.html?'+"SID=308655718250890&LEVEL=L2&MODULE_NAME=PROJECT&BUTTON=A";
            break;
    }
    window.location.href = url;
})
$('#SwitchStatus').click(function(){
    switch(currentSID){
        case '331903774523639': // 機台維護
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+ 'eqp/eqp-status-change.html?EQP_NO='+findNO('EQP_NO')+"&LEVEL=L3&MODULE_NAME=EQP_MAINTAIN&BUTTON=B";
            break;
        case '334339875776290': // 模具維護
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+ 'eqp/mold-status-change.html?MOLD_NO='+findNO('MOLD_NO')+"&LEVEL=L2&MODULE_NAME=MOLD_MAINTAIN&BUTTON=A";
            break;
    }
    window.location.href = url;
})


$('#SwitchMoudles').click(function(){
    url = "http://www.weyutech.com/"
    // window.open(url);
    window.location.href = url;
})


$('#QueryButton').click(function(){
    switch(currentSID){
        case '331903774523639': // 機台維護
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+'zz_query/zz_production.html?EQP_NO='+findNO('EQP_NO')+'&LEVEL=L3&MODULE_NAME=EQP_MAINTAIN&TYPE=QUERY&BUTTON=B';
            break;
        case '334339875776290': // 模具維護
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+'zz_query/zz_production.html?MOLD_NO='+findNO('MOLD_NO')+'&LEVEL=L2&MODULE_NAME=MOLD_MAINTAIN&TYPE=QUERY&BUTTON=A';
            break;
        case '335550119320875': // 人員維護
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+'query/grid-smart-query.html?'+'SID=335550856756679&LEVEL=L4&MODULE_NAME=ADM&BUTTON=C';
            break;
        case '335551651173289': // 群組維護
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+'zz_query/zz_production.html?MODULE_NAME=ADM&LEVEL=L4&BUTTON=B&TYPE=USER_GROUP';
            break;
        case '335037058616164': // 客訴
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+'zz_query/zz_production.html?CUSTOMER_COMPLAINTS_SID='+findNO('CUSTOMER_COMPLAINTS_SID')+'&LEVEL=L2&MODULE_NAME=CUSTOMER_COMPLAINTS&BUTTON=A';
            break;
        case '334678382406938': // ESG 燃料 車輛
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+'zz_query/zz_production.html?LEVEL=L4&MODULE_NAME=ESG&BUTTON=C&TYPE=VEHICLE_HIST';
            break;
        case '334678600646924': // ESG 燃料 鍋爐
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+'query/grid-smart-query.html?'+"SID=334594595483115&LEVEL=L4&MODULE_NAME=ESG&BUTTON=D";
            break;
        case '334593603730992': // ESG 燃料 發電機
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+'zz_query/zz_production.html?LEVEL=L4&MODULE_NAME=ESG&BUTTON=C&TYPE=GENERATOR_HIST';
            break;
        case '334604856230277': // ESG 燃料 燃料維護
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+'query/grid-smart-query.html?'+"SID=334661456100270&LEVEL=L4&MODULE_NAME=ESG&BUTTON=F";
            break;
        case '334579037386718': // ESG 冷卻設備
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+'zz_query/zz_production.html?LEVEL=L3&MODULE_NAME=ESG&BUTTON=B&TYPE=COOLING_HIST';
            // url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+'query/grid-smart-query.html?'+"SID=334579918756671&LEVEL=L3&MODULE_NAME=ESG&BUTTON=B";
            break;
        case '334504847103017': // ESG 電力
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+'query/grid-smart-query.html?'+"SID=334514132170019&LEVEL=L3&MODULE_NAME=ESG&BUTTON=C";
            break;
        case '334504927206022': // ESG 天然氣(NG)
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+'query/grid-smart-query.html?'+"SID=334514633610908&LEVEL=L3&MODULE_NAME=ESG&BUTTON=D";
            break;
        case '334504970126548': // ESG 液化石油氣(LPG)
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+'query/grid-smart-query.html?'+"SID=334514763346088&LEVEL=L3&MODULE_NAME=ESG&BUTTON=E";
            break;
        case '334505054050647': // ESG 生活垃圾
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+'query/grid-smart-query.html?'+"SID=334514981886077&LEVEL=L3&MODULE_NAME=ESG&BUTTON=F";
            break;
        case '334505098153042': // ESG 購買的氣體(Purchased steam)
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+'query/grid-smart-query.html?'+"SID=334515109030162&LEVEL=L3&MODULE_NAME=ESG&BUTTON=G";
            break;
        case '334575797153509': // ESG Setting Coefficient
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+'query/grid-smart-query.html?'+"SID=334577524890115&LEVEL=L4&MODULE_NAME=ESG&BUTTON=A";
            break;
        case '334576159696574': // ESG Setting GWP
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+'query/grid-smart-query.html?'+"SID=334577605726205&LEVEL=L4&MODULE_NAME=ESG&BUTTON=B";
            break;
        case '336407516436566': // 部門報工
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+'query/wip-query-all.html?SID=337022255306774&MODULE_NAME=PRODUCTION&LEVEL=L4&BUTTON=D';
            break;
        case '337439812260107': // 人員報工
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+'query/wip-query-all.html?SID=337972354570235&MODULE_NAME=PRODUCTION&LEVEL=L4&BUTTON=E';
            break;
    }
    window.location.href = url;
})


//ESG
$('#RefrigerantButton').click(function(){
    url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+ 'setup/master-maintain.html?SID=321729081086968&LEVEL=L3&MODULE_NAME=ESG&BUTTON=B';
    // window.open(url);
    window.location.href = url;
})

//ESG
$('#ModelButton').click(function(){
    url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+ 'setup/master-maintain.html?SID=321728018396376&LEVEL=L3&MODULE_NAME=ESG&BUTTON=B';
    // window.open(url);
    window.location.href = url;
})

//ESG
$('#VehicleButton').click(function(){
    url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+ 'setup/master-maintain.html?SID=321382561816144&LEVEL=L4&MODULE_NAME=ESG&BUTTON=C';
    // window.open(url);
    window.location.href = url;
})

//ESG
$('#GeneratorButton').click(function(){
    url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+ 'setup/master-maintain.html?SID=321795361463855&LEVEL=L4&MODULE_NAME=ESG&BUTTON=E';
    // window.open(url);
    window.location.href = url;
})

//客訴
$('#ComplaintHandling').click(function(){
    // 获取隐藏列的第一行的所有单元格的值
    var hiddenRow = $('#example tbody tr.selected'); // 假设你想获取class为selected的行

    let thisSId= "";
    // 遍历所有被隐藏的列，使用 DataTables 的 API 获取数据
    // 1代表 被隱藏的欄位 即 table.column(1).visible(false); 的1
    table.columns(1, { search: 'applied' }).every(function () {
        var columnData = this.data();
        thisSId = columnData[hiddenRow.index()];
    });

    url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+"query/grid-smart-query.html?CUSTOMER_COMPLAINTS_SID="+thisSId+"&MODULE_NAME=CUSTOMER_COMPLAINTS&SID=335093094600275&LEVEL=L2&BUTTON=A",
    // window.open(url);
    window.location.href = url;
})

//客訴上傳
$('#CustomerComplaintsUpload').click(function(){
    console.log("CustomerComplaintsUploadURL");
})

//群組人員維護
$('#GroupUserSetup').click(function(){
    url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+ 'setup/master-detail.html?SID=148115013850673&LEVEL=L4&MODULE_NAME=ADM&BUTTON=B';
    // window.open(url);
    window.location.href = url;
})

//群組功能維護
$('#GroupFunction').click(function(){
    url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+ 'setup/master-detail.html?SID=148122421380739&LEVEL=L4&MODULE_NAME=ADM&BUTTON=B';
    // window.open(url);
    window.location.href = url;
})

//重設密碼
$('#ResetPassword').click(function(){
    url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+ 'setup/reset-password.html?MODULE_NAME=ADM&LEVEL=L4&BUTTON=C'
    window.location.href = url;
})

//報工
$('#Report').click(function(){
    switch(currentSID){
        case '336407516436566':
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+'setup/wip-query.html?SID=347301502426686&MODULE_NAME=USER_REPORT&LEVEL=L2&BUTTON=A&DEPT_NO='+findNO('DEPT_NO')
            break;
        case '337439812260107':
            url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+'setup/wip-query.html?SID=338297914450237&MODULE_NAME=USER_REPORT&LEVEL=L2&BUTTON=B&DEPT_NO='+findNO('DEPT_NO')
            break;
    }
    window.location.href = url;
})

//工作站報工 
function OPERATION_CheckInURL(){
    
    // 获取隐藏列的第一行的所有单元格的值
    var hiddenRow = $('#example tbody tr.selected'); // 假设你想获取class为selected的行

    let thisOP_CODE= "";
    // 遍历所有被隐藏的列，使用 DataTables 的 API 获取数据
    // 1代表 被隱藏的欄位 即 table.column(1).visible(false); 的1
    table.columns(1, { search: 'applied' }).every(function () {
        var columnData = this.data();
        thisOP_CODE = columnData[hiddenRow.index()];
    });

    url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+ 'query/grid-smart-query.html?MODULE_NAME=PRODUCTION&SID=336145865093682&LEVEL=L3&BUTTON=A'+'&OPERATION_CODE='+thisOP_CODE
    window.location.href = url;
}

$('#CheckButton').click(function(){
    url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+ 'setup/inspection.html?SID=337101820166137&QC_INSPECTION_PLAN_SID='+findNO('QC_INSPECTION_PLAN_SID')+'&MSID='+findNO('QC_INSPECTION_MASTER_SID')+'&LEVEL=L5&MODULE_NAME=QC&BUTTON=A'
    window.location.href = url;
})


$('#Inspection2').click(function(){ //L3
    // 获取隐藏列的第一行的所有单元格的值
    var hiddenRow = $('#example tbody tr.selected'); // 假设你想获取class为selected的行

    let thisSID_CODE= "";
    // 遍历所有被隐藏的列，使用 DataTables 的 API 获取数据
    // 1代表 被隱藏的欄位 即 table.column(1).visible(false); 的1
    table.columns(1, { search: 'applied' }).every(function () {
        var columnData = this.data();
        thisSID_CODE = columnData[hiddenRow.index()];
    });

    url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+ 'query/grid-smart-query.html?SID=337710329736303&QC_INSPECTION_PLAN_SID='+thisSID_CODE+'&LEVEL=L4&MODULE_NAME=QC&BUTTON=B'
    window.location.href = url;
})



$('#Inspection3').click(function(){
    // 获取隐藏列的第一行的所有单元格的值
    var hiddenRow = $('#example tbody tr.selected'); // 假设你想获取class为selected的行

    let thisSID_CODE= "";
    // 遍历所有被隐藏的列，使用 DataTables 的 API 获取数据
    // 1代表 被隱藏的欄位 即 table.column(1).visible(false); 的1
    table.columns(1, { search: 'applied' }).every(function () {
        var columnData = this.data();
        thisSID_CODE = columnData[hiddenRow.index()];
    });

    let QC_INSPECTION_PLAN_SID_1 = Request["QC_INSPECTION_PLAN_SID"];
    let tmpSID = '';
    switch(QC_INSPECTION_PLAN_SID_1){
        case "339952188840318"://計畫SID
            tmpSID = '340641032570462'; //對應的智能查詢
            break;
        case "340629801423508":
            tmpSID = '337103577360531';
            break;
        case "339939455610574":
            tmpSID= '340642585910359';
            break;
        case "341063226356399":
            tmpSID= '341157597446467';
            break;
        case "341159099113860":
            tmpSID= '341166206973502';
            break;
    }

    url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+ 'query/grid-smart-query.html?SID='+tmpSID+'&QC_INSPECTION_ORDER_SID='+thisSID_CODE+'&QC_INSPECTION_PLAN_SID='+QC_INSPECTION_PLAN_SID_1+'&LEVEL=ZZ&MODULE_NAME=QC&BUTTON=A'
    window.location.href = url;

})
$('#QCHistQuery').click(function(){
    url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+ 'aiot/query/qc-hist-query.html?QC_INSPECTION_PLAN_SID='+findNO('QC_INSPECTION_PLAN_SID')+'&QC_INSPECTION_ORDER_SID='+findNO('QC_INSPECTION_ORDER_SID')+'&ORDER_NAME='+findNO('ORDER_NAME')+'&MODULE_TYPE=AIOT&MODULE_NAME=QC&LEVEL=L4&BUTTON=D'
    window.location.href = url;
 })

$('#NGDetail').click(function(){
   switch(MODULE_NAME){
    case 'DC':
        url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+ 'query/grid-smart-query.html?SID=352547489510325&WDOEACICONG_NG_HIST_SID='+findNO('WDOEACICONG_HIST_SID')+'&MODULE_NAME=DC&&BUTTON=A&LEVEL=L3'
        break;
    case 'CNC':
        url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+'/'+ 'query/grid-smart-query.html?SID=352547507243895&WDOEACICONG_NG_HIST_SID='+findNO('WDOEACICONG_HIST_SID')+'&MODULE_NAME=CNC&&BUTTON=A&LEVEL=L3'
        break;
   }
   window.location.href = url;
})