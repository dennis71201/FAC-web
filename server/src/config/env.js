import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = [
  'DB_SERVER',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'JWT_SECRET',
];

const optionalEnvVars = {
  DB_PORT: '',
  DB_INSTANCE_NAME: '',
  NODE_ENV: 'development',
  PORT: '3000',
  AUTH_DEV_BYPASS: 'false',
  OIDC_ISSUER: '',
  OIDC_CLIENT_ID: '',
  OIDC_AUDIENCE: '',
  OIDC_DISCOVERY_URL: '',
};

// Validate required env vars
const missing = requiredEnvVars.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

// Merge required and optional
const env = {
  // Required
  DB_SERVER: process.env.DB_SERVER,
  DB_PORT: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : null,
  DB_INSTANCE_NAME: process.env.DB_INSTANCE_NAME || optionalEnvVars.DB_INSTANCE_NAME,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  JWT_SECRET: process.env.JWT_SECRET,

  // Optional with defaults
  NODE_ENV: process.env.NODE_ENV || optionalEnvVars.NODE_ENV,
  PORT: parseInt(process.env.PORT || optionalEnvVars.PORT, 10),
  AUTH_DEV_BYPASS: process.env.AUTH_DEV_BYPASS === 'true',
  OIDC_ISSUER: process.env.OIDC_ISSUER || optionalEnvVars.OIDC_ISSUER,
  OIDC_CLIENT_ID: process.env.OIDC_CLIENT_ID || optionalEnvVars.OIDC_CLIENT_ID,
  OIDC_AUDIENCE: process.env.OIDC_AUDIENCE || optionalEnvVars.OIDC_AUDIENCE,
  OIDC_DISCOVERY_URL: process.env.OIDC_DISCOVERY_URL || optionalEnvVars.OIDC_DISCOVERY_URL,
};

// Validation: if not in dev with bypass, OIDC config must be present
if (!env.AUTH_DEV_BYPASS && (!env.OIDC_ISSUER || !env.OIDC_CLIENT_ID)) {
  console.warn('[ENV] Warning: OIDC config incomplete. Token validation may fail.');
}

export default env;
