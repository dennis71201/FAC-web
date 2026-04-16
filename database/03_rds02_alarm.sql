-- =============================================
-- FAC_RDS02_Sim: 模擬 A 廠既有 RDS02 上的 Alarm 表
-- 結構完全對應實際 dbo.Alarm 的 21 個欄位
-- =============================================
USE FAC_RDS02_Sim;
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.Alarm') AND type = 'U')
BEGIN
    CREATE TABLE dbo.Alarm (
        EventStamp      DATETIME2(7)     NULL,
        AlarmState      NVARCHAR(9)      NULL,
        TagName         NVARCHAR(132)    NULL,
        Description     NVARCHAR(255)    NULL,
        Area            NVARCHAR(32)     NULL,
        Type            NVARCHAR(6)      NULL,
        Value           NVARCHAR(131)    NULL,
        CheckValue      NVARCHAR(131)    NULL,
        Priority        INT              NULL,
        Category        NVARCHAR(8)      NULL,
        Provider        NVARCHAR(65)     NULL,
        Operator        NVARCHAR(131)    NULL,
        DomainName      NVARCHAR(155)    NULL,
        UserFullName    NVARCHAR(255)    NULL,
        AlarmDuration   NVARCHAR(4000)   NULL,
        User1           FLOAT            NULL,
        User2           FLOAT            NULL,
        User3           NVARCHAR(131)    NULL,
        EventStampUTC   DATETIME2(7)     NULL,
        MilliSec        INT              NULL,
        OperatorNode    NVARCHAR(131)    NULL
    );

    CREATE NONCLUSTERED INDEX IX_Alarm_EventStamp  ON dbo.Alarm (EventStamp);
    CREATE NONCLUSTERED INDEX IX_Alarm_Area        ON dbo.Alarm (Area);
    CREATE NONCLUSTERED INDEX IX_Alarm_TagName     ON dbo.Alarm (TagName);

    PRINT '[FAC_RDS02_Sim] Table [Alarm] created.';
END
GO
