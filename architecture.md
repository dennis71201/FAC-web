# 技術架構文件

## 整體架構

```
┌─────────────────────────────────────┐
│         SharePoint 入口頁           │
│   導覽連結（Quick Links）           │
│   點擊後跳轉至 Custom App           │
└─────────────┬───────────────────────┘
              │ URL 跳轉
┌─────────────▼───────────────────────────────────────────┐
│                    Custom Web App                       │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │              React SPA（前端）                    │  │
│  │  Ant Design UI + React Router + Axios            │  │
│  └──────────────────────┬───────────────────────────┘  │
│                         │ REST API                      │
│  ┌──────────────────────▼───────────────────────────┐  │
│  │           Node.js + Express（後端）               │  │
│  │  JWT Auth │ API Router │ Multer │ Logger          │  │
│  │     受 PM2 cluster mode 管理                      │  │
│  └──────────────────────┬───────────────────────────┘  │
│                         │                               │
│  ┌──────────────────────▼───────────────────────────┐  │
│  │  DBA02 / MTB_FAC_OPS_WEB                         │  │
│  │  本專案唯一連線對象（MSSql Server）              │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  部署：Windows Server 2022 + IIS (ARR) + PM2（無 Docker）│
└─────────────────────────────────────────────────────────┘
```

> **資料庫範圍**：本專案僅連 `DBA02` 上的 `MTB_FAC_OPS_WEB`。
> 其他既有 DB（如廠商唯讀 DB、跨網中繼 DB、跨廠 Alarm DB）的同步與整合由**獨立專案**處理，相關資料最終會匯入 DBA02，本專案直接查詢即可。

---

## 部署限制（重要）

### VM 環境

| 項目 | 限制 |
| --- | --- |
| 虛擬化平台 | VMware 開的 Windows Server 2022 x64 |
| 巢狀虛擬化 | **不可用** → 無法跑 Docker Desktop / WSL2 |
| Docker | **不可用**（原規劃已棄用） |
| 指令限制 | `npm install`、`git clone` 會被 reset |
| 檔案取得 | **僅能從 GitHub 網站下載 zip** |

### 衍生規則

- **Repo 必須包含完整 `node_modules`**：因 VM 無法跑 `npm install`，所有依賴需隨 repo 推上 GitHub
- `.gitignore` 需移除 `node_modules` 項，但需注意 repo 體積（考慮 Git LFS 或只推 production deps）
- 前端 `dist/` 同理，需在本機 build 後 commit，再由 VM 下載 zip 部署

### 備援層級

| 層級 | 方案 | 狀態 |
| --- | --- | --- |
| 程序層 | PM2 cluster mode（N 個 Node instance，掛掉自動重啟） | ✅ 採用 |
| VM 層 | 需第 2 台 VM 做主備 | ⏳ NF-04 待確認 |
| 資料層 | DBA02 備份頻率由業主維運端決定 | ⏳ NF-04 待確認 |

---

## 技術選型

### 前端

| 項目         | 技術                  | 說明                                        |
| ------------ | --------------------- | ------------------------------------------- |
| 框架         | React 18              | SPA，打包後部署為靜態檔案                   |
| UI 元件庫    | Ant Design            | 企業級元件，Table / Form / Calendar 開箱即用 |
| 路由         | React Router v6       | 前端頁面切換                                |
| API 呼叫     | Axios                 | HTTP 請求，含攔截器處理 JWT token           |
| 狀態管理     | Zustand 或 Context API | 輕量，適合此規模                            |
| 富文本/拖拉編輯器 | 共用元件（F4 + F7~9/12/13） | 拖拉式區塊編輯器；候選 Editor.js / Craft.js / TipTap / 自建（**Feature 4 / 7~9 / 12 / 13 尚未開發**） |

### 後端與反向代理

**選擇 IIS + ARR 的理由**：

1. Windows Server 2022 已內建 IIS，微軟官方 production 支援
2. Nginx 官方 Windows 版標為 [beta 版](https://nginx.org/en/docs/windows.html)（單 worker、`select()`/`poll()`、不建議 production）
3. IIS 為原生 Windows Service，無需外部包裝（相較 Nginx 需 nssm）
4. 憑證管理、SSL 設定有 GUI 與 Windows 憑證庫整合，維運對無 IT 支援團隊更友善
5. 未來業主 IT 介入維運時，IIS 是他們熟悉的工具

### 後端

| 項目         | 技術                  | 說明                                        |
| ------------ | --------------------- | ------------------------------------------- |
| 執行環境     | Node.js               | 與前端同語言，維護成本低                    |
| 框架         | Express.js            | 輕量、彈性、生態完整                        |
| API 風格     | RESTful API           | 資源導向設計，標準 HTTP 方法                 |
| 資料庫連線   | mssql (node-mssql)    | MSSql Server 官方 Node.js 套件              |
| 身份驗證     | JWT + bcrypt（初期） / Entra ID SSO（評估中） | 詳「身份驗證設計」章節 |
| 圖片上傳     | Multer                | Express middleware，處理 multipart/form-data |
| 程序管理     | **PM2**               | Cluster mode、自動重啟、log 輪替             |

### 部署

| 項目         | 技術                  | 說明                                              |
| ------------ | --------------------- | ------------------------------------------------- |
| 伺服器       | Windows Server 2022 x64 | 無 Docker / WSL2                                  |
| 前端服務 + 反向代理 | **IIS + ARR + URL Rewrite** | IIS Site 服務 React 靜態檔、ARR/URL Rewrite 將 `/api/*` 反向代理至 Node（localhost:3000）|
| 程序管理     | PM2 + [pm2-installer](https://github.com/jessety/pm2-installer) | 包成 Windows Service，開機自啟 |
| Windows Service | IIS 原生為 Service，PM2 透過 pm2-installer 包 Service | 兩者皆在 `services.msc` 管理 |
| SSL/TLS      | IIS 層處理，可使用 Windows 憑證庫綁定 | 憑證位置待 T-03 確認 |
| 圖片儲存     | VM 本地磁碟           | IIS Virtual Directory 提供靜態存取              |

### 服務架構

```text
[Client]
   │ HTTPS (443)
   ▼
[IIS]  ← 原生 Windows Service
   ├ Static (/)             → C:\inetpub\wwwroot\facility\dist
   └ ARR + URL Rewrite      → http://127.0.0.1:3000
     (/api/*)                      │
                                   ▼
                        [PM2]  ← Windows Service (via pm2-installer)
                           └ node server.js × N instances (cluster mode)
                                  │
                                  ▼
                              [DBA02 / MTB_FAC_OPS_WEB (MSSql)]
```

### PM2 配置範例（`ecosystem.config.js`）

```js
module.exports = {
  apps: [{
    name: "facility-api",
    script: "./backend/server.js",
    instances: "max",        // cluster mode，利用多核
    exec_mode: "cluster",
    watch: false,
    env_production: {
      NODE_ENV: "production",
      PORT: 3000,
      DB_SERVER: "DBA02",
      DB_NAME: "MTB_FAC_OPS_WEB",
    },
    error_file: "./logs/err.log",
    out_file: "./logs/out.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss",
  }],
};
```

開機自啟（Windows Service 化）：

```bash
# 安裝 pm2-installer
npm install -g pm2-installer
pm2-installer install
pm2 start ecosystem.config.js --env production
pm2 save
```

### 多環境配置

| 環境    | 說明                                        |
| ------- | ------------------------------------------- |
| dev     | 本機 `pm2-dev` 或直接 `npm run dev`，hot reload |
| test    | 測試 VM，配置接近 prod                      |
| prod    | 正式 VM，PM2 cluster，自動重啟               |

透過 `.env` 檔或 PM2 的 `env_*` 欄位切換 DB 連線、Port、Log 等級。

---

## Alarm 資料流（跨廠區整合）

> **本專案範圍**：僅查詢 DBA02 上整合後的 Alarm 資料；跨廠同步、廠商 DB 資料抓取等由獨立專案處理。
> 本章節保留作為**邊界說明**，避免本專案後端誤直連其他 DB。

### 邊界規則

- **本專案後端不直連任何非 DBA02 的 DB**
- Alarm 資料寫入 DBA02 的時程 / 頻率 / schema 由同步專案決定
- 為未來第 3 廠（AATT 2）預留欄位：Alarm schema 的 `site` 欄位預留多值空間
- DBA02 為 SQL Server Express 版本：**不可使用 linked server**（T-10 已確認）。跨 DB 查詢需透過應用層處理

詳細跨廠資料流規劃由同步專案維護，不在本文件範圍內。

---

## 開發工作流程

### 分支策略（GitHub Flow）

- `main` 分支保持可部署狀態
- 開發新功能時從 `main` 建立 feature branch（如 `feature/f1-equipment-tracking`）
- 完成後發 Pull Request，經 code review 後合併回 `main`

### Mock 策略（MSW）

採用 [MSW（Mock Service Worker）](https://mswjs.io/) 在前端攔截 API 請求，回傳模擬資料。

- **框架先行階段**：所有 API 呼叫由 MSW handler 回應，前後端可獨立開發
- **資料對接階段**：移除 MSW handler，切換至實際後端 API
- MSW 僅在開發環境啟用，正式環境不載入

```text
開發環境請求流程：
React App → Axios → MSW 攔截 → 回傳 mock data

正式環境請求流程：
React App → Axios → IIS (ARR) → Node.js API → MSSql (DBA02)
```

### GitHub zip 部署流程

由於 VM 不能跑 `git clone` / `npm install`，部署流程：

1. 本機 `npm ci` + `npm run build`（前端）
2. Commit `node_modules` + `dist/` 推上 GitHub（或用 release artifact）
3. VM 從 GitHub 下載 zip，解壓到部署目錄
4. VM 啟動 PM2（已包為 Windows Service）
5. VM 確認 IIS Site 根目錄已指向新版 `dist/`（可用 `appcmd` 或 IIS Manager）

---

## 身份驗證設計

### 初期（MVP）：自建 JWT

- 使用 **JWT（JSON Web Token）** + bcrypt
- 員工表 + `IsAlive` 軟刪除
- 支援功能權限（`Permission` JSON 欄位）與角色（`Role`）

### 後續評估：Microsoft Entra ID SSO

探勘階段不影響 MVP 開發（MVP 走 JWT），待結論確定後再切換或並行：

- **可能優勢**：使用者免再記一組密碼、與業主既有帳號系統整合
- **前提條件**：T-01（SharePoint Online vs On-Premise）需確認，且業主提供 App registration
- **影響範圍**：認證 middleware、`employees` 表結構（需新增 `azure_oid` 欄位以對應）

### 登入流程（JWT 版）

```text
使用者輸入帳密
      │
      ▼
POST /api/auth/identify
      │
      ▼
後端驗證（EmployeeNumber + IsAlive=1 + 有 EmployeePermission）
      │
      ▼
回傳 JWT Token（含 employeeId、role、permissions）
      │
      ▼
前端存入 localStorage，後續請求帶在 Header
Authorization: Bearer <token>
```

### Token 存放（目前實作）

| 項目 | 現況 | 待改善 |
| --- | --- | --- |
| 存放位置 | **localStorage** | XSS 風險，建議改為 sessionStorage 或 HttpOnly Cookie（⏳ SEC-01） |
| 過期時間 | 8 小時 | — |
| Refresh Token | 未實作 | ⏳ SEC-02 |
| 登出後撤銷 | 前端清除 token，後端不檢查（無黑名單） | ⏳ SEC-02 |

---

## 組織結構與員工資料模型

### 核心表（已實作）

```sql
DepartmentAndSection      -- 部門與課別對照表
Employee                  -- 員工主檔（合併使用者表）
EmployeePermission        -- 員工角色與功能權限
AttendanceType            -- 假別查找表
AttendanceRecord          -- 出勤紀錄
```

完整 schema 見 [DB_schema.md](DB_schema.md) 與 [server/db/schema.sql](server/db/schema.sql)。

### 使用者表 vs. 員工表

採**單一 `Employee` 表**設計（不另立 users 表）：

| 欄位 | 用途 |
| --- | --- |
| `EmployeeId` | 主鍵 |
| `EmployeeNumber` | 登入識別 |
| `EmployeeEmail` | 預留 SSO 對應與通知用 |
| `EmployeeDepartment` / `EmployeeSection` | 顯示用（與 `DepartmentAndSectionId` 同步寫入） |
| `DepartmentAndSectionId` | FK → `DepartmentAndSection` |
| `IsAlive` | 軟刪除（停用後歷史紀錄仍顯示） |
| `CreateTime` | 建立時間 |

權限與角色另存於 `EmployeePermission` 表（JSON Permission 欄位 + `Role`），詳見 [BACKEND_GUIDE.md](BACKEND_GUIDE.md)。

### 未來 SSO 整合預留

若改採 Entra ID SSO，需在 `Employee` 增加 `azure_oid` 欄位指向 Entra ID Object ID，認證流程改由 token 內的 OID 對應到 EmployeeId。

---

## 操作 Log 設計

所有寫入操作統一記錄，跨功能通用。

### operation_logs 資料表（規劃中，尚未實作）

| 欄位       | 型別         | 說明                                  |
| ---------- | ------------ | ------------------------------------- |
| id         | BIGINT PK    | 主鍵，自動遞增                        |
| user_id    | INT          | 操作者 ID                             |
| feature    | VARCHAR(50)  | 功能模組（equipment / alarm / handover...） |
| action     | VARCHAR(20)  | 操作類型（create / update / delete / login） |
| entity_id  | VARCHAR(50)  | 被操作的資料 ID（可為 null）          |
| detail     | NVARCHAR(MAX)| JSON，記錄變更前後值或操作描述        |
| ip_address | VARCHAR(45)  | 來源 IP                               |
| created_at | DATETIME     | 時間戳記                              |

### 規則

- Log **只寫不刪**，不提供刪除 API
- 管理者可在系統管理頁查詢 Log（依功能、使用者、時間區間篩選）
- 後端統一以 middleware 處理，各 API 不需自行實作
- **建議索引**：`(feature, created_at)`、`(user_id, created_at)` 以加速篩選查詢
- **歸檔策略**：待確認資料保留期限（⏳ NF-03），長期需考慮分區或歸檔機制
- **detail JSON 結構**：建議統一格式（如 `{ before: {...}, after: {...}, reason: "..." }`），以利跨功能查詢與審計

---

## 公告類功能 CMS 設計

Feature 7、8、9、12、13 屬於公告展示型，**並與 Feature 4 的富文本內容區共用同一個編輯器元件**。

> **狀態**：上述 Feature 4 / 7 / 8 / 9 / 12 / 13 **目前尚未開發**，本章節為前瞻設計。

### 設計方向：拖拉式區塊編輯器

管理者可在頁面中自由新增以下區塊（Block）：

| 區塊類型   | 說明                           |
| ---------- | ------------------------------ |
| 文字區塊   | 富文字編輯（含顏色、粗體、底線、黃底等代表性格式） |
| 圖片區塊   | 上傳圖片並可加說明文字         |
| 影片區塊   | 上傳影片，頁面內直接播放       |
| 行事曆區塊 | 用於 Feature 13 萬年曆         |
| 連結區塊   | 外部連結卡片                   |

- 區塊資料以 JSON 格式存入 DB，前端依結構 render
- **設計原則**：以使用者「能看、能用」為主，不求像 Notion 細緻的排版能力
- 候選元件：[Editor.js](https://editorjs.io/)、[Craft.js](https://craft.js.dev/)、TipTap、自建

---

## IIS + ARR 設定方向

### 必要元件

| 元件 | 用途 | 安裝方式 |
| --- | --- | --- |
| IIS | Web Server 主體（Windows Server 2022 已內建） | Server Manager → Add Roles → Web Server (IIS) |
| [URL Rewrite 2.1](https://www.iis.net/downloads/microsoft/url-rewrite) | 提供 rewrite rule 語法 | Web Platform Installer 或獨立 MSI |
| [Application Request Routing (ARR) 3.0](https://www.iis.net/downloads/microsoft/application-request-routing) | 啟用反向代理能力 | 同上 |

### 設定步驟

1. **建立 Site**：Site 名稱 `facility-web`，實體路徑指向 `C:\inetpub\wwwroot\facility\dist`，Binding `https:443`
2. **綁定 SSL 憑證**：於 IIS Manager → Bindings 選取憑證（待 T-03 確認後填入）
3. **啟用 ARR Proxy**：IIS Manager 根節點 → Application Request Routing Cache → Server Proxy Settings → 勾選 `Enable proxy`
4. **寫 URL Rewrite 規則**：於 `facility-web` Site 的 `web.config` 加入下方規則
5. **設 SPA fallback 規則**（React Router 需要）

### web.config 範例

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <!-- /api/* 反向代理至 Node.js (PM2) -->
        <rule name="ReverseProxyToNode" stopProcessing="true">
          <match url="^api/(.*)" />
          <action type="Rewrite" url="http://127.0.0.1:3000/api/{R:1}" />
        </rule>

        <!-- /uploads/* 指向實體目錄（IIS 靜態服務） -->
        <rule name="StaticUploads" stopProcessing="true">
          <match url="^uploads/(.*)" />
          <action type="None" />
        </rule>

        <!-- SPA fallback：其他所有路徑都交給 index.html 由 React Router 處理 -->
        <rule name="SPAFallback" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>

    <!-- 上傳檔案虛擬目錄，可另外於 IIS Manager 以 Virtual Directory 掛載 C:\app\data\uploads -->
    <staticContent>
      <clientCache cacheControlMode="UseMaxAge" cacheControlMaxAge="30.00:00:00" />
    </staticContent>

    <!-- HTTPS Redirect：若從 HTTP 進來強制跳 HTTPS -->
    <httpRedirect enabled="false" />
  </system.webServer>
</configuration>
```

### HTTP → HTTPS 強制跳轉

建立第二個 Site 或在同 Site 加 Binding `http:80`，再用 URL Rewrite `Redirect` rule：

```xml
<rule name="HttpsRedirect" stopProcessing="true">
  <match url=".*" />
  <conditions>
    <add input="{HTTPS}" pattern="off" />
  </conditions>
  <action type="Redirect" url="https://{HTTP_HOST}/{R:0}" redirectType="Permanent" />
</rule>
```

### 上傳檔案目錄

`/uploads` 由 IIS 直接服務（不經 Node）：

- 於 `facility-web` Site 新增 Virtual Directory：別名 `uploads`、實體路徑 `C:\app\data\uploads`
- 確認 `IIS_IUSRS` 對該目錄有讀取權限
- Node 寫入該目錄時需同樣的權限（或用 PM2 service account 寫入）

### ARR 常見踩坑

| 問題 | 解法 |
| --- | --- |
| Node 收到的 Host header 是 `127.0.0.1:3000` 而非原始 Host | ARR 預設會保留 Host，若無效檢查 `Preserve Host Header` 設定 |
| WebSocket 不通（若未來需要） | 需額外啟用 ARR 的 WebSocket proxy 設定 |
| 大檔案上傳 413 | 調整 IIS `maxAllowedContentLength` 與 ARR 的 `RequestTimeout` |
| POST body 被吃掉 | 確認 rewrite rule 未 stop/cut body |

---

## 待確認技術項目

| #    | 問題                                              | 待確認對象 | 對開發影響 |
| ---- | ------------------------------------------------- | ---------- | ---------- |
| T-01 | SharePoint Online 還是 On-Premise？                | 業主 IT    | 影響是否能升級為 Entra ID SSO 統一登入 |
| T-03 | VM 是否有對外 IP 或 domain？                       | 業主 IT    | 影響 SSL 憑證選擇（Let's Encrypt / 企業 CA / 自簽） |
| NF-04 | 是否提供第 2 台 VM 做主備？                        | 業主 IT    | 影響 VM 層備援與災難恢復能力 |
| SEC-01 | Token 改 sessionStorage 或 HttpOnly Cookie？      | 內部決議   | 影響前端 [AuthContext.jsx](demo-app/src/context/AuthContext.jsx) 與後端 set-cookie |
| SEC-02 | JWT 過期時間、Refresh Token、撤銷機制              | 內部決議   | 影響登入體驗與安全性 |
| SEC-03 | 連續登入失敗鎖定策略                                | 業主決議   | 影響 [auth.js](server/src/routes/auth.js) 邏輯 |
| NF-03 | operation_logs 保留期限                             | 業主決議   | 影響歸檔策略 |
| NF-06 | 峰值同時在線數                                     | 業主決議   | 影響連線池與快取設計 |

---

## 安全性基線

### HTTPS / TLS

- **IIS 層處理 TLS termination**，憑證綁定於 Site Binding
- 憑證來源待 T-03 確認後決定（Let's Encrypt / 企業內部 CA / 自簽 / Windows 憑證庫既有）
- HTTP → HTTPS 強制跳轉以 URL Rewrite 實作（見設定範例）
- HSTS header 於 IIS `web.config` 加 `<customHeaders>` 設定

### CSRF 防護

- SPA + JWT Bearer Token 不受傳統 CSRF 攻擊影響
- 若改 Cookie 存放（SEC-01），需搭配 CSRF Token 或 SameSite Cookie

### 檔案上傳安全

- Multer 配置：MIME 白名單、單檔大小上限、儲存路徑隔離於 web root 之外
- 圖片：png、jpg 為 F4 確認格式；其他上限待 SEC-04
- 影片：格式與是否需轉碼待 SEC-05

### 登入安全

- Rate Limiting（已實作：identify 端點 15 分鐘 20 次 / IP；全域 15 分鐘 100 次 / IP）
- 連續登入失敗的帳戶鎖定策略 ⏳ SEC-03
- 登入失敗事件應記錄至 operation_logs（action = `login_failed`）

### 富文字 XSS 防護

- 編輯器產出的 HTML 內容，前端 render 前須經過 sanitize（DOMPurify）
- 禁止 `<script>`、`<iframe>`、`on*` 事件屬性

---

## API 設計規範

### 分頁

- 所有列表型 API 預設啟用分頁，採用 **offset-limit** 模式
- 預設每頁筆數待 NF-06 確認，建議 20~50 筆
- 回應格式：`{ data: [...], total: number, page: number, pageSize: number }`

> 例外：`GET /api/attendance/records` 不分頁（已用 year/month 自然限制單月資料量），詳見 [server/src/spec/spec_APIList.md](server/src/spec/spec_APIList.md)。

### 錯誤回應格式

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "人類可讀的錯誤描述",
    "details": {}
  }
}
```

### 大量資料匯出

- Feature 11（每日工項）需匯出 CSV，建議使用串流回應避免記憶體不足

---

## 非功能需求（待確認）

| 項目             | 建議方向                                                   | 待確認編號 |
| ---------------- | ---------------------------------------------------------- | ---------- |
| 瀏覽器相容性     | 建議至少支援 Chrome + Edge 最新兩版                        | NF-01      |
| 行動裝置         | 業主表示後面再說                                           | NF-02（🔽延後）|
| 資料保留         | operation_logs / Alarm 等需定義保留期限與歸檔策略          | NF-03      |
| 備份與災難恢復   | 單 VM 為單點故障；需第 2 台 VM 才能做 VM 層備援            | NF-04      |
| 監控與告警       | PM2 自帶監控，外部告警方式待定                             | NF-05      |
| 併發使用者       | 百人級別，需確認峰值同時在線數                              | NF-06      |

---

## 資料遷移規劃

所有功能的目標資料庫統一為 **DBA02 / `MTB_FAC_OPS_WEB`**。

| 功能       | 遷移來源                     | 遷移目標   | 複雜度 | 待確認編號 |
| ---------- | ---------------------------- | ---------- | ------ | ---------- |
| Feature 1  | 既有 DB（每日抓取）          | DBA02      | 中     | E-09 已確認方式（每日），時程 M-01 |
| Feature 3  | Excel                        | DBA02      | 中     | M-02       |
| Feature 4  | 既有 MSSql DB                | DBA02      | 低-中  | R-01       |
| Feature 11 | A 廠 DB + B 廠 Excel         | DBA02      | 高     | M-03       |

> Feature 2（Alarm）的跨廠資料整合由獨立專案處理，本專案僅查詢 DBA02 上同步後的結果。

每項遷移需確認：遷移時程、負責人、歷史資料範圍、資料驗證方式、rollback 計畫（M-04）。
