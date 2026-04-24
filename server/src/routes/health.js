import { Router } from 'express';
import { testConnection } from '../config/db.js';
import env from '../config/env.js';
import { isOidcConfigured } from '../config/oidc.js';

const router = Router();

/**
 * GET /api/health
 * Returns health status of backend and database
 */
router.get('/health', async (req, res) => {
  try {
    const dbTest = await testConnection();

    const status = {
      timestamp: new Date().toISOString(),
      status: dbTest.success ? 'healthy' : 'degraded',
      environment: env.NODE_ENV,
      components: {
        app: 'up',
        database: dbTest.success ? 'connected' : 'disconnected',
        auth: {
          oidcConfigured: isOidcConfigured(),
          devBypassEnabled: env.AUTH_DEV_BYPASS,
        },
      },
      message: dbTest.message,
    };

    const httpStatus = dbTest.success ? 200 : 503;
    res.status(httpStatus).json(status);
  } catch (error) {
    res.status(500).json({
      error: { code: 'HEALTH_CHECK_FAILED', message: error.message },
    });
  }
});

/**
 * GET /api/health/ready
 * Kubernetes readiness probe — app ready to serve traffic
 */
router.get('/health/ready', async (req, res) => {
  const dbTest = await testConnection();
  if (dbTest.success) {
    return res.status(200).json({ ready: true });
  }
  res.status(503).json({ ready: false, reason: dbTest.message });
});

/**
 * GET /api/health/live
 * Kubernetes liveness probe — app process is alive
 */
router.get('/health/live', (req, res) => {
  res.status(200).json({ live: true });
});

export default router;
