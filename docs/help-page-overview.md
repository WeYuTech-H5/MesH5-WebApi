# Help Page 組態與運作流程說明

## 總覽
`Areas/HelpPage` 區域承載了 ASP.NET Web API 的說明文件頁面。每次瀏覽 `~/help` 時，Razor 檢視會於伺服器端即時編譯，將 `ApiDescription` 模型資料渲染為 HTML。若缺乏必要的 .NET Framework 程式集參考，編譯程序將失敗並顯示「未參考 System.Runtime」等錯誤訊息。

## Razor 編譯流程
1. `HelpController` 自 `IApiExplorer` 擷取所有 API 描述並傳入 `Index.cshtml`。
2. `Index.cshtml` 透過 `Model.ToLookup(...)` 依控制器分組資料。
3. Razor 引擎在 `Areas/HelpPage/Views/Web.config` 所宣告的程式集範圍內進行編譯。
4. 編譯成功後，`ApiGroup` DisplayTemplate 再逐項渲染群組內容。

> **備註（remark）：** Razor 編譯使用的組態檔與網站主組態不同，因此若缺少必要的組件參考，僅會在存取說明頁時發生錯誤。

## 為何需要新增 System.Runtime 參考
- Web API 5.2.9 及相依的 .NET Standard 相容套件會在設計階段依賴 `System.Runtime` 與 `System.Runtime.Extensions`。
- 編譯 Razor 檔時，預設只載入傳統 .NET Framework 程式集，導致 `System.Object` 解析失敗。
- 於 `Areas/HelpPage/Views/Web.config` 的 `<compilation><assemblies>` 節點新增對應組件參考，可在 Razor 編譯時載入必要程式集，避免 CS0012 錯誤。

## 檔案輸出/上傳目錄策略
- `excel/output/` 與 `excel/uploads/` 為執行時產出的檔案。若被納入版控，會造成倉儲暴增且引發機密資料外洩風險。
- 透過 `.gitignore` 忽略這些目錄並保留 `.gitkeep`，確保發佈環境仍會建立空資料夾。

## 維運建議
- 若未來新增其他相依於 .NET Standard 的套件，請同步確認 Razor 組態是否需要補齊參考。
- 建議於部署腳本中預先建立 `excel/output` 與 `excel/uploads`，避免於唯讀環境執行時發生「目錄不存在」的例外。
- 定期清除 `excel` 目錄的歷史檔案，降低磁碟占用並避免處理舊資料。

