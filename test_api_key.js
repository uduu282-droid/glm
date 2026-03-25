import https from 'node:https';

const apikey = 'pk_live_Px9T7cai';
const site = 'https://example.com';
const sitekey = 'test-site-key';

const url = `https://cf.zvx.workers.dev/?apikey=${apikey}&url=${site}&key=${sitekey}`;

console.log('Testing with API key:', apikey);
console.log('Full URL:', url);

https.get(url, (res) => {
  let data = '';
  console.log('Status Code:', res.statusCode);
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    try {
      const json = JSON.parse(data);
      console.log('Parsed JSON:', JSON.stringify(json, null, 2));
    } catch(e) {
      console.log('Response is not valid JSON');
    }
  });
}).on('error', (error) => {
  console.error('Error:', error.message);
});