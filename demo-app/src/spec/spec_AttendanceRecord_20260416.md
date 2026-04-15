# Spec: Attendance Record (出勤行事曆) — 2026-04-16

## 概述

將原有的雙模式出勤頁面（個人行事曆 / 主管表格）重構為單一統合式版面，採用「Editorial Design System」風格的自訂行事曆 + 右側摘要面板。全頁面僅使用 **Ant Design + 自訂 CSS**，不引入 Tailwind。

---

## 頁面結構

```
┌──────────────────────────────────────────────────┐
│  Header: 標題 + MonthPicker + 部門 + 課別 下拉    │
├──────────────────────────────────────────────────┤
│  Legend Bar: ● 出差  ● 請假  ● 公假               │
├────────────────────────────┬─────────────────────┤
│                            │  日出勤摘要           │
│   7 欄 CSS Grid 行事曆     │  (出差/請假/公假 人數) │
│   (75% 寬度)               ├─────────────────────┤
│   每格顯示各部門的          │  人員清單             │
│   出勤類別統計數            │  依部門-課別分組       │
│                            │  顯示姓名 + 類型標籤   │
├────────────────────────────┴─────────────────────┤
│                          FloatButton (+) 右下角    │
└──────────────────────────────────────────────────┘
```

### RWD 斷點

- `> 1024px`：行事曆與側邊欄橫向排列 (flex-row)
- `≤ 1024px`：堆疊排列 (flex-column)
- `≤ 640px`：Header 改為縱向、行事曆格高度縮減

---

## 出勤類別

僅有三種類別，正常出勤不產生紀錄：

| 類別 | Key    | 顏色   | 說明                    |
|------|--------|--------|-------------------------|
| 出差 | `出差` | 綠 `#22c55e` | 含備註 (客戶拜訪等) |
| 請假 | `請假` | 橘 `#f97316` | 一般請假            |
| 公假 | `公假` | 藍 `#3b82f6` | 含備註 (外部稽核等) |

---

## 元件架構

### `AttendanceSheet.jsx` — 頁面主元件

**路由**：`/attendance`

**State**：

| State            | 型別     | 用途                           |
|------------------|----------|--------------------------------|
| `currentMonth`   | `dayjs`  | 控制 MonthPicker，決定行事曆月份 |
| `selectedDept`   | `string \| null` | 部門篩選                |
| `selectedSection`| `string \| null` | 課別篩選（依部門聯動）    |
| `selectedDate`   | `dayjs`  | 點擊日期，更新側邊欄詳情       |

**篩選邏輯**：
1. `selectedDept` → 過濾 `employees` 取得符合的員工
2. `selectedSection` → 再次過濾（聯動：選部門後課別才可用）
3. `filteredEmployees` → 以員工 key set 過濾 `attendanceRecords` → `filteredRecords`
4. `filteredRecords` + `filteredEmployees` 傳入 Calendar 與 Sidebar

**Ant Design 元件使用**：
- `DatePicker` (picker="month") — 月份選擇
- `Select` × 2 — 部門/課別下拉（`value` 需傳 `undefined` 而非 `null` 以顯示 placeholder）
- `FloatButton` — 右下角新增按鈕（目前為 placeholder）

---

### `AttendanceCalendar.jsx` — 自訂行事曆

**Props**：

| Prop           | 型別          | 說明                       |
|----------------|---------------|----------------------------|
| `year`         | `number`      | 年份                       |
| `month`        | `number`      | 月份 (0-indexed)           |
| `records`      | `Array`       | 已篩選的出勤紀錄           |
| `employees`    | `Array`       | 已篩選的員工清單           |
| `onDateClick`  | `function`    | 日期點擊回呼               |
| `selectedDate` | `dayjs`       | 當前選取日期               |

**行事曆格內容顯示方式**：

每格不顯示個人明細，改為按**部門聚合統計**：

```
Building  出差2 請假1
Process   公假1
```

**資料處理**：
1. `empDeptMap`：員工 ID → 部門 的對照表
2. `summaryByDate`：日期 → 部門 → 類別 → 人數 的三層 Map
3. 每格遍歷該日的部門，產生 badges 陣列

**格子樣式**：
- 平日：`surface-container-lowest` (#fff)
- 假日：`surface-container-low` (#f1f4f5)，灰色淡化
- 當月外日期：opacity 0.4
- 今日：`box-shadow: inset 0 0 0 2px primary`，日期數字圓底色，「今日」脈動標記
- 選中日：淡藍底色

---

### `AttendanceSidebar.jsx` — 右側摘要面板

**Props**：

| Prop           | 型別      | 說明                   |
|----------------|-----------|------------------------|
| `selectedDate` | `dayjs`   | 選取日期               |
| `records`      | `Array`   | 已篩選的出勤紀錄       |
| `employees`    | `Array`   | 已篩選的員工清單       |

**摘要卡片**：
- 日期標記 pill badge
- 三欄統計：出差 N人 / 請假 N人 / 公假 N人
- 以 `Set<employeeId>` 計算不重複人數

**人員清單卡片**：
- 依 `部門 - 課別` 分組（e.g., "Building - EI"）
- 每組顯示員工姓名 + 類型標籤（色彩對應）
- 無紀錄時顯示「此日無出差/請假/公假紀錄」

---

## 資料模型

### 員工表 (`mock/employees.js`)

```js
{
  key: '1',
  employeeId: 'FAC-001',
  name: '王小明',
  department: 'Building',   // 部門
  section: 'EI',            // 課別
  role: 'admin',
  isActive: true,
  createdAt: '2024-06-01'
}
```

**部門-課別對照** (`sectionsData`)：

| 部門     | 課別                          |
|----------|-------------------------------|
| Building | EI, MECH, FIRE, I&C          |
| Process  | WTS                           |
| Project  | GCS, Shift, Maint, TI        |

### 出勤紀錄 (`mock/attendance.js`)

```js
{
  employeeId: '1',
  date: '2026-04-10',
  type: '出差',       // '出差' | '請假' | '公假'
  note: '客戶拜訪'    // 選填備註
}
```

- 正常出勤日**不產生紀錄**（無紀錄 = 正常上班）
- 約 25% 的工作日隨機產生紀錄
- 已生成 2026 年 3 月及 4 月資料

---

## 樣式系統

### 設計 Token（CSS Custom Properties）

所有自訂樣式透過 `.attendance-page` class scope，定義於 `App.css`，不影響其他頁面。

核心色彩 Token：

| Token                             | 值          | 用途                |
|-----------------------------------|-------------|---------------------|
| `--color-primary`                 | `#4456ba`   | 主色、今日高亮      |
| `--color-surface`                 | `#f8f9fa`   | 底層背景            |
| `--color-surface-container-low`   | `#f1f4f5`   | 行事曆外框、假日格  |
| `--color-surface-container-lowest`| `#ffffff`   | 平日格、內嵌卡片    |
| `--color-surface-container-high`  | `#e5e9eb`   | 行事曆星期標題列    |
| `--color-on-surface`              | `#2d3335`   | 主文字色            |
| `--color-on-surface-variant`      | `#5a6062`   | 次要文字色          |

字型：`'Inter', 'Noto Sans TC'`（透過 Google Fonts 引入於 `index.html`）

### 關鍵 CSS Class

| Class                    | 用途                                    |
|--------------------------|----------------------------------------|
| `.attendance-page`       | 頁面根容器，scope 所有自訂樣式          |
| `.att-header`            | 頁首 flex 排版                         |
| `.att-legend`            | 類別標記列                             |
| `.att-main`              | 主內容 flex 容器 (3:1)                 |
| `.att-calendar`          | 行事曆外框                             |
| `.att-calendar-grid`     | 7 欄 CSS Grid                          |
| `.att-calendar-cell`     | 日期格（含 `.today` `.weekend` `.selected` `.outside` 修飾）|
| `.cell-dept-row`         | 格內部門統計行                         |
| `.cell-badge`            | 格內類別計數標籤                       |
| `.att-sidebar-card`      | 側邊欄卡片                             |
| `.att-leave-group`       | 人員清單分組區塊                       |

---

## 檔案清單

| 檔案路徑                                    | 狀態   | 說明                         |
|---------------------------------------------|--------|------------------------------|
| `src/pages/AttendanceSheet.jsx`             | 重寫   | 頁面主元件                   |
| `src/components/AttendanceCalendar.jsx`     | 新增   | 自訂 7 欄行事曆              |
| `src/components/AttendanceSidebar.jsx`      | 新增   | 右側摘要面板                 |
| `src/mock/attendance.js`                    | 重寫   | 3 種類型、無紀錄=正常出勤    |
| `src/mock/employees.js`                     | 修改   | 新增 department/section 欄位 |
| `src/App.css`                               | 修改   | 新增 ~300 行 attendance CSS  |
| `index.html`                                | 修改   | 新增 Google Fonts 連結       |

---

## 設計決策

1. **Ant Design Only**：不引入 Tailwind，避免 CSS Reset 衝突，以 CSS Custom Properties + scoped CSS 實現編輯式設計風格。
2. **自訂行事曆取代 Ant Design Calendar**：Ant Design Calendar 無法支援 tonal layering、多筆紀錄格式、自訂今日高亮等需求。
3. **統合視角**：取消個人/主管雙模式切換。行事曆顯示全部門聚合統計，側邊欄提供選定日期的詳細名單，兩者互補。
4. **行事曆格聚合顯示**：每格按部門顯示各類別人數，而非列出每位員工的個別紀錄，大幅減少視覺資訊量。
5. **無紀錄 = 正常出勤**：僅出差、請假、公假會產生紀錄，降低資料量。
6. **樣式隔離**：所有自訂 CSS scope 在 `.attendance-page` 下，不會影響 Equipment、Alarm、Passdown、員工管理等其他頁面。

---

## 待辦 / 未來擴充

- [ ] FloatButton 點擊開啟「新增出勤紀錄」表單（Modal / Drawer）
- [ ] 日期格點擊開啟詳細 Modal，顯示當日所有員工明細
- [ ] 串接後端 API 取代 mock 資料
- [ ] 匯出功能（CSV / Excel）
- [ ] 搜尋人員功能
