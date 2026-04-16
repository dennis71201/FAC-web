/**
 * DB Connection Pool 管理
 * Lazy 建立 pool，程式結束時統一關閉
 */
import sql from 'mssql';
import { DB_CONFIGS } from '../config.mjs';
import { log } from './log.mjs';

const pools = {};

/**
 * 取得指定 DB 的 pool，不存在則建立
 * @param {'dba02'|'rds02'|'b1sa01'|'dba03'} name
 * @returns {Promise<sql.ConnectionPool>}
 */
export async function getPool(name) {
  if (!DB_CONFIGS[name]) {
    throw new Error(`[pools] 未知的 DB 名稱: ${name}，請檢查 .env 是否已設定 DB_${name.toUpperCase()}_* 環境變數`);
  }

  if (!pools[name]) {
    const config = DB_CONFIGS[name];
    log.info(`連線 ${name} (${config.server}:${config.port}/${config.database}) ...`);
    pools[name] = new sql.ConnectionPool(config);
    await pools[name].connect();
  }

  return pools[name];
}

/**
 * 關閉所有已建立的 pool
 */
export async function closeAllPools() {
  for (const [name, pool] of Object.entries(pools)) {
    try {
      await pool.close();
      log.info(`關閉 ${name} 連線`);
    } catch (err) {
      log.warn(`關閉 ${name} 連線失敗: ${err.message}`);
    }
  }
}
