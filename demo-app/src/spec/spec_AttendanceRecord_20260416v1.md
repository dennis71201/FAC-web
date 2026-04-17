# Spec Update: Attendance Record (出勤行事曆) — 2026-04-16 v1

> 基於 [spec_AttendanceRecord_20260415.md](spec_AttendanceRecord_20260415.md) 的增量更新。

---

## 變更摘要

本次更新涵蓋七大面向：

1. **新增出勤類別**：新增 `Training` 及 `FWA` 兩種出勤類型
2. **可收合側邊欄**：側邊欄改為可展開/收合，行事曆寬度隨之彈性調整
3. **全頁面字體與間距平衡**：統一放大行事曆、圖例、側邊欄各元件的字體及間距
4. **CSS 拆檔重構**：將出勤頁面樣式從 `App.css` 抽離至獨立檔案 `styles/attendance.css`
5. **路由集中化管理**：將路由配置從 `App.jsx` 抽離至 `config/routes.js`，統一管理路由、側邊欄選單及麵包屑
6. **頁面元件更名**：`AttendanceSheet.jsx` 更名為 `AttendanceRecord.jsx`，統一命名
7. **員工資料課別調整**：重新分配 `sectionsData` 部門-課別對照及部分員工所屬部門

---

## 1. 新增出勤類別

### 類別總表（更新後）

| 類別     | Key        | 顏色              | 說明                          |
|----------|------------|-------------------|-------------------------------|
| 出差     | `出差`     | 綠 `#22c55e`      | 含備註（客戶拜訪等）          |
| 請假     | `請假`     | 橘 `#f97316`      | 一般請假                      |
| 公假     | `公假`     | 藍 `#3b82f6`      | 含備註（外部稽核等）          |
| Training | `Training` | 紫 `#a855f7` ⭐新增 | 含備註（新人訓練、安全講習等）|
| FWA      | `FWA`      | 青 `#06b6d4` ⭐新增 | 含備註（居家辦公、彈性上班等）|

### 色彩 Token 對照

| 類別     | Badge bg (15% opacity) | Text color | Tag bg (10% opacity) |
|----------|------------------------|------------|----------------------|
| Training | `rgba(168,85,247,0.15)` | `#6b21a8`  | `rgba(168,85,247,0.1)` |
| FWA      | `rgba(6,182,212,0.15)`  | `#155e75`  | `rgba(6,182,212,0.1)`  |

### Mock 資料變更 (`mock/attendance.js`)

- 新增 `trainingNotes`：`['新人訓練', '安全講習', '技能認證', '外部課程', '線上研習']`
- 新增 `fwaNotes`：`['居家辦公', '彈性上班', '異地辦公']`
- 隨機生成比例調整（原 25% 非正常出勤 → 30%）：

| 類別     | 機率區間        | 約佔非正常出勤比例 |
|----------|----------------|-------------------|
| 出差     | 0.70 – 0.78    | ~27%              |
| 請假     | 0.78 – 0.85    | ~23%              |
| 公假     | 0.85 – 0.90    | ~17%              |
| Training | 0.90 – 0.95    | ~17%              |
| FWA      | 0.95 – 1.00    | ~17%              |

### 出勤紀錄資料模型（更新後）

```js
{
  employeeId: '1',
  date: '2026-04-10',
  type: '出差',       // '出差' | '請假' | '公假' | 'Training' | 'FWA'
  note: '客戶拜訪'    // 選填備註
}
```

---

## 2. 可收合側邊欄

### 新增 State

| State          | 型別      | 預設值 | 用途                     |
|----------------|-----------|--------|--------------------------|
| `sidebarOpen`  | `boolean` | `true` | 控制側邊欄展開/收合狀態   |

### 互動行為

- **收合按鈕**：位於行事曆與側邊欄之間的小型 icon 按鈕（28×28px）
  - 展開時顯示 `MenuUnfoldOutlined`（點擊收合）
  - 收合時顯示 `MenuFoldOutlined`（點擊展開）
- **點擊日期自動展開**：`handleDateClick` 觸發時同時設定 `setSidebarOpen(true)`
- **收合過渡動畫**：
  - 側邊欄：`width` 320px → 0, `opacity` 1 → 0, `transition: 0.3s ease`
  - 行事曆：自動填滿剩餘空間（`flex: 1`）

### 頁面結構（更新後）

```
┌──────────────────────────────────────────────────────────┐
│  Header: 標題 + MonthPicker + 部門 + 課別 下拉            │
├──────────────────────────────────────────────────────────┤
│  Legend Bar: ● 出差  ● 請假  ● 公假  ● Training  ● FWA   │
├──────────────────────────────┬──┬────────────────────────┤
│                              │▶◀│  日出勤摘要             │
│   7 欄 CSS Grid 行事曆       │  │  (5 類統計，3 欄 grid)  │
│   (flex: 1, 自動填滿)        │  ├────────────────────────┤
│   每格顯示各部門的            │  │  人員清單               │
│   出勤類別統計數              │  │  依部門-課別分組         │
│                              │  │  顯示姓名 + 類型標籤     │
├──────────────────────────────┴──┴────────────────────────┤
│                              FloatButton (+) 右下角        │
└──────────────────────────────────────────────────────────┘
            ▲ 收合按鈕 (Toggle)
```

### CSS 結構變更

| 選擇器 | 變更前 | 變更後 |
|--------|--------|--------|
| `.att-main` | — | 新增 `position: relative` |
| `.att-calendar-wrap` | `flex: 3` | `flex: 1`（自動填滿） |
| `.att-sidebar-wrap` | `flex: 1; min-width: 280px` | `width: 320px; flex-shrink: 0; transition: width/opacity 0.3s` |
| `.att-main.sidebar-collapsed .att-sidebar-wrap` | — | `width: 0; opacity: 0; pointer-events: none` |
| `.att-sidebar-toggle` | — | 新增（28×28px 切換按鈕） |

### RWD 斷點更新（≤ 1024px）

- 側邊欄改為 `width: 100%`
- 收合時以 `height: 0` 隱藏
- 收合按鈕改為 `position: absolute; right: 0; top: -40px`

---

## 3. 字體與間距平衡

### 設計原則

全頁面字體統一放大約 110%，確保行事曆、圖例、側邊欄各區域的視覺比例一致。

### 行事曆 (`AttendanceCalendar`)

| 元素 | 變更前 | 變更後 |
|------|--------|--------|
| 星期標題列 | 10px | 13px |
| 日期數字 | 12px | 15px |
| 今日數字 | 12px | 15px |
| 今日 badge | 9px | 11px |
| 部門標籤 | 8px | 11px |
| 類別計數 badge | 8px | 11px |
| badge padding | 1px 4px | 2px 6px |
| 部門最小寬度 | 42px | 52px |

### 圖例列 (Legend Bar)

| 元素 | 變更前 | 變更後 |
|------|--------|--------|
| 標籤文字 | 10px | 12px |
| 類別文字 | 10px | 12px |
| 容器 padding | 10px 16px | 12px 20px |
| 項目 pill padding | 4px 10px | 5px 12px |
| 色點大小 | 6px | 7px |
| 項目間距 | 12px | 14px |

### 側邊欄 (`AttendanceSidebar`)

| 元素 | 變更前 | 變更後 |
|------|--------|--------|
| 卡片 padding | 16px | 20px |
| 卡片標題 (h3) | 14px | 15px |
| 日期 badge | 9px | 11px |
| 統計數值 | 18px | 20px |
| 統計標籤 margin-bottom | 4px | 6px |
| 統計 grid | 5 欄 (`repeat(5,1fr)`) | 3 欄 (`repeat(3,1fr)`)，自動換行 |
| 統計 grid gap | 8px | 10px |
| 統計格 padding | 10px | 12px |
| 人員清單標題 | 14px | 15px |
| 分組標籤 | 10px | 11px |
| 分組 bar 高度 | 12px | 14px |
| 員工姓名 | 12px | 13px |
| 類型標籤 | 9px | 11px |
| 類型標籤 padding | 2px 6px | 3px 8px |
| 清單區 padding | 10px | 12px |
| 清單項目 gap | 8px | 10px |

### 頁首

| 元素 | 變更前 | 變更後 |
|------|--------|--------|
| 副標題 | 12px | 13px |

---

## 4. CSS 拆檔重構

### 變更說明

原先所有出勤頁面樣式定義於 `App.css`，本次將其抽離至獨立檔案以改善可維護性：

- **新增 `src/styles/attendance.css`**：包含所有 `.attendance-page` scope 下的樣式（行事曆、側邊欄、圖例、收合動畫、RWD 斷點等）
- **新增 `src/styles/global.css`**：全域共用覆寫樣式（如 Sider logo 等），於 `main.jsx` 引入
- `AttendanceRecord.jsx` 新增 `import '../styles/attendance.css'` 直接引入頁面專屬樣式

### 引入結構

```
main.jsx
  ├── import './index.css'            // 基礎 reset
  └── import './styles/global.css'    // 全域覆寫

AttendanceRecord.jsx
  └── import '../styles/attendance.css'  // 頁面專屬樣式
```

### 設計原則

- 每個頁面的樣式獨立一個 CSS 檔，放在 `src/styles/` 目錄下
- 全域共用樣式統一放 `global.css`
- 頁面元件自行引入對應的 CSS，避免 `App.css` 過度膨脹

---

## 5. 路由集中化管理

### 變更說明

原先路由定義散落於 `App.jsx` 與 `MainLayout.jsx`，本次新增 `src/config/routes.js` 作為路由的唯一真實來源（Single Source of Truth），統一驅動：

- **React Router 路由**：`App.jsx` 遍歷 `routes` 陣列自動生成 `<Route>`
- **側邊欄選單**：`buildMenuItems()` 從 routes 自動產生 Ant Design Menu items，支援 submenu 分組
- **麵包屑**：`breadcrumbMap` 從 routes 自動產生 path → label 對照表

### 路由設定格式 (`config/routes.js`)

```js
{
  path: 'attendance',       // URL path（不含前導斜線）
  label: 'Attendance Record', // 側邊欄 & 麵包屑顯示名稱
  icon: CalendarOutlined,   // Ant Design icon 元件
  component: AttendanceRecord, // 頁面元件
  group: 'system',          // （選填）submenu 群組 key
  groupLabel: '系統管理',    // （選填）submenu 群組顯示名稱
  groupIcon: SettingOutlined, // （選填）submenu 群組 icon
}
```

### 新增功能流程

1. 在 `src/pages/` 建立頁面元件
2. 在 `config/routes.js` 新增一筆路由設定
3. 完成 — `App.jsx` 與 `MainLayout.jsx` 自動讀取

### 匯出項目

| 匯出名稱 | 型別 | 用途 |
|----------|------|------|
| `default` (routes) | `Array` | 路由設定陣列，供 `App.jsx` 生成 `<Route>` |
| `breadcrumbMap` | `Object` | `{ '/attendance': 'Attendance Record', ... }`，供麵包屑使用 |
| `buildMenuItems()` | `Function` | 回傳 Ant Design Menu items 陣列（含 submenu 分組邏輯）|

### 架構示意

```
config/routes.js  (Single Source of Truth)
  ├─→ App.jsx          — 遍歷產生 <Route> 元件
  └─→ MainLayout.jsx   — buildMenuItems() 產生側邊欄
                        — breadcrumbMap 產生麵包屑
```

---

## 6. 頁面元件更名

- `src/pages/AttendanceSheet.jsx` → `src/pages/AttendanceRecord.jsx`
- 元件名稱 `AttendanceSheet` → `AttendanceRecord`
- `config/routes.js` 中 label 由 `'Attendance Sheet'` 改為 `'Attendance Record'`

---

## 7. 員工資料課別調整 (`mock/employees.js`)

### 部門-課別對照（更新後）

| 部門     | 變更前課別                    | 變更後課別                    |
|----------|-------------------------------|-------------------------------|
| Building | EI, MECH, FIRE, I&C          | EI, MECH, FIRE, I&C（不變）  |
| Process  | WTS                           | WTS, GCS, Shift               |
| Project  | GCS, Shift, Maint, TI        | Maint, TI                     |

### 員工部門異動

| 員工 key | 姓名   | 變更前部門 | 變更後部門 | 課別  |
|----------|--------|-----------|-----------|-------|
| 5        | 張建國 | Project   | Process   | GCS   |
| 10       | 鄭國輝 | Project   | Process   | GCS   |
| 11       | 許家豪 | Project   | Process   | Shift |

---

## 影響檔案

| 檔案路徑 | 變更類型 | 說明 |
|----------|---------|------|
| `src/mock/attendance.js` | 修改 | 新增 Training/FWA 類型定義、備註陣列、生成邏輯 |
| `src/mock/employees.js` | 修改 | 課別重新分配（GCS/Shift 從 Project 移至 Process）、3 位員工部門異動 |
| `src/pages/AttendanceSheet.jsx` | 刪除 | 已更名為 `AttendanceRecord.jsx` |
| `src/pages/AttendanceRecord.jsx` | 新增 | 由 `AttendanceSheet.jsx` 更名而來，新增 legend 項目、`sidebarOpen` state、收合切換按鈕、點擊日期自動展開、引入 `attendance.css` |
| `src/components/AttendanceCalendar.jsx` | 修改 | 新增 Training/FWA 的 `typeConfig` 項目 |
| `src/components/AttendanceSidebar.jsx` | 修改 | 新增 tagStyle、統計計數、grid 改為 5 類 3 欄、空狀態文案更新 |
| `src/styles/attendance.css` | 新增 | 從 `App.css` 抽離的出勤頁面專屬樣式（含 badge 色彩、收合動畫、toggle 按鈕、字體間距調整）|
| `src/styles/global.css` | 新增 | 全域共用覆寫樣式（Sider logo 等）|
| `src/config/routes.js` | 新增 | 路由集中設定檔，統一管理路由、選單、麵包屑 |
| `src/App.jsx` | 修改 | 路由改為遍歷 `routes` 陣列自動生成，移除硬編碼路由 |
| `src/App.css` | 刪除 | 所有樣式已遷移至 `styles/attendance.css` 及 `styles/global.css` |
| `src/layouts/MainLayout.jsx` | 修改 | 選單與麵包屑改為從 `config/routes.js` 匯入，移除硬編碼 |
| `src/main.jsx` | 修改 | CSS 引入由 `App.css` 改為 `styles/global.css` |
| `src/spec/spec_AttendanceRecord_20260416.md` | 刪除 | 舊版 spec，由 `spec_AttendanceRecord_20260415.md` 取代 |
| `src/spec/spec_AttendanceRecord_20260415.md` | 新增 | 由舊版 `20260416.md` 更名（修正日期），作為本次增量更新的基準版 |

---

## 待辦 / 未來擴充（繼承自上版 + 新增）

- [ ] FloatButton 點擊開啟「新增出勤紀錄」表單（Modal / Drawer）
- [ ] 新增表單需支援 Training / FWA 類型選擇
- [ ] 日期格點擊開啟詳細 Modal，顯示當日所有員工明細
- [ ] 串接後端 API 取代 mock 資料
- [ ] 匯出功能（CSV / Excel）
- [ ] 搜尋人員功能
- [ ] 側邊欄收合狀態持久化（localStorage）
