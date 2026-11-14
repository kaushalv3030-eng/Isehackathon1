const { spawn, exec, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('\x1b[36m%s\x1b[0m', '==========================================================');
console.log('\x1b[36m%s\x1b[0m', '   Smart Campus Solutions - Unified Startup Controller    ');
console.log('\x1b[36m%s\x1b[0m', '   CEC-HACKSTORM-2026 (Theme 1: Smart Campus Solutions)   ');
console.log('\x1b[36m%s\x1b[0m', '==========================================================\n');

const rootDir = __dirname;
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');
const dbFile = path.join(backendDir, 'data', 'campus.db');

// Helper to kill any process holding a specific port on Windows
function freePort(port) {
  try {
    const stdout = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const lines = stdout.split('\n');
    const pids = new Set();
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 5 && parts[1].includes(`:${port}`)) {
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0') pids.add(pid);
      }
    }
    for (const pid of pids) {
      try {
        execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
        console.log(`\x1b[33m[CLEANUP]\x1b[0m Released busy port ${port} (PID ${pid})`);
      } catch (e) { /* ignore */ }
    }
  } catch (err) {
    // Port not in use, which is good
  }
}

// 1. Free ports 5000 and 5173
console.log('\x1b[34m[STEP 1/3]\x1b[0m Verifying network ports 5000 & 5173...');
freePort(5000);
freePort(5173);

// 2. Auto-seed if database doesn't exist
if (!fs.existsSync(dbFile)) {
  console.log('\x1b[34m[STEP 2/3]\x1b[0m First run detected: Seeding demo database...');
  try {
    execSync('node src/scripts/seed.js', { cwd: backendDir, stdio: 'inherit' });
  } catch (err) {
    console.error('Error during auto-seeding:', err);
  }
} else {
  console.log('\x1b[34m[STEP 2/3]\x1b[0m Database verified at backend/data/campus.db');
}

console.log('\x1b[34m[STEP 3/3]\x1b[0m Starting Backend API and Frontend Dev Server...\n');

const isWin = process.platform === 'win32';
const npxCmd = isWin ? 'npx.cmd' : 'npx';

// 3. Spawn Backend
const backend = spawn('node', ['src/server.js'], {
  cwd: backendDir,
  shell: true,
  stdio: 'pipe',
  env: { ...process.env, PORT: '5000' }
});

backend.stdout.on('data', (data) => {
  const text = data.toString().trim();
  if (text) {
    console.log(`\x1b[32m[BACKEND]\x1b[0m ${text.replace(/\n/g, '\n\x1b[32m[BACKEND]\x1b[0m ')}`);
  }
});

backend.stderr.on('data', (data) => {
  const text = data.toString().trim();
  if (text) {
    console.error(`\x1b[31m[BACKEND ERROR]\x1b[0m ${text}`);
  }
});

// 4. Spawn Frontend
const frontend = spawn(npxCmd, ['vite', '--port', '5173'], {
  cwd: frontendDir,
  shell: true,
  stdio: 'pipe'
});

let browserOpened = false;

frontend.stdout.on('data', (data) => {
  const text = data.toString().trim();
  if (text) {
    console.log(`\x1b[35m[FRONTEND]\x1b[0m ${text.replace(/\n/g, '\n\x1b[35m[FRONTEND]\x1b[0m ')}`);
  }
  if (!browserOpened && (text.includes('5173') || text.includes('ready in') || text.includes('Local:'))) {
    browserOpened = true;
    console.log('\n\x1b[36m%s\x1b[0m', '>>> Smart Campus Solutions is ONLINE! Opening http://localhost:5173 in your browser... <<<\n');
    setTimeout(() => {
      if (isWin) {
        exec('start http://localhost:5173/');
      } else {
        exec('open http://localhost:5173/ || xdg-open http://localhost:5173/');
      }
    }, 1500);
  }
});

frontend.stderr.on('data', (data) => {
  const text = data.toString().trim();
  if (text) {
    console.error(`\x1b[31m[FRONTEND ERROR]\x1b[0m ${text}`);
  }
});

// Keep process alive indefinitely until Ctrl+C
setInterval(() => {}, 1000 * 60 * 60);

// Clean shutdown on Ctrl+C
const cleanup = () => {
  console.log('\n\x1b[33m%s\x1b[0m', 'Shutting down Smart Campus Solutions servers...');
  try { backend.kill(); } catch (e) {}
  try { frontend.kill(); } catch (e) {}
  freePort(5000);
  freePort(5173);
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
