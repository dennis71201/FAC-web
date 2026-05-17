import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import sql from 'mssql';
import { api, TEST_USERS, getToken, authHeader } from './helpers.js';
import { getPool, closePool } from '../src/config/db.js';

// 保存原始 layout，所有測試結束後復原
let originalRow = null;

async function fetchActiveRow() {
  const pool = await getPool();
  const r = await pool.request().query(`
    SELECT TOP 1 HomePageLayoutId, LayoutJson, UpdatedBy
    FROM HomePageLayout
    ORDER BY HomePageLayoutId
  `);
  return r.recordset[0] || null;
}

async function restoreOriginalRow() {
  if (!originalRow) return;
  const pool = await getPool();
  await pool
    .request()
    .input('id', sql.Int, originalRow.HomePageLayoutId)
    .input('json', sql.NVarChar(sql.MAX), originalRow.LayoutJson)
    .input('updatedBy', sql.Int, originalRow.UpdatedBy)
    .query(`
      UPDATE HomePageLayout
      SET LayoutJson = @json, UpdatedBy = @updatedBy, UpdatedAt = SYSDATETIME()
      WHERE HomePageLayoutId = @id
    `);
}

beforeAll(async () => {
  originalRow = await fetchActiveRow();
});

afterAll(async () => {
  await restoreOriginalRow();
  await closePool();
});

beforeEach(async () => {
  // 每測試前都復原成原始 layout，避免互相影響
  await restoreOriginalRow();
});

describe('GET /api/homepage', () => {
  it('未帶 token 回 401', async () => {
    const res = await api().get('/api/homepage');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('管理者讀取成功並包含 layout 結構', async () => {
    const token = await getToken(TEST_USERS.admin.employeeNumber);
    const res = await api().get('/api/homepage').set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('layout');
    expect(res.body.data).toHaveProperty('updatedBy');
    expect(res.body.data).toHaveProperty('updatedAt');
    expect(res.body.data.layout).toHaveProperty('blocks');
    expect(res.body.data.layout).toHaveProperty('layout');
    expect(Array.isArray(res.body.data.layout.blocks)).toBe(true);
    expect(Array.isArray(res.body.data.layout.layout)).toBe(true);
  });

  it('一般使用者也可讀取', async () => {
    const token = await getToken(TEST_USERS.general.employeeNumber);
    const res = await api().get('/api/homepage').set(authHeader(token));
    expect(res.status).toBe(200);
  });
});

describe('PUT /api/homepage', () => {
  const validLayout = {
    blocks: [
      { id: 'b_test_1', type: 'text', data: { html: '<p>Test content</p>' } },
      { id: 'b_test_2', type: 'link', data: { url: '/x', label: 'X', description: '' } },
    ],
    layout: [
      { i: 'b_test_1', x: 0, y: 0, w: 12, h: 3 },
      { i: 'b_test_2', x: 0, y: 3, w: 3, h: 2 },
    ],
  };

  it('未帶 token 回 401', async () => {
    const res = await api().put('/api/homepage').send({ layout: validLayout });
    expect(res.status).toBe(401);
  });

  it('一般使用者回 403 FORBIDDEN', async () => {
    const token = await getToken(TEST_USERS.general.employeeNumber);
    const res = await api()
      .put('/api/homepage')
      .set(authHeader(token))
      .send({ layout: validLayout });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('缺 layout 欄位回 400 BAD_REQUEST', async () => {
    const adminToken = await getToken(TEST_USERS.admin.employeeNumber);
    const res = await api().put('/api/homepage').set(authHeader(adminToken)).send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('BAD_REQUEST');
  });

  it('layout 非物件回 400', async () => {
    const adminToken = await getToken(TEST_USERS.admin.employeeNumber);
    const res = await api()
      .put('/api/homepage')
      .set(authHeader(adminToken))
      .send({ layout: 'not-an-object' });
    expect(res.status).toBe(400);
  });

  it('管理者更新成功，GET 拿回相同內容', async () => {
    const adminToken = await getToken(TEST_USERS.admin.employeeNumber);
    const putRes = await api()
      .put('/api/homepage')
      .set(authHeader(adminToken))
      .send({ layout: validLayout });

    expect(putRes.status).toBe(200);
    expect(putRes.body.data.ok).toBe(true);

    const getRes = await api().get('/api/homepage').set(authHeader(adminToken));
    expect(getRes.body.data.layout).toEqual(validLayout);
    expect(getRes.body.data.updatedBy).toBe(1); // FAC-001 EmployeeId
  });

  it('更新後 UpdatedAt 會刷新', async () => {
    const adminToken = await getToken(TEST_USERS.admin.employeeNumber);
    const before = await api().get('/api/homepage').set(authHeader(adminToken));
    const beforeAt = before.body.data.updatedAt;

    // 等 1 秒讓 SYSDATETIME 跳秒
    await new Promise((r) => setTimeout(r, 1100));
    await api().put('/api/homepage').set(authHeader(adminToken)).send({ layout: validLayout });

    const after = await api().get('/api/homepage').set(authHeader(adminToken));
    expect(after.body.data.updatedAt).not.toBe(beforeAt);
  });
});
