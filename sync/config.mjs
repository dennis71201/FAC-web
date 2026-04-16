/**
 * 同步程式的連線設定，從 .env 讀取
 * 所有連線參數經由環境變數注入，程式不內嵌任何密碼
 */
import { config as loadEnv } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(__dirname, '..', '.env') });

/**
 * 將環境變數組成 mssql 連線設定
 * @param {string} prefix  DB_DBA02 / DB_RDS02 / DB_B1SA01 / DB_DBA03
 */
function buildDbConfig(prefix, { required = true } = {}) {
  const host = process.env[`${prefix}_HOST`];
  const port = process.env[`${prefix}_PORT`];
  const database = process.env[`${prefix}_DATABASE`];
  const user = process.env[`${prefix}_USER`];
  const password = process.env[`${prefix}_PASSWORD`];

  if (!host || !database || !user || !password) {
    if (!required) return null;
    throw new Error(
      `[config] 缺少 ${prefix}_* 環境變數，請檢查 .env 是否完整設定`
    );
  }

  return {
    server: host,
    port: parseInt(port || '1433', 10),
    database,
    user,
    password,
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30_000,
    },
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  };
}

export const DB_CONFIGS = {
  dba02:  buildDbConfig('DB_DBA02'),
  rds02:  buildDbConfig('DB_RDS02'),
  b1sa01: buildDbConfig('DB_B1SA01', { required: false }),
  dba03:  buildDbConfig('DB_DBA03',  { required: false }),
};

export const SYNC_RDS02_ALARM_TABLE = process.env.SYNC_RDS02_ALARM_TABLE || 'dbo.HIS_Alarm';
export const SYNC_DBA02_ALARM_TABLE = process.env.SYNC_DBA02_ALARM_TABLE || 'dbo.Alarm';

/** 單次同步的批次大小上限（避免一次撈太多壓爆記憶體） */
export const BATCH_SIZE = parseInt(process.env.SYNC_BATCH_SIZE || '5000', 10);
