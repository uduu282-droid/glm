import axios from 'axios';

async function testClaudeSonnetAPI() {
    const baseUrl = 'http://apo-fares.abrdns.com/Claude-Sonnet-4.5.php';
    
    console.log('🧪 Testing Claude 4.5 Sonnet API');
    console.log('Base URL:', baseUrl);
    console.log('='.repeat(50));

    // Test 1: GET Request
    console.log('\n📝 Test 1: GET Request');
    console.log('URL: http://apo-fares.abrdns.com/Claude-Sonnet-4.5.php?message=مرحبا');
    
    try {
        const getResponse = await axios.get(baseUrl, {
            params: {
                message: 'مرحبا'
            },
            timeout: 15000
        });
        
        console.log('✅ GET Request SUCCESS');
        console.log('Status:', getResponse.status);
        console.log('Response:', getResponse.data);
        
    } catch (error) {
        console.log('❌ GET Request FAILED');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Response:', error.response.data);
        } else {
            console.log('Error:', error.message);
        }
    }

    // Test 2: POST Request
    console.log('\n📝 Test 2: POST Request');
    console.log('curl -X POST -d "message=اكتب_نصك_هنا" http://apo-fares.abrdns.com/Claude-Sonnet-4.5.php');
    
    try {
        const postResponse = await axios.post(baseUrl, 
            new URLSearchParams({
                message: 'اكتب_نصك_هنا'
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                timeout: 15000
            }
        );
        
        console.log('✅ POST Request SUCCESS');
        console.log('Status:', postResponse.status);
        console.log('Response:', postResponse.data);
        
    } catch (error) {
        console.log('❌ POST Request FAILED');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Response:', error.response.data);
        } else {
            console.log('Error:', error.message);
        }
    }

    // Test 3: English message test
    console.log('\n📝 Test 3: English message');
    
    try {
        const englishResponse = await axios.get(baseUrl, {
            params: {
                message: 'Hello, what can you do?'
            },
            timeout: 15000
        });
        
        console.log('✅ English message SUCCESS');
        console.log('Response:', englishResponse.data);
        
    } catch (error) {
        console.log('❌ English message FAILED');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Response:', error.response.data);
        } else {
            console.log('Error:', error.message);
        }
    }

    // Test 4: Complex message test
    console.log('\n📝 Test 4: Complex message');
    
    try {
        const complexResponse = await axios.post(baseUrl, 
            new URLSearchParams({
                message: 'Explain quantum computing in simple terms'
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                timeout: 20000
            }
        );
        
        console.log('✅ Complex message SUCCESS');
        console.log('Response:', complexResponse.data);
        
    } catch (error) {
        console.log('❌ Complex message FAILED');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Response:', error.response.data);
        } else {
            console.log('Error:', error.message);
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('🏁 Testing completed');
}

// Run the test
testClaudeSonnetAPI()
    .then(() => console.log('✅ All tests completed'))
    .catch(error => console.log('❌ Test suite failed:', error.message));