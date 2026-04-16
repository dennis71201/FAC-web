/**
 * 所有同步 jobs 的註冊表
 * 統一管理 job 名稱、模組、順序
 *
 * 若要新增 job：
 *   1. 在 jobs/ 下建立 .mjs，export `jobName` 與 `run({ lastSyncedEventTs })`
 *   2. import 並加進下方 JOBS 陣列
 *   3. 在 sync_state 表 seed 對應紀錄（database/setup.mjs 的 seedSyncState）
 */
import * as rds02ToDba02   from './alarm-rds02-to-dba02.mjs';
import * as b1sa01ToDba03  from './alarm-b1sa01-to-dba03.mjs';
import * as dba03ToDba02   from './alarm-dba03-to-dba02.mjs';

export const JOBS = [
  rds02ToDba02,
  b1sa01ToDba03,
  dba03ToDba02,
];

/** 依 jobName 找 job 模組 */
export function findJob(name) {
  return JOBS.find(j => j.jobName === name);
}

/** 所有 job 名稱 */
export function jobNames() {
  return JOBS.map(j => j.jobName);
}
