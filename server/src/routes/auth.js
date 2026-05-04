import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { SignJWT } from 'jose';
import env from '../config/env.js';
import { getPool } from '../config/db.js';

const router = Router();
const JWT_SECRET = new TextEncoder().encode(env.JWT_SECRET);

const identifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many identify attempts, please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parsePermissions(permissionValue) {
  if (!permissionValue) {
    return {};
  }
  if (typeof permissionValue === 'object') {
    return permissionValue;
  }
  try {
    return JSON.parse(permissionValue);
  } catch {
    return {};
  }
}

async function buildAuthResponse(employee, role, permissions) {
  const token = await new SignJWT({
    employeeId: employee.EmployeeId,
    employeeNumber: employee.EmployeeNumber,
    role,
    permissions,
    name: employee.EmployeeName,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(JWT_SECRET);

  return {
    token,
    user: {
      employeeId: employee.EmployeeId,
      employeeNumber: employee.EmployeeNumber,
      name: employee.EmployeeName,
      role,
      permissions,
    },
  };
}

router.post('/identify', identifyLimiter, async (req, res) => {
  try {
    const employeeNumber = String(req.body?.employeeNumber || '').trim();
    if (!employeeNumber) {
      return res.status(400).json({
        error: { code: 'BAD_REQUEST', message: 'employeeNumber is required' },
      });
    }

    const pool = await getPool();
    const employeeResult = await pool
      .request()
      .input('employeeNumber', employeeNumber)
      .query(`
        SELECT TOP 1
          EmployeeId,
          EmployeeName,
          EmployeeNumber,
          IsAlive
        FROM Employee
        WHERE EmployeeNumber = @employeeNumber
      `);

    if (!employeeResult.recordset.length || !employeeResult.recordset[0].IsAlive) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Employee not found or inactive' },
      });
    }

    const employee = employeeResult.recordset[0];
    const permissionResult = await pool
      .request()
      .input('employeeId', employee.EmployeeId)
      .query(`
        SELECT TOP 1 Role, Permission
        FROM EmployeePermission
        WHERE EmployeeId = @employeeId
      `);

    const permissionRow = permissionResult.recordset[0] || null;
    const permissions = parsePermissions(permissionRow?.Permission);
    const role = permissionRow?.Role || 'General User';

    if (!permissionRow) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Permission record not found for employee',
        },
      });
    }

    const response = await buildAuthResponse(employee, role, permissions);
    return res.status(200).json(response);
  } catch (error) {
    console.error('[AUTH] Identify failed:', error.message);
    return res.status(500).json({
      error: { code: 'IDENTIFY_FAILED', message: 'Failed to identify employee' },
    });
  }
});

router.post('/register', identifyLimiter, async (req, res) => {
  const employeeNumber = String(req.body?.employeeNumber || '').trim();
  const employeeName = String(req.body?.employeeName || '').trim();
  const employeeEmail = String(req.body?.employeeEmail || '').trim();
  const departmentAndSectionId = Number(req.body?.departmentAndSectionId);

  if (!employeeNumber || !employeeName || !employeeEmail || !departmentAndSectionId) {
    return res.status(400).json({
      error: { code: 'BAD_REQUEST', message: 'employeeNumber, employeeName, employeeEmail, departmentAndSectionId are required' },
    });
  }

  if (!EMAIL_PATTERN.test(employeeEmail)) {
    return res.status(400).json({
      error: { code: 'BAD_REQUEST', message: 'employeeEmail format is invalid' },
    });
  }

  try {
    const pool = await getPool();

    const existingEmployee = await pool
      .request()
      .input('employeeNumber', employeeNumber)
      .query(`
        SELECT TOP 1 EmployeeId
        FROM Employee
        WHERE EmployeeNumber = @employeeNumber
      `);

    if (existingEmployee.recordset.length > 0) {
      return res.status(409).json({
        error: { code: 'EMPLOYEE_NUMBER_CONFLICT', message: 'EmployeeNumber already exists' },
      });
    }

    const dsResult = await pool
      .request()
      .input('departmentAndSectionId', departmentAndSectionId)
      .query(`
        SELECT TOP 1 DepartmentAndSectionId, DepartmentName, SectionName
        FROM DepartmentAndSection
        WHERE DepartmentAndSectionId = @departmentAndSectionId
      `);

    if (!dsResult.recordset.length) {
      return res.status(400).json({
        error: { code: 'BAD_REQUEST', message: 'departmentAndSectionId is invalid' },
      });
    }

    const mapping = dsResult.recordset[0];
    const permissionJson = JSON.stringify({ 'Attendance Record': true });

    const insertResult = await pool
      .request()
      .input('employeeName', employeeName)
      .input('employeeNumber', employeeNumber)
      .input('employeeEmail', employeeEmail)
      .input('employeeDepartment', mapping.DepartmentName)
      .input('employeeSection', mapping.SectionName)
      .input('departmentAndSectionId', mapping.DepartmentAndSectionId)
      .query(`
        INSERT INTO Employee (
          EmployeeName,
          EmployeeNumber,
          EmployeeEmail,
          EmployeeDepartment,
          EmployeeSection,
          DepartmentAndSectionId,
          CreateTime,
          IsAlive
        )
        OUTPUT INSERTED.EmployeeId, INSERTED.EmployeeName, INSERTED.EmployeeNumber
        VALUES (
          @employeeName,
          @employeeNumber,
          @employeeEmail,
          @employeeDepartment,
          @employeeSection,
          @departmentAndSectionId,
          SYSDATETIME(),
          1
        )
      `);

    const insertedEmployee = insertResult.recordset[0];

    await pool
      .request()
      .input('employeeId', insertedEmployee.EmployeeId)
      .input('role', 'General User')
      .input('permission', permissionJson)
      .query(`
        INSERT INTO EmployeePermission (EmployeeId, Role, Permission)
        VALUES (@employeeId, @role, @permission)
      `);

    const response = await buildAuthResponse(insertedEmployee, 'General User', { 'Attendance Record': true });
    return res.status(201).json(response);
  } catch (error) {
    console.error('[AUTH] Register failed:', error.message);
    return res.status(500).json({
      error: { code: 'REGISTER_FAILED', message: 'Failed to register employee' },
    });
  }
});

export default router;
