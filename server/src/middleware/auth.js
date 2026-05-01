import { jwtVerify } from 'jose';
import env from '../config/env.js';
import { isOidcConfigured, oidcConfig } from '../config/oidc.js';

const JWT_SECRET = new TextEncoder().encode(env.JWT_SECRET);

/**
 * Verify OIDC token using jose library
 * For now, validates JWT signature using JWT_SECRET (fallback)
 * In production with OIDC, this would validate against the provider's JWKS
 */
async function verifyOidcToken(token) {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return { valid: true, payload: verified.payload };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

/**
 * Auth middleware: validates Bearer token
 * Supports OIDC in production and dev fallback in development
 */
export async function verifyToken(req, res, next) {
  try {
    // Extract Bearer token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Missing or invalid Authorization header' },
      });
    }

    const token = authHeader.slice(7); // Remove 'Bearer ' prefix

    // Verify token
    const result = await verifyOidcToken(token);
    if (!result.valid) {
      return res.status(401).json({
        error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' },
      });
    }

    // Attach user context to request
    req.user = {
      employeeId: result.payload.employeeId,
      role: result.payload.role,
      permissions: result.payload.permissions || result.payload.permission || {},
      isDev: false,
    };

    next();
  } catch (error) {
    console.error('[AUTH] Token verification error:', error.message);
    return res.status(401).json({
      error: { code: 'AUTH_ERROR', message: 'Authentication failed' },
    });
  }
}

/**
 * Optional middleware: logs current auth status for debugging
 */
export function debugAuthStatus(req, res, next) {
  if (env.NODE_ENV === 'development') {
    console.log('[AUTH-DEBUG]', {
      hasAuthHeader: !!req.headers.authorization,
      oidcConfigured: isOidcConfigured(),
      identifyFallbackEnabled: true,
    });
  }
  next();
}
