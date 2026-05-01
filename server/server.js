import app from './app.js';
import env from './src/config/env.js';
import { getPool, closePool } from './src/config/db.js';
import { logOidcStatus } from './src/config/oidc.js';

let server;

async function start() {
  try {
    // Initialize database connection
    console.log('[STARTUP] Initializing database connection...');
    await getPool();
    console.log('[STARTUP] Database connection successful');

    // Log auth status
    logOidcStatus();

    // Start HTTP server
    server = app.listen(env.PORT, () => {
      console.log(`[STARTUP] Server listening on port ${env.PORT}`);
      console.log(`[STARTUP] Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('[STARTUP] Failed to start server:', error.message);
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown() {
  console.log('[SHUTDOWN] Shutting down gracefully...');

  if (server) {
    server.close(async () => {
      console.log('[SHUTDOWN] HTTP server closed');
      await closePool();
      console.log('[SHUTDOWN] All resources cleaned up');
      process.exit(0);
    });

    // Force exit after 10 seconds
    setTimeout(() => {
      console.error('[SHUTDOWN] Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  } else {
    await closePool();
    process.exit(0);
  }
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

start();
