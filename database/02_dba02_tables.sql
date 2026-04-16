-- =============================================
-- FAC_DBA02: 主操作 DB 的核心資料表
--
-- 建立順序（因 FK 相依）:
--   systems → sub_systems → employees → feature_permissions
--   operation_logs, sync_state 獨立
-- =============================================
USE FAC_DBA02;
GO

-- ----- systems（系統主檔） -----
-- 三層結構: 部門/課別 (department) → 系統 (system) → 子系統 (sub_system)
-- department 直接存於此表，由 system 推導，不存於 employees
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.systems') AND type = 'U')
BEGIN
    CREATE TABLE dbo.systems (
        code        VARCHAR(20)  NOT NULL PRIMARY KEY,   -- 'EI', 'MECH', 'WTS' ...
        name        NVARCHAR(50) NOT NULL,               -- 顯示名稱（可中文如「消防」）
        department  VARCHAR(20)  NOT NULL,               -- 'building' | 'process' | 'project'
        sort_order  INT          NOT NULL DEFAULT 0
    );
    PRINT 'Table [systems] created.';
END
GO

-- ----- sub_systems（子系統主檔，預留 null 允許） -----
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.sub_systems') AND type = 'U')
BEGIN
    CREATE TABLE dbo.sub_systems (
        code         VARCHAR(20)  NOT NULL PRIMARY KEY,   -- 'CR', 'HVAC', 'GAS', 'CHEM'
        name         NVARCHAR(50) NOT NULL,
        system_code  VARCHAR(20)  NOT NULL,
        sort_order   INT          NOT NULL DEFAULT 0,
        CONSTRAINT FK_sub_systems_system
            FOREIGN KEY (system_code) REFERENCES dbo.systems(code)
    );
    PRINT 'Table [sub_systems] created.';
END
GO

-- ----- employees（合併員工 + 使用者，依 architecture.md 規格） -----
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.employees') AND type = 'U')
BEGIN
    CREATE TABLE dbo.employees (
        id              INT IDENTITY(1,1) PRIMARY KEY,
        employee_no     NVARCHAR(20)  NOT NULL UNIQUE,   -- 員工編號
        name            NVARCHAR(50)  NOT NULL,
        email           NVARCHAR(100) NULL,

        -- 登入相關（有值 = 可登入的使用者）
        username        NVARCHAR(50)  NULL,
        password_hash   NVARCHAR(255) NULL,              -- JWT 模式用
        azure_oid       NVARCHAR(64)  NULL,              -- Entra ID SSO Object ID (預留)
        role            NVARCHAR(20)  NOT NULL DEFAULT 'user',  -- 'user' | 'admin'

        -- 組織歸屬（三層由 systems JOIN 推導 department）
        system_code      VARCHAR(20)  NULL,               -- 允許 null 以便過渡/未歸屬
        sub_system_code  VARCHAR(20)  NULL,               -- 子系統（預留，多數員工為 null）

        is_active       BIT           NOT NULL DEFAULT 1,
        created_at      DATETIME2     NOT NULL DEFAULT GETDATE(),
        updated_at      DATETIME2     NOT NULL DEFAULT GETDATE(),

        CONSTRAINT FK_employees_system
            FOREIGN KEY (system_code) REFERENCES dbo.systems(code),
        CONSTRAINT FK_employees_sub_system
            FOREIGN KEY (sub_system_code) REFERENCES dbo.sub_systems(code)
    );

    -- username / azure_oid 使用 filtered unique index 允許多個 NULL
    CREATE UNIQUE INDEX UQ_employees_username
        ON dbo.employees(username) WHERE username IS NOT NULL;

    CREATE UNIQUE INDEX UQ_employees_azure_oid
        ON dbo.employees(azure_oid) WHERE azure_oid IS NOT NULL;

    PRINT 'Table [employees] created.';
END
GO

-- ----- feature_permissions（功能權限矩陣） -----
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.feature_permissions') AND type = 'U')
BEGIN
    CREATE TABLE dbo.feature_permissions (
        id              INT IDENTITY(1,1) PRIMARY KEY,
        employee_id     INT           NOT NULL,
        feature_code    NVARCHAR(50)  NOT NULL,
        is_enabled      BIT           NOT NULL DEFAULT 1,

        CONSTRAINT FK_feature_permissions_employee
            FOREIGN KEY (employee_id) REFERENCES dbo.employees(id),
        CONSTRAINT UQ_employee_feature
            UNIQUE (employee_id, feature_code)
    );
    PRINT 'Table [feature_permissions] created.';
END
GO

-- ----- operation_logs（操作日誌，只寫不刪） -----
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.operation_logs') AND type = 'U')
BEGIN
    CREATE TABLE dbo.operation_logs (
        id              BIGINT IDENTITY(1,1) PRIMARY KEY,
        user_id         INT           NOT NULL,
        feature         NVARCHAR(50)  NOT NULL,
        action          NVARCHAR(20)  NOT NULL,
        entity_id       NVARCHAR(50)  NULL,
        detail          NVARCHAR(MAX) NULL,
        ip_address      NVARCHAR(45)  NULL,
        created_at      DATETIME2     NOT NULL DEFAULT GETDATE()
    );

    CREATE NONCLUSTERED INDEX IX_operation_logs_feature_date
        ON dbo.operation_logs (feature, created_at);
    CREATE NONCLUSTERED INDEX IX_operation_logs_user_date
        ON dbo.operation_logs (user_id, created_at);

    PRINT 'Table [operation_logs] created.';
END
GO

-- ----- sync_state（同步管線狀態，增量同步基準） -----
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.sync_state') AND type = 'U')
BEGIN
    CREATE TABLE dbo.sync_state (
        job_name              NVARCHAR(100) NOT NULL PRIMARY KEY,
        source_description    NVARCHAR(200) NULL,
        last_synced_event_ts  DATETIME2(7)  NULL,
        last_started_at       DATETIME2     NULL,
        last_finished_at      DATETIME2     NULL,
        last_status           NVARCHAR(20)  NULL,          -- 'success' | 'failed' | 'running'
        last_rows_synced      INT           NULL,
        last_error            NVARCHAR(MAX) NULL,
        created_at            DATETIME2     NOT NULL DEFAULT GETDATE(),
        updated_at            DATETIME2     NOT NULL DEFAULT GETDATE()
    );
    PRINT 'Table [sync_state] created.';
END
GO
