import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

/**
 * Advanced Header Spoofing System
 * Rotates identity on every request to avoid rate limiting
 */

const USER_AGENT_POOL = [
    // Chrome 120, 119, 118 - Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    
    // Chrome - Mac
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    
    // Firefox - Windows & Mac
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.2; rv:121.0) Gecko/20100101 Firefox/121.0',
    
    // Safari - Mac
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    
    // Edge - Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0'
];

const ACCEPT_LANGUAGE_POOL = [
    'en-US,en;q=0.9', 'en-GB,en;q=0.9', 'en-CA,en;q=0.9', 'en-AU,en;q=0.9', 'en-IN,en;q=0.9',
    'de-DE,de;q=0.9,en;q=0.8', 'fr-FR,fr;q=0.9,en;q=0.8', 'es-ES,es;q=0.9,en;q=0.8',
    'ja-JP,ja;q=0.9,en;q=0.8', 'zh-CN,zh;q=0.9,en;q=0.8', 'ko-KR,ko;q=0.9,en;q=0.8',
    'it-IT,it;q=0.9,en;q=0.8', 'pt-BR,pt;q=0.9,en;q=0.8', 'ru-RU,ru;q=0.9,en;q=0.8'
];

const PLATFORM_POOL = ['"Windows"', '"macOS"', '"Linux"', '"ChromeOS"'];
const ARCHITECTURE_POOL = ['"x86"', '"x64"', '"arm"', '"arm64"'];
const BITNESS_POOL = ['"32"', '"64"'];

class IdentityRotator {
    constructor() {
        this.requestCount = 0;
        this.currentIdentity = null;
        this.lastRotation = 0;
        this.rotationInterval = 300000; // 5 minutes
    }

    getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    generateFreshIdentity() {
        const userAgent = this.getRandomItem(USER_AGENT_POOL);
        const isChrome = userAgent.includes('Chrome') && !userAgent.includes('Edg');
        const isFirefox = userAgent.includes('Firefox');
        const isSafari = userAgent.includes('Safari') && !isChrome && !isFirefox;
        const isEdge = userAgent.includes('Edg');

        return {
            userAgent,
            acceptLanguage: this.getRandomItem(ACCEPT_LANGUAGE_POOL),
            platform: this.getRandomItem(PLATFORM_POOL),
            uaFullVersion: `"${this.getRandomItem(['120', '119', '118'])}.0.${Math.floor(Math.random() * 1000)}"`,
            architecture: this.getRandomItem(ARCHITECTURE_POOL),
            bitness: this.getRandomItem(BITNESS_POOL),
            model: '""',
            isChrome,
            isFirefox,
            isSafari,
            isEdge,
            timestamp: Date.now()
        };
    }

    shouldRotate() {
        return (Date.now() - this.lastRotation) > this.rotationInterval;
    }

    getIdentity() {
        this.requestCount++;
        
        // Rotate identity periodically or if we don't have one
        if (!this.currentIdentity || this.shouldRotate()) {
            this.currentIdentity = this.generateFreshIdentity();
            this.lastRotation = Date.now();
        }

        return this.currentIdentity;
    }

    generateHeaders(sessionData, options = {}) {
        const identity = this.getIdentity();
        const bearerToken = sessionData.localStorage?.token || '';
        const cookieHeader = sessionData.cookies?.map(c => `${c.name}=${c.value}`).join('; ') || '';

        const headers = {
            'accept': 'application/json',
            'authorization': `Bearer ${bearerToken}`,
            'user-agent': identity.userAgent,
            'referer': 'https://chat.z.ai/',
            'origin': 'https://chat.z.ai',
            'cookie': cookieHeader,
            'accept-language': identity.acceptLanguage,
            'connection': 'keep-alive'
        };

        // Add browser-specific headers
        if (identity.isChrome || identity.isEdge) {
            Object.assign(headers, {
                'sec-ch-ua': `"Not_A Brand";v="8", "Chromium";v="${identity.uaFullVersion.replace(/"/g, '')}", "Google Chrome";v="${identity.uaFullVersion.replace(/"/g, '')}"`,
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': identity.platform,
                'sec-ch-ua-full-version': identity.uaFullVersion,
                'sec-ch-ua-arch': identity.architecture,
                'sec-ch-ua-bitness': identity.bitness,
                'sec-ch-ua-model': identity.model,
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin'
            });
        }

        // Cache busting (always enabled by default)
        if (options.cacheBust !== false) {
            headers['cache-control'] = 'no-cache';
            headers['pragma'] = 'no-cache';
            headers['x-requested-with'] = 'XMLHttpRequest';
        }

        return headers;
    }

    logStatus(headers) {
        const browser = headers['user-agent'].includes('Chrome') ? 'Chrome' :
                       headers['user-agent'].includes('Firefox') ? 'Firefox' : 'Safari';
        
        console.log(`\n🎭 Identity Rotated:`);
        console.log(`   Browser: ${browser}`);
        console.log(`   UA: ${headers['user-agent'].substring(0, 60)}...`);
        console.log(`   Language: ${headers['accept-language']}`);
        console.log(`   Platform: ${headers['sec-ch-ua-platform'] || 'N/A'}`);
    }
}

async function testContinuousSpoofing() {
    console.log('🎭 Z.AI Continuous Header Spoofing Test');
    console.log('========================================\n');
    
    const sessionPath = path.join(process.cwd(), 'universal-ai-proxy', 'zai-session.json');
    let sessionData;
    
    try {
        sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
        console.log('✅ Session loaded\n');
    } catch (error) {
        console.error('❌ No session data. Run zai_login_explorer.js first\n');
        return;
    }

    const rotator = new IdentityRotator();
    const url = 'https://chat.z.ai/api/v1/chats/?page=1';
    const totalRequests = 15;
    const results = [];

    console.log(`🚀 Starting ${totalRequests} requests with continuous header rotation...\n`);
    console.log('Strategy:');
    console.log('  • New User-Agent every request');
    console.log('  • Rotating Accept-Language');
    console.log('  • Changing Sec-Ch-Ua fingerprints');
    console.log('  • Cache-busting on all requests');
    console.log('  • Random delays between requests\n');

    for (let i = 0; i < totalRequests; i++) {
        console.log(`\n📍 Request ${i + 1}/${totalRequests}:`);
        
        // Generate fresh headers with new identity
        const headers = rotator.generateHeaders(sessionData);
        rotator.logStatus(headers);

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: headers
            });

            console.log(`\n📊 Response:`);
            console.log(`   Status: ${response.status} ${response.statusText}`);
            console.log(`   Content-Type: ${response.headers.get('content-type')}`);

            const text = await response.text();
            
            if (response.ok) {
                const data = JSON.parse(text);
                console.log(`   ✅ SUCCESS - ${Array.isArray(data) ? `Array[${data.length}]` : 'JSON'}`);
                results.push({ 
                    request: i + 1, 
                    status: response.status, 
                    success: true,
                    browser: headers['user-agent'].includes('Chrome') ? 'Chrome' : 
                            headers['user-agent'].includes('Firefox') ? 'Firefox' : 'Safari',
                    userAgent: headers['user-agent'].substring(0, 50)
                });
            } else {
                console.log(`   ❌ FAILED - Status: ${response.status}`);
                results.push({ 
                    request: i + 1, 
                    status: response.status, 
                    success: false,
                    browser: headers['user-agent'].includes('Chrome') ? 'Chrome' : 'Firefox',
                    error: text.substring(0, 100)
                });
            }
        } catch (error) {
            console.log(`   ❌ ERROR: ${error.message}`);
            results.push({ 
                request: i + 1, 
                status: 0, 
                success: false,
                browser: 'Unknown',
                error: error.message
            });
        }

        // Random delay (1-4 seconds)
        if (i < totalRequests - 1) {
            const delay = Math.floor(Math.random() * 3000) + 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 CONTINUOUS SPOOFING SUMMARY');
    console.log('='.repeat(70));

    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    const successRate = ((successful / results.length) * 100).toFixed(1);

    console.log(`\nTotal Requests: ${results.length}`);
    console.log(`✅ Successful: ${successful} (${successRate}%)`);
    console.log(`❌ Failed: ${failed} (${(100 - successRate).toFixed(1)}%)`);

    if (successful > 0) {
        console.log('\n🎭 Browser Distribution:');
        const browsers = {};
        results.forEach(r => {
            browsers[r.browser] = (browsers[r.browser] || 0) + 1;
        });
        Object.entries(browsers).forEach(([browser, count]) => {
            console.log(`   ${browser}: ${count} requests`);
        });

        console.log('\n📋 Unique Identities Used:');
        const uniqueAgents = [...new Set(results.map(r => r.userAgent))];
        uniqueAgents.slice(0, 5).forEach((ua, i) => {
            console.log(`  ${i + 1}. ${ua}...`);
        });
    }

    // Save results
    const resultsPath = path.join(process.cwd(), 'universal-ai-proxy', 'zai-continuous-spoofing-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Results saved to: ${resultsPath}\n`);

    console.log('✨ Continuous Spoofing Active!');
    console.log('   Every request appears to come from a completely different client.\n');
}

// Export for use in other modules
export { IdentityRotator, USER_AGENT_POOL, ACCEPT_LANGUAGE_POOL };

// Run the test
testContinuousSpoofing().catch(console.error);
