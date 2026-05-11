# 員工出勤管理系統 - 測試資料庫現況描述 (2026-05-06)

這份文件旨在提供 AI 或開發人員了解目前測試資料庫的數據結構、關聯性及具體內容樣貌。

---

## 1. 出勤類型 (AttendanceType)
定義系統支援的假別與顯示顏色。

| ID | 名稱 (Name) | 顏色 (Color) | 描述 |
| :--- | :--- | :--- | :--- |
| 1 | 出差 | #22c55e | 商務行程 |
| 2 | 請假 | #f97316 | 一般事病假 |
| 3 | 公假 | #3b82f6 | 公務外出 |
| 4 | Training | #a855f7 | 內部或外部培訓 |
| 5 | FWA | #06b6d4 | 彈性工作安排 (Flexible Working Arrangement) |

---

## 2. 員工課別 (EmployeeSection)
定義系統中課別與系統的隸屬關係。

| ID | 課別名稱 (SectionName) | 系統名稱 (SystemName) |
| :--- | :--- | :--- |
| 1 | Process | SHIFT |
| 2 | Process | WTS |
| 3 | Process | GC |
| 4 | Building | CR |
| 5 | Building | EXH |
| 6 | Building | HVAC |
| 7 | Building | PROCESS |
| 8 | Building | EI |
| 9 | Building | I&C |
| 10 | Building | LSS |
| 11 | Project | TI |
| 12 | Project | PROJECT |
| 13 | Project | GENERAL AFFAIRS |

---

## 3. 員工基本資料 (Employee)
目前共有 15 位測試員工，涵蓋不同課別與在職狀態。Email 格式統一為 `EmployeeNumber@company.com`。

| ID | 姓名 | 員工編號 | 課別 | 系統 | 課別ID (EmployeeSectionId) | 在職 (IsAlive) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | 王小明 | FAC-001 | Building | EI | 8 | 1 (Yes) |
| 2 | 李大華 | FAC-002 | Process | WTS | 2 | 1 (Yes) |
| 3 | 陳志偉 | FAC-003 | Building | HVAC | 6 | 1 (Yes) |
| 4 | 林美玲 | FAC-004 | Building | EI | 8 | 1 (Yes) |
| 10 | 鄭國輝 | FAC-010 | Process | GC | 3 | 0 (No) |
| 12 | 蔡怡君 | FAC-012 | Process | WTS | 2 | 1 (Yes) |
| 14 | 劉佩琪 | FAC-014 | Building | EI | 8 | 0 (No) |
| ... | ... | ... | ... | ... | ... | ... |

---

## 4. 權限設定 (EmployeePermission)
定義員工的角色與 JSON 格式的功能權限。

- **Administrator**: 全權限開放。
- **General User**: 預設僅開放 `Attendance Record`。
- **特殊測試案例**:
  - **EmployeeId 3 (陳志偉)**: `IsAlive=1` 但 `Attendance Record` 權限為 `false`。

**JSON 範例**:
`{"Attendance Record": true, "Abnormal Review": false, "Alarm": false}`

---

## 5. 出勤紀錄 (AttendanceRecord)
2026 年 4 月份共 30 筆測試資料。

### 資料設計特性：
1. **全天紀錄 (IsAllDay = 1)**: `StartTime` 00:00:00 至 `EndTime` 23:59:59。
2. **非全天紀錄 (IsAllDay = 0)**: 具備具體起迄時間（如 09:00 - 12:00）。
3. **跨日紀錄 (邊界測試)**: 共有 5 筆 `IsAllDay = 0` 的紀錄其 `EndTime` 在 `StartTime` 的隔日。
4. **軟刪除測試**: 包含已離職員工 (`IsAlive=0`) 的出勤紀錄，用於驗證過濾邏輯。

### 關鍵跨日資料範例：
- **ID 8 (跨日緊急搶修)**: 2026-04-17 21:00 ~ 2026-04-18 05:00 (非全天)。
- **ID 9 (跨日系統部署)**: 2026-04-20 22:00 ~ 2026-04-21 02:00 (非全天)。

---

## 6. 本次更新摘要 (2026-05-06)
- `EmployeeSection` 由 9 組調整為 13 組課別/系統對應。
- `Employee.EmployeeSystem` 名稱已與新對應表一致（例如 `GCS` 改為 `GC`、`Shift` 改為 `SHIFT`）。
- `Employee.EmployeeSectionId` 已依新對應表重新編號。

---

## 7. 開發測試重點
- **權限攔截**: 驗證 ID 3 登入後無法存取紀錄。
- **軟刪除過濾**: 報表需自動排除 `IsAlive = 0` 的員工及其紀錄。
- **跨日時數計算**: 驗證 `IsAllDay = 0` 時，系統能否正確處理跨越午夜的紀錄。
- **全天顯示邏輯**: 驗證前端是否能正確處理 `IsAllDay` 標記。
- **資料一致性**: 驗證 `Employee` 表中的課別/系統文字是否與 `EmployeeSectionId` 關聯之資料吻合。
