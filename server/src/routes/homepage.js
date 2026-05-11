import { Router } from 'express';
import sql from 'mssql';
import { getPool } from '../config/db.js';
import { verifyToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

const DEFAULT_LAYOUT = { blocks: [], layout: [] };

// 取得目前首頁版面（所有登入者皆可讀）
router.get('/', verifyToken, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT TOP 1
        HomePageLayoutId,
        LayoutJson,
        UpdatedBy,
        UpdatedAt
      FROM HomePageLayout
      ORDER BY HomePageLayoutId
    `);

    if (!result.recordset.length) {
      return res.status(200).json({
        data: {
          layout: DEFAULT_LAYOUT,
          updatedBy: null,
          updatedAt: null,
        },
      });
    }

    const row = result.recordset[0];
    let layoutData = DEFAULT_LAYOUT;
    try {
      layoutData = JSON.parse(row.LayoutJson);
    } catch (parseError) {
      console.error('[HOMEPAGE] LayoutJson parse failed:', parseError.message);
    }

    return res.status(200).json({
      data: {
        layout: layoutData,
        updatedBy: row.UpdatedBy,
        updatedAt: row.UpdatedAt,
      },
    });
  } catch (error) {
    console.error('[HOMEPAGE] Get layout failed:', error.message);
    return res.status(500).json({
      error: { code: 'HOMEPAGE_GET_FAILED', message: 'Failed to fetch home page layout' },
    });
  }
});

// 更新首頁版面（僅管理者）
router.put('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const layout = req.body?.layout;
    if (!layout || typeof layout !== 'object') {
      return res.status(400).json({
        error: { code: 'BAD_REQUEST', message: 'layout payload is required' },
      });
    }

    const layoutJson = JSON.stringify(layout);
    const pool = await getPool();

    // 確保至少有一筆，更新最早一筆作為全公司共用版面
    const existing = await pool.request().query(`
      SELECT TOP 1 HomePageLayoutId FROM HomePageLayout ORDER BY HomePageLayoutId
    `);

    if (!existing.recordset.length) {
      await pool
        .request()
        .input('layoutJson', sql.NVarChar(sql.MAX), layoutJson)
        .input('updatedBy', sql.Int, req.user.employeeId)
        .query(`
          INSERT INTO HomePageLayout (LayoutJson, UpdatedBy, UpdatedAt)
          VALUES (@layoutJson, @updatedBy, SYSDATETIME())
        `);
    } else {
      await pool
        .request()
        .input('id', sql.Int, existing.recordset[0].HomePageLayoutId)
        .input('layoutJson', sql.NVarChar(sql.MAX), layoutJson)
        .input('updatedBy', sql.Int, req.user.employeeId)
        .query(`
          UPDATE HomePageLayout
          SET LayoutJson = @layoutJson,
              UpdatedBy = @updatedBy,
              UpdatedAt = SYSDATETIME()
          WHERE HomePageLayoutId = @id
        `);
    }

    return res.status(200).json({
      data: { ok: true },
    });
  } catch (error) {
    console.error('[HOMEPAGE] Update layout failed:', error.message);
    return res.status(500).json({
      error: { code: 'HOMEPAGE_UPDATE_FAILED', message: 'Failed to update home page layout' },
    });
  }
});

export default router;
