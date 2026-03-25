import https from 'node:https';

// Test the Cloudflare Workers API endpoint
const apikey = 'test-key';
const site = 'https://example.com';
const sitekey = 'test-site-key';

const url = `https://cf.zvx.workers.dev/?apikey=${apikey}&url=${site}&key=${sitekey}`;

console.log('Testing API endpoint:', url);

https.get(url, (res) => {
  let data = '';
  
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response Data:');
    console.log(data);
    
    try {
      const jsonData = JSON.parse(data);
      console.log('Parsed JSON:', JSON.stringify(jsonData, null, 2));
    } catch (e) {
      console.log('Response is not JSON');
    }
  });
}).on('error', (error) => {
  console.error('Request Error:', error.message);
}).setTimeout(10000, function() {
  console.error('Request timeout');
  this.destroy();
});