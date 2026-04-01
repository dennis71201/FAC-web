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
│  └──────┬───────────────────────┬────────────────────┘  │
│         │                       │                       │
│  ┌──────▼──────┐       ┌────────▼──────────────────┐   │
│  │  既有 MSSql │       │  新建 MSSql               │   │
│  │  （唯讀）   │       │  users / logs / 新功能DB  │   │
│  └─────────────┘       └───────────────────────────┘   │
│                                                         │
│  部署：Docker Compose（Nginx + Node.js 容器）           │
└─────────────────────────────────────────────────────────┘
```

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

### 後端

| 項目         | 技術                  | 說明                                        |
| ------------ | --------------------- | ------------------------------------------- |
| 執行環境     | Node.js               | 與前端同語言，維護成本低                    |
| 框架         | Express.js            | 輕量、彈性、生態完整                        |
| API 風格     | RESTful API           | 資源導向設計，標準 HTTP 方法（GET/POST/PUT/DELETE） |
| 資料庫連線   | mssql (node-mssql)    | MSSql Server 官方 Node.js 套件              |
| 身份驗證     | JWT + bcrypt          | 自建帳密登入，密碼加密儲存                  |
| 圖片上傳     | Multer                | Express middleware，處理 multipart/form-data |
| 容器化       | Docker + Docker Compose | 環境一致性，多環境部署（dev/test/prod）    |

### 部署

| 項目         | 技術                  | 說明                                              |
| ------------ | --------------------- | ------------------------------------------------- |
| 容器化       | Docker + Docker Compose | 開發/測試/正式環境一致，服務編排與自動重啟       |
| 伺服器       | Windows VM（單台）    | 安裝 Docker Desktop（WSL2）                       |
| 反向代理     | Nginx（容器）         | `/` → React 靜態檔，`/api` → Node.js 容器         |
| 圖片儲存     | VM 本地磁碟           | Docker volume mount，Nginx 提供靜態存取           |

### 容器架構

```
docker-compose.yml
├── nginx        # Nginx 反向代理 + React 靜態檔
├── api          # Node.js + Express 後端
└── (MSSql 由既有 DB Server 提供，不容器化)
```

### 多環境配置

| 環境    | 說明                                        |
| ------- | ------------------------------------------- |
| dev     | 開發環境，hot reload，本地 DB               |
| test    | 測試環境，模擬正式配置                      |
| prod    | 正式環境，`restart: always` 確保服務自動重啟 |

透過 `.env` 檔案與 `docker-compose.override.yml` 區分各環境的 DB 連線、Port、Log 等級等配置。

---

## 身份驗證設計

- 使用 **JWT（JSON Web Token）**，自建帳密系統
- SharePoint 與 Custom App 為**兩套獨立登入**（SharePoint 版本確認前維持此設計）
- 未來若確認為 SharePoint Online（M365），可評估改為 Azure AD OAuth2 統一 SSO

### 登入流程

```
使用者輸入帳密
      │
      ▼
POST /api/auth/login
      │
      ▼
後端驗證（bcrypt 比對密碼）
      │
      ▼
回傳 JWT Token（含 user_id、role、權限清單）
      │
      ▼
前端存入 localStorage，後續請求帶在 Header
Authorization: Bearer <token>
```

### 待補充項目

| 項目             | 說明                                                                                          | 狀態      |
| ---------------- | --------------------------------------------------------------------------------------------- | --------- |
| Token 過期時間   | JWT 多久過期？（建議 1~8 小時）                                                               | ⏳ SEC-02 |
| Refresh Token    | 是否實作 Refresh Token 機制以無縫續期？                                                       | ⏳ SEC-02 |
| Token 撤銷       | 登出後舊 Token 是否立即失效？（JWT 本身無狀態，需搭配黑名單或短過期時間）                     | ⏳ SEC-02 |
| Token 存放方式   | localStorage 有 XSS 風險；替代方案為 HttpOnly + Secure + SameSite Cookie                      | ⏳ SEC-01 |

---

## 操作 Log 設計

所有寫入操作統一記錄，跨功能通用。

### operation_logs 資料表

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

Feature 7、8、9、12、13 屬於公告展示型，管理者需自訂版面。

### 設計方向：區塊式版面編輯器

管理者可在頁面中自由新增以下區塊（Block）：

| 區塊類型   | 說明                           |
| ---------- | ------------------------------ |
| 文字區塊   | 富文字編輯（標題、內文）       |
| 圖片區塊   | 上傳圖片並可加說明文字         |
| 影片區塊   | 上傳影片，頁面內直接播放       |
| 行事曆區塊 | 用於 Feature 13 萬年曆         |
| 連結區塊   | 外部連結卡片                   |

區塊資料以 JSON 格式存入 DB，前端依結構 render。

---

## Nginx 設定方向

```nginx
server {
    listen 80;

    # 前端 React 靜態檔（打包後 COPY 進 Nginx 容器）
    location / {
        root   /usr/share/nginx/html;
        try_files $uri /index.html;
    }

    # 後端 API（透過 Docker 內部網路連線至 api 容器）
    location /api {
        proxy_pass http://api:3000;
    }

    # 上傳圖片靜態存取（volume mount）
    location /uploads {
        root /data;
    }
}
```

---

## 待確認技術項目

| #    | 問題                                               | 影響                        |
| ---- | -------------------------------------------------- | --------------------------- |
| T-01 | SharePoint Online 還是 On-Premise？                | 是否能升級為 Azure AD SSO   |
| T-03 | VM 是否有對外 IP 或 domain？                       | HTTPS / SSL 憑證配置        |
| T-04 | 既有 MSSql DB 的連線方式（IP、port、帳號權限）     | 後端 API 能否直連            |
| T-05 | 新建 MSSql DB 是裝在同一台 VM 還是另一台 DB Server？| 連線設定                    |

---

## 員工與使用者資料模型

目前文件中有兩個相關但關係未定義的概念：

| 概念     | 用途                                                       | 來源           |
| -------- | ---------------------------------------------------------- | -------------- |
| 使用者表 | 帳號登入、JWT 驗證、角色（一般/管理者）                     | architecture.md |
| 員工表   | 人員選擇下拉選單、`is_active` 狀態、姓名顯示              | features.md    |

**待確認**：兩者是同一張表還是分開？若分開，`users.employee_id` FK → `employees.id`？影響所有涉及人員選擇的功能（Feature 1、3、4、10、11）。

---

## 安全性基線

### HTTPS / TLS

- 目前 Nginx 設定為 `listen 80`（HTTP），**正式環境必須啟用 HTTPS**
- 待 T-03 確認 VM 是否有 domain 後，配置 SSL 憑證（Let's Encrypt 或企業內部 CA）
- 建議同時配置 HTTP → HTTPS 強制跳轉與 HSTS header

### CSRF 防護

- SPA 架構透過 JWT Bearer Token 驗證，理論上不受傳統 CSRF 攻擊影響
- 但若未來改為 Cookie 存放 JWT（SEC-01），需搭配 CSRF Token 或 SameSite Cookie 屬性

### 檔案上傳安全

- Multer 需配置：允許的 MIME type 白名單、單檔大小上限、存儲路徑隔離於 web root 之外
- 圖片建議限制：jpg / png / gif / webp，上限待確認（⏳ SEC-04）
- 影片格式與是否需轉碼待確認（⏳ SEC-05）

### 登入安全

- 建議實作 Rate Limiting（如每 IP 每分鐘最多 10 次登入嘗試）
- 連續登入失敗後的帳戶鎖定策略待確認（⏳ SEC-03）
- 登入失敗事件應記錄至 operation_logs（action = `login_failed`）

### 富文字 XSS 防護

- CMS 區塊編輯器產出的 HTML 內容，前端 render 前須經過 sanitize（如 DOMPurify）
- 禁止 `<script>`、`<iframe>`、`on*` 事件屬性等危險標籤

---

## API 設計規範

### 分頁

- 所有列表型 API 預設啟用分頁，建議採用 **offset-limit** 模式（Ant Design Table 原生支援）
- 預設每頁筆數待確認（⏳ NF-06 併發量確認後決定，建議 20~50 筆）
- 回應格式建議：`{ data: [...], total: number, page: number, pageSize: number }`

### 錯誤回應格式

建議統一 API 錯誤格式：

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
- 匯出筆數上限與是否需背景任務處理待確認

---

## 非功能需求（待確認）

以下項目尚未定義，需與業主確認後補充。詳細追蹤見 [pending_confirmations.md](pending_confirmations.md) NF-01 ~ NF-06。

| 項目             | 建議方向                                                   | 待確認編號 |
| ---------------- | ---------------------------------------------------------- | ---------- |
| 瀏覽器相容性     | 建議至少支援 Chrome + Edge 最新兩版                        | NF-01      |
| 行動裝置         | Ant Design 有基礎響應式，但萬年曆等複雜元件在手機上可用性低 | NF-02      |
| 資料保留         | operation_logs / Alarm 等需定義保留期限與歸檔策略          | NF-03      |
| 備份與災難恢復   | 單 VM 部署為單點故障，需定義 DB + 上傳檔案備份頻率與 RTO/RPO | NF-04    |
| 監控與告警       | 無專業 IT 支援，建議至少配置基礎 health check 與 log 告警  | NF-05      |
| 併發使用者       | 百人級別，需確認峰值同時在線數以設計連線池與快取            | NF-06      |

---

## 資料遷移規劃（待確認）

以下功能涉及資料遷移，目前無具體計畫。詳細追蹤見 [pending_confirmations.md](pending_confirmations.md) M-01 ~ M-04。

| 功能       | 遷移來源                     | 遷移目標   | 複雜度 | 待確認編號 |
| ---------- | ---------------------------- | ---------- | ------ | ---------- |
| Feature 1  | 舊有 MSSql DB                | 新建 DB    | 中     | M-01       |
| Feature 3  | Excel                        | 新建 DB    | 中     | M-02       |
| Feature 4  | 既有 MSSql DB（R-01 待確認） | 新建 DB    | 低-中  | R-01       |
| Feature 11 | A 廠 DB + B 廠 Excel         | 新建 DB    | 高     | M-03       |

每項遷移需確認：遷移時程、負責人、歷史資料範圍、資料驗證方式、rollback 計畫（M-04）。
