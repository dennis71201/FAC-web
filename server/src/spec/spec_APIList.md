# API List for Frontend

## 說明
本文件列出前端可直接呼叫的後端 API，包含路徑、方法、認證需求、輸入與回傳重點。

Base URL (local):
- http://localhost:3000

共用規則：
1. 除 identify、register、departments-sections 外，所有 API 都需要 Authorization header。
2. Header 格式：Authorization: Bearer <token>
3. 回傳資料主體以 data 為主；失敗時使用 error.code / error.message。

## 1) Health APIs

### GET /api/health
- Auth: 不需要
- 用途: 檢查服務整體狀態
- 回傳重點:
  - status
  - environment
  - components.app
  - components.database

### GET /api/health/ready
- Auth: 不需要
- 用途: readiness probe

### GET /api/health/live
- Auth: 不需要
- 用途: liveness probe

## 2) Auth API

### POST /api/auth/identify
- Auth: 不需要
- 用途: OIDC 失敗時的備援登入，以員工編號辨識並取得後端 token
- Rate limit: 15 分鐘 20 次 / IP

Request body:
{
  "employeeNumber": "FAC-001"
}

Success response (200):
{
  "token": "<jwt>",
  "user": {
    "employeeId": 1,
    "employeeNumber": "FAC-001",
    "name": "王小明",
    "role": "Administrator",
    "permissions": {
      "Attendance Record": true
    }
  }
}

Possible errors:
- 400 BAD_REQUEST (缺 employeeNumber)
- 401 UNAUTHORIZED (員工不存在或非在職)
- 403 FORBIDDEN (找不到 EmployeePermission)
- 429 TOO_MANY_REQUESTS

### POST /api/auth/register
- Auth: 不需要
- 用途: 首次註冊，建立員工資料並直接取得後端 token
- Rate limit: 15 分鐘 20 次 / IP

Request body:
{
  "employeeNumber": "FAC-016",
  "employeeName": "王小華",
  "employeeEmail": "FAC-016@company.com",
  "departmentAndSectionId": 1
}

後端處理規則：
1. 檢查欄位完整性與格式。
2. 以 departmentAndSectionId 查詢 DepartmentAndSection，找不到即拒絕。
3. 以 DepartmentAndSection 對應值寫入 EmployeeDepartment、EmployeeSection（不可由前端覆寫）。
4. 檢查 EmployeeNumber 不可重複。
5. 建立 EmployeePermission：Role=General User，Permission 預設 Attendance Record=true。

Success response (201):
{
  "token": "<jwt>",
  "user": {
    "employeeId": 16,
    "employeeNumber": "FAC-016",
    "name": "王小華",
    "role": "General User",
    "permissions": {
      "Attendance Record": true
    }
  }
}

Possible errors:
- 400 BAD_REQUEST (欄位缺漏、格式錯誤或 departmentAndSectionId 無效)
- 409 EMPLOYEE_NUMBER_CONFLICT (員工編號重複)
- 429 TOO_MANY_REQUESTS
- 500 REGISTER_FAILED

## 3) Department and Section API

### GET /api/departments-sections
- Auth: 不需要
- 用途: 取得註冊頁下拉選單所需的部門與課別對照資料

Success response (200):
{
  "data": [
    {
      "DepartmentAndSectionId": 1,
      "DepartmentName": "Building",
      "SectionName": "EI"
    },
    {
      "DepartmentAndSectionId": 2,
      "DepartmentName": "Building",
      "SectionName": "MECH"
    }
  ]
}

## 4) Employee API

### GET /api/employees
- Auth: 需要
- Permission: 不額外檢查 feature flag
- 用途: 取得在職員工下拉資料（本期登入與出勤流程暫不使用，保留供後續功能）

Success response (200):
{
  "data": [
    {
      "EmployeeId": 1,
      "EmployeeName": "王小明",
      "EmployeeNumber": "FAC-001",
      "EmployeeDepartment": "Building",
      "EmployeeSection": "EI"
    }
  ]
}

## 5) Attendance APIs

### GET /api/attendance/types
- Auth: 需要
- Permission: Attendance Record = true
- 用途: 取得假別與顏色

Success response (200):
{
  "data": [
    {
      "AttendanceTypeId": 1,
      "AttendanceTypeName": "出差",
      "AttendanceTypeColor": "#22c55e"
    }
  ]
}

### GET /api/attendance/records
- Auth: 需要
- Permission: Attendance Record = true
- Query params:
  - employeeId (optional)
  - year (optional)
  - month (optional)

回傳規則：
1. 本 API 為行事曆視圖資料來源，依 year/month 取得整月資料，不使用分頁。
2. 時間欄位使用 ISO 8601。
3. 全天紀錄：StartTime 為 00:00:00，EndTime 為 23:59:59。
4. 支援跨日紀錄（EndTime 可為 StartTime 隔日）。

權限資料範圍：
1. Administrator 可看全部，或用 employeeId 指定查詢。
2. General User 永遠只會拿到自己的資料。

Success response (200):
{
  "data": [
    {
      "AttendanceRecordId": 1,
      "EmployeeId": 1,
      "EmployeeName": "王小明",
      "EmployeeDepartment": "Building",
      "EmployeeSection": "EI",
      "AttendanceTypeId": 2,
      "AttendanceTypeName": "請假",
      "AttendanceTypeColor": "#f97316",
      "StartTime": "2026-04-10T00:00:00.000Z",
      "EndTime": "2026-04-10T23:59:59.000Z",
      "Note": "家庭因素",
      "IsAllDay": true,
      "IsAlive": true
    }
  ]
}

### POST /api/attendance/records
- Auth: 需要
- Permission: Attendance Record = true
- 用途: 建立出勤紀錄

Request body:
{
  "employeeId": 1,
  "attendanceTypeId": 2,
  "startTime": "2026-04-10T00:00:00.000Z",
  "endTime": "2026-04-10T23:59:59.000Z",
  "note": "家庭因素",
  "isAllDay": true
}

規則：
1. General User 僅可建立自己的紀錄。
2. 後端固定新增 IsAlive = 1。

Success response (201):
{
  "data": {
    "attendanceRecordId": 123
  }
}

### DELETE /api/attendance/records/:id
- Auth: 需要
- Permission: Attendance Record = true
- 用途: 軟刪除紀錄

規則：
1. General User 僅可刪除自己的紀錄。
2. 實作為 IsAlive = 0。

Success response (200):
{
  "data": {
    "attendanceRecordId": 123,
    "isAlive": 0
  }
}

Possible errors for Attendance APIs:
- 401 UNAUTHORIZED
- 403 FORBIDDEN
- 404 NOT_FOUND
- 500 server-side query/create/delete failure

## 6) Frontend 呼叫建議流程
1. 首頁載入時先走 OIDC。
2. OIDC 失敗才顯示 employeeNumber 輸入框。
3. 呼叫 POST /api/auth/identify 取得 token。
4. 若 identify 回 401（員工不存在或非在職），可導向註冊流程。
5. 註冊頁先呼叫 GET /api/departments-sections 取得部門課別下拉資料。
6. 呼叫 POST /api/auth/register 完成註冊並取得 token。
7. 將 token 存在前端狀態，後續 API 一律帶 Bearer token。
8. 若回 401，導回登入流程；若回 403，顯示無權限訊息。
