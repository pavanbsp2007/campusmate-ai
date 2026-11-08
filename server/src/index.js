const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const hpp = require('hpp');
require('dotenv').config();

const db = require('./db');
const { xssSanitizer, globalLimiter, corsOptions } = require('./middleware/security');

// Route imports
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const cgpaRoutes = require('./routes/cgpaRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const examRoutes = require('./routes/examRoutes');
const notesRoutes = require('./routes/notesRoutes');
const studyPlannerRoutes = require('./routes/studyPlannerRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Production Security Hardening Middleware ---
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows React SPA, Google Fonts, and Dicebear avatars
    frameguard: { action: 'deny' }, // Anti-Clickjacking: X-Frame-Options: DENY
    hidePoweredBy: true, // Removes X-Powered-By: Express to stop framework fingerprinting
    noSniff: true, // Prevents MIME type sniffing (X-Content-Type-Options: nosniff)
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
  })
);

app.use(compression());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Limit JSON payload to 10MB to prevent volumetric buffer DoS
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(hpp()); // Protect against HTTP Parameter Pollution
app.use(xssSanitizer); // Deep recursive input sanitization against XSS
app.use('/api', globalLimiter); // Protect API routes with global volumetric rate limiting

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint with uptime and memory metrics
app.get('/api/health', (req, res) => {
  const memoryUsage = process.memoryUsage();
  res.json({
    status: 'online',
    product: 'CampusMate AI',
    tagline: 'Study Smarter. Manage Better. Live Campus Life.',
    database: db.type,
    uptime: `${Math.floor(process.uptime())}s`,
    memory: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB / ${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
    timestamp: new Date().toISOString()
  });
});

// Mount Routes with protection
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/cgpa', cgpaRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/study-planner', studyPlannerRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

// In Production, serve React frontend static assets from client/dist
const fs = require('fs');
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[CampusMate Server Error]', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Initialize DB and Start Server
async function startServer() {
  try {
    await db.init();
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 CampusMate AI Server is running on http://localhost:${PORT}`);
      console.log(`🎓 Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📦 Database: ${db.type.toUpperCase()}`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
