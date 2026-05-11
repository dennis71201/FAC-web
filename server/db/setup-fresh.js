// Destructive helper to DROP + recreate MTB_FAC_OPS_WEB on local MSSQL.
//
// Use case: after schema renames or when local DB drifts from server/db/schema.sql,
// run this to wipe the DB and reseed from the latest schema + Insert_*.sql files.
//
// Usage (PowerShell):
//   cd server
//   node db/setup-fresh.js --confirm
//
// Safety guards:
//   - Refuses to run when NODE_ENV=production.
//   - Requires --confirm flag (running without it prints what would happen and exits).
//   - Reads DB connection from server/.env. Target DB is DB_NAME (default MTB_FAC_OPS_WEB).
//
// Seeds are read from D:\\micron-FAC-web\\既有DB資料 (override via INSERTS_DIR env).
import sql from 'mssql';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const TARGET_DB = process.env.DB_NAME || 'MTB_FAC_OPS_WEB';
const EXTERNAL_DB_DIR = process.env.INSERTS_DIR || 'D:\\micron-FAC-web\\既有DB資料';
const CONFIRMED = process.argv.includes('--confirm');

if (process.env.NODE_ENV === 'production') {
  console.error('Refusing to run: NODE_ENV=production. This script DROPs the database.');
  process.exit(2);
}

if (!CONFIRMED) {
  console.log('DRY RUN. Pass --confirm to actually drop and recreate.');
  console.log('');
  console.log(`Target DB:        ${TARGET_DB}`);
  console.log(`Server (env):     ${process.env.DB_SERVER || '(missing)'}`);
  console.log(`Inserts dir:      ${EXTERNAL_DB_DIR}`);
  console.log('');
  console.log('Will execute:');
  console.log('  1) DROP DATABASE [' + TARGET_DB + '] (rollback immediate)');
  console.log('  2) CREATE DATABASE [' + TARGET_DB + ']');
  console.log('  3) Run server/db/schema.sql');
  console.log('  4) Run Insert_EmployeeSection.sql, Insert_AttendanceType.sql,');
  console.log('         Insert_Employee.sql, Insert_EmployeePermission.sql');
  console.log('  5) Verify row counts');
  process.exit(0);
}

function resolveSqlTarget() {
  let server = process.env.DB_SERVER || 'localhost';
  let instanceName = process.env.DB_INSTANCE_NAME || null;
  if (!instanceName && server.includes('\\')) {
    const [host, instance] = server.split('\\');
    server = host && host.trim() && host.trim() !== '.' ? host.trim() : 'localhost';
    instanceName = instance || null;
  }
  return { server, instanceName };
}

function buildConfig(database) {
  const { server, instanceName } = resolveSqlTarget();
  const options = { encrypt: false, trustServerCertificate: true };
  if (instanceName) options.instanceName = instanceName;
  const config = {
    server,
    database,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    authentication: { type: 'default' },
    options,
    connectionTimeout: 15000,
    requestTimeout: 60000,
  };
  if (!instanceName && process.env.DB_PORT) {
    config.port = parseInt(process.env.DB_PORT, 10);
  }
  return config;
}

function splitBatches(sqlText) {
  return sqlText
    .split(/^\s*GO\s*$/im)
    .map((b) => b.trim())
    .filter((b) => b.length > 0);
}

async function runBatches(pool, label, sqlText) {
  const batches = splitBatches(sqlText);
  console.log(`\n=== ${label} (${batches.length} batches) ===`);
  for (let i = 0; i < batches.length; i += 1) {
    const batch = batches[i];
    try {
      await pool.request().batch(batch);
      const preview = batch.slice(0, 60).replace(/\s+/g, ' ');
      console.log(`  [ok] batch ${i + 1}: ${preview}...`);
    } catch (err) {
      console.error(`  [FAIL] batch ${i + 1}: ${err.message}`);
      console.error(`  SQL preview: ${batch.slice(0, 200).replace(/\s+/g, ' ')}`);
      throw err;
    }
  }
}

async function main() {
  const target = resolveSqlTarget();
  console.log(`Target: ${target.server}${target.instanceName ? '\\' + target.instanceName : ''}, DB: ${TARGET_DB}`);

  // 1) Drop + create database via master
  const masterPool = await new sql.ConnectionPool(buildConfig('master')).connect();
  try {
    console.log(`\n=== DROP DATABASE [${TARGET_DB}] (if exists) ===`);
    await masterPool.request().query(`
      IF DB_ID('${TARGET_DB}') IS NOT NULL
      BEGIN
        ALTER DATABASE [${TARGET_DB}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
        DROP DATABASE [${TARGET_DB}];
      END
    `);
    console.log('  [ok]');

    console.log(`\n=== CREATE DATABASE [${TARGET_DB}] ===`);
    await masterPool.request().query(`
      CREATE DATABASE [${TARGET_DB}] COLLATE Chinese_Taiwan_Stroke_CI_AS;
    `);
    console.log('  [ok]');
  } finally {
    await masterPool.close();
  }

  // 2) Connect to new database and run schema + insert scripts
  const pool = await new sql.ConnectionPool(buildConfig(TARGET_DB)).connect();
  try {
    // Run schema.sql but strip the CREATE DATABASE / USE blocks (we did those manually).
    const schemaPath = path.resolve(__dirname, 'schema.sql');
    let schemaText = fs.readFileSync(schemaPath, 'utf8');
    schemaText = schemaText
      .replace(/IF DB_ID\('MTB_FAC_OPS_WEB'\) IS NULL[\s\S]*?END\s*GO/i, '')
      .replace(/USE\s+\[MTB_FAC_OPS_WEB\]\s*;?\s*GO/gi, '')
      .replace(/USE\s+master\s*;?\s*GO/gi, '');
    await runBatches(pool, 'schema.sql', schemaText);

    // Run insert scripts in dependency order.
    const inserts = [
      'Insert_EmployeeSection.sql',
      'Insert_AttendanceType.sql',
      'Insert_Employee.sql',
      'Insert_EmployeePermission.sql',
    ];
    for (const filename of inserts) {
      const fp = path.join(EXTERNAL_DB_DIR, filename);
      const txt = fs.readFileSync(fp, 'utf8');
      await runBatches(pool, filename, txt);
    }

    // 3) Verification counts
    console.log('\n=== Verification ===');
    const checks = [
      { table: 'EmployeeSection', expect: 13 },
      { table: 'AttendanceType', expect: 5 },
      { table: 'Employee', expect: 15 },
      { table: 'EmployeePermission', expect: 14 },
    ];
    for (const c of checks) {
      const r = await pool.request().query(`SELECT COUNT(*) AS c FROM ${c.table}`);
      const actual = r.recordset[0].c;
      const mark = actual === c.expect ? 'OK' : 'WARN';
      console.log(`  [${mark}] ${c.table}: ${actual} (expect ${c.expect})`);
    }

    console.log('\nDone.');
  } finally {
    await pool.close();
  }
}

main().catch((err) => {
  console.error('\nSetup failed:', err.message);
  process.exit(1);
});
