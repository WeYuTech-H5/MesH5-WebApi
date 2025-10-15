using Dapper;
using MESH5_WEBAPI_20250228V2.Helper;
using Newtonsoft.Json;
using NPOI.HSSF.UserModel;
using NPOI.SS.UserModel;    // IWorkbook, ICellStyle, ICell
using NPOI.SS.Util;         // CellReference, CellRangeAddress
using NPOI.XSSF.UserModel;  // XSSFWorkbook、XSSFCellStyle、XSSFColor
using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace MESH5_WEBAPI_20250228V2.Controllers
{
    public class H5_ExcelExportController : ApiController
    {
        static WeYuSEC_H5.SECFun_H5 SEC_H5 = new WeYuSEC_H5.SECFun_H5();
        static WeYuDB_H5.DBQuery_H5 MyDBQuery = new WeYuDB_H5.DBQuery_H5();
        static WeYuDB_H5.DBAction_H5 DBAction_H5 = new WeYuDB_H5.DBAction_H5();


        public class ExcelFillRequest
        {
            public string TemplateFile { get; set; }          // 範本檔案名稱（含 .xlsx）
            public string OutputFileName { get; set; }        // 輸出檔案名稱
            public List<SheetData> Sheets { get; set; }       // 多個工作表（複製自範本）
        }

        public class SheetData
        {
            public string SheetName { get; set; }             // 新工作表名稱
            public string TemplateSheetName { get; set; } //參考複製的 工作表
            public Dictionary<string, CellValue> Cells { get; set; } // 每格座標對應內容
            public List<string> MergeCells { get; set; }      // 合併儲存格區段（如 "C20:D20"）
        }

        public class CellValue
        {
            public string Value { get; set; } = "";
            public string Fill { get; set; } = "#FFFFFF";
            public bool Border { get; set; } = false;
            public bool FontBold { get; set; } = false;
            public string Alignment { get; set; } = "left"; // 或 "center", "right"
            public bool WrapText { get; set; } = true;

            //  新增字體大小屬性（單位為 pt，例如 12 表示 12pt）
            public short? FontSize { get; set; } = null;
        }

        /// <summary>
        /// 防呆 檢查合併儲存格是否重複輸入(JSON&範本)
        /// </summary>
        /// <param name="sheet"></param>
        /// <param name="newRange"></param>
        /// <returns></returns>
        private bool IsMergedAlready(ISheet sheet, CellRangeAddress newRange)
        {
            for (int i = 0; i < sheet.NumMergedRegions; i++)
            {
                var existing = sheet.GetMergedRegion(i);
                if (existing.FirstRow == newRange.FirstRow &&
                    existing.LastRow == newRange.LastRow &&
                    existing.FirstColumn == newRange.FirstColumn &&
                    existing.LastColumn == newRange.LastColumn)
                {
                    return true;
                }
            }
            return false;
        }

        /// <summary>
        /// Excel Style 套用
        /// </summary>
        public static class ExcelStyleHelper
        {
            public static ICellStyle ApplyStyle(IWorkbook workbook, CellValue cellValue)
            {
                var style = workbook.CreateCellStyle();

                // 背景色
                if (!string.IsNullOrEmpty(cellValue.Fill))
                {
                    var color = System.Drawing.ColorTranslator.FromHtml(cellValue.Fill);
                    var fillColor = new XSSFColor(new byte[] { color.R, color.G, color.B });
                    ((XSSFCellStyle)style).SetFillForegroundColor(fillColor);
                    style.FillPattern = FillPattern.SolidForeground;
                }

                #region 套用字體大小
                //  建立字體樣式
                var font = workbook.CreateFont();

                //  設定字體為粗體（如果需要）
                if (cellValue.FontBold)
                {
                    font.IsBold = true;
                }

                //  設定字體大小（如果有指定）
                if (cellValue.FontSize.HasValue)
                {
                    font.FontHeightInPoints = cellValue.FontSize.Value;
                }

                //  將字體套用到樣式中
                style.SetFont(font);
                #endregion

                // 框線
                if (cellValue.Border)
                {
                    style.BorderTop = BorderStyle.Thin;
                    style.BorderBottom = BorderStyle.Thin;
                    style.BorderLeft = BorderStyle.Thin;
                    style.BorderRight = BorderStyle.Thin;
                }

                // 粗體
                if (cellValue.FontBold)
                {
                    font.IsBold = true;
                    style.SetFont(font);
                }

                // 對齊
                switch (cellValue.Alignment)
                {
                    case "center":
                        style.Alignment = HorizontalAlignment.Center;
                        break;
                    case "right":
                        style.Alignment = HorizontalAlignment.Right;
                        break;
                    default:
                        style.Alignment = HorizontalAlignment.Left;
                        break;
                }
                // ✅ 加上這行：啟用文字自動換行
                // 自動換行
                style.WrapText = cellValue.WrapText;

                return style;
            }
        }

        /// <summary>
        /// Excel匯出 (前端自訂)
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        [Route("api/H5_CustomizeExcelExport")]
        public HttpResponseMessage Post([FromBody] ExcelFillRequest data)
        {
            var session = System.Web.HttpContext.Current.Session;
            
            try
            {
                if (session["Key"] != null)
                {
                    var sessionToken = "WeyuTech" + session["Key"];
                    var sessionExpiration = session["Expiration"];
                    WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));
                    SessionHelper.UpdateToken(_SessionToken);
                    ////  取得 HTTP Header 內的 Token
                    //var request = HttpContext.Current.Request;
                    //var tokenKey = request.Headers["TokenKey"];
                    //var TokenExpiry = request.Headers["TokenExpiry"];
                    //string FinalTokenKey = "WeyuTech" + tokenKey;

                    //WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(FinalTokenKey.ToString(), System.Convert.ToDateTime(TokenExpiry));

                    //_SessionToken.Key = _SessionToken.Key.Replace("WeyuTech", "");
                    if (data == null)
                    {
                        return Request.CreateResponse(HttpStatusCode.BadRequest, "請求內容為空");
                    }

                    #region Excel處理

                    // 定義根目錄
                    string excelRoot = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "excel");
                    string outputDir = Path.Combine(excelRoot, "output");

                    // 確保目錄存在（如果沒有就建立）
                    if (!Directory.Exists(excelRoot))
                        Directory.CreateDirectory(excelRoot);

                    if (!Directory.Exists(outputDir))
                        Directory.CreateDirectory(outputDir);

                    // 建立完整檔案路徑
                    string templatePath = Path.Combine(excelRoot, data.TemplateFile);
                    string outputPath = Path.Combine(outputDir, data.OutputFileName);

                    // 防呆：若範本不存在則跳錯
                    if (!File.Exists(templatePath))
                    {
                        //FileNotFoundException($"找不到範本檔案：{templatePath}");

                        var resultError = new
                        {
                            result = false,
                            msg = "不存在範本檔案,請通知相關單位處理",
                            TokenInfo = new
                            {
                                Expiration = _SessionToken.Expiration
                            }
                        };

                        //string jsonError = JsonConvert.SerializeObject(resultError);

                        //HttpResponseMessage httpResponseMessageH5Error = Request.CreateResponse(HttpStatusCode.OK);
                        //httpResponseMessageH5Error.Content = new StringContent(jsonError, System.Text.Encoding.UTF8, "application/json");
                        //return httpResponseMessageH5Error;
                        return Request.CreateResponse(HttpStatusCode.OK, resultError);
                    }

                    // 開啟範本
                    using (var fs = new FileStream(templatePath, FileMode.Open, FileAccess.Read))
                    {
                        IWorkbook workbook = new XSSFWorkbook(fs);

                        foreach (var sheetData in data.Sheets)
                        {
                            // 取得範本的來源工作表
                            //var sourceSheetIndex = workbook.GetSheetIndex("sample");
                            // 改為使用 JSON 傳入的範本工作表名稱
                            var sourceSheetIndex = workbook.GetSheetIndex(sheetData.TemplateSheetName);
                            //改成吃 SheetData.TemplateSheetName 的名稱
                            if (sourceSheetIndex == -1)
                            {
                                var resultError = new
                                {
                                    result = false,
                                    msg = "不存在sample 頁簽,請通知相關單位處理",
                                    TokenInfo = new
                                    {
                                        Expiration = _SessionToken.Expiration
                                    }
                                };

                                //string jsonError = JsonConvert.SerializeObject(resultError);

                                //HttpResponseMessage httpResponseMessageH5Error = Request.CreateResponse(HttpStatusCode.OK);
                                //httpResponseMessageH5Error.Content = new StringContent(jsonError, System.Text.Encoding.UTF8, "application/json");
                                //return httpResponseMessageH5Error;
                                return Request.CreateResponse(HttpStatusCode.OK, resultError);

                            }


                            // 複製範本頁面
                            var newSheetIndex = workbook.NumberOfSheets;
                            workbook.CloneSheet(sourceSheetIndex);
                            workbook.SetSheetName(newSheetIndex, sheetData.SheetName);

                            var sheet = workbook.GetSheet(sheetData.SheetName);

                            // 寫入儲存格資料與樣式
                            foreach (var entry in sheetData.Cells)
                            {
                                var cellRef = new CellReference(entry.Key);
                                var row = sheet.GetRow(cellRef.Row) ?? sheet.CreateRow(cellRef.Row);
                                var cell = row.GetCell(cellRef.Col) ?? row.CreateCell(cellRef.Col);

                                var cellValue = entry.Value;
                                cell.SetCellValue(cellValue.Value ?? "");

                                // 套用樣式（不再使用 StyleTemplate）
                                var style = ExcelStyleHelper.ApplyStyle(workbook, cellValue);
                                cell.CellStyle = style;
                            }

                            // 加入合併儲存格
                            if (sheetData.MergeCells != null)
                            {
                                foreach (var mergeRange in sheetData.MergeCells)
                                {
                                    var range = CellRangeAddress.ValueOf(mergeRange);
                                    // 避免重複加入相同的合併區域
                                    if (!IsMergedAlready(sheet, range))
                                    {
                                        sheet.AddMergedRegion(range);
                                    }
                                }
                            }
                        }

                        // 寫出成品
                        using (var outFs = new FileStream(outputPath, FileMode.Create, FileAccess.Write))
                        {
                            workbook.Write(outFs);
                        }
                    }

                    #endregion

                    //回傳資料格式
                    var result = new
                    {
                        result = true,
                        path = outputPath,
                        TokenInfo = new
                        {
                            Expiration = _SessionToken.Expiration
                        }
                    };


                    //string json = JsonConvert.SerializeObject(result);

                    //HttpResponseMessage httpResponseMessageH5 = Request.CreateResponse(HttpStatusCode.OK);
                    //httpResponseMessageH5.Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                    //return httpResponseMessageH5;
                    return Request.CreateResponse(HttpStatusCode.OK, result);


                }
                else
                {
                    throw new Exception("Token Verify Fail !");
                }
              

            }
            catch (Exception ex)
            {
                var result = new
                {
                    result = false,
                    Msg = ex.Message
                };
                //string json = JsonConvert.SerializeObject(result);

                //HttpResponseMessage httpResponseMessageH5 = Request.CreateResponse(HttpStatusCode.OK);
                //httpResponseMessageH5.Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                //return httpResponseMessageH5;
                return Request.CreateResponse(HttpStatusCode.OK, result);
                //throw;
            }
        }


        public class Exportxlsx
        {
            public string FileName { get; set; }
            public string ColName { get; set; }
            public string SQL { get; set; }
            public string mode { get; set; }
            public string CheckCol { get; set; }
            public string SID { get; set; }
            public string customNumericFieldsIndex { get; set; }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        [Route("api/H5_GridExcelExport")]
        public HttpResponseMessage Post([FromBody] Exportxlsx data)
        {

            //log4net.Config.XmlConfigurator.ConfigureAndWatch(new System.IO.FileInfo(Log4ConfigFilePath));
            //log = LogManager.GetLogger(typeof(WeyuLoginController));
            var session = System.Web.HttpContext.Current.Session;

            try
            {
                //IEnumerable<string> TokenKeyheaderValues = Request.Headers.GetValues("TokenKey");
                //string TokenKey = TokenKeyheaderValues.First();

                if (session["Key"] != null)
                {
                    var sessionToken = "WeyuTech" + session["Key"];
                    var sessionExpiration = session["Expiration"];
                    WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));
                    SessionHelper.UpdateToken(_SessionToken);
                    string strFilePath;
                    string DateNow;
                    Dictionary<string, object> dataform;

                    string excelFormat = ConfigurationManager.AppSettings["ExcelFormat"]; //判斷副檔名 [xlsx/xls/csv]
                    string excelSplitKey = ConfigurationManager.AppSettings["ExcelSplitKey"]; //excel內容的 分割符號
                    string FileExten = ""; //產生檔案用的副檔名

                    string cnstr = ConfigurationManager.ConnectionStrings["WeYuConnection"].ConnectionString;
                    string Return_Path = "";

                    #region excel
                    if (excelFormat.ToUpper() == "XLSX")
                    {
                        //使用 EPPlus
                        FileExten = ".xlsx";
                        using (SqlConnection sqlConnection = new SqlConnection(cnstr))
                        {
                            dataform = new Dictionary<string, object>();
                            dataform["ColName"] = data.ColName;
                            dataform["SQL"] = data.SQL;
                            dataform["FileName"] = data.FileName;
                            dataform["CheckCol"] = data.CheckCol;
                            dataform["mode"] = data.mode;
                            dataform["SID"] = data.SID;//2023-11-28 新增 後端判斷 SQL欄位型態
                            var result = sqlConnection.Query(dataform["SQL"].ToString()).ToList();

                            DateNow = DateTime.Now.ToString("yyyyMMddHHmm");
                            strFilePath = HttpContext.Current.Server.MapPath("~/") + "Excel\\" + DateNow + dataform["FileName"] + FileExten;

                            List<string> dataList = new List<string>();
                            string exceldata = "";

                            //2023-11-28 新增 後端判斷 SQL欄位型態
                            #region 儲存資料庫欄位定義為 日期的陣列
                            List<string> DATETIME_LIST = new List<string>();
                            //可能是複合SQL 所以沒撈到 改判斷 智能查詢 or 主檔維護 欄位
                            if (dataform["mode"].ToString() == "MasterMaintain")
                            {
                                //抓主檔維護
                                string MQsql = $@"SELECT COL_NAME,FIELD_TYPE
                                    FROM BAS_MASTER_MAINTAIN_COLUMNS
                                    WHERE MM_SID = '{dataform["SID"]}'";
                                var MQresult = sqlConnection.Query(MQsql).ToList();

                                for (int i = 0; i < MQresult.Count; i++)
                                {
                                    if (((string)MQresult[i].FIELD_TYPE).ToUpper() == "DATETIME" || ((string)MQresult[i].FIELD_TYPE).ToUpper() == "DATE")
                                    {
                                        DATETIME_LIST.Add(MQresult[i].COL_NAME);
                                    }
                                }
                            }
                            else
                            {
                                //抓智能查詢
                                string MQsql = $@"SELECT FIELDNAME,FIELDDATATYPE
                                    FROM BAS_QUERYREPORT_GRID
                                    WHERE QR_SID = '{dataform["SID"]}'";
                                var MQresult = sqlConnection.Query(MQsql).ToList();

                                for (int i = 0; i < MQresult.Count; i++)
                                {
                                    if (((string)MQresult[i].FIELDDATATYPE).ToUpper() == "SYSTEM.DATETIME" || ((string)MQresult[i].FIELDDATATYPE).ToUpper() == "SYSTEM.DATE")
                                    {
                                        DATETIME_LIST.Add(MQresult[i].FIELDNAME);
                                    }
                                }
                            }
                            #endregion

                            //2023-11-28 新增 後端判斷 SQL欄位型態
                            #region 儲存資料庫欄位定義為 數字的陣列
                            List<string> NUMBER_LIST = new List<string>();
                            //可能是複合SQL 所以沒撈到 改判斷 智能查詢 or 主檔維護 欄位
                            if (dataform["mode"].ToString() == "MasterMaintain")
                            {
                                //抓主檔維護
                                string MQsql = $@"SELECT COL_NAME,FIELD_TYPE
                                    FROM BAS_MASTER_MAINTAIN_COLUMNS
                                    WHERE MM_SID = '{dataform["SID"]}'";
                                var MQresult = sqlConnection.Query(MQsql).ToList();

                                for (int i = 0; i < MQresult.Count; i++)
                                {
                                    if (((string)MQresult[i].FIELD_TYPE).ToUpper() == "DECIMAL" || ((string)MQresult[i].FIELD_TYPE).ToUpper() == "INT" || ((string)MQresult[i].FIELD_TYPE).ToUpper() == "SMALLINT" || ((string)MQresult[i].FIELD_TYPE).ToUpper() == "NUMERIC")
                                    {
                                        NUMBER_LIST.Add(MQresult[i].COL_NAME);
                                    }
                                }
                            }
                            else
                            {
                                //抓智能查詢
                                string MQsql = $@"SELECT FIELDNAME,FIELDDATATYPE
                                    FROM BAS_QUERYREPORT_GRID
                                    WHERE QR_SID = '{dataform["SID"]}'";
                                var MQresult = sqlConnection.Query(MQsql).ToList();

                                for (int i = 0; i < MQresult.Count; i++)
                                {
                                    if (((string)MQresult[i].FIELDDATATYPE).ToUpper() == "SYSTEM.DOUBLE" || ((string)MQresult[i].FIELDDATATYPE).ToUpper() == "SYSTEM.DECIMAL" || ((string)MQresult[i].FIELDDATATYPE).ToUpper() == "SYSTEM.INT64" || ((string)MQresult[i].FIELDDATATYPE).ToUpper() == "SYSTEM.INT32" || ((string)MQresult[i].FIELDDATATYPE).ToUpper() == "SYSTEM.INT16")
                                    {
                                        NUMBER_LIST.Add(MQresult[i].FIELDNAME);
                                    }
                                }
                            }
                            #endregion

                            for (int i = 0; i < result.Count; i++)
                            {
                                exceldata = "";
                                foreach (KeyValuePair<string, object> k in result[i])
                                {
                                    if (dataform["mode"].ToString() == "MasterMaintain") //主檔維護
                                    {
                                        if (k.Value != null && k.Value.ToString() != "" && k.Value.ToString() != "NULL")
                                        {
                                            exceldata += k.Value.ToString() + excelSplitKey;
                                        }
                                        else
                                        {
                                            exceldata += " " + excelSplitKey;
                                        }
                                    }
                                    else //智能查詢
                                    {
                                        if (dataform["CheckCol"].ToString().Split(',').Contains(k.Key) == true)
                                        {
                                            if (k.Value != null && k.Value.ToString() != "" && k.Value.ToString() != "NULL")
                                            {
                                                exceldata += k.Value.ToString() + excelSplitKey;
                                            }
                                            else
                                            {
                                                exceldata += " " + excelSplitKey;
                                            }
                                        }
                                    }
                                }
                                dataList.Add(exceldata);
                            }

                            // 移除数据行末尾的 分割符號
                            for (int i = 0; i < dataList.Count; i++)
                            {
                                if (dataList[i].EndsWith(excelSplitKey))
                                {
                                    dataList[i] = dataList[i].Substring(0, dataList[i].Length - excelSplitKey.Length);
                                }
                            }

                            using (var package = new ExcelPackage())
                            {
                                // 添加第一个Sheet

                                //此Sheet的名稱
                                var worksheet1 = package.Workbook.Worksheets.Add(DateNow + dataform["FileName"].ToString());

                                //指定文字 , 第一順位 新細明體 , 第二順位 (以防未安裝)
                                worksheet1.Cells.Style.Font.Name = "新細明體, Arial";

                                //表頭
                                string[] titleArray = dataform["ColName"].ToString().Split(',');

                                for (int i = 0; i < titleArray.Length; i++)
                                {
                                    //char columnChar = (char)('A' + i);
                                    //string cellReference = $"{columnChar}1";

                                    // 計算列標識
                                    string columnLetter = GetExcelColumnLetter(i + 1); // +1 是因為Excel從1開始計數

                                    string cellReference = $"{columnLetter}1";

                                    worksheet1.Cells[cellReference].Value = titleArray[i];
                                }

                                var inttypeList = data.customNumericFieldsIndex;

                                //2023-11-29 新增 後端判斷 SQL欄位型態
                                #region 儲存對應index

                                List<int> Number_index = new List<int>();
                                List<int> Time_index = new List<int>();

                                if (NUMBER_LIST.Count > 0)
                                {
                                    for (int i = 0; i < NUMBER_LIST.Count; i++)
                                    {
                                        try
                                        {
                                            //int resultindex = dataform["CheckCol"].ToString().Split(',').IndexOf(NUMBER_LIST[i]);
                                            string[] checkCols = dataform["CheckCol"].ToString().Split(',');
                                            int resultIndex = Array.IndexOf(checkCols, NUMBER_LIST[i]);

                                            Number_index.Add(resultIndex);
                                        }
                                        catch (Exception)
                                        {
                                            //沒對到就換下一個
                                            //throw;
                                        }
                                    }
                                }
                                if (DATETIME_LIST.Count > 0)
                                {
                                    for (int i = 0; i < DATETIME_LIST.Count; i++)
                                    {
                                        try
                                        {
                                            //int resultindex = dataform["CheckCol"].ToString().Split(',').IndexOf(DATETIME_LIST[i]);
                                            string[] checkCols = dataform["CheckCol"].ToString().Split(',');
                                            int resultIndex = Array.IndexOf(checkCols, NUMBER_LIST[i]);

                                            Time_index.Add(resultIndex);
                                        }
                                        catch (Exception)
                                        {
                                            //沒對到就換下一個
                                            //throw;
                                        }
                                    }
                                }

                                #endregion

                                //內容
                                for (int rowIndex = 0; rowIndex < dataList.Count; rowIndex++)
                                {
                                    var rowData = dataList[rowIndex].Split(excelSplitKey[0]);
                                    for (int columnIndex = 0; columnIndex < rowData.Length; columnIndex++)
                                    {
                                        //char columnChar = (char)('A' + columnIndex);
                                        //string cellReference = $"{columnChar}{rowIndex + 2}"; // 行索引需要加2，因为标题占了第1行
                                        string columnLetter = GetExcelColumnLetter(columnIndex + 1); // +1 是因為Excel從1開始計數

                                        string cellReference = $"{columnLetter}{rowIndex + 2}";

                                        //worksheet1.Cells[cellReference].Value = rowData[columnIndex];
                                        if (inttypeList != null)
                                        {
                                            //根據前端傳來index 轉double
                                            if (inttypeList.Contains("[" + columnIndex.ToString() + "]"))
                                            {
                                                double quantity;
                                                if (double.TryParse(rowData[columnIndex], out quantity))
                                                {
                                                    worksheet1.Cells[cellReference].Value = quantity;
                                                }
                                                else
                                                {
                                                    worksheet1.Cells[cellReference].Value = rowData[columnIndex];
                                                }
                                            }
                                            else
                                            {
                                                worksheet1.Cells[cellReference].Value = rowData[columnIndex];
                                            }
                                        }
                                        //2023-11-29 新增 後端判斷 SQL欄位型態
                                        else if (Number_index.Count > 0 || Time_index.Count > 0)
                                        {
                                            bool status = true;

                                            if (Number_index.Count > 0)
                                            {
                                                for (int i = 0; i < Number_index.Count; i++)
                                                {
                                                    if (Number_index[i] == columnIndex)
                                                    {
                                                        status = false;
                                                        double quantity;
                                                        if (double.TryParse(rowData[columnIndex], out quantity))
                                                        {
                                                            worksheet1.Cells[cellReference].Value = quantity;
                                                        }
                                                    }
                                                }
                                                if (status)
                                                {
                                                    //預設 字串
                                                    worksheet1.Cells[cellReference].Value = rowData[columnIndex];
                                                }
                                            }
                                            if (Time_index.Count > 0)
                                            {

                                                for (int i = 0; i < Time_index.Count; i++)
                                                {
                                                    if (Time_index[i] == columnIndex)
                                                    {
                                                        status = false;
                                                        // 嘗試將字串轉換為 DateTime
                                                        if (DateTime.TryParse(rowData[columnIndex], out DateTime dateValue))
                                                        {
                                                            // 轉日期
                                                            worksheet1.Cells[cellReference].Style.Numberformat.Format = "yyyy-MM-dd HH:mm:ss";
                                                            worksheet1.Cells[cellReference].Value = dateValue;
                                                        }
                                                        else
                                                        {
                                                            // 無法解析為日期，保持原樣
                                                            worksheet1.Cells[cellReference].Value = rowData[columnIndex];
                                                        }
                                                    }
                                                }
                                                if (status)
                                                {
                                                    //預設 字串
                                                    worksheet1.Cells[cellReference].Value = rowData[columnIndex];
                                                }
                                            }
                                            else
                                            {
                                                //預設 全字串
                                                worksheet1.Cells[cellReference].Value = rowData[columnIndex];
                                            }
                                        }
                                        else
                                        {
                                            //前端沒傳 預設 全字串
                                            worksheet1.Cells[cellReference].Value = rowData[columnIndex];
                                        }
                                    }
                                }

                                worksheet1.Cells.AutoFitColumns();

                                byte[] excelBytes = package.GetAsByteArray();

                                //產生檔案
                                //package.SaveAs(new FileInfo(strFilePath)); //預設UTF-8  最新版(商業版)適用
                                File.WriteAllBytes(strFilePath, excelBytes); //4.5.3.3 免費版 https://ithelp.ithome.com.tw/articles/10310646

                                //iContext.Response.Write(DateNow + dataform["FileName"].ToString() + ".xlsx");
                                Return_Path = DateNow + dataform["FileName"].ToString() + ".xlsx";
                            }
                        }
                    }
                    else if (excelFormat.ToUpper() == "XLS")
                    {
                        //使用 NPOI
                        FileExten = ".xls";
                        using (SqlConnection sqlConnection = new SqlConnection(cnstr))
                        {
                            dataform = new Dictionary<string, object>();
                            dataform["ColName"] = data.ColName;
                            dataform["SQL"] = data.SQL;
                            dataform["FileName"] = data.FileName;
                            dataform["CheckCol"] = data.CheckCol;
                            dataform["mode"] = data.mode;
                            dataform["SID"] = data.SID;//2023-11-28 新增 後端判斷 SQL欄位型態
                            var result = sqlConnection.Query(dataform["SQL"].ToString()).ToList();

                            DateNow = DateTime.Now.ToString("yyyyMMddHHmm");
                            strFilePath = HttpContext.Current.Server.MapPath("~/") + "Excel\\" + DateNow + dataform["FileName"] + FileExten;

                            List<string> dataList = new List<string>();
                            string exceldata = "";

                            //2023-11-28 新增 後端判斷 SQL欄位型態
                            #region 儲存資料庫欄位定義為 日期的陣列
                            List<string> DATETIME_LIST = new List<string>();
                            //可能是複合SQL 所以沒撈到 改判斷 智能查詢 or 主檔維護 欄位
                            if (dataform["mode"].ToString() == "MasterMaintain")
                            {
                                //抓主檔維護
                                string MQsql = $@"SELECT COL_NAME,FIELD_TYPE
                                    FROM BAS_MASTER_MAINTAIN_COLUMNS
                                    WHERE MM_SID = '{dataform["SID"]}'";
                                var MQresult = sqlConnection.Query(MQsql).ToList();

                                for (int i = 0; i < MQresult.Count; i++)
                                {
                                    if (((string)MQresult[i].FIELD_TYPE).ToUpper() == "DATETIME" || ((string)MQresult[i].FIELD_TYPE).ToUpper() == "DATE")
                                    {
                                        DATETIME_LIST.Add(MQresult[i].COL_NAME);
                                    }
                                }
                            }
                            else
                            {
                                //抓智能查詢
                                string MQsql = $@"SELECT FIELDNAME,FIELDDATATYPE
                                    FROM BAS_QUERYREPORT_GRID
                                    WHERE QR_SID = '{dataform["SID"]}'";
                                var MQresult = sqlConnection.Query(MQsql).ToList();

                                for (int i = 0; i < MQresult.Count; i++)
                                {
                                    if (((string)MQresult[i].FIELDDATATYPE).ToUpper() == "SYSTEM.DATETIME" || ((string)MQresult[i].FIELDDATATYPE).ToUpper() == "SYSTEM.DATE")
                                    {
                                        DATETIME_LIST.Add(MQresult[i].FIELDNAME);
                                    }
                                }
                            }
                            #endregion

                            //2023-11-28 新增 後端判斷 SQL欄位型態
                            #region 儲存資料庫欄位定義為 數字的陣列
                            List<string> NUMBER_LIST = new List<string>();
                            //可能是複合SQL 所以沒撈到 改判斷 智能查詢 or 主檔維護 欄位
                            if (dataform["mode"].ToString() == "MasterMaintain")
                            {
                                //抓主檔維護
                                string MQsql = $@"SELECT COL_NAME,FIELD_TYPE
                                    FROM BAS_MASTER_MAINTAIN_COLUMNS
                                    WHERE MM_SID = '{dataform["SID"]}'";
                                var MQresult = sqlConnection.Query(MQsql).ToList();

                                for (int i = 0; i < MQresult.Count; i++)
                                {
                                    if (((string)MQresult[i].FIELD_TYPE).ToUpper() == "DECIMAL" || ((string)MQresult[i].FIELD_TYPE).ToUpper() == "INT" || ((string)MQresult[i].FIELD_TYPE).ToUpper() == "SMALLINT" || ((string)MQresult[i].FIELD_TYPE).ToUpper() == "NUMERIC")
                                    {
                                        NUMBER_LIST.Add(MQresult[i].COL_NAME);
                                    }
                                }
                            }
                            else
                            {
                                //抓智能查詢
                                string MQsql = $@"SELECT FIELDNAME,FIELDDATATYPE
                                    FROM BAS_QUERYREPORT_GRID
                                    WHERE QR_SID = '{dataform["SID"]}'";
                                var MQresult = sqlConnection.Query(MQsql).ToList();

                                for (int i = 0; i < MQresult.Count; i++)
                                {
                                    if (((string)MQresult[i].FIELDDATATYPE).ToUpper() == "SYSTEM.DOUBLE" || ((string)MQresult[i].FIELDDATATYPE).ToUpper() == "SYSTEM.DECIMAL" || ((string)MQresult[i].FIELDDATATYPE).ToUpper() == "SYSTEM.INT64" || ((string)MQresult[i].FIELDDATATYPE).ToUpper() == "SYSTEM.INT32" || ((string)MQresult[i].FIELDDATATYPE).ToUpper() == "SYSTEM.INT16")
                                    {
                                        NUMBER_LIST.Add(MQresult[i].FIELDNAME);
                                    }
                                }
                            }
                            #endregion


                            for (int i = 0; i < result.Count; i++)
                            {

                                exceldata = "";
                                foreach (KeyValuePair<string, object> k in result[i])
                                {
                                    if (dataform["mode"].ToString() == "MasterMaintain") //主檔維護
                                    {
                                        if (k.Value != null && k.Value.ToString() != "" && k.Value.ToString() != "NULL")
                                        {
                                            exceldata += k.Value.ToString() + excelSplitKey;
                                        }
                                        else
                                        {
                                            exceldata += " " + excelSplitKey;
                                        }
                                    }
                                    else //智能查詢
                                    {
                                        if (dataform["CheckCol"].ToString().Split(',').Contains(k.Key) == true)
                                        {
                                            if (k.Value != null && k.Value.ToString() != "" && k.Value.ToString() != "NULL")
                                            {
                                                exceldata += k.Value.ToString() + excelSplitKey;
                                            }
                                            else
                                            {
                                                exceldata += " " + excelSplitKey;
                                            }
                                        }
                                    }
                                }
                                dataList.Add(exceldata);
                            }

                            // 移除数据行末尾的 分割符號
                            for (int i = 0; i < dataList.Count; i++)
                            {
                                if (dataList[i].EndsWith(excelSplitKey))
                                {
                                    dataList[i] = dataList[i].Substring(0, dataList[i].Length - excelSplitKey.Length);

                                }
                            }

                            // 创建一个新的工作簿
                            IWorkbook workbook = new HSSFWorkbook();
                            ISheet sheet = workbook.CreateSheet(DateNow + dataform["FileName"].ToString());

                            //指定用新細明體
                            ICellStyle cellStyle = workbook.CreateCellStyle();
                            IFont font = workbook.CreateFont();
                            font.FontName = "新細明體";
                            cellStyle.SetFont(font);

                            //表頭
                            string[] titleArray = dataform["ColName"].ToString().Split(',');

                            // 添加标题行
                            IRow headerRow = sheet.CreateRow(0);
                            for (int i = 0; i < titleArray.Length; i++)
                            {
                                ICell cell = headerRow.CreateCell(i);
                                cell.SetCellValue(titleArray[i]);
                                cell.CellStyle = cellStyle;  // 需要吃字型添加的行 1
                            }

                            var inttypeList = data.customNumericFieldsIndex;

                            //2023-11-29 新增 後端判斷 SQL欄位型態
                            #region 儲存對應index

                            List<int> Number_index = new List<int>();
                            List<int> Time_index = new List<int>();

                            if (NUMBER_LIST.Count > 0)
                            {
                                for (int i = 0; i < NUMBER_LIST.Count; i++)
                                {
                                    try
                                    {
                                        //int resultindex = dataform["CheckCol"].ToString().Split(',').IndexOf(NUMBER_LIST[i]);
                                        string[] checkCols = dataform["CheckCol"].ToString().Split(',');
                                        int resultIndex = Array.IndexOf(checkCols, NUMBER_LIST[i]);

                                        Number_index.Add(resultIndex);
                                    }
                                    catch (Exception)
                                    {
                                        //沒對到就換下一個
                                        //throw;
                                    }
                                }
                            }
                            if (DATETIME_LIST.Count > 0)
                            {
                                for (int i = 0; i < DATETIME_LIST.Count; i++)
                                {
                                    try
                                    {
                                        //int resultindex = dataform["CheckCol"].ToString().Split(',').IndexOf(DATETIME_LIST[i]);
                                        string[] checkCols = dataform["CheckCol"].ToString().Split(',');
                                        int resultIndex = Array.IndexOf(checkCols, NUMBER_LIST[i]);

                                        Time_index.Add(resultIndex);
                                    }
                                    catch (Exception)
                                    {
                                        //沒對到就換下一個
                                        //throw;
                                    }
                                }
                            }

                            #endregion

                            // 添加数据行
                            for (int rowIndex = 0; rowIndex < dataList.Count; rowIndex++)
                            {
                                IRow dataRow = sheet.CreateRow(rowIndex + 1);
                                var rowData = dataList[rowIndex].Split(excelSplitKey[0]);
                                for (int columnIndex = 0; columnIndex < rowData.Length; columnIndex++)
                                {
                                    ICell cell = dataRow.CreateCell(columnIndex);
                                    //cell.SetCellValue(rowData[columnIndex]);
                                    if (inttypeList != null)
                                    {
                                        // 设置为数字格式
                                        if (inttypeList.Contains("[" + columnIndex.ToString() + "]"))
                                        {
                                            // 将设置为公式，以将文本转换为数字
                                            //轉失敗 當成字串
                                            try
                                            {
                                                cell.SetCellFormula($"VALUE({rowData[columnIndex]})");
                                            }
                                            catch (Exception)
                                            {
                                                cell.SetCellValue(rowData[columnIndex]);
                                                //throw;
                                            }
                                        }
                                        else
                                        {
                                            cell.SetCellValue(rowData[columnIndex]);
                                        }
                                    }
                                    //2023-11-29 新增 後端判斷 SQL欄位型態
                                    else if (Number_index.Count > 0 || Time_index.Count > 0)
                                    {
                                        bool status = true;

                                        if (Number_index.Count > 0)
                                        {
                                            for (int i = 0; i < Number_index.Count; i++)
                                            {
                                                if (Number_index[i] == columnIndex)
                                                {
                                                    status = false;
                                                    cell.SetCellFormula($"VALUE({rowData[columnIndex]})");
                                                }
                                            }
                                            if (status)
                                            {
                                                //預設 字串
                                                cell.SetCellValue(rowData[columnIndex]);
                                            }
                                        }
                                        if (Time_index.Count > 0)
                                        {

                                            for (int i = 0; i < Time_index.Count; i++)
                                            {
                                                if (Time_index[i] == columnIndex)
                                                {
                                                    status = false;
                                                    try
                                                    {
                                                        // 轉日期
                                                        DateTime dt = DateTime.Parse(rowData[columnIndex]);
                                                        cell.SetCellValue(dt.ToString("yyyy-MM-dd HH:mm:ss"));
                                                    }
                                                    catch (Exception)
                                                    {
                                                        cell.SetCellValue(rowData[columnIndex]);
                                                        //throw;
                                                    }
                                                }
                                            }
                                            if (status)
                                            {
                                                //預設 字串
                                                cell.SetCellValue(rowData[columnIndex]);
                                            }
                                        }
                                        else
                                        {
                                            //預設 全字串
                                            cell.SetCellValue(rowData[columnIndex]);
                                        }
                                    }
                                    else
                                    {
                                        cell.SetCellValue(rowData[columnIndex]);//沒傳 預設 全字串
                                    }
                                    cell.CellStyle = cellStyle;  // 需要添加的行 3
                                }
                            }

                            using (FileStream fs = new FileStream(strFilePath, FileMode.Create, FileAccess.Write))
                            {
                                workbook.Write(fs);
                            }

                            //iContext.Response.Write(DateNow + dataform["FileName"].ToString() + ".xls");
                            Return_Path = DateNow + dataform["FileName"].ToString() + ".xls";
                        }
                    }
                    #endregion
                    string[] TokenData = SEC_H5.VeriftyAndGetNewToken(sessionToken);

                    var data1 = new
                    {
                        result = true,
                        PATH = Return_Path,
                        TokenInfo = new[] // 新增 TOKENINFO 資料
                            {
                            new
                            {                              
                                TokenExpiry = TokenData[2].ToString()
                            }
                        }
                    };

                    string json = JsonConvert.SerializeObject(data1);

                    HttpResponseMessage httpResponseMessage = Request.CreateResponse(HttpStatusCode.OK);
                    httpResponseMessage.Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                    return httpResponseMessage;

                }
                else
                {
                    throw new Exception("Token Verify Fail !");
                }
            }
            catch (Exception Exc)
            {
                HttpResponseMessage httpResponseMessage = Request.CreateResponse(HttpStatusCode.Forbidden);
                httpResponseMessage.Content = new StringContent(Exc.Message, System.Text.Encoding.UTF8, "application/json");
                return httpResponseMessage;
            }
        }

        // 轉換列數字為Excel列標識 (A, B, C, ..., Z, AA, AB, AC, ...)
        private string GetExcelColumnLetter(int columnNumber)
        {
            int dividend = columnNumber;
            string columnLetter = "";

            while (dividend > 0)
            {
                int modulo = (dividend - 1) % 26;
                columnLetter = Convert.ToChar(65 + modulo) + columnLetter;
                dividend = (dividend - modulo) / 26;
            }

            return columnLetter;
        }

        // 方法：從資料庫獲取 DataTable
        public static DataTable GetDataTable(string connectionString, string sqlQuery)
        {
            // 創建 DataTable 實例
            DataTable dataTable = new DataTable();

            // 使用 SqlConnection 開啟資料庫連接
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                // 使用 SqlCommand 執行查詢
                using (SqlCommand command = new SqlCommand(sqlQuery, connection))
                {
                    // 使用 SqlDataAdapter 填充 DataTable
                    using (SqlDataAdapter adapter = new SqlDataAdapter(command))
                    {
                        connection.Open(); // 開啟連接
                        adapter.Fill(dataTable); // 將資料填充到 DataTable 中
                    }
                }
            }

            // 回傳填充後的 DataTable
            return dataTable;
        }


        // 對應一列資料（注意：WeeklyPlanFG 以「字串日期」回傳）
        public class ScheduleRow
        {
            public string Groupe { get; set; }
            public string WO { get; set; }
            public string LotNo { get; set; }
            public string Material { get; set; }
            public string PO { get; set; }
            public double? RemainCS { get; set; }
            public double? TotalSheets { get; set; }
            /// <summary>
            /// 針對 Excel 欄位「Weekly Plan FG」：若是日期或能解析為日期，輸出 yyyy-MM-dd；否則回傳原文字
            /// </summary>
            public string WeeklyPlanFG { get; set; }
        }

        #region old - 口罩上傳
        //[Route("api/H5_UploadScheduleXlsx")]
        //[HttpPost]
        //public HttpResponseMessage PostUploadScheduleXlsx()
        //{
        //    var session = System.Web.HttpContext.Current.Session;

        //    try
        //    {
        //        // A. Session 驗證
        //        if (session?["Key"] == null)
        //        {
        //            var resp = new { result = false, Msg = "Token Verify Fail !", SID = "" };
        //            return Request.CreateResponse(HttpStatusCode.Unauthorized, resp);
        //        }

        //        var sessionToken = "WeyuTech" + session["Key"];
        //        var sessionExpiration = session["Expiration"];
        //        WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));


        //        // B. 必須是 multipart/form-data
        //        if (!Request.Content.IsMimeMultipartContent())
        //            return Request.CreateResponse(HttpStatusCode.BadRequest, new { result = false, msg = "Content-Type 必須為 multipart/form-data" });

        //        // C. 讀取檔案（維持非 async 風格）
        //        var provider = new MultipartMemoryStreamProvider();
        //        Request.Content.ReadAsMultipartAsync(provider).Wait();

        //        var fileContent = provider.Contents.FirstOrDefault(c =>
        //            c.Headers.ContentDisposition != null &&
        //            !string.IsNullOrEmpty(c.Headers.ContentDisposition.FileName));

        //        if (fileContent == null)
        //            return Request.CreateResponse(HttpStatusCode.BadRequest, new { result = false, msg = "找不到檔案欄位（請用 form-data 欄位名 file）" });

        //        var originalFileName = fileContent.Headers.ContentDisposition.FileName.Trim('\"');
        //        var ext = Path.GetExtension(originalFileName)?.ToLowerInvariant();
        //        if (ext != ".xlsx")
        //            return Request.CreateResponse(HttpStatusCode.BadRequest, new { result = false, msg = "只允許 .xlsx 檔案" });

        //        // D. 儲存原檔到 ~/excel/uploads/
        //        string root = HttpContext.Current.Server.MapPath("~/");
        //        string uploadDir = Path.Combine(root, "excel", "uploads");
        //        if (!Directory.Exists(uploadDir)) Directory.CreateDirectory(uploadDir);

        //        string stampedName = $"{DateTime.Now:yyyyMMdd_HHmmssfff}_{Path.GetFileNameWithoutExtension(originalFileName)}{ext}";
        //        string savedPath = Path.Combine(uploadDir, stampedName);

        //        var fileBytes = fileContent.ReadAsByteArrayAsync().Result;
        //        File.WriteAllBytes(savedPath, fileBytes);

        //        // E. 解析（EPPlus 4：無 LicenseContext）
        //        var rows = new List<ScheduleRow>();
        //        var columnsDetected = new List<string>();

        //        using (var package = new ExcelPackage(new FileInfo(savedPath)))
        //        {
        //            var ws = package.Workbook.Worksheets.FirstOrDefault();
        //            if (ws == null)
        //                return Request.CreateResponse(HttpStatusCode.BadRequest, new { result = false, msg = "Excel 內沒有任何工作表" });

        //            int startRow = 2; // 第 1 列為標頭
        //            int startCol = ws.Dimension.Start.Column;
        //            int endCol = ws.Dimension.End.Column;
        //            int endRow = ws.Dimension.End.Row;

        //            // 1) 建立「標題字串 -> 欄位索引」對照
        //            var headerToIndex = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
        //            for (int c = startCol; c <= endCol; c++)
        //            {
        //                var header = (ws.Cells[1, c].Text ?? "").Trim();
        //                if (!string.IsNullOrEmpty(header) && !headerToIndex.ContainsKey(header))
        //                {
        //                    headerToIndex[header] = c;
        //                    columnsDetected.Add(header);
        //                }
        //            }

        //            // 2) 欄位標頭映射（可自行增減別名）
        //            var map = new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase)
        //    {
        //        { "Groupe",         new[] { "Groupe" } },
        //        { "WO",             new[] { "WO" } },
        //        { "LotNo",          new[] { "Lot.no", "LotNo", "Lot", "Lot No", "Lot Number" } },
        //        { "Material",       new[] { "Material" } },
        //        { "PO",             new[] { "PO", "Purchase Order" } },
        //        { "RemainCS",       new[] { "เหลือ(CS)", "Remain(CS)", "Remain CS", "Remaining(CS)" } },
        //        { "TotalSheets",    new[] { "Total sheets", "Total Sheets", "Total Sheet" } },
        //        // 這欄是你說的日期（可能來自 VLOOKUP 公式）
        //        { "WeeklyPlanFG",   new[] { "Weekly Plan FG", "Weekly Plan", "Plan FG" } },
        //    };

        //            Func<string, int?> idx = (logicalName) =>
        //            {
        //                if (!map.ContainsKey(logicalName)) return null;
        //                foreach (var alias in map[logicalName])
        //                {
        //                    int col;
        //                    if (headerToIndex.TryGetValue(alias, out col)) return col;
        //                }
        //                return null;
        //            };

        //            // 3) 必填標頭（缺少就退回錯誤）
        //            var required = new[] { "WO", "LotNo", "Material" };
        //            var missing = required.Where(k => idx(k) == null).ToList();
        //            if (missing.Any())
        //            {
        //                return Request.CreateResponse(HttpStatusCode.BadRequest, new
        //                {
        //                    result = false,
        //                    msg = $"缺少必要欄位標頭：{string.Join(", ", missing)}",
        //                    columnsDetected
        //                });
        //            }

        //            // 共用取值工具 ------------------------------------
        //            string GetText(int? col, int row)
        //            {
        //                if (!col.HasValue) return "";
        //                var cell = ws.Cells[row, col.Value];
        //                return (cell.Text ?? "").Trim();   // 純文字
        //            }

        //            // 讀公式或一般儲存格的「資料值」
        //            object GetRaw(int? col, int row)
        //            {
        //                if (!col.HasValue) return null;
        //                var cell = ws.Cells[row, col.Value];
        //                return cell.Value;               // 會是上次存檔的計算結果
        //            }

        //            double? GetDouble(int? col, int row)
        //            {
        //                var raw = GetRaw(col, row);
        //                if (raw == null) return null;

        //                double d;
        //                // 優先用 Value 嘗試
        //                if (raw is double d1) return d1;
        //                if (raw is float f1) return (double)f1;
        //                if (raw is decimal m1) return (double)m1;
        //                if (double.TryParse(raw.ToString(), out d)) return d;
        //                return null;
        //            }

        //            // ✅ 專為 Weekly Plan FG：讀出「yyyy-MM-dd」或原字串
        //            string GetDateString(int? col, int row)
        //            {
        //                var cell = (col.HasValue ? ws.Cells[row, col.Value] : null);
        //                if (cell == null) return "";

        //                // 先看 Value（可能是 DateTime 或 Excel 日期序號 double）
        //                var raw = cell.Value;

        //                if (raw is DateTime dt)
        //                    return dt.ToString("yyyy-MM-dd");

        //                // 有些 Excel 會把日期存成 double（序列值）
        //                if (raw is double serial)
        //                {
        //                    try
        //                    {
        //                        // Excel 序號轉 DateTime（EPPlus 4 沒現成轉換，自己推）
        //                        // 以 1899-12-30 為起點（Excel 1900 date system）
        //                        var baseDate = new DateTime(1899, 12, 30);
        //                        var converted = baseDate.AddDays(serial);
        //                        return converted.ToString("yyyy-MM-dd");
        //                    }
        //                    catch { /* 忽略錯誤，往下嘗試 Text 解析 */ }
        //                }

        //                // 再嘗試 Text（可能是 "18-Aug-25" 這類格式）
        //                var t = (cell.Text ?? "").Trim();
        //                if (!string.IsNullOrEmpty(t))
        //                {
        //                    DateTime dt2;
        //                    if (DateTime.TryParse(t, out dt2))
        //                        return dt2.ToString("yyyy-MM-dd");
        //                    return t; // 不是日期就回原文字
        //                }

        //                return "";
        //            }
        //            // -------------------------------------------------

        //            // 4) 逐列讀取
        //            for (int r = startRow; r <= endRow; r++)
        //            {
        //                var wo = GetText(idx("WO"), r);
        //                var lot = GetText(idx("LotNo"), r);
        //                var material = GetText(idx("Material"), r);

        //                // 空白列略過
        //                if (string.IsNullOrWhiteSpace(wo) &&
        //                    string.IsNullOrWhiteSpace(lot) &&
        //                    string.IsNullOrWhiteSpace(material))
        //                    continue;

        //                var data = new ScheduleRow
        //                {
        //                    Groupe = GetText(idx("Groupe"), r),
        //                    WO = wo,
        //                    LotNo = lot,
        //                    Material = material,
        //                    PO = GetText(idx("PO"), r),
        //                    RemainCS = GetDouble(idx("RemainCS"), r),
        //                    TotalSheets = GetDouble(idx("TotalSheets"), r),

        //                    // ⭐ 這裡針對 Weekly Plan FG 轉 yyyy-MM-dd；非日期則回原字串
        //                    WeeklyPlanFG = GetDateString(idx("WeeklyPlanFG"), r)
        //                };

        //                rows.Add(data);
        //            }
        //        }

        //        #region 迴圈跑資料

        //        string SCHEDULE_END_DATE = ""; //排程結束日期 (吃開始日的那周 周日)
        //        string SCHEDULE_START_DATE = "";//排程開始時間(吃Excel->Weekly Plan FG)
        //        string TOL_SID = "1"; //Default
        //        int TOL_CAV = 1; //固定1模1穴
        //        string DEPT_NO = ""; //部門 (吃Excel->Groupe
        //        string WO = ""; //工單 (吃Excel->WO)
        //        string LOT = "";//批號 (吃Excel->Lot.no)
        //        string SO = "";//訂單 (吃Excel->PO)
        //        decimal QUANTITY = 0;//數量 (吃Excel->Total sheets)
        //        string PART_NO = ""; //料號 (吃Excel->Material)
        //        string PART_SID = ""; 

        //        #region 檢查&建立料號

        //        //抓現有料號 Table
        //        string PartNoSQL = @"SELECT * FROM BAS_PARTNO";
        //        DataTable PartDt = MyDBQuery.GetTable(ref _SessionToken,PartNoSQL);

        //        _SessionToken.Key = "WeyuTech" + _SessionToken.Key;

        //        List<string> PartNoCreateList = new List<string>();
        //        decimal PartNoSID = MyDBQuery.GetDBSid();
        //        string CreateTime = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");

        //        //抓不重複的料號
        //        var uniqueMaterials = rows
        //        .Where(r => !string.IsNullOrWhiteSpace(r.Material))
        //        .Select(r => r.Material.Trim())
        //        .Distinct(StringComparer.OrdinalIgnoreCase) // 忽略大小寫 (可改成 Ordinal 表示大小寫敏感)
        //        .ToArray();

        //        for (int i = 0; i < uniqueMaterials.Length; i++)
        //        {
        //            PartNoSID++;
        //            PART_NO = uniqueMaterials[i];
        //            string PartNoResult = CheckAndCreatePartNo(PartDt, PART_NO,PartNoSID, CreateTime);

        //            //表示不存在於料號主檔 要Insert
        //            if (!string.IsNullOrEmpty(PartNoResult))
        //            {
        //                PartNoCreateList.Add(PartNoResult);
        //            }

        //        }

        //        var PartNotolist = PartNoCreateList.ToArray();

        //        DBAction_H5.doTranExecute(ref _SessionToken, PartNotolist);

        //        _SessionToken.Key = "WeyuTech" + _SessionToken.Key;

        //        #endregion

        //        //重抓一次料號清單
        //        string PartNoSQL_New = @"SELECT * FROM BAS_PARTNO";
        //        DataTable PartDtNew = MyDBQuery.GetTable(ref _SessionToken, PartNoSQL_New);
        //        _SessionToken.Key = "WeyuTech" + _SessionToken.Key;

        //        #region 檢查&建立工單

        //        List<string> WOCreartList = new List<string>();

        //        //抓現有工單清單
        //        string WOSQL = @"SELECT * FROM WOR_MASTER";
        //        DataTable WODt = MyDBQuery.GetTable(ref _SessionToken, WOSQL);

        //        _SessionToken.Key = "WeyuTech" + _SessionToken.Key;

        //        decimal WO_SID = MyDBQuery.GetDBSid();
        //        for (int i = 0; i < rows.Count; i++)
        //        {
        //            WO_SID++;
        //            DEPT_NO = rows[i].Groupe;
        //            WO = rows[i].WO;
        //            LOT = rows[i].LotNo;
        //            SO = rows[i].PO;
        //            QUANTITY = rows[i].TotalSheets.HasValue
        //            ? Convert.ToDecimal(rows[i].TotalSheets.Value)
        //            : 0m;   // 預設給 0

        //            //  從 DataTable 找對應的 Material
        //            string materialKey = (rows[i].Material ?? "").Trim();
        //            DataRow[] foundRows = PartDtNew.Select($"PART_NO = '{materialKey.Replace("'", "''")}'");

        //            if (foundRows.Length > 0)
        //            {
        //                // 找到對應 row
        //                DataRow partRow = foundRows[0];
        //                PART_NO = partRow["PART_NO"].ToString().Trim();
        //                PART_SID = partRow["PART_SID"].ToString().Trim();
        //            }

        //            string WOResult = CheckAndCreateWO(WODt,WO, DEPT_NO, SO, QUANTITY, PART_SID, PART_NO, LOT, WO_SID,CreateTime);

        //            //表示不存在於料號主檔 要Insert
        //            if (!string.IsNullOrEmpty(WOResult))
        //            {
        //                WOCreartList.Add(WOResult);
        //            }

        //        }

        //        var WOList = WOCreartList.ToArray();
        //        DBAction_H5.doTranExecute(ref _SessionToken, WOList);

        //        _SessionToken.Key = "WeyuTech" + _SessionToken.Key;
        //        #endregion

        //        //重抓一次工單清單
        //        string WOSQL_New = @"SELECT * FROM WOR_MASTER";
        //        DataTable WODtNew = MyDBQuery.GetTable(ref _SessionToken, WOSQL_New);
        //        _SessionToken.Key = "WeyuTech" + _SessionToken.Key;


        //        #region 檢查&建立排程

        //        List<string> ScheduleList = new List<string>();

        //        //抓現有工單清單
        //        string ScheduleSQL = @"SELECT * FROM ZZ_EMERALD_PROD_SCHEDULE";
        //        DataTable ScheduleDt = MyDBQuery.GetTable(ref _SessionToken, ScheduleSQL);

        //        _SessionToken.Key = "WeyuTech" + _SessionToken.Key;

        //        decimal Schedule_SID = MyDBQuery.GetDBSid();
        //        decimal WO_QUANTITY = 0;

        //        for (int i = 0; i < rows.Count; i++)
        //        {
        //            Schedule_SID++;
        //            DEPT_NO = rows[i].Groupe;
        //            WO = rows[i].WO;
        //            LOT = rows[i].LotNo;
        //            SO = rows[i].PO;
        //            QUANTITY = rows[i].TotalSheets.HasValue
        //            ? Convert.ToDecimal(rows[i].TotalSheets.Value)
        //            : 0m;   // 預設給 0

        //            #region 抓料號
        //            //  從 DataTable 找對應的 Material(料號)
        //            string materialKey = (rows[i].Material ?? "").Trim();
        //            DataRow[] foundRowsPartNo = PartDtNew.Select($"PART_NO = '{materialKey.Replace("'", "''")}'");

        //            if (foundRowsPartNo.Length > 0)
        //            {
        //                // 找到對應 row
        //                DataRow partRow = foundRowsPartNo[0];
        //                PART_NO = partRow["PART_NO"].ToString().Trim();
        //                PART_SID = partRow["PART_SID"].ToString().Trim();
        //            }
        //            #endregion

        //            #region 抓工單
        //            //  從 DataTable 找對應的 WO(工單)
        //            string WOKey = (rows[i].WO ?? "").Trim();
        //            DataRow[] foundRowsWO = WODtNew.Select($"WO = '{WOKey.Replace("'", "''")}'");

        //            if (foundRowsWO.Length > 0)
        //            {
        //                // 找到對應 row
        //                DataRow WORow = foundRowsWO[0];
        //                WO = WORow["WO"].ToString().Trim();
        //                WO_SID = decimal.Parse(WORow["WO_SID"].ToString().Trim());
        //                WO_QUANTITY = decimal.Parse(WORow["QUANTITY"].ToString().Trim());
        //            }
        //            #endregion

        //            #region 抓排程開始日期&結束日期
        //            var row = rows[i];
        //            DateTime dt;
        //            if (DateTime.TryParse(row.WeeklyPlanFG, out dt))
        //            {
        //                DateTime sunday = GetWeekSunday(dt);
        //                SCHEDULE_END_DATE = sunday.ToString("yyyy-MM-dd");
        //            }
        //            SCHEDULE_START_DATE = rows[i].WeeklyPlanFG;
        //            #endregion

        //            string ScheduleResult = CheckCreateSchedule(ScheduleDt, WO_SID, WO_QUANTITY, DEPT_NO, TOL_SID, PART_NO, SCHEDULE_START_DATE, SCHEDULE_END_DATE, CreateTime,LOT, Schedule_SID);

        //            //表示不存在於料號主檔 要Insert
        //            if (!string.IsNullOrEmpty(ScheduleResult))
        //            {
        //                ScheduleList.Add(ScheduleResult);
        //            }
        //        }

        //        var ScheduleSqlList = ScheduleList.ToArray();
        //        DBAction_H5.doTranExecute(ref _SessionToken, ScheduleSqlList);

        //        #endregion

        //        #endregion

        //        // F. 回傳結果
        //        var result = new
        //        {
        //            result = true,
        //            TokenInfo = new[] // 新增 TOKENINFO 資料
        //                {
        //                new
        //                {
        //                    TokenExpiry = _SessionToken.Expiration
        //                }
        //            },
        //            savedFile = $"excel/uploads/{stampedName}",
        //            totalParsed = rows.Count,
        //            columnsDetected,
        //            preview = rows.Take(10)
        //        };
        //        return Request.CreateResponse(HttpStatusCode.OK, result);
        //    }
        //    catch (Exception ex)
        //    {
        //        return Request.CreateResponse(HttpStatusCode.InternalServerError, new { result = false, msg = ex.Message });
        //    }
        //} 
        #endregion

        [Route("api/H5_UploadScheduleXlsx")]
        [HttpPost]
        public async Task<HttpResponseMessage> PostUploadScheduleXlsx()
        {
            var session = System.Web.HttpContext.Current.Session;

            try
            {
                // A. Session 驗證（保留原樣）
                //if (session?["Key"] == null)
                //{
                //    var resp = new { result = false, Msg = "Token Verify Fail !", SID = "" };
                //    return Request.CreateResponse(HttpStatusCode.Unauthorized, resp);
                //}

                var sessionToken = "WeyuTech" + session["Key"];
                var sessionExpiration = session["Expiration"];
                WeYuSEC_H5S.WeyuToken _SessionToken =
                    new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));

                // B. 必須是 multipart/form-data
                if (!Request.Content.IsMimeMultipartContent())
                    return Request.CreateResponse(HttpStatusCode.BadRequest,
                        new { result = false, msg = "Content-Type 必須為 multipart/form-data" });

                // C. 讀取檔案（async 版）
                var provider = new MultipartMemoryStreamProvider();
                await Request.Content.ReadAsMultipartAsync(provider).ConfigureAwait(false);

                var fileContent = provider.Contents.FirstOrDefault(c =>
                    c.Headers.ContentDisposition != null &&
                    (!string.IsNullOrEmpty(c.Headers.ContentDisposition.FileName) ||
                     !string.IsNullOrEmpty(c.Headers.ContentDisposition.FileNameStar)));

                if (fileContent == null)
                    return Request.CreateResponse(HttpStatusCode.BadRequest,
                        new { result = false, msg = "找不到檔案欄位（請用 form-data 欄位名 file）" });

                // ★ 伺服器常見：FileName 可能為 null，只有 FileNameStar（RFC 5987）
                var cd = fileContent.Headers.ContentDisposition;
                var originalFileName = (cd.FileNameStar ?? cd.FileName ?? string.Empty).Trim('"');
                if (string.IsNullOrWhiteSpace(originalFileName))
                    return Request.CreateResponse(HttpStatusCode.BadRequest,
                        new { result = false, msg = "上傳檔案沒有檔名" });

                var ext = Path.GetExtension(originalFileName)?.ToLowerInvariant();
                if (ext != ".xlsx")
                    return Request.CreateResponse(HttpStatusCode.BadRequest, new { result = false, msg = "只允許 .xlsx 檔案" });

                // D. 儲存原檔到 ~/excel/uploads/
                string root = System.Web.Hosting.HostingEnvironment.MapPath("~/");
                if (string.IsNullOrEmpty(root))
                    return Request.CreateResponse(HttpStatusCode.InternalServerError,
                        new { result = false, msg = "無法解析網站根目錄（MapPath 失敗）" });

                string uploadDir = Path.Combine(root, "excel", "uploads");
                if (!Directory.Exists(uploadDir)) Directory.CreateDirectory(uploadDir);

                string stampedName = $"{DateTime.Now:yyyyMMdd_HHmmssfff}_{Path.GetFileNameWithoutExtension(originalFileName)}{ext}";
                string savedPath = Path.Combine(uploadDir, stampedName);

                var fileBytes = await fileContent.ReadAsByteArrayAsync().ConfigureAwait(false);
                File.WriteAllBytes(savedPath, fileBytes);

                // E. 解析（EPPlus 4：無 LicenseContext）
                var rows = new List<ScheduleRow>();
                var columnsDetected = new List<string>();

                using (var package = new ExcelPackage(new FileInfo(savedPath)))
                {
                    var ws = package.Workbook.Worksheets.FirstOrDefault();
                    if (ws == null)
                        return Request.CreateResponse(HttpStatusCode.BadRequest, new { result = false, msg = "Excel 內沒有任何工作表" });

                    // ★ 空白表或只有格式時，Dimension 會是 null（IIS 上較常見）
                    if (ws.Dimension == null || ws.Dimension.End.Row < 2)
                        return Request.CreateResponse(HttpStatusCode.BadRequest,
                            new { result = false, msg = "工作表沒有可讀資料（至少需要標題列與一列資料）" });

                    int startRow = 2; // 第 1 列為標頭
                    int startCol = ws.Dimension.Start.Column;
                    int endCol = ws.Dimension.End.Column;
                    int endRow = ws.Dimension.End.Row;

                    var headerToIndex = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
                    for (int c = startCol; c <= endCol; c++)
                    {
                        var header = (ws.Cells[1, c].Text ?? "").Trim();
                        if (!string.IsNullOrEmpty(header) && !headerToIndex.ContainsKey(header))
                        {
                            headerToIndex[header] = c;
                            columnsDetected.Add(header);
                        }
                    }

                    // 若整列標題皆空，直接擋
                    bool headerAllEmpty = true;
                    foreach (var kv in headerToIndex) { headerAllEmpty = false; break; }
                    if (headerAllEmpty)
                        return Request.CreateResponse(HttpStatusCode.BadRequest,
                            new { result = false, msg = "找不到標題列（第 1 列全為空白）" });

                    var map = new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase)
                    {
                        { "Groupe",         new[] { "Groupe" } },
                        { "WO",             new[] { "WO" } },
                        { "LotNo",          new[] { "Lot.no", "LotNo", "Lot", "Lot No", "Lot Number" } },
                        { "Material",       new[] { "Material" } },
                        { "PO",             new[] { "PO", "Purchase Order" } },
                        { "RemainCS",       new[] { "เหลือ(CS)", "Remain(CS)", "Remain CS", "Remaining(CS)", "(CS)" } },
                        { "TotalSheets",    new[] { "Total sheets", "Total Sheets", "Total Sheet" } },
                        { "WeeklyPlanFG",   new[] { "Weekly Plan FG", "Weekly Plan", "Plan FG" } },
                    };

                    Func<string, int?> idx = (logicalName) =>
                    {
                        if (!map.ContainsKey(logicalName)) return null;
                        foreach (var alias in map[logicalName])
                        {
                            if (headerToIndex.TryGetValue(alias, out int col)) return col;
                        }
                        return null;
                    };

                    // 必填欄位維持：WO + LotNo + Material
                    var required = new[] { "WO", "LotNo", "Material" };
                    var missing = required.Where(k => idx(k) == null).ToList();
                    if (missing.Any())
                    {
                        return Request.CreateResponse(HttpStatusCode.BadRequest, new
                        {
                            result = false,
                            msg = $"缺少必要欄位標頭：{string.Join(", ", missing)}",
                            columnsDetected
                        });
                    }

                    string GetText(int? col, int row)
                    {
                        if (!col.HasValue) return "";
                        var cell = ws.Cells[row, col.Value];
                        return (cell.Text ?? "").Trim();
                    }
                    object GetRaw(int? col, int row)
                    {
                        if (!col.HasValue) return null;
                        var cell = ws.Cells[row, col.Value];
                        return cell.Value;
                    }
                    double? GetDouble(int? col, int row)
                    {
                        var raw = GetRaw(col, row);
                        if (raw == null) return null;
                        if (raw is double d1) return d1;
                        if (raw is float f1) return (double)f1;
                        if (raw is decimal m1) return (double)m1;
                        if (double.TryParse(raw.ToString(), out var d)) return d;
                        return null;
                    }
                    string GetDateString(int? col, int row)
                    {
                        var cell = (col.HasValue ? ws.Cells[row, col.Value] : null);
                        if (cell == null) return "";
                        var raw = cell.Value;

                        if (raw is DateTime dt) return dt.ToString("yyyy-MM-dd");
                        if (raw is double serial)
                        {
                            try
                            {
                                var baseDate = new DateTime(1899, 12, 30); // Excel 1900 system
                                return baseDate.AddDays(serial).ToString("yyyy-MM-dd");
                            }
                            catch { }
                        }
                        var t = (cell.Text ?? "").Trim();
                        if (!string.IsNullOrEmpty(t) && DateTime.TryParse(t, out var dt2))
                            return dt2.ToString("yyyy-MM-dd");
                        return t; // 不是日期就回原字串
                    }

                    for (int r = startRow; r <= endRow; r++)
                    {
                        var wo = GetText(idx("WO"), r);
                        var lot = GetText(idx("LotNo"), r);
                        var material = GetText(idx("Material"), r);

                        if (string.IsNullOrWhiteSpace(wo) &&
                            string.IsNullOrWhiteSpace(lot) &&
                            string.IsNullOrWhiteSpace(material))
                            continue;

                        var data = new ScheduleRow
                        {
                            Groupe = GetText(idx("Groupe"), r),
                            WO = wo,               // 存到 WOR_MASTER.MASTER_WO
                            LotNo = lot,           // 現在以 LOT 為主鍵
                            Material = material,
                            PO = GetText(idx("PO"), r),
                            RemainCS = GetDouble(idx("RemainCS"), r),
                            TotalSheets = GetDouble(idx("TotalSheets"), r),
                            WeeklyPlanFG = GetDateString(idx("WeeklyPlanFG"), r) // 保留成字串
                        };

                        rows.Add(data);
                    }
                }

                // ======= 以下 DB 處理 =======
                string SCHEDULE_END_DATE = "";
                string SCHEDULE_START_DATE = "";
                string TOL_SID = "1";
                int TOL_CAV = 1;
                string DEPT_NO = "";
                string WO_ = "";
                string LOT = "";
                string SO = "";
                decimal QUANTITY = 0;
                string PART_NO = "";
                string PART_SID = "";

                // 檢查&建立料號
                string PartNoSQL = @"SELECT * FROM BAS_PARTNO";
                DataTable PartDt = MyDBQuery.GetTable(ref _SessionToken, PartNoSQL);
                _SessionToken.Key = "WeyuTech" + _SessionToken.Key;

                List<string> PartNoCreateList = new List<string>();
                decimal PartNoSID = MyDBQuery.GetDBSid();
                string CreateTime = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");

                var uniqueMaterials = rows.Where(r => !string.IsNullOrWhiteSpace(r.Material))
                                          .Select(r => r.Material.Trim())
                                          .Distinct(StringComparer.OrdinalIgnoreCase)
                                          .ToArray();

                for (int i = 0; i < uniqueMaterials.Length; i++)
                {
                    PartNoSID++;
                    PART_NO = uniqueMaterials[i];
                    var PartNoResult = CheckAndCreatePartNo(PartDt, PART_NO, PartNoSID, CreateTime);
                    if (!string.IsNullOrEmpty(PartNoResult)) PartNoCreateList.Add(PartNoResult);
                }

                DBAction_H5.doTranExecute(ref _SessionToken, PartNoCreateList.ToArray());
                _SessionToken.Key = "WeyuTech" + _SessionToken.Key;

                // 重抓一次料號清單
                string PartNoSQL_New = @"SELECT * FROM BAS_PARTNO";
                DataTable PartDtNew = MyDBQuery.GetTable(ref _SessionToken, PartNoSQL_New);
                _SessionToken.Key = "WeyuTech" + _SessionToken.Key;

                // 檢查&建立工單（只處理 WOR_MASTER）
                List<string> WOCreartList = new List<string>();
                string WOSQL = @"SELECT * FROM WOR_MASTER";
                DataTable WODt = MyDBQuery.GetTable(ref _SessionToken, WOSQL);
                _SessionToken.Key = "WeyuTech" + _SessionToken.Key;

                decimal WO_SID = MyDBQuery.GetDBSid();
                for (int i = 0; i < rows.Count; i++)
                {
                    WO_SID++;
                    DEPT_NO = rows[i].Groupe;

                    var MASTER_WO = rows[i].WO;     // Excel 原 WO → 存到 MASTER_WO
                    LOT = rows[i].LotNo;            // 以 LOT 為主鍵
                    WO_ = LOT;                      // 實際寫入 WOR_MASTER.WO 的值

                    SO = rows[i].PO;
                    QUANTITY = rows[i].TotalSheets.HasValue ? Convert.ToDecimal(rows[i].TotalSheets.Value) : 0m;

                    string materialKey = (rows[i].Material ?? "").Trim();
                    DataRow[] foundRows = PartDtNew.Select($"PART_NO = '{materialKey.Replace("'", "''")}'");
                    if (foundRows.Length > 0)
                    {
                        var partRow = foundRows[0];
                        PART_NO = partRow["PART_NO"].ToString().Trim();
                        PART_SID = partRow["PART_SID"].ToString().Trim();
                    }

                    var sql = CheckAndCreateWOR_MASTER_NoUpdate(
                        WODt, WO_, MASTER_WO, DEPT_NO, SO, QUANTITY, PART_SID, PART_NO, LOT, WO_SID, CreateTime
                    );
                    if (!string.IsNullOrEmpty(sql)) WOCreartList.Add(sql);
                }

                DBAction_H5.doTranExecute(ref _SessionToken, WOCreartList.ToArray());
                _SessionToken.Key = "WeyuTech" + _SessionToken.Key;

                // 重抓一次工單清單（給排程找 WO_SID 用）
                string WOSQL_New = @"SELECT * FROM WOR_MASTER";
                DataTable WODtNew = MyDBQuery.GetTable(ref _SessionToken, WOSQL_New);
                _SessionToken.Key = "WeyuTech" + _SessionToken.Key;

                // 檢查&建立排程（不改表；只把查找改用 LOT 對到正確的 WO_SID）
                List<string> ScheduleList = new List<string>();
                string ScheduleSQL = @"SELECT * FROM ZZ_EMERALD_PROD_SCHEDULE";
                DataTable ScheduleDt = MyDBQuery.GetTable(ref _SessionToken, ScheduleSQL);
                _SessionToken.Key = "WeyuTech" + _SessionToken.Key;

                decimal Schedule_SID = MyDBQuery.GetDBSid();
                decimal WO_QUANTITY = 0;

                for (int i = 0; i < rows.Count; i++)
                {
                    Schedule_SID++;
                    DEPT_NO = rows[i].Groupe;

                    LOT = rows[i].LotNo;
                    SO = rows[i].PO;
                    QUANTITY = rows[i].TotalSheets.HasValue ? Convert.ToDecimal(rows[i].TotalSheets.Value) : 0m;

                    string materialKey = (rows[i].Material ?? "").Trim();
                    DataRow[] foundRowsPartNo = PartDtNew.Select($"PART_NO = '{materialKey.Replace("'", "''")}'");
                    if (foundRowsPartNo.Length > 0)
                    {
                        var partRow = foundRowsPartNo[0];
                        PART_NO = partRow["PART_NO"].ToString().Trim();
                        PART_SID = partRow["PART_SID"].ToString().Trim();
                    }

                    // ★ 用 LOT 對 WOR_MASTER（容錯：WO=LOT 或 LOT=LOT）
                    string key = (rows[i].LotNo ?? "").Trim().Replace("'", "''");
                    DataRow[] foundRowsWO = WODtNew.Select($"WO = '{key}' OR LOT = '{key}'");
                    if (foundRowsWO.Length > 0)
                    {
                        var WORow = foundRowsWO[0];
                        WO_ = Convert.ToString(WORow["WO"]).Trim();      // 多半是 LOT
                        WO_SID = decimal.Parse(Convert.ToString(WORow["WO_SID"]).Trim());
                        WO_QUANTITY = decimal.Parse(Convert.ToString(WORow["QUANTITY"]).Trim());
                    }
                    else
                    {
                        continue; // 找不到就跳過或記 Log
                    }

                    // === 新規：Weekly Plan FG 是「結束日」，開始日 = 結束日 - 7 ===
                    DateTime? fgEnd = ParseWeeklyPlanFgString(rows[i].WeeklyPlanFG);
                    if (fgEnd.HasValue)
                    {
                        SCHEDULE_END_DATE = fgEnd.Value.ToString("yyyy-MM-dd");
                        SCHEDULE_START_DATE = fgEnd.Value.AddDays(-7).ToString("yyyy-MM-dd");
                    }
                    else
                    {
                        // 解析不到：維持原字串以免整筆資料丟失
                        SCHEDULE_END_DATE = rows[i].WeeklyPlanFG;
                        SCHEDULE_START_DATE = rows[i].WeeklyPlanFG;
                    }

                    var ScheduleResult = CheckCreateSchedule(
                        ScheduleDt, WO_SID, WO_QUANTITY, DEPT_NO, TOL_SID,
                        PART_NO, SCHEDULE_START_DATE, SCHEDULE_END_DATE,
                        CreateTime, LOT, Schedule_SID
                    );
                    if (!string.IsNullOrEmpty(ScheduleResult)) ScheduleList.Add(ScheduleResult);
                }

                DBAction_H5.doTranExecute(ref _SessionToken, ScheduleList.ToArray());
                SessionHelper.UpdateToken(_SessionToken);

                // F. 回傳結果
                var result = new
                {
                    result = true,
                    TokenInfo = new[] { new { TokenExpiry = _SessionToken.Expiration } },
                    savedFile = $"excel/uploads/{stampedName}",
                    totalParsed = rows.Count,
                    columnsDetected,
                    preview = rows.Take(10)
                };
                return Request.CreateResponse(HttpStatusCode.OK, result);
            }
            catch (Exception ex)
            {
                // 先用完整堆疊方便現場定位；穩定後改回 ex.Message
                return Request.CreateResponse(HttpStatusCode.InternalServerError,
                    new { result = false, msg = ex.ToString() });
            }
        }

        /// <summary>
        /// 解析 Weekly Plan FG 字串（支援 22-Sep-25 / 22 Sep 25 / 2025-09-22 等）
        /// 兩位年視為 2000+yy（25 → 2025）
        /// </summary>
        private static DateTime? ParseWeeklyPlanFgString(string s)
        {
            if (string.IsNullOrWhiteSpace(s)) return null;
            var t = s.Trim();

            // 快速路：一般 DateTime
            if (DateTime.TryParse(t,
                                  System.Globalization.CultureInfo.InvariantCulture,
                                  System.Globalization.DateTimeStyles.AssumeLocal,
                                  out var dt))
                return dt.Date;

            // 正規化分隔符
            var norm = t.Replace("/", "-").Replace(" ", "-");
            var parts = norm.Split('-');
            if (parts.Length == 3)
            {
                bool dayOk = int.TryParse(parts[0], out int day);
                string mmm = parts[1];
                bool yearOk = int.TryParse(parts[2], out int y);
                if (dayOk && yearOk)
                {
                    int month = MonthNameToInt(mmm);
                    if (month > 0)
                    {
                        int year = (parts[2].Length <= 2) ? (2000 + y) : y; // "25" => 2025
                        try { return new DateTime(year, month, day); } catch { }
                    }
                }
            }

            // 無法解析
            return null;
        }

        /// <summary>
        /// 英文月份縮寫/全名 -> 月份數字
        /// </summary>
        private static int MonthNameToInt(string name)
        {
            if (string.IsNullOrWhiteSpace(name)) return 0;
            var m = name.Trim().ToLowerInvariant();
            switch (m)
            {
                case "jan":
                case "january": return 1;
                case "feb":
                case "february": return 2;
                case "mar":
                case "march": return 3;
                case "apr":
                case "april": return 4;
                case "may": return 5;
                case "jun":
                case "june": return 6;
                case "jul":
                case "july": return 7;
                case "aug":
                case "august": return 8;
                case "sep":
                case "sept":
                case "september": return 9;
                case "oct":
                case "october": return 10;
                case "nov":
                case "november": return 11;
                case "dec":
                case "december": return 12;
                default: return 0;
            }
        }

        /// <summary>
        /// （舊）回傳該週的星期日日期 —— 現在不再用到，可保留
        /// </summary>
        public static DateTime GetWeekSunday(DateTime inputDate)
        {
            int daysToAdd = DayOfWeek.Sunday - inputDate.DayOfWeek;
            if (daysToAdd < 0) daysToAdd += 7; // 跑到下週的 Sunday
            return inputDate.AddDays(daysToAdd).Date;
        }

        public string CheckAndCreateWOR_MASTER_NoUpdate(
            DataTable WODt,
            string lotAsWO,          // 要寫入 WOR_MASTER.WO 的值（= LOT）
            string MASTER_WO,        // Excel 原 WO（可為空）
            string DEPT_NO,
            string SO,
            decimal QUANTITY,
            string PART_SID,
            string PART_NO,
            string LOT,
            decimal WO_SID,
            string Create_Time)
        {
            if (WODt == null) throw new ArgumentNullException(nameof(WODt));

            // 現在這個 key = LOT，將寫進 WOR_MASTER.WO
            string lotKey = (lotAsWO ?? "").Trim();
            string lotSafe = (LOT ?? "").Replace("'", "''");
            string masterWoSafe = (MASTER_WO ?? "").Replace("'", "''");

            // ===【關鍵】查重規則：只看「現在的 key = LOT」===
            // 視為已存在的條件：表內有「WO = lotKey」或「LOT = lotKey」其一
            bool exists = WODt.AsEnumerable().Any(r =>
            {
                string woStr = r.Table.Columns.Contains("WO") ? Convert.ToString(r["WO"]).Trim() : "";
                string lotStr = r.Table.Columns.Contains("LOT") ? Convert.ToString(r["LOT"]).Trim() : "";
                return woStr.Equals(lotKey, StringComparison.OrdinalIgnoreCase)
                    || lotStr.Equals(lotKey, StringComparison.OrdinalIgnoreCase);
            });

            if (exists)
            {
                // 已存在 → 不動（你說不需要作業，不補寫 MASTER_WO）
                return null;
            }

            // 不存在 → 依新規插入：WO=LOT、MASTER_WO=Excel原WO、LOT=LOT
            string CreateSQL = $@"
INSERT INTO WOR_MASTER
(
    WO_SID, WO, SO, QUANTITY, PART_NO, PART_SID,
    CREATE_USER, CREATE_TIME, EDIT_USER, EDIT_TIME,
    DEPT_NO, LOT, MASTER_WO
)
VALUES
(
    {WO_SID},
    N'{lotKey}',             -- ★ 以 LOT 當現在的 WO
    '{SO}',
    {QUANTITY},
    N'{PART_NO}',
    '{PART_SID}',
    'WebApi','{Create_Time}','WebApi','{Create_Time}',
    N'{DEPT_NO}',
    N'{lotSafe}',            -- 原樣存 LOT 欄
    N'{masterWoSafe}'        -- 保存 Excel 原 WO
);";
            return CreateSQL;
        }

        public string CheckAndCreatePartNo(DataTable PartNodt, string PART_NO, decimal PART_SID, string CREATE_TIME)
        {
            if (PartNodt == null)
                throw new ArgumentNullException(nameof(PartNodt));

            if (!PartNodt.Columns.Contains("PART_NO"))
                throw new ArgumentException("DataTable 缺少 PART_NO 欄位");

            if (string.IsNullOrWhiteSpace(PART_NO))
                return null;

            string key = PART_NO.Trim();

            bool exists = PartNodt.AsEnumerable().Any(r =>
            {
                var val = r["PART_NO"];
                var str = val == DBNull.Value ? "" : val.ToString();
                return string.Equals(str.Trim(), key, StringComparison.OrdinalIgnoreCase);
            });

            if (exists) return null;

            string CreateSQL = $@"
INSERT INTO BAS_PARTNO(PART_SID,PART_NO,PART_SPEC,SPEC,ENABLE_FLAG,CREATE_USER,CREATE_TIME,EDIT_USER,EDIT_TIME)
VALUES({PART_SID},N'{PART_NO}',N'{PART_NO}',N'{PART_NO}','Y','WebApi','{CREATE_TIME}','WebApi','{CREATE_TIME}')";
            return CreateSQL;
        }

        public string CheckCreateSchedule(DataTable ScheduleDt, decimal WO_SID, decimal WO_QUANTITY, string DEPT_NO, string TOL_SID, string PART_NO, string StartTime, string EndTime, string CREATE_TIME, string LOT, decimal Schedule_SID)
        {
            if (ScheduleDt == null)
                throw new ArgumentNullException(nameof(ScheduleDt));

            // 必要欄位確認
            string[] requiredCols = { "WO_SID", "LOT", "SCHEDULE_START_TIME" };
            foreach (var col in requiredCols)
                if (!ScheduleDt.Columns.Contains(col))
                    throw new ArgumentException($"ScheduleDt 缺少必要欄位：{col}");

            string lotKey = (LOT ?? "").Trim();
            string startKey = (StartTime ?? "").Trim();

            // 查找是否有相同的 WO_SID + LOT + START_TIME
            var match = ScheduleDt.AsEnumerable().FirstOrDefault(r =>
            {
                decimal wo;
                var woOk = decimal.TryParse(Convert.ToString(r["WO_SID"]).Trim(), out wo) && wo == WO_SID;

                var lotOk = string.Equals(Convert.ToString(r["LOT"]).Trim(), lotKey, StringComparison.OrdinalIgnoreCase);

                var startOk = string.Equals(Convert.ToString(r["SCHEDULE_START_TIME"]).Trim(), startKey, StringComparison.Ordinal);

                return woOk && lotOk && startOk;
            });

            if (match != null) return null; // 已存在 → 不Insert

            // 不存在 → 新增
            string CreateSQL = $@"
INSERT INTO ZZ_EMERALD_PROD_SCHEDULE
(ZZ_EMERALD_PROD_SCHEDULE_SID,DEPT_NO,SCHEDULE_START_TIME,SCHEDULE_END_TIME,TOL_SID,PART_NO,PART_SPEC,WO_SID,WO_QUANTITY,SCHEDULE_CUR_CAV,SCHEDULE_CYCLE_TIME,TARGET_SHOT,TARGET_PCS,CREATE_USER,CREATE_TIME,EDIT_USER,EDIT_TIME,LOT)
VALUES('{Schedule_SID}',N'{DEPT_NO}','{StartTime}','{EndTime}','{TOL_SID}',N'{PART_NO}',N'{PART_NO}',{WO_SID},{WO_QUANTITY},1,1,1,1,'WebApi','{CREATE_TIME}','WebApi','{CREATE_TIME}',N'{LOT}')";
            return CreateSQL;
        }
    

}
}
