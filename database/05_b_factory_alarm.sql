-- =============================================
-- B 廠 Alarm 表（源頭 B1SA01 + 中繼 DBA03）
--
-- 兩個資料庫的 Alarm 表 schema 完全相同，均為 B 廠原始 schema：
--   - EventStamp / EventStampUTC: datetime (非 datetime2(7))
--   - Priority / MilliSec:        smallint (非 int)
--   - 欄位名 UnAckDuration(17)，取代 A 廠的 AlarmDuration(4000)
--
-- 策略：DBA03 純搬運，schema 與 B1SA01 相同
--       型別轉換與欄位合併發生在 DBA03 → DBA02 這一步（由同步程式處理）
-- =============================================

-- ===== B 廠源頭：B1SA01 (內網) =====
USE FAC_B1SA01_Sim;
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.Alarm') AND type = 'U')
BEGIN
    CREATE TABLE dbo.Alarm (
        EventStamp      DATETIME         NULL,
        AlarmState      NVARCHAR(9)      NULL,
        TagName         NVARCHAR(132)    NULL,
        Description     NVARCHAR(255)    NULL,
        Area            NVARCHAR(32)     NULL,
        Type            NVARCHAR(6)      NULL,
        Value           NVARCHAR(131)    NULL,
        CheckValue      NVARCHAR(131)    NULL,
        Priority        SMALLINT         NULL,
        Category        NVARCHAR(8)      NULL,
        Provider        NVARCHAR(65)     NULL,
        Operator        NVARCHAR(131)    NULL,
        DomainName      NVARCHAR(155)    NULL,
        UserFullName    NVARCHAR(255)    NULL,
        UnAckDuration   NVARCHAR(17)     NULL,
        User1           FLOAT            NULL,
        User2           FLOAT            NULL,
        User3           NVARCHAR(131)    NULL,
        EventStampUTC   DATETIME         NULL,
        MilliSec        SMALLINT         NULL,
        OperatorNode    NVARCHAR(131)    NULL
    );

    CREATE NONCLUSTERED INDEX IX_Alarm_EventStamp  ON dbo.Alarm (EventStamp);
    CREATE NONCLUSTERED INDEX IX_Alarm_Area        ON dbo.Alarm (Area);
    CREATE NONCLUSTERED INDEX IX_Alarm_TagName     ON dbo.Alarm (TagName);

    PRINT '[FAC_B1SA01_Sim] Table [Alarm] created.';
END
GO

-- ===== B 廠中繼：DBA03 (外網) =====
USE FAC_DBA03_Sim;
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.Alarm') AND type = 'U')
BEGIN
    CREATE TABLE dbo.Alarm (
        EventStamp      DATETIME         NULL,
        AlarmState      NVARCHAR(9)      NULL,
        TagName         NVARCHAR(132)    NULL,
        Description     NVARCHAR(255)    NULL,
        Area            NVARCHAR(32)     NULL,
        Type            NVARCHAR(6)      NULL,
        Value           NVARCHAR(131)    NULL,
        CheckValue      NVARCHAR(131)    NULL,
        Priority        SMALLINT         NULL,
        Category        NVARCHAR(8)      NULL,
        Provider        NVARCHAR(65)     NULL,
        Operator        NVARCHAR(131)    NULL,
        DomainName      NVARCHAR(155)    NULL,
        UserFullName    NVARCHAR(255)    NULL,
        UnAckDuration   NVARCHAR(17)     NULL,
        User1           FLOAT            NULL,
        User2           FLOAT            NULL,
        User3           NVARCHAR(131)    NULL,
        EventStampUTC   DATETIME         NULL,
        MilliSec        SMALLINT         NULL,
        OperatorNode    NVARCHAR(131)    NULL
    );

    CREATE NONCLUSTERED INDEX IX_Alarm_EventStamp  ON dbo.Alarm (EventStamp);
    CREATE NONCLUSTERED INDEX IX_Alarm_Area        ON dbo.Alarm (Area);
    CREATE NONCLUSTERED INDEX IX_Alarm_TagName     ON dbo.Alarm (TagName);

    PRINT '[FAC_DBA03_Sim] Table [Alarm] created.';
END
GO
