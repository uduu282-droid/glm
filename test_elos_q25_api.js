import axios from 'axios';

async function testElosQ25API() {
    const baseUrl = 'http://fi8.bot-hosting.net:20163/elos-q2.5';
    
    console.log('🤖 Testing Elos Q2.5 API');
    console.log('Base URL:', baseUrl);
    console.log('='.repeat(50));

    // Test 1: GET Request
    console.log('\n📝 Test 1: GET Request');
    console.log('URL: http://fi8.bot-hosting.net:20163/elos-q2.5?text=hello');
    
    try {
        const getResponse = await axios.get(baseUrl, {
            params: {
                text: 'hello'
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
    console.log('curl -X POST http://fi8.bot-hosting.net:20163/elos-q2.5 \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d \'{"text": "مرحبا، كيف حالك؟"}\'');
    
    try {
        const postResponse = await axios.post(baseUrl, 
            { text: 'مرحبا، كيف حالك؟' },
            {
                headers: {
                    'Content-Type': 'application/json'
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

    // Test 3: English complex query
    console.log('\n📝 Test 3: Complex English query');
    
    try {
        const englishResponse = await axios.get(baseUrl, {
            params: {
                text: 'Explain quantum computing in simple terms'
            },
            timeout: 20000
        });
        
        console.log('✅ Complex English query SUCCESS');
        console.log('Response:', englishResponse.data);
        
    } catch (error) {
        console.log('❌ Complex English query FAILED');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Response:', error.response.data);
        } else {
            console.log('Error:', error.message);
        }
    }

    // Test 4: Arabic query
    console.log('\n📝 Test 4: Arabic query');
    
    try {
        const arabicResponse = await axios.post(baseUrl, 
            { text: 'ما هي الذكاء الاصطناعي؟' },
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 15000
            }
        );
        
        console.log('✅ Arabic query SUCCESS');
        console.log('Response:', arabicResponse.data);
        
    } catch (error) {
        console.log('❌ Arabic query FAILED');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Response:', error.response.data);
        } else {
            console.log('Error:', error.message);
        }
    }

    // Test 5: Very short query
    console.log('\n📝 Test 5: Very short query');
    
    try {
        const shortResponse = await axios.get(baseUrl, {
            params: {
                text: 'hi'
            },
            timeout: 10000
        });
        
        console.log('✅ Short query SUCCESS');
        console.log('Response:', shortResponse.data);
        
    } catch (error) {
        console.log('❌ Short query FAILED');
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
testElosQ25API()
    .then(() => console.log('✅ All tests completed'))
    .catch(error => console.log('❌ Test suite failed:', error.message));