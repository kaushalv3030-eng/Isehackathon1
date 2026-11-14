const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET /api/items - List all items (with optional filter type=lost|found, status)
router.get('/', authenticateToken, (req, res) => {
  try {
    const { type, status } = req.query;
    let query = `
      SELECT items.*, users.name as posted_by_name 
      FROM items 
      LEFT JOIN users ON items.posted_by = users.id 
      WHERE 1=1
    `;
    const params = [];

    if (type) {
      query += ' AND items.type = ?';
      params.push(type.toLowerCase());
    }

    if (status) {
      query += ' AND items.status = ?';
      params.push(status);
    }

    query += ' ORDER BY items.created_at DESC';

    const items = db.prepare(query).all(...params);

    // If user is a student, attach any claims they made on these items
    if (req.user.role === 'student') {
      const studentClaims = db.prepare('SELECT * FROM claims WHERE student_id = ?').all(req.user.id);
      const claimsMap = {};
      studentClaims.forEach(c => { claimsMap[c.item_id] = c; });

      const itemsWithUserClaim = items.map(item => ({
        ...item,
        myClaim: claimsMap[item.id] || null
      }));

      return res.json({ success: true, items: itemsWithUserClaim });
    }

    res.json({ success: true, items });
  } catch (error) {
    console.error('Fetch items error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve items.' });
  }
});

// GET /api/items/claims/my - Student: View all their claims
router.get('/claims/my', authenticateToken, requireRole('student'), (req, res) => {
  try {
    const claims = db.prepare(`
      SELECT claims.*, items.name as item_name, items.type as item_type, 
             items.image_path as item_image, items.place, items.date as item_date
      FROM claims
      JOIN items ON claims.item_id = items.id
      WHERE claims.student_id = ?
      ORDER BY claims.created_at DESC
    `).all(req.user.id);

    res.json({ success: true, claims });
  } catch (error) {
    console.error('Fetch student claims error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve claims.' });
  }
});

// GET /api/items/claims/all - Faculty: View all claims across all items
router.get('/claims/all', authenticateToken, requireRole('faculty'), (req, res) => {
  try {
    const claims = db.prepare(`
      SELECT claims.*, 
             items.name as item_name, items.type as item_type, items.image_path as item_image,
             items.place, items.status as item_status,
             users.name as student_name, users.roll_no as student_roll, users.class_name as student_class, users.email as student_email
      FROM claims
      JOIN items ON claims.item_id = items.id
      JOIN users ON claims.student_id = users.id
      ORDER BY claims.created_at DESC
    `).all();

    res.json({ success: true, claims });
  } catch (error) {
    console.error('Fetch all claims error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve claims.' });
  }
});

// POST /api/items - Faculty: Add an item (Lost or Found)
router.post('/', authenticateToken, requireRole('faculty'), upload.single('image'), (req, res) => {
  try {
    const { name, description, place, date, type } = req.body;

    if (!name || !description || !place || !date || !type) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required (name, description, place, date, type).'
      });
    }

    const image_path = req.file ? `/uploads/${req.file.filename}` : null;

    const stmt = db.prepare(`
      INSERT INTO items (name, description, place, date, type, image_path, status, posted_by)
      VALUES (?, ?, ?, ?, ?, ?, 'Open', ?)
    `);

    const result = stmt.run(
      name.trim(),
      description.trim(),
      place.trim(),
      date,
      type.toLowerCase(),
      image_path,
      req.user.id
    );

    const newItem = db.prepare('SELECT * FROM items WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: `${type === 'lost' ? 'Lost' : 'Found'} item posted successfully.`,
      item: newItem
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ success: false, message: 'Failed to create item.' });
  }
});

// PUT /api/items/:id - Faculty: Edit an item
router.put('/:id', authenticateToken, requireRole('faculty'), upload.single('image'), (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, place, date, type, status } = req.body;

    const existing = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    const image_path = req.file ? `/uploads/${req.file.filename}` : existing.image_path;

    db.prepare(`
      UPDATE items
      SET name = ?, description = ?, place = ?, date = ?, type = ?, image_path = ?, status = ?
      WHERE id = ?
    `).run(
      name || existing.name,
      description || existing.description,
      place || existing.place,
      date || existing.date,
      type ? type.toLowerCase() : existing.type,
      image_path,
      status || existing.status,
      id
    );

    const updated = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    res.json({ success: true, message: 'Item updated successfully.', item: updated });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ success: false, message: 'Failed to update item.' });
  }
});

// DELETE /api/items/:id - Faculty: Delete an item
router.delete('/:id', authenticateToken, requireRole('faculty'), (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM items WHERE id = ?').get(id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    db.prepare('DELETE FROM items WHERE id = ?').run(id);
    res.json({ success: true, message: 'Item deleted successfully.' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete item.' });
  }
});

// POST /api/items/:id/claim - Student: "This is Mine" button
router.post('/:id/claim', authenticateToken, requireRole('student'), (req, res) => {
  try {
    const { id } = req.params;
    const { claim_reason } = req.body;

    const item = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    // Check if student already claimed this item
    const existingClaim = db.prepare('SELECT * FROM claims WHERE item_id = ? AND student_id = ?').get(id, req.user.id);
    if (existingClaim) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a claim for this item.'
      });
    }

    // Insert claim
    db.prepare(`
      INSERT INTO claims (item_id, student_id, claim_reason, status)
      VALUES (?, ?, ?, 'Pending')
    `).run(id, req.user.id, claim_reason || 'Claimed by student');

    // Update item status to 'Claim Pending'
    db.prepare("UPDATE items SET status = 'Claim Pending' WHERE id = ?").run(id);

    // Notify all faculty about the new claim
    const facultyUsers = db.prepare("SELECT id FROM users WHERE role = 'faculty'").all();
    const insertNotif = db.prepare("INSERT INTO notifications (user_id, message, type) VALUES (?, ?, 'claim')");
    const claimMsg = `New claim submitted for "${item.name}" by student ${req.user.name} (${req.user.roll_no || req.user.class_name}).`;

    for (const fac of facultyUsers) {
      insertNotif.run(fac.id, claimMsg);
    }

    res.status(201).json({
      success: true,
      message: 'Claim submitted successfully. Faculty has been notified for verification.'
    });
  } catch (error) {
    console.error('Claim item error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit claim.' });
  }
});

// PUT /api/items/claims/:claimId/status - Faculty: Approve, Reject, or Hand Over claim
router.put('/claims/:claimId/status', authenticateToken, requireRole('faculty'), (req, res) => {
  try {
    const { claimId } = req.params;
    const { status } = req.body; // 'Approved', 'Rejected', 'Handed Over'

    if (!['Approved', 'Rejected', 'Handed Over'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be Approved, Rejected, or Handed Over.'
      });
    }

    const claim = db.prepare(`
      SELECT claims.*, items.name as item_name 
      FROM claims 
      JOIN items ON claims.item_id = items.id 
      WHERE claims.id = ?
    `).get(claimId);

    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found.' });
    }

    let handed_over_at = claim.handed_over_at;
    if (status === 'Handed Over') {
      handed_over_at = new Date().toISOString();
      // Update item status to Handed Over
      db.prepare("UPDATE items SET status = 'Handed Over' WHERE id = ?").run(claim.item_id);
    } else if (status === 'Approved') {
      db.prepare("UPDATE items SET status = 'Claimed' WHERE id = ?").run(claim.item_id);
    } else if (status === 'Rejected') {
      // Revert item back to Open if no other pending claims
      const otherPending = db.prepare("SELECT id FROM claims WHERE item_id = ? AND id != ? AND status = 'Pending'").get(claim.item_id, claimId);
      if (!otherPending) {
        db.prepare("UPDATE items SET status = 'Open' WHERE id = ?").run(claim.item_id);
      }
    }

    db.prepare(`
      UPDATE claims 
      SET status = ?, handed_over_at = ? 
      WHERE id = ?
    `).run(status, handed_over_at, claimId);

    // Notify the student regarding status change
    let studentMsg = `Your claim for "${claim.item_name}" has been ${status.toLowerCase()}.`;
    if (status === 'Approved') {
      studentMsg += ' Please contact faculty or campus security to collect your item.';
    } else if (status === 'Handed Over') {
      studentMsg += ' The item has been marked as officially handed over to you.';
    }

    db.prepare("INSERT INTO notifications (user_id, message, type) VALUES (?, ?, 'claim')")
      .run(claim.student_id, studentMsg);

    res.json({
      success: true,
      message: `Claim status updated to ${status}. Student notified.`,
      status,
      handed_over_at
    });
  } catch (error) {
    console.error('Update claim status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update claim status.' });
  }
});

module.exports = router;
