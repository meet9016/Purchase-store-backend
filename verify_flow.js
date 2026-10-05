const http = require('http');

async function loginAndCreatePR() {
  // Step 1: Login
  const loginBody = JSON.stringify({
    email: 'admin@gmail.com',
    password: 'password123' === 'password123' ? '123456' : '123456'
  });

  const req = http.request({
    hostname: 'localhost',
    port: 5005,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginBody)
    }
  }, (res) => {
    let body = '';
    res.on('data', d => { body += d; });
    res.on('end', () => {
      console.log('Login status:', res.statusCode);
      const data = JSON.parse(body);
      const token = data.data?.token;
      console.log('Got JWT Token:', !!token);

      if (token) {
        // Step 2: Try creating PR with Token
        const prBody = JSON.stringify({
          projectId: 'prj-test-1',
          requiredDate: '2026-11-01',
          priority: 'Urgent',
          items: [{ itemId: 'item-1', itemName: 'Cement UltraTech', quantity: 50, unit: 'Bags' }]
        });

        const prReq = http.request({
          hostname: 'localhost',
          port: 5005,
          path: '/api/purchase-requests',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Content-Length': Buffer.byteLength(prBody)
          }
        }, (prRes) => {
          let prData = '';
          prRes.on('data', d => { prData += d; });
          prRes.on('end', () => {
            console.log('PR Create status:', prRes.statusCode);
            console.log('PR Response:', prData);
          });
        });
        prReq.write(prBody);
        prReq.end();
      }
    });
  });
  req.write(loginBody);
  req.end();
}

loginAndCreatePR();
