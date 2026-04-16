/**
 * Job: B 廠 B1SA01 → DBA03
 *
 * 從 B 廠內網 source (B1SA01) 增量搬移到跨網中繼 DBA03
 * B1SA01 與 DBA03 的 Alarm schema 完全相同（B 廠原 schema）
 *
 * 注意：實際部署時此 job 應在 B 廠內網的一台特定電腦上跑
 *       本機開發環境模擬為 VM 可直連兩端
 */
import sql from 'mssql';
import { getPool } from '../lib/pools.mjs';
import { log } from '../lib/log.mjs';
import { makeBFactoryAlarmTable, addBFactoryAlarmRow } from '../lib/alarm-schema.mjs';

export const jobName = 'alarm_b1sa01_to_dba03';

export async function run({ lastSyncedEventTs }) {
  const sourcePool = await getPool('b1sa01');
  const targetPool = await getPool('dba03');

  const req = sourcePool.request();
  req.input('lastTs', sql.DateTime, lastSyncedEventTs);  // B 廠用 datetime

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
  log.info(`  [${jobName}] 從 B1SA01 撈到 ${rows.length} 筆新資料`);

  if (rows.length === 0) {
    return { rowsSynced: 0, maxEventStamp: null };
  }

  const table = makeBFactoryAlarmTable();
  for (const row of rows) {
    addBFactoryAlarmRow(table, row);
  }

  await targetPool.request().bulk(table);
  log.ok(`  [${jobName}] Bulk inserted ${rows.length} 筆到 DBA03.Alarm`);

  return {
    rowsSynced: rows.length,
    maxEventStamp: rows[rows.length - 1].EventStamp,
  };
}
