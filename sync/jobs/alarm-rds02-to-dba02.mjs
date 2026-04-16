/**
 * Job: A 廠 RDS02 → DBA02
 *
 * 從 A 廠 source DB (RDS02) 的 Alarm 表，增量搬移到 DBA02.Alarm
 * 以 EventStamp 作為增量基準
 *
 * DBA02 多出的欄位：
 *   - source_factory = 'A'
 *   - synced_at      = 同步時間
 *   - UnAckDuration  = NULL（A 廠無此欄位）
 */
import sql from 'mssql';
import { getPool } from '../lib/pools.mjs';
import { log } from '../lib/log.mjs';
import { makeDba02AlarmTable, addDba02AlarmRow } from '../lib/alarm-schema.mjs';

export const jobName = 'alarm_rds02_to_dba02';

/**
 * @param {object} params
 * @param {Date|null} params.lastSyncedEventTs  sync_state 中的水位
 * @returns {Promise<{rowsSynced: number, maxEventStamp: Date|null}>}
 */
export async function run({ lastSyncedEventTs }) {
  const sourcePool = await getPool('rds02');
  const targetPool = await getPool('dba02');

  // ----- 1. 從 source 撈增量資料 -----
  const req = sourcePool.request();
  req.input('lastTs', sql.DateTime2(7), lastSyncedEventTs);

  const result = await req.query(`
    SELECT EventStamp, AlarmState, TagName, Description, Area, Type,
           Value, CheckValue, Priority, Category, Provider, Operator,
           DomainName, UserFullName, AlarmDuration,
           User1, User2, User3,
           EventStampUTC, MilliSec, OperatorNode
    FROM dbo.Alarm
    WHERE @lastTs IS NULL OR EventStamp > @lastTs
    ORDER BY EventStamp
  `);

  const rows = result.recordset;
  log.info(`  [${jobName}] 從 RDS02 撈到 ${rows.length} 筆新資料`);

  if (rows.length === 0) {
    return { rowsSynced: 0, maxEventStamp: null };
  }

  // ----- 2. 構造 bulk insert table -----
  const table = makeDba02AlarmTable();
  const syncedAt = new Date();

  for (const row of rows) {
    addDba02AlarmRow(table, row, 'A', syncedAt);
  }

  // ----- 3. Bulk insert 到 DBA02.Alarm -----
  await targetPool.request().bulk(table);
  log.ok(`  [${jobName}] Bulk inserted ${rows.length} 筆到 DBA02.Alarm`);

  // ----- 4. 回傳最大 EventStamp 作為新水位 -----
  const maxEventStamp = rows[rows.length - 1].EventStamp;

  return {
    rowsSynced: rows.length,
    maxEventStamp,
  };
}
