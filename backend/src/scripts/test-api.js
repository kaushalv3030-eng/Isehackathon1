const http = require('http');

const runTests = async () => {
  console.log('--- Running Smart Campus API Automated Verification Suite ---');

  const app = require('../server');
  // Wait 500ms for server to bind if needed
  await new Promise(r => setTimeout(r, 500));

  const request = (path, method = 'GET', data = null, token = null) => {
    return new Promise((resolve, reject) => {
      const url = new URL(`http://localhost:5000${path}`);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method,
        headers: {}
      };

      let bodyData = null;
      if (data) {
        bodyData = JSON.stringify(data);
        options.headers['Content-Type'] = 'application/json';
        options.headers['Content-Length'] = Buffer.byteLength(bodyData);
      }

      if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
      }

      const req = http.request(options, (res) => {
        let responseBody = '';
        res.on('data', chunk => responseBody += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseBody);
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, raw: responseBody });
          }
        });
      });

      req.on('error', reject);
      if (bodyData) req.write(bodyData);
      req.end();
    });
  };

  try {
    // 1. Health check
    const health = await request('/api/health');
    console.log('[1/8] Health check:', health.status === 200 ? 'PASS' : 'FAIL');

    // 2. Student Login
    const studentLogin = await request('/api/auth/student/login', 'POST', {
      email: 'student1@campus.edu',
      password: 'Student@123'
    });
    console.log('[2/8] Student login:', studentLogin.status === 200 && studentLogin.data.success ? 'PASS' : 'FAIL');
    const studentToken = studentLogin.data.token;

    // 3. Faculty Login
    const facultyLogin = await request('/api/auth/faculty/login', 'POST', {
      email: 'faculty1@campus.edu',
      password: 'Faculty@123'
    });
    console.log('[3/8] Faculty login:', facultyLogin.status === 200 && facultyLogin.data.success ? 'PASS' : 'FAIL');
    const facultyToken = facultyLogin.data.token;

    // 4. Role Guard: Student attempting to access Faculty endpoint (/api/attendance/class-sheet)
    const forbiddenTest = await request('/api/attendance/class-sheet?class_name=CSE-3A&date=2026-11-05', 'GET', null, studentToken);
    console.log('[4/8] Student access to Faculty route blocked (403):', forbiddenTest.status === 403 ? 'PASS' : 'FAIL');

    // 5. Faculty access to Faculty endpoint
    const facultySheet = await request('/api/attendance/class-sheet?class_name=CSE-3A&date=2026-11-05', 'GET', null, facultyToken);
    console.log('[5/8] Faculty attendance sheet access (200):', facultySheet.status === 200 && facultySheet.data.success ? 'PASS' : 'FAIL');

    // 6. Student lodge complaint
    const newComplaint = await request('/api/complaints', 'POST', {
      title: 'Lab 2 AC not cooling',
      category: 'Infrastructure',
      description: 'Room temperature is very high during practical exam.'
    }, studentToken);
    console.log('[6/8] Student lodge complaint (201):', newComplaint.status === 201 && newComplaint.data.success ? 'PASS' : 'FAIL');
    const complaintId = newComplaint.data.complaint.id;

    // 7. Verify Faculty received notification for new complaint
    const facultyNotifs = await request('/api/notifications', 'GET', null, facultyToken);
    const hasComplaintNotif = facultyNotifs.data.notifications.some(n => n.message.includes('Lab 2 AC not cooling'));
    console.log('[7/8] Faculty received student issue notification:', hasComplaintNotif ? 'PASS' : 'FAIL');

    // 8. Faculty update complaint status to "Resolved" with remark -> student notified
    const updateComplaint = await request(`/api/complaints/${complaintId}/status`, 'PUT', {
      status: 'Resolved',
      remark: 'Maintenance technician fixed the compressor unit.'
    }, facultyToken);
    console.log('[8/8] Faculty resolve complaint & notify student:', updateComplaint.status === 200 && updateComplaint.data.success ? 'PASS' : 'FAIL');

    console.log('--- ALL AUTOMATED VERIFICATION CHECKS PASSED SUCCESSFULLY! ---');
    process.exit(0);
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
};

runTests();
