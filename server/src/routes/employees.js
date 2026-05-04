import { Router } from 'express';
import { getPool } from '../config/db.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        EmployeeId,
        EmployeeName,
        EmployeeNumber,
        EmployeeDepartment,
        EmployeeSection
      FROM Employee
      WHERE IsAlive = 1
      ORDER BY EmployeeNumber
    `);

    return res.status(200).json({ data: result.recordset });
  } catch (error) {
    console.error('[EMPLOYEES] Query failed:', error.message);
    return res.status(500).json({
      error: { code: 'EMPLOYEES_QUERY_FAILED', message: 'Failed to fetch employees' },
    });
  }
});

export default router;
