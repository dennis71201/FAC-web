import { Router } from 'express';
import sql from 'mssql';
import { getPool } from '../config/db.js';
import { verifyToken } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permission.js';

const router = Router();

function isAdmin(user) {
  return user?.role === 'Administrator';
}

router.get('/types', verifyToken, requirePermission('Attendance Record'), async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        AttendanceTypeId,
        AttendanceTypeName,
        AttendanceTypeColor
      FROM AttendanceType
      ORDER BY AttendanceTypeId
    `);

    return res.status(200).json({ data: result.recordset });
  } catch (error) {
    console.error('[ATTENDANCE] Types query failed:', error.message);
    return res.status(500).json({
      error: { code: 'ATTENDANCE_TYPES_QUERY_FAILED', message: 'Failed to fetch attendance types' },
    });
  }
});

router.get('/records', verifyToken, requirePermission('Attendance Record'), async (req, res) => {
  try {
    const pool = await getPool();
    const requestedEmployeeId = req.query.employeeId ? Number(req.query.employeeId) : null;
    const queryEmployeeId = requestedEmployeeId || null;
    const year = req.query.year ? Number(req.query.year) : null;
    const month = req.query.month ? Number(req.query.month) : null;

    const request = pool.request();
    let whereClause = `
      WHERE ar.IsAlive = 1
        AND e.IsAlive = 1
    `;

    if (queryEmployeeId) {
      whereClause += ' AND ar.EmployeeId = @employeeId';
      request.input('employeeId', sql.Int, queryEmployeeId);
    }

    if (year) {
      whereClause += ' AND YEAR(ar.StartTime) = @year';
      request.input('year', sql.Int, year);
    }

    if (month) {
      whereClause += ' AND MONTH(ar.StartTime) = @month';
      request.input('month', sql.Int, month);
    }

    const result = await request.query(`
      SELECT
        ar.AttendanceRecordId,
        ar.EmployeeId,
        e.EmployeeName,
        e.EmployeeDepartment,
        e.EmployeeSection,
        ar.AttendanceTypeId,
        t.AttendanceTypeName,
        t.AttendanceTypeColor,
        ar.StartTime,
        ar.EndTime,
        ar.Note,
        ar.IsAllDay,
        ar.IsAlive
      FROM AttendanceRecord ar
      INNER JOIN Employee e ON ar.EmployeeId = e.EmployeeId
      INNER JOIN AttendanceType t ON ar.AttendanceTypeId = t.AttendanceTypeId
      ${whereClause}
      ORDER BY ar.StartTime DESC, ar.AttendanceRecordId DESC
    `);

    return res.status(200).json({ data: result.recordset });
  } catch (error) {
    console.error('[ATTENDANCE] Records query failed:', error.message);
    return res.status(500).json({
      error: { code: 'ATTENDANCE_RECORDS_QUERY_FAILED', message: 'Failed to fetch attendance records' },
    });
  }
});

router.post('/records', verifyToken, requirePermission('Attendance Record'), async (req, res) => {
  try {
    const employeeId = Number(req.body?.employeeId);
    const attendanceTypeId = Number(req.body?.attendanceTypeId);
    const startTime = req.body?.startTime;
    const endTime = req.body?.endTime;
    const note = req.body?.note ?? null;
    const isAllDay = Boolean(req.body?.isAllDay);

    if (!employeeId || !attendanceTypeId || !startTime || !endTime) {
      return res.status(400).json({
        error: { code: 'BAD_REQUEST', message: 'employeeId, attendanceTypeId, startTime, endTime are required' },
      });
    }

    if (!isAdmin(req.user) && employeeId !== req.user.employeeId) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'General User can only create own records' },
      });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input('employeeId', sql.Int, employeeId)
      .input('attendanceTypeId', sql.Int, attendanceTypeId)
      .input('startTime', sql.DateTime2, new Date(startTime))
      .input('endTime', sql.DateTime2, new Date(endTime))
      .input('note', sql.NVarChar(500), note)
      .input('isAllDay', sql.Bit, isAllDay)
      .query(`
        INSERT INTO AttendanceRecord (
          EmployeeId,
          AttendanceTypeId,
          StartTime,
          EndTime,
          Note,
          IsAllDay,
          IsAlive
        )
        OUTPUT INSERTED.AttendanceRecordId
        VALUES (
          @employeeId,
          @attendanceTypeId,
          @startTime,
          @endTime,
          @note,
          @isAllDay,
          1
        )
      `);

    return res.status(201).json({
      data: {
        attendanceRecordId: result.recordset[0].AttendanceRecordId,
      },
    });
  } catch (error) {
    console.error('[ATTENDANCE] Record create failed:', error.message);
    return res.status(500).json({
      error: { code: 'ATTENDANCE_RECORD_CREATE_FAILED', message: 'Failed to create attendance record' },
    });
  }
});

router.delete('/records/:id', verifyToken, requirePermission('Attendance Record'), async (req, res) => {
  try {
    const attendanceRecordId = Number(req.params.id);
    if (!attendanceRecordId) {
      return res.status(400).json({
        error: { code: 'BAD_REQUEST', message: 'Invalid attendance record id' },
      });
    }

    const pool = await getPool();

    if (!isAdmin(req.user)) {
      const ownership = await pool
        .request()
        .input('attendanceRecordId', sql.Int, attendanceRecordId)
        .query(`
          SELECT TOP 1 EmployeeId
          FROM AttendanceRecord
          WHERE AttendanceRecordId = @attendanceRecordId
        `);

      if (!ownership.recordset.length) {
        return res.status(404).json({
          error: { code: 'NOT_FOUND', message: 'Attendance record not found' },
        });
      }

      if (ownership.recordset[0].EmployeeId !== req.user.employeeId) {
        return res.status(403).json({
          error: { code: 'FORBIDDEN', message: 'General User can only delete own records' },
        });
      }
    }

    const updateResult = await pool
      .request()
      .input('attendanceRecordId', sql.Int, attendanceRecordId)
      .query(`
        UPDATE AttendanceRecord
        SET IsAlive = 0
        WHERE AttendanceRecordId = @attendanceRecordId
          AND IsAlive = 1
      `);

    if (updateResult.rowsAffected[0] === 0) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Attendance record not found or already deleted' },
      });
    }

    return res.status(200).json({ data: { attendanceRecordId, isAlive: 0 } });
  } catch (error) {
    console.error('[ATTENDANCE] Record soft-delete failed:', error.message);
    return res.status(500).json({
      error: { code: 'ATTENDANCE_RECORD_DELETE_FAILED', message: 'Failed to soft-delete attendance record' },
    });
  }
});

export default router;
