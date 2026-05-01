# 後端自動化測試

使用 vitest + supertest，連接真實 SQL Server 資料庫進行整合測試。

## 前置需求

1. SQL Server 已啟動且 `MTB_FAC_OPS_WEB` 含初始測試資料（FAC-001 ~ FAC-014、AttendanceType 5 種、DepartmentAndSection 9 種）
2. `.env` 設定完成（與 `npm run dev` 共用）
3. `npm install` 已執行（會裝 vitest、supertest）

## 執行

```powershell
cd server
npm test          # 跑一次
npm run test:watch  # watch 模式
```

## 測試涵蓋

| 檔案 | 測試對象 |
|------|---------|
| `health.test.js` | `/api/health`、`/health/live`、`/health/ready` |
| `departmentsSections.test.js` | `/api/departments-sections` |
| `auth.test.js` | `/api/auth/identify`、`/api/auth/register` |
| `employees.test.js` | `/api/employees` |
| `attendance.test.js` | `/api/attendance/types`、`/records` 全 CRUD（含權限矩陣、跨日、軟刪除） |

## 測試資料策略

- 不修改現有 seed 資料（FAC-001 ~ FAC-014 的人員與 ID 1~30 的 AttendanceRecord）
- 測試新增的紀錄統一以 `Note LIKE '__VITEST__%'` 標記
- 測試新增的員工統一以 `EmployeeNumber LIKE 'VITEST-%'` 標記
- `globalSetup.js` + `afterAll` 會清掉這些測試標記資料

> 因此測試**不會污染**正式或開發資料；可在開發 DB 上安心執行。

## 設定特性

- `fileParallelism: false` + `singleFork: true`：所有測試檔在同一個 Node 進程內依序執行，避免共用 DB 時的並發衝突
- `testTimeout: 20000`：DB 操作預留充足時間
- token 在同進程內以 Map 快取，避免重複呼叫 `/api/auth/identify` 觸發 rate limit

## 常見問題

**Q: 跑完發現多筆 `__VITEST__` 紀錄沒清掉？**
A: 是 `afterAll` 沒跑到（測試中途崩掉）。手動清：
```sql
DELETE FROM AttendanceRecord WHERE Note LIKE '__VITEST__%';
DELETE ep FROM EmployeePermission ep
  INNER JOIN Employee e ON ep.EmployeeId = e.EmployeeId
  WHERE e.EmployeeNumber LIKE 'VITEST-%';
DELETE FROM Employee WHERE EmployeeNumber LIKE 'VITEST-%';
```

**Q: rate limit 429 錯誤？**
A: 全域 100/15min、identify 端點 20/15min。連跑兩次測試（短時間內）可能觸發，等 15 分鐘或重啟 server。
