/**
 * 塞模擬 Alarm 測試資料到 source DBs
 *   - FAC_RDS02_Sim  (A 廠 source) : 20 筆
 *   - FAC_B1SA01_Sim (B 廠 source) : 15 筆
 *
 * 使用方式：node database/seed_test_alarms.mjs
 */
import sql from 'mssql';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '..', '.env') });

const baseConfig = (dbName) => ({
  server: process.env.DB_DBA02_HOST,
  port: parseInt(process.env.DB_DBA02_PORT || '1433'),
  user: process.env.DB_DBA02_USER,
  password: process.env.DB_DBA02_PASSWORD,
  database: dbName,
  options: { encrypt: false, trustServerCertificate: true },
});

// ----- 測試資料產生器 -----
const areas = ['CR1', 'CR2', 'UPW', 'CDA', 'HVAC-A1'];
const categories = ['WTS', 'EI', 'GC', 'HVAC'];
const states = ['RtnUnAck', 'UnAckAlm', 'AckedAlm'];

function genRdsRow(i, baseTime) {
  const t = new Date(baseTime.getTime() + i * 60000);
  return {
    EventStamp: t,
    AlarmState: states[i % states.length],
    TagName: `A.TAG.${String(i + 1).padStart(4, '0')}`,
    Description: `A 廠測試 Alarm #${i + 1}`,
    Area: areas[i % areas.length],
    Type: 'Alarm',
    Value: String(i * 1.5),
    CheckValue: String(i),
    Priority: (i % 4) + 1,
    Category: categories[i % categories.length],
    Provider: 'AVEVA',
    Operator: 'system',
    DomainName: 'FAC-A',
    UserFullName: 'A 廠操作員',
    AlarmDuration: `${i}m`,
    User1: i * 0.5,
    User2: i * 2.5,
    User3: 'N/A',
    EventStampUTC: t,
    MilliSec: (i * 37) % 1000,
    OperatorNode: `A-NODE-${i % 3}`,
  };
}

function genB1sa01Row(i, baseTime) {
  const t = new Date(baseTime.getTime() + i * 90000);
  return {
    EventStamp: t,
    AlarmState: states[i % states.length],
    TagName: `B.TAG.${String(i + 1).padStart(4, '0')}`,
    Description: `B 廠測試 Alarm #${i + 1}`,
    Area: areas[i % areas.length],
    Type: 'Alarm',
    Value: String(i * 2.3),
    CheckValue: String(i),
    Priority: (i % 4) + 1,
    Category: categories[i % categories.length],
    Provider: 'AVEVA',
    Operator: 'system',
    DomainName: 'FAC-B',
    UserFullName: 'B 廠操作員',
    UnAckDuration: `${String(i).padStart(2, '0')}:${String((i * 3) % 60).padStart(2, '0')}:00`,
    User1: i * 0.7,
    User2: i * 3.1,
    User3: 'N/A',
    EventStampUTC: t,
    MilliSec: (i * 53) % 1000,
    OperatorNode: `B-NODE-${i % 2}`,
  };
}

async function seedRds02() {
  const pool = await sql.connect(baseConfig('FAC_RDS02_Sim'));
  await pool.request().query('TRUNCATE TABLE dbo.Alarm');

  const base = new Date('2026-04-15T08:00:00Z');
  const rows = Array.from({ length: 20 }, (_, i) => genRdsRow(i, base));

  const table = new sql.Table('dbo.Alarm');
  table.create = false;
  table.columns.add('EventStamp',    sql.DateTime2(7), { nullable: true });
  table.columns.add('AlarmState',    sql.NVarChar(9),  { nullable: true });
  table.columns.add('TagName',       sql.NVarChar(132),{ nullable: true });
  table.columns.add('Description',   sql.NVarChar(255),{ nullable: true });
  table.columns.add('Area',          sql.NVarChar(32), { nullable: true });
  table.columns.add('Type',          sql.NVarChar(6),  { nullable: true });
  table.columns.add('Value',         sql.NVarChar(131),{ nullable: true });
  table.columns.add('CheckValue',    sql.NVarChar(131),{ nullable: true });
  table.columns.add('Priority',      sql.Int,          { nullable: true });
  table.columns.add('Category',      sql.NVarChar(8),  { nullable: true });
  table.columns.add('Provider',      sql.NVarChar(65), { nullable: true });
  table.columns.add('Operator',      sql.NVarChar(131),{ nullable: true });
  table.columns.add('DomainName',    sql.NVarChar(155),{ nullable: true });
  table.columns.add('UserFullName',  sql.NVarChar(255),{ nullable: true });
  table.columns.add('AlarmDuration', sql.NVarChar(4000),{ nullable: true });
  table.columns.add('User1',         sql.Float,        { nullable: true });
  table.columns.add('User2',         sql.Float,        { nullable: true });
  table.columns.add('User3',         sql.NVarChar(131),{ nullable: true });
  table.columns.add('EventStampUTC', sql.DateTime2(7), { nullable: true });
  table.columns.add('MilliSec',      sql.Int,          { nullable: true });
  table.columns.add('OperatorNode',  sql.NVarChar(131),{ nullable: true });

  for (const r of rows) {
    table.rows.add(
      r.EventStamp, r.AlarmState, r.TagName, r.Description, r.Area, r.Type,
      r.Value, r.CheckValue, r.Priority, r.Category, r.Provider, r.Operator,
      r.DomainName, r.UserFullName, r.AlarmDuration,
      r.User1, r.User2, r.User3,
      r.EventStampUTC, r.MilliSec, r.OperatorNode,
    );
  }

  await pool.request().bulk(table);
  console.log(`[FAC_RDS02_Sim] inserted ${rows.length} rows`);
  await pool.close();
}

async function seedB1sa01() {
  const pool = await sql.connect(baseConfig('FAC_B1SA01_Sim'));
  await pool.request().query('TRUNCATE TABLE dbo.Alarm');

  const base = new Date('2026-04-15T09:00:00Z');
  const rows = Array.from({ length: 15 }, (_, i) => genB1sa01Row(i, base));

  const table = new sql.Table('dbo.Alarm');
  table.create = false;
  table.columns.add('EventStamp',    sql.DateTime,     { nullable: true });
  table.columns.add('AlarmState',    sql.NVarChar(9),  { nullable: true });
  table.columns.add('TagName',       sql.NVarChar(132),{ nullable: true });
  table.columns.add('Description',   sql.NVarChar(255),{ nullable: true });
  table.columns.add('Area',          sql.NVarChar(32), { nullable: true });
  table.columns.add('Type',          sql.NVarChar(6),  { nullable: true });
  table.columns.add('Value',         sql.NVarChar(131),{ nullable: true });
  table.columns.add('CheckValue',    sql.NVarChar(131),{ nullable: true });
  table.columns.add('Priority',      sql.SmallInt,     { nullable: true });
  table.columns.add('Category',      sql.NVarChar(8),  { nullable: true });
  table.columns.add('Provider',      sql.NVarChar(65), { nullable: true });
  table.columns.add('Operator',      sql.NVarChar(131),{ nullable: true });
  table.columns.add('DomainName',    sql.NVarChar(155),{ nullable: true });
  table.columns.add('UserFullName',  sql.NVarChar(255),{ nullable: true });
  table.columns.add('UnAckDuration', sql.NVarChar(17), { nullable: true });
  table.columns.add('User1',         sql.Float,        { nullable: true });
  table.columns.add('User2',         sql.Float,        { nullable: true });
  table.columns.add('User3',         sql.NVarChar(131),{ nullable: true });
  table.columns.add('EventStampUTC', sql.DateTime,     { nullable: true });
  table.columns.add('MilliSec',      sql.SmallInt,     { nullable: true });
  table.columns.add('OperatorNode',  sql.NVarChar(131),{ nullable: true });

  for (const r of rows) {
    table.rows.add(
      r.EventStamp, r.AlarmState, r.TagName, r.Description, r.Area, r.Type,
      r.Value, r.CheckValue, r.Priority, r.Category, r.Provider, r.Operator,
      r.DomainName, r.UserFullName, r.UnAckDuration,
      r.User1, r.User2, r.User3,
      r.EventStampUTC, r.MilliSec, r.OperatorNode,
    );
  }

  await pool.request().bulk(table);
  console.log(`[FAC_B1SA01_Sim] inserted ${rows.length} rows`);
  await pool.close();
}

async function main() {
  await seedRds02();
  await seedB1sa01();
  console.log('\n✅ 測試資料塞入完成');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
