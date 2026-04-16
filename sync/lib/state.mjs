/**
 * sync_state 資料表讀寫
 * 追蹤每條同步管線的狀態與增量同步水位
 */
import sql from 'mssql';
import { getPool } from './pools.mjs';

/**
 * 讀取指定 job 的狀態
 * @param {string} jobName
 * @returns {Promise<object|null>}
 */
export async function getState(jobName) {
  const pool = await getPool('dba02');
  const req = pool.request();
  req.input('name', sql.NVarChar(100), jobName);
  const r = await req.query(`
    SELECT job_name, source_description,
           last_synced_event_ts,
           last_started_at, last_finished_at,
           last_status, last_rows_synced, last_error
    FROM dbo.sync_state
    WHERE job_name = @name
  `);
  return r.recordset[0] || null;
}

/** 列出所有 job 狀態 */
export async function listStates() {
  const pool = await getPool('dba02');
  const r = await pool.request().query(`
    SELECT job_name, source_description,
           last_synced_event_ts,
           last_started_at, last_finished_at,
           last_status, last_rows_synced, last_error
    FROM dbo.sync_state
    ORDER BY job_name
  `);
  return r.recordset;
}

/** 標記 job 開始執行 */
export async function markRunning(jobName) {
  const pool = await getPool('dba02');
  const req = pool.request();
  req.input('name', sql.NVarChar(100), jobName);
  await req.query(`
    UPDATE dbo.sync_state
    SET last_status = 'running',
        last_started_at = GETDATE(),
        last_error = NULL,
        updated_at = GETDATE()
    WHERE job_name = @name
  `);
}

/** 標記 job 成功完成 */
export async function markSuccess(jobName, { rowsSynced, maxEventStamp }) {
  const pool = await getPool('dba02');
  const req = pool.request();
  req.input('name',      sql.NVarChar(100), jobName);
  req.input('rows',      sql.Int,           rowsSynced);
  req.input('maxTs',     sql.DateTime2(7),  maxEventStamp || null);

  // maxEventStamp 為 null 時（無新資料）保留原本的 last_synced_event_ts
  await req.query(`
    UPDATE dbo.sync_state
    SET last_status = 'success',
        last_finished_at = GETDATE(),
        last_rows_synced = @rows,
        last_synced_event_ts =
            CASE WHEN @maxTs IS NULL THEN last_synced_event_ts ELSE @maxTs END,
        last_error = NULL,
        updated_at = GETDATE()
    WHERE job_name = @name
  `);
}

/** 標記 job 失敗 */
export async function markFailure(jobName, errorMessage) {
  const pool = await getPool('dba02');
  const req = pool.request();
  req.input('name',  sql.NVarChar(100),      jobName);
  req.input('error', sql.NVarChar(sql.MAX),  errorMessage);
  await req.query(`
    UPDATE dbo.sync_state
    SET last_status = 'failed',
        last_finished_at = GETDATE(),
        last_error = @error,
        updated_at = GETDATE()
    WHERE job_name = @name
  `);
}
