# MesH5-WebApi

## 系統說明
MesH5-WebApi 為 ASP.NET Web API 應用程式，提供前端服務所需之 RESTful API。專案主要以 .NET Framework 4.7.2 為基礎，並搭配 Dapper 進行資料庫存取。

## Help Page 編譯流程
Help Page 區域使用 Razor 檢視呈現所有可用 API。於 `Areas/HelpPage/Views/Help/Index.cshtml` 中，檢視會建立 `Model.ToLookup(...)` 將 `ApiDescription` 依控制器群組化，再透過 `DisplayFor` 以 `ApiGroup` 範本輸出詳細資訊。為確保 Razor 編譯器能存取 `ApiDescription` 所屬型別，需要在 `Areas/HelpPage/Views/Web.config` 中加入下列組件參考：

1. `System.Runtime`：提供 Razor 編譯期間所需之核心 BCL 型別，避免 `CS0012` 編譯錯誤。
2. `System.Web.Http`：確保 `ApiDescription` 與 Web API 層級之型別解析正常。

經過上述設定後，Help Page 可於 `http://localhost/MESH5-WEBAPI-20250228V2/help` 正常載入。

## 原始碼控管建議
專案新增 `.gitignore` 規則以排除 JetBrains Rider / IntelliJ IDEA 所產生的 `.idea/` 設定，避免開發環境雜訊進入版本庫。若需額外排除其他開發工具產生之暫存檔案，可依需求擴充規則。
