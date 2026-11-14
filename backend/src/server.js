require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Ensure database and tables are initialized
require('./config/db');

const authRoutes = require('./routes/auth.routes');
const timetableRoutes = require('./routes/timetable.routes');
const itemsRoutes = require('./routes/items.routes');
const complaintsRoutes = require('./routes/complaints.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const eventsRoutes = require('./routes/events.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const statsRoutes = require('./routes/stats.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true, // Allow frontend dev server
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads folder exists and serve statically
const uploadsDir = process.env.VERCEL
  ? path.join('/tmp', 'uploads')
  : path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// In Vercel serverless environment, copy bundled seed uploads to /tmp/uploads
if (process.env.VERCEL) {
  const bundledUploadsDir = path.join(__dirname, '../uploads');
  if (fs.existsSync(bundledUploadsDir)) {
    try {
      const files = fs.readdirSync(bundledUploadsDir);
      for (const file of files) {
        const destPath = path.join(uploadsDir, file);
        if (!fs.existsSync(destPath)) {
          fs.copyFileSync(path.join(bundledUploadsDir, file), destPath);
        }
      }
    } catch (err) {
      console.warn('[Uploads] Error copying bundled uploads to /tmp:', err.message);
    }
  }
}

app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/complaints', complaintsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/stats', statsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'Smart Campus Solutions API',
    edition: 'CEC-HACKSTORM-2026',
    timestamp: new Date().toISOString()
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found.`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error occurred.'
  });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(` Smart Campus Solutions API Server running on port ${PORT}`);
    console.log(` Static uploads served at: http://localhost:${PORT}/uploads`);
    console.log(` Health check: http://localhost:${PORT}/api/health`);
    console.log(`===================================================`);
  });
}

module.exports = app;
