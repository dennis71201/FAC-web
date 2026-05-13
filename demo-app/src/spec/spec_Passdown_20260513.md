# spec_Passdown_20260513

## 1. 文件目的

本文件記錄 2026-05-13 本次 Passdown 階段性修正，重點為「員工資料來源一致化（改用 API）」與「人員名稱顯示 fallback 規則」。

本次定位為 Phase 1 前端收斂，不含 Passdown 後端 CRUD API 新增。

## 2. 本次變更摘要

### 2.1 員工資料來源改為 API

- 新增前端 service：`employeesService.getEmployees()`。
- 改由 `GET /api/employees` 取得可用員工清單。
- Passdown 頁面不再依賴 `mock/employees.js` 作為建立/接收人員下拉來源。

### 2.2 新增/編輯表單改動

- 建立人員、接收人員下拉改為 API 資料。
- Modal 開啟時會刷新員工清單，避免長時間停留造成名單過舊。
- 下拉在資料載入中會顯示 loading 並暫時 disabled。
- 送出前驗證接收人員是否仍存在於最新名單，不存在則阻擋送出。

### 2.3 人員名稱顯示 fallback 規則（依最新需求）

統一規則如下：

1. 若紀錄本身已有姓名（`record.*EmployeeName`）且非空字串，優先顯示。
2. 若紀錄姓名為空，改用 `employeeId` 對照 API 員工清單。
3. 若 `employeeId` 可對應到一筆員工，但該筆 `name` 為空，顯示：`人員查無姓名`。
4. 若 `employeeId` 無法對應任何員工，顯示：`查無此人員`。

### 2.4 列表/歷程/搜尋一致化

- Table 的建立人員與接收人員欄位改為使用同一套解析函式。
- 歷程彈窗中的發起人與回覆人顯示改為使用同一套解析函式。
- 關鍵字搜尋中的人員名稱比對，改為使用解析後顯示名稱，避免空值導致比對異常。

### 2.5 Passdown 列表預設依據時間排序（新到舊）

- Passdown 頁面列表資料在進入 Table 前，預設依據 `passdownTime` 欄位由新到舊排序（即最新紀錄顯示在最上方）。
- 影響所有分頁、搜尋、篩選結果，確保顯示順序一致。
- 若 `passdownTime` 欄位缺失則排序值為 0（最舊）。

### 2.6 新增/編輯彈出視窗位置修正（垂直置中）

- `PassdownCreateModal`（同時涵蓋新增與編輯模式）改為使用 Ant Design Modal 的 `centered` 設定。
- 修正視窗在部分螢幕高度下看起來偏下的視覺感受，統一為垂直置中呈現。

### 2.7 附件流程 Phase 1（前端 + mock）

- 新增 `uploadService` adapter，統一處理附件驗證（JPG/PNG/PDF、單檔 10MB）與 metadata 正規化。
- `PassdownCreateModal` 改為使用 `Upload.Dragger` + `customRequest`，上傳後在表單中保存附件 metadata，而非僅檔名字串。
- `submitCreateModal()` 改為提交 `passdownAttachments` metadata 陣列。
- `PassdownReplyModal` 新增回覆附件欄位，`submitReplyModal()` 會一併提交 `responseAttachments` metadata。
- `passdownService.uploadAttachment()` 改為回傳 mock metadata（`fileId`, `fileName`, `mimeType`, `fileSize`, `uploadedAt`, `uploadedBy`, `storageKey`, `downloadUrl`）。
- `createPassdownRecord` / `updatePassdownRecord` / `addAbnormalLog` 改為儲存 metadata（相容既有字串附件格式）。
- Table 與歷程彈窗附件顯示改為 metadata 驅動（含檔名與大小顯示）。

## 3. 變更檔案

### 3.1 新增

- `demo-app/src/services/employeesService.js`
- `demo-app/src/services/uploadService.js`

### 3.2 修改

- `demo-app/src/pages/Passdown.jsx`
- `demo-app/src/components/passdown/PassdownTableLayer.jsx`
- `demo-app/src/components/passdown/PassdownModals.jsx`
- `demo-app/src/services/passdownService.js`

## 4. 主要實作細節

### 4.1 `employeesService`

- 封裝 `GET /api/employees`。
- 將後端欄位映射為前端欄位：`id`, `employeeId`, `employeeNumber`, `name`, `section`, `system`, `isActive`。

### 4.2 `Passdown.jsx`

- 新增狀態：`activeEmployees`, `employeesLoading`。
- 新增方法：
  - `refreshActiveEmployees()`：取得最新員工清單。
  - `resolveEmployeeDisplayName(employeeId, fallbackName)`：統一名稱顯示規則。
- 在 `openCreateModal()`、`openEditModal()` 觸發員工清單刷新。
- 在 `submitCreateModal()` 送出前驗證 `receiveEmployeeId` 是否仍可用。

### 4.3 `PassdownTableLayer.jsx`

- 「交接人員」欄位改用 `resolveEmployeeDisplayName()` 顯示建立/接收人員。

### 4.4 `PassdownModals.jsx`

- `PassdownCreateModal` 新增 `employeesLoading` props，套用到兩個 Select。
- 下拉選項若姓名空白，顯示 `#<employeeId> 人員查無姓名`。
- `PassdownHistoryModal` 新增 `resolveEmployeeDisplayName` props，統一歷程人員顯示。
- `PassdownCreateModal` 設定 `centered`，新增/編輯彈窗改為垂直置中。
- 新增/編輯附件欄位改為 `customRequest` 上傳流程，並顯示上傳中提示。
- `PassdownReplyModal` 新增回覆附件欄位與上傳流程。
- `PassdownHistoryModal` 新增回覆附件顯示（檔名 + 大小）。

### 4.5 `uploadService`

- 提供 `uploadSingleFile()`、`extractAttachmentPayload()`、`normalizeAttachments()`、`toUploadFileList()`。
- 統一附件驗證規則：僅允許 JPG/PNG/PDF，單檔大小上限 10MB。
- 提供 legacy 字串附件相容轉換，避免舊資料顯示中斷。

### 4.6 `passdownService.js`

- `uploadAttachment()` 改為回傳 mock metadata（非僅檔名）。
- `createPassdownRecord()`、`updatePassdownRecord()`、`addAbnormalLog()` 寫入附件 metadata。
- 新增附件正規化邏輯，確保舊字串資料與新 metadata 可共存。

## 5. 驗證結果

- 針對本次修改檔案執行錯誤檢查：無新增錯誤。
- 全專案 lint 仍有既有問題（非本次引入），目前保留原狀。

## 6. 已知限制

- Passdown 主資料與異常回覆目前仍為 mock service（in-memory），尚未切換為後端 Passdown API。
- 附件上傳目前為 mock metadata 流程，未落地儲存實體檔案，也未提供後端下載 URL。
- 前端已完成 UI 與流程防呆，但最終權限與資料一致性仍需後端 API 層同規則驗證。

## 7. 下一階段建議（Phase 2）

1. 新增/串接 Passdown 後端 API（列表、新增、編輯、刪除、異常回覆、歷程）。
2. 後端以 JWT 決定建立者，並驗證接收人員有效性。
3. 後端回傳列表時 JOIN 員工資料，降低前端 fallback 依賴程度。
4. 將前端 `passdownService` 由 mock 切換為 `apiClient`。
5. 補齊 Passdown API 權限測試與越權測試.
