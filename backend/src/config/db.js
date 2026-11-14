const path = require('path');
const fs = require('fs');

let dbPath;

if (process.env.VERCEL) {
  const tmpDir = '/tmp';
  const tmpDbPath = path.join(tmpDir, 'campus.db');
  const bundledDbPath = path.join(__dirname, '../../data/campus.db');
  
  if (!fs.existsSync(tmpDbPath) && fs.existsSync(bundledDbPath)) {
    try {
      fs.copyFileSync(bundledDbPath, tmpDbPath);
      console.log('[Database] Seeded campus.db copied to /tmp/campus.db for Vercel runtime');
    } catch (copyErr) {
      console.warn('[Database] Could not copy pre-seeded database, will initialize fresh:', copyErr.message);
    }
  }
  dbPath = tmpDbPath;
} else {
  const dbDir = path.join(__dirname, '../../data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  dbPath = path.join(dbDir, 'campus.db');
}

let db;

try {
  const Database = require('better-sqlite3');
  db = new Database(dbPath);
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');
  console.log('[Database] Connected via better-sqlite3');
} catch (e) {
  // Fallback to Node.js 22+ built-in node:sqlite with zero native build dependencies
  const { DatabaseSync } = require('node:sqlite');
  db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');
  
  // Attach transaction helper compatible with better-sqlite3
  db.transaction = (fn) => {
    return (...args) => {
      db.exec('BEGIN TRANSACTION');
      try {
        const result = fn(...args);
        db.exec('COMMIT');
        return result;
      } catch (err) {
        db.exec('ROLLBACK');
        throw err;
      }
    };
  };
  console.log('[Database] Connected via native node:sqlite (Zero C++ compiler required)');
}

// Initialize database schema
const initializeDatabase = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT CHECK(role IN ('student', 'faculty')) NOT NULL,
      roll_no TEXT,
      class_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS timetables (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      class_name TEXT UNIQUE NOT NULL,
      image_path TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      place TEXT NOT NULL,
      date TEXT NOT NULL,
      type TEXT CHECK(type IN ('lost', 'found')) NOT NULL,
      image_path TEXT,
      status TEXT DEFAULT 'Open' CHECK(status IN ('Open', 'Claim Pending', 'Claimed', 'Handed Over', 'Closed')),
      posted_by INTEGER REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS claims (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
      student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      claim_reason TEXT,
      status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'Approved', 'Rejected', 'Handed Over')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      handed_over_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      category TEXT CHECK(category IN ('Infrastructure', 'Electrical', 'Cleanliness', 'Internet', 'Other')) NOT NULL,
      description TEXT NOT NULL,
      image_path TEXT,
      status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'In Progress', 'Resolved')),
      remark TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      class_name TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT CHECK(status IN ('Present', 'Absent')) NOT NULL,
      UNIQUE(student_id, date)
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      venue TEXT NOT NULL,
      class_name TEXT DEFAULT 'All',
      created_by INTEGER REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      type TEXT,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

initializeDatabase();

module.exports = db;
