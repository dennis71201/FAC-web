import request from 'supertest';
import sql from 'mssql';
import app from '../app.js';
import { getPool } from '../src/config/db.js';

export const TEST_NOTE_PREFIX = '__VITEST__';
export const TEST_EMP_NUMBER_PREFIX = 'VITEST-';

export const TEST_USERS = {
  admin: { employeeNumber: 'FAC-001', name: '王小明', role: 'Administrator' },
  general: { employeeNumber: 'FAC-002', name: '李大華', role: 'General User' },
  noPermission: { employeeNumber: 'FAC-003', name: '陳志偉', role: 'General User' },
  inactive: { employeeNumber: 'FAC-010', name: '鄭國輝' },
};

export const api = () => request(app);

const tokenCache = new Map();

export async function getToken(employeeNumber) {
  if (tokenCache.has(employeeNumber)) {
    return tokenCache.get(employeeNumber);
  }
  const res = await api().post('/api/auth/identify').send({ employeeNumber });
  if (res.status !== 200 || !res.body.token) {
    throw new Error(
      `Failed to obtain token for ${employeeNumber}: ${res.status} ${JSON.stringify(res.body)}`
    );
  }
  tokenCache.set(employeeNumber, res.body.token);
  return res.body.token;
}

export async function getUserContext(employeeNumber) {
  const token = await getToken(employeeNumber);
  const res = await api().post('/api/auth/identify').send({ employeeNumber });
  return { token, user: res.body.user };
}

export function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

export async function cleanupTestAttendance() {
  const pool = await getPool();
  await pool.request().query(`
    DELETE FROM AttendanceRecord
    WHERE Note LIKE '${TEST_NOTE_PREFIX}%'
  `);
}

export async function cleanupTestEmployees() {
  const pool = await getPool();
  await pool.request().query(`
    DELETE ep
    FROM EmployeePermission ep
    INNER JOIN Employee e ON ep.EmployeeId = e.EmployeeId
    WHERE e.EmployeeNumber LIKE '${TEST_EMP_NUMBER_PREFIX}%'
  `);
  await pool.request().query(`
    DELETE FROM Employee
    WHERE EmployeeNumber LIKE '${TEST_EMP_NUMBER_PREFIX}%'
  `);
}

export async function insertAttendanceRecord({
  employeeId,
  attendanceTypeId = 2,
  startTime,
  endTime,
  note,
  isAllDay = true,
}) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('employeeId', sql.Int, employeeId)
    .input('attendanceTypeId', sql.Int, attendanceTypeId)
    .input('startTime', sql.DateTime2, new Date(startTime))
    .input('endTime', sql.DateTime2, new Date(endTime))
    .input('note', sql.NVarChar(500), `${TEST_NOTE_PREFIX}${note || ''}`)
    .input('isAllDay', sql.Bit, isAllDay ? 1 : 0)
    .query(`
      INSERT INTO AttendanceRecord
        (EmployeeId, AttendanceTypeId, StartTime, EndTime, Note, IsAllDay, IsAlive)
      OUTPUT INSERTED.AttendanceRecordId
      VALUES (@employeeId, @attendanceTypeId, @startTime, @endTime, @note, @isAllDay, 1)
    `);
  return result.recordset[0].AttendanceRecordId;
}

export function clearTokenCache() {
  tokenCache.clear();
}
