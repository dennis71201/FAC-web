import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import env from './src/config/env.js';
import { debugAuthStatus } from './src/middleware/auth.js';
import healthRouter from './src/routes/health.js';
import authRouter from './src/routes/auth.js';
import departmentsSectionsRouter from './src/routes/departmentsSections.js';
import employeesRouter from './src/routes/employees.js';
import attendanceRouter from './src/routes/attendance.js';

const app = express();

// Logging middleware
app.use(
  pinoHttp({
    level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  })
);

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: '*', // TODO: restrict in production
    credentials: false,
  })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Debug auth status (dev only)
app.use(debugAuthStatus);

// Routes
app.use('/api', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api', departmentsSectionsRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/attendance', attendanceRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.path} not found` },
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[APP] Unhandled error:', err);
  res.status(err.status || 500).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'Internal server error',
    },
  });
});

export default app;
