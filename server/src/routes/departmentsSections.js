import { Router } from 'express';
import { getPool } from '../config/db.js';

const router = Router();

router.get('/departments-sections', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        DepartmentAndSectionId,
        DepartmentName,
        SectionName
      FROM DepartmentAndSection
      ORDER BY DepartmentAndSectionId
    `);

    return res.status(200).json({ data: result.recordset });
  } catch (error) {
    console.error('[DEPARTMENTS-SECTIONS] Query failed:', error.message);
    return res.status(500).json({
      error: { code: 'DEPARTMENTS_SECTIONS_QUERY_FAILED', message: 'Failed to fetch departments and sections' },
    });
  }
});

export default router;
