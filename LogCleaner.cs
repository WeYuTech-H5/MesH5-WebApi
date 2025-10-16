using log4net;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;

namespace WeyuBiApi
{
    public class LogCleaner
    {
        public static void CleanLogs()
        {
            // 每次啟動時執行清理
            DeleteOldFiles("log/info", 30);
            DeleteOldFiles("log/error", 100);
        }

        private static void DeleteOldFiles(string folderPath, int maxFilesToKeep)
        {
            try
            {
                string fullPath = HttpContext.Current.Server.MapPath("~/" + folderPath);
                if (!Directory.Exists(fullPath)) return;

                var logFiles = new DirectoryInfo(fullPath)
                    .GetFiles("*.log")
                    .OrderByDescending(f => f.CreationTime) // 新→舊排序
                    .ToList();

                for (int i = maxFilesToKeep; i < logFiles.Count; i++)
                {
                    logFiles[i].Delete();
                }
            }
            catch (Exception ex)
            {
                var log = LogManager.GetLogger(typeof(LogCleaner));
                log.Error("清理 log 檔案時發生錯誤: " + ex.Message);
            }
        }
    }
}