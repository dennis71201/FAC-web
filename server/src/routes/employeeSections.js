import { Router } from 'express';
import { getPool } from '../config/db.js';

const router = Router();

router.get('/employee-sections', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        EmployeeSectionId,
        SectionName,
        SystemName
      FROM EmployeeSection
      ORDER BY EmployeeSectionId
    `);

    return res.status(200).json({ data: result.recordset });
  } catch (error) {
    console.error('[EMPLOYEE-SECTIONS] Query failed:', error.message);
    return res.status(500).json({
      error: { code: 'EMPLOYEE_SECTIONS_QUERY_FAILED', message: 'Failed to fetch employee sections' },
    });
  }
});

export default router;
