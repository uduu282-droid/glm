import { spawn } from 'child_process';

function runCurlTest() {
    const curlCommand = [
        'curl',
        'https://streaming-chatly.vyro.ai/v2/agent/completions',
        '-H', 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTkyOWI0NC0yNzljLTQ5NGYtOTY2ZC0zMmNkNzc0NzAxZDUiLCJpbnRlZ3JpdHlDaGVjayI6ZmFsc2UsImJhc2VVcmwiOiJodHRwczovL2NoYXRseWFpLmFwcCIsInByb2R1Y3RWYWxpZEZvciI6IkNIQVRMWSIsImlzQWRtaW4iOmZhbHNlLCJpYXQiOjE3NzIzNjY1NDYsImV4cCI6MTc3MjM4ODE0Niwic3ViIjoiMGU5MjliNDQtMjc5Yy00OTRmLTk2NmQtMzJjZDc3NDcwMWQ1IiwianRpIjoiNDkyYTUxOTMtY2NiNC00MzNkLWI2YzMtNjQ1ZDEyN2MxNjcyIn0.wan26qpBoVuzODEteDWJ4xtSIkPqMqtbYH_9YyuDxQ8',
        '-H', 'X-Org-Id: 0e929b44-279c-494f-966d-32cd774701d5',
        '-H', 'Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryTest123',
        '-F', 'messages=[{"role":"user","content":"Hello"}]',
        '-F', 'stream=false',
        '-v'
    ];

    console.log('Running curl test...');
    console.log('Command:', curlCommand.join(' '));
    console.log('---\n');

    const child = spawn('curl', curlCommand.slice(1), { 
        stdio: ['pipe', 'pipe', 'pipe'] 
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
        stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
        stderr += data.toString();
    });

    child.on('close', (code) => {
        console.log('Curl process exited with code:', code);
        console.log('\nSTDOUT:');
        console.log(stdout);
        console.log('\nSTDERR:');
        console.log(stderr);
        
        if (code === 0) {
            console.log('\n✅ Curl test successful');
        } else {
            console.log('\n❌ Curl test failed');
        }
    });

    child.on('error', (error) => {
        console.log('❌ Curl process error:', error.message);
    });
}

// Also try a different approach with node-fetch
async function testWithNodeFetch() {
    try {
        const fetch = (await import('node-fetch')).default;
        
        console.log('\nTesting with node-fetch...');
        
        const formData = new (await import('formdata-node')).FormData();
        formData.append('messages', JSON.stringify([{
            role: 'user',
            content: 'Hello'
        }]));
        formData.append('stream', 'false');

        const response = await fetch('https://streaming-chatly.vyro.ai/v2/agent/completions', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTkyOWI0NC0yNzljLTQ5NGYtOTY2ZC0zMmNkNzc0NzAxZDUiLCJpbnRlZ3JpdHlDaGVjayI6ZmFsc2UsImJhc2VVcmwiOiJodHRwczovL2NoYXRseWFpLmFwcCIsInByb2R1Y3RWYWxpZEZvciI6IkNIQVRMWSIsImlzQWRtaW4iOmZhbHNlLCJpYXQiOjE3NzIzNjY1NDYsImV4cCI6MTc3MjM4ODE0Niwic3ViIjoiMGU5MjliNDQtMjc5Yy00OTRmLTk2NmQtMzJjZDc3NDcwMWQ1IiwianRpIjoiNDkyYTUxOTMtY2NiNC00MzNkLWI2YzMtNjQ1ZDEyN2MxNjcyIn0.wan26qpBoVuzODEteDWJ4xtSIkPqMqtbYH_9YyuDxQ8',
                'X-Org-Id': '0e929b44-279c-494f-966d-32cd774701d5'
            },
            body: formData
        });

        console.log('Status:', response.status);
        console.log('Response:', await response.text());
        
        return response.ok;

    } catch (error) {
        console.log('node-fetch test failed:', error.message);
        return false;
    }
}

// Try to install required packages and run tests
async function runAllTests() {
    console.log('🧪 Testing Chatly API with multiple approaches\n');
    
    // First try curl
    runCurlTest();
    
    // Then try node-fetch after a delay
    setTimeout(async () => {
        try {
            await testWithNodeFetch();
        } catch (error) {
            console.log('All tests completed with errors');
        }
    }, 2000);
}

runAllTests();