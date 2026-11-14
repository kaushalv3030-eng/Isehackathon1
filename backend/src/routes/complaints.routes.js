const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET /api/complaints/my - Student: View their complaints
router.get('/my', authenticateToken, requireRole('student'), (req, res) => {
  try {
    const complaints = db.prepare(`
      SELECT * FROM complaints 
      WHERE student_id = ? 
      ORDER BY created_at DESC
    `).all(req.user.id);

    res.json({ success: true, complaints });
  } catch (error) {
    console.error('Fetch student complaints error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve complaints.' });
  }
});

// GET /api/complaints - Faculty: View all complaints with optional filtering
router.get('/', authenticateToken, requireRole('faculty'), (req, res) => {
  try {
    const { status, category } = req.query;
    let query = `
      SELECT complaints.*, 
             users.name as student_name, users.roll_no as student_roll, 
             users.class_name as student_class, users.email as student_email
      FROM complaints
      JOIN users ON complaints.student_id = users.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'All') {
      query += ' AND complaints.status = ?';
      params.push(status);
    }

    if (category && category !== 'All') {
      query += ' AND complaints.category = ?';
      params.push(category);
    }

    query += ' ORDER BY complaints.created_at DESC';

    const complaints = db.prepare(query).all(...params);
    res.json({ success: true, complaints });
  } catch (error) {
    console.error('Fetch all complaints error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve complaints.' });
  }
});

// POST /api/complaints - Student: Lodge a new complaint
router.post('/', authenticateToken, requireRole('student'), upload.single('image'), (req, res) => {
  try {
    const { title, category, description } = req.body;

    if (!title || !category || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title, category, and description are required.'
      });
    }

    const validCategories = ['Infrastructure', 'Electrical', 'Cleanliness', 'Internet', 'Other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Category must be one of: ${validCategories.join(', ')}`
      });
    }

    const image_path = req.file ? `/uploads/${req.file.filename}` : null;

    const stmt = db.prepare(`
      INSERT INTO complaints (student_id, title, category, description, image_path, status)
      VALUES (?, ?, ?, ?, ?, 'Pending')
    `);

    const result = stmt.run(
      req.user.id,
      title.trim(),
      category,
      description.trim(),
      image_path
    );

    const newComplaint = db.prepare('SELECT * FROM complaints WHERE id = ?').get(result.lastInsertRowid);

    // NOTIFY ALL FACULTY MEMBERS: CRITICAL REQUIREMENT
    // "remeber when updated in student dahsboard an issue that issue must be recieved by faculty dashboard"
    const facultyList = db.prepare("SELECT id FROM users WHERE role = 'faculty'").all();
    const insertNotif = db.prepare("INSERT INTO notifications (user_id, message, type) VALUES (?, ?, 'complaint')");
    const alertMessage = `New complaint submitted: "${title.trim()}" (${category}) by ${req.user.name} (${req.user.roll_no || req.user.class_name}).`;

    for (const fac of facultyList) {
      insertNotif.run(fac.id, alertMessage);
    }

    res.status(201).json({
      success: true,
      message: 'Complaint lodged successfully. Campus faculty and administration have been notified.',
      complaint: newComplaint
    });
  } catch (error) {
    console.error('Lodge complaint error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit complaint.' });
  }
});

// PUT /api/complaints/:id/status - Faculty: Update status and add remark
router.put('/:id/status', authenticateToken, requireRole('faculty'), (req, res) => {
  try {
    const { id } = req.params;
    const { status, remark } = req.body;

    const validStatuses = ['Pending', 'In Progress', 'Resolved'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const complaint = db.prepare('SELECT * FROM complaints WHERE id = ?').get(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    db.prepare(`
      UPDATE complaints
      SET status = ?, remark = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, remark !== undefined ? remark : complaint.remark, id);

    const updated = db.prepare('SELECT * FROM complaints WHERE id = ?').get(id);

    // NOTIFY THE STUDENT: Status or Remark change
    const studentNotifMsg = `Your complaint "${complaint.title}" is now marked as "${status}". ${remark ? `Faculty remark: "${remark}"` : ''}`;
    db.prepare("INSERT INTO notifications (user_id, message, type) VALUES (?, ?, 'complaint')")
      .run(complaint.student_id, studentNotifMsg);

    res.json({
      success: true,
      message: `Complaint updated to "${status}". Student has been notified.`,
      complaint: updated
    });
  } catch (error) {
    console.error('Update complaint status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update complaint.' });
  }
});

module.exports = router;
