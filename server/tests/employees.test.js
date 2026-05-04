import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import { api, authHeader, getToken, TEST_USERS } from './helpers.js';
import { closePool } from '../src/config/db.js';

let adminToken;

beforeAll(async () => {
  adminToken = await getToken(TEST_USERS.admin.employeeNumber);
});

afterAll(async () => {
  await closePool();
});

describe('GET /api/employees', () => {
  it('未帶 token 回 401', async () => {
    const res = await api().get('/api/employees');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('Bearer token 無效回 401', async () => {
    const res = await api()
      .get('/api/employees')
      .set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });

  it('帶有效 token 回 200 與員工陣列', async () => {
    const res = await api().get('/api/employees').set(authHeader(adminToken));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('回傳員工皆為在職（IsAlive = 1，已停用 FAC-010 不應出現）', async () => {
    const res = await api().get('/api/employees').set(authHeader(adminToken));
    const numbers = res.body.data.map((e) => e.EmployeeNumber);
    expect(numbers).toContain(TEST_USERS.admin.employeeNumber);
    expect(numbers).not.toContain(TEST_USERS.inactive.employeeNumber);
  });

  it('每筆包含必要欄位（EmployeeId/Name/Number/Department/Section）', async () => {
    const res = await api().get('/api/employees').set(authHeader(adminToken));
    const sample = res.body.data[0];
    expect(sample).toHaveProperty('EmployeeId');
    expect(sample).toHaveProperty('EmployeeName');
    expect(sample).toHaveProperty('EmployeeNumber');
    expect(sample).toHaveProperty('EmployeeDepartment');
    expect(sample).toHaveProperty('EmployeeSection');
  });

  it('依 EmployeeNumber 排序', async () => {
    const res = await api().get('/api/employees').set(authHeader(adminToken));
    const numbers = res.body.data.map((e) => e.EmployeeNumber);
    const sorted = [...numbers].sort();
    expect(numbers).toEqual(sorted);
  });
});
