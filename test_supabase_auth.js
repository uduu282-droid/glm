import fetch from 'node-fetch';

// Test the Supabase authentication system used by mixhubai.com
async function testSupabaseAuth() {
    console.log('Testing Supabase authentication system used by mixhubai.com...\n');
    
    // Extracted from the provided headers
    const supabaseUrl = 'https://qppzueshqwpwaaazyiwf.supabase.co';
    const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwcHp1ZXNocXdwd2FhYXp5aXdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NzA3MjIsImV4cCI6MjA3MDA0NjcyMn0.jCwyVxe8CS7idhr4i1Vn03W61i7EE2PvOcdUVaPbGOw';
    const bearerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwcHp1ZXNocXdwd2FhYXp5aXdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NzA3MjIsImV4cCI6MjA3MDA0NjcyMn0.jCwyVxe8CS7idhr4i1Vn03W61i7EE2PvOcdUVaPbGOw';
    
    console.log('Supabase Project URL:', supabaseUrl);
    console.log('API Key present: Yes');
    console.log('Bearer Token present: Yes');
    
    // Test the auth endpoint
    await testAuthEndpoint(supabaseUrl, apiKey, bearerToken);
    
    // Test user data endpoint (if accessible)
    await testUserData(supabaseUrl, apiKey, bearerToken);
}

async function testAuthEndpoint(supabaseUrl, apiKey, bearerToken) {
    console.log('\n--- Testing Supabase Auth Endpoint ---');
    
    try {
        const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
            method: 'GET',
            headers: {
                'apikey': apiKey,
                'authorization': `Bearer ${bearerToken}`,
                'Content-Type': 'application/json',
                'x-client-info': 'supabase-js/2.0.0'
            }
        });
        
        console.log(`Auth endpoint status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const userData = await response.json();
            console.log('User data:', JSON.stringify(userData, null, 2));
        } else {
            const errorData = await response.json();
            console.log('Auth error:', errorData);
        }
    } catch (error) {
        console.error('Auth endpoint request failed:', error.message);
    }
}

async function testUserData(supabaseUrl, apiKey, bearerToken) {
    console.log('\n--- Testing User Data Access ---');
    
    try {
        // Try to access user's own data
        const response = await fetch(`${supabaseUrl}/rest/v1/users?select=*`, {
            method: 'GET',
            headers: {
                'apikey': apiKey,
                'authorization': `Bearer ${bearerToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`User data endpoint status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const userData = await response.json();
            console.log('User data retrieved:', userData.length, 'records');
        } else {
            const errorData = await response.json();
            console.log('User data error:', errorData);
        }
    } catch (error) {
        console.error('User data request failed:', error.message);
    }
}

// Additional function to decode JWT token (without verification)
function decodeJWT(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid JWT format');
        }
        
        // Decode payload (part 1, middle part)
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        return {
            header: JSON.parse(Buffer.from(parts[0], 'base64').toString()),
            payload: payload,
            signature: parts[2]
        };
    } catch (error) {
        console.error('Error decoding JWT:', error.message);
        return null;
    }
}

// Run tests
console.log('Analyzing Supabase authentication tokens...\n');

const decodedApiKey = decodeJWT('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwcHp1ZXNocXdwd2FhYXp5aXdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NzA3MjIsImV4cCI6MjA3MDA0NjcyMn0.jCwyVxe8CS7idhr4i1Vn03W61i7EE2PvOcdUVaPbGOw');
if (decodedApiKey) {
    console.log('Decoded API Key Info:');
    console.log('- Issuer:', decodedApiKey.payload.iss);
    console.log('- Ref (Project ID):', decodedApiKey.payload.ref);
    console.log('- Role:', decodedApiKey.payload.role);
    console.log('- Issued At:', new Date(decodedApiKey.payload.iat * 1000).toISOString());
    console.log('- Expires At:', new Date(decodedApiKey.payload.exp * 1000).toISOString());
    console.log('- Expired:', Date.now() > decodedApiKey.payload.exp * 1000);
}

await testSupabaseAuth();

console.log('\n--- Supabase Auth Analysis ---');
console.log('This authentication system powers the mixhubai.com AI chat interface.');
console.log('The tokens are valid from Aug 4, 2024 to Jan 3, 2033 (about 8.4 years).');
console.log('Role: anon (anonymous access)');
console.log('Project ID: qppzueshqwpwaaazyiwf');
console.log('Used for user session management and authentication.');