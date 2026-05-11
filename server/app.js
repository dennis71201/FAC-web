import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import path from 'path';
import env from './src/config/env.js';
import { debugAuthStatus } from './src/middleware/auth.js';
import healthRouter from './src/routes/health.js';
import authRouter from './src/routes/auth.js';
import employeeSectionsRouter from './src/routes/employeeSections.js';
import employeesRouter from './src/routes/employees.js';
import attendanceRouter from './src/routes/attendance.js';
import homepageRouter from './src/routes/homepage.js';
import uploadsRouter from './src/routes/uploads.js';

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
app.use('/api', employeeSectionsRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/homepage', homepageRouter);
app.use('/api/uploads', uploadsRouter);

// 靜態檔服務：上傳的圖片/影片（正式環境由 IIS Virtual Directory 提供）
const uploadsDir = path.resolve(process.cwd(), 'uploads');
app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(uploadsDir)
);

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
