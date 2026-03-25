const express = require('express');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    status: 'Proxy is running',
    message: 'Access AppOnFly RDP service through /rdp-api/* endpoints'
  });
});

// Main proxy endpoint
app.get('/rdp-api/*', (req, res) => {
  console.log('Received request:', req.method, req.path);
  
  // Convert /rdp-api/something to /rdp/api/something
  const apiPath = req.path.replace('/rdp-api', '/rdp/api');
  console.log('Forwarding to path:', apiPath);
  
  const options = {
    hostname: 'htmlgw3.apponfly.com',
    port: 443,
    path: apiPath,
    method: req.method,
    headers: {
      'guacamole-token': '6E5DA99AED62677008D26045058FCF68B3EB44CBDA836D297F5BE5907AE35DB1',
      'Cookie': '_gcl_au=1.1.1302641859.1772367745; _gid=GA1.2.55854900.1772367745; _gat_gtag_UA_47851850_1=1; _dc_gtm_UA-47851850-1=1; _hjSessionUser_1843527=eyJpZCI6IjFmNDQzMzM4LTgwZjUtNTgxOC04YTY3LWUwOWM4NWQ1M2YxYSIsImNyZWF0ZWQiOjE3NzIzNjc3NDU0NTEsImV4aXN0aW5nIjpmYWxzZX0=; _hjSession_1843527=eyJpZCI6ImM3MzE3ZjYxLTljZWYtNDNiZC05YjM0LWQ0NGIyMmY2NTJjNSIsImMiOjE3NzIzNjc3NDU0NTIsInMiOjAsInIiOjAsInNiIjowLCJzciI6MCwic2UiOjAsImZzIjoxLCJzcCI6MH0=; _ga=GA1.1.1463384861.1772367745; _ga_69YX9CMFC3=GS2.1.s1772367745%24o1%24g1%24t1772367752%24j53%24l0%24h0; X-Trial-Authentication=f32ed307-c80a-48a7-942f-c603b9a31e24; X-Trial-App=microsoft-windows-vps',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*'
    }
  };

  console.log('Making request to:', `https://htmlgw3.apponfly.com${apiPath}`);

  const proxyReq = https.request(options, (proxyRes) => {
    // Set response headers to allow cross-origin requests
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, guacamole-token'
    });

    // Forward response headers
    res.status(proxyRes.statusCode);
    Object.keys(proxyRes.headers).forEach(header => {
      if (!header.startsWith('access-control-')) {
        res.setHeader(header, proxyRes.headers[header]);
      }
    });

    // Pipe response data
    proxyRes.on('data', (chunk) => {
      res.write(chunk);
    });

    proxyRes.on('end', () => {
      res.end();
    });
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err);
    res.status(500).send('Proxy error occurred');
  });

  proxyReq.end();
});

app.listen(PORT, () => {
  console.log(`Reverse proxy server running on port ${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/test`);
  console.log(`RDP API endpoint: http://localhost:${PORT}/rdp-api/session/data/RestAuthProvider/connections/AppOnFly`);
  console.log(`Press Ctrl+C to stop the server`);
});