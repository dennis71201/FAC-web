import env from './env.js';

export const oidcConfig = {
  issuer: env.OIDC_ISSUER,
  clientId: env.OIDC_CLIENT_ID,
  audience: env.OIDC_AUDIENCE,
  discoveryUrl: env.OIDC_DISCOVERY_URL,
};

export function isOidcConfigured() {
  return !!(env.OIDC_ISSUER && env.OIDC_CLIENT_ID);
}

export function logOidcStatus() {
  if (isOidcConfigured()) {
    console.log('[OIDC] OIDC is configured. Issuer:', env.OIDC_ISSUER);
  } else if (env.AUTH_DEV_BYPASS) {
    console.warn('[OIDC] OIDC not configured. Dev bypass enabled — using dev fallback only.');
  } else {
    console.warn('[OIDC] Warning: OIDC not configured and dev bypass disabled. Auth may fail.');
  }
}
