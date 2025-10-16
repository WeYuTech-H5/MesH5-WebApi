using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;
using Newtonsoft.Json.Linq;

namespace MESH5_WEBAPI_20250228V2.Controllers
{
    public class H5_PDFController : ApiController
    {
        // 路由 1：/api/pdf/{template}?filename=xxx.pdf
        [HttpPost]
        [Route("api/pdf/{template}")]
        public HttpResponseMessage CreateByRoute(string template,
            [FromBody] JToken payload, [FromUri] string filename = null)
            => CreateInternal(template, payload, filename);

        // 路由 2：/api/pdf/order?tpl=order-simple&filename=xxx.pdf
        [HttpPost]
        [Route("api/pdf/order")]
        public HttpResponseMessage CreateByQuery([FromUri] string tpl,
            [FromBody] JToken payload, [FromUri] string filename = null)
            => CreateInternal(string.IsNullOrWhiteSpace(tpl) ? "order-simple" : tpl, payload, filename);

        private HttpResponseMessage CreateInternal(string template, JToken payload, string filename)
        {
            // 若 Body 為空，給一個空的 JObject，避免 NRE
            var model = (object)(payload ?? new JObject());

            var pdfBytes = PdfTemplateEngine.Render(template, model);

            var safe = SanitizeFileName(string.IsNullOrWhiteSpace(filename) ? $"{template}.pdf" : filename);
            var resp = new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new ByteArrayContent(pdfBytes)
            };
            resp.Content.Headers.ContentType = new MediaTypeHeaderValue("application/pdf");
            resp.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("inline") { FileName = safe };
            return resp;
        }

        private static string SanitizeFileName(string name)
        {
            foreach (var ch in Path.GetInvalidFileNameChars()) name = name.Replace(ch, '_');
            name = name.Trim();
            return string.IsNullOrEmpty(name) ? "document.pdf" : name;
        }
    }
}
