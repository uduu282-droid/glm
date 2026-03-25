const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Proxy middleware for the RDP API
const rdpProxy = createProxyMiddleware({
  target: 'https://htmlgw3.apponfly.com',
  changeOrigin: true,
  pathRewrite: {
    '^/rdp-api/': '/rdp/api/', // Change /rdp-api/ to /rdp/api/
  },
  onProxyReq: (proxyReq, req, res) => {
    // Add the necessary headers for authentication
    proxyReq.setHeader('guacamole-token', '6E5DA99AED62677008D26045058FCF68B3EB44CBDA836D297F5BE5907AE35DB1');
    proxyReq.setHeader('Cookie', '_gcl_au=1.1.1302641859.1772367745; _gid=GA1.2.55854900.1772367745; _gat_gtag_UA_47851850_1=1; _dc_gtm_UA-47851850-1=1; _hjSessionUser_1843527=eyJpZCI6IjFmNDQzMzM4LTgwZjUtNTgxOC04YTY3LWUwOWM4NWQ1M2YxYSIsImNyZWF0ZWQiOjE3NzIzNjc3NDU0NTEsImV4aXN0aW5nIjpmYWxzZX0=; _hjSession_1843527=eyJpZCI6ImM3MzE3ZjYxLTljZWYtNDNiZC05YjM0LWQ0NGIyMmY2NTJjNSIsImMiOjE3NzIzNjc3NDU0NTIsInMiOjAsInIiOjAsInNiIjowLCJzciI6MCwic2UiOjAsImZzIjoxLCJzcCI6MH0=; _ga=GA1.1.1463384861.1772367745; _ga_69YX9CMFC3=GS2.1.s1772367745%24o1%24g1%24t1772367752%24j53%24l0%24h0; X-Trial-Authentication=f32ed307-c80a-48a7-942f-c603b9a31e24; X-Trial-App=microsoft-windows-vps');
    proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36');
    proxyReq.setHeader('Accept', 'application/json, text/plain, */*');
  },
  onProxyRes: (proxyRes, req, res) => {
    // Remove CORS headers from response to allow browser access
    proxyRes.headers['access-control-allow-origin'] = '*';
    delete proxyRes.headers['access-control-allow-headers'];
    delete proxyRes.headers['access-control-allow-methods'];
  }
});

// Apply the proxy to the /rdp-api route
app.use('/rdp-api', rdpProxy);

// Test endpoint to verify proxy is working
app.get('/test', (req, res) => {
  res.json({ 
    status: 'Proxy is running',
    message: 'Access AppOnFly RDP service through /rdp-api/* endpoints'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Reverse proxy server running on port ${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/test`);
  console.log(`RDP API endpoint: http://localhost:${PORT}/rdp-api/session/data/RestAuthProvider/connections/AppOnFly`);
  console.log(`Press Ctrl+C to stop the server`);
});