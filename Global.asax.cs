using log4net;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

namespace MESH5_WEBAPI_20250228V2
{
    public class WebApiApplication : System.Web.HttpApplication
    {
        //protected void Application_Start()
        //{
        //    AreaRegistration.RegisterAllAreas();
        //    GlobalConfiguration.Configure(WebApiConfig.Register);
        //    FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
        //    RouteConfig.RegisterRoutes(RouteTable.Routes);
        //    BundleConfig.RegisterBundles(BundleTable.Bundles);
        //}
        public static ILog log;

        public static string Log4ConfigFilePath
        {
            get
            {
                return AppDomain.CurrentDomain.BaseDirectory + @"\\" + ConfigurationSettings.AppSettings["Log4ConfigFileName"];
            }
        }

        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            GlobalConfiguration.Configure(WebApiConfig.Register);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
            try
            {
                log4net.Config.XmlConfigurator.ConfigureAndWatch(new System.IO.FileInfo(Log4ConfigFilePath));
                log = LogManager.GetLogger(this.GetType());
                WeyuBiApi.LogCleaner.CleanLogs(); 
                log.Debug("Start " + System.Reflection.MethodBase.GetCurrentMethod().Name);
                log.Info($"CurrentDomain BaseDirectory: {AppDomain.CurrentDomain.BaseDirectory}");
                log.Info($"Environment CurrentDirectory: {Environment.CurrentDirectory}");
                log.Info($"Environment UserName: {Environment.UserName}");
                log.Info($"Environment MachineName: {Environment.MachineName}");
                log.Info($"Environment OSVersion: {Environment.OSVersion}");
                log.Info($"Environment Is64BitProcess: {Environment.Is64BitProcess}");
                log.Info($"Environment UserDomainName: {Environment.UserDomainName}");
                log.Info($"Environment UserInteractive: {Environment.UserInteractive}");
                log.Info($"Environment ApplicationVirtualPath: { System.Web.Hosting.HostingEnvironment.ApplicationVirtualPath}");

                //登入成功累積
                Application["OnLineLoginCount"] = 0;
                //登入成功總累積
                Application["TotalLoginCount"] = 0;

                //線上累積
                Application["OnLineSessionsCount"] = 0;
                //總累積
                Application["TotalSessionsCount"] = 0;
                //  log.Debug("NumberOfUsersOnline:" + Membership.GetNumberOfUsersOnline().ToString());
                log.Debug("End " + System.Reflection.MethodBase.GetCurrentMethod().Name
                   + ",OnLineSessionsCount:" + Application["OnLineSessionsCount"].ToString()
                   + ",TotalSessionsCount:" + Application["TotalSessionsCount"].ToString()
                   + ",OnLineLoginCount:" + Application["OnLineLoginCount"].ToString()
                   + ",TotalLoginCount:" + Application["TotalLoginCount"].ToString());
            }
            catch (Exception ex)
            {
                //LogErrorMsg(ex);
            }
        }

        protected void Application_PostAuthorizeRequest()
        {
            System.Web.HttpContext.Current.SetSessionStateBehavior(System.Web.SessionState.SessionStateBehavior.Required);
        }

        protected void Application_BeginRequest()
        {
            if (HttpContext.Current.Request.AppRelativeCurrentExecutionFilePath == "~/")
            {
                HttpContext.Current.Response.Redirect("~/Home/Index_html");
            }
        }
    }
}
