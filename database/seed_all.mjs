/**
 * 綜合測試資料塞入腳本
 *
 * 塞入：
 *   1. FAC_RDS02_Sim.Alarm   : 20 筆 A 廠模擬 Alarm
 *   2. FAC_B1SA01_Sim.Alarm  : 15 筆 B 廠模擬 Alarm
 *   3. FAC_DBA02.employees   : 2 個測試帳號（1 admin + 1 user）
 *   4. FAC_DBA02.DisableList : 3 筆測試 disable 紀錄（A only / B only / ALL）
 *
 * 使用方式: node database/seed_all.mjs
 */
import sql from 'mssql';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '..', '.env') });

const baseConfig = (db) => ({
  server: process.env.DB_DBA02_HOST,
  port: parseInt(process.env.DB_DBA02_PORT || '1433'),
  user: process.env.DB_DBA02_USER,
  password: process.env.DB_DBA02_PASSWORD,
  database: db,
  options: { encrypt: false, trustServerCertificate: true },
});

// ---------------- Alarm seed helpers ----------------
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

async function seedAlarmsA() {
  const pool = await sql.connect(baseConfig('FAC_RDS02_Sim'));
  await pool.request().query('TRUNCATE TABLE dbo.Alarm');

  const base = new Date('2026-04-15T08:00:00Z');
  const rows = Array.from({ length: 20 }, (_, i) => genRdsRow(i, base));

  const t = new sql.Table('dbo.Alarm');
  t.create = false;
  t.columns.add('EventStamp',    sql.DateTime2(7), { nullable: true });
  t.columns.add('AlarmState',    sql.NVarChar(9),  { nullable: true });
  t.columns.add('TagName',       sql.NVarChar(132),{ nullable: true });
  t.columns.add('Description',   sql.NVarChar(255),{ nullable: true });
  t.columns.add('Area',          sql.NVarChar(32), { nullable: true });
  t.columns.add('Type',          sql.NVarChar(6),  { nullable: true });
  t.columns.add('Value',         sql.NVarChar(131),{ nullable: true });
  t.columns.add('CheckValue',    sql.NVarChar(131),{ nullable: true });
  t.columns.add('Priority',      sql.Int,          { nullable: true });
  t.columns.add('Category',      sql.NVarChar(8),  { nullable: true });
  t.columns.add('Provider',      sql.NVarChar(65), { nullable: true });
  t.columns.add('Operator',      sql.NVarChar(131),{ nullable: true });
  t.columns.add('DomainName',    sql.NVarChar(155),{ nullable: true });
  t.columns.add('UserFullName',  sql.NVarChar(255),{ nullable: true });
  t.columns.add('AlarmDuration', sql.NVarChar(4000),{ nullable: true });
  t.columns.add('User1',         sql.Float,        { nullable: true });
  t.columns.add('User2',         sql.Float,        { nullable: true });
  t.columns.add('User3',         sql.NVarChar(131),{ nullable: true });
  t.columns.add('EventStampUTC', sql.DateTime2(7), { nullable: true });
  t.columns.add('MilliSec',      sql.Int,          { nullable: true });
  t.columns.add('OperatorNode',  sql.NVarChar(131),{ nullable: true });

  for (const r of rows) {
    t.rows.add(
      r.EventStamp, r.AlarmState, r.TagName, r.Description, r.Area, r.Type,
      r.Value, r.CheckValue, r.Priority, r.Category, r.Provider, r.Operator,
      r.DomainName, r.UserFullName, r.AlarmDuration,
      r.User1, r.User2, r.User3, r.EventStampUTC, r.MilliSec, r.OperatorNode
    );
  }

  await pool.request().bulk(t);
  console.log(`✅ FAC_RDS02_Sim.Alarm: ${rows.length} rows`);
  await pool.close();
}

async function seedAlarmsB() {
  const pool = await sql.connect(baseConfig('FAC_B1SA01_Sim'));
  await pool.request().query('TRUNCATE TABLE dbo.Alarm');

  const base = new Date('2026-04-15T09:00:00Z');
  const rows = Array.from({ length: 15 }, (_, i) => genB1sa01Row(i, base));

  const t = new sql.Table('dbo.Alarm');
  t.create = false;
  t.columns.add('EventStamp',    sql.DateTime,     { nullable: true });
  t.columns.add('AlarmState',    sql.NVarChar(9),  { nullable: true });
  t.columns.add('TagName',       sql.NVarChar(132),{ nullable: true });
  t.columns.add('Description',   sql.NVarChar(255),{ nullable: true });
  t.columns.add('Area',          sql.NVarChar(32), { nullable: true });
  t.columns.add('Type',          sql.NVarChar(6),  { nullable: true });
  t.columns.add('Value',         sql.NVarChar(131),{ nullable: true });
  t.columns.add('CheckValue',    sql.NVarChar(131),{ nullable: true });
  t.columns.add('Priority',      sql.SmallInt,     { nullable: true });
  t.columns.add('Category',      sql.NVarChar(8),  { nullable: true });
  t.columns.add('Provider',      sql.NVarChar(65), { nullable: true });
  t.columns.add('Operator',      sql.NVarChar(131),{ nullable: true });
  t.columns.add('DomainName',    sql.NVarChar(155),{ nullable: true });
  t.columns.add('UserFullName',  sql.NVarChar(255),{ nullable: true });
  t.columns.add('UnAckDuration', sql.NVarChar(17), { nullable: true });
  t.columns.add('User1',         sql.Float,        { nullable: true });
  t.columns.add('User2',         sql.Float,        { nullable: true });
  t.columns.add('User3',         sql.NVarChar(131),{ nullable: true });
  t.columns.add('EventStampUTC', sql.DateTime,     { nullable: true });
  t.columns.add('MilliSec',      sql.SmallInt,     { nullable: true });
  t.columns.add('OperatorNode',  sql.NVarChar(131),{ nullable: true });

  for (const r of rows) {
    t.rows.add(
      r.EventStamp, r.AlarmState, r.TagName, r.Description, r.Area, r.Type,
      r.Value, r.CheckValue, r.Priority, r.Category, r.Provider, r.Operator,
      r.DomainName, r.UserFullName, r.UnAckDuration,
      r.User1, r.User2, r.User3, r.EventStampUTC, r.MilliSec, r.OperatorNode
    );
  }

  await pool.request().bulk(t);
  console.log(`✅ FAC_B1SA01_Sim.Alarm: ${rows.length} rows`);
  await pool.close();
}

// ---------------- Employees seed ----------------
async function seedEmployees() {
  const pool = await sql.connect(baseConfig('FAC_DBA02'));
  await pool.request().query('DELETE FROM dbo.employees');

  // 用 bcryptjs 產生密碼 hash（password = "admin123" / "user123"）
  const adminHash = bcrypt.hashSync('admin123', 10);
  const userHash  = bcrypt.hashSync('user123',  10);

  const users = [
    {
      employee_no: 'E0001',
      name: '系統管理員',
      email: 'admin@fac.local',
      username: 'admin',
      password_hash: adminHash,
      role: 'admin',
      system_code: 'MECH',
      sub_system_code: 'HVAC',
    },
    {
      employee_no: 'E0002',
      name: '測試使用者',
      email: 'user@fac.local',
      username: 'user',
      password_hash: userHash,
      role: 'user',
      system_code: 'WTS',
      sub_system_code: null,
    },
  ];

  for (const u of users) {
    const r = pool.request();
    r.input('employee_no',    sql.NVarChar(20),   u.employee_no);
    r.input('name',           sql.NVarChar(50),   u.name);
    r.input('email',          sql.NVarChar(100),  u.email);
    r.input('username',       sql.NVarChar(50),   u.username);
    r.input('password_hash',  sql.NVarChar(255),  u.password_hash);
    r.input('role',           sql.NVarChar(20),   u.role);
    r.input('system_code',    sql.VarChar(20),    u.system_code);
    r.input('sub_system_code',sql.VarChar(20),    u.sub_system_code);
    await r.query(`
      INSERT INTO dbo.employees
        (employee_no, name, email, username, password_hash, role, system_code, sub_system_code)
      VALUES
        (@employee_no, @name, @email, @username, @password_hash, @role, @system_code, @sub_system_code)
    `);
  }
  console.log(`✅ FAC_DBA02.employees: ${users.length} rows (admin/admin123, user/user123)`);
  await pool.close();
}

// ---------------- DisableList seed ----------------
async function seedDisableList() {
  const pool = await sql.connect(baseConfig('FAC_DBA02'));
  await pool.request().query('DELETE FROM dbo.DisableList');

  const rows = [
    {
      Tag_Name: 'A.TAG.0005',
      Tag_Desc: '故障中的壓力計',
      factory: 'A',
      Operate_User: 'admin',
      Disable_Reason: '持續誤報，待維修',
      Tag_PIC: '系統管理員',
    },
    {
      Tag_Name: 'B.TAG.0003',
      Tag_Desc: 'B 廠異常溫度計',
      factory: 'B',
      Operate_User: 'admin',
      Disable_Reason: '校正中',
      Tag_PIC: '系統管理員',
    },
    {
      Tag_Name: 'A.TAG.0010',
      Tag_Desc: '兩廠都要停用的測試 tag',
      factory: 'ALL',
      Operate_User: 'admin',
      Disable_Reason: '軟體升級影響兩廠',
      Tag_PIC: '系統管理員',
    },
  ];

  for (const d of rows) {
    const r = pool.request();
    r.input('Tag_Name',       sql.NVarChar(30),  d.Tag_Name);
    r.input('Tag_Desc',       sql.NVarChar(100), d.Tag_Desc);
    r.input('factory',        sql.VarChar(10),   d.factory);
    r.input('Operate_User',   sql.NVarChar(20),  d.Operate_User);
    r.input('Disable_Reason', sql.NVarChar(100), d.Disable_Reason);
    r.input('Tag_PIC',        sql.NVarChar(100), d.Tag_PIC);
    await r.query(`
      INSERT INTO dbo.DisableList
        (Tag_Name, Tag_Desc, factory, Operate_User, Disable_Reason, Tag_PIC)
      VALUES
        (@Tag_Name, @Tag_Desc, @factory, @Operate_User, @Disable_Reason, @Tag_PIC)
    `);
  }
  console.log(`✅ FAC_DBA02.DisableList: ${rows.length} rows`);
  await pool.close();
}

// ---------------- Main ----------------
async function main() {
  console.log('▶ 開始塞入測試資料...\n');
  await seedAlarmsA();
  await seedAlarmsB();
  await seedEmployees();
  await seedDisableList();
  console.log('\n🎉 全部完成！');
  console.log('\n預設帳號密碼:');
  console.log('  admin / admin123  (管理者)');
  console.log('  user  / user123   (一般使用者)');
}

main().catch(err => {
  console.error('❌', err);
  process.exit(1);
});
