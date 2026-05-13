# 員工出勤與運轉交接系統 - 測試資料庫現況描述 (2026-05-11)

這份文件旨在提供 AI 或開發人員了解目前測試資料庫的數據結構、關聯性及具體內容樣貌。

---

## 1. 既有資料模組 (沿用 2026-05-06)
以下資料模組延續既有規格與測試資料邏輯：
- AttendanceType
- EmployeeSection
- Employee
- EmployeePermission
- AttendanceRecord

---

## 2. 廠區資料 (Site)
定義運轉交接功能使用的廠區主檔。

| SiteName |
| :--- |
| MTB |
| TCP |
| AATT |
| AATT 2 |

---

## 3. PassdownSection 轉換規則與結果
整理運轉交接三連動下拉資料來源與展開規則。

### 3.1 來源規則 A: Section -> System

| Section | System |
| :--- | :--- |
| Building | CR, EXH, HVAC, Mech., Elec., I&C, LSS, N/A |
| WTS | WWT, UPW, SDW, N/A |
| GC | GAS, Chemical, N/A |
| Project | Project, Hook up, Site serve, N/A |
| 外部影響 | 地震, 壓降, 火災, 異味, N/A |
| N/A | N/A |

### 3.2 來源規則 B: System -> SubSystem

| System | SubSystem |
| :--- | :--- |
| CR | CR, MAU, Air shower, DCC, RCU, N/A |
| EXH | GEX, AEX, AMX, SOX, EF, NG, N/A |
| HVAC | CT, Chiller, Glycol, Boiler, CDA, N/A |
| Mech. | PCW, PV, FCU, AHU, FRZ, BA, MAU, N/A |
| Elec. | UPS, 生產盤, 高/中/低壓盤, 發電機, 照明, N/A |
| I&C | I&C, LDS, N/A |
| LSS | 火警系統, VESDA, N/A |
| WWT | WWR, BGW, OXIDE, SAW, RCW, OAC, MMW, FWH, AWH, OWWT, EMG, 加藥系統, Sludge, LSR, Blower, 放流, N/A |
| UPW | MMF, ACF, 2B3T, RO, MB, MD, CP, UF, N/A |
| SDW | 工業水箱, 消防水箱, 民生用水, 化糞池, 沖身洗眼器, PIT, 回收用水, N/A |
| GAS | GD, LDS, CQC, Purifier, SG, BG |
| Chemical | CCB, CCBTU, CDU, CMDU, SLR, W-Glue, VMB, N/A |
| Project | Project, N/A |
| Hook up | Hook up, N/A |
| Site serve | Site serve, N/A |
| 地震 | 地震, N/A |
| 壓降 | 壓降, N/A |
| 火災 | 火災, N/A |
| 異味 | 異味, N/A |

### 3.3 轉換邏輯
1. PassdownSection 採三欄展開：PassdownSectionName / PassdownSystemName / PassdownSubSystemName。
2. 先依 Section -> System 做第一層展開，再依 System -> SubSystem 做第二層展開。
3. 若 System 為 N/A，SubSystem 固定為 N/A。
4. Section = N/A 僅產生一筆：N/A / N/A / N/A。

### 3.4 轉換結果摘要
- Section-System 組合數: 25
- PassdownSection 三欄展開總筆數: 107

### 3.5 展開範例 (節錄)

| PassdownSectionName | PassdownSystemName | PassdownSubSystemName |
| :--- | :--- | :--- |
| Building | CR | CR |
| Building | CR | MAU |
| Building | EXH | GEX |
| Building | Mech. | FCU |
| Building | N/A | N/A |
| WTS | WWT | OXIDE |
| WTS | SDW | 工業水箱 |
| GC | GAS | Purifier |
| Project | Hook up | Hook up |
| 外部影響 | 火災 | 火災 |
| 外部影響 | N/A | N/A |
| N/A | N/A | N/A |

---

## 4. Passdown 與 AbnormalLogs 規則說明
定義運轉交接主檔與異常回覆檔的列舉值、狀態流轉與關聯規則。

### 4.1 PassdownType
- 異常(重大)
- 異常(一般)
- 值班交接
- 主辦交接

### 4.2 PassdownStatus
- 重大異常
- 一般異常
- 正常
- 處理中
- 已結案

### 4.3 狀態流轉摘要
- 值班交接/主辦交接 -> 正常
- 異常(重大) -> 重大異常
- 異常(一般) -> 一般異常
- 異常第一筆回覆且未結案 -> 處理中
- 任一回覆勾選結案 -> 已結案

### 4.4 AbnormalLogs 資料定位
- 主鍵: AbnormalLogsId
- 關聯鍵: PassdownId -> Passdown.PassdownId
- 回覆人員: ResponseEmployeeId -> Employee.EmployeeId

### 4.5 AbnormalLogs 欄位角色
- RC_Content: Root Cause，異常根因說明。
- CA_Content: Corrective Action，矯正措施。
- PA_Content: Preventive Action，預防措施。
- PlanDate: 預計完成日，可為 NULL。
- DueDate: 實際完成日，可為 NULL。
- IsClosed: 是否結案（0 = 未結案，1 = 已結案）。
- ResponseTime: 回覆時間（每筆回覆時間戳）。

---

## 5. 權限設定 (EmployeePermission)
定義員工角色與 Permission(json) 欄位的功能權限鍵值。

### 5.1 欄位更新目標
- 資料表: EmployeePermission
- 欄位: Permission (json)
- 新增鍵值: Passdown

### 5.2 建議初始化規則
- Role = Administrator -> Passdown = true
- Role = General User -> Passdown = true

### 5.3 JSON 範例
更新前:
{"Attendance Record": true, "Abnormal Review": false, "Alarm": false}

更新後 (General User):
{"Attendance Record": true, "Abnormal Review": false, "Alarm": false, "Passdown": true}

更新後 (Administrator):
{"Attendance Record": true, "Abnormal Review": true, "Alarm": true, "Passdown": true}

---

## 6. 軟刪除設計 (Soft Delete)
自 2026-05-12 起，Passdown 與 AbnormalLogs 兩個資料表均新增 IsAlive (bit, NOT NULL) 欄位。

- IsAlive = 1：資料有效
- IsAlive = 0：資料已刪除（前端/報表預設不顯示）
- 測試資料預設值：IsAlive = 1

---

## 7. 本次更新摘要 (2026-05-11 / 2026-05-12)
- 新增 Site 測試資料：MTB、TCP、AATT、AATT 2。
- 新增 PassdownSection 來源對照與三欄展開規則，統計 107 筆展開資料。
- 確認 PassdownType / PassdownStatus 與運轉交接 dev spec 一致。
- 完成 EmployeePermission 新增 Passdown 權限鍵值定義。
- 補充 AbnormalLogs 資料定位與欄位角色說明。
- 補充 Passdown、AbnormalLogs 軟刪除規則（IsAlive）。

---

## 8. 開發測試重點
- 權限攔截：驗證 General User / Administrator 皆可進入 Passdown 頁面，並由功能內操作規則限制編輯與刪除。
- 異常流程：驗證 AbnormalLogs 回覆新增後，PassdownStatus 轉為處理中。
- 結案流程：驗證任一有效回覆 IsClosed = 1 時，PassdownStatus 轉為已結案。
- 軟刪除過濾：列表與報表查詢需預設過濾 IsAlive = 1。
- 關聯完整性：驗證 PassdownId、ResponseEmployeeId 外鍵對應正確。
