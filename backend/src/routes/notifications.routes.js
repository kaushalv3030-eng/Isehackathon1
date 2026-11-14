const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/notifications - Get user notifications & unread count
router.get('/', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = db.prepare(`
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `).all(userId);

    const unreadCount = db.prepare(`
      SELECT COUNT(*) as count FROM notifications
      WHERE user_id = ? AND is_read = 0
    `).get(userId).count;

    res.json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve notifications.' });
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    db.prepare(`
      UPDATE notifications
      SET is_read = 1
      WHERE id = ? AND user_id = ?
    `).run(id, userId);

    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ success: false, message: 'Failed to update notification.' });
  }
});

// PUT /api/notifications/mark-all-read - Mark all user notifications as read
router.put('/mark-all-read', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;

    db.prepare(`
      UPDATE notifications
      SET is_read = 1
      WHERE user_id = ?
    `).run(userId);

    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ success: false, message: 'Failed to update notifications.' });
  }
});

module.exports = router;
