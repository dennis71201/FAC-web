## DB Schema
### Employee
   + EmployeeId (PK) IDENTITY(1,1)
      - Data Type: int
      - Nullable: NOT NULL
   + EmployeeName
      - Data Type: nvarchar (50)
      - Nullable: NOT NULL
   + EmployeeNumber
      - Data Type: nvarchar (100)
      - Nullable: NOT NULL
   + EmployeeEmail
      - Data Type: nvarchar (150)
      - Nullable: NOT NULL
   + EmployeeDepartment
      - Data Type: nvarchar (200)
      - Nullable: NOT NULL
   + EmployeeSection
      - Data Type: nvarchar (200)
      - Nullable: NOT NULL
   + DepartmentAndSectionId
      - Data Type: int
      - Nullable: NOT NULL
   + CreateTime
      - Data Type: datetime2 (0)
      - Nullable: NOT NULL
   + IsAlive
      - Data Type: bit
      - Nullable: NOT NULL

### AttendanceType
   + AttendanceTypeId (PK) IDENTITY(1,1)
      - Data Type: int
      - Nullable: NOT NULL
   + AttendanceTypeName
      - Data Type: nvarchar (150)
      - Nullable: NOT NULL
   + AttendanceTypeColor
      - Data Type: nvarchar (10)
      - Nullable: NULL

### AttendanceRecord
   + AttendanceRecordId (PK) IDENTITY(1,1)
      - Data Type: int
      - Nullable: NOT NULL
   + EmployeeId (FK)
      - Data Type: int
      - Nullable: NOT NULL
   + AttendanceTypeId (FK)
      - Data Type: int
      - Nullable: NOT NULL
   + StartTime
      - Data Type: datetime2 (0)
      - Nullable: NOT NULL
   + EndTime
      - Data Type: datetime2 (0)
      - Nullable: NOT NULL
   + Note
      - Data Type: nvarchar (500)
      - Nullable: NULL
   + IsAllDay
      - Data Type: bit
      - Nullable: NOT NULL
   + IsAlive
      - Data Type: bit
      - Nullable: NOT NULL

### EmployeePermission
   + EmployeePermissionId (PK) IDENTITY(1,1)
      - Data Type: int
      - Nullable: NOT NULL
   + EmployeeId (FK)
      - Data Type: int
      - Nullable: NOT NULL
   + Role
      - Data Type: nvarchar (50)
      - Nullable: NOT NULL
   + Permission
      - Data Type: json
      - Nullable: NULL

### DepartmentAndSection
   + DepartmentAndSectionId (PK)  IDENTITY(1,1)
      - Data Type: int
      - Nullable: NOT NULL
   + DepartmentName
      - Data Type: nvarchar(200)
      - Nullable: NOT NULL
   + SectionName
      - Data Type: nvarchar(200)
      - Nullable: NOT NULL