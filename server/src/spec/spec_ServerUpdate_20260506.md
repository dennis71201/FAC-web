# Spec Update: DB Schema 重命名對應後端更新 — 2026-05-06

> 本次更新為因應資料庫將 `DepartmentAndSection` 資料表重命名為 `EmployeeSection`，
> 並調整欄位名稱，後端所有路由、測試、Schema 全面同步更新。

---

## 資料庫變更摘要

### 資料表重命名

| 舊名稱 | 新名稱 |
|--------|--------|
| `DepartmentAndSection` | `EmployeeSection` |

### 欄位重命名（`EmployeeSection` 資料表）

| 舊欄位 | 新欄位 |
|--------|--------|
| `DepartmentAndSectionId` (PK) | `EmployeeSectionId` (PK) |
| `DepartmentName` | `SectionName` |
| `SectionName` | `SystemName` |

### 欄位重命名（`Employee` 資料表）

| 舊欄位 | 新欄位 |
|--------|--------|
| `EmployeeDepartment` | `EmployeeSection` |
| `EmployeeSection` | `EmployeeSystem` |
| `DepartmentAndSectionId` (FK) | `EmployeeSectionId` (FK) |

### 條件約束重命名

| 舊名稱 | 新名稱 |
|--------|--------|
| `UQ_DeptAndSection` | `UQ_EmployeeSection` |
| `FK_Employee_DeptAndSection` | `FK_Employee_EmployeeSection` |

---

## 變更檔案清單

### 1. `db/schema.sql`

**變更內容：**
- `CREATE TABLE DepartmentAndSection` → `CREATE TABLE EmployeeSection`
- PK `DepartmentAndSectionId` → `EmployeeSectionId`
- 欄位 `DepartmentName` / `SectionName` → `SectionName` / `SystemName`
- CONSTRAINT `UQ_DeptAndSection` → `UQ_EmployeeSection`
- `Employee` 資料表欄位 `EmployeeDepartment` / `EmployeeSection` / `DepartmentAndSectionId`
  → `EmployeeSection` / `EmployeeSystem` / `EmployeeSectionId`
- FK CONSTRAINT `FK_Employee_DeptAndSection` → `FK_Employee_EmployeeSection`

---

### 2. `app.js`

**變更內容：**
- import 路由由 `departmentsSectionsRouter` (`./src/routes/departmentsSections.js`) 改為 `employeeSectionsRouter` (`./src/routes/employeeSections.js`)
- `app.use('/api', departmentsSectionsRouter)` → `app.use('/api', employeeSectionsRouter)`

---

### 3. `src/routes/employeeSections.js`（原 `departmentsSections.js`，檔案已重命名）

**變更內容：**
- API 端點：`GET /departments-sections` → `GET /employee-sections`
- SQL 查詢：`SELECT DepartmentAndSectionId, DepartmentName, SectionName FROM DepartmentAndSection ORDER BY DepartmentAndSectionId`
  → `SELECT EmployeeSectionId, SectionName, SystemName FROM EmployeeSection ORDER BY EmployeeSectionId`
- 錯誤代碼：`DEPT_SECTIONS_QUERY_FAILED` → `EMPLOYEE_SECTIONS_QUERY_FAILED`
- 日誌前綴：`[DEPT-SECTIONS]` → `[EMPLOYEE-SECTIONS]`

---

### 4. `src/routes/auth.js`

**變更內容：**

#### `POST /api/auth/identify`
- 請求 body 參數 `departmentAndSectionId` → `employeeSectionId`
- 查詢 `EmployeeSection` 資料表（原 `DepartmentAndSection`）
- 查詢條件欄位 `DepartmentAndSectionId` → `EmployeeSectionId`
- mapping 讀取欄位 `mapping.DepartmentName` / `mapping.SectionName` / `mapping.DepartmentAndSectionId`
  → `mapping.SectionName` / `mapping.SystemName` / `mapping.EmployeeSectionId`
- JWT payload 欄位 `employeeSection` / `employeeSystem` 同步更新

#### `POST /api/auth/register`
- 請求 body 參數 `departmentAndSectionId` → `employeeSectionId`
- 查詢 `EmployeeSection` 資料表（原 `DepartmentAndSection`）
- 查詢條件欄位 `DepartmentAndSectionId` → `EmployeeSectionId`
- INSERT 欄位：`EmployeeDepartment` / `EmployeeSection` / `DepartmentAndSectionId`
  → `EmployeeSection` / `EmployeeSystem` / `EmployeeSectionId`
- 輸入變數命名：`employeeSection` / `employeeSystem` / `employeeSectionId`

---

### 5. `src/routes/employees.js`

**變更內容：**
- SELECT 欄位 `EmployeeDepartment`, `EmployeeSection` → `EmployeeSection`, `EmployeeSystem`

---

### 6. `src/routes/attendance.js`

**變更內容：**
- JOIN 查詢 SELECT 欄位 `e.EmployeeDepartment`, `e.EmployeeSection` → `e.EmployeeSection`, `e.EmployeeSystem`

---

### 7. `tests/employeeSections.test.js`（原 `departmentsSections.test.js`，檔案已重命名）

**變更內容：**
- 測試 API 路徑：`/api/departments-sections` → `/api/employee-sections`
- 回傳屬性斷言：`DepartmentAndSectionId` / `DepartmentName` / `SectionName`
  → `EmployeeSectionId` / `SectionName` / `SystemName`
- 排序依據：`r.DepartmentAndSectionId` → `r.EmployeeSectionId`
- label 驗證格式：`${r.DepartmentName}/${r.SectionName}` → `${r.SectionName}/${r.SystemName}`
- describe / it 描述文字同步更新

---

### 8. `tests/auth.test.js`

**變更內容：**
- 測試 payload key：`departmentAndSectionId: 1` → `employeeSectionId: 1`
- 測試描述文字同步更新

---

### 9. `tests/employees.test.js`

**變更內容：**
- `toHaveProperty('EmployeeDepartment')` → `toHaveProperty('EmployeeSection')`
- `toHaveProperty('EmployeeSection')` → `toHaveProperty('EmployeeSystem')`

---

### 10. `tests/attendance.test.js`

**變更內容：**
- 同 `employees.test.js`，回傳屬性斷言欄位同步更新

---

### 11. `tests/README.md`

**變更內容：**
- 測試表格更新：`departmentsSections.test.js` → `employeeSections.test.js`
- API 端點欄位：`/api/departments-sections` → `/api/employee-sections`
- 測試案例說明：`EmployeeSection 9 種`

---

## 影響範圍確認

| 檔案 | 異動類型 | 狀態 |
|------|----------|------|
| `db/schema.sql` | 欄位重命名、資料表重命名 | ✅ 已更新 |
| `app.js` | import 與路由掛載 | ✅ 已更新 |
| `src/routes/employeeSections.js` | 檔案重命名 + 端點 + SQL | ✅ 已更新 |
| `src/routes/auth.js` | body params + SQL + INSERT | ✅ 已更新 |
| `src/routes/employees.js` | SELECT 欄位 | ✅ 已更新 |
| `src/routes/attendance.js` | JOIN SELECT 欄位 | ✅ 已更新 |
| `tests/employeeSections.test.js` | 檔案重命名 + 斷言 | ✅ 已更新 |
| `tests/auth.test.js` | payload key | ✅ 已更新 |
| `tests/employees.test.js` | 屬性斷言 | ✅ 已更新 |
| `tests/attendance.test.js` | 屬性斷言 | ✅ 已更新 |
| `tests/README.md` | 文件更新 | ✅ 已更新 |
