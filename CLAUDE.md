# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 重要規則

- **不提及客戶公司名稱**：所有文件、程式碼、註解中一律不出現客戶公司名稱，統一以「客戶」或「Facilities 部門」代替。

## 專案狀態

此目錄目前為**設計規劃階段**，尚無實作程式碼。所有文件為 Facilities 部門管理平台的架構設計與需求規格。

核心文件：
- [project_overview.md](project_overview.md) — 專案範圍、使用者權限模型、風險紀錄
- [architecture.md](architecture.md) — 技術選型、系統架構、API 設計規範
- [features.md](features.md) — 13 個功能模組詳細需求

## 計畫技術架構

### 系統拓撲

```
SharePoint（入口）→ React SPA ↔ Node.js/Express → MSSql DB（既有唯讀 + 新建）
                       ↕
                    Nginx（反向代理）
                    /        → React 靜態檔
                    /api      → Node.js 容器（port 3000）
                    /uploads  → VM 本地磁碟（volume mount）
```

部署：Docker Compose on Windows VM（Docker Desktop + WSL2），服務僅含 nginx + api 兩個容器，MSSql 不容器化。

### 前端

React 18 + Ant Design + React Router v6 + Axios + Zustand（或 Context API）

### 後端

Node.js + Express + mssql（node-mssql）+ JWT + bcrypt + Multer

### 多環境

`.env` + `docker-compose.override.yml` 區分 dev / test / prod。

## 關鍵設計決策

### 身份驗證

- 自建帳密系統，JWT 存於 localStorage（XSS 風險評估中，替代方案為 HttpOnly Cookie）
- JWT payload 包含 `user_id`、`role`、權限清單
- 登入端點：`POST /api/auth/login`

### 三層權限模型

1. **功能存取**：功能權限矩陣（員工 × 功能模組 = 開/關，預設全開）
2. **功能內操作**：角色（一般使用者 / 管理者）
3. **資料級**：後端邏輯（部分功能使用者只能操作自己的資料）

### 操作 Log

所有寫入操作由後端 middleware 統一寫入 `operation_logs` 資料表，**只寫不刪**。detail 欄位建議格式：`{ before: {...}, after: {...}, reason: "..." }`。建立索引：`(feature, created_at)`、`(user_id, created_at)`。

### 員工表設計

軟刪除策略：`is_active` 欄位。下拉選單只顯示 `is_active = true`，歷史紀錄仍顯示已停用員工姓名。**員工表與使用者表是否合併待確認（architecture.md）**。

### 篩選條件動態產生

Alarm、每日工項等功能的篩選選項應使用 `SELECT DISTINCT` 從資料動態產生，不寫死於程式碼。

### 公告展示型功能（Feature 7、8、9、12、13）

區塊式 CMS 編輯器，區塊類型：文字（富文字）、圖片、影片、行事曆、連結。區塊資料以 JSON 存 DB，前端依結構 render。富文字輸出須以 DOMPurify sanitize。

### API 設計

- 列表型 API 統一分頁：`{ data, total, page, pageSize }`
- 錯誤格式：`{ error: { code, message, details } }`
- CSV 匯出（Feature 11）使用串流回應

## 功能模組優先順序

| 優先順序 | 功能 | 資料來源 |
|---------|------|---------|
| 最高 | Feature 1 Equipment Tracking | 既有 DB → 新建 DB |
| 高 | Feature 2 Alarm | 既有 DB（A/B 兩廠）|
| 高 | Feature 3 出勤紀錄 | Excel → 新建 DB |
| 高 | Feature 4 運轉交接 | 既有 DB |
| 中高 | Feature 6 Audit | 全新建 |
| 中 | Feature 10 Abnormal Review | Excel → 新建 DB |
| 待確認 | Feature 5、7、8、12 | 全部未定義 |

Feature 2、4、11 均為「A 廠有既有 Web/DB、B 廠用 Excel」的整合模式，B 廠網路連通性是關鍵風險（需確認是否需要轉接伺服器）。

## 跨功能模組關聯

- **Feature 1 ↔ Feature 4**：Feature 4 的 Equipment 欄位可能關聯 Feature 1 設備主檔（待確認 X-01）
- **Feature 2 ↔ Feature 10**：Alarm 可能轉為 Abnormal 登記（待確認 X-02）
- **Feature 4 ↔ Feature 10**：異常事件可能出現在交接紀錄（待確認 X-03）
- **Feature 3 ↔ Feature 11**：人員出勤與每日出工是否需一致性檢查（待確認 X-04）
