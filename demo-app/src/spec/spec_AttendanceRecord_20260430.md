# Spec Update: Attendance Record (出勤行事曆) — 2026-04-30

> 本次為出勤頁面從 mock 資料全面改為後端 API 驅動的里程碑更新。

---

## 變更摘要

本次更新涵蓋五大面向：

1. **API 驅動**：出勤資料來源由 mock 全面改為後端 REST API，包含查詢、新增、軟刪除
2. **出勤類別動態載入**：假別與顏色不再寫死，改由 `GET /api/attendance/types` 動態取得
3. **跨日紀錄支援**：側欄正確顯示跨日時間區間與時數
4. **行事曆 Badge 格式修正**：Badge 顯示改為「假別 + 空格 + 人數」（如 `公假 1`）
5. **刪除權限前端保護**：一般使用者僅能看到並刪除自己的紀錄刪除按鈕

---

## 1. 新增服務層

### `src/services/attendanceService.js`

封裝出勤相關 API 呼叫，統一資料 mapping（DB PascalCase → 前端 camelCase）。

| 函式 | 方法 | 端點 | 說明 |
|------|------|------|------|
| `getAttendanceTypes()` | GET | `/api/attendance/types` | 取得假別清單 |
| `getAttendanceRecords(query)` | GET | `/api/attendance/records` | 依年月查詢出勤紀錄 |
| `createAttendanceRecord(payload)` | POST | `/api/attendance/records` | 新增出勤紀錄 |
| `deleteAttendanceRecord(id)` | DELETE | `/api/attendance/records/:id` | 軟刪除出勤紀錄 |

#### API 回傳資料 mapping

後端欄位（PascalCase）→ 前端物件（camelCase）：

| 後端欄位 | 前端欄位 | 型別 |
|---------|---------|------|
| `AttendanceRecordId` | `id` | number |
| `EmployeeId` | `employeeId` | number |
| `EmployeeName` | `employeeName` | string |
| `EmployeeDepartment` | `employeeDepartment` | string |
| `EmployeeSection` | `employeeSection` | string |
| `AttendanceTypeId` | `attendanceTypeId` | number |
| `AttendanceTypeName` | `attendanceTypeName` | string |
| `AttendanceTypeColor` | `attendanceTypeColor` | string |
| `StartTime` | `startTime` | ISO 8601 string |
| `EndTime` | `endTime` | ISO 8601 string |
| `Note` | `note` | string |
| `IsAllDay` | `isAllDay` | boolean |
| `IsAlive` | `isAlive` | boolean |

---

## 2. 新增共用工具

### `src/utils/attendance.js`

| 函式 | 說明 |
|------|------|
| `getRecordsForDate(records, dateValue)` | 回傳與指定日期重疊的紀錄（支援跨日） |
| `formatDuration(record)` | 全天紀錄顯示「N 天」；非全天依起迄分鐘差顯示「N 小時」 |
| `formatRecordTimeRange(record)` | 全天顯示日期；非全天同日顯示 `HH:mm - HH:mm`；跨日顯示完整日期時間 |
| `buildTypeClassName(typeName)` | 依假別名稱回傳對應 CSS class 名稱 |

#### 跨日重疊邏輯

`getRecordsForDate` 以 **區間重疊** 判斷，而非單純比對日期：

```
record.startTime < dayEnd  AND  record.endTime > dayStart
```

確保跨日紀錄（如 2026-04-17 21:00 ~ 2026-04-18 05:00）在 4/17 與 4/18 兩天的行事曆格與側欄均可正確顯示。

---

## 3. 主頁面（AttendanceRecord.jsx）

### 資料載入流程

1. 進入頁面時先載入假別（`getAttendanceTypes`），再載入當月紀錄（`getAttendanceRecords`）
2. 切換月份時重新呼叫 `getAttendanceRecords`（`year` / `month` 變動觸發 `useCallback` 依賴重算）
3. 載入中顯示 `Spin`；失敗顯示含「重新載入」連結的 `Alert`

### 查詢策略（全員可讀）

所有使用者查詢時皆不帶 `employeeId`，取回整月全員資料，讓所有人能即時掌握同事出勤狀況。

```js
// 前端查詢不帶 employeeId
const query = { year, month };
```

後端對應也改為：`employeeId` 為選填過濾參數，不提供即回傳全部（`IsAlive = 1`）。

### 部門 / 課別篩選

改為從 API 回傳的紀錄資料動態產生，不再依賴 mock 的靜態清單：

- `departmentOptions`：從 `records[].employeeDepartment` 去重排序
- `sectionOptions`：依所選部門過濾 `records[].employeeSection` 去重排序

### 新增紀錄

- `employeeId` 固定取自 `AuthContext.user.employeeId`（不可由 UI 指定他人）
- 時間格式統一送出 ISO 8601
- 提交中顯示 loading 狀態；成功後重抓當月資料並關閉 Modal
- 提交成功 / 失敗皆以 `message.success` / `message.error` 通知

### 刪除紀錄

- 軟刪除：呼叫 `DELETE /api/attendance/records/:id`，後端將 `IsAlive = 0`
- 成功後立即更新前端 state（過濾掉已刪除 id）
- 失敗顯示 `message.error`

---

## 4. AddAttendanceModal

### 假別選項

不再從 `mock/attendance.js` 的靜態物件取得，改為接收父層傳入的 `attendanceTypes` prop（來自 API）。

### 送出 Payload

```js
{
  attendanceTypeId: number,  // 改為 id，非 type key string
  startTime: string,          // ISO 8601
  endTime: string,            // ISO 8601
  isAllDay: boolean,
  note: string | null,
}
```

### 跨日驗證

新增提交前檢核：`endTime` 必須晚於 `startTime`，否則顯示錯誤提示阻止送出。

---

## 5. AttendanceCalendar

### Badge 格式

修正顯示格式為「假別 + 空格 + 人數」：

```jsx
// 修正前
{label}{count}    // 例：公假1

// 修正後
{label} {count}   // 例：公假 1
```

### 部門資料來源

日曆格統計的部門欄位改讀 `r.employeeDepartment`（API 欄位），不再依賴 mock employee 的 lookup map。

---

## 6. AttendanceSidebar

### 時間顯示邏輯

| 情境 | 顯示格式 | 範例 |
|------|---------|------|
| 全天（單日） | `YYYY-MM-DD` | `2026-04-17` |
| 全天（多日） | `YYYY-MM-DD ~ YYYY-MM-DD` | `2026-04-17 ~ 2026-04-19` |
| 非全天（同日） | `YYYY-MM-DD HH:mm - HH:mm` | `2026-04-17 09:00 - 12:00` |
| 非全天（跨日） | `YYYY-MM-DD HH:mm - YYYY-MM-DD HH:mm` | `2026-04-17 21:00 - 2026-04-18 05:00` |

### 時數顯示邏輯

| 情境 | 顯示格式 | 範例 |
|------|---------|------|
| 全天 | `N天` | `1天` / `3天` |
| 非全天（含跨日） | `N小時`（取起迄分鐘差，不足整數取一位小數） | `3小時` / `8小時` / `2.5小時` |

### 刪除按鈕保護（前端層）

```
Administrator → 所有紀錄均顯示刪除按鈕
General User  → 僅本人紀錄（rec.employeeId === user.employeeId）顯示刪除按鈕
```

搭配後端 403 防護，形成雙層保護。

### 標籤顏色

改由 `record.attendanceTypeColor` 動態計算，不再使用靜態 `tagStyleMap`：

```js
background: `${record.attendanceTypeColor}1A`   // 10% 透明度背景
color: record.attendanceTypeColor               // 純色文字
```

---

## 7. 權限模型（本功能）

| 動作 | General User | Administrator |
|------|-------------|---------------|
| 查詢出勤紀錄（全員） | ✅ | ✅ |
| 新增紀錄（本人） | ✅ | ✅ |
| 新增紀錄（他人） | ❌ 前後端雙層攔截 | ✅ |
| 刪除紀錄（本人） | ✅ | ✅ |
| 刪除紀錄（他人） | ❌ 前端隱藏按鈕 + 後端 403 | ✅ |
| 進入出勤頁（無 `Attendance Record` 權限） | ❌ 顯示 403 畫面 | ✅ |

---

## 8. 移除的 Mock 依賴

本次完全移除以下 mock 依賴（主要元件中不再引用）：

| 移除項目 | 原用途 |
|---------|--------|
| `mock/attendance.js` 的 `attendanceRecords` | 出勤資料來源 |
| `mock/attendance.js` 的 `attendanceTypes` | 假別選項（靜態物件） |
| `mock/attendance.js` 的 `getRecordsForDate` | 已移至 `utils/attendance.js` |
| `mock/attendance.js` 的 `formatDuration` | 已移至 `utils/attendance.js` |
| `mock/employees.js` 的 `employees` | 部門/課別來源 |
| `mock/employees.js` 的 `sectionsData` | 課別下拉來源 |
| `mock/employees.js` 的 `departmentOptions` | 部門下拉來源 |

> `mock/` 目錄的靜態檔案本身保留，供離線預覽與其他頁面參考使用。

---

## 9. 主要檔案變更清單

### 新增

| 路徑 | 說明 |
|------|------|
| `src/services/attendanceService.js` | API 呼叫封裝 |
| `src/utils/attendance.js` | 跨元件共用時間工具 |

### 修改

| 路徑 | 修改重點 |
|------|---------|
| `src/pages/AttendanceRecord.jsx` | mock → API；動態篩選；新增/刪除流程；錯誤處理 |
| `src/components/attendance/AddAttendanceModal.jsx` | 接 API types；ISO payload；跨日驗證 |
| `src/components/attendance/AttendanceCalendar.jsx` | API 欄位；badge 空格格式 |
| `src/components/attendance/AttendanceSidebar.jsx` | API 欄位；跨日顯示；動態標籤色；刪除按鈕權限 |
| `server/src/routes/attendance.js` | GET records 改為全員可讀（`employeeId` 改為選填過濾） |

---

## 10. 後續建議

1. 補上 E2E 測試：月份切換、跨日紀錄、權限情境（無權限 / 一般 / 管理者）
2. 考慮在側欄補上「今日」快捷按鈕，方便快速跳回當日

> **關於分頁**：`GET /api/attendance/records` 不需要分頁設計。查詢已以 `year` / `month` 做自然範圍限制，每次只取單月資料，資料量上限受限於「員工人數 × 月份天數」，不會無限成長。若改用分頁，反而會導致行事曆日期格資料不完整。
