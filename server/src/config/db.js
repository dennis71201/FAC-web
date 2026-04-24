import sql from 'mssql';
import env from './env.js';

let pool = null;

function resolveSqlTarget() {
  let server = env.DB_SERVER;
  let instanceName = env.DB_INSTANCE_NAME || null;

  // Support DB_SERVER format like .\SQLEXPRESS or localhost\SQLEXPRESS
  if (!instanceName && server.includes('\\')) {
    const [host, instance] = server.split('\\');
    const normalizedHost = host && host.trim().length > 0 ? host.trim() : 'localhost';
    // '.' means localhost in SQL Server connection strings
    server = normalizedHost === '.' ? 'localhost' : normalizedHost;
    instanceName = instance || null;
  }

  return { server, instanceName };
}

async function initializePool() {
  if (pool) {
    return pool;
  }

  const { server, instanceName } = resolveSqlTarget();

  const options = {
    encrypt: false,
    trustServerCertificate: true,
  };

  if (instanceName) {
    options.instanceName = instanceName;
  }

  const config = {
    server,
    database: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    authentication: {
      type: 'default',
    },
    options,
    connectionTimeout: 15000,
    requestTimeout: 30000,
    pool: {
      min: 2,
      max: 10,
      idleTimeoutMillis: 30000,
    },
  };

  // Only apply explicit TCP port when not using named instance
  if (!instanceName && env.DB_PORT) {
    config.port = env.DB_PORT;
  }

  const target = instanceName ? `${server}\\${instanceName}` : `${server}:${env.DB_PORT || 1433}`;

  try {
    pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log(`[DB] MSSQL connection pool initialized successfully (${target})`);
    return pool;
  } catch (error) {
    console.error(`[DB] Failed to initialize MSSQL connection pool (${target}):`, error.message);
    process.exit(1);
  }
}

export async function getPool() {
  if (!pool) {
    await initializePool();
  }
  return pool;
}

export async function testConnection() {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT 1 as test');
    return { success: true, message: 'Database connection OK' };
  } catch (error) {
    return { success: false, message: `Database connection failed: ${error.message}` };
  }
}

export async function closePool() {
  if (pool) {
    await pool.close();
    pool = null;
    console.log('[DB] MSSQL connection pool closed');
  }
}
