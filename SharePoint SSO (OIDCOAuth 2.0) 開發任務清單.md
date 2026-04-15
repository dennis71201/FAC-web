# SharePoint SSO (OIDC/OAuth 2.0) 開發任務清單

## 📌 專案概觀

- **目標**：實現以 SharePoint (Microsoft Entra ID) 為身分驗證源的單一入口登入 (SSO)。
- **技術棧**：Node.js, Express, MSAL Node (@azure/msal-node)。
- **授權模式**：Authorization Code Flow (授權碼流程)。

------

## 🛠 階段一：環境準備與註冊 (Azure Portal)

> **Agent 指示**：請確認已具備 Microsoft Entra 管理者權限。

- [ ] **1.1 註冊應用程式 (App Registration)**
  - 登入 Azure Portal 並建立新註冊。
  - 設定 `Supported account types` 為組織內帳戶或多租戶。
- [ ] **1.2 獲取認證資訊 (Credentials)**
  - 紀錄 `Application (client) ID`。
  - 紀錄 `Directory (tenant) ID`。
  - 在 `Certificates & secrets` 產生新的 `Client Secret` 並妥善保存。
- [ ] **1.3 設定重新導向網址 (Redirect URI)**
  - 在 Platform configurations 新增 Web 平台。
  - 設定開發環境網址 (例如：`http://localhost:3000/auth/callback`)。
- [ ] **1.4 配置 API 權限 (API Permissions)**
  - 新增 `Microsoft Graph` 權限。
  - 勾選 `User.Read` (基本登入) 與 `Sites.Read.All` (存取 SharePoint)。

------

## 💻 階段二：Node.js 後端架構實作

> **Agent 指示**：請使用 `npm` 安裝必要套件，並建立基礎 Express 路由。

- [ ] **2.1 初始化開發環境**
  - [ ] 執行 `npm install @azure/msal-node express dotenv`。
  - [ ] 建立 `.env` 檔案存放 Secret 與 ID。
- [ ] **2.2 配置 MSAL 實例 (Client Configuration)**
  - [ ] 撰寫 `authConfig` 物件，包含 `auth: { clientId, authority, clientSecret }`。
  - [ ] 實例化 `ConfidentialClientApplication`。
- [ ] **2.3 實作登入路由 (Auth Routes)**
  - [ ] **GET `/login`**：使用 `getAuthCodeUrl` 產生微軟登入網址並重新導向。
  - [ ] **GET `/auth/callback`**：
    - 接收網址參數中的 `code`。
    - 呼叫 `acquireTokenByCode` 交換 `Access Token` 與 `ID Token`。
    - 將使用者資訊存入 Session。
- [ ] **2.4 實作中介軟體 (Middleware)**
  - [ ] 建立 `isAuthenticated` 函式，保護需要登入才能存取的路由。

------

## 📂 階段三：SharePoint 資源存取 (Microsoft Graph)

> **Agent 指示**：利用取得的 Access Token 呼叫微軟 API。

- [ ] **3.1 封裝 Graph API 請求**
  - 建立一個通用函數，在 HTTP Header 注入 `Authorization: Bearer <Access_Token>`。
- [ ] **3.2 測試存取 SharePoint 資料**
  - 實作 API 端點獲取使用者的 SharePoint 網站清單。

------

## 🧪 階段四：測試與安全性驗證

- [ ] **4.1 令牌生命週期測試**
  - 測試 `Access Token` 過期後，是否能透過 `Refresh Token` 自動更新。
- [ ] **4.2 安全性檢查**
  - 確認 `Client Secret` 未提交至 Git。
  - 確認 `Redirect URI` 僅允許 HTTPS (正式環境)。

------

## 📝 備註與參考資料

- **MSAL Node 官方文檔**：`https://github.com/AzureAD/microsoft-authentication-library-for-js`
- **Scopes 參考**：`openid`, `profile`, `User.Read`, `Sites.Read.All`

------

### Agent AI 執行建議

1. **讀取環境變數**：請優先檢查 `.env` 檔案是否存在並包含必要欄位。
2. **依賴安裝**：若執行環境未安裝套件，請先行執行 `npm install`。
3. **錯誤處理**：在 `auth/callback` 邏輯中，必須處理使用者取消授權 (Access Denied) 的情況。