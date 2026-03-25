#!/usr/bin/env node

/**
 * 🧪 ZAI API Quick Test Script
 * 
 * A simple, fast way to verify your ZAI API is working.
 * Run this anytime you want a quick status check!
 * 
 * Usage: node test_zai_quick.js
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

console.log('⚡ ZAI API Quick Check');
console.log('='.repeat(50));

// Load session
const sessionPath = path.join(process.cwd(), 'universal-ai-proxy', 'zai-session.json');

try {
    const sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
    
    // Extract token
    const token = sessionData.localStorage.token;
    
    // Quick API call
    const url = 'https://chat.z.ai/api/v1/chats/?page=1';
    const headers = {
        'accept': 'application/json',
        'authorization': `Bearer ${token}`
    };
    
    console.log('\n📡 Checking API...\n');
    
    const response = await fetch(url, { method: 'GET', headers });
    
    if (response.ok) {
        const data = await response.json();
        
        console.log('✅ STATUS: WORKING');
        console.log(`   Response: ${response.status} ${response.statusText}`);
        console.log(`   Chats Found: ${Array.isArray(data) ? data.length : 'N/A'}`);
        console.log(`   Token Status: Valid`);
        
        if (Array.isArray(data) && data.length > 0) {
            const latest = data[0];
            console.log(`\n📋 Latest Chat:`);
            console.log(`   Title: ${latest.title}`);
            console.log(`   Created: ${new Date(latest.created_at * 1000).toLocaleString()}`);
        }
        
        console.log('\n✨ All systems operational!\n');
        
    } else {
        console.log('❌ STATUS: ISSUE DETECTED');
        console.log(`   Response: ${response.status} ${response.statusText}`);
        console.log('\n💡 Try refreshing tokens:');
        console.log('   node zai_login_explorer.js\n');
    }
    
} catch (error) {
    console.log('❌ ERROR:', error.message);
    console.log('\n💡 Make sure you have session data:');
    console.log('   node zai_login_explorer.js\n');
}
