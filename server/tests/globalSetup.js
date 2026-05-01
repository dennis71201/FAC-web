import { getPool, closePool } from '../src/config/db.js';

export async function setup() {
  const pool = await getPool();
  await pool.request().query(`
    DELETE FROM AttendanceRecord WHERE Note LIKE '__VITEST__%'
  `);
  await pool.request().query(`
    DELETE ep
    FROM EmployeePermission ep
    INNER JOIN Employee e ON ep.EmployeeId = e.EmployeeId
    WHERE e.EmployeeNumber LIKE 'VITEST-%'
  `);
  await pool.request().query(`
    DELETE FROM Employee WHERE EmployeeNumber LIKE 'VITEST-%'
  `);
  await closePool();
}

export async function teardown() {
  await closePool();
}
