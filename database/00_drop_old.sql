-- =============================================
-- 清除所有 FAC_* 資料庫（開發階段重建用）
-- ⚠️ 此腳本會刪除整個資料庫，包含所有資料
-- =============================================

USE master;
GO

-- ----- 舊版命名（第一版 demo 用） -----
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'FAC_Alarm_A')
BEGIN
    ALTER DATABASE FAC_Alarm_A SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE FAC_Alarm_A;
    PRINT 'Dropped [FAC_Alarm_A]';
END
GO

IF EXISTS (SELECT name FROM sys.databases WHERE name = 'FAC_Alarm_B')
BEGIN
    ALTER DATABASE FAC_Alarm_B SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE FAC_Alarm_B;
    PRINT 'Dropped [FAC_Alarm_B]';
END
GO

IF EXISTS (SELECT name FROM sys.databases WHERE name = 'FAC_Main')
BEGIN
    ALTER DATABASE FAC_Main SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE FAC_Main;
    PRINT 'Dropped [FAC_Main]';
END
GO

-- ----- 目前版本命名（對應實際架構） -----
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'FAC_DBA02')
BEGIN
    ALTER DATABASE FAC_DBA02 SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE FAC_DBA02;
    PRINT 'Dropped [FAC_DBA02]';
END
GO

IF EXISTS (SELECT name FROM sys.databases WHERE name = 'FAC_RDS02_Sim')
BEGIN
    ALTER DATABASE FAC_RDS02_Sim SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE FAC_RDS02_Sim;
    PRINT 'Dropped [FAC_RDS02_Sim]';
END
GO

IF EXISTS (SELECT name FROM sys.databases WHERE name = 'FAC_B1SA01_Sim')
BEGIN
    ALTER DATABASE FAC_B1SA01_Sim SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE FAC_B1SA01_Sim;
    PRINT 'Dropped [FAC_B1SA01_Sim]';
END
GO

IF EXISTS (SELECT name FROM sys.databases WHERE name = 'FAC_DBA03_Sim')
BEGIN
    ALTER DATABASE FAC_DBA03_Sim SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE FAC_DBA03_Sim;
    PRINT 'Dropped [FAC_DBA03_Sim]';
END
GO
