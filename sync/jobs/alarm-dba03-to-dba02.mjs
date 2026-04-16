/**
 * Job: B 廠 DBA03 → DBA02
 *
 * 從 B 廠中繼 DBA03 增量搬移到主 DB DBA02
 * 欄位 mapping:
 *   - B 廠 schema (21 欄, UnAckDuration) → DBA02 schema (22 欄, 同時有 AlarmDuration/UnAckDuration)
 *   - 型別升寬: datetime → datetime2(7), smallint → int（JS 層不需額外處理，mssql 自動）
 *   - 新增：source_factory = 'B', synced_at = NOW, AlarmDuration = NULL
 */
import sql from 'mssql';
import { getPool } from '../lib/pools.mjs';
import { log } from '../lib/log.mjs';
import { makeDba02AlarmTable, addDba02AlarmRow } from '../lib/alarm-schema.mjs';

export const jobName = 'alarm_dba03_to_dba02';

export async function run({ lastSyncedEventTs }) {
  const sourcePool = await getPool('dba03');
  const targetPool = await getPool('dba02');

  const req = sourcePool.request();
  req.input('lastTs', sql.DateTime, lastSyncedEventTs);  // DBA03 是 B 廠 schema

  const result = await req.query(`
    SELECT EventStamp, AlarmState, TagName, Description, Area, Type,
           Value, CheckValue, Priority, Category, Provider, Operator,
           DomainName, UserFullName, UnAckDuration,
           User1, User2, User3,
           EventStampUTC, MilliSec, OperatorNode
    FROM dbo.Alarm
    WHERE @lastTs IS NULL OR EventStamp > @lastTs
    ORDER BY EventStamp
  `);

  const rows = result.recordset;
  log.info(`  [${jobName}] 從 DBA03 撈到 ${rows.length} 筆新資料`);

  if (rows.length === 0) {
    return { rowsSynced: 0, maxEventStamp: null };
  }

  const table = makeDba02AlarmTable();
  const syncedAt = new Date();

  for (const row of rows) {
    // row 是 B 廠 source，無 AlarmDuration；有 UnAckDuration
    addDba02AlarmRow(table, row, 'B', syncedAt);
  }

  await targetPool.request().bulk(table);
  log.ok(`  [${jobName}] Bulk inserted ${rows.length} 筆到 DBA02.Alarm`);

  return {
    rowsSynced: rows.length,
    maxEventStamp: rows[rows.length - 1].EventStamp,
  };
}
