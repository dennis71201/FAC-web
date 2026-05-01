import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import {
  api,
  TEST_USERS,
  TEST_EMP_NUMBER_PREFIX,
  cleanupTestEmployees,
} from './helpers.js';
import { closePool } from '../src/config/db.js';

beforeAll(async () => {
  await cleanupTestEmployees();
});

afterAll(async () => {
  await cleanupTestEmployees();
  await closePool();
});

describe('POST /api/auth/identify', () => {
  it('Administrator 登入成功並回傳 JWT 與 user', async () => {
    const res = await api()
      .post('/api/auth/identify')
      .send({ employeeNumber: TEST_USERS.admin.employeeNumber });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTypeOf('string');
    expect(res.body.user).toMatchObject({
      employeeNumber: TEST_USERS.admin.employeeNumber,
      name: TEST_USERS.admin.name,
      role: 'Administrator',
    });
    expect(res.body.user.permissions).toBeTypeOf('object');
  });

  it('General User 登入成功且 role 為 General User', async () => {
    const res = await api()
      .post('/api/auth/identify')
      .send({ employeeNumber: TEST_USERS.general.employeeNumber });

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('General User');
  });

  it('缺 employeeNumber 回 400 BAD_REQUEST', async () => {
    const res = await api().post('/api/auth/identify').send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('BAD_REQUEST');
  });

  it('不存在的員工編號回 401', async () => {
    const res = await api()
      .post('/api/auth/identify')
      .send({ employeeNumber: 'NOT-EXIST-9999' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('已停用員工（IsAlive=0）登入回 401', async () => {
    const res = await api()
      .post('/api/auth/identify')
      .send({ employeeNumber: TEST_USERS.inactive.employeeNumber });
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/register', () => {
  const nowSuffix = Date.now().toString().slice(-6);
  const validPayload = {
    employeeNumber: `${TEST_EMP_NUMBER_PREFIX}${nowSuffix}-A`,
    employeeName: 'Vitest Tester A',
    employeeEmail: `vitest-${nowSuffix}-a@example.com`,
    departmentAndSectionId: 1,
  };

  it('合法註冊成功，回 201 + token', async () => {
    const res = await api().post('/api/auth/register').send(validPayload);
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTypeOf('string');
    expect(res.body.user).toMatchObject({
      employeeNumber: validPayload.employeeNumber,
      name: validPayload.employeeName,
      role: 'General User',
    });
    expect(res.body.user.permissions['Attendance Record']).toBe(true);
  });

  it('員工編號重複回 409 EMPLOYEE_NUMBER_CONFLICT', async () => {
    const res = await api().post('/api/auth/register').send(validPayload);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMPLOYEE_NUMBER_CONFLICT');
  });

  it('缺欄位回 400 BAD_REQUEST', async () => {
    const res = await api().post('/api/auth/register').send({
      employeeNumber: `${TEST_EMP_NUMBER_PREFIX}${nowSuffix}-MISSING`,
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('BAD_REQUEST');
  });

  it('Email 格式錯誤回 400', async () => {
    const res = await api().post('/api/auth/register').send({
      employeeNumber: `${TEST_EMP_NUMBER_PREFIX}${nowSuffix}-EMAIL`,
      employeeName: 'Bad Email',
      employeeEmail: 'not-an-email',
      departmentAndSectionId: 1,
    });
    expect(res.status).toBe(400);
  });

  it('departmentAndSectionId 不存在回 400', async () => {
    const res = await api().post('/api/auth/register').send({
      employeeNumber: `${TEST_EMP_NUMBER_PREFIX}${nowSuffix}-DSID`,
      employeeName: 'Bad DSID',
      employeeEmail: `vitest-${nowSuffix}-bad@example.com`,
      departmentAndSectionId: 99999,
    });
    expect(res.status).toBe(400);
  });
});
