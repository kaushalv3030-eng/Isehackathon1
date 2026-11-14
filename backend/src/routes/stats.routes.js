const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET /api/stats/faculty-overview - Faculty metrics overview
router.get('/faculty-overview', authenticateToken, requireRole('faculty'), (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Counts
    const pendingComplaintsCount = db.prepare(`
      SELECT COUNT(*) as count FROM complaints WHERE status = 'Pending'
    `).get().count;

    const inProgressComplaintsCount = db.prepare(`
      SELECT COUNT(*) as count FROM complaints WHERE status = 'In Progress'
    `).get().count;

    const pendingClaimsCount = db.prepare(`
      SELECT COUNT(*) as count FROM claims WHERE status = 'Pending'
    `).get().count;

    const totalLostFoundCount = db.prepare(`
      SELECT COUNT(*) as count FROM items
    `).get().count;

    // Today's attendance status
    const todayAttendance = db.prepare(`
      SELECT 
        COUNT(DISTINCT class_name) as marked_classes,
        SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present_count,
        SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent_count,
        COUNT(*) as total_recorded
      FROM attendance
      WHERE date = ?
    `).get(today);

    // Upcoming events count
    const upcomingEventsCount = db.prepare(`
      SELECT COUNT(*) as count FROM events WHERE date >= ?
    `).get(today).count;

    // Recent items for quick preview
    const recentComplaints = db.prepare(`
      SELECT complaints.id, complaints.title, complaints.category, complaints.status, complaints.created_at,
             users.name as student_name, users.class_name as student_class
      FROM complaints
      JOIN users ON complaints.student_id = users.id
      ORDER BY complaints.created_at DESC
      LIMIT 5
    `).all();

    const recentClaims = db.prepare(`
      SELECT claims.id, claims.status, claims.created_at,
             items.name as item_name, items.type as item_type,
             users.name as student_name, users.roll_no as student_roll
      FROM claims
      JOIN items ON claims.item_id = items.id
      JOIN users ON claims.student_id = users.id
      WHERE claims.status = 'Pending'
      ORDER BY claims.created_at DESC
      LIMIT 5
    `).all();

    res.json({
      success: true,
      stats: {
        pendingComplaints: pendingComplaintsCount,
        inProgressComplaints: inProgressComplaintsCount,
        pendingClaims: pendingClaimsCount,
        totalItems: totalLostFoundCount,
        todayAttendance: {
          markedClasses: todayAttendance.marked_classes || 0,
          presentCount: todayAttendance.present_count || 0,
          absentCount: todayAttendance.absent_count || 0,
          totalRecorded: todayAttendance.total_recorded || 0
        },
        upcomingEvents: upcomingEventsCount
      },
      recentComplaints,
      recentClaims
    });
  } catch (error) {
    console.error('Fetch faculty overview stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve overview statistics.' });
  }
});

// GET /api/stats/student-overview - Student metrics overview
router.get('/student-overview', authenticateToken, requireRole('student'), (req, res) => {
  try {
    const studentId = req.user.id;
    const studentClass = req.user.class_name;
    const today = new Date().toISOString().split('T')[0];

    // Attendance stats
    const attendanceRecords = db.prepare(`
      SELECT status FROM attendance WHERE student_id = ?
    `).all(studentId);

    const totalAttendance = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(r => r.status === 'Present').length;
    const attendancePercentage = totalAttendance > 0 ? Number(((presentCount / totalAttendance) * 100).toFixed(1)) : 100;

    // Student complaint count
    const pendingComplaints = db.prepare(`
      SELECT COUNT(*) as count FROM complaints WHERE student_id = ? AND status != 'Resolved'
    `).get(studentId).count;

    // Student claims count
    const activeClaims = db.prepare(`
      SELECT COUNT(*) as count FROM claims WHERE student_id = ? AND status IN ('Pending', 'Approved')
    `).get(studentId).count;

    // Has timetable
    const timetable = db.prepare(`
      SELECT id, updated_at FROM timetables WHERE class_name = ?
    `).get(studentClass);

    // Latest 3 events
    const latestEvents = db.prepare(`
      SELECT * FROM events
      WHERE class_name = 'All' OR class_name = ?
      ORDER BY date ASC
      LIMIT 3
    `).all(studentClass);

    res.json({
      success: true,
      stats: {
        attendancePercentage,
        totalClasses: totalAttendance,
        presentClasses: presentCount,
        pendingComplaints,
        activeClaims,
        hasTimetable: !!timetable
      },
      latestEvents
    });
  } catch (error) {
    console.error('Fetch student overview stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve overview statistics.' });
  }
});

module.exports = router;
