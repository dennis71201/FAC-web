# Spec Update: DB Schema 重命名對應前端更新 — 2026-05-06

> 本次更新為因應後端資料庫將 `DepartmentAndSection` 資料表重命名為 `EmployeeSection`，
> 並調整欄位名稱（`DepartmentName`/`SectionName` → `SectionName`/`SystemName`；
> `EmployeeDepartment`/`EmployeeSection`/`DepartmentAndSectionId` →
> `EmployeeSection`/`EmployeeSystem`/`EmployeeSectionId`），
> 前端所有對應命名一併同步更新。

---

## 變更摘要

| 面向 | 舊命名 | 新命名 |
|------|--------|--------|
| API 端點 | `/api/departments-sections` | `/api/employee-sections` |
| 員工欄位（課別） | `EmployeeDepartment` / `department` | `EmployeeSection` / `section` |
| 員工欄位（系統） | `EmployeeSection` / `section` | `EmployeeSystem` / `system` |
| 外鍵欄位 | `DepartmentAndSectionId` / `departmentAndSectionId` | `EmployeeSectionId` / `employeeSectionId` |
| 課別選項欄位 | `DepartmentName` | `SectionName` |
| 系統選項欄位 | `SectionName` | `SystemName` |

---

## 1. `src/services/authService.js`

**變更內容：**
- `getEmployeeSections()` 函式內 API 呼叫路徑由 `/api/departments-sections` 改為 `/api/employee-sections`
- 回傳資料 mapping 欄位：
  - `item.DepartmentAndSectionId` → `item.EmployeeSectionId`
  - `item.DepartmentName` → `item.SectionName`
  - `item.SectionName` → `item.SystemName`
- 下拉選項 label 格式由 `DepartmentName / SectionName` 改為 `SectionName / SystemName`

---

## 2. `src/services/attendanceService.js`

**變更內容：**
- `mapRecord()` 內欄位 mapping 更新：
  - `item.EmployeeDepartment` → `item.EmployeeSection`（映射至前端 `employeeSection`）
  - `item.EmployeeSection` → `item.EmployeeSystem`（映射至前端 `employeeSystem`）

---

## 3. `src/pages/Register.jsx`

**變更內容：**
- 表單欄位 `name` 由 `departmentAndSectionId` 改為 `employeeSectionId`
- 送出 payload key 由 `departmentAndSectionId` 改為 `employeeSectionId`

---

## 4. `src/pages/AttendanceRecord.jsx`

**變更內容：**
- 篩選狀態變數：
  - `selectedDept` → `selectedSection`
  - `selectedSection` → `selectedSystem`
- `sectionOptions` useMemo：讀取 `record.employeeSection`（原 `record.employeeDepartment`）
- `systemOptions` useMemo：以 `selectedSection` 為依據篩選，讀取 `record.employeeSystem`
- `filteredRecords`：以 `selectedSection` / `selectedSystem` 過濾
- 事件處理函式 `handleDeptChange` → `handleSectionChange`
- Select placeholder 標籤由 `部門` / `課別` 改為 `課別` / `系統`

---

## 5. `src/components/attendance/AttendanceSidebar.jsx`

**變更內容：**
- 側欄分組 key 由 `r.employeeDepartment` / `r.employeeSection` 改為 `r.employeeSection` / `r.employeeSystem`

---

## 6. `src/components/attendance/AttendanceCalendar.jsx`

**變更內容：**
- 內部變數命名全面更新：
  - `deptMap` → `sectionMap`
  - `dept`（迴圈變數）→ `section`
  - `deptRows` → `sectionRows`
- 程式碼註解同步更新（`{ dept → { type → count } }` → `{ section → { type → count } }`）
- JSX 元素屬性：
  - `key={dept}` → `key={section}`
  - `className="cell-dept-row"` → `className="cell-section-row"`
  - `className="cell-dept-label"` → `className="cell-section-label"`
  - `className="cell-dept-badges"` → `className="cell-section-badges"`

---

## 7. `src/styles/attendance.css`

**變更內容：**
CSS 選擇器重命名（配合 AttendanceCalendar.jsx 的 JSX className 變更）：

| 舊選擇器 | 新選擇器 |
|----------|----------|
| `.att-calendar-cell .cell-dept-row` | `.att-calendar-cell .cell-section-row` |
| `.att-calendar-cell .cell-dept-label` | `.att-calendar-cell .cell-section-label` |
| `.att-calendar-cell .cell-dept-badges` | `.att-calendar-cell .cell-section-badges` |

---

## 8. `src/mock/employees.js`

**變更內容：**

### sectionsData 結構更新
依據 `EmployeeSection` 資料表實際資料重建（SectionName → [SystemName]）：

```js
// 舊
export const sectionsData = {
  Building: ['EI', 'MECH', 'FIRE', 'I&C'],
  Process: ['WTS', 'GCS', 'Shift'],
  Project: ['Maint', 'TI'],
};

// 新
export const sectionsData = {
  Building: ['CR', 'EXH', 'HVAC', 'PROCESS', 'EI', 'I&C', 'LSS'],
  Process: ['SHIFT', 'WTS', 'GC'],
  Project: ['TI', 'PROJECT', 'GENERAL AFFAIRS'],
};
```

### 員工物件欄位重命名
- `department`（課別）→ `section`
- `section`（系統）→ `system`

### 員工資料值更新（依 EmployeeSection SQL 實際資料）

| EmployeeId | section | system（舊） | system（新） |
|------------|---------|-------------|-------------|
| FAC-003 | Building | MECH | HVAC |
| FAC-005 | Process | GCS | GC |
| FAC-006 | Project | Maint | PROJECT |
| FAC-008 | Building | FIRE | EXH |
| FAC-010 | Process | GCS | GC |
| FAC-011 | Process | Shift | SHIFT |
| FAC-013 | Building | MECH | HVAC |

> **注意**：`departmentOptions` export 名稱維持不變，保留對 `EmployeeManagement.jsx`（測試版本）的相容性。

---

## 影響範圍確認

| 檔案 | 狀態 |
|------|------|
| `src/services/authService.js` | ✅ 已更新 |
| `src/services/attendanceService.js` | ✅ 已更新 |
| `src/pages/Register.jsx` | ✅ 已更新 |
| `src/pages/AttendanceRecord.jsx` | ✅ 已更新 |
| `src/components/attendance/AttendanceSidebar.jsx` | ✅ 已更新 |
| `src/components/attendance/AttendanceCalendar.jsx` | ✅ 已更新 |
| `src/styles/attendance.css` | ✅ 已更新 |
| `src/mock/employees.js` | ✅ 已更新 |
| `src/pages/EmployeeManagement.jsx` | ⏭ 略過（測試版本，不修改） |

---

## 補充更新（2026-05-08）— department/dept 殘留命名掃描修正

> 針對專案進行全域掃描後，發現下列 `department` / `dept` 相關命名仍使用舊規則，已一併修正。

### `src/services/authService.js`

- 函式名稱 `getDepartmentSections` → `getEmployeeSections`

### `src/pages/Register.jsx`

- import 由 `getDepartmentSections` 改為 `getEmployeeSections`
- 函式呼叫由 `getDepartmentSections()` 改為 `getEmployeeSections()`
- state 變數 `departmentSections` / `setDepartmentSections` → `employeeSections` / `setEmployeeSections`
- useMemo 依賴陣列同步更新

### `src/components/attendance/AttendanceSidebar.jsx`

- 程式碼註解 `// Group records by department-section → employees → records[]`
  → `// Group records by section-system → employees → records[]`

### 補充影響範圍

| 檔案 | 狀態 |
|------|------|
| `src/services/authService.js` | ✅ 函式重命名 |
| `src/pages/Register.jsx` | ✅ import / state 變數重命名 |
| `src/components/attendance/AttendanceSidebar.jsx` | ✅ 註解更新 |

> **未修改**：`mock/employees.js` 的 `departmentOptions` export 名稱、`EmployeeManagement.jsx` 內的 `filterDept` / `department` 欄位，均屬測試版本相容性保留，不在本次修改範圍。
