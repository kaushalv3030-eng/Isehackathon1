const bcrypt = require('bcryptjs');
const db = require('../config/db');
const path = require('path');
const fs = require('fs');

async function seed() {
  console.log('--- Starting Smart Campus Solutions Database Seeding ---');

  // Ensure uploads directory exists
  const uploadsDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Create sample timetable SVGs if not present
  const sampleTimetableSvgA = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700" viewBox="0 0 1200 700">
      <rect width="1200" height="700" fill="#f8fafc"/>
      <rect x="40" y="30" width="1120" height="80" rx="12" fill="#1e3a8a"/>
      <text x="600" y="80" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#ffffff" text-anchor="middle">
        DEPARTMENT OF COMPUTER SCIENCE &amp; ENGINEERING
      </text>
      <text x="600" y="100" font-family="Arial, sans-serif" font-size="16" fill="#93c5fd" text-anchor="middle">
        CLASS TIMETABLE: SEMESTER V - SECTION CSE-3A (ACADEMIC YEAR 2026)
      </text>
      <!-- Days Column -->
      <g font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#1e293b">
        <rect x="40" y="140" width="120" height="60" fill="#e2e8f0" stroke="#cbd5e1"/>
        <text x="100" y="175" text-anchor="middle">DAY / TIME</text>
        <rect x="160" y="140" width="200" height="60" fill="#e2e8f0" stroke="#cbd5e1"/>
        <text x="260" y="175" text-anchor="middle">09:00 - 10:00</text>
        <rect x="360" y="140" width="200" height="60" fill="#e2e8f0" stroke="#cbd5e1"/>
        <text x="460" y="175" text-anchor="middle">10:00 - 11:00</text>
        <rect x="560" y="140" width="200" height="60" fill="#e2e8f0" stroke="#cbd5e1"/>
        <text x="660" y="175" text-anchor="middle">11:15 - 12:15</text>
        <rect x="760" y="140" width="200" height="60" fill="#e2e8f0" stroke="#cbd5e1"/>
        <text x="860" y="175" text-anchor="middle">01:15 - 02:15</text>
        <rect x="960" y="140" width="200" height="60" fill="#e2e8f0" stroke="#cbd5e1"/>
        <text x="1060" y="175" text-anchor="middle">02:15 - 04:15</text>
      </g>
      <!-- Rows -->
      <g font-family="Arial, sans-serif" font-size="14">
        <!-- Monday -->
        <rect x="40" y="200" width="120" height="75" fill="#f1f5f9" stroke="#cbd5e1"/>
        <text x="100" y="245" font-weight="bold" text-anchor="middle">MON</text>
        <rect x="160" y="200" width="200" height="75" fill="#dbeafe" stroke="#cbd5e1"/>
        <text x="260" y="245" text-anchor="middle">Operating Systems</text>
        <rect x="360" y="200" width="200" height="75" fill="#e0e7ff" stroke="#cbd5e1"/>
        <text x="460" y="245" text-anchor="middle">Database Systems</text>
        <rect x="560" y="200" width="200" height="75" fill="#ede9fe" stroke="#cbd5e1"/>
        <text x="660" y="245" text-anchor="middle">Computer Networks</text>
        <rect x="760" y="200" width="200" height="75" fill="#fef3c7" stroke="#cbd5e1"/>
        <text x="860" y="245" text-anchor="middle">Software Engg</text>
        <rect x="960" y="200" width="200" height="75" fill="#fbcfe8" stroke="#cbd5e1"/>
        <text x="1060" y="245" text-anchor="middle">OS Lab (Lab 2)</text>
        <!-- Tuesday -->
        <rect x="40" y="275" width="120" height="75" fill="#f1f5f9" stroke="#cbd5e1"/>
        <text x="100" y="320" font-weight="bold" text-anchor="middle">TUE</text>
        <rect x="160" y="275" width="200" height="75" fill="#ede9fe" stroke="#cbd5e1"/>
        <text x="260" y="320" text-anchor="middle">Computer Networks</text>
        <rect x="360" y="275" width="200" height="75" fill="#dbeafe" stroke="#cbd5e1"/>
        <text x="460" y="320" text-anchor="middle">Operating Systems</text>
        <rect x="560" y="275" width="200" height="75" fill="#fef3c7" stroke="#cbd5e1"/>
        <text x="660" y="320" text-anchor="middle">Software Engg</text>
        <rect x="760" y="275" width="200" height="75" fill="#e0e7ff" stroke="#cbd5e1"/>
        <text x="860" y="320" text-anchor="middle">Database Systems</text>
        <rect x="960" y="275" width="200" height="75" fill="#ccfbf1" stroke="#cbd5e1"/>
        <text x="1060" y="320" text-anchor="middle">DBMS Lab (Lab 1)</text>
        <!-- Wednesday -->
        <rect x="40" y="350" width="120" height="75" fill="#f1f5f9" stroke="#cbd5e1"/>
        <text x="100" y="395" font-weight="bold" text-anchor="middle">WED</text>
        <rect x="160" y="350" width="200" height="75" fill="#e0e7ff" stroke="#cbd5e1"/>
        <text x="260" y="395" text-anchor="middle">Database Systems</text>
        <rect x="360" y="350" width="200" height="75" fill="#ede9fe" stroke="#cbd5e1"/>
        <text x="460" y="395" text-anchor="middle">Computer Networks</text>
        <rect x="560" y="350" width="200" height="75" fill="#dbeafe" stroke="#cbd5e1"/>
        <text x="660" y="395" text-anchor="middle">Operating Systems</text>
        <rect x="760" y="350" width="200" height="75" fill="#fef3c7" stroke="#cbd5e1"/>
        <text x="860" y="395" text-anchor="middle">Software Engg</text>
        <rect x="960" y="350" width="200" height="75" fill="#fef08a" stroke="#cbd5e1"/>
        <text x="1060" y="395" text-anchor="middle">Technical Seminar</text>
      </g>
    </svg>
  `;

  const timetableFileA = path.join(uploadsDir, 'timetable_cse_3a.svg');
  fs.writeFileSync(timetableFileA, sampleTimetableSvgA.trim());

  const sampleCalculatorSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#1e293b"/>
      <rect x="120" y="30" width="160" height="240" rx="16" fill="#334155" stroke="#94a3b8" stroke-width="4"/>
      <rect x="140" y="50" width="120" height="40" rx="4" fill="#0f172a"/>
      <text x="250" y="75" font-family="Courier, monospace" font-size="18" fill="#38bdf8" text-anchor="end">0.0000</text>
      <!-- Buttons -->
      <g fill="#64748b">
        <rect x="140" y="105" width="24" height="20" rx="3"/><rect x="172" y="105" width="24" height="20" rx="3"/><rect x="204" y="105" width="24" height="20" rx="3"/><rect x="236" y="105" width="24" height="20" rx="3"/>
        <rect x="140" y="135" width="24" height="20" rx="3"/><rect x="172" y="135" width="24" height="20" rx="3"/><rect x="204" y="135" width="24" height="20" rx="3"/><rect x="236" y="135" width="24" height="20" rx="3"/>
        <rect x="140" y="165" width="24" height="20" rx="3"/><rect x="172" y="165" width="24" height="20" rx="3"/><rect x="204" y="165" width="24" height="20" rx="3"/><rect x="236" y="165" width="24" height="20" rx="3"/>
      </g>
      <text x="200" y="240" font-family="Arial, sans-serif" font-size="12" fill="#cbd5e1" text-anchor="middle">CASIO fx-991EX</text>
    </svg>
  `;
  const calcFile = path.join(uploadsDir, 'item_calculator.svg');
  fs.writeFileSync(calcFile, sampleCalculatorSvg.trim());

  // Clear existing data safely
  db.exec(`
    DELETE FROM notifications;
    DELETE FROM attendance;
    DELETE FROM claims;
    DELETE FROM complaints;
    DELETE FROM items;
    DELETE FROM timetables;
    DELETE FROM events;
    DELETE FROM users;
  `);

  console.log('Cleared existing tables.');

  // 1. Seed Faculty Accounts
  const facultySalt = await bcrypt.genSalt(10);
  const facultyPasswordHash = await bcrypt.hash('Faculty@123', facultySalt);

  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password_hash, role, roll_no, class_name)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const fac1 = insertUser.run(
    'Prof. Alan Sharma',
    'faculty1@campus.edu',
    facultyPasswordHash,
    'faculty',
    null,
    'CSE'
  );

  const fac2 = insertUser.run(
    'Dr. Sunita Rao',
    'faculty2@campus.edu',
    facultyPasswordHash,
    'faculty',
    null,
    'CSE'
  );

  console.log('Seeded 2 Faculty accounts:');
  console.log(' - faculty1@campus.edu / Faculty@123 (Prof. Alan Sharma)');
  console.log(' - faculty2@campus.edu / Faculty@123 (Dr. Sunita Rao)');

  // 2. Seed 10 Student Accounts across 2 Classes (CSE-3A and CSE-3B)
  const studentSalt = await bcrypt.genSalt(10);
  const studentPasswordHash = await bcrypt.hash('Student@123', studentSalt);

  const sampleStudents = [
    // CSE-3A
    { name: 'Rahul Verma', email: 'student1@campus.edu', roll: '1CE21CS001', class: 'CSE-3A' },
    { name: 'Priya Nair', email: 'student2@campus.edu', roll: '1CE21CS002', class: 'CSE-3A' },
    { name: 'Ananya Sen', email: 'student3@campus.edu', roll: '1CE21CS003', class: 'CSE-3A' },
    { name: 'Rohan Kulkarni', email: 'student4@campus.edu', roll: '1CE21CS004', class: 'CSE-3A' },
    { name: 'Sneha Patil', email: 'student5@campus.edu', roll: '1CE21CS005', class: 'CSE-3A' },
    // CSE-3B
    { name: 'Vikram Singh', email: 'student6@campus.edu', roll: '1CE21CS006', class: 'CSE-3B' },
    { name: 'Pooja Hegde', email: 'student7@campus.edu', roll: '1CE21CS007', class: 'CSE-3B' },
    { name: 'Aditya Joshi', email: 'student8@campus.edu', roll: '1CE21CS008', class: 'CSE-3B' },
    { name: 'Kavya Reddy', email: 'student9@campus.edu', roll: '1CE21CS009', class: 'CSE-3B' },
    { name: 'Karthik Iyer', email: 'student10@campus.edu', roll: '1CE21CS010', class: 'CSE-3B' }
  ];

  const studentIds = [];
  for (const s of sampleStudents) {
    const res = insertUser.run(s.name, s.email, studentPasswordHash, 'student', s.roll, s.class);
    studentIds.push({ id: res.lastInsertRowid, ...s });
  }

  console.log(`Seeded 10 Student accounts (password: Student@123) across CSE-3A and CSE-3B.`);

  // 3. Seed Timetables
  db.prepare(`
    INSERT INTO timetables (class_name, image_path)
    VALUES ('CSE-3A', '/uploads/timetable_cse_3a.svg'),
           ('CSE-3B', '/uploads/timetable_cse_3a.svg')
  `).run();
  console.log('Seeded Timetables for CSE-3A & CSE-3B.');

  // 4. Seed Lost & Found Items
  const item1 = db.prepare(`
    INSERT INTO items (name, description, place, date, type, image_path, status, posted_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'Scientific Calculator Casio fx-991EX',
    'Black Casio scientific calculator left behind on desk row 3.',
    'Seminar Hall 2',
    '2026-11-05',
    'found',
    '/uploads/item_calculator.svg',
    'Claim Pending',
    fac1.lastInsertRowid
  );

  const item2 = db.prepare(`
    INSERT INTO items (name, description, place, date, type, image_path, status, posted_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'HP Laptop Charger (65W Type-C)',
    'Original HP 65W fast charger with braided black cord.',
    'Central Library 1st Floor',
    '2026-11-04',
    'lost',
    null,
    'Open',
    fac1.lastInsertRowid
  );

  const item3 = db.prepare(`
    INSERT INTO items (name, description, place, date, type, image_path, status, posted_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'College Identity Card - CSE Dept',
    'Identity card with blue lanyard and smart chip.',
    'Cafeteria Counter 3',
    '2026-11-06',
    'found',
    null,
    'Open',
    fac2.lastInsertRowid
  );

  const item4 = db.prepare(`
    INSERT INTO items (name, description, place, date, type, image_path, status, posted_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'Stainless Steel Blue Water Bottle',
    'Milton 750ml blue thermos flask with silver cap.',
    'Basketball Court Bench',
    '2026-11-03',
    'found',
    null,
    'Handed Over',
    fac2.lastInsertRowid
  );

  console.log('Seeded Lost & Found items.');

  // 5. Seed Claims
  db.prepare(`
    INSERT INTO claims (item_id, student_id, claim_reason, status)
    VALUES (?, ?, ?, 'Pending')
  `).run(
    item1.lastInsertRowid,
    studentIds[0].id, // Rahul Verma
    'I left it after my Engineering Math mid-term exam on bench 14. It has a small initials sticker "RV" on the back battery cover.'
  );

  db.prepare(`
    INSERT INTO claims (item_id, student_id, claim_reason, status, handed_over_at)
    VALUES (?, ?, ?, 'Handed Over', '2026-11-04 15:30:00')
  `).run(
    item4.lastInsertRowid,
    studentIds[1].id, // Priya Nair
    'My blue Milton water bottle that I forgot after practice.'
  );

  console.log('Seeded Claims.');

  // 6. Seed Complaints
  db.prepare(`
    INSERT INTO complaints (student_id, title, category, description, status, remark)
    VALUES 
    (?, 'Projector not working in Room 302', 'Infrastructure', 'The HDMI cable connector is bent and projector blinks continuously during lectures.', 'Pending', NULL),
    (?, 'Severe voltage fluctuations in Computer Lab 4', 'Electrical', 'Three computers turned off suddenly during programming lab.', 'In Progress', 'Electrician dispatched to check UPS line in Block A.'),
    (?, 'Campus Wi-Fi connectivity drops on 3rd Floor', 'Internet', 'Signal is extremely weak in CSE-3A classroom; disconnects during digital submissions.', 'Resolved', 'Replaced antenna on AP-C3; bandwidth verified at 85 Mbps.')
  `).run(
    studentIds[0].id, // Rahul Verma
    studentIds[1].id, // Priya Nair
    studentIds[2].id  // Ananya Sen
  );

  console.log('Seeded Complaints.');

  // 7. Seed Attendance Records for Past 6 Days
  const dates = ['2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07'];
  const insertAttendance = db.prepare(`
    INSERT INTO attendance (student_id, class_name, date, status)
    VALUES (?, ?, ?, ?)
  `);

  for (const date of dates) {
    for (const student of studentIds) {
      // Create interesting attendance pattern:
      // student4 (Rohan) has frequent absences to demonstrate the <75% warning banner!
      let status = 'Present';
      if (student.roll === '1CE21CS004' && ['2026-11-03', '2026-11-04', '2026-11-06'].includes(date)) {
        status = 'Absent'; // 3/6 = 50% attendance (Warning banner shown!)
      } else if (student.roll === '1CE21CS002' && date === '2026-11-04') {
        status = 'Absent';
      } else if (student.roll === '1CE21CS007' && date === '2026-11-05') {
        status = 'Absent';
      }
      insertAttendance.run(student.id, student.class, date, status);
    }
  }

  console.log('Seeded Attendance records across 6 days.');

  // 8. Seed Events & Announcements
  db.prepare(`
    INSERT INTO events (title, description, date, venue, class_name, created_by)
    VALUES 
    ('CEC-HACKSTORM 2026 - Hackathon Kickoff', 'Grand kickoff and problem statement briefing for Stage 1. All registered teams must report by 08:30 AM.', '2026-11-14', 'Main Auditorium, Block A', 'All', ?),
    ('AI & Cloud Computing Masterclass', 'Special guest session by industry architects on Next-Gen Cloud Architecture and Edge AI.', '2026-11-18', 'Seminar Hall 1', 'CSE-3A', ?),
    ('Pre-Placement Training & Mock Coding Assessment', 'Mandatory aptitude and DSA coding round simulation for 3rd year engineering students.', '2026-11-20', 'Central Computing Center', 'All', ?)
  `).run(fac1.lastInsertRowid, fac2.lastInsertRowid, fac1.lastInsertRowid);

  console.log('Seeded Campus Events.');

  // 9. Seed Initial Notifications
  db.prepare(`
    INSERT INTO notifications (user_id, message, type)
    VALUES 
    (?, 'New complaint submitted: "Projector not working in Room 302" by Rahul Verma.', 'complaint'),
    (?, 'New claim submitted for "Scientific Calculator Casio fx-991EX" by Rahul Verma.', 'claim'),
    (?, 'Your claim for "Casio fx-991EX" is currently under review by faculty.', 'claim'),
    (?, 'Reminder: Stage 1 of CEC-HACKSTORM 2026 takes place on 14-11-2026.', 'event')
  `).run(
    fac1.lastInsertRowid,
    fac1.lastInsertRowid,
    studentIds[0].id,
    studentIds[0].id
  );

  console.log('Seeded Initial Notifications.');
  console.log('--- Database Seeding Completed Successfully! ---');
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
