# 伺服器建置規格說明 — 第一階段
**日期**：2026-04-24  
**範圍**：FAC-web 廠務管理平台後端環境建置

---

## 1. 目標

在 `./server` 目錄建立後端基礎架構，以提供出勤紀錄功能（Feature 3）的 API 服務。  
第一階段僅包含基礎建設，不實作業務路由（出勤／員工 CRUD）。

---

## 2. 技術選型

| 層級 | 技術 | 說明 |
|---|---|---|
| 執行環境 | Node.js 22 (ESM) | `package.json` 中設定 `"type": "module"` |
| 框架 | Express 4 | HTTP 伺服器、中介軟體鏈 |
| 資料庫 | mssql (node-mssql 9) | MSSQL Server 連線池 |
| 身份驗證（目前） | OIDC + jose | JWT 驗證，與驗證提供者無關 |
| 身份驗證（開發備援） | 環境變數控制的 Dev Bypass | 本地開發時不需 OIDC 提供者 |
| 日誌 | pino + pino-http | 結構化 JSON 請求日誌 |
| 資安 | helmet、cors、express-rate-limit | HTTP 標頭保護、CORS、速率限制 |
| 跨平台腳本 | cross-env | Windows 環境下相容的 NODE_ENV 設定方式 |

---

## 3. 檔案結構

```
server/
├── src/
│   ├── config/
│   │   ├── env.js          — 環境變數型別解析、必填驗證、預設值
│   │   ├── db.js           — MSSQL 連線池、具名實例支援、啟動連線測試
│   │   └── oidc.js         — OIDC 設定、狀態日誌
│   ├── middleware/
│   │   └── auth.js         — OIDC Bearer Token 驗證、Dev Bypass 守門
│   ├── routes/
│   │   └── health.js       — /api/health、/api/health/ready、/api/health/live
│   └── spec/
│       └── spec_ServerBuilding_20260424.md   — 本文件
├── app.js                  — Express 應用程式設定、中介軟體鏈、路由掛載
├── server.js               — 程序入口、啟動流程、優雅關閉
├── .env                    — 本地機密設定（已加入 .gitignore）
├── .env.example            — 已提交的環境變數範本
├── .gitignore              — node_modules、.env、日誌、OS/IDE 檔案
└── package.json            — 依賴套件與 npm 腳本
```

---

## 4. 身份驗證策略

### 4.1 目前採用：OIDC 優先

```
前端向 OIDC 提供者取得 Access Token
    → 送出 Authorization: Bearer <token> 至後端
    → auth.js 透過 jose 驗證 JWT 簽章 / 發行者 / 受眾
    → 將身份聲明（email）對應至 Employee.EmployeeEmail WHERE IsAlive = 1
    → 附加 req.user = { employeeId, role, permission } 至請求物件
```

### 4.2 Dev Bypass（僅限本地開發）

需同時滿足以下兩個條件才啟用：
- `NODE_ENV=development`
- `AUTH_DEV_BYPASS=true`

使用方式：`GET /api/auth/dev-login?dev_employee_id=1`

在非開發環境下此端點**強制封鎖**，不可使用。

### 4.3 未來遷移路徑（OIDC → Windows Auth 或其他提供者）

只需修改 `src/middleware/auth.js` — 所有路由與業務邏輯維持不變。

---

## 5. 資料庫連線

透過 `.env` 支援兩種連線模式：

| 模式 | 設定 | 適用時機 |
|---|---|---|
| 固定 TCP 埠 | `DB_SERVER=localhost`、`DB_PORT=1434` | 建議用於本地開發 |
| 具名實例 | `DB_SERVER=.\SQLEXPRESS`、`DB_PORT=` 留空 | 需要 SQL Server Browser 服務運行 |

連線池設定：最少 2 條、最多 10 條連線，閒置逾時 30 秒。  
啟動流程：`server.js` 啟動時即建立連線池；若 DB 無法連線則 `process.exit(1)` 立即終止。

---

## 6. 環境變數說明

| 變數名稱 | 必填 | 預設值 | 說明 |
|---|---|---|---|
| `DB_SERVER` | ✅ | — | SQL Server 主機名稱或 `.\INSTANCE` |
| `DB_PORT` | ✅* | — | TCP 埠號（*使用具名實例時不必填） |
| `DB_INSTANCE_NAME` | — | `""` | 單獨指定實例名稱（可選） |
| `DB_NAME` | ✅ | — | 資料庫名稱 |
| `DB_USER` | ✅ | — | SQL 登入帳號 |
| `DB_PASSWORD` | ✅ | — | SQL 登入密碼 |
| `JWT_SECRET` | ✅ | — | 後端 JWT 簽章／驗證金鑰 |
| `NODE_ENV` | — | `development` | `development` / `production` |
| `PORT` | — | `3000` | HTTP 伺服器監聽埠 |
| `AUTH_DEV_BYPASS` | — | `false` | `true` 時啟用開發登入端點 |
| `OIDC_ISSUER` | — | `""` | OIDC 提供者 Issuer URL |
| `OIDC_CLIENT_ID` | — | `""` | OIDC Client ID |
| `OIDC_AUDIENCE` | — | `""` | Token 預期受眾（Audience） |
| `OIDC_DISCOVERY_URL` | — | `""` | OIDC `.well-known` 探索端點 |

---

## 7. 遭遇問題與解決方式

### 問題一 — Windows 無法識別 `NODE_ENV`
**現象**：`'NODE_ENV' is not recognized as an internal or external command`  
**原因**：Unix 風格的 `NODE_ENV=development node server.js` 語法在 Windows CMD/PowerShell 中不支援  
**解決方式**：新增 `cross-env` 為開發依賴；將 `package.json` 腳本更新為 `cross-env NODE_ENV=development node server.js`

### 問題二 — SQL Server Express 預設關閉 TCP/IP
**現象**：`Failed to connect to localhost:1433 - Could not connect (sequence)`  
**原因**：SQL Server Express 安裝後 TCP/IP 協議預設為**停用**狀態  
**解決方式**：
1. 在 SQL Server 組態管理員中啟用 TCP/IP
2. 在 `IPAll` 區段設定固定埠號（如 `1434`）
3. 重新啟動 `SQL Server (SQLEXPRESS)` 服務

### 問題三 — SQL Server Browser 服務未啟動
**現象**：即使啟用 TCP/IP，具名實例（`.\SQLEXPRESS`）連線仍然失敗  
**原因**：SQL Server Browser 服務未啟動；該服務負責將實例名稱解析為對應埠號  
**解決方式**：啟動 `SQLBrowser` 服務並設定為自動啟動

---

## 8. API 端點（第一階段）

| 方法 | 路徑 | 驗證 | 說明 |
|---|---|---|---|
| GET | `/api/health` | 無 | 完整健康狀態 + 資料庫連線確認 |
| GET | `/api/health/ready` | 無 | 就緒探針（資料庫是否連線？） |
| GET | `/api/health/live` | 無 | 存活探針（程序是否運行？） |

---

## 9. 第二階段預告（尚未實作）

- `GET /api/attendance/types` — 出勤類型查找表
- `GET /api/employees` — 員工列表（含篩選）
- `GET /api/attendance/records` — 出勤紀錄（分頁）
- `POST /api/attendance/records` — 新增出勤紀錄
- `DELETE /api/attendance/records/:id` — 軟刪除（IsAlive = 0）
- `src/db/schema.sql` — 資料庫 Schema 參考
- `src/db/seed.js` — 填入 AttendanceType、Employee、EmployeePermission 初始資料
