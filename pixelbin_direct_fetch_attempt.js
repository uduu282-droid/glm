#!/usr/bin/env node

/**
 * 🎬 PIXELBIN.IO - DIRECT FETCH ATTEMPT (NO CAPTCHA SOLVING)
 * 
 * This tries to call the API directly without browser automation.
 * Spoiler: It won't work because of captcha! 
 */

import axios from 'axios';
import FormData from 'form-data';

console.log('='.repeat(70));
console.log('🎬 PIXELBIN.IO - DIRECT API CALL (NO BROWSER/CAPTCHA)');
console.log('='.repeat(70));

async function directFetch() {
    try {
        // Try to call API directly without captcha
        const formData = new FormData();
        formData.append('input.prompt', 'A beautiful sunset');
        formData.append('input.aspect_ratio', '16:9');
        formData.append('input.duration', '5');
        formData.append('input.category', 'text-to-video');
        formData.append('input.background', 'prompt');
        // NO captchaToken - let's see what happens!
        
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Origin': 'https://www.pixelbin.io',
            'Referer': 'https://www.pixelbin.io/',
            ...formData.getHeaders()
        };
        
        console.log('\n📤 Attempting direct API call WITHOUT captcha...\n');
        
        const response = await axios.post(
            'https://api.pixelbin.io/service/public/transformation/v1.0/predictions/veo2/generate',
            formData,
            {
                headers: headers,
                timeout: 30000
            }
        );
        
        console.log('✅ Status:', response.status);
        console.log('\n📊 Response:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.log('\n❌ FAILED! (As expected)\n');
        console.log('Error:', error.message);
        
        if (error.response) {
            console.log('\n📋 Server Response:');
            console.log('Status:', error.response.status);
            console.log('Data:', JSON.stringify(error.response.data, null, 2));
            
            console.log('\n' + '='.repeat(70));
            console.log('💡 WHY IT FAILED:');
            console.log('='.repeat(70));
            
            if (error.response.status === 400 || error.response.status === 401) {
                console.log('❌ Missing required authentication (captchaToken)');
                console.log('❌ The website requires captcha solving before API calls');
                console.log('❌ You CANNOT just call the API directly!');
            } else if (error.response.status === 403) {
                console.log('❌ Access forbidden - need valid session/captcha');
            } else {
                console.log('❌ Server rejected request - needs captcha/session');
            }
            
            console.log('\n' + '='.repeat(70));
            console.log('🤔 SO WHY DO WE NEED BROWSER AUTOMATION?');
            console.log('='.repeat(70));
            console.log('1. ✅ Website has captcha/human verification');
            console.log('2. ✅ Captcha generates dynamic tokens');
            console.log('3. ✅ Tokens expire quickly (5-10 min)');
            console.log('4. ✅ Can\'t bypass captcha - must solve it');
            console.log('5. ✅ Browser automation = easiest way to get tokens');
            console.log('\n🎯 THAT\'S WHY we capture from real browser sessions!');
            console.log('='.repeat(70));
        }
    }
}

directFetch();
