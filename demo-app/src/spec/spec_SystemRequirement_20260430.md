# 系統需求規格 — 登入、註冊與出勤紀錄 (2026-04-30)

## 1. 本期開發範圍

本期僅開發以下功能，其餘模組（Equipment Tracking、Alarm、Passdown、員工管理）維持現有展示畫面，不進行實作。

| 功能 | 說明 |
|---|---|
| OIDC 驗證流程 | 預留介面，本期 stub 必失敗，自動進入備援流程 |
| 員工編號登入 | identify 備援登入，取得後端 JWT |
| 首次註冊 | 以員工資料建立帳號，直接取得 JWT |
| 出勤紀錄（Feature 3）| 行事曆顯示、新增、軟刪除 |

---

## 2. 資料庫架構確認

### 2.1 Employee 表更新
Employee 表新增欄位 `DepartmentAndSectionId`，作為外鍵對應 `DepartmentAndSection` 表。  
`EmployeeDepartment`、`EmployeeSection` 文字欄位保留，方便查閱，但**只由後端依 DSID 反查寫入，前端不可直接送入**。

### 2.2 新增 DepartmentAndSection 表
定義部門與課別的上下級關係，作為員工選擇部門課別的唯一來源。

| 欄位 | 說明 |
|---|---|
| DepartmentAndSectionId (PK) | 自動遞增主鍵 |
| DepartmentName | 部門名稱 |
| SectionName | 課別名稱 |

唯一鍵建議：DepartmentName + SectionName 組合不可重複。

### 2.3 資料一致性規則
- 前端下拉選單只能選擇 DepartmentAndSection 表中存在的組合，以 DepartmentAndSectionId 送出。
- 後端寫入時仍需驗證 DSID 存在，並以 DSID 反查的 DepartmentName / SectionName 強制覆寫 Employee 欄位。
- 不允許前端直接指定 EmployeeDepartment / EmployeeSection 字串進行寫入。

---

## 3. 認證與授權設計

### 3.1 認證流程（本期）

```
進入系統
  │
  ▼
tryOidcLogin()（stub，必失敗）
  │
  ▼（失敗）
顯示員工編號輸入頁
  │
  ├─ 輸入員工編號 → POST /api/auth/identify
  │     ├─ 成功 → 存 token，進入系統
  │     ├─ 401 UNAUTHORIZED → 提示「找不到員工，是否前往註冊？」
  │     └─ 403 FORBIDDEN → 提示請聯絡管理員
  │
  └─ 點擊「前往註冊」
        │
        ▼
      GET /api/departments-sections（免登入，取得下拉資料）
        │
        ▼
      填寫表單 → POST /api/auth/register
            ├─ 201 成功 → 自動登入，導向出勤頁
            └─ 409 CONFLICT → 提示員工編號已存在
```

### 3.2 OIDC 備援設計（為降低後續開發成本）
- AuthContext 中以 `tryOidcLogin()` 封裝 OIDC 呼叫，本期回傳 false。
- 後續接上真正 OIDC 時，只需修改 `tryOidcLogin()` 實作，不影響其他流程。
- OIDC 上線後以 `EmployeeEmail` 自動對應既有員工，並保留人工驗證流程。
- 權限載入邏輯（EmployeePermission）保持不變，OIDC 只負責身分辨識。

### 3.3 三層權限模型

| 層級 | 控制方式 | 說明 |
|---|---|---|
| 功能存取 | permissions JSON | 控制使用者可否進入功能模組 |
| 功能內操作 | role（Administrator / General User）| 控制功能內特定操作 |
| 資料層 | 後端強制過濾 | General User 只能存取自己的資料 |

### 3.4 本期預設權限規則
- 角色：General User
- Permission：`{"Attendance Record": true}`（其他功能完成後再逐步開放）

### 3.5 JWT 設計
- payload 欄位：`employeeId`、`employeeNumber`、`name`、`role`、`permissions`
- token 存放：localStorage（沿用現有架構；HttpOnly Cookie 為後續強化項）
- token 有效期：8 小時（沿用後端現行設定）

---

## 4. 出勤紀錄功能需求

### 4.1 顯示規則
- 使用行事曆（Calendar）視圖，每次顯示一個月。
- 月份切換時重新呼叫 API，依 year / month 取得整月資料。
- 行事曆依「部門 → 課別」分組顯示紀錄統計，資料來源為 `GET /api/attendance/records` 回傳中的 `EmployeeDepartment`、`EmployeeSection`。
- 圖例（Legend）依 `GET /api/attendance/types` 動態產生，不寫死於程式碼。

### 4.2 全天 vs 非全天
- 全天（IsAllDay = true）：`StartTime` 固定 00:00:00，`EndTime` 固定 23:59:59；前端顯示日期範圍。
- 非全天（IsAllDay = false）：前端顯示具體起迄時間；支援跨日紀錄（EndTime 可為 StartTime 的隔日）。

### 4.3 跨日紀錄
跨日測試案例：
- ID 8：2026-04-17 21:00 ~ 2026-04-18 05:00
- ID 9：2026-04-20 22:00 ~ 2026-04-21 02:00

前端計算時數時，需支援 EndTime < StartTime（同日）為跨日情境。

### 4.4 新增紀錄
- `employeeId` 取自 AuthContext.user.employeeId，不可硬編碼。
- General User 只能建立自己的紀錄（後端驗證）。
- 時間格式統一送出 ISO 8601。

### 4.5 刪除紀錄
- 實作為軟刪除：後端將 `IsAlive` 設為 0，不實際刪除資料。
- 刪除成功後前端重新抓取當月資料。

### 4.6 權限攔截
- 進入 Attendance 頁前，以 ProtectedRoute 檢查 `permissions['Attendance Record'] === true`。
- 無權限顯示 `Result status="403"` 畫面。
- API 回 403 也做相同處理。

---

## 5. 前端技術選型確認

| 項目 | 選擇 | 說明 |
|---|---|---|
| 框架 | React 18 | 現有 demo-app 維持 |
| UI 元件庫 | Ant Design | 現有 demo-app 維持 |
| HTTP 呼叫 | Axios | 新增依賴 |
| 狀態管理 | React Context API | 不引入 Zustand |
| 路由 | React Router v6 | 現有 demo-app 維持 |
| 環境設定 | Vite `.env` | `VITE_API_BASE_URL` |

---

## 6. 新增檔案清單

| 路徑 | 用途 |
|---|---|
| `src/services/apiClient.js` | Axios 實例，含 Bearer 注入與錯誤標準化 |
| `src/services/authService.js` | identify、register 呼叫 |
| `src/services/attendanceService.js` | types、records CRUD |
| `src/services/mappers.js` | DB PascalCase ↔ 前端 camelCase 轉換 |
| `src/context/AuthContext.jsx` | token、user 狀態、tryOidcLogin、login、register、logout、hasPermission |
| `src/components/ProtectedRoute.jsx` | 未登入導 /login；feature prop 未授權顯示 403 畫面 |
| `src/pages/Login.jsx` | OIDC stub → 員工編號表單 → identify |
| `src/pages/Register.jsx` | 取得部門課別下拉 → 填寫資料 → register |
| `src/utils/attendance.js` | getRecordsForDate、formatDuration 共用 helper |
| `.env.example` | 環境變數範本 |
| `.env.development` | 本地開發設定 |

---

## 7. 修改檔案清單

| 路徑 | 修改重點 |
|---|---|
| `package.json` | 新增 axios 依賴 |
| `src/App.jsx` | 加入 AuthProvider、/login、/register 路由、ProtectedRoute 包覆 |
| `src/layouts/MainLayout.jsx` | 右上角姓名 / 角色改從 AuthContext 取得；加登出按鈕 |
| `src/pages/AttendanceRecord.jsx` | mock → API；月份切換重抓；employeeId 從 user context 取；軟刪除 |
| `src/components/attendance/AddAttendanceModal.jsx` | 從 props 接收 attendanceTypes；提交傳 attendanceTypeId |
| `src/components/attendance/AttendanceCalendar.jsx` | 改用 src/utils/attendance.js |
| `src/components/attendance/AttendanceSidebar.jsx` | 改用 src/utils/attendance.js |
| `src/mock/attendance.js` | helper 函式抽出至 utils；mock 資料保留供離線預覽 |

---

## 8. 驗證測試案例

| 案例 | 預期結果 |
|---|---|
| 進入系統 | OIDC 失敗 → 顯示登入頁員工編號輸入框 |
| 輸入不存在工號（FAC-999）| 提示「找不到此員工，是否前往註冊？」 |
| 點擊前往註冊 | 顯示含部門課別下拉的表單 |
| 填寫完整資料送出 | 201 → 自動登入 → 進入出勤頁 |
| FAC-001（Administrator）登入 | 可看全員當月資料；月份切換重抓 |
| FAC-002（General User）登入 | 只看到自己；新增、刪除自己的紀錄成功 |
| FAC-003（無出勤權限）登入 | 出勤頁顯示無權限畫面 |
| 全天紀錄顯示 | 顯示日期範圍，不顯示時間 |
| 跨日紀錄（04-17 21:00 ~ 04-18 05:00）| 時數計算正確（8 小時）；兩天行事曆格各自顯示紀錄 |
| 後端關閉時進入系統 | 顯示連線錯誤訊息，不白屏 |
