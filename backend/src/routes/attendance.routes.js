const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET /api/attendance/my-summary - Student: Attendance overview and date-wise log
router.get('/my-summary', authenticateToken, requireRole('student'), (req, res) => {
  try {
    const studentId = req.user.id;

    // Get all records for this student sorted by date descending
    const records = db.prepare(`
      SELECT id, date, status, class_name
      FROM attendance
      WHERE student_id = ?
      ORDER BY date DESC
    `).all(studentId);

    const totalClasses = records.length;
    const presentCount = records.filter(r => r.status === 'Present').length;
    const absentCount = totalClasses - presentCount;
    const percentage = totalClasses > 0 ? Number(((presentCount / totalClasses) * 100).toFixed(1)) : 100;
    const isBelowThreshold = percentage < 75.0;

    res.json({
      success: true,
      summary: {
        totalClasses,
        presentCount,
        absentCount,
        percentage,
        isBelowThreshold,
        threshold: 75.0
      },
      records
    });
  } catch (error) {
    console.error('Fetch student attendance error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve attendance records.' });
  }
});

// GET /api/attendance/class-sheet - Faculty: Get roster and existing marks for a class & date
router.get('/class-sheet', authenticateToken, requireRole('faculty'), (req, res) => {
  try {
    const { class_name, date } = req.query;

    if (!class_name || !date) {
      return res.status(400).json({
        success: false,
        message: 'Both class_name and date query parameters are required.'
      });
    }

    const formattedClass = class_name.trim().toUpperCase();

    // Fetch all enrolled students in this class
    const students = db.prepare(`
      SELECT id, name, roll_no, class_name, email
      FROM users
      WHERE role = 'student' AND class_name = ?
      ORDER BY roll_no ASC, name ASC
    `).all(formattedClass);

    // Fetch any existing attendance records for this class & date
    const attendanceRecords = db.prepare(`
      SELECT student_id, status
      FROM attendance
      WHERE class_name = ? AND date = ?
    `).all(formattedClass, date);

    const statusMap = {};
    attendanceRecords.forEach(r => { statusMap[r.student_id] = r.status; });

    const isAlreadySaved = attendanceRecords.length > 0;

    const roster = students.map(student => ({
      ...student,
      status: statusMap[student.id] || null // null means unmarked yet
    }));

    // Calculate present and absent counts
    const presentCount = roster.filter(s => s.status === 'Present').length;
    const absentCount = roster.filter(s => s.status === 'Absent').length;
    const unmarkedCount = roster.filter(s => s.status === null).length;

    res.json({
      success: true,
      class_name: formattedClass,
      date,
      isAlreadySaved,
      summary: {
        totalStudents: students.length,
        presentCount,
        absentCount,
        unmarkedCount
      },
      roster
    });
  } catch (error) {
    console.error('Fetch class attendance sheet error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve attendance sheet.' });
  }
});

// POST /api/attendance/mark - Faculty: Save or update attendance records
router.post('/mark', authenticateToken, requireRole('faculty'), (req, res) => {
  try {
    const { class_name, date, records } = req.body;

    if (!class_name || !date || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'class_name, date, and a non-empty records array are required.'
      });
    }

    const formattedClass = class_name.trim().toUpperCase();

    // Validate statuses
    for (const rec of records) {
      if (!rec.student_id || !['Present', 'Absent'].includes(rec.status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid attendance status for student ID ${rec.student_id}. Must be "Present" or "Absent".`
        });
      }
    }

    // Use a transaction for atomic write
    const saveAttendance = db.transaction((recordsToSave) => {
      const upsertStmt = db.prepare(`
        INSERT INTO attendance (student_id, class_name, date, status)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(student_id, date) DO UPDATE SET
          status = excluded.status,
          class_name = excluded.class_name
      `);

      for (const rec of recordsToSave) {
        upsertStmt.run(rec.student_id, formattedClass, date, rec.status);
      }
    });

    saveAttendance(records);

    // Calculate summary
    const presentCount = records.filter(r => r.status === 'Present').length;
    const absentCount = records.filter(r => r.status === 'Absent').length;

    res.json({
      success: true,
      message: `Attendance for ${formattedClass} on ${date} saved successfully.`,
      summary: {
        total: records.length,
        presentCount,
        absentCount
      }
    });
  } catch (error) {
    console.error('Save attendance error:', error);
    res.status(500).json({ success: false, message: 'Failed to save attendance.' });
  }
});

module.exports = router;
