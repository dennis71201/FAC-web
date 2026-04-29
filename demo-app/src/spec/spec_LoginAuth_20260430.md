# Login/Auth Implementation Spec (2026-04-30)

## 1. 文件目的

本文件記錄本次在 `demo-app` 實作的登入與註冊功能，包含路由調整、認證狀態管理、API 串接、UI 行為、驗證結果與已知限制，供後續維護與擴充使用。

---

## 2. 本次實作範圍

本次僅實作「登入與註冊」流程，以及讓登入資訊可正確傳遞到 Attendance 頁。

### 已完成

1. 入口頁改為登入頁（`/`）
2. 新增註冊頁（`/register`）
3. 新增前端認證狀態管理（token、user、權限檢查）
4. 串接後端 API
   - `POST /api/auth/identify`
   - `POST /api/auth/register`
   - `GET /api/departments-sections`
5. 新增受保護路由機制（未登入導回 `/`，可做 feature 權限攔截）
6. MainLayout 顯示登入者姓名/角色並支援登出
7. Attendance 新增紀錄時改由 AuthContext 取得 `employeeId`（不再硬編碼）

### 本次不包含

1. 真正 OIDC provider 串接（目前 `tryOidcLogin()` 為 stub，固定回傳 false）
2. Attendance 頁完整 API 化重構（僅做最小接縫修正）
3. Refresh Token / HttpOnly Cookie 安全機制

---

## 3. 路由與流程

### 路由結構

1. `/`：登入頁（Login）
2. `/register`：註冊頁（Register）
3. `/{feature}`：受保護路由（經 ProtectedRoute 驗證）

### 登入流程

1. 進入 `/`
2. 嘗試 `tryOidcLogin()`（本期 stub）
3. 失敗後顯示員工編號登入表單
4. 呼叫 `POST /api/auth/identify`
5. 成功後寫入 `token` 與 `user`
6. 導向 `/attendance`

### 註冊流程

1. 進入 `/register`
2. 呼叫 `GET /api/departments-sections` 取得下拉選單
3. 填寫 `employeeNumber`, `employeeName`, `employeeEmail`, `departmentAndSectionId`
4. 呼叫 `POST /api/auth/register`
5. 成功後寫入 `token` 與 `user`
6. 導向 `/attendance`

---

## 4. 主要檔案變更

### 新增

1. `src/context/AuthContext.jsx`
2. `src/services/apiClient.js`
3. `src/services/authService.js`
4. `src/components/ProtectedRoute.jsx`
5. `src/pages/Login.jsx`
6. `src/pages/Register.jsx`
7. `src/styles/auth.css`
8. `.env.example`
9. `.env.development`

### 修改

1. `src/App.jsx`
2. `src/main.jsx`
3. `src/layouts/MainLayout.jsx`
4. `src/pages/AttendanceRecord.jsx`
5. `src/config/routes.jsx`
6. `package.json`（新增 axios）

---

## 5. 錯誤處理策略

### Login

1. `401`：提示「找不到此員工，是否前往註冊？」
2. `403`：提示聯絡管理員
3. `429`：提示稍後再試
4. 網路/伺服器錯誤：提示連線失敗或一般錯誤訊息

### Register

1. `400`：提示欄位格式或資料錯誤
2. `409`：提示員工編號已存在
3. `429`：提示稍後再試
4. 網路/伺服器錯誤：提示連線失敗或一般錯誤訊息

---

## 6. UI/UX 規範對齊

1. 視覺延續既有 industrial theme（Ant Design + 灰藍色系）
2. Login/Register 共享同一組樣式語言
3. 主要互動元件符合最小 44x44 觸控尺寸
4. 可見 focus 樣式
5. 手機字級至少 16px
6. 保留 `prefers-reduced-motion` 降階處理

---

## 7. 開發期例外處理（非業務邏輯）

`src/main.jsx` 內新增一段僅在開發環境生效的 `unhandledrejection` 過濾器，用於忽略瀏覽器擴充套件常見訊息：

- `A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received`

此段用途為提升開發時 console 可讀性，不屬於產品功能邏輯，且不在 production 環境生效。

---

## 8. 驗證紀錄

### 已驗證

1. 未登入直接進入受保護路徑會導回 `/`
2. 登入成功後可導向 `/attendance`
3. 註冊成功後可自動登入並導向 `/attendance`
4. MainLayout 顯示登入者姓名與角色
5. 登出後回到 `/`
6. Attendance 新增紀錄採用 AuthContext 的 `employeeId`

### 已修復問題

1. `ProtectedRoute` 造成的重導迴圈（Maximum update depth exceeded）
2. Ant Design v6 deprecation warning
   - Space `direction` -> `orientation`
   - Alert `message` -> `title`

---

## 9. 後續建議

1. 將 `tryOidcLogin()` 替換為真正 OIDC 流程
2. 導入 Refresh Token 或 HttpOnly Cookie 強化安全性
3. 將 Attendance 頁完整改為 API 驅動
4. 補上認證流程的 E2E 測試（login/register/logout/forbidden）
