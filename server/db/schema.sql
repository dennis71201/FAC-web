-- =============================================================================
-- MTB_FAC_OPS_WEB Schema
-- 依 DB_schema.md 建立 5 張資料表 + FK + JSON CHECK 約束
-- 相容 SQL Server 2019+ / 2022
-- 使用方式：
--   1. 連到 SQL Server（建議用 master DB）
--   2. 執行此檔（會自動建立 DB 並切換至該 DB）
--   3. 接著依序執行 5 個 INSERT 腳本
-- =============================================================================

-- 1. Database --------------------------------------------------------------
IF DB_ID('MTB_FAC_OPS_WEB') IS NULL
BEGIN
    CREATE DATABASE [MTB_FAC_OPS_WEB] COLLATE Chinese_Taiwan_Stroke_CI_AS;
END
GO

USE [MTB_FAC_OPS_WEB];
GO

-- 2. DepartmentAndSection --------------------------------------------------
IF OBJECT_ID('dbo.DepartmentAndSection', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.DepartmentAndSection (
        DepartmentAndSectionId  INT IDENTITY(1,1)  NOT NULL,
        DepartmentName          NVARCHAR(200)      NOT NULL,
        SectionName             NVARCHAR(200)      NOT NULL,
        CONSTRAINT PK_DepartmentAndSection PRIMARY KEY (DepartmentAndSectionId)
    );
END
GO

-- 3. AttendanceType --------------------------------------------------------
IF OBJECT_ID('dbo.AttendanceType', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.AttendanceType (
        AttendanceTypeId    INT IDENTITY(1,1)  NOT NULL,
        AttendanceTypeName  NVARCHAR(150)      NOT NULL,
        AttendanceTypeColor NVARCHAR(10)       NULL,
        CONSTRAINT PK_AttendanceType PRIMARY KEY (AttendanceTypeId)
    );
END
GO

-- 4. Employee --------------------------------------------------------------
IF OBJECT_ID('dbo.Employee', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Employee (
        EmployeeId              INT IDENTITY(1,1)  NOT NULL,
        EmployeeName            NVARCHAR(50)       NOT NULL,
        EmployeeNumber          NVARCHAR(100)      NOT NULL,
        EmployeeEmail           NVARCHAR(150)      NOT NULL,
        EmployeeDepartment      NVARCHAR(200)      NOT NULL,
        EmployeeSection         NVARCHAR(200)      NOT NULL,
        DepartmentAndSectionId  INT                NOT NULL,
        CreateTime              DATETIME2(0)       NOT NULL,
        IsAlive                 BIT                NOT NULL,
        CONSTRAINT PK_Employee PRIMARY KEY (EmployeeId),
        CONSTRAINT FK_Employee_DepartmentAndSection
            FOREIGN KEY (DepartmentAndSectionId)
            REFERENCES dbo.DepartmentAndSection(DepartmentAndSectionId)
    );
END
GO

-- 5. EmployeePermission ----------------------------------------------------
IF OBJECT_ID('dbo.EmployeePermission', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.EmployeePermission (
        EmployeePermissionId  INT IDENTITY(1,1)  NOT NULL,
        EmployeeId            INT                NOT NULL,
        [Role]                NVARCHAR(50)       NOT NULL,
        Permission            NVARCHAR(1000)     NULL,
        CONSTRAINT PK_EmployeePermission PRIMARY KEY (EmployeePermissionId),
        CONSTRAINT FK_EmployeePermission_Employee
            FOREIGN KEY (EmployeeId)
            REFERENCES dbo.Employee(EmployeeId),
        CONSTRAINT CK_EmployeePermission_PermissionJson
            CHECK (Permission IS NULL OR ISJSON(Permission) = 1)
    );
END
GO

-- 6. AttendanceRecord ------------------------------------------------------
IF OBJECT_ID('dbo.AttendanceRecord', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.AttendanceRecord (
        AttendanceRecordId  INT IDENTITY(1,1)  NOT NULL,
        EmployeeId          INT                NOT NULL,
        AttendanceTypeId    INT                NOT NULL,
        StartTime           DATETIME2(0)       NOT NULL,
        EndTime             DATETIME2(0)       NOT NULL,
        Note                NVARCHAR(500)      NULL,
        IsAllDay            BIT                NOT NULL,
        IsAlive             BIT                NOT NULL,
        CONSTRAINT PK_AttendanceRecord PRIMARY KEY (AttendanceRecordId),
        CONSTRAINT FK_AttendanceRecord_Employee
            FOREIGN KEY (EmployeeId)
            REFERENCES dbo.Employee(EmployeeId),
        CONSTRAINT FK_AttendanceRecord_AttendanceType
            FOREIGN KEY (AttendanceTypeId)
            REFERENCES dbo.AttendanceType(AttendanceTypeId)
    );
END
GO

-- 完成提示
PRINT 'Schema created. Now run INSERT scripts in this order:';
PRINT '  1. Insert_DepartmentSection.sql';
PRINT '  2. Insert_AttendanceType.sql';
PRINT '  3. Insert_Employee.sql';
PRINT '  4. Insert_EmployeePermission.sql';
PRINT '  5. Insert_AttendanceRecord.sql';
