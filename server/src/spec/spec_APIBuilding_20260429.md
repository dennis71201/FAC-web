# Phase 2 API Building Spec (2026-04-29)

## 文件目的
本文件記錄 Phase 2 後端 API 的實作內容、設計決策、權限規則、已完成驗證結果與後續待辦，作為開發與維護依據。

## 實作範圍
Phase 2.5 已完成以下後端能力：

1. Auth fallback endpoint
- 實作檔案：src/routes/auth.js
- 端點：POST /api/auth/identify
- 功能：當前端 OIDC 流程失敗時，使用 EmployeeNumber 辨識使用者並簽發後端 JWT。

2. 註冊 API
- 實作檔案：src/routes/auth.js
- 端點：POST /api/auth/register
- 功能：建立新員工資料與預設權限，並直接簽發後端 JWT。

3. 部門課別對照 API
- 實作檔案：src/routes/departmentsSections.js
- 端點：GET /api/departments-sections
- 功能：提供註冊頁使用的 DepartmentAndSection 下拉資料。

4. 員工清單 API
- 實作檔案：src/routes/employees.js
- 端點：GET /api/employees
- 功能：回傳在職員工清單 (IsAlive = 1)。

5. 出勤類型 API
- 實作檔案：src/routes/attendance.js
- 端點：GET /api/attendance/types
- 功能：回傳出勤類型清單。

6. 出勤紀錄 API
- 實作檔案：src/routes/attendance.js
- 端點：
  - GET /api/attendance/records
  - POST /api/attendance/records
  - DELETE /api/attendance/records/:id
- 功能：查詢、建立、軟刪除出勤紀錄。

7. 功能權限中介層
- 實作檔案：src/middleware/permission.js
- 功能：requirePermission(featureName) 檢查 req.user.permissions[featureName]。

8. 路由掛載
- 實作檔案：app.js
- 掛載路徑：
  - /api (departments-sections)
  - /api/auth
  - /api/employees
  - /api/attendance

## 認證與授權模型

### 認證
1. 主要流程：前端先嘗試 OIDC。
2. 備援流程：OIDC 失敗時，前端呼叫 POST /api/auth/identify 送出 employeeNumber。
3. 若 identify 回 401，前端可進入註冊流程：GET /api/departments-sections -> POST /api/auth/register。
4. identify/register 成功後，後端簽發 JWT (HS256, 8h) 給前端後續 API 呼叫。
5. 受保護 API 透過 Authorization: Bearer <token> 驗證。

### JWT payload
identify 成功後 token payload 欄位：
- employeeId
- employeeNumber
- role
- permissions
- name

### 授權
1. Feature 權限：
- requirePermission('Attendance Record')
- 無權限回傳 403 FORBIDDEN

2. Role 資料範圍：
- Administrator：可看/改所有人資料
- General User：僅可操作自己的 AttendanceRecord

## API 實作規則

### POST /api/auth/identify
1. 輸入驗證
- employeeNumber 必填，空值回 400 BAD_REQUEST。

2. 員工驗證
- 從 Employee 以 EmployeeNumber 查詢。
- 條件：必須存在且 IsAlive = 1，否則回 401 UNAUTHORIZED。

3. 權限驗證
- 查詢 EmployeePermission。
- 若找不到 permission row，回 403 FORBIDDEN (default deny)。

4. 風險防護
- 端點專屬 rate limit：15 分鐘內每 IP 最多 20 次。

### POST /api/auth/register
1. 輸入驗證
- 必填：employeeNumber, employeeName, employeeEmail, departmentAndSectionId。
- employeeEmail 格式不合法回 400 BAD_REQUEST。

2. 重複檢查 (目前採應用層)
- 先以 EmployeeNumber 查詢 Employee。
- 若已存在，回 409 EMPLOYEE_NUMBER_CONFLICT。

3. DepartmentAndSection 驗證與映射
- 以 departmentAndSectionId 查詢 DepartmentAndSection。
- 若不存在，回 400 BAD_REQUEST。
- 由後端將 DepartmentName / SectionName 寫入 EmployeeDepartment / EmployeeSection。

4. 資料寫入
- 新增 Employee：
  - EmployeeName
  - EmployeeNumber
  - EmployeeEmail
  - EmployeeDepartment
  - EmployeeSection
  - DepartmentAndSectionId
  - CreateTime = SYSDATETIME()
  - IsAlive = 1
- 新增 EmployeePermission：
  - Role = General User
  - Permission = {"Attendance Record": true}

5. 成功回應
- 回 201，內容與 identify 相同結構：token + user。

6. 風險防護
- 與 identify 使用同一組 rate limit：15 分鐘內每 IP 最多 20 次。

### GET /api/departments-sections
1. 認證需求
- 不需要 Bearer token。

2. 回傳內容
- 從 DepartmentAndSection 依 DepartmentAndSectionId 排序回傳：
  - DepartmentAndSectionId
  - DepartmentName
  - SectionName

### GET /api/employees
1. 認證需求
- 需要 Bearer token。

2. 資料過濾
- 只回傳 Employee.IsAlive = 1。

3. 回傳欄位
- EmployeeId, EmployeeName, EmployeeNumber, EmployeeDepartment, EmployeeSection

### GET /api/attendance/types
1. 認證需求
- 需要 Bearer token。

2. 權限需求
- Attendance Record 權限必須為 true。

3. 回傳欄位
- AttendanceTypeId, AttendanceTypeName, AttendanceTypeColor

### GET /api/attendance/records
1. 認證與權限
- 需要 Bearer token。
- 需要 Attendance Record 權限。

2. Query 參數
- employeeId (optional)
- year (optional)
- month (optional)

3. 資料範圍
- General User：強制查自己 employeeId。
- Administrator：可依 employeeId 查詢指定人員或查全部。

4. 資料過濾
- AttendanceRecord.IsAlive = 1
- Employee.IsAlive = 1

5. 回傳欄位
- AttendanceRecordId, EmployeeId, EmployeeName, EmployeeDepartment, EmployeeSection
- AttendanceTypeId, AttendanceTypeName, AttendanceTypeColor
- StartTime, EndTime, Note, IsAllDay, IsAlive

### POST /api/attendance/records
1. 必填欄位
- employeeId, attendanceTypeId, startTime, endTime

2. 權限規則
- 需要 Attendance Record 權限。
- General User 只能建立自己的紀錄。

3. 資料寫入
- 新增 AttendanceRecord 並固定寫入 IsAlive = 1。

### DELETE /api/attendance/records/:id
1. 軟刪除
- 將 IsAlive 更新為 0，不做實體刪除。

2. 權限規則
- 需要 Attendance Record 權限。
- General User 僅可刪除自己的紀錄。

3. 404 條件
- 記錄不存在
- 或已經刪除 (IsAlive 已為 0)

## 錯誤格式
整體遵循既有 API 錯誤格式：
- error.code
- error.message

常見 code：
- BAD_REQUEST
- UNAUTHORIZED
- INVALID_TOKEN
- FORBIDDEN
- NOT_FOUND
- TOO_MANY_REQUESTS
- IDENTIFY_FAILED
- REGISTER_FAILED
- EMPLOYEE_NUMBER_CONFLICT
- ATTENDANCE_RECORD_CREATE_FAILED
- ATTENDANCE_RECORD_DELETE_FAILED
- EMPLOYEES_QUERY_FAILED
- ATTENDANCE_TYPES_QUERY_FAILED
- ATTENDANCE_RECORDS_QUERY_FAILED
- DEPARTMENTS_SECTIONS_QUERY_FAILED

## 已完成驗證 (Smoke Test)
本地環境已完成以下驗證：

1. departments-sections endpoint
- departments_sections_count = 9

2. identify endpoint
- identify_ok = True

3. register endpoint
- register_status = 201 (valid payload)
- duplicate_status = 409 (EmployeeNumber 重複)
- invalid_dsid_status = 400 (departmentAndSectionId 無效)

4. 出勤 records 回傳欄位對齊
- records_has_employee_department = True
- records_has_employee_section = True

5. 出勤類型
- types_count = 5

6. 出勤紀錄
- records_count = 26 (依目前測試資料與過濾條件)

7. 權限阻擋
- FAC-003 查詢 records 回 403，符合需求

## 已知事項與後續建議
1. 目前 verifyToken 以 JWT_SECRET 驗證 token，OIDC JWKS 驗證仍屬後續強化項。
2. EmployeeNumber 唯一性目前採用應用層 pre-check；是否升級為 DB unique key 待客戶確認。
3. 可考慮將 register 的 Employee + EmployeePermission 寫入包成 DB transaction。
4. 可在下一版補上 records 分頁格式：data, total, page, pageSize。
5. 可補上 OpenAPI 文件與 Postman collection，降低前後端對接成本。
