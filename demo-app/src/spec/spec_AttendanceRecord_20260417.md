# Spec Update: Attendance Record (出勤行事曆) — 2026-04-17

> 基於 [spec_AttendanceRecord_20260416v1.md](spec_AttendanceRecord_20260416v1.md) 的增量更新。

---

## 變更摘要

本次更新涵蓋六大面向：

1. **新增出勤紀錄 Modal**：點擊 FloatButton 開啟新增出勤紀錄表單
2. **新增出勤紀錄資料寫入**：Modal 送出後將紀錄寫入 UI state（以當前登入使用者 王小明 為 employeeId）
3. **Mock 資料結構重構**：出勤紀錄新增 `id`、`startDate`、`endDate`、`startTime`、`endTime`、`isAllDay` 欄位，支援多日與部分時數紀錄
4. **側邊欄手風琴式人員清單**：人員清單改為可展開/收合的手風琴列，展開後顯示各筆紀錄詳情（類別、時長、備註）與刪除按鈕
5. **刪除出勤紀錄**：展開的紀錄列提供刪除按鈕（含 Popconfirm 確認），刪除後即時更新日曆與側邊欄
6. **元件目錄重構**：將 `components/` 下的出勤相關元件搬移至 `components/attendance/` 子目錄
7. **路由檔副檔名修正**：`config/routes.js` → `config/routes.jsx`（修正 Vite JSX 解析錯誤）

---

## 1. Mock 資料結構重構

### 出勤紀錄欄位（更新後）

**`src/mock/attendance.js`**

舊結構（單一 `date` 欄位）已移除，改為支援多日與部分時數的完整結構：

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | `number` | 唯一識別碼（自動遞增，新增紀錄使用 `Date.now()`） |
| `employeeId` | `string` | 員工 key |
| `type` | `string` | 出勤類別（出差/請假/公假/Training/FWA） |
| `startDate` | `string` | 開始日期 `'YYYY-MM-DD'` |
| `endDate` | `string` | 結束日期 `'YYYY-MM-DD'` |
| `startTime` | `string \| null` | 開始時間 `'HH:mm'`（全天時為 `null`） |
| `endTime` | `string \| null` | 結束時間 `'HH:mm'`（全天時為 `null`） |
| `isAllDay` | `boolean` | 是否為全天 |
| `note` | `string` | 備註 |

### 紀錄生成比例

每筆非正常出勤紀錄額外隨機決定時長變體：

| 變體 | 機率 | 說明 |
|------|------|------|
| 單日全天 | ~55% | `isAllDay=true`，`startDate === endDate` |
| 多日全天 | ~15% | `isAllDay=true`，`endDate = startDate + 1~3 個工作日` |
| 部分時數 | ~30% | `isAllDay=false`，`startDate === endDate`，隨機 2~6 小時 |

### 新增 Helper 函式（exported）

| 函式 | 簽名 | 說明 |
|------|------|------|
| `getRecordsForDate` | `(records, dateStr) → Record[]` | 回傳所有 `startDate <= dateStr <= endDate` 的紀錄（支援多日紀錄在每一天都出現） |
| `formatDuration` | `(record) → string` | 全天紀錄回傳 `"N天"`（計算工作日），部分時數回傳 `"N小時"` |

### 內部 Helper 函式（非 exported）

| 函式 | 用途 |
|------|------|
| `fmtDate(year, month, day)` | 格式化日期字串 |
| `addWeekdays(dateStr, n)` | 從日期跳過週末加 N 個工作日 |
| `randInt(min, max)` | 隨機整數 |

---

## 2. 新增出勤紀錄 Modal

### 新增元件

**`src/components/attendance/AddAttendanceModal.jsx`**

| Props | 型別 | 說明 |
|-------|------|------|
| `visible` | `boolean` | 控制 Modal 顯示/隱藏 |
| `onClose` | `() => void` | 關閉 Modal 回呼 |
| `onSubmit` | `(data) => void` | 送出表單回呼（已接入資料寫入） |
| `defaultDate` | `dayjs` | 預設填入日期（取自行事曆 `selectedDate`） |

| State | 型別 | 預設值 | 說明 |
|-------|------|--------|------|
| `selectedType` | `string \| null` | `null` | 出勤類別（出差/請假/公假/Training/FWA） |
| `isAllDay` | `boolean` | `false` | 是否為全天 |
| `startDate` | `dayjs` | `defaultDate` | 開始日期 |
| `endDate` | `dayjs` | `defaultDate` | 結束日期 |
| `startTime` | `dayjs` | `09:00` | 開始時間（全天時隱藏） |
| `endTime` | `dayjs` | `18:00` | 結束時間（全天時隱藏） |
| `note` | `string` | `''` | 備註（選填） |

### UI 結構

```
┌────────────────────────────────────────┐
│  [Glassmorphism Overlay]               │
│  ┌──────────────────────────────────┐  │
│  │  新增出勤紀錄                  ✕ │  │
│  ├──────────────────────────────────┤  │
│  │  出勤類別                        │  │
│  │  [出差] [請假] [公假]            │  │
│  │  [Training] [FWA]                │  │
│  ├──────────────────────────────────┤  │
│  │  選擇時間              ☐ 全天    │  │
│  │  開始          結束              │  │
│  │  📅 2026-04-17  📅 2026-04-17   │  │
│  │  🕐 09:00 AM    🕐 06:00 PM     │  │
│  ├──────────────────────────────────┤  │
│  │  備註 (選填)                     │  │
│  │  ┌────────────────────────────┐  │  │
│  │  │ 請輸入出勤事由...          │  │  │
│  │  └────────────────────────────┘  │  │
│  ├──────────────────────────────────┤  │
│  │  [ 取消 ]    [   提交申請   ]    │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

### 送出資料格式（Modal → Parent）

```js
{
  type: '出差',           // '出差' | '請假' | '公假' | 'Training' | 'FWA'
  startDate: dayjs(),     // dayjs object
  endDate: dayjs(),       // dayjs object
  startTime: dayjs(),     // dayjs object (null if isAllDay)
  endTime: dayjs(),       // dayjs object (null if isAllDay)
  isAllDay: false,        // boolean
  note: '客戶拜訪',       // string
}
```

### 資料寫入流程（`AttendanceRecord.handleAddRecord`）

Modal `onSubmit` 傳入上述 payload 後，`handleAddRecord` 進行轉換並寫入 state：

```js
const newRecord = {
  id: Date.now(),                                        // 唯一 ID
  employeeId: '1',                                       // 王小明（當前登入使用者）
  type: data.type,
  startDate: data.startDate.format('YYYY-MM-DD'),        // dayjs → string
  endDate: data.endDate.format('YYYY-MM-DD'),
  startTime: data.isAllDay ? null : data.startTime?.format('HH:mm'),
  endTime: data.isAllDay ? null : data.endTime?.format('HH:mm'),
  isAllDay: data.isAllDay,
  note: data.note || '',
};
setRecords((prev) => [...prev, newRecord]);
```

### 互動行為

| 行為 | 說明 |
|------|------|
| **開啟** | 點擊右下角 FloatButton（`PlusOutlined`）→ `setModalVisible(true)` |
| **關閉** | 點擊 ✕ 按鈕 / 取消按鈕 / Overlay 背景 / Escape 鍵 → `setModalVisible(false)` |
| **表單重置** | Modal 開啟時自動重置所有欄位，`startDate` / `endDate` 預設為 `selectedDate` |
| **類別選擇** | 單選，點擊 Chip 切換 active 狀態 |
| **全天切換** | 勾選「全天」→ 隱藏 TimePicker；取消勾選 → 顯示 TimePicker |
| **日期連動** | 修改開始日期時，若開始 > 結束，自動將結束日期同步為開始日期 |
| **結束日期限制** | `disabledDate` 禁止選擇早於開始日期的日期 |
| **送出驗證** | Submit 按鈕在未選擇類別或日期無效時 `disabled` |
| **送出** | `onSubmit` 呼叫 `handleAddRecord` 寫入 state → 關閉 Modal → 日曆即時更新 |

---

## 3. 側邊欄手風琴式人員清單 & 刪除功能

### 變更元件

**`src/components/attendance/AttendanceSidebar.jsx`**

#### 新增 Props

| Props | 型別 | 說明 |
|-------|------|------|
| `onDelete` | `(recordId: number) => void` | 刪除紀錄回呼（來自 `AttendanceRecord.handleDeleteRecord`） |

#### 新增 State

| State | 型別 | 預設值 | 說明 |
|-------|------|--------|------|
| `expandedEmployee` | `string \| null` | `null` | 目前展開的員工 ID（單一展開模式） |

#### 新增 Imports

```js
import { Popconfirm } from 'antd';
import { DownOutlined, DeleteOutlined } from '@ant-design/icons';
import { getRecordsForDate, formatDuration } from '../../mock/attendance';
```

#### 資料分群邏輯變更

原本 `detailGroups` 以 `department-section` 分群，每筆為一個扁平物件。新結構改為兩層分群：

```
detailGroups = {
  "Building - EI": {
    "1": { employeeId: "1", name: "王小明", records: [Record, Record, ...] },
    "4": { employeeId: "4", name: "林美玲", records: [Record] },
  },
  "Process - WTS": { ... },
}
```

日期篩選改用 `getRecordsForDate(records, dateStr)` 取代原本的 `r.date === dateStr`，以支援多日紀錄在每日都出現。

#### 手風琴列 UI 結構

```
┌─────────────────────────────────────────┐
│ 人員清單                                 │
├─────────────────────────────────────────┤
│ ▸ BUILDING - EI                         │
│ ┌─────────────────────────────────────┐ │
│ │ 王小明  [出差 2天] [Training 4小時] ▾│ │ ← Collapsed header（可點擊）
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ [出差] 2天  2026-04-15~04-17   🗑│ │ │ ← Expanded record detail
│ │ │ 客戶拜訪                        │ │ │ ← Note（下方獨立行）
│ │ ├─────────────────────────────────┤ │ │
│ │ │ [Training] 4小時  09:00-13:00  🗑│ │ │
│ │ │ 安全講習                        │ │ │
│ │ └─────────────────────────────────┘ │ │
│ │ 林美玲  [請假 1天]               ▸ │ │ ← Collapsed（未展開）
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

#### Collapsed Header（`.att-leave-row-header`）

| 元素 | 說明 |
|------|------|
| **員工姓名** | `.leave-name`，13px，500 weight |
| **類型標籤（inline）** | `.leave-tags-inline` — 所有紀錄的類別標籤橫向排列，格式為 `[類別 N天]` 或 `[類別 N小時]` |
| **展開箭頭** | `DownOutlined`，展開時旋轉 180°（`.leave-chevron.open`） |

#### Expanded Body（`.att-leave-row-body`）

使用 `max-height` + `opacity` 動畫展開/收合。

每筆紀錄（`.att-record-detail`）包含：

| 元素 | 說明 |
|------|------|
| **Top row**（`.att-record-top`） | flex row — 包含 `.att-record-info`（類別標籤 + 時長 + 日期範圍/時段）+ 刪除按鈕 |
| **備註**（`.att-record-note`） | 獨立行，顯示於 top row 下方，`word-break: break-word` 防止溢出 |
| **刪除按鈕** | `DeleteOutlined` icon button + `Popconfirm`（"確認刪除此紀錄？"），確認後呼叫 `onDelete(rec.id)` |

### 刪除流程

```
使用者點擊 🗑 → Popconfirm "確認刪除此紀錄？"
  ├─ 取消 → 關閉 Popconfirm
  └─ 刪除 → onDelete(rec.id)
      → AttendanceRecord.handleDeleteRecord(id)
      → setRecords(prev => prev.filter(r => r.id !== id))
      → 日曆 + 側邊欄即時更新（React re-render）
```

---

## 4. 行事曆多日紀錄支援

### 變更元件

**`src/components/attendance/AttendanceCalendar.jsx`**

#### 新增 Import

```js
import { getRecordsForDate } from '../../mock/attendance';
```

#### `summaryByDate` 計算邏輯變更

原邏輯以 `r.date` 單一欄位直接分群。新邏輯改為對每個日曆格呼叫 `getRecordsForDate(records, dateStr)` 來查找所有跨日紀錄的重疊：

```js
const summaryByDate = useMemo(() => {
  const map = {};
  calendarDays.forEach(({ date }) => {
    const dateStr = date.format('YYYY-MM-DD');
    const dayRecords = getRecordsForDate(records, dateStr);
    if (dayRecords.length === 0) return;
    // ... group by dept → type → count
  });
  return map;
}, [records, empDeptMap, calendarDays]);
```

效果：一筆 `startDate=04-15, endDate=04-17` 的出差紀錄會在 04-15、04-16、04-17 三天的日曆格都顯示計數。

---

## 5. 頁面元件 State 管理

### 變更元件

**`src/pages/AttendanceRecord.jsx`**

#### State 變更

| State | 變更 | 說明 |
|-------|------|------|
| `sidebarOpen` | 預設值 `true` → `false` | 側邊欄預設收合，點擊日期時自動展開 |
| `records` | **新增** `useState(initialRecords)` | 將靜態匯入的 `attendanceRecords` 提升為可變 state |

#### Import 變更

```js
// 變更前
import { attendanceRecords } from '../mock/attendance';

// 變更後
import { attendanceRecords as initialRecords } from '../mock/attendance';
```

#### 新增函式

| 函式 | 說明 |
|------|------|
| `handleDeleteRecord(recordId)` | `setRecords(prev => prev.filter(r => r.id !== recordId))` |
| `handleAddRecord(data)` | 將 Modal payload 轉換為 Record 物件，`setRecords(prev => [...prev, newRecord])` + 關閉 Modal |

#### Props 傳遞

| 子元件 | Props | 來源 |
|--------|-------|------|
| `AttendanceSidebar` | `onDelete={handleDeleteRecord}` | 新增 |
| `AddAttendanceModal` | `onSubmit={handleAddRecord}` | 原為 `() => setModalVisible(false)`，改為 `handleAddRecord` |

#### `filteredRecords` 依賴變更

```js
// 變更前
const filteredRecords = useMemo(() => { ... }, [filteredEmployees]);

// 變更後
const filteredRecords = useMemo(() => { ... }, [filteredEmployees, records]);
```

---

## 6. 元件目錄重構

### 變更說明

將出勤相關元件從扁平的 `components/` 搬移至以功能分組的 `components/attendance/` 子目錄。

### 目錄結構變更

```
# 變更前
src/components/
  AttendanceCalendar.jsx
  AttendanceSidebar.jsx
  AddAttendanceModal.jsx    ← 本次新增

# 變更後
src/components/
  attendance/
    AttendanceCalendar.jsx
    AttendanceSidebar.jsx
    AddAttendanceModal.jsx
```

### Import 路徑更新

| 檔案 | 變更前 | 變更後 |
|------|--------|--------|
| `pages/AttendanceRecord.jsx` | `'../components/AttendanceCalendar'` | `'../components/attendance/AttendanceCalendar'` |
| `pages/AttendanceRecord.jsx` | `'../components/AttendanceSidebar'` | `'../components/attendance/AttendanceSidebar'` |
| `pages/AttendanceRecord.jsx` | `'../components/AddAttendanceModal'` | `'../components/attendance/AddAttendanceModal'` |
| `components/attendance/AddAttendanceModal.jsx` | `'../mock/attendance'` | `'../../mock/attendance'` |
| `components/attendance/AttendanceSidebar.jsx` | — | `'../../mock/attendance'`（新增 `getRecordsForDate`, `formatDuration`） |
| `components/attendance/AttendanceCalendar.jsx` | — | `'../../mock/attendance'`（新增 `getRecordsForDate`） |

---

## 7. 路由檔副檔名修正

### 問題

`config/routes.js` 包含 JSX 語法（`<route.icon />`），但 Vite 預設僅對 `.jsx` 副檔名啟用 JSX 解析，導致建置錯誤。

### 修正

- `src/config/routes.js` → `src/config/routes.jsx`

---

## CSS 新增 / 修改摘要

### 新增選擇器（側邊欄手風琴 & 紀錄詳情）

| 選擇器 | 用途 |
|--------|------|
| `.att-leave-row` | 手風琴列容器（`flex-direction: column`） |
| `.att-leave-row-header` | 可點擊的 collapsed header（員工名 + inline 標籤 + 箭頭） |
| `.att-leave-row-header .leave-tags-inline` | 標籤橫向排列容器 |
| `.att-leave-row-header .leave-chevron` | 展開箭頭（展開時 `rotate(180deg)`） |
| `.att-leave-row-body` | 展開內容（`max-height` + `opacity` 動畫） |
| `.att-leave-row.expanded .att-leave-row-body` | 展開態（`max-height: 500px`） |
| `.att-record-detail` | 紀錄卡片（`flex-direction: column`） |
| `.att-record-top` | 紀錄卡片 top row（info + delete，水平排列） |
| `.att-record-info` | 類別標籤 + 時長 + 日期範圍 |
| `.att-duration` | 時長文字（`11px`，`700 weight`） |
| `.att-date-range` | 日期範圍/時段文字 |
| `.att-record-note` | 備註（獨立行，`word-break: break-word`） |
| `.att-delete-btn` | 刪除 icon button（hover 時顯示 error 色） |

### 修改選擇器

| 選擇器 | 變更 |
|--------|------|
| `.att-leave-group-list` | `gap: 10px` → `gap: 4px`（配合手風琴列間距） |
| `.att-leave-row` | 原 `display: flex; justify-content: space-between` 移除，改為 `flex-direction: column` |

### Modal 樣式（無變更）

新增出勤紀錄 Modal 的約 280 行 CSS 維持不變，選擇器列表：

| 選擇器 | 用途 |
|--------|------|
| `.att-modal-overlay` | Glassmorphism 背景遮罩 |
| `.att-modal-card` | 白色圓角卡片容器 |
| `.att-modal-header` / `.att-modal-close` | 標題列與關閉按鈕 |
| `.att-modal-body` | 表單主體區 |
| `.att-modal-label` | 欄位標籤（uppercase 小字） |
| `.att-modal-chips` / `.att-modal-chip` | 類別選擇 Chip 容器與按鈕 |
| `.att-modal-chip[data-type="..."]` | 5 種類別各自的色彩變體 |
| `.att-modal-chip.active` | Chip 選中態（ring + 加深背景） |
| `.att-modal-time-header` / `.att-modal-allday` | 時間區標題列與全天 checkbox |
| `.att-modal-time-grid` / `.att-modal-time-col` | 二欄式開始/結束時間佈局 |
| `.att-modal-note` | 備註 textarea 區塊 |
| `.att-modal-actions` | 底部按鈕列 |
| `.att-modal-btn-cancel` / `.att-modal-btn-submit` | 取消 / 送出按鈕 |

---

## 異動檔案總覽

| 檔案 | 動作 | 說明 |
|------|------|------|
| `src/mock/attendance.js` | **修改** | 紀錄結構重構（`id`, `startDate/endDate`, `startTime/endTime`, `isAllDay`）；新增 `getRecordsForDate()`、`formatDuration()` helper |
| `src/pages/AttendanceRecord.jsx` | **修改** | 新增 `records` state、`handleAddRecord`、`handleDeleteRecord`；`sidebarOpen` 預設 `false`；傳遞 `onDelete`、`onSubmit` props |
| `src/components/attendance/AttendanceSidebar.jsx` | **修改** | 手風琴式人員清單（`expandedEmployee` state）、紀錄詳情含時長/刪除；新增 `onDelete` prop、import `getRecordsForDate`/`formatDuration` |
| `src/components/attendance/AttendanceCalendar.jsx` | **修改** | `summaryByDate` 改用 `getRecordsForDate()` 支援多日紀錄跨日顯示 |
| `src/components/attendance/AddAttendanceModal.jsx` | **新增** | 新增出勤紀錄 Modal 元件 |
| `src/styles/attendance.css` | **修改** | 新增手風琴列、紀錄詳情、刪除按鈕樣式；修正 `.att-record-detail` layout（note 獨立行） |
| `src/components/attendance/AttendanceCalendar.jsx` | **搬移** | 從 `components/` → `components/attendance/` |
| `src/components/attendance/AttendanceSidebar.jsx` | **搬移** | 從 `components/` → `components/attendance/` |
| `src/config/routes.jsx` | **更名** | 從 `routes.js` → `routes.jsx` |

---

## 待辦 / 後續考量

- [ ] **成功回饋**：送出後可加入 `message.success('已新增出勤紀錄')` 提示
- [ ] **員工選擇器**：目前新增紀錄固定為當前登入使用者（王小明）。管理者新增他人紀錄時需加入員工下拉選單
- [ ] **表單驗證強化**：開始時間不應晚於結束時間（同一天時的時間比對）
- [ ] **編輯功能**：點擊已有紀錄可開啟編輯 Modal（復用同一元件）
- [ ] **後端接入**：目前 CRUD 均為 UI state 操作。後續需實作 `POST /api/attendance`、`DELETE /api/attendance/:id` 並接入真實 API
- [ ] **登入使用者動態取得**：`employeeId` 目前硬編碼為 `'1'`，應從 auth context / JWT 取得
