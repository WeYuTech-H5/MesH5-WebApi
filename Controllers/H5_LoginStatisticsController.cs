using MESH5_WEBAPI_20250228V2.Services;
using System;
using System.Configuration;
using System.Web.Http;

namespace MESH5_WEBAPI_20250228V2.Controllers
{
    /// <summary>
    /// 提供 SEC_APP_SESSION_REGISTRY 的登入統計 API。
    /// </summary>
    [RoutePrefix("api/login-statistics")]
    public class H5_LoginStatisticsController : ApiController
    {
        private readonly LoginStatisticsService _service = new LoginStatisticsService();

        /// <summary>
        /// 取得目前在線的使用者人數。
        /// </summary>
        [HttpGet]
        [Route("CurrentUser")]
        public IHttpActionResult GetCurrentOnlineUserCount()
        {
            try
            {
                var count = _service.GetCurrentOnlineUserCount();
                var maxOnlineUsers = ConfigurationManager.AppSettings["MaxOnlineUsers"];

                return Ok(new
                {
                    CurrentOnlineUsers = count,
                    MaxOnlineUsers = maxOnlineUsers
                });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        /// <summary>
        /// 取得指定時間區間內的在線人數統計資料。
        /// </summary>
        /// <param name="startDate">統計起始時間</param>
        /// <param name="endDate">統計結束時間</param>
        [HttpGet]
        [Route("")]
        public IHttpActionResult Get(DateTime startDate, DateTime endDate)
        {
            try
            {
                var stats = _service.GetStatistics(startDate, endDate);
                return Ok(stats);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
