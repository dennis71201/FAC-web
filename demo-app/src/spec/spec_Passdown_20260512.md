# spec_Passdown_20260512

## 1. 文件目的

本文件用於統整目前 `Passdown` 功能在前端的實作狀態、互動邏輯與已完成範圍，作為後續調整、測試與串接後端時的共同基準。

## 2. 功能範圍（本階段）

- 頁面名稱：Passdown（運轉交接）
- 前端技術：React + Ant Design + Recharts
- 資料來源：目前以 mock data 與本地 service 模擬 CRUD
- 本階段重點：
  - 完成四層資訊呈現（Summary / Filter / Analytics / Table）
  - 完成新增、編輯、刪除、異常回覆、歷程檢視
  - 完成三欄層級篩選彈窗（課別 / 系統 / 子系統）
  - 完成圖表到表格的狀態鑽取（drilldown）

## 3. 頁面結構

### 3.1 第一層：Summary（近 3 天異常統計）

- 顯示「近 3 天」異常概況。
- 環圖顯示異常總數（排除正常）。
- KPI 卡片顯示各異常狀態件數與占比（分母排除正常）。
- 點擊圓餅區塊可觸發狀態鑽取，影響第四層表格。

### 3.2 第二層：Filter（進階搜尋）

- 篩選條件：
  - 日期時間區間
  - 廠區
  - 狀態（含正常）
  - 關鍵字（內容描述、交接人員）
  - 課別/系統/子系統（可多組條件）
- 提供重設（清除全部篩選）。

### 3.3 第三層：Analytics（篩選後圖表）

- 異常佔比圓餅圖（排除正常）
- 全狀態件數直方圖（含正常）
- 重大異常/一般異常趨勢圖（支援顯示切換）
- 圖表點擊可套用狀態鑽取。

### 3.4 第四層：Table（交接明細）

- 顯示交接資料清單與分頁。
- 狀態標籤支援點擊鑽取。
- 異常列可展開內嵌區，顯示最新一筆 R/C、C/A、P/A 與日期資訊。
- 操作項目：
  - 編輯
  - 刪除
  - 回覆（異常狀態）
  - 歷程（異常狀態）

## 4. 主要彈窗

### 4.1 新增/編輯交接事項

- 欄位包含時間、廠區、課別/系統/子系統、類型、描述、交接人員、附件。
- 交接類型會影響狀態預設值（由既有邏輯判定）。

### 4.2 三欄層級篩選彈窗

- 三欄同時可搜尋、選取：課別 / 系統 / 子系統。
- 支援加入多組篩選條件。
- 已選條件以標籤顯示，支援單筆移除與全部清空。
- 支援「只選課別」或「課別+系統」等部分層級條件。

### 4.3 異常回覆彈窗

- 填寫 R/C、C/A、P/A、Plan Date、Due Date、是否結案。
- 回覆送出後會新增異常紀錄，並依條件更新主表狀態。

### 4.4 異常歷程彈窗

- 以時間軸卡片顯示異常發起與後續回覆。
- 顯示回覆內容、回覆者、回覆時間與日期欄位。

## 5. 狀態與色彩規則（前端呈現）

- 正常
- 重大異常
- 一般異常
- 處理中
- 已結案

說明：
- 表格列底色與狀態一致化顯示。
- 內嵌異常區塊依狀態使用對應底色。

## 6. 資料欄位（前端使用）

### 6.1 Passdown record 主要欄位

- id
- passdownTime
- passdownType
- passdownStatus
- siteId / siteName
- passdownSectionId
- passdownSectionName
- passdownSystemName
- passdownSubSystemName
- passdownDescription
- createEmployeeId / createEmployeeName
- receiveEmployeeId / receiveEmployeeName
- passdownAttachments

### 6.2 Abnormal log 主要欄位

- id
- passdownId
- rcContent
- caContent
- paContent
- planDate
- dueDate
- isClosed
- responseEmployeeId / responseEmployeeName
- responseTime

## 7. 關鍵互動規則

- 篩選器只影響第二～四層（Summary 以近 3 天全量資料統計）。
- 圖表鑽取為「狀態維度」單選切換，再次點擊同狀態可取消。
- 階層篩選採 OR（多組條件任一符合即保留該筆資料）。
- 關鍵字搜尋採模糊比對。

## 8. 本次整理與清理紀錄（2026-05-12）

- 已移除 Passdown 頁面中未使用的舊分支與未使用變數。
- 已簡化 hierarchy modal 為單一 filter 流程（移除過時模式分支）。
- 已清理 passdown.css 中未被目前畫面使用的舊樣式區塊。

## 9. 已知事項與後續建議

- 目前仍以 mock/service 模擬資料流，後續需對接正式 API。
- 建議補齊以下測試：
  - 狀態流轉（異常 -> 處理中 -> 已結案）
  - 三欄層級條件（部分層級 + 多組條件）
  - 圖表鑽取與篩選條件疊加情境
  - 附件單檔/多檔互動

## 10. 相關檔案

- 頁面：`demo-app/src/pages/Passdown.jsx`
- 元件：`demo-app/src/components/passdown/*`
- 樣式：`demo-app/src/styles/passdown.css`
- 模擬規格：`demo-app/src/dev spec/*`
- 既有規格：`demo-app/src/spec/*`
