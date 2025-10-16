using System.Web;
using System.Web.Mvc;

namespace MESH5_WEBAPI_20250228V2
{
    public class FilterConfig
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new HandleErrorAttribute());
        }
    }
}
