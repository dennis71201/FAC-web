/**
 * 資料庫初始化腳本
 * 用 node-mssql 連線到本機 MSSQL，依序執行 SQL 檔案建立資料庫與資料表
 *
 * 使用方式: node database/setup.mjs
 * 需要先設定 .env 中的 DB_MAIN_* 連線資訊
 */

import sql from 'mssql';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '..', '.env') });

const DBA02_DB_NAME = process.env.DB_DBA02_DATABASE || 'FAC_DBA02';

// 用 DBA02 的連線資訊（master DB 權限，建庫時走 sa）
const baseConfig = {
  server: process.env.DB_DBA02_HOST || 'localhost',
  port: parseInt(process.env.DB_DBA02_PORT || '1433'),
  user: process.env.DB_DBA02_USER || 'sa',
  password: process.env.DB_DBA02_PASSWORD,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

async function runSqlFile(pool, filePath) {
  const fullPath = resolve(__dirname, filePath);
  const content = readFileSync(fullPath, 'utf-8');

  // 將 SQL 中寫死的 FAC_DBA02 替換為實際資料庫名稱
  const resolved = content.replace(/FAC_DBA02/g, DBA02_DB_NAME);

  // 以 GO 分割批次（MSSQL 的 GO 不是 SQL 語法，而是批次分隔符）
  const batches = resolved
    .split(/^\s*GO\s*$/im)
    .map(b => b.trim())
    .filter(b => b.length > 0);

  for (const batch of batches) {
    try {
      await pool.request().query(batch);
    } catch (err) {
      console.error(`  ❌ Error in batch:\n${batch.substring(0, 100)}...`);
      console.error(`  ${err.message}`);
      throw err;
    }
  }
}

async function main() {
  if (!baseConfig.password) {
    console.error('請先在 .env 中設定 DB_DBA02_PASSWORD');
    process.exit(1);
  }

  const shouldReset = process.argv.includes('--reset');
  const vmMode = process.argv.includes('--vm');

  console.log(`連線至 ${baseConfig.server}:${baseConfig.port} ...`);
  console.log(`目標資料庫: ${DBA02_DB_NAME}`);
  if (vmMode) console.log('🔧 VM 模式：跳過建立資料庫，只建表與 seed A 廠 sync_state');

  const pool = await sql.connect(baseConfig);
  console.log('✅ 連線成功\n');

  let sqlFiles;
  if (vmMode) {
    // VM 模式：資料庫已存在，只建 DBA02 內需要的表
    sqlFiles = [
      '02_dba02_tables.sql',
      '04_dba02_alarm.sql',
      '06_dba02_disable_list.sql',
    ];
  } else {
    sqlFiles = [
      ...(shouldReset ? ['00_drop_old.sql'] : []),
      '01_create_databases.sql',
      '02_dba02_tables.sql',
      '03_rds02_alarm.sql',
      '04_dba02_alarm.sql',
      '05_b_factory_alarm.sql',
      '06_dba02_disable_list.sql',
    ];
  }

  for (const file of sqlFiles) {
    console.log(`▶ 執行 ${file} ...`);
    await runSqlFile(pool, file);
    console.log(`  ✅ 完成\n`);
  }

  // ----- Seed 資料（用 parameterized query 避免中文編碼問題） -----
  console.log('▶ 寫入 seed 資料 ...');
  if (!vmMode) {
    await seedSystems(pool);
    await seedSubSystems(pool);
  }
  await seedSyncState(pool, vmMode);
  console.log('  ✅ 完成\n');

  console.log('🎉 所有資料庫與資料表建立完成！');
  await pool.close();
}

/**
 * systems 主檔（9 個系統）
 */
async function seedSystems(pool) {
  const rows = [
    { code: 'EI',    name: 'EI',    department: 'building', sort_order: 10 },
    { code: 'MECH',  name: 'MECH',  department: 'building', sort_order: 20 },
    { code: 'FIRE',  name: '消防',  department: 'building', sort_order: 30 },
    { code: 'I&C',   name: 'I&C',   department: 'building', sort_order: 40 },
    { code: 'WTS',   name: 'WTS',   department: 'process',  sort_order: 50 },
    { code: 'GCS',   name: 'GCS',   department: 'process',  sort_order: 60 },
    { code: 'Shift', name: 'Shift', department: 'process',  sort_order: 70 },
    { code: 'Maint', name: 'Maint', department: 'project',  sort_order: 80 },
    { code: 'TI',    name: 'TI',    department: 'project',  sort_order: 90 },
  ];

  for (const row of rows) {
    const req = pool.request();
    req.input('code',       sql.VarChar(20),  row.code);
    req.input('name',       sql.NVarChar(50), row.name);
    req.input('department', sql.VarChar(20),  row.department);
    req.input('sort_order', sql.Int,          row.sort_order);
    await req.query(`
      USE [${DBA02_DB_NAME}];
      IF NOT EXISTS (SELECT 1 FROM dbo.systems WHERE code = @code)
        INSERT INTO dbo.systems (code, name, department, sort_order)
        VALUES (@code, @name, @department, @sort_order)
      ELSE
        UPDATE dbo.systems
          SET name = @name, department = @department, sort_order = @sort_order
          WHERE code = @code;
    `);
  }
}

/**
 * sub_systems 主檔（4 個子系統）
 */
async function seedSubSystems(pool) {
  const rows = [
    { code: 'CR',   name: 'CR',   system_code: 'MECH', sort_order: 10 },
    { code: 'HVAC', name: 'HVAC', system_code: 'MECH', sort_order: 20 },
    { code: 'GAS',  name: '氣體', system_code: 'GCS',  sort_order: 10 },
    { code: 'CHEM', name: '化學', system_code: 'GCS',  sort_order: 20 },
  ];

  for (const row of rows) {
    const req = pool.request();
    req.input('code',        sql.VarChar(20),  row.code);
    req.input('name',        sql.NVarChar(50), row.name);
    req.input('system_code', sql.VarChar(20),  row.system_code);
    req.input('sort_order',  sql.Int,          row.sort_order);
    await req.query(`
      USE [${DBA02_DB_NAME}];
      IF NOT EXISTS (SELECT 1 FROM dbo.sub_systems WHERE code = @code)
        INSERT INTO dbo.sub_systems (code, name, system_code, sort_order)
        VALUES (@code, @name, @system_code, @sort_order)
      ELSE
        UPDATE dbo.sub_systems
          SET name = @name, system_code = @system_code, sort_order = @sort_order
          WHERE code = @code;
    `);
  }
}

/**
 * sync_state 初始化三條管線的狀態紀錄
 * 使用 parameterized query 確保 nvarchar 中文正確寫入
 */
async function seedSyncState(pool, vmMode = false) {
  const allRows = [
    { job_name: 'alarm_rds02_to_dba02',  desc: 'A 廠 RDS02 → DBA02' },
    { job_name: 'alarm_b1sa01_to_dba03', desc: 'B 廠 B1SA01 → DBA03 (跨內外網)' },
    { job_name: 'alarm_dba03_to_dba02',  desc: 'B 廠 DBA03 → DBA02' },
  ];
  const rows = vmMode
    ? allRows.filter(r => r.job_name === 'alarm_rds02_to_dba02')
    : allRows;

  for (const row of rows) {
    const req = pool.request();
    req.input('name', sql.NVarChar(100), row.job_name);
    req.input('desc', sql.NVarChar(200), row.desc);
    await req.query(`
      USE [${DBA02_DB_NAME}];
      IF NOT EXISTS (SELECT 1 FROM dbo.sync_state WHERE job_name = @name)
        INSERT INTO dbo.sync_state (job_name, source_description) VALUES (@name, @desc)
      ELSE
        UPDATE dbo.sync_state SET source_description = @desc WHERE job_name = @name;
    `);
  }
}

main().catch(err => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});
