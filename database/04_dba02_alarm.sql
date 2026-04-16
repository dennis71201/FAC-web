-- =============================================
-- FAC_DBA02.Alarm: 彙整表（A 廠 + B 廠 + 未來 AATT 2）
--
-- 策略：
--   1. 保留 A 廠 21 欄位 + B 廠多出的 UnAckDuration（共 22 欄）
--      A 廠資料：UnAckDuration = NULL
--      B 廠資料：AlarmDuration = NULL
--   2. 型別一律採 A 廠的寬型別：
--      datetime2(7) (非 datetime)、int (非 smallint)
--      同步 B 廠資料時自動轉型（不會精度損失）
--   3. source_factory: 'A' | 'B' | 'AATT2'（預留多值）
--   4. synced_at: 同步寫入時間
-- =============================================
USE FAC_DBA02;
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.Alarm') AND type = 'U')
BEGIN
    CREATE TABLE dbo.Alarm (
        -- DBA02 自增主鍵（source 表無 PK，此處自建以利 upsert/排序）
        id              BIGINT IDENTITY(1,1) PRIMARY KEY,

        -- ===== source 原 21 欄位 =====
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
        AlarmDuration   NVARCHAR(4000)   NULL,       -- A 廠專屬
        UnAckDuration   NVARCHAR(17)     NULL,       -- B 廠專屬
        User1           FLOAT            NULL,
        User2           FLOAT            NULL,
        User3           NVARCHAR(131)    NULL,
        EventStampUTC   DATETIME2(7)     NULL,
        MilliSec        INT              NULL,
        OperatorNode    NVARCHAR(131)    NULL,

        -- ===== DBA02 額外欄位 =====
        source_factory  VARCHAR(10)      NOT NULL,        -- 'A', 'B', 'AATT2' 預留
        synced_at       DATETIME2(7)     NOT NULL DEFAULT SYSUTCDATETIME(),

        -- ===== Edit 功能欄位（使用者可對個別 Alarm 補充描述與指定交接人） =====
        edit_note       NVARCHAR(500)    NULL,            -- 人工補充描述
        handover_user   NVARCHAR(50)     NULL,            -- 交接給誰（員工姓名/編號）
        edited_at       DATETIME2(0)     NULL,            -- 最後編輯時間
        edited_by       NVARCHAR(50)     NULL             -- 編輯者 username
    );

    -- Web 查詢常用欄位建索引
    CREATE NONCLUSTERED INDEX IX_Alarm_EventStamp  ON dbo.Alarm (EventStamp);
    CREATE NONCLUSTERED INDEX IX_Alarm_Area        ON dbo.Alarm (Area);
    CREATE NONCLUSTERED INDEX IX_Alarm_TagName     ON dbo.Alarm (TagName);
    CREATE NONCLUSTERED INDEX IX_Alarm_SourceFactory ON dbo.Alarm (source_factory);

    -- 複合索引：增量同步時常用 source_factory + EventStamp 判斷
    CREATE NONCLUSTERED INDEX IX_Alarm_Source_EventStamp
        ON dbo.Alarm (source_factory, EventStamp);

    PRINT '[FAC_DBA02] Table [Alarm] created.';
END
GO
