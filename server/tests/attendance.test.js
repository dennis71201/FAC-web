import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import sql from 'mssql';
import {
  api,
  authHeader,
  getToken,
  TEST_USERS,
  TEST_NOTE_PREFIX,
  cleanupTestAttendance,
  insertAttendanceRecord,
} from './helpers.js';
import { getPool, closePool } from '../src/config/db.js';

let adminToken;
let generalToken;
let noPermToken;
let adminUser;
let generalUser;

beforeAll(async () => {
  await cleanupTestAttendance();

  adminToken = await getToken(TEST_USERS.admin.employeeNumber);
  generalToken = await getToken(TEST_USERS.general.employeeNumber);
  noPermToken = await getToken(TEST_USERS.noPermission.employeeNumber);

  const adminRes = await api()
    .post('/api/auth/identify')
    .send({ employeeNumber: TEST_USERS.admin.employeeNumber });
  adminUser = adminRes.body.user;

  const generalRes = await api()
    .post('/api/auth/identify')
    .send({ employeeNumber: TEST_USERS.general.employeeNumber });
  generalUser = generalRes.body.user;
});

afterAll(async () => {
  await cleanupTestAttendance();
  await closePool();
});

describe('GET /api/attendance/types', () => {
  it('未帶 token 回 401', async () => {
    const res = await api().get('/api/attendance/types');
    expect(res.status).toBe(401);
  });

  it('FAC-003（無 Attendance Record 權限）回 403', async () => {
    const res = await api()
      .get('/api/attendance/types')
      .set(authHeader(noPermToken));
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('Admin 取得 5 種假別', async () => {
    const res = await api()
      .get('/api/attendance/types')
      .set(authHeader(adminToken));
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(5);
  });

  it('包含必要欄位 AttendanceTypeId/Name/Color', async () => {
    const res = await api()
      .get('/api/attendance/types')
      .set(authHeader(adminToken));
    const sample = res.body.data[0];
    expect(sample).toHaveProperty('AttendanceTypeId');
    expect(sample).toHaveProperty('AttendanceTypeName');
    expect(sample).toHaveProperty('AttendanceTypeColor');
  });

  it('包含已知假別（出差、請假、Training）', async () => {
    const res = await api()
      .get('/api/attendance/types')
      .set(authHeader(adminToken));
    const names = res.body.data.map((t) => t.AttendanceTypeName);
    expect(names).toEqual(expect.arrayContaining(['出差', '請假', 'Training']));
  });
});

describe('GET /api/attendance/records', () => {
  it('未帶 token 回 401', async () => {
    const res = await api().get('/api/attendance/records');
    expect(res.status).toBe(401);
  });

  it('無權限 (FAC-003) 回 403', async () => {
    const res = await api()
      .get('/api/attendance/records')
      .set(authHeader(noPermToken));
    expect(res.status).toBe(403);
  });

  it('Admin 不帶參數可取得紀錄陣列', async () => {
    const res = await api()
      .get('/api/attendance/records')
      .set(authHeader(adminToken));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('依 employeeId 過濾只回該員工資料', async () => {
    const res = await api()
      .get(`/api/attendance/records?employeeId=${adminUser.employeeId}`)
      .set(authHeader(adminToken));
    expect(res.status).toBe(200);
    res.body.data.forEach((r) => {
      expect(r.EmployeeId).toBe(adminUser.employeeId);
    });
  });

  it('依 year/month 過濾僅回對應月份', async () => {
    const recordId = await insertAttendanceRecord({
      employeeId: adminUser.employeeId,
      attendanceTypeId: 2,
      startTime: '2026-04-15T00:00:00.000Z',
      endTime: '2026-04-15T23:59:59.000Z',
      note: 'year-month-filter',
      isAllDay: true,
    });

    const res = await api()
      .get('/api/attendance/records?year=2026&month=4')
      .set(authHeader(adminToken));
    expect(res.status).toBe(200);
    const ids = res.body.data.map((r) => r.AttendanceRecordId);
    expect(ids).toContain(recordId);

    res.body.data.forEach((r) => {
      const start = new Date(r.StartTime);
      expect(start.getUTCFullYear()).toBe(2026);
    });
  });

  it('回傳已 JOIN 的員工與類別欄位', async () => {
    const res = await api()
      .get('/api/attendance/records')
      .set(authHeader(adminToken));
    if (res.body.data.length > 0) {
      const sample = res.body.data[0];
      expect(sample).toHaveProperty('EmployeeName');
      expect(sample).toHaveProperty('EmployeeDepartment');
      expect(sample).toHaveProperty('EmployeeSection');
      expect(sample).toHaveProperty('AttendanceTypeName');
      expect(sample).toHaveProperty('AttendanceTypeColor');
    }
  });

  it('過濾 IsAlive=1（軟刪除紀錄不會出現）', async () => {
    const recordId = await insertAttendanceRecord({
      employeeId: adminUser.employeeId,
      startTime: '2026-04-20T00:00:00.000Z',
      endTime: '2026-04-20T23:59:59.000Z',
      note: 'soft-delete-filter',
    });

    const pool = await getPool();
    await pool
      .request()
      .input('id', sql.Int, recordId)
      .query('UPDATE AttendanceRecord SET IsAlive = 0 WHERE AttendanceRecordId = @id');

    const res = await api()
      .get('/api/attendance/records?year=2026&month=4')
      .set(authHeader(adminToken));
    const ids = res.body.data.map((r) => r.AttendanceRecordId);
    expect(ids).not.toContain(recordId);
  });
});

describe('POST /api/attendance/records', () => {
  it('未帶 token 回 401', async () => {
    const res = await api()
      .post('/api/attendance/records')
      .send({
        employeeId: 1,
        attendanceTypeId: 2,
        startTime: '2026-05-01T00:00:00.000Z',
        endTime: '2026-05-01T23:59:59.000Z',
      });
    expect(res.status).toBe(401);
  });

  it('Admin 為自己新增紀錄成功，回 201 + recordId', async () => {
    const res = await api()
      .post('/api/attendance/records')
      .set(authHeader(adminToken))
      .send({
        employeeId: adminUser.employeeId,
        attendanceTypeId: 2,
        startTime: '2026-05-02T00:00:00.000Z',
        endTime: '2026-05-02T23:59:59.000Z',
        isAllDay: true,
        note: `${TEST_NOTE_PREFIX}create-self`,
      });
    expect(res.status).toBe(201);
    expect(res.body.data.attendanceRecordId).toBeTypeOf('number');
  });

  it('General User 為他人新增紀錄回 403 FORBIDDEN', async () => {
    const res = await api()
      .post('/api/attendance/records')
      .set(authHeader(generalToken))
      .send({
        employeeId: adminUser.employeeId,
        attendanceTypeId: 2,
        startTime: '2026-05-03T00:00:00.000Z',
        endTime: '2026-05-03T23:59:59.000Z',
        isAllDay: true,
        note: `${TEST_NOTE_PREFIX}cross-user`,
      });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('General User 為自己新增紀錄成功', async () => {
    const res = await api()
      .post('/api/attendance/records')
      .set(authHeader(generalToken))
      .send({
        employeeId: generalUser.employeeId,
        attendanceTypeId: 2,
        startTime: '2026-05-04T00:00:00.000Z',
        endTime: '2026-05-04T23:59:59.000Z',
        isAllDay: true,
        note: `${TEST_NOTE_PREFIX}self`,
      });
    expect(res.status).toBe(201);
  });

  it('Admin 為他人新增紀錄成功', async () => {
    const res = await api()
      .post('/api/attendance/records')
      .set(authHeader(adminToken))
      .send({
        employeeId: generalUser.employeeId,
        attendanceTypeId: 2,
        startTime: '2026-05-05T00:00:00.000Z',
        endTime: '2026-05-05T23:59:59.000Z',
        isAllDay: true,
        note: `${TEST_NOTE_PREFIX}admin-create-other`,
      });
    expect(res.status).toBe(201);
  });

  it('缺必填欄位回 400 BAD_REQUEST', async () => {
    const res = await api()
      .post('/api/attendance/records')
      .set(authHeader(adminToken))
      .send({ employeeId: adminUser.employeeId });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('BAD_REQUEST');
  });

  it('支援跨日紀錄（StartTime 與 EndTime 跨午夜）', async () => {
    const res = await api()
      .post('/api/attendance/records')
      .set(authHeader(adminToken))
      .send({
        employeeId: adminUser.employeeId,
        attendanceTypeId: 1,
        startTime: '2026-05-06T13:00:00.000Z',
        endTime: '2026-05-06T21:00:00.000Z',
        isAllDay: false,
        note: `${TEST_NOTE_PREFIX}cross-day`,
      });
    expect(res.status).toBe(201);

    const recordId = res.body.data.attendanceRecordId;
    const pool = await getPool();
    const dbRow = await pool
      .request()
      .input('id', sql.Int, recordId)
      .query('SELECT StartTime, EndTime, IsAllDay FROM AttendanceRecord WHERE AttendanceRecordId = @id');
    expect(dbRow.recordset[0].IsAllDay).toBe(false);
  });
});

describe('DELETE /api/attendance/records/:id', () => {
  let adminOwnedRecordId;
  let generalOwnedRecordId;

  beforeEach(async () => {
    adminOwnedRecordId = await insertAttendanceRecord({
      employeeId: adminUser.employeeId,
      startTime: '2026-05-10T00:00:00.000Z',
      endTime: '2026-05-10T23:59:59.000Z',
      note: 'delete-admin-owned',
    });
    generalOwnedRecordId = await insertAttendanceRecord({
      employeeId: generalUser.employeeId,
      startTime: '2026-05-11T00:00:00.000Z',
      endTime: '2026-05-11T23:59:59.000Z',
      note: 'delete-general-owned',
    });
  });

  it('未帶 token 回 401', async () => {
    const res = await api().delete(`/api/attendance/records/${adminOwnedRecordId}`);
    expect(res.status).toBe(401);
  });

  it('General User 刪除自己的紀錄成功，IsAlive 變 0', async () => {
    const res = await api()
      .delete(`/api/attendance/records/${generalOwnedRecordId}`)
      .set(authHeader(generalToken));
    expect(res.status).toBe(200);
    expect(res.body.data.isAlive).toBe(0);

    const pool = await getPool();
    const dbRow = await pool
      .request()
      .input('id', sql.Int, generalOwnedRecordId)
      .query('SELECT IsAlive FROM AttendanceRecord WHERE AttendanceRecordId = @id');
    expect(dbRow.recordset[0].IsAlive).toBe(false);
  });

  it('General User 刪除他人紀錄回 403', async () => {
    const res = await api()
      .delete(`/api/attendance/records/${adminOwnedRecordId}`)
      .set(authHeader(generalToken));
    expect(res.status).toBe(403);
  });

  it('Admin 可刪除他人紀錄', async () => {
    const res = await api()
      .delete(`/api/attendance/records/${generalOwnedRecordId}`)
      .set(authHeader(adminToken));
    expect(res.status).toBe(200);
  });

  it('刪除不存在的紀錄回 404', async () => {
    const res = await api()
      .delete('/api/attendance/records/9999999')
      .set(authHeader(adminToken));
    expect(res.status).toBe(404);
  });

  it('重複刪除已刪紀錄回 404', async () => {
    await api()
      .delete(`/api/attendance/records/${adminOwnedRecordId}`)
      .set(authHeader(adminToken));
    const res = await api()
      .delete(`/api/attendance/records/${adminOwnedRecordId}`)
      .set(authHeader(adminToken));
    expect(res.status).toBe(404);
  });

  it('無效 id 回 400', async () => {
    const res = await api()
      .delete('/api/attendance/records/abc')
      .set(authHeader(adminToken));
    expect(res.status).toBe(400);
  });
});
