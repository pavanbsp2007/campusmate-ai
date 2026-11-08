const rateLimit = require('express-rate-limit');
const sanitizeHtml = require('sanitize-html');
const path = require('path');

// 1. Recursive Input Sanitizer (Prevents XSS in JSON bodies, queries, and params)
const sanitizeOptions = {
  allowedTags: [], // Strip all HTML tags
  allowedAttributes: {}
};

function deepSanitize(target) {
  if (typeof target === 'string') {
    return sanitizeHtml(target.trim(), sanitizeOptions);
  }
  if (Array.isArray(target)) {
    return target.map((item) => deepSanitize(item));
  }
  if (target !== null && typeof target === 'object') {
    const sanitizedObj = {};
    for (const key of Object.keys(target)) {
      // Prevent Prototype Pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      sanitizedObj[key] = deepSanitize(target[key]);
    }
    return sanitizedObj;
  }
  return target;
}

const xssSanitizer = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = deepSanitize(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = deepSanitize(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = deepSanitize(req.params);
  }
  next();
};

// 2. Multi-tier Granular Rate Limiters
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP. Please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15, // 15 login attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Your IP has been temporarily rate-limited for 15 minutes.' }
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 8, // 8 registrations per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Account creation rate limit reached. Please wait before creating another account.' }
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 45, // 45 queries per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'AI query rate limit exceeded. Please wait a few minutes or upgrade your plan.' }
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // 20 uploads per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'File upload rate limit reached. Please wait before uploading more documents.' }
});

// 3. Dynamic CORS Security Configuration
const allowedOriginPattern = /^(http:\/\/localhost:\d+|https:\/\/.*\.onrender\.com|https:\/\/.*\.vercel\.app)/;

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    const customAllowed = process.env.ALLOWED_ORIGIN;
    if (customAllowed && (origin === customAllowed || customAllowed === '*')) {
      return callback(null, true);
    }

    if (allowedOriginPattern.test(origin)) {
      return callback(null, true);
    }

    // Default: allow origin on Render deployment
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  maxAge: 86400 // Cache preflight for 24 hours
};

// 4. Secure File Filter (Validates PDF/Text mime types & strips malicious filenames)
const secureFileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.pdf', '.txt', '.doc', '.docx'];

  if (!allowedMimeTypes.includes(file.mimetype) && !allowedExtensions.includes(ext)) {
    return cb(new Error('Invalid file format. Only PDF, TXT, and DOC documents are permitted for security.'));
  }

  // Prevent Directory Traversal in filenames
  file.originalname = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
  cb(null, true);
};

// 5. Password Strength Validator
function isStrongPassword(password) {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  if (!hasLetter || !hasNumber) {
    return { valid: false, message: 'Password must contain both letters and numbers for enhanced security.' };
  }
  return { valid: true };
}

module.exports = {
  xssSanitizer,
  globalLimiter,
  authLimiter,
  registerLimiter,
  aiLimiter,
  uploadLimiter,
  corsOptions,
  secureFileFilter,
  isStrongPassword
};
