import { Router } from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { verifyToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const ALLOWED_IMAGE_MIME = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_MIME = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_MIME = [...ALLOWED_IMAGE_MIME, ...ALLOWED_VIDEO_MIME];

// 預防濫用的硬上限（500MB），實際容量超過後端會回傳警告但仍接受
const HARD_MAX_BYTES = 500 * 1024 * 1024;
const SOFT_WARN_IMAGE_BYTES = 5 * 1024 * 1024;
const SOFT_WARN_VIDEO_BYTES = 100 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const id = crypto.randomBytes(16).toString('hex');
    cb(null, `${Date.now()}-${id}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: HARD_MAX_BYTES },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      return cb(new Error('UNSUPPORTED_MIME'));
    }
    return cb(null, true);
  },
});

// 上傳頻率限制：1 分鐘 10 次 / IP，作為傳輸速度節流
const uploadRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Upload rate limit exceeded',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', uploadRateLimiter, verifyToken, requireAdmin, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.message === 'UNSUPPORTED_MIME') {
        return res.status(400).json({
          error: { code: 'UNSUPPORTED_MIME', message: 'Unsupported file type' },
        });
      }
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          error: {
            code: 'FILE_TOO_LARGE',
            message: `File exceeds hard limit (${HARD_MAX_BYTES} bytes)`,
          },
        });
      }
      console.error('[UPLOADS] Upload failed:', err.message);
      return next(err);
    }

    if (!req.file) {
      return res.status(400).json({
        error: { code: 'BAD_REQUEST', message: 'file field is required' },
      });
    }

    const isImage = ALLOWED_IMAGE_MIME.includes(req.file.mimetype);
    const isVideo = ALLOWED_VIDEO_MIME.includes(req.file.mimetype);
    const oversized =
      (isImage && req.file.size > SOFT_WARN_IMAGE_BYTES) ||
      (isVideo && req.file.size > SOFT_WARN_VIDEO_BYTES);

    return res.status(201).json({
      data: {
        url: `/uploads/${req.file.filename}`,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        warning: oversized
          ? '檔案較大，可能影響載入速度，建議壓縮後再上傳'
          : null,
      },
    });
  });
});

export default router;
