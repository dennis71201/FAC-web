import { describe, it, expect, afterAll, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { api, TEST_USERS, getToken, authHeader } from './helpers.js';
import { closePool } from '../src/config/db.js';

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');

// 1x1 透明 PNG (~67 bytes)
const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64'
);

const uploadedFiles = [];

function trackFile(filename) {
  if (filename) uploadedFiles.push(filename);
}

afterEach(() => {
  // 清掉測試上傳的檔案
  while (uploadedFiles.length) {
    const filename = uploadedFiles.pop();
    const fullPath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
      } catch {
        /* ignore */
      }
    }
  }
});

afterAll(async () => {
  await closePool();
});

describe('POST /api/uploads', () => {
  it('未帶 token 回 401', async () => {
    const res = await api()
      .post('/api/uploads')
      .attach('file', TINY_PNG, { filename: 'test.png', contentType: 'image/png' });
    expect(res.status).toBe(401);
  });

  it('一般使用者回 403 FORBIDDEN', async () => {
    const token = await getToken(TEST_USERS.general.employeeNumber);
    const res = await api()
      .post('/api/uploads')
      .set(authHeader(token))
      .attach('file', TINY_PNG, { filename: 'test.png', contentType: 'image/png' });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('管理者沒附檔回 400 BAD_REQUEST', async () => {
    const adminToken = await getToken(TEST_USERS.admin.employeeNumber);
    const res = await api().post('/api/uploads').set(authHeader(adminToken));
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('BAD_REQUEST');
  });

  it('不支援的 MIME 回 400 UNSUPPORTED_MIME', async () => {
    const adminToken = await getToken(TEST_USERS.admin.employeeNumber);
    const res = await api()
      .post('/api/uploads')
      .set(authHeader(adminToken))
      .attach('file', Buffer.from('hello'), { filename: 'test.txt', contentType: 'text/plain' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('UNSUPPORTED_MIME');
  });

  it('管理者上傳小圖成功並回傳 url、檔案實際落地', async () => {
    const adminToken = await getToken(TEST_USERS.admin.employeeNumber);
    const res = await api()
      .post('/api/uploads')
      .set(authHeader(adminToken))
      .attach('file', TINY_PNG, { filename: 'tiny.png', contentType: 'image/png' });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('url');
    expect(res.body.data).toHaveProperty('filename');
    expect(res.body.data.mimetype).toBe('image/png');
    expect(res.body.data.size).toBe(TINY_PNG.length);
    expect(res.body.data.warning).toBeNull(); // 小檔案不警告
    expect(res.body.data.url).toBe(`/uploads/${res.body.data.filename}`);

    // 檔案實際落地
    const fullPath = path.join(UPLOAD_DIR, res.body.data.filename);
    expect(fs.existsSync(fullPath)).toBe(true);

    trackFile(res.body.data.filename);
  });

  it('上傳的檔名為系統產生 (timestamp + random)，不採用原檔名', async () => {
    const adminToken = await getToken(TEST_USERS.admin.employeeNumber);
    const res = await api()
      .post('/api/uploads')
      .set(authHeader(adminToken))
      .attach('file', TINY_PNG, {
        filename: '../../../etc/passwd.png',
        contentType: 'image/png',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.filename).not.toContain('..');
    expect(res.body.data.filename).not.toContain('/');
    expect(res.body.data.filename).not.toContain('passwd');
    expect(res.body.data.filename).toMatch(/^\d+-[0-9a-f]{32}\.png$/);

    trackFile(res.body.data.filename);
  });
});
