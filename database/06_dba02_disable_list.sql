-- =============================================
-- FAC_DBA02.DisableList: Alarm 停用清單（DBA02 權威）
--
-- 用途：
--   Admin 透過 Web 維護此表，查詢 Alarm 時 JOIN 此表做過濾
--   此表是 DBA02 owned，不從 source DB 同步
--
-- 欄位設計：
--   - 基本欄位參照 A 廠 source 的 DisableList schema（11 欄）
--   - 文字欄位型別升為 NVARCHAR 以支援中文說明
--   - factory: 'A' / 'B' / 'ALL'，指定 disable 適用的廠區
--   - created_at / updated_at: DBA02 追蹤用時間戳
-- =============================================
USE FAC_DBA02;
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.DisableList') AND type = 'U')
BEGIN
    CREATE TABLE dbo.DisableList (
        id              INT IDENTITY(1,1) PRIMARY KEY,

        -- ===== 對應 source schema 的欄位 =====
        Tag_Type        NVARCHAR(2)     NULL,
        Operate_Time    DATETIME2(0)    NOT NULL DEFAULT GETDATE(),  -- 維護時間（自動）
        Tag_Node        NVARCHAR(10)    NULL,
        Tag_Name        NVARCHAR(30)    NOT NULL,                     -- 被停用的 Alarm Tag
        Tag_Desc        NVARCHAR(100)   NULL,
        Tag_Value       NVARCHAR(10)    NULL,
        Operate_User    NVARCHAR(20)    NOT NULL,                     -- admin username
        Operate_Node    NVARCHAR(10)    NULL,
        Restore_Date    DATE            NULL,                         -- 到期後自動恢復（可 null = 永久 disable）
        Disable_Reason  NVARCHAR(100)   NULL,
        Tag_PIC         NVARCHAR(100)   NULL,                         -- 負責人

        -- ===== DBA02 擴充欄位 =====
        factory         VARCHAR(10)     NOT NULL,                     -- 'A' | 'B' | 'ALL'
        is_active       BIT             NOT NULL DEFAULT 1,           -- 軟刪除，false = 已被 admin 移除不再生效
        created_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
        updated_at      DATETIME2       NOT NULL DEFAULT GETDATE(),

        -- factory 值域限制
        CONSTRAINT CK_DisableList_factory
            CHECK (factory IN ('A', 'B', 'ALL')),

        -- 同一 Tag_Name + factory 組合只能有一筆生效（is_active=1）
        -- 注意：SQL Server 的 UNIQUE 含 null 時只允許一個，此處 factory 為 NOT NULL 所以無疑慮
        CONSTRAINT UQ_DisableList_Tag_Factory
            UNIQUE (Tag_Name, factory)
    );

    -- 常用查詢索引
    CREATE NONCLUSTERED INDEX IX_DisableList_TagName
        ON dbo.DisableList (Tag_Name) WHERE is_active = 1;

    CREATE NONCLUSTERED INDEX IX_DisableList_factory
        ON dbo.DisableList (factory) WHERE is_active = 1;

    PRINT '[FAC_DBA02] Table [DisableList] created.';
END
GO
