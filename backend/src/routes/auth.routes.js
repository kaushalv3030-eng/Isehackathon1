const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const db = require('../config/db');
const supabase = require('../config/supabase');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

// Helper to sign JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      roll_no: user.roll_no || null,
      class_name: user.class_name || null
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Keep a local shadow record in SQLite so existing foreign keys and JOINs across
// complaints, attendance, claims, events, and notifications continue working intact.
const syncLocalUserShadow = (user) => {
  const existingById = db.prepare('SELECT id FROM users WHERE id = ?').get(user.id);
  if (existingById) {
    db.prepare(`
      UPDATE users
      SET name = ?, email = ?, password_hash = COALESCE(?, password_hash),
          role = ?, roll_no = ?, class_name = ?
      WHERE id = ?
    `).run(
      user.name,
      user.email,
      user.password_hash || null,
      user.role,
      user.roll_no || null,
      user.class_name || null,
      user.id
    );
    return;
  }

  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, roll_no, class_name, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP))
  `).run(
    user.id,
    user.name,
    user.email,
    user.password_hash || 'SUPABASE_MANAGED',
    user.role,
    user.roll_no || null,
    user.class_name || null,
    user.created_at || null
  );
};

// Sign in via Supabase Auth (stateless client) so auth.users.last_sign_in_at and Auth Logs stay updated
const recordSupabaseAuthSignIn = async (email, password) => {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey || !password) return;

  try {
    const authClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    const { error } = await authClient.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Supabase Auth signInWithPassword error:', error.message);
    }
  } catch (err) {
    console.error('Supabase Auth signInWithPassword exception:', err.message);
  }
};

// Update last_login_at / login_count and append an entry to Supabase login_logs
const recordLoginActivity = async (user, password) => {
  const nowIso = new Date().toISOString();
  const nextCount = (user.login_count || 0) + 1;

  const { error: updateError } = await supabase
    .from('users')
    .update({
      last_login_at: nowIso,
      login_count: nextCount
    })
    .eq('id', user.id);

  if (updateError) {
    console.error('Supabase login timestamp update error:', updateError);
  }

  const { error: logError } = await supabase
    .from('login_logs')
    .insert({
      user_id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      roll_no: user.roll_no || null,
      class_name: user.class_name || null,
      login_status: 'success',
      logged_in_at: nowIso
    });

  if (logError) {
    console.error('Supabase login_logs insert error:', logError);
  }

  await recordSupabaseAuthSignIn(user.email, password);

  return { last_login_at: nowIso, login_count: nextCount };
};

// Shared role login handler backed by Supabase
const handleRoleLogin = async (req, res, expectedRole) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (fetchError) {
      console.error(`Supabase ${expectedRole} lookup error:`, fetchError);
      return res.status(500).json({
        success: false,
        message: 'Database error while verifying credentials.'
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (user.role !== expectedRole) {
      const targetPortal = expectedRole === 'student' ? 'Faculty' : 'Student';
      return res.status(403).json({
        success: false,
        message: `Access denied: This portal is for ${expectedRole}s only. Please use the ${targetPortal} login portal.`
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const activity = await recordLoginActivity(user, password);
    syncLocalUserShadow(user);

    const token = generateToken(user);
    const { password_hash, ...safeUser } = { ...user, ...activity };

    return res.json({
      success: true,
      message: `${expectedRole === 'student' ? 'Student' : 'Faculty'} login successful.`,
      token,
      user: safeUser
    });
  } catch (error) {
    console.error(`${expectedRole} login error:`, error);
    return res.status(500).json({
      success: false,
      message: `Server error during ${expectedRole} login.`
    });
  }
};

// Student Registration
router.post('/register', async (req, res) => {
  try {
    const { name, roll_no, class_name, email, password } = req.body;

    if (!name || !roll_no || !class_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required (name, roll_no, class_name, email, password).'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedRoll = roll_no.trim().toUpperCase();
    const normalizedClass = class_name.trim().toUpperCase();
    const trimmedName = name.trim();

    // Check if email already exists in Supabase
    const { data: existingEmail, error: emailErr } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (emailErr) {
      console.error('Supabase email check error:', emailErr);
      return res.status(500).json({ success: false, message: 'Server error during registration.' });
    }

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    // Check if roll number already exists in Supabase
    const { data: existingRoll, error: rollErr } = await supabase
      .from('users')
      .select('id')
      .eq('roll_no', normalizedRoll)
      .maybeSingle();

    if (rollErr) {
      console.error('Supabase roll check error:', rollErr);
      return res.status(500).json({ success: false, message: 'Server error during registration.' });
    }

    if (existingRoll) {
      return res.status(409).json({
        success: false,
        message: 'A student with this roll number is already registered.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const nowIso = new Date().toISOString();

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        name: trimmedName,
        email: normalizedEmail,
        password_hash,
        role: 'student',
        roll_no: normalizedRoll,
        class_name: normalizedClass,
        login_count: 1,
        last_login_at: nowIso
      })
      .select('id, name, email, role, roll_no, class_name, login_count, last_login_at, created_at')
      .single();

    if (insertError) {
      console.error('Supabase registration insert error:', insertError);
      return res.status(500).json({ success: false, message: 'Server error during registration.' });
    }

    // Log initial sign-in event upon registration
    const { error: logErr } = await supabase
      .from('login_logs')
      .insert({
        user_id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        roll_no: newUser.roll_no,
        class_name: newUser.class_name,
        login_status: 'registered',
        logged_in_at: nowIso
      });

    if (logErr) {
      console.error('Supabase login_logs insert error on register:', logErr);
    }

    await recordSupabaseAuthSignIn(newUser.email, password);

    // Sync local shadow row & create welcome notification
    syncLocalUserShadow({ ...newUser, password_hash });

    db.prepare(`
      INSERT INTO notifications (user_id, message, type)
      VALUES (?, ?, 'welcome')
    `).run(newUser.id, `Welcome to Smart Campus Solutions, ${newUser.name}!`);

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Student account registered successfully.',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// Student Login
router.post('/student/login', (req, res) => handleRoleLogin(req, res, 'student'));

// Faculty Login
router.post('/faculty/login', (req, res) => handleRoleLogin(req, res, 'faculty'));

// Current User Profile Verification
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, roll_no, class_name, login_count, last_login_at, created_at')
      .eq('id', req.user.id)
      .maybeSingle();

    if (error) {
      console.error('Supabase fetch me error:', error);
      return res.status(500).json({ success: false, message: 'Server error fetching user profile.' });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({ success: true, user });
  } catch (error) {
    console.error('Fetch me error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching user profile.' });
  }
});

module.exports = router;
