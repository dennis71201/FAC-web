# spec_Passdown_20260512v1

## 1. 文件目的

本文件為 `Passdown` 三連動層級篩選（課別 / 系統 / 子系統）之**增量 UI 更新紀錄**，用於：
- 對齊本次互動改動範圍
- 提供測試與驗收依據
- 保留後續串接後端 API 的接口設計脈絡

說明：本文件僅記錄本次更新，不重複完整功能規格；完整背景請參考 `spec_Passdown_20260512.md`。

## 2. 本次更新摘要（2026-05-12）

### 2.1 介面互動更新

- 將原先三欄中的按鈕式操作改為 `Checkbox` 勾選操作。
- 移除以下舊按鈕：
  - 加入條件
  - 清空已選條件
  - 清除目前選取
- 保留核心操作：
  - 確認
  - 取消
  - 清空所有條件

### 2.2 生效時機更新

- 勾選行為只更新 Modal 內草稿條件，不立即影響主頁面資料。
- 僅在點擊「確認」後，才把草稿條件套用到主頁面篩選。
- 點擊「取消」會放棄此次修改並回復到上次已確認狀態。

### 2.3 多選與層級補齊

- 支援多組條件並存（OR 邏輯）。
- 勾選系統時，自動補齊其父課別。
- 勾選子系統時，自動補齊其父課別與父系統。
- 取消課別時，移除該課別下所有草稿條件。
- 勾選升級規則：
  - 同課別已存在「課別級」條件時，勾選該課別下系統會升級為「系統級」條件，避免重複 Tag。
  - 同系統已存在「系統級」條件時，勾選該系統下子系統會升級為「子系統級」條件，避免重複 Tag。

### 2.4 三連動唯一鍵與 N/A 去歧義修正

- 修正背景：`N/A` 在多個課別/系統下重複出現，僅用名稱反查父層會誤判。
- 修正策略：
  - 篩選套用時改為以條件展開 `passdownSectionId` 集合，再比對每筆資料的 `passdownSectionId`。
  - 勾選事件回調改為攜帶完整脈絡（section、system、subsystem），不再依賴「名稱 -> 父層」反查。
  - 系統與子系統分組改為前向遍歷 `passdownSections`，避免同名值被錯誤歸組。

### 2.5 子系統級聯規則補齊

- 當「未選任何系統」但「已選至少一個課別」時：
  - 子系統清單應顯示「已選課別底下全部子系統聯集」。
  - 不得回傳全域子系統清單。

### 2.6 彈窗底部按鈕對齊調整

- 將「清空所有條件」從內容區移至 Modal footer。
- 與「取消 / 確認」按鈕同列同高，修正視覺高度不一致問題。

### 2.7 新增交接按鈕（FAB）標準化

- 將新增交接浮動操作按鈕（FAB）從自定義 `<Button>` 改為 Ant Design 官方 `<FloatButton>` 元件。
- 移除自定義 CSS 類別 `.passdown-fab`，改由 FloatButton 內建定位與樣式。
- 新增 `tooltip="新增運轉交接"` 屬性，提升易用性。
- 確保 FAB 按鈕與 AttendanceRecord 頁面的按鈕實現一致。

### 2.8 動態統計圖表區改善

#### 2.8.1 異常件狀態佔比（圓餅圖）呈現優化

**改善前：**
- 圓餅圖外側顯示「名稱 + 件數」標籤與標籤線。
- 資料量少時尚可，但標籤在圖表上方易超出邊界，尤其手機尺寸下可讀性差。

**改善後：**
- 移除圓餅圖外側標籤與標籤線，使圖表簡潔無邊界問題。
- 新增下方圖例，格式為「● 名稱：X件」（例如「● 重大異常：2件」）。
- 圖表資訊分工：扇形呈現比例視覺、圖例提供完整資訊。
- 保留原有 Tooltip 輔助資訊與點擊下鑽功能。

**技術實作：**
- Pie 組件移除 `label` 與 `labelLine` 屬性。
- 調整 PieChart margin 從 `{ top: 8, right: 40, left: 40, bottom: 8 }` 至 `{ top: 8, right: 8, left: 8, bottom: 8 }`。
- 在卡片下方以自訂 div 手動渲染圖例，迴圈遍歷 `exceptionPieData` 並格式化為「● 名稱：X件」。

#### 2.8.2 全狀態件數對比（直方圖）標籤調整

**改善策略：**
- 保留直方圖柱體上方標籤顯示「名稱 + 件數」。
- 標籤位置設定為 `position="top"`，避免與柱體重疊。
- 字級與間距設定確保小螢幕寬度下可讀性。

**技術實作：**
- Bar 組件使用 `<LabelList dataKey="value" content={renderBarLabel} />` 渲染標籤。
- `renderBarLabel` 函式格式化為「名稱 件數」，位置於柱體上方 8px。
- BarChart margin 預留足夠上方空間：`{ top: 28, right: 8, left: 0, bottom: 0 }`。

#### 2.8.3 使用者收益

- ✅ 圓餅圖視覺更簡潔，避免邊界溢出與標籤重疊。
- ✅ 圖例格式統一化，提升掃讀效率。
- ✅ 全狀態對比圖保留完整標籤，資訊層次清晰。
- ✅ 所有互動（點擊下鑽、Tooltip）保持穩定。

## 3. 變更前後行為對照

| 面向 | 更新前 | 更新後 |
|---|---|---|
| 條件建立 | 先選取再按「加入條件」 | 勾選即寫入草稿條件 |
| 篩選生效 | 容易在操作中提早生效 | 僅按「確認」才生效 |
| 操作模式 | 偏單筆加入流程 | 多選即時維護草稿列表 |
| 可追蹤性 | 需透過按鈕理解流程 | 已選 Tag 與勾選狀態同步可見 |

## 4. 狀態管理模型

### 4.1 狀態分離

- `hierarchyFilterDraftList`：Modal 內草稿條件（可編輯，未套用）。
- `filterHierarchy`：主頁面已套用條件（影響資料過濾）。

### 4.2 關鍵流程

1. 開啟 Modal：以 `filterHierarchy` 初始化 `hierarchyFilterDraftList`。
2. 勾選/取消：透過回調更新 `hierarchyFilterDraftList`。
3. 確認：`setFilterHierarchy(hierarchyFilterDraftList)`，關閉 Modal。
4. 取消：重置關鍵字與草稿，恢復至 `filterHierarchy`，關閉 Modal。

### 4.3 條件比對邏輯

- 主頁面篩選中，`filterHierarchy` 採 OR：
  - 任一條件符合即保留該筆資料。
- 單條件內採 AND：
  - `section/system/subsystem` 有值者需同時匹配。

## 5. 資料接口與相容性

### 5.1 接口保留策略

本次保留並使用獨立 `hierarchyService`，隔離資料來源：
- 目前：讀取 mock 資料（`passdownHierarchy` + `passdownSections`）
- 未來：可替換為 API（例如 `GET /api/hierarchy`）

### 5.2 現有可用方法

- `getHierarchyStructure()`
- `getSectionOptions()`
- `getSystemsBySection(section)`
- `getSubsystemsBySystem(section, system)`
- `getSectionIdsByCondition(section, system, subsystem)`

## 6. 驗證清單（本次更新）

### 層級篩選
1. 開啟 Modal 後，三欄皆可搜尋與勾選。
2. 勾選課別後，已選條件 Tag 立即顯示對應課別。
3. 勾選系統（未先選課別）時，條件自動帶入父課別。
4. 勾選子系統時，條件自動帶入父課別與父系統。
5. 可同時勾選多組不同層級條件，Tag 顯示正確。
6. 點擊 Tag 的 `X` 可移除對應條件，勾選狀態同步更新。
7. 點擊「取消」後，主頁面資料不變，重開 Modal 恢復上次已確認內容。
8. 點擊「確認」後，主頁面表格依草稿條件刷新。
9. 點擊「清空所有條件」可清空草稿列表。
10. 草稿為空時按「確認」，應提示至少選擇一個條件。
11. 只選課別（未選系統）時，子系統清單應限縮為該課別下子系統聯集。
12. 同名值（例如 `N/A`）在不同父層下勾選後，套用結果不得互相污染。
13. 同課別下由課別級升級到系統級、同系統下由系統級升級到子系統級時，不應出現重複 Tag。
14. 分組標題在存在重名系統時應可正確辨識父課別。
15. 「清空所有條件」按鈕與「取消 / 確認」按鈕同列同高對齊。

### FAB 按鈕
16. 右下角浮動按鈕正確使用 Ant Design `FloatButton` 元件。
17. FAB 按鈕 hover 時顯示 tooltip「新增運轉交接」。
18. FAB 按鈕點擊後正確開啟新增交接 Modal。
19. FAB 按鈕視覺樣式與 AttendanceRecord 頁面的浮動按鈕一致。
20. 不同視口寬度（1200px、768px、480px）下 FAB 位置正確。

### 動態統計圖表區
21. 異常件狀態佔比圓餅圖移除外側標籤與標籤線，扇形清潔無邊界溢出。
22. 圓餅圖下方圖例正確顯示「● 名稱：X件」格式，例如「● 重大異常：2件」。
23. 圓餅圖各扇形點擊仍可觸發原有下鑽篩選行為。
24. 圓餅圖 hover 時 Tooltip 正常顯示完整資訊。
25. 全狀態件數對比直方圖柱體上方標籤正確顯示「名稱 件數」。
26. 直方圖各柱體點擊仍可觸發原有下鑽篩選行為。
27. 桌機尺寸（1200px+）下，圓餅圖與圖例排版清晰，無標籤重疊。
28. 手機尺寸（480px）下，圖例文字不被裁切，排版自適應。
29. 當異常件數為 0 時，圓餅圖與圖例正確隱藏或顯示空狀態。

## 7. 影響檔案

### 層級篩選功能
- `demo-app/src/pages/Passdown.jsx`
- `demo-app/src/components/passdown/PassdownHierarchyModal.jsx`
- `demo-app/src/services/hierarchyService.js`
- `demo-app/src/mock/passdown.js`
- `demo-app/src/styles/passdown.css`（Modal footer 對齊樣式）

### FAB 按鈕標準化
- `demo-app/src/pages/Passdown.jsx` — import 新增 `FloatButton`，替換 FAB 元件
- `demo-app/src/styles/passdown.css` — 移除 `.passdown-fab` CSS 類別定義

### 動態統計圖表區改善
- `demo-app/src/components/passdown/PassdownAnalyticsLayer.jsx` — 移除圓餅圖標籤與標籤線，新增下方圖例
- `demo-app/src/pages/Passdown.jsx` — 傳遞圖表資料至 PassdownAnalyticsLayer 組件

## 8. 後續建議

- 補上層級篩選互動測試（單元/整合）以鎖定 draft/applied 行為。
- 串接後端時僅調整 `hierarchyService`，維持頁面與元件邏輯不變。
- 若層級資料量擴大，可評估清單虛擬化以降低渲染成本。
- 圖表方面：若異常件數類別超過 6 個，可評估改用分頁或摘要檢視以維持可讀性。
- 若需支援圖表資料匯出，建議新增「圖表下載」功能，圖例應同步匯出以保持完整性。
