ChangeLang();
var DetailTable;
var masterSID;
var GridData;
var BindData = [];
var BindDataSID = [];
var AllGridData = [];
var FUN_SID_ORIGIN_BIND_LIST = [];
var FUN_SID_ALL_BIND_LIST = [];
var FUN_SID_DEL_LIST = [];
var FUN_SID_UNBIND_LIST = [];
var FUN_SID_BIND_LIST = [];
var enable_flag_num = 0;
// var default_ip = '10.0.20.155';
// var default_WebSiteName = 'DCMATE_1114';
var GroupName = '';
//DYNAMIC TABLE
var MD_Maintain_QR_SID = '301253699070550';
var MD_Maintain_Columns_QR_SID = '301253738820145';
var MD_Maintain_Data;
var MD_Columns_Data;
var MD_Columns_Master_Data = '';
var MD_Columns_Master_ColName = '';
var MD_Columns_Detail_Data = '';
var MD_Columns_Detail_ColName = '';
var MD_Columns_Detail_ColList = [];
var MD_Columns_Search_Data = '';
var CurrentRow = [];
//DYNAMIC TABLE
$(document).ready(function () {
    var GroupData;
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
    var SID = Request["SID"];
    //backUrl參數
    var MODULE_TYPE = Request["MODULE_TYPE"] || null;
    var LEVEL = Request["LEVEL"] || null;
    var MODULE_NAME = Request["MODULE_NAME"] || null;
    var BUTTON = Request["BUTTON"] || null;
    //FROM BAS_MD_MAINTAIN
    $.ajax({
        type: 'GET',
        url:window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportHandlerV3.ashx?DataType=QueryReport&SID='+ MD_Maintain_QR_SID,
        async: false,
        success: function (msg) {
        var jsonObj = jQuery.parseJSON(msg.replace(/\~/g, "\""));
                      jsonObj.MasterSql = jsonObj.MasterSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
                      jsonObj.AddedSql = jsonObj.AddedSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
      
                      MD_Maintain_Data = jsonObj
        }
      });
      
      MD_Maintain_Data.MasterSql = MD_Maintain_Data.MasterSql.replace('[SID]',SID);
      
    $.ajax({
        type: 'post',
        url:window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportDataHandler4FullScreen.ASHX?DataType=Grid&DBLink=SELF',
        data: {SQL: MD_Maintain_Data.MasterSql,AddedSQL:MD_Maintain_Data.AddedSql, Conds: JSON.stringify(MD_Maintain_Data.Conditions), GridFieldType: JSON.stringify(MD_Maintain_Data.GridFieldType) ,
        SID:+ MD_Maintain_QR_SID ,rows:10000},
        async: false,
        success: function (msg) {
        var jsonObj = jQuery.parseJSON(msg);
        MD_Maintain_Data = jsonObj;

            $('#midtitle').html(GetLangDataV2(MD_Maintain_Data.rows[0].CAPTION));

        }
    });


    //FROM BAS_MD_MAINTAIN_COLUMNS
    $.ajax({
        type: 'GET',
        url:window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportHandlerV3.ashx?DataType=QueryReport&SID='+ MD_Maintain_Columns_QR_SID,
        async: false,
        success: function (msg) {
        var jsonObj = jQuery.parseJSON(msg.replace(/\~/g, "\""));
                      jsonObj.MasterSql = jsonObj.MasterSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
                      jsonObj.AddedSql = jsonObj.AddedSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
      
                      MD_Columns_Data = jsonObj
        }
      });   
      
    MD_Columns_Data.MasterSql = MD_Columns_Data.MasterSql.replace('[SID]',SID);
      
    $.ajax({
        type: 'post',
        url:window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportDataHandler4FullScreen.ASHX?DataType=Grid&DBLink=SELF',
        data: {SQL: MD_Columns_Data.MasterSql,AddedSQL:MD_Columns_Data.AddedSql, Conds: JSON.stringify(MD_Columns_Data.Conditions), GridFieldType: JSON.stringify(MD_Columns_Data.GridFieldType) ,
        SID:+ MD_Maintain_Columns_QR_SID ,rows:10000},
        async: false,
        success: function (msg) {
        var jsonObj = jQuery.parseJSON(msg);
        MD_Columns_Data = jsonObj;
        }
    });
    for (var i = 0; i < MD_Columns_Data.rows.length; i++)
    {
        if (MD_Columns_Data.rows[i].MD_COLUMNS_TYPE == 'Master' && MD_Columns_Data.rows[i].HIDDEN == 'False')
        {
            MD_Columns_Master_Data += ',' + MD_Columns_Data.rows[i].COL_NAME;
        }
        if (MD_Columns_Data.rows[i].MD_COLUMNS_TYPE == 'Detail')
        {
            MD_Columns_Detail_Data += MD_Columns_Data.rows[i].COL_NAME + ',';
        }
        if (MD_Columns_Data.rows[i].MD_COLUMNS_TYPE == 'Search' && MD_Columns_Data.rows[i].HIDDEN == 'False')
        {
            MD_Columns_Search_Data += MD_Columns_Data.rows[i].COL_NAME + ',';
        }
        if (MD_Columns_Data.rows[i].MD_COLUMNS_TYPE == 'Detail' && MD_Columns_Data.rows[i].HIDDEN == 'False')
        {
            MD_Columns_Detail_ColList.push(MD_Columns_Data.rows[i].COL_NAME);
        }
    }
    MD_Columns_Master_ColName = MD_Columns_Master_Data.substring(1,MD_Columns_Master_Data.length).split(',');
    MD_Columns_Detail_Data = MD_Columns_Detail_Data.substring(0,MD_Columns_Detail_Data.length-1).split(',');
    MD_Columns_Search_Data = MD_Columns_Search_Data.substring(0,MD_Columns_Search_Data.length-1);
    for (var i = 0; i < MD_Columns_Detail_Data.length; i++)
    {
        MD_Columns_Detail_ColName += ',' + MD_Maintain_Data.rows[0].DETAIL_TABLE_NAME + '.' + MD_Columns_Detail_Data[i];
    }
    MD_Columns_Detail_ColName = MD_Maintain_Data.rows[0].RELATION_TABLE_NAME + '.' + MD_Maintain_Data.rows[0].RELATION_SID_FIELD + MD_Columns_Detail_ColName;

    group();


    

    //var table3;
    //第一次RUN 初始化
     DetailTable = $('#MasterMaintainDetail').DataTable( {
        dom: 'frtp',
        // searching: false,
        language: {
            search: GetLangDataV2("search:"), // 將"Search"更改為"搜尋："
            lengthMenu: GetLangDataV2("Show _MENU_ entries"), // 自定義顯示條目數的文本為中文
            info: GetLangDataV2("Showing _START_ to _END_ of _TOTAL_ entries"),//"顯示第 _START_ 到 _END_ 條，共 _TOTAL_ 條", // 
            infoEmpty: GetLangDataV2("Showing 0 to 0 of 0 entries"),//"顯示 0 到 0 條，共 0 條"
            
            paginate: {
                previous: GetLangDataV2("Previous"),//"上一頁", // 將"Previous"更改為"上一頁"
                next: GetLangDataV2("Next"),//"下一頁" // 將"Next"更改為"下一頁"
              }
            
          }, 
        "data": {},
         "columns": [ // 列的標題一般是從DOM中讀取（也可以使用這個屬性為表格創建列標題)
         { title: "" },
         { title: "" },
         { title: ""},
         ],
         initComplete: function() {
            $("#MasterMaintainDetail_filter").hide() // 隱藏dataTable原生搜尋欄
            // 關鍵字搜尋
            $('#searchBtn').on('click', function() {
                DetailTable.search($("#keyword").val()).draw();
            });
            $('#keyword').on('keydown', function(e) {
                if (e.key === 'Enter') {
                    DetailTable.search($(this).val()).draw();
                }
            });
        }
    } );

    let backButton = document.getElementById("backButton");

    // 添加点击事件处理程序
    backButton.addEventListener("click", function() {

        GoBack(MODULE_TYPE,LEVEL,MODULE_NAME,BUTTON);
    });
    
    

});

//群組
function group(){
    $.ajax({
        type: 'POST',
        title: 'Group User Setup',
        footer: '#S148115013850673_MAIN_ft',
        url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/Handler/MasterSetProcessing.ashx',
        async: false,
        pagination: true,
        data: {
            ActionMode: '',
            _search: false,
            COLUMNS: MD_Maintain_Data.rows[0].MASTER_SID_FIELD + MD_Columns_Master_Data,// a.MASTER_SID_FIELD + b. COL_NAME
            defaultSort: ' order by ' + MD_Maintain_Data.rows[0].MASTER_SORT_NAME + ' ' + MD_Maintain_Data.rows[0].MASTER_SORT_ORDER, // order by " + a.MASTER_SORT_NAME a.MASTER_SORT_ORDER
            MasterTable: MD_Maintain_Data.rows[0].MASTER_TABLE_NAME, //a.MASTER_TABLE_NAME
            SIDFILED: MD_Maintain_Data.rows[0].MASTER_SID_FIELD, //a.MASTER_SID_FIELD
            UserName: 'ADMINV2',
            rows: 'BI_PAGE',
            page : '1'
        },
        singleSelect: true,
        multiSort: false,
        rownumbers: true,
        sortName: MD_Maintain_Data.rows[0].MASTER_SORT_NAME, // a.MASTER_SORT_NAME
        sortOrder: MD_Maintain_Data.rows[0].MASTER_SORT_ORDER, //a.MASTER_SORT_ORDER
        pageSize: parseInt(1000),
        pageList: [100],
        // columns: [[{ field: 'GROUP_NAME', title: 'Group Name', width: 200, align: 'right', sortable: true, }, { field: 'ENABLE_FLAG', title: 'Enable', width: 100, align: 'right', sortable: true, }, { field: 'DESCRIPTION', title: 'Description', width: 200, align: 'right', sortable: true, }
        // ]],
        success: function (msg) {
            var jsonObj = jQuery.parseJSON(msg);
            GroupData = jsonObj;
        }, error: function (msg) {
            var jsonObj = msg;
        }
    });

    for(var i=0 ;i<GroupData.rows.length;i++){
        //$("#MMList").append('<option label="群組名稱:'+GridData.rows[i].GROUP_NAME+'" value="'+GridData.rows[i].GROUP_SID+'"></option>');
        // if (GroupData.rows[i].DESCRIPTION != "")
        // {
        //     $("#MMList").append('<option id = "MMoption" label="'+GroupData.rows[i][MD_Maintain_Data.rows[0].MASTER_SID_FIELD]+'" value="'+GroupData.rows[i].GROUP_NAME+' ('+ GroupData.rows[i].DESCRIPTION +')"></option>');
        // }
        // else
        // {
        //     $("#MMList").append('<option id = "MMoption" label="'+GroupData.rows[i][MD_Maintain_Data.rows[0].MASTER_SID_FIELD]+'" value="'+GroupData.rows[i].GROUP_NAME+'"></option>');
        // }
        for (var j = 0; j < MD_Columns_Master_ColName.length; j++)
        {
            if (j == 0)
            {
                GroupName = GroupData.rows[i][MD_Columns_Master_ColName[j]];
            }
            else
            {
                if (GroupData.rows[i][MD_Columns_Master_ColName[j]] != '')
                {
                    GroupName += '-' + GroupData.rows[i][MD_Columns_Master_ColName[j]];
                }
            }
        };

        // if(!['SUPER_ADMIN','QC','MFG','GGG','ADMIN_LIST','ADMIN','ABC'].includes(GroupName.split('-')[0])){ //客製過濾 用不到的群組
            $("#MMList").append('<option id = "MMoption" data-sid="'+GroupData.rows[i][MD_Maintain_Data.rows[0].MASTER_SID_FIELD]+'" value="'+GroupName+'"></option>');
        // }

    };
}


//綁定
function bind(master_sid) {
    $.ajax({
        type: 'POST',
        title: 'Unassigned',
        footer: '#S148122421380739_QUERY_ft',
        url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterSet/MasterDetailMaintainDataHandle.ashx',
        async: false,
        pagination: true,
        data: {
            ActionMode: '',
            MasterTable: MD_Maintain_Data.rows[0].MASTER_TABLE_NAME, //a.MASTER_TABLE_NAME
            DetailTable: MD_Maintain_Data.rows[0].RELATION_TABLE_NAME, // a.RELATION_TABLE_NAME
            SearchTable: MD_Maintain_Data.rows[0].DETAIL_TABLE_NAME, // a.DETAIL_TABLE_NAME
            MasterSIDField: MD_Maintain_Data.rows[0].MASTER_SID_FIELD, //a.MASTER_SID_FIELD
            DetailSIDField: MD_Maintain_Data.rows[0].RELATION_SID_FIELD, //a.RELATION_SID_FIELD
            SearchSIDField: MD_Maintain_Data.rows[0].DELAIL_SID_FIELD, // a.DELAIL_SID_FIELD
            RelationMasterSIDField: MD_Maintain_Data.rows[0].RELATION_MASTER_SID_FIELD, //a.RELATION_MASTER_SID_FIELD
            RelationDetailSIDField: MD_Maintain_Data.rows[0].RELATION_DETAIL_SID_FIELD, //a.RELATION_DETAIL_SID_FIELD
            SearchMasterSID: master_sid,
            operType: 'QueryDetail',
            UserName: 'ADMINV2',
            rows: '1000',
            page: '1',
            _search: false,
            COLUMNS: MD_Columns_Detail_ColName,// a.RELATION_TABLE_NAME+ '.' + a.RELATION_SID_FIELD + ,a.DETAIL_TABLE_NAME+ '.' + 'c.COL_NAME'
            defaultSort: ' order by ' + MD_Maintain_Data.rows[0].DETAIL_SORT_NAME + ' ' + MD_Maintain_Data.rows[0].DETAIL_SORT_ORDER // order by " + a.DETAIL_SORT_NAME + a.DETAIL_SORT_ORDER
        },
        singleSelect: true,
        multiSort: false,
        rownumbers: true,
        sortName: MD_Maintain_Data.rows[0].DETAIL_SORT_NAME, //a.DETAIL_SORT_NAME
        sortOrder: MD_Maintain_Data.rows[0].DETAIL_SORT_ORDER, //a.DETAIL_SORT_ORDER
        singleSelect: false,
        pageSize: parseInt(1000),
        pageList: [10],
        // columns: [[{ field: 'ck', checkbox: true }, { field: 'FUN_SID', hidden: true, title: 'FUN_SID', width: 100, align: 'right', sortable: true, }, { field: 'ETEXT', title: 'FUNCTION_NAME', width: 200, align: 'right', sortable: true, }, { field: 'NAVIGATEURL', title: 'NavigateUrl', width: 200, align: 'right', sortable: true, }, { field: 'EDIT_TIME', hidden: true, title: 'EDIT_TIME', width: 100, align: 'right', sortable: true, }
        // ]],
        success: function (msg) {
            var jsonObj = jQuery.parseJSON(msg);
            GridData = jsonObj;
        }, error: function (msg) {
            var jsonObj = msg;
        }
    });

    var ENABLE_FLAG_Y = '<input type="checkbox" id = "enable_flag" name = "enable_flag" value = "Y" checked="checked">';
    var BindData = [];
    for(var i=0 ;i<GridData.rows.length;i++){
        ENABLE_FLAG_Y = '<input type="checkbox" id = "enable_flag'+ enable_flag_num +'" name = "enable_flag" value = "Y" checked="checked">'
        CurrentRow.push(ENABLE_FLAG_Y);
        for (var j = 0; j < MD_Columns_Detail_ColList.length; j++)
        {
            CurrentRow.push(GridData.rows[i][MD_Columns_Detail_ColList[j]]);
        }
        //BindData.push([ENABLE_FLAG_Y,GridData.rows[i].ETEXT,GridData.rows[i].NAVIGATEURL]);
        BindData.push(CurrentRow);
        AllGridData.push([GridData.rows[i][MD_Maintain_Data.rows[0].RELATION_SID_FIELD],GridData.rows[i][MD_Maintain_Data.rows[0].DELAIL_SID_FIELD]]);
        FUN_SID_ORIGIN_BIND_LIST.push(GridData.rows[i][MD_Maintain_Data.rows[0].DELAIL_SID_FIELD]);
        FUN_SID_ALL_BIND_LIST.push(GridData.rows[i][MD_Maintain_Data.rows[0].DELAIL_SID_FIELD]);
        enable_flag_num++;
        CurrentRow = [];
        //FUN_SID_DEL_LIST.push([GridData.rows[i].GROUP_FUN_LIST_SID,GridData.rows[i].FUN_SID]);
    };
    
    $("#trDT").append('<th>'+GetLangDataV2('Check Bind')+'</th>');//是否啟用
    for (var j = 0; j < MD_Columns_Detail_ColList.length; j++)
    {
        $("#trDT").append('<th>'+ GetLangDataV2(MD_Columns_Detail_ColList[j]) +'</th>');
    }
    //var BindDataTable = $('#MasterMaintainDetail').DataTable()
    //BindDataTable.rows.add(BindData).draw();
    //DetailTable.destroy();
    DetailTable = $('#MasterMaintainDetail').DataTable({
        data: BindData,
        dom: 'frtp',
        // searching: false,
        language: {
            search: GetLangDataV2("search:"), // 將"Search"更改為"搜尋："
            lengthMenu: GetLangDataV2("Show _MENU_ entries"), // 自定義顯示條目數的文本為中文
            info: GetLangDataV2("Showing _START_ to _END_ of _TOTAL_ entries"),//"顯示第 _START_ 到 _END_ 條，共 _TOTAL_ 條", // 
            infoEmpty: GetLangDataV2("Showing 0 to 0 of 0 entries"),//"顯示 0 到 0 條，共 0 條"
            
            paginate: {
                previous: GetLangDataV2("Previous"),//"上一頁", // 將"Previous"更改為"上一頁"
                next: GetLangDataV2("Next"),//"下一頁" // 將"Next"更改為"下一頁"
              }
            
          }, 

        //  "columns": [ // 列的標題一般是從DOM中讀取（也可以使用這個屬性為表格創建列標題)
        //  { title: "是否啟用" },
        //  { title: "功能名稱" },
        //  { title: "Url" },
        //  ],
         fnDrawCallback: function(){
            getAdd_Del_List();
         },
         initComplete: function() {
            $("#MasterMaintainDetail_filter").hide() // 隱藏dataTable原生搜尋欄
            // 關鍵字搜尋
            $('#searchBtn').on('click', function() {
                DetailTable.search($("#keyword").val()).draw();
            });
            $('#keyword').on('keydown', function(e) {
                if (e.key === 'Enter') {
                    DetailTable.search($(this).val()).draw();
                }
            });
        }
    });
};


//未綁定(需與bind()一起使用)
function unbind(master_sid) {
    $.ajax({
        type: 'POST',
        title: 'Unassigned',
        footer: '#S148122421380739_QUERY_ft',
        url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterSet/MasterDetailMaintainDataHandle.ashx',
        async: false,
        pagination: true,
        data: {
            ActionMode: '',
            MasterTable: MD_Maintain_Data.rows[0].MASTER_TABLE_NAME, //a.MASTER_TABLE_NAME
            DetailTable: MD_Maintain_Data.rows[0].RELATION_TABLE_NAME, //a.RELATION_TABLE_NAME
            SearchTable: MD_Maintain_Data.rows[0].DETAIL_TABLE_NAME, // a.DETAIL_TABLE_NAME
            MasterSIDField: MD_Maintain_Data.rows[0].MASTER_SID_FIELD, //a.MASTER_SID_FIELD
            DetailSIDField: MD_Maintain_Data.rows[0].RELATION_SID_FIELD, //a.RELATION_SID_FIELD
            SearchSIDField: MD_Maintain_Data.rows[0].DELAIL_SID_FIELD, // a.DELAIL_SID_FIELD
            RelationMasterSIDField: MD_Maintain_Data.rows[0].RELATION_MASTER_SID_FIELD, //a.RELATION_MASTER_SID_FIELD
            RelationDetailSIDField: MD_Maintain_Data.rows[0].RELATION_DETAIL_SID_FIELD, //a.RELATION_DETAIL_SID_FIELD
            SearchMasterSID: master_sid,
            operType: 'QuerySearch',
            UserName: 'ADMINV2',
            rows: '1000',
            page: '1',
            _search: false,
            COLUMNS: MD_Columns_Search_Data, // d.COL_NAME
            defaultSort: ' order by ' + MD_Maintain_Data.rows[0].DETAIL_SORT_NAME + ' ' + MD_Maintain_Data.rows[0].DETAIL_SORT_ORDER // order by " + a.DETAIL_SORT_NAME + a.DETAIL_SORT_ORDER
        },
        singleSelect: true,
        multiSort: false,
        rownumbers: true,
        sortName: MD_Maintain_Data.rows[0].DETAIL_SORT_NAME, //a.DETAIL_SORT_NAME
        sortOrder: MD_Maintain_Data.rows[0].DETAIL_SORT_ORDER, //a.DETAIL_SORT_ORDER
        singleSelect: false,
        pageSize: parseInt(1000),
        pageList: [10],
        // columns: [[{ field: 'ck', checkbox: true }, { field: 'FUN_SID', hidden: true, title: 'FUN_SID', width: 100, align: 'right', sortable: true, }, { field: 'ETEXT', title: 'FUNCTION_NAME', width: 200, align: 'right', sortable: true, }, { field: 'NAVIGATEURL', title: 'NavigateUrl', width: 200, align: 'right', sortable: true, }, { field: 'EDIT_TIME', hidden: true, title: 'EDIT_TIME', width: 100, align: 'right', sortable: true, }
        // ]],
        success: function (msg) {
            var jsonObj = jQuery.parseJSON(msg);
            GridData = jsonObj;
        }, error: function (msg) {
            var jsonObj = msg;
        }
    });

    var ENABLE_FLAG_N = '<input type="checkbox" id = "enable_flag" name = "enable_flag" value = "N">';
    //var BindData = [];
    for(var i=0 ;i < GridData.rows.length;i++){
        ENABLE_FLAG_N = '<input type="checkbox" id = "enable_flag'+ enable_flag_num +'" name = "enable_flag" value = "N">'
        CurrentRow.push(ENABLE_FLAG_N);
        for (var j = 0; j < MD_Columns_Detail_ColList.length; j++)
        {
            CurrentRow.push(GridData.rows[i][MD_Columns_Detail_ColList[j]]);
        }
        //BindData.push([ENABLE_FLAG_N,GridData.rows[i].ETEXT,GridData.rows[i].NAVIGATEURL]);
        BindData.push(CurrentRow);
        AllGridData.push(["NoData",GridData.rows[i][MD_Maintain_Data.rows[0].DELAIL_SID_FIELD]]);
        // FUN_SID_UNBIND_LIST.push(GridData.rows[i].FUN_SID);
        enable_flag_num++;
        CurrentRow = [];
    };
    var BindDataTable = $('#MasterMaintainDetail').DataTable()
    BindDataTable.rows.add(BindData).draw();
    // DetailTable.destroy();
    // DetailTable = $('#MasterMaintainDetail').DataTable({
    //      "data": BindData,
    //      "columns": [ // 列的標題一般是從DOM中讀取（也可以使用這個屬性為表格創建列標題)
    //      { title: "是否啟用" },
    //      { title: "功能名稱" },
    //      { title: "Url" },
    //      ]

    // });
    //$("#progress,#loading").fadeOut(2000);
};

//新增
function add(func_sid, master_sid) {
    $.ajax({
        type: "POST",
        url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterSet/MasterDetailMaintainDataHandle.ashx',
        data: 'MasterTable=' + MD_Maintain_Data.rows[0].MASTER_TABLE_NAME + '&DetailTable=' + MD_Maintain_Data.rows[0].RELATION_TABLE_NAME + '&SearchTable=' + MD_Maintain_Data.rows[0].DETAIL_TABLE_NAME //a.MASTER_TABLE_NAME , a.RELATION_TABLE_NAME ,a.DETAIL_TABLE_NAME
            + '&MasterSIDField=' + MD_Maintain_Data.rows[0].MASTER_SID_FIELD + '&DetailSIDField=' + MD_Maintain_Data.rows[0].RELATION_SID_FIELD + '&SearchSIDField=' + MD_Maintain_Data.rows[0].DELAIL_SID_FIELD //a.MASTER_SID_FIELD,a.RELATION_SID_FIELD,a.DELAIL_SID_FIELD
            + '&RelationMasterSIDField=' + MD_Maintain_Data.rows[0].RELATION_MASTER_SID_FIELD //a.RELATION_MASTER_SID_FIELD
            + '&RelationDetailSIDField=' + MD_Maintain_Data.rows[0].RELATION_DETAIL_SID_FIELD //a.RELATION_DETAIL_SID_FIELD
            + '&oper=add&DetailSids=' + func_sid + '&MasterSid=' + master_sid + '&UserName='+ 'ADMINV2',
        success: function (msg) {
            var jsonObj = msg;
        }, error: function (msg) {
            var jsonObj = msg;
        }
    })
};
//刪除
function del(group_func_list_sid, master_sid) {
    $.ajax({
        type: "POST",
        url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterSet/MasterDetailMaintainDataHandle.ashx',
        data: 'MasterTable=' + MD_Maintain_Data.rows[0].MASTER_TABLE_NAME + '&DetailTable=' + MD_Maintain_Data.rows[0].RELATION_TABLE_NAME + '&SearchTable=' + MD_Maintain_Data.rows[0].DETAIL_TABLE_NAME //a.MASTER_TABLE_NAME , a.RELATION_TABLE_NAME ,a.DETAIL_TABLE_NAME
            + '&MasterSIDField=' + MD_Maintain_Data.rows[0].MASTER_SID_FIELD + '&DetailSIDField=' + MD_Maintain_Data.rows[0].RELATION_SID_FIELD + '&SearchSIDField=' + MD_Maintain_Data.rows[0].DELAIL_SID_FIELD //a.MASTER_SID_FIELD,a.RELATION_SID_FIELD,a.DELAIL_SID_FIELD
            + '&RelationMasterSIDField=' + MD_Maintain_Data.rows[0].RELATION_MASTER_SID_FIELD  //a.RELATION_MASTER_SID_FIELD
            + '&RelationDetailSIDField=' + MD_Maintain_Data.rows[0].RELATION_DETAIL_SID_FIELD //a.RELATION_DETAIL_SID_FIELD
            + '&oper=del&DeleteSids=' + group_func_list_sid + '&MasterSid=' + master_sid + '&UserName=' + 'ADMINV2',
        success: function (msg) {
            var jsonObj = msg;
        }, error: function (msg) {
            var jsonObj = msg;
        }
    })
};

//只有未綁定
function onlyUnbind(master_sid) {
    $.ajax({
        type: 'POST',
        title: 'Unassigned',
        footer: '#S148122421380739_QUERY_ft',
        url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterSet/MasterDetailMaintainDataHandle.ashx',
        async: false,
        pagination: true,
        data: {
            ActionMode: '',
            MasterTable: MD_Maintain_Data.rows[0].MASTER_TABLE_NAME, //a.MASTER_TABLE_NAME
            DetailTable: MD_Maintain_Data.rows[0].RELATION_TABLE_NAME, //a.RELATION_TABLE_NAME
            SearchTable: MD_Maintain_Data.rows[0].DETAIL_TABLE_NAME, // a.DETAIL_TABLE_NAME
            MasterSIDField: MD_Maintain_Data.rows[0].MASTER_SID_FIELD, //a.MASTER_SID_FIELD
            DetailSIDField: MD_Maintain_Data.rows[0].RELATION_SID_FIELD, //a.RELATION_SID_FIELD
            SearchSIDField: MD_Maintain_Data.rows[0].DELAIL_SID_FIELD, // a.DELAIL_SID_FIELD
            RelationMasterSIDField: MD_Maintain_Data.rows[0].RELATION_MASTER_SID_FIELD, //a.RELATION_MASTER_SID_FIELD
            RelationDetailSIDField: MD_Maintain_Data.rows[0].RELATION_DETAIL_SID_FIELD, //a.RELATION_DETAIL_SID_FIELD
            SearchMasterSID: master_sid,
            operType: 'QuerySearch',
            UserName: 'ADMINV2',
            rows: '1000',
            page: '1',
            _search: false,
            COLUMNS: MD_Columns_Detail_ColName, // d.COL_NAME
            defaultSort: ' order by ' + MD_Maintain_Data.rows[0].DETAIL_SORT_NAME + ' ' + MD_Maintain_Data.rows[0].DETAIL_SORT_ORDER // order by " + a.DETAIL_SORT_NAME + a.DETAIL_SORT_ORDER
        },
        singleSelect: true,
        multiSort: false,
        rownumbers: true,
        sortName: MD_Maintain_Data.rows[0].DETAIL_SORT_NAME, //a.DETAIL_SORT_NAME
        sortOrder: MD_Maintain_Data.rows[0].DETAIL_SORT_ORDER, //a.DETAIL_SORT_ORDER
        singleSelect: false,
        pageSize: parseInt(1000),
        pageList: [10],
        // columns: [[{ field: 'ck', checkbox: true }, { field: 'FUN_SID', hidden: true, title: 'FUN_SID', width: 100, align: 'right', sortable: true, }, { field: 'ETEXT', title: 'FUNCTION_NAME', width: 200, align: 'right', sortable: true, }, { field: 'NAVIGATEURL', title: 'NavigateUrl', width: 200, align: 'right', sortable: true, }, { field: 'EDIT_TIME', hidden: true, title: 'EDIT_TIME', width: 100, align: 'right', sortable: true, }
        // ]],
        success: function (msg) {
            var jsonObj = jQuery.parseJSON(msg);
            GridData = jsonObj;
        }, error: function (msg) {
            var jsonObj = msg;
        }
    });

    var ENABLE_FLAG_N = '<input type="checkbox" id = "enable_flag" name = "enable_flag" value = "N">';
    //var BindData = [];
    for(var i=0 ;i < GridData.rows.length;i++){
        ENABLE_FLAG_N = '<input type="checkbox" id = "enable_flag'+ enable_flag_num +'" name = "enable_flag" value = "N">'
        CurrentRow.push(ENABLE_FLAG_N);
        for (var j = 0; j < MD_Columns_Detail_ColList.length; j++)
        {
            CurrentRow.push(GridData.rows[i][MD_Columns_Detail_ColList[j]]);
        }
        BindData.push(CurrentRow);
        AllGridData.push(["NoData",GridData.rows[i][MD_Maintain_Data.rows[0].DELAIL_SID_FIELD]]);
        FUN_SID_UNBIND_LIST.push(GridData.rows[i][MD_Maintain_Data.rows[0].DELAIL_SID_FIELD]);
        enable_flag_num++;
        CurrentRow = [];
    };
    $("#trDT").append('<th>'+GetLangDataV2('Check Bind')+'</th>');
    for (var j = 0; j < MD_Columns_Detail_ColList.length; j++)
    {
        $("#trDT").append('<th>'+ GetLangDataV2(MD_Columns_Detail_ColList[j]) +'</th>');
    }
    DetailTable = $('#MasterMaintainDetail').DataTable({
        data: BindData,
        dom: 'frtp',
        // searching: false,
        language: {
            search: GetLangDataV2("search:"), // 將"Search"更改為"搜尋："
            lengthMenu: GetLangDataV2("Show _MENU_ entries"), // 自定義顯示條目數的文本為中文
            info: GetLangDataV2("Showing _START_ to _END_ of _TOTAL_ entries"),//"顯示第 _START_ 到 _END_ 條，共 _TOTAL_ 條", // 
            infoEmpty: GetLangDataV2("Showing 0 to 0 of 0 entries"),//"顯示 0 到 0 條，共 0 條"
            
            paginate: {
                previous: GetLangDataV2("Previous"),//"上一頁", // 將"Previous"更改為"上一頁"
                next: GetLangDataV2("Next"),//"下一頁" // 將"Next"更改為"下一頁"
              }
            
          }, 
        //  "columns": [ // 列的標題一般是從DOM中讀取（也可以使用這個屬性為表格創建列標題)
        //  { title: "是否啟用" },
        //  { title: "功能名稱" },
        //  { title: "Url" },
        //  ],
        fnDrawCallback: function(){
            getAdd_Del_List();
        },
        initComplete: function() {
            $("#MasterMaintainDetail_filter").hide() // 隱藏dataTable原生搜尋欄
            // 關鍵字搜尋
            $('#searchBtn').on('click', function() {
                DetailTable.search($("#keyword").val()).draw();
            });
            $('#keyword').on('keydown', function(e) {
                if (e.key === 'Enter') {
                    DetailTable.search($(this).val()).draw();
                }
            });
        }
    });
    //$("#progress,#loading").fadeOut(2000);
};

function startFetchDetail(){
    let selectedValue = $("input[name='selectShow']:checked").val();

    switch (selectedValue) {
        case "All":
            getDetailTable()
            break;
        case "Bind":
            getBindDetailTable()
            break;
        case "Unbind":
            getUnbindDetailTable();
            break;
    }
}

//清理選單
function clearSelect(){
    $('#MMsid').val("");
}

//取得全部功能清單
function getDetailTable(){
    var label = '';
    BindData = [];
    AllGridData = [];
    FUN_SID_ORIGIN_BIND_LIST = [];
    FUN_SID_ALL_BIND_LIST = [];
    FUN_SID_BIND_LIST = [];
    FUN_SID_UNBIND_LIST = [];
    FUN_SID_DEL_LIST = [];
    //console.log("document_value:",document.getElementById("MMsid").value);
    for (var i = 0; i < $("#MMsid")[0].list.children.length; i++)
    {
        if ($("#MMsid")[0].list.children[i].value == document.getElementById("MMsid").value)
        {
            masterSID = $($("#MMsid")[0].list.children[i]).data('sid');
        }
    }
    if(!masterSID) return //若沒有選擇主體，則中斷執行
    DetailTable.destroy();
    $('#MasterMaintainDetail').empty();
    $('#MasterMaintainDetail').append('<thead><tr id="trDT"></tr></thead>');
    bind(masterSID);
    unbind(masterSID);
    enable_flag_num = 0;
    $("#progress,#loading").fadeOut(2000);
};

//取得已綁定功能清單
function getBindDetailTable(){
    var label = '';
    BindData = [];
    AllGridData = [];
    FUN_SID_ORIGIN_BIND_LIST = [];
    FUN_SID_ALL_BIND_LIST = [];
    FUN_SID_BIND_LIST = [];
    FUN_SID_UNBIND_LIST = [];
    FUN_SID_DEL_LIST = [];
    //console.log("document_value:",document.getElementById("MMsid").value);
    for (var i = 0; i < $("#MMsid")[0].list.children.length; i++)
    {
        if ($("#MMsid")[0].list.children[i].value == document.getElementById("MMsid").value)
        {
            masterSID = $($("#MMsid")[0].list.children[i]).data('sid');
        }
    }
    if(!masterSID) return //若沒有選擇主體，則中斷執行
    DetailTable.destroy();
    $('#MasterMaintainDetail').empty();
    $('#MasterMaintainDetail').append('<thead><tr id="trDT"></tr></thead>');
    bind(masterSID);
    enable_flag_num = 0;
    $("#progress,#loading").fadeOut(2000);
};

//取得未綁定功能清單
function getUnbindDetailTable(){
    var label = '';
    BindData = [];
    AllGridData = [];
    FUN_SID_ORIGIN_BIND_LIST = [];
    FUN_SID_ALL_BIND_LIST = [];
    FUN_SID_BIND_LIST = [];
    FUN_SID_UNBIND_LIST = [];
    FUN_SID_DEL_LIST = [];
    //console.log("document_value:",document.getElementById("MMsid").value);
    for (var i = 0; i < $("#MMsid")[0].list.children.length; i++)
    {
        if ($("#MMsid")[0].list.children[i].value == document.getElementById("MMsid").value)
        {
            masterSID = $($("#MMsid")[0].list.children[i]).data('sid');
        }
    }
    if(!masterSID) return //若沒有選擇主體，則中斷執行
    DetailTable.destroy();
    $('#MasterMaintainDetail').empty();
    $('#MasterMaintainDetail').append('<thead><tr id="trDT"></tr></thead>');
    //console.log("document_text:",optLabel);
    onlyUnbind(masterSID);
    enable_flag_num = 0;
    $("#progress,#loading").fadeOut(2000);
    //getCheckSID();
};

//組成欲新增與刪除清單
function getAdd_Del_List(){
    var checkGroup = $("input[name='enable_flag']");
    //var pageNum = document.getElementsByClassName('paginate_button current')[0].innerText;
    checkGroup.each(function(i){
        $(this).click(function(){
            var ArrayNum = Number(this.id.replace('enable_flag',''));
            if (this.checked == true){
                FUN_SID_ALL_BIND_LIST.push(AllGridData[ArrayNum][1]);
                for (var j = 0; j < FUN_SID_DEL_LIST.length; j++)
                {
                    if (FUN_SID_DEL_LIST[j] == AllGridData[ArrayNum][0])
                    {
                        FUN_SID_DEL_LIST.splice(j,1);
                    }
                }
            }
            else
            {
                for (var k = 0; k < FUN_SID_ORIGIN_BIND_LIST.length; k++)
                {
                    if (FUN_SID_ORIGIN_BIND_LIST[k] == AllGridData[ArrayNum][1])
                    {
                        FUN_SID_DEL_LIST.push(AllGridData[ArrayNum][0]);
                    }
                }
                for(var j = 0; j < FUN_SID_ALL_BIND_LIST.length; j++)
                {
                    if (FUN_SID_ALL_BIND_LIST[j] == AllGridData[ArrayNum][1])
                    {
                        FUN_SID_ALL_BIND_LIST.splice(j,1);
                    }
                }
            }
            FUN_SID_BIND_LIST = FUN_SID_ALL_BIND_LIST.filter((e)=>{
            return FUN_SID_ORIGIN_BIND_LIST.indexOf(e) === -1;
            });
        
        FUN_SID_BIND_LIST = FUN_SID_BIND_LIST.filter((element, index, arr) => {
            return arr.indexOf(element) === index;
        });
    });
    })
};

//儲存選擇結果
async function DataSave(){
    // var yes = confirm("Confirm to Save?");
    var yes = await customConfirm("確定要儲存設定嗎?");
    if (yes)
    {
        for (var i = 0; i < FUN_SID_BIND_LIST.length; i++)
        {
            add(FUN_SID_BIND_LIST[i],masterSID);
        }
        for (var j = 0; j < FUN_SID_DEL_LIST.length; j++)
        {
            del(FUN_SID_DEL_LIST[j],masterSID);
        }
        if (document.getElementById('selectShowAll').checked == true)
        {
            setTimeout(function(){
                getDetailTable();
            },2000);
            //getDetailTable();
            //ResetDataTable();
        }
        else if (document.getElementById('selectShowBind').checked == true)
        {
            setTimeout(function(){
                getBindDetailTable();
            },2000);
            //getBindDetailTable();
        }
        else if (document.getElementById('selectShowUnbind').checked == true)
        {
            setTimeout(function(){
                getUnbindDetailTable();
            },2000);
            //getUnbindDetailTable();
        }
        
        //$("#progress,#loading").fadeOut(2000);
    }
};

//重置DataTable
async function ResetDataTable(){
    // var yes = confirm("Confirm to Reset?");
    var yes = await customConfirm("確定要重置設定嗎?");
    if (yes)
    {
        document.getElementById('selectShowAll').checked = true;
        //document.getElementById('selectShowBind').checked = false;
        //document.getElementById('selectShowUnbind').checked = false;
        getDetailTable();
        //$("#progress,#loading").fadeOut(2000);
    }
}