


(function ($) {
    var getUrlParameter = function getUrlParameter() {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;
        var par = {};
        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');
            par[sParameterName[0]] = sParameterName[1]
        }
        return par;
    };
    
    Request = getUrlParameter();
    
    var EQP_NO = Request["EQP_NO"];
    var WO = "WO";//工單
    var ShowColumnsName = ["WO", "PART_NO", "EQP_NO", "EQP_NAME", "STATUS","USER"];//要秀的欄位
    var ColorColumnName = "EQP_STATUS_LAYOUT_COLOR";//顏色的欄位
    var ColorStatusName = "EQP_STATUS";//依據狀態變化的欄位
    var HyperColumnName = "EQP_NO";
    let ColorObject = {};
    var PluginName = "WeyuEqpList";
    var EqpObject = {};
    var table;
    $.fn.extend({
        GetDataBySql: function (SQL = null) {
            var EQPInfoSId = '301759574400753';
            var EQPInfoStructer;
            $.ajax({
                type: 'GET',
                url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportHandlerV3.ashx?DataType=QueryReport&SID=' + EQPInfoSId,
                async: false,
                success: function (msg) {
                    var jsonObj = jQuery.parseJSON(msg.replace(/\~/g, "\""));
                    jsonObj.MasterSql = jsonObj.MasterSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
                    jsonObj.AddedSql = jsonObj.AddedSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
                    EQPInfoStructer = jsonObj
                }
            });
            $('#midtitle').html(EQPInfoStructer.GridCaption);
            EQPInfoStructer.MasterSql = EQPInfoStructer.MasterSql.replace("{CON}","{CON} AND EQP_NO='"+EQP_NO+"'");
            if (SQL == null) {
                $.ajax({
                    type: 'post',
                    url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportDataHandler4FullScreen.ASHX?DataType=Grid&DBLink=SELF',
                    data: {
                        Charts: JSON.stringify(EQPInfoStructer.Charts), SQL: EQPInfoStructer.MasterSql, AddedSQL: EQPInfoStructer.AddedSql, Conds: JSON.stringify(EQPInfoStructer.Conditions), GridFieldType: JSON.stringify(EQPInfoStructer.GridFieldType),
                        SID: EQPInfoSId, rows: 100
                    },
                    async: false,
                    success: function (msg) {
                        var jsonObj = jQuery.parseJSON(msg);
                        EqpObject = jsonObj["rows"];
                    }
                })
            } else {
                $.ajax({
                    type: 'post',
                    url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportDataHandler4FullScreen.ASHX?DataType=Grid&DBLink=SELF',
                    data: {
                        Charts: JSON.stringify(EQPInfoStructer.Charts), SQL: EQPInfoStructer.MasterSql, AddedSQL: EQPInfoStructer.AddedSql, Conds: JSON.stringify(EQPInfoStructer.Conditions), GridFieldType: JSON.stringify(EQPInfoStructer.GridFieldType),
                        SID: EQPInfoSId, rows: 100
                    },
                    async: false,
                    success: function (msg) {
                        var jsonObj = jQuery.parseJSON(msg);
                        EqpObject = jsonObj["rows"];
                    }
                })
            }
        },
        DataTableMaintain: function (ID) {
            table = $("#" + ID).DataTable({
                dom: 'rt',
                scrollY: '70vh',
                scrollCollapse: true,
                scrollX: true,
                paging: false,
            });
        },
        DataAppend: function () {
            var DataSet = [];
            var DataRow = [];
            for (var i in EqpObject) {
                for (var j in ShowColumnsName) {
                    DataRow.push(EqpObject[i][ShowColumnsName[j]]);
                }
                ColorObject[EqpObject[i][ColorStatusName]] = EqpObject[i][ColorColumnName];//取得顏色
                DataSet.push(DataRow);
                DataRow = [];
            }
            table.rows.add(DataSet).draw();
        },
        SetColorByColorObject: function (ID, Type = 0) {
            table.rows().every(function (rowIdx, tableLoop, rowLoop) {
                var State = this.data()[ShowColumnsName.indexOf(ColorStatusName)];
                if (ColorObject[State] != undefined) {
                    switch (Type) {
                        case 1:
                            $("#" + ID + " tbody").find('tr').eq(rowLoop).attr('style', 'background-color:' + ColorObject[State] + "BB");
                            break;
                        default:
                            $("#" + ID + " tbody").find('tr').eq(rowLoop).find('td').attr('style', 'color:' + ColorObject[State]);
                            break;
                    }
                }
            });
        },
        HyperLinkEvent: function (ID) {
            $('#' + ID + ' tbody').on('click', 'tr', function () {
                var data = table.row(this).data();
                alert('You clicked on ' + data[ShowColumnsName.indexOf(HyperColumnName)] + "'s row");
                window.location.href = "../EQPInfo.html?EQP_NO=" + data[ShowColumnsName.indexOf(HyperColumnName)];

            });
        }
    })
})(jQuery)


