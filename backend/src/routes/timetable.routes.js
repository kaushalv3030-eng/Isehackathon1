const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// Student: Get timetable for their assigned class
router.get('/my-class', authenticateToken, (req, res) => {
  try {
    const className = req.user.class_name;
    if (!className) {
      return res.status(400).json({
        success: false,
        message: 'No class assigned to your student profile.'
      });
    }

    const timetable = db.prepare('SELECT * FROM timetables WHERE class_name = ?').get(className);
    if (!timetable) {
      return res.json({
        success: true,
        timetable: null,
        message: `No timetable uploaded yet for class ${className}.`
      });
    }

    res.json({
      success: true,
      timetable
    });
  } catch (error) {
    console.error('Fetch student timetable error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve timetable.' });
  }
});

// Any authenticated user or faculty: Get timetable by class name
router.get('/class/:className', authenticateToken, (req, res) => {
  try {
    const { className } = req.params;
    const timetable = db.prepare('SELECT * FROM timetables WHERE class_name = ?').get(className.toUpperCase());

    res.json({
      success: true,
      timetable: timetable || null
    });
  } catch (error) {
    console.error('Fetch class timetable error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve timetable.' });
  }
});

// Faculty: Get list of all uploaded timetables
router.get('/all', authenticateToken, requireRole('faculty'), (req, res) => {
  try {
    const timetables = db.prepare('SELECT * FROM timetables ORDER BY class_name ASC').all();
    res.json({ success: true, timetables });
  } catch (error) {
    console.error('Fetch all timetables error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve timetables.' });
  }
});

// Faculty: Upload or replace timetable image for a class
router.post('/upload', authenticateToken, requireRole('faculty'), upload.single('image'), (req, res) => {
  try {
    const { class_name } = req.body;

    if (!class_name) {
      return res.status(400).json({ success: false, message: 'Class name is required.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a timetable image.' });
    }

    const formattedClass = class_name.trim().toUpperCase();
    const relativeImagePath = `/uploads/${req.file.filename}`;

    // Check if an existing timetable exists to clean up old image if needed
    const existing = db.prepare('SELECT * FROM timetables WHERE class_name = ?').get(formattedClass);

    if (existing) {
      // Update existing record
      db.prepare(`
        UPDATE timetables 
        SET image_path = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE class_name = ?
      `).run(relativeImagePath, formattedClass);

      // Attempt to clean up old file
      if (existing.image_path) {
        const oldFile = path.join(__dirname, '../../', existing.image_path);
        if (fs.existsSync(oldFile)) {
          try { fs.unlinkSync(oldFile); } catch (e) { /* ignore cleanup error */ }
        }
      }
    } else {
      // Insert new record
      db.prepare(`
        INSERT INTO timetables (class_name, image_path, updated_at) 
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `).run(formattedClass, relativeImagePath);
    }

    // Notify all students in this class about timetable update
    const students = db.prepare("SELECT id FROM users WHERE role = 'student' AND class_name = ?").all(formattedClass);
    const insertNotif = db.prepare("INSERT INTO notifications (user_id, message, type) VALUES (?, ?, 'timetable')");
    const updateMsg = `Timetable for ${formattedClass} has been updated by faculty.`;

    for (const student of students) {
      insertNotif.run(student.id, updateMsg);
    }

    const updated = db.prepare('SELECT * FROM timetables WHERE class_name = ?').get(formattedClass);

    res.json({
      success: true,
      message: `Timetable for ${formattedClass} saved successfully.`,
      timetable: updated
    });
  } catch (error) {
    console.error('Timetable upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload timetable.' });
  }
});

module.exports = router;
