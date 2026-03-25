import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

// User-Agent pool for rotation
const USER_AGENTS = [
    // Chrome - Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    
    // Chrome - Mac
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    
    // Firefox - Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    
    // Firefox - Mac
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.2; rv:121.0) Gecko/20100101 Firefox/121.0',
    
    // Safari - Mac
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    
    // Edge - Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0'
];

// Accept-Language pool
const ACCEPT_LANGUAGES = [
    'en-US,en;q=0.9',
    'en-GB,en;q=0.9',
    'en-AU,en;q=0.9',
    'en-CA,en;q=0.9',
    'en-IN,en;q=0.9',
    'de-DE,de;q=0.9,en;q=0.8',
    'fr-FR,fr;q=0.9,en;q=0.8',
    'es-ES,es;q=0.9,en;q=0.8',
    'ja-JP,ja;q=0.9,en;q=0.8',
    'zh-CN,zh;q=0.9,en;q=0.8'
];

// Sec-Ch-Ua variants (Chrome versions)
const SEC_CH_UA_VARIANTS = [
    '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    '"Not_A Brand";v="8", "Chromium";v="119", "Google Chrome";v="119"',
    '"Not_A Brand";v="8", "Chromium";v="118", "Google Chrome";v="118"'
];

class HeaderSpoofing {
    constructor() {
        this.requestCount = 0;
        this.lastRotation = Date.now();
    }

    // Get random item from array
    getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    // Generate random platform
    getRandomPlatform() {
        const platforms = [
            'Windows',
            'macOS',
            'Linux x86_64'
        ];
        return this.getRandomItem(platforms);
    }

    // Generate spoofed headers
    generateHeaders(sessionData, options = {}) {
        this.requestCount++;
        
        // Rotate user agent every few requests or after time threshold
        if (this.requestCount % 5 === 0 || Date.now() - this.lastRotation > 300000) {
            this.lastRotation = Date.now();
        }

        const userAgent = this.getRandomItem(USER_AGENTS);
        const acceptLanguage = this.getRandomItem(ACCEPT_LANGUAGES);
        const secChUa = this.getRandomItem(SEC_CH_UA_VARIANTS);
        
        // Extract token from session
        const bearerToken = sessionData.localStorage?.token || '';
        const cookieHeader = sessionData.cookies?.map(c => `${c.name}=${c.value}`).join('; ') || '';

        // Detect browser from user agent
        const isChrome = userAgent.includes('Chrome');
        const isFirefox = userAgent.includes('Firefox');
        const isSafari = userAgent.includes('Safari') && !isChrome;
        const isEdge = userAgent.includes('Edg');

        const baseHeaders = {
            'accept': 'application/json',
            'authorization': `Bearer ${bearerToken}`,
            'user-agent': userAgent,
            'referer': 'https://chat.z.ai/',
            'origin': 'https://chat.z.ai',
            'cookie': cookieHeader,
            'accept-language': acceptLanguage,
            'sec-ch-ua': secChUa,
            'sec-ch-ua-mobile': '?0',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin'
        };

        // Add Chrome-specific headers
        if (isChrome || isEdge) {
            baseHeaders['sec-ch-ua-platform'] = `"${this.getRandomPlatform()}"`;
            baseHeaders['sec-ch-ua-full-version'] = `"120.0.0.0"`;
            baseHeaders['sec-ch-ua-arch'] = '"x86"';
            baseHeaders['sec-ch-ua-bitness'] = '"64"';
            baseHeaders['sec-ch-ua-model'] = '""';
        }

        // Add Firefox-specific headers
        if (isFirefox) {
            delete baseHeaders['sec-ch-ua'];
            delete baseHeaders['sec-ch-ua-mobile'];
            delete baseHeaders['sec-ch-ua-platform'];
        }

        // Add Safari-specific headers
        if (isSafari) {
            delete baseHeaders['sec-ch-ua'];
            delete baseHeaders['sec-ch-ua-mobile'];
            delete baseHeaders['sec-ch-ua-platform'];
            delete baseHeaders['sec-fetch-dest'];
            delete baseHeaders['sec-fetch-mode'];
            delete baseHeaders['sec-fetch-site'];
        }

        // Optional: Add cache-busting
        if (options.cacheBust) {
            baseHeaders['cache-control'] = 'no-cache';
            baseHeaders['pragma'] = 'no-cache';
        }

        // Optional: Add custom connection header
        if (options.connectionSpoof) {
            baseHeaders['connection'] = 'keep-alive';
        }

        return baseHeaders;
    }

    // Get headers with variation
    getVariedHeaders(sessionData, variationLevel = 'medium') {
        const levels = {
            low: { cacheBust: false, connectionSpoof: false },
            medium: { cacheBust: true, connectionSpoof: true },
            high: { cacheBust: true, connectionSpoof: true, rotateAll: true }
        };

        const options = levels[variationLevel] || levels.medium;
        return this.generateHeaders(sessionData, options);
    }

    // Log current configuration
    logCurrentConfig(headers) {
        console.log('\n🎭 Current Header Configuration:');
        console.log(`   User-Agent: ${headers['user-agent'].substring(0, 60)}...`);
        console.log(`   Accept-Language: ${headers['accept-language']}`);
        console.log(`   Platform: ${headers['sec-ch-ua-platform'] || 'N/A'}`);
        console.log(`   Cache Control: ${headers['cache-control'] || 'default'}`);
        console.log(`   Request Count: ${this.requestCount}`);
    }
}

async function testSpoofedRequests() {
    console.log('🎭 Z.AI Header Spoofing & Rotation System');
    console.log('==========================================\n');
    
    // Load session data
    const sessionPath = path.join(process.cwd(), 'universal-ai-proxy', 'zai-session.json');
    let sessionData;
    
    try {
        sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
        console.log('✅ Session loaded\n');
    } catch (error) {
        console.error('❌ No session data found. Run zai_login_explorer.js first\n');
        return;
    }

    const spoofing = new HeaderSpoofing();
    const baseUrl = 'https://chat.z.ai/api/v1/chats/?page=1';
    
    console.log('🚀 Testing with header rotation and spoofing...\n');
    console.log('Strategy:');
    console.log('  • Rotating User-Agent every request');
    console.log('  • Varying Accept-Language');
    console.log('  • Changing Sec-Ch-Ua values');
    console.log('  • Adding cache-busting headers');
    console.log('  • Simulating different browsers/platforms\n');

    const results = [];
    const totalRequests = 10;

    for (let i = 0; i < totalRequests; i++) {
        console.log(`\n📍 Request ${i + 1}/${totalRequests}:`);
        
        // Generate varied headers for each request
        const headers = spoofing.getVariedHeaders(sessionData, 'high');
        spoofing.logCurrentConfig(headers);

        try {
            const response = await fetch(baseUrl, {
                method: 'GET',
                headers: headers
            });

            console.log(`\n📊 Response:`);
            console.log(`   Status: ${response.status} ${response.statusText}`);
            console.log(`   Content-Type: ${response.headers.get('content-type')}`);

            const text = await response.text();
            
            if (response.ok) {
                try {
                    const data = JSON.parse(text);
                    console.log(`   ✅ SUCCESS - Response: ${Array.isArray(data) ? `Array[${data.length}]` : 'JSON'}`);
                    results.push({ 
                        request: i + 1, 
                        status: response.status, 
                        success: true,
                        userAgent: headers['user-agent'].substring(0, 50),
                        response: data
                    });
                } catch {
                    console.log(`   ✅ SUCCESS - Non-JSON response`);
                    results.push({ 
                        request: i + 1, 
                        status: response.status, 
                        success: true,
                        userAgent: headers['user-agent'].substring(0, 50)
                    });
                }
            } else {
                console.log(`   ❌ FAILED - Status: ${response.status}`);
                results.push({ 
                    request: i + 1, 
                    status: response.status, 
                    success: false,
                    userAgent: headers['user-agent'].substring(0, 50),
                    error: text.substring(0, 100)
                });
            }
        } catch (error) {
            console.log(`   ❌ ERROR: ${error.message}`);
            results.push({ 
                request: i + 1, 
                status: 0, 
                success: false,
                userAgent: headers['user-agent'].substring(0, 50),
                error: error.message
            });
        }

        // Random delay between requests (1-3 seconds)
        if (i < totalRequests - 1) {
            const delay = Math.floor(Math.random() * 2000) + 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SPOOFING TEST SUMMARY');
    console.log('='.repeat(60));

    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;

    console.log(`\nTotal Requests: ${results.length}`);
    console.log(`✅ Successful: ${successful} (${((successful/results.length)*100).toFixed(1)}%)`);
    console.log(`❌ Failed: ${failed} (${((failed/results.length)*100).toFixed(1)}%)`);

    if (successful > 0) {
        console.log('\n🎭 Unique User-Agents Used:');
        const uniqueAgents = [...new Set(results.map(r => r.userAgent))];
        uniqueAgents.forEach((ua, i) => {
            console.log(`  ${i + 1}. ${ua}...`);
        });
    }

    // Save results
    const resultsPath = path.join(process.cwd(), 'universal-ai-proxy', 'zai-spoofing-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Results saved to: ${resultsPath}\n`);

    console.log('✨ Spoofing Strategy Active!');
    console.log('   Each request appears to come from a different source.\n');
}

// Export for use in other files
export { HeaderSpoofing, USER_AGENTS, ACCEPT_LANGUAGES };

// Run the test
testSpoofedRequests().catch(console.error);
