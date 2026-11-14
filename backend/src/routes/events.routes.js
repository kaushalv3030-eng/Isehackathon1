const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET /api/events - List events (filtered for students, all for faculty)
router.get('/', authenticateToken, (req, res) => {
  try {
    let query = `
      SELECT events.*, users.name as created_by_name
      FROM events
      LEFT JOIN users ON events.created_by = users.id
    `;
    const params = [];

    if (req.user.role === 'student') {
      const studentClass = req.user.class_name || '';
      query += ` WHERE events.class_name = 'All' OR events.class_name = ?`;
      params.push(studentClass);
    }

    query += ' ORDER BY events.date DESC, events.created_at DESC';

    const events = db.prepare(query).all(...params);
    res.json({ success: true, events });
  } catch (error) {
    console.error('Fetch events error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve events.' });
  }
});

// POST /api/events - Faculty: Create an event
router.post('/', authenticateToken, requireRole('faculty'), (req, res) => {
  try {
    const { title, description, date, venue, class_name } = req.body;

    if (!title || !description || !date || !venue) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, date, and venue are required.'
      });
    }

    const targetClass = class_name ? class_name.trim() : 'All';

    const stmt = db.prepare(`
      INSERT INTO events (title, description, date, venue, class_name, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      title.trim(),
      description.trim(),
      date,
      venue.trim(),
      targetClass,
      req.user.id
    );

    const newEvent = db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid);

    // Notify targeted students
    let targetStudents;
    if (targetClass === 'All') {
      targetStudents = db.prepare("SELECT id FROM users WHERE role = 'student'").all();
    } else {
      targetStudents = db.prepare("SELECT id FROM users WHERE role = 'student' AND class_name = ?").all(targetClass);
    }

    const insertNotif = db.prepare("INSERT INTO notifications (user_id, message, type) VALUES (?, ?, 'event')");
    const notifMsg = `New Campus Event: "${title.trim()}" on ${date} at ${venue.trim()}.`;

    for (const student of targetStudents) {
      insertNotif.run(student.id, notifMsg);
    }

    res.status(201).json({
      success: true,
      message: 'Event published successfully. Students have been notified.',
      event: newEvent
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ success: false, message: 'Failed to create event.' });
  }
});

// PUT /api/events/:id - Faculty: Edit an event
router.put('/:id', authenticateToken, requireRole('faculty'), (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, venue, class_name } = req.body;

    const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    db.prepare(`
      UPDATE events
      SET title = ?, description = ?, date = ?, venue = ?, class_name = ?
      WHERE id = ?
    `).run(
      title || existing.title,
      description || existing.description,
      date || existing.date,
      venue || existing.venue,
      class_name || existing.class_name,
      id
    );

    const updated = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
    res.json({ success: true, message: 'Event updated successfully.', event: updated });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ success: false, message: 'Failed to update event.' });
  }
});

// DELETE /api/events/:id - Faculty: Delete an event
router.delete('/:id', authenticateToken, requireRole('faculty'), (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    db.prepare('DELETE FROM events WHERE id = ?').run(id);
    res.json({ success: true, message: 'Event deleted successfully.' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete event.' });
  }
});

module.exports = router;
