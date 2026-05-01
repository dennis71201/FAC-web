import { describe, it, expect, afterAll } from 'vitest';
import { api } from './helpers.js';
import { closePool } from '../src/config/db.js';

afterAll(async () => {
  await closePool();
});

describe('GET /api/health', () => {
  it('回傳 healthy 與資料庫連線狀態', async () => {
    const res = await api().get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.components.app).toBe('up');
    expect(res.body.components.database).toBe('connected');
  });

  it('包含 environment 與 auth 狀態', async () => {
    const res = await api().get('/api/health');
    expect(res.body.environment).toBeDefined();
    expect(res.body.components.auth).toBeDefined();
    expect(typeof res.body.components.auth.oidcConfigured).toBe('boolean');
  });
});

describe('GET /api/health/live', () => {
  it('liveness 回 200', async () => {
    const res = await api().get('/api/health/live');
    expect(res.status).toBe(200);
    expect(res.body.live).toBe(true);
  });
});

describe('GET /api/health/ready', () => {
  it('DB 連線正常時 readiness 回 200', async () => {
    const res = await api().get('/api/health/ready');
    expect(res.status).toBe(200);
    expect(res.body.ready).toBe(true);
  });
});
