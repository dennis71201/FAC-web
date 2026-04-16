-- =============================================
-- 建立 4 個資料庫，對應實際架構
--
-- 實際架構:
--   A 廠:  RDS02 (既有)        ─┐
--                                │
--                                ▼
--                           DBA02 (主操作 DB，Web 查這裡)
--                                ▲
--                                │
--                           DBA03 (B 廠中繼)
--                                ▲
--                                │
--   B 廠:  B1SA01 (內網)  ───────┘
--
-- 本機模擬對應:
--   FAC_RDS02_Sim  ←→ A 廠 RDS02 (source, 唯讀)
--   FAC_B1SA01_Sim ←→ B 廠 B1SA01 (source, 唯讀)
--   FAC_DBA03_Sim  ←→ B 廠 DBA03 中繼
--   FAC_DBA02      ←→ 主操作 DB (Web 查詢目標)
-- =============================================

USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'FAC_RDS02_Sim')
    CREATE DATABASE FAC_RDS02_Sim;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'FAC_B1SA01_Sim')
    CREATE DATABASE FAC_B1SA01_Sim;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'FAC_DBA03_Sim')
    CREATE DATABASE FAC_DBA03_Sim;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'FAC_DBA02')
    CREATE DATABASE FAC_DBA02;
GO

PRINT 'All 4 databases created.';
GO
