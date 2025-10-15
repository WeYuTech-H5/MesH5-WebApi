using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SkiaSharp;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Configuration; // <--- 新增：讀 Web.config
using System.Data;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web.Hosting;

public static class PdfTemplateEngine
{
    public static byte[] Render(string template, object model)
    {
        // 1) 讀取外部路徑（若未設定則回退到 App_Data）
        var fontsPath = ConfigurationManager.AppSettings["PdfFontsPath"];
        var tplsPath = ConfigurationManager.AppSettings["PdfTemplatesPath"];

        var templatesDir = string.IsNullOrWhiteSpace(tplsPath)
            ? HostingEnvironment.MapPath("~/App_Data/Templates/")
            : tplsPath;

        var fontDir = string.IsNullOrWhiteSpace(fontsPath)
            ? HostingEnvironment.MapPath("~/App_Data/Fonts/")
            : fontsPath;

        // 2) 讀模板（外部或 App_Data）
        var path = Path.Combine(templatesDir, $"{template}.json");
        if (!File.Exists(path))
            throw new FileNotFoundException($"找不到模板：{template}.json。請確認路徑：{path}");

        var tpl = JsonConvert.DeserializeObject<PdfTemplate>(File.ReadAllText(path))
                  ?? throw new InvalidOperationException("模板 JSON 解析失敗");

        // 3) 載入多語系字型（Regular / Bold）— 外部或 App_Data
        SKTypeface LoadFont(string fileName)
        {
            var p = Path.Combine(fontDir, fileName);
            if (!File.Exists(p))
                throw new FileNotFoundException($"字型檔不存在：{fileName}，尋找路徑：{p}");
            var tf = SKTypeface.FromFile(p);
            if (tf == null) throw new InvalidOperationException($"字型載入失敗：{p}");
            return tf;
        }

        var tfLatn = LoadFont("NotoSans-Regular.ttf");
        var tfLatnB = LoadFont("NotoSans-Bold.ttf");
        var tfCjk = LoadFont(tpl.fonts?.regular ?? "NotoSansTC-Regular.ttf");
        var tfCjkB = LoadFont(tpl.fonts?.bold ?? "NotoSansTC-Bold.ttf");
        var tfThai = LoadFont("NotoSansThai-Regular.ttf");
        var tfThaiB = LoadFont("NotoSansThai-Bold.ttf");

        // fallback 順序：Latin -> CJK -> Thai（讓符號如 ☐/☑/☒ 使用 Noto Sans，外觀最乾淨）
        var fallbacksReg = new List<SKTypeface> { tfLatn, tfCjk, tfThai };
        var fallbacksBold = new List<SKTypeface> { tfLatnB, tfCjkB, tfThaiB };

        using (var ms = new MemoryStream())
        using (var pdf = SKDocument.CreatePdf(ms))
        {
            float pageW = tpl.page.width, pageH = tpl.page.height;
            float mL = tpl.page.marginL, mT = tpl.page.marginT, mR = tpl.page.marginR, mB = tpl.page.marginB;
            var gridPen = new SKPaint { IsStroke = true, StrokeWidth = 1, IsAntialias = true };
            const float BottomSafe = 8f; // 換頁安全距

            var anchors = new Dictionary<string, float>(); // tableId -> table bottom Y
            SKCanvas canvas = pdf.BeginPage(pageW, pageH);

            // 1) 先畫「沒有 anchor」的一般文字（非 bottom）
            var textsNoAnchor = tpl.elements
                .Where(e => e.type == "text" && e.dock != "bottom" && string.IsNullOrWhiteSpace(e.anchor));
            foreach (var el in textsNoAnchor)
            {
                string s = ReplaceTokens(el.text, model);
                float tw = MeasureTextWithFallback(s, el.size, el.bold, fallbacksReg, fallbacksBold);
                float xAl = ComputeAlignedX(el.halign, el.boxX, el.boxW, el.x, tw, pageW, mL, mR);
                DrawTextWithFallback(canvas, s, xAl, el.y, el.size, el.bold, fallbacksReg, fallbacksBold);
            }

            // 2) 表格（表頭底色 + 交錯列底色 + 自動換頁），並記錄每個表格底端位置到 anchors
            foreach (var t in tpl.elements.Where(e => e.type == "table"))
            {
                float x = t.x, y = t.y;
                float rowH = t.rowHeight;
                float[] widths = t.columns.Select(c => c.width).ToArray();
                float tableW = widths.Sum();

                var headerBgPaint = new SKPaint { Color = ParseColor(t.headerBg ?? "#EEEEEE"), IsStroke = false };

                // 表頭
                canvas.DrawRect(x, y, tableW, rowH, headerBgPaint);
                float cur = x;
                foreach (var col in t.columns)
                {
                    var headerText = ReplaceTokens(col.header ?? "", model);
                    DrawTextWithFallback(canvas, headerText, cur + 6, y + 4, 11, true, fallbacksReg, fallbacksBold);
                    cur += col.width;
                }
                DrawGridRow(canvas, gridPen, x, y, rowH, widths);
                y += rowH;

                // 明細
                var items = GetProp(model, t.items) as IEnumerable;
                int rowIndex = 0;
                if (items != null)
                {
                    foreach (var item in items)
                    {
                        // 換頁（保留底邊距 + 一列高度 + 安全距）
                        if (y > pageH - mB - rowH - BottomSafe)
                        {
                            pdf.EndPage(); canvas.Dispose();
                            canvas = pdf.BeginPage(pageW, pageH);
                            y = mT;

                            // 續頁表頭
                            canvas.DrawRect(x, y, tableW, rowH, headerBgPaint);
                            cur = x;
                            foreach (var col in t.columns)
                            {
                                var headerText2 = ReplaceTokens(col.header ?? "", model);
                                DrawTextWithFallback(canvas, headerText2, cur + 6, y + 4, 11, true, fallbacksReg, fallbacksBold);
                                cur += col.width;
                            }
                            DrawGridRow(canvas, gridPen, x, y, rowH, widths);
                            y += rowH;
                            rowIndex = 0;
                        }

                        // 交錯列底色
                        if (t.rowStripeEvery > 0 && (rowIndex % t.rowStripeEvery) == 1)
                        {
                            var stripe = new SKPaint { Color = ParseColor(t.rowStripeColor ?? "#F7F7F7"), IsStroke = false };
                            canvas.DrawRect(x, y, tableW, rowH, stripe);
                        }

                        DrawGridRow(canvas, gridPen, x, y, rowH, widths);

                        float curx = x;
                        foreach (var col in t.columns)
                        {
                            string txt = FormatBindingOrExpr(item, col.binding);
                            float left = curx + 6;
                            float fontSize = 10; // 你原本的固定字級；若要支援欄位 textSize，可再擴充

                            if (string.Equals(col.align, "right", StringComparison.OrdinalIgnoreCase))
                            {
                                float w = MeasureTextWithFallback(txt ?? "", fontSize, false, fallbacksReg, fallbacksBold);
                                left = curx + col.width - 6 - w;
                            }
                            DrawTextWithFallback(canvas, txt ?? "", left, y + 4, fontSize, false, fallbacksReg, fallbacksBold);
                            curx += col.width;
                        }
                        y += rowH;
                        rowIndex++;
                    }
                }

                // 記錄表格底端位置（給 anchor 用）
                if (!string.IsNullOrWhiteSpace(t.id))
                    anchors[t.id] = y;
            }

            // 3) 再畫「有 anchor」的一般文字（此時 anchors 已就緒）
            var textsWithAnchor = tpl.elements
                .Where(e => e.type == "text" && e.dock != "bottom" && !string.IsNullOrWhiteSpace(e.anchor));
            foreach (var el in textsWithAnchor)
            {
                string s = ReplaceTokens(el.text, model);

                float yTop = el.y;
                if (anchors.TryGetValue(el.anchor, out var baseY))
                    yTop = baseY + el.y;

                float tw = MeasureTextWithFallback(s, el.size, el.bold, fallbacksReg, fallbacksBold);
                float xAl = ComputeAlignedX(el.halign, el.boxX, el.boxW, el.x, tw, pageW, mL, mR);
                DrawTextWithFallback(canvas, s, xAl, yTop, el.size, el.bold, fallbacksReg, fallbacksBold);
            }

            // 4) 底部文字（dock=bottom）
            foreach (var el in tpl.elements.Where(e => e.type == "text" && e.dock == "bottom"))
            {
                string s = ReplaceTokens(el.text, model);
                DrawTextWithFallback(canvas, s, el.x, pageH - mB - el.size - 2, el.size, el.bold, fallbacksReg, fallbacksBold);
            }

            // 5) 線段（支援 anchor 或 dock:bottom）
            foreach (var el in tpl.elements.Where(e => e.type == "line"))
            {
                float y1 = el.y, y2 = el.y2;

                if (!string.IsNullOrWhiteSpace(el.anchor) && anchors.TryGetValue(el.anchor, out var baseY))
                {
                    y1 = baseY + el.y;
                    y2 = baseY + el.y2;
                }
                else if (el.dock == "bottom")
                {
                    y1 = pageH - mB - el.y;
                    y2 = pageH - mB - el.y2;
                }

                using (var p = new SKPaint
                {
                    IsStroke = true,
                    StrokeWidth = el.stroke <= 0 ? 1 : el.stroke,
                    Color = ParseColor(el.color ?? "#000000"),
                    IsAntialias = true
                })
                {
                    canvas.DrawLine(el.x, y1, el.x2, y2, p);
                }
            }

            pdf.EndPage(); canvas.Dispose(); pdf.Close();
            return ms.ToArray();
        }
    }

    // ========== 水平對齊（left/center/right） ==========
    private static float ComputeAlignedX(string halign, float? boxX, float? boxW,
                                         float defaultX, float textWidth,
                                         float pageW, float mL, float mR)
    {
        if (string.IsNullOrWhiteSpace(halign) || halign == "left")
            return defaultX;

        float bx = boxX ?? mL;
        float bw = boxW ?? (pageW - mL - mR);

        switch (halign)
        {
            case "center": return bx + (bw - textWidth) / 2f;
            case "right": return bx + bw - textWidth;
            default: return defaultX;
        }
    }

    // ========== 文字：自動字型 fallback ==========
    private static void DrawTextWithFallback(SKCanvas canvas, string text, float x, float yTop, float size, bool bold,
                                             IList<SKTypeface> regs, IList<SKTypeface> bolds)
    {
        if (string.IsNullOrEmpty(text)) return;
        var order = bold ? bolds : regs;
        float baseline = yTop + size;

        int i = 0;
        while (i < text.Length)
        {
            SKTypeface face = null; int run = 0;

            foreach (var f in order)
            {
                int j = i;
                while (j < text.Length && f.ContainsGlyphs(text.AsSpan(i, j - i + 1)))
                    j++;
                if (j > i) { face = f; run = j - i; break; }
            }
            if (face == null) { face = order[0]; run = 1; }

            string s = text.Substring(i, run);
            using (var p = new SKPaint { Typeface = face, TextSize = size, IsAntialias = true })
            {
                canvas.DrawText(s, x, baseline, p);
                x += p.MeasureText(s);
            }
            i += run;
        }
    }

    private static float MeasureTextWithFallback(string text, float size, bool bold,
                                                 IList<SKTypeface> regs, IList<SKTypeface> bolds)
    {
        if (string.IsNullOrEmpty(text)) return 0f;
        var order = bold ? bolds : regs;
        float width = 0f;

        int i = 0;
        while (i < text.Length)
        {
            SKTypeface face = null; int run = 0;
            foreach (var f in order)
            {
                int j = i;
                while (j < text.Length && f.ContainsGlyphs(text.AsSpan(i, j - i + 1)))
                    j++;
                if (j > i) { face = f; run = j - i; break; }
            }
            if (face == null) { face = order[0]; run = 1; }
            string s = text.Substring(i, run);
            using (var p = new SKPaint { Typeface = face, TextSize = size, IsAntialias = true })
                width += p.MeasureText(s);
            i += run;
        }
        return width;
    }

    // ---------- 小工具：token、運算、Sum ----------
    private static string ReplaceTokens(string text, object model)
    {
        if (string.IsNullOrEmpty(text)) return "";
        return Regex.Replace(text, @"\{\{([^}]+)\}\}", m =>
        {
            var expr = m.Groups[1].Value.Trim();
            var parts = expr.Split(new[] { ':' }, 2);
            var core = parts[0].Trim();
            var fmt = parts.Length > 1 ? parts[1].Trim() : null;

            object val;
            if (core.Contains(".Sum(")) val = EvalSum(model, core);
            else if (HasOperator(core)) val = EvalExpr(core, model);
            else val = GetProp(model, core);

            if (val == null) return "";
            if (fmt != null && val is IFormattable f) return f.ToString(fmt, CultureInfo.InvariantCulture);
            return Convert.ToString(val, CultureInfo.InvariantCulture);
        });
    }

    private static string FormatBindingOrExpr(object item, string binding)
    {
        if (string.IsNullOrEmpty(binding)) return "";
        var parts = binding.Split(new[] { ':' }, 2);
        var core = parts[0];
        var fmt = parts.Length > 1 ? parts[1] : null;

        object val = HasOperator(core) ? EvalExpr(core, item) : GetProp(item, core);
        if (val == null) return "";
        if (fmt != null && val is IFormattable f) return f.ToString(fmt, CultureInfo.InvariantCulture);
        return Convert.ToString(val, CultureInfo.InvariantCulture);
    }

    private static bool HasOperator(string s) => s.IndexOfAny(new[] { '+', '-', '*', '/' }) >= 0;

    private static object EvalExpr(string expr, object ctx)
    {
        string replaced = Regex.Replace(expr, @"[A-Za-z_][A-Za-z0-9_.]*", m =>
        {
            var val = GetProp(ctx, m.Value);
            if (val == null) return "0";
            if (val is DateTime dt1) return dt1.Ticks.ToString(CultureInfo.InvariantCulture);
            return Convert.ToDecimal(val, CultureInfo.InvariantCulture).ToString(CultureInfo.InvariantCulture);
        });

        var dt = new DataTable();
        var obj = dt.Compute(replaced, null);
        return Convert.ToDecimal(obj, CultureInfo.InvariantCulture);
    }

    private static object EvalSum(object model, string expr)
    {
        int i1 = expr.IndexOf(".Sum(", StringComparison.Ordinal);
        string listName = expr.Substring(0, i1);
        string inner = expr.Substring(i1 + 5).TrimEnd(')');

        var items = GetProp(model, listName) as IEnumerable;
        if (items == null) return 0m;

        decimal sum = 0m;
        foreach (var it in items)
        {
            object v = HasOperator(inner) ? EvalExpr(inner, it) : GetProp(it, inner);
            if (v == null) continue;
            sum += Convert.ToDecimal(v, CultureInfo.InvariantCulture);
        }
        return sum;
    }

    // 取值：支援 JObject/JToken、IDictionary<string,object>、POCO（含 a.b.c）
    private static object GetProp(object obj, string path)
    {
        if (obj == null || string.IsNullOrWhiteSpace(path)) return null;

        object cur = obj;
        foreach (var seg in path.Split('.'))
        {
            if (cur == null) return null;

            if (cur is JToken jt)
            {
                var tok = jt.Type == JTokenType.Object ? jt[seg] : null;
                if (tok == null) return null;
                cur = (tok is JValue jv) ? jv.Value : tok;
                continue;
            }
            if (cur is IDictionary<string, object> dict)
            {
                if (!dict.TryGetValue(seg, out cur)) return null;
                continue;
            }
            var prop = cur.GetType().GetProperty(seg);
            if (prop == null) return null;
            cur = prop.GetValue(cur, null);
        }
        if (cur is JValue jv2) return jv2.Value;
        return cur;
    }

    private static void DrawGridRow(SKCanvas c, SKPaint p, float x, float y, float rowH, float[] widths)
    {
        float tableW = widths.Sum();
        c.DrawRect(new SKRect(x, y, x + tableW, y + rowH), p);
        float cur = x;
        foreach (var w in widths) { cur += w; c.DrawLine(cur, y, cur, y + rowH, p); }
    }

    private static SKColor ParseColor(string hex)
    {
        if (string.IsNullOrWhiteSpace(hex)) return new SKColor(0, 0, 0);
        hex = hex.Trim().TrimStart('#');
        if (hex.Length == 3) hex = string.Concat(hex.Select(c => $"{c}{c}")); // "abc" → "aabbcc"
        if (hex.Length == 6)
            return new SKColor(
                Convert.ToByte(hex.Substring(0, 2), 16),
                Convert.ToByte(hex.Substring(2, 2), 16),
                Convert.ToByte(hex.Substring(4, 2), 16));
        if (hex.Length == 8) // ARGB
            return new SKColor(
                Convert.ToByte(hex.Substring(2, 2), 16),
                Convert.ToByte(hex.Substring(4, 2), 16),
                Convert.ToByte(hex.Substring(6, 2), 16),
                Convert.ToByte(hex.Substring(0, 2), 16));
        return new SKColor(0, 0, 0);
    }

    // ---------- 模板物件 ----------
    private class PdfTemplate
    {
        public Page page { get; set; }
        public Fonts fonts { get; set; }
        public List<Element> elements { get; set; }
    }
    private class Page { public float width; public float height; public float marginL; public float marginT; public float marginR; public float marginB; }
    private class Fonts { public string regular; public string bold; }
    private class Element
    {
        public string type;   // "text" | "table" | "line"
        public float x; public float y;
        public string dock;   // null | "bottom"

        // anchor/錨點
        public string id;       // 只對 table 有意義
        public string anchor;   // 其他元素可錨到 table 的底端

        // text
        public float size; public bool bold; public string text;

        // 可選的水平對齊參數
        public string halign;   // "left" | "center" | "right"
        public float? boxX;     // 對齊區域起點（不填=marginL）
        public float? boxW;     // 對齊區域寬度（不填=page.width - marginL - marginR）

        // table
        public float rowHeight; public string items; public List<Column> columns;
        public string headerBg;           // ex: "#EEEEEE"
        public int rowStripeEvery;     // ex: 2：每兩列塗一列
        public string rowStripeColor;     // ex: "#F7F7F7"

        // line
        public float x2; public float y2; // 終點
        public float stroke;              // 線寬
        public string color;              // 色碼
    }
    private class Column { public string header; public float width; public string binding; public string align; }
}
