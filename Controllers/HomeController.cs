using System.Web.Mvc;

namespace MESH5_WEBAPI_20250228V2.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            string helpUrl = Url.Action("Index", "Help", new { area = "" });
            return Redirect(helpUrl);
        }
        public ActionResult Index_html()
        {
            return View("Index"); // ✅ 對應 Views/Home/Index.cshtml
        }
    }
}
