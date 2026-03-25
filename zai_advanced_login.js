import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

// Advanced User-Agent and header pools
const USER_AGENTS = [
    // Chrome Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    // Chrome Mac
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    // Firefox
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.2; rv:121.0) Gecko/20100101 Firefox/121.0',
    // Safari
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    // Edge
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
];

const ACCEPT_LANGUAGES = [
    'en-US,en;q=0.9', 'en-GB,en;q=0.9', 'en-CA,en;q=0.9', 'en-AU,en;q=0.9',
    'de-DE,de;q=0.9', 'fr-FR,fr;q=0.9', 'es-ES,es;q=0.9', 'ja-JP,ja;q=0.9',
    'zh-CN,zh;q=0.9', 'ko-KR,ko;q=0.9', 'it-IT,it;q=0.9', 'pt-BR,pt;q=0.9'
];

const PLATFORMS = ['"Windows"', '"macOS"', '"Linux"', '"ChromeOS"', '"Android"', '"iPhone"'];

class AdvancedHeaderSpoofing {
    constructor() {
        this.requestCount = 0;
        this.sessionId = Math.random().toString(36).substring(7);
        this.lastRotation = Date.now();
    }

    getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    generateDeviceFingerprint() {
        // Generate consistent but random device fingerprints
        return {
            platform: this.getRandomItem(PLATFORMS),
            uaFullVersion: `"${Math.floor(Math.random() * 10 + 110)}.0.${Math.floor(Math.random() * 1000)}"`,
            architecture: this.getRandomItem(['"x86"', '"x64"', '"arm"', '"arm64"']),
            bitness: this.getRandomItem(['"32"', '"64"']),
            model: '""'
        };
    }

    generateHeaders(sessionData, options = {}) {
        this.requestCount++;
        
        // Rotate identity every 5 requests or 5 minutes
        if (this.requestCount % 5 === 0 || Date.now() - this.lastRotation > 300000) {
            this.lastRotation = Date.now();
        }

        const userAgent = this.getRandomItem(USER_AGENTS);
        const acceptLanguage = this.getRandomItem(ACCEPT_LANGUAGES);
        const device = this.generateDeviceFingerprint();
        
        const bearerToken = sessionData.localStorage?.token || '';
        const cookieHeader = sessionData.cookies?.map(c => `${c.name}=${c.value}`).join('; ') || '';

        const isChrome = userAgent.includes('Chrome') && !userAgent.includes('Edg');
        const isFirefox = userAgent.includes('Firefox');
        const isSafari = userAgent.includes('Safari') && !isChrome && !isFirefox;
        const isEdge = userAgent.includes('Edg');

        // Base headers all requests need
        const headers = {
            'accept': 'application/json',
            'authorization': `Bearer ${bearerToken}`,
            'user-agent': userAgent,
            'referer': 'https://chat.z.ai/',
            'origin': 'https://chat.z.ai',
            'cookie': cookieHeader,
            'accept-language': acceptLanguage
        };

        // Add Chrome/Chromium specific headers
        if (isChrome || isEdge) {
            Object.assign(headers, {
                'sec-ch-ua': `"Not_A Brand";v="8", "Chromium";v="${Math.floor(Math.random() * 10 + 110)}", "Google Chrome";v="${Math.floor(Math.random() * 10 + 110)}"`,
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': device.platform,
                'sec-ch-ua-full-version': device.uaFullVersion,
                'sec-ch-ua-arch': device.architecture,
                'sec-ch-ua-bitness': device.bitness,
                'sec-ch-ua-model': device.model,
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin'
            });
        }

        // Firefox doesn't have sec-ch-ua headers
        if (isFirefox) {
            Object.assign(headers, {
                'cache-control': 'no-cache',
                'pragma': 'no-cache'
            });
        }

        // Safari minimal headers
        if (isSafari) {
            Object.assign(headers, {
                'cache-control': 'no-cache'
            });
        }

        // Always add cache busting
        if (options.cacheBust !== false) {
            headers['cache-control'] = 'no-cache';
            headers['pragma'] = 'no-cache';
            headers['x-requested-with'] = 'XMLHttpRequest';
        }

        // Add connection management
        headers['connection'] = 'keep-alive';

        return headers;
    }

    logConfig(headers, requestNum) {
        console.log(`\n🎭 Request #${requestNum} - Spoofed Identity:`);
        console.log(`   Browser: ${headers['user-agent'].includes('Chrome') ? 'Chrome' : headers['user-agent'].includes('Firefox') ? 'Firefox' : 'Safari'}`);
        console.log(`   User-Agent: ${headers['user-agent'].substring(0, 50)}...`);
        console.log(`   Language: ${headers['accept-language']}`);
        console.log(`   Platform: ${headers['sec-ch-ua-platform'] || 'N/A'}`);
        console.log(`   Cache: ${headers['cache-control'] || 'default'}`);
    }
}

async function loginWithAdvancedSpoofing() {
    console.log('🎭 Z.AI Advanced Login with Header Spoofing');
    console.log('=============================================\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        args: ['--window-size=1280,900', '--disable-blink-features=AutomationControlled']
    });
    
    const context = await browser.newContext({
        viewport: { width: 1280, height: 900 },
        userAgent: getRandomItem(USER_AGENTS),
        locale: 'en-US',
        timezoneId: 'America/New_York',
        permissions: ['geolocation'],
        geolocation: { longitude: -74.0060, latitude: 40.7128 } // New York
    });
    
    const page = await context.newPage();
    
    try {
        console.log('📍 Navigating to https://chat.z.ai...');
        await page.goto('https://chat.z.ai/', { 
            waitUntil: 'domcontentloaded',
            timeout: 30000 
        });
        
        console.log('✅ Page loaded!\n');
        
        console.log('👉 Please log in to your Z.ai account');
        console.log('   You have 2 minutes to complete login...\n');
        
        let loggedIn = false;
        let maxAttempts = 60;
        let attempts = 0;
        
        while (!loggedIn && attempts < maxAttempts) {
            await page.waitForTimeout(2000);
            attempts++;
            
            const currentUrl = page.url();
            const content = await page.content();
            
            if (currentUrl.includes('/chat') || 
                content.includes('textarea') || 
                content.includes('message') ||
                (!content.includes('login') && !content.includes('sign in'))) {
                
                console.log('\n✅ Login detected!\n');
                loggedIn = true;
                break;
            }
            
            if (attempts % 10 === 0) {
                console.log(`⏳ Still waiting... (${attempts * 2}s)`);
            }
        }
        
        if (!loggedIn) {
            console.log('\n⚠️  Login timeout.\n');
            await browser.close();
            return;
        }
        
        // Extract session data
        console.log('💾 Extracting session data...');
        
        const cookies = await context.cookies();
        const localStorage = await page.evaluate(() => {
            const data = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                data[key] = localStorage.getItem(key);
            }
            return data;
        });
        
        const sessionData = {
            cookies: cookies.map(cookie => ({
                name: cookie.name,
                value: cookie.value,
                domain: cookie.domain,
                path: cookie.path || '/',
                expires: cookie.expires || -1
            })),
            localStorage: localStorage,
            url: page.url(),
            timestamp: Date.now()
        };
        
        const sessionPath = path.join(process.cwd(), 'universal-ai-proxy', 'zai-session.json');
        fs.writeFileSync(sessionPath, JSON.stringify(sessionData, null, 2));
        console.log(`✅ Session saved to: ${sessionPath}\n`);
        
        // Test with advanced spoofing
        console.log('🧪 Testing API with Advanced Header Spoofing...\n');
        
        const spoofing = new AdvancedHeaderSpoofing();
        const bearerToken = localStorage.token;
        
        const testUrls = [
            'https://chat.z.ai/api/v1/chats/?page=1',
            'https://chat.z.ai/api/v1/chats/?page=2'
        ];
        
        for (let i = 0; i < testUrls.length; i++) {
            const headers = spoofing.generateHeaders(sessionData);
            spoofing.logConfig(headers, i + 1);
            
            try {
                const response = await fetch(testUrls[i], {
                    method: 'GET',
                    headers: headers
                });
                
                console.log(`\n📊 Response:`);
                console.log(`   Status: ${response.status} ${response.statusText}`);
                
                if (response.ok) {
                    const text = await response.text();
                    const data = JSON.parse(text);
                    console.log(`   ✅ SUCCESS - ${Array.isArray(data) ? `${data.length} chats` : 'JSON response'}`);
                } else {
                    console.log(`   ❌ FAILED - ${response.status}`);
                }
            } catch (error) {
                console.log(`   ❌ ERROR: ${error.message}`);
            }
        }
        
        console.log('\n✨ Setup complete! Headers will be automatically rotated on each request.\n');
        console.log('Press ENTER to close browser...\n');
        await new Promise(r => process.stdin.once('data', r));
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await browser.close();
    }
}

function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Run the advanced login
loginWithAdvancedSpoofing().catch(console.error);
