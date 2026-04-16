# Facilities 同步程式

獨立的資料同步工具，負責將 Alarm 資料從 A 廠 / B 廠 source DB 搬運到主操作 DB (DBA02)。

---

## 資料流

```
A 廠:
  RDS02 (廠商 DB, 唯讀)  ──(alarm_rds02_to_dba02)──▶  DBA02 (主 DB)

B 廠:
  B1SA01 (內網)  ──(alarm_b1sa01_to_dba03)──▶  DBA03 (跨網中繼)
  DBA03          ──(alarm_dba03_to_dba02)──▶  DBA02 (主 DB)
```

---

## 前置需求

1. **Node.js** ≥ 18（支援 ESM）
2. **MSSQL Server** 已建好 4 個資料庫（透過 `database/setup.mjs`）
3. **.env** 已填入所有 DB 連線資訊

### .env 需要的變數

```ini
# 每一組都必填（HOST / PORT / DATABASE / USER / PASSWORD）
DB_DBA02_HOST=...
DB_DBA02_PORT=1433
DB_DBA02_DATABASE=FAC_DBA02
DB_DBA02_USER=...
DB_DBA02_PASSWORD=...

DB_RDS02_HOST=...
DB_RDS02_PORT=1433
DB_RDS02_DATABASE=FAC_RDS02_Sim
DB_RDS02_USER=...
DB_RDS02_PASSWORD=...

DB_B1SA01_HOST=...
DB_B1SA01_PORT=1433
DB_B1SA01_DATABASE=FAC_B1SA01_Sim
DB_B1SA01_USER=...
DB_B1SA01_PASSWORD=...

DB_DBA03_HOST=...
DB_DBA03_PORT=1433
DB_DBA03_DATABASE=FAC_DBA03_Sim
DB_DBA03_USER=...
DB_DBA03_PASSWORD=...

# 可選：單次拉取的最大筆數（預設 5000）
SYNC_BATCH_SIZE=5000
```

> 程式**不內嵌任何密碼**。連線資訊完全由環境變數注入。

---

## 使用方式

### 1. 查看所有 job 狀態

```bash
node sync/index.mjs --list
# 或
npm run sync:list
```

輸出範例：
```
Job 名稱                        上次狀態    搬移筆數    上次完成時間          水位 (EventStamp)
------------------------------- ----------- ---------- --------------------- ---------------------
alarm_b1sa01_to_dba03           success            15  2026-04-15 13:53:07   2026-04-15 09:21:00
alarm_dba03_to_dba02            success            15  2026-04-15 13:53:07   2026-04-15 09:21:00
alarm_rds02_to_dba02            success            20  2026-04-15 13:53:06   2026-04-15 08:19:00
```

### 2. 執行單一 job

```bash
node sync/index.mjs --job=alarm_rds02_to_dba02
# 或透過 npm scripts:
npm run sync:a        # A 廠 RDS02 → DBA02
npm run sync:b-stage  # B 廠 B1SA01 → DBA03
npm run sync:b-final  # B 廠 DBA03 → DBA02
```

### 3. 執行全部（依序）

```bash
node sync/index.mjs --all
# 或
npm run sync
```

執行順序：
1. `alarm_rds02_to_dba02`（A 廠）
2. `alarm_b1sa01_to_dba03`（B 廠內網 → 中繼）
3. `alarm_dba03_to_dba02`（B 廠中繼 → 主）

### 4. 查說明

```bash
node sync/index.mjs --help
```

---

## 增量同步機制

每條管線在 `FAC_DBA02.dbo.sync_state` 表中有一筆狀態紀錄：

| 欄位 | 說明 |
|------|------|
| `job_name` | 管線名稱 |
| `last_synced_event_ts` | 上次同步到的最大 `EventStamp`（增量水位） |
| `last_started_at` / `last_finished_at` | 上次執行的開始/結束時間 |
| `last_status` | `success` / `failed` / `running` / `never-run` |
| `last_rows_synced` | 上次搬移筆數 |
| `last_error` | 失敗時的錯誤訊息 |

**增量邏輯：**
```sql
SELECT ... FROM source.Alarm
WHERE @lastTs IS NULL OR EventStamp > @lastTs
ORDER BY EventStamp
```

第一次執行時 `last_synced_event_ts = NULL`，會全量搬移。之後只搬移 EventStamp 大於水位的新資料。

**重置管線水位（重新從頭搬）：**

```sql
-- 在 FAC_DBA02 執行
UPDATE dbo.sync_state SET last_synced_event_ts = NULL WHERE job_name = 'alarm_rds02_to_dba02';

-- 若要連 target 一起清空再從頭搬
TRUNCATE TABLE FAC_DBA02.dbo.Alarm;
```

---

## 排程方式

同步程式本身**不含排程邏輯**，只執行一次就結束。排程由外部系統負責：

### 開發機（Windows）— Task Scheduler

1. 開啟「工作排程器」(taskschd.msc)
2. 建立基本工作 → 名稱：`FAC Sync All`
3. 觸發程序：每 5 分鐘
4. 動作：啟動程式
   - 程式/指令碼：`node`
   - 引數：`D:\micron-FAC-web\demo-version\sync\index.mjs --all`
   - 起始位置：`D:\micron-FAC-web\demo-version`

### 正式 VM — Windows Task Scheduler + PM2

選項 A（推薦，與 Web 後端同一個 PM2 管理）：
在 `ecosystem.config.js` 加一個 cron 型 app：

```js
{
  name: 'facility-sync',
  script: './sync/index.mjs',
  args: '--all',
  cron_restart: '*/5 * * * *',    // 每 5 分鐘
  autorestart: false,             // 只有 cron 會觸發
}
```

選項 B：用 Windows Task Scheduler 叫起 `node sync/index.mjs --all`。

### B 廠內網電腦（執行 `alarm_b1sa01_to_dba03`）

實際部署時，B 廠 `B1SA01 → DBA03` 這條管線要在 **B 廠內網一台特定電腦**上跑（因為只有那台能連到 B1SA01）。
此電腦上：

1. 複製 `sync/` 目錄 + `node_modules/` 過去
2. 建立該電腦專用的 `.env`（只需要 `DB_B1SA01_*` 和 `DB_DBA03_*` 的連線資訊）
3. 用 Windows Task Scheduler 每 N 分鐘執行：
   ```
   node sync/index.mjs --job=alarm_b1sa01_to_dba03
   ```

---

## 錯誤處理

- **單一 job 失敗不會中斷其他 jobs**（`--all` 模式下）
- 失敗會寫入 `sync_state.last_error`，下次執行會覆蓋
- Exit code：全部成功 → 0；任何 job 失敗 → 1（適合配合排程器做告警）

### 檢查失敗原因

```bash
npm run sync:list
```

若某 job 顯示 `failed`，會在最下方列出 `上次錯誤` 訊息。

---

## 架構說明

```
sync/
├── index.mjs                      # CLI 入口，參數解析與流程控制
├── config.mjs                     # 從 .env 讀取連線資訊
├── lib/
│   ├── pools.mjs                  # DB connection pool 管理（lazy init）
│   ├── state.mjs                  # sync_state 讀寫（getState/markRunning/markSuccess/markFailure）
│   ├── log.mjs                    # 格式化 console 輸出
│   └── alarm-schema.mjs           # Alarm bulk-insert Table schema（DBA02 + B 廠共用）
├── jobs/
│   ├── registry.mjs               # 所有 jobs 的註冊表
│   ├── alarm-rds02-to-dba02.mjs   # A 廠管線
│   ├── alarm-b1sa01-to-dba03.mjs  # B 廠 source → 中繼
│   └── alarm-dba03-to-dba02.mjs   # B 廠 中繼 → 主
└── README.md
```

### 新增一條同步管線

1. 在 `jobs/` 下建立新檔，仿照現有 job export `jobName` 與 `run({ lastSyncedEventTs })`
2. 在 `jobs/registry.mjs` 的 `JOBS` 陣列加入新模組
3. 在 `database/setup.mjs` 的 `seedSyncState` 加一筆初始狀態紀錄
4. 執行 `node database/setup.mjs` 寫入新狀態記錄
5. 測試：`node sync/index.mjs --job=<newJobName>`

---

## 已知限制

1. **EventStamp 精度損失**：A 廠 source 為 `datetime2(7)`（100-nanosecond 精度），但 Node.js Date 僅支援毫秒。透過 Node 中轉時精度會降到毫秒級。若同一毫秒內有多筆事件，增量同步不會遺漏（以 `>` 判斷）但可能小機率重複。
2. **第一次同步為全量**：若 source 表有大量歷史資料，首次同步可能耗時較久（數萬筆以上）。
3. **無並行執行保護**：若兩個 instance 同時跑同一 job，會重複搬移。排程間隔需大於單次執行時間。

---

## 疑難排解

| 症狀 | 可能原因 | 解法 |
|------|---------|------|
| `缺少 DB_*_* 環境變數` | `.env` 不完整或路徑錯 | 檢查 `.env` 是否放在專案根目錄 |
| `Login failed for user 'sa'` | 密碼錯 / 帳號被鎖 | 用 SSMS 試連確認 |
| `Cannot connect to localhost:1433` | MSSQL 服務未啟動 | 開「服務」檢查 `SQL Server (MSSQLSERVER)` 是否執行中 |
| `Invalid object name 'dbo.Alarm'` | 資料表未建立 | 先執行 `npm run db:setup` |
| `sync_state 中找不到 job` | 新增 job 後沒 seed | 執行 `node database/setup.mjs` 補 seed |
