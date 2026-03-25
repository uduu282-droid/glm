/**
 * Test PhotoGrid Worker - New Features
 * Tests watermark removal, object removal, and all enhanced features
 */

const axios = require('axios');

const WORKER_URL = 'https://photogrid-proxy.llamai.workers.dev';

async function testNewFeatures() {
  console.log('🧪 Testing PhotoGrid Worker - Enhanced Features\n');
  console.log('=' .repeat(70));
  
  try {
    // Test 1: Health Check
    console.log('\n📊 Test 1: Health Check\n');
    const healthResponse = await axios.get(`${WORKER_URL}/health`);
    console.log('✅ Worker Status:', healthResponse.data);
    
    // Test 2: Get All Features
    console.log('\n\n📊 Test 2: Getting ALL Features\n');
    const featuresResponse = await axios.get(`${WORKER_URL}/features`);
    const featuresData = featuresResponse.data;
    
    console.log('Status:', featuresData.status);
    console.log('AI Categories:', featuresData.categories);
    console.log('AI Styles:', featuresData.aiStyles);
    console.log('\nAvailable Features:');
    console.log('-'.repeat(70));
    
    const featureList = featuresData.features || {};
    
    if (featureList.backgroundRemoval) {
      console.log('✂️  Background Removal:');
      console.log(`   Upload: ${featureList.backgroundRemoval.upload_limit || '∞'} | Download: ${featureList.backgroundRemoval.download_limit || '∞'} | Wait: ${featureList.backgroundRemoval.wtime || 0}s`);
    }
    
    if (featureList.watermarkRemoval) {
      console.log('\n🧹 Watermark Removal:');
      console.log(`   Upload: ${featureList.watermarkRemoval.upload_limit || '∞'} | Download: ${featureList.watermarkRemoval.download_limit || '∞'} | Wait: ${featureList.watermarkRemoval.wtime || 0}s`);
    }
    
    if (featureList.objectRemoval) {
      console.log('\n🎯 Object Removal:');
      console.log(`   Upload: ${featureList.objectRemoval.upload_limit || '∞'} | Download: ${featureList.objectRemoval.download_limit || '∞'} | Wait: ${featureList.objectRemoval.wtime || 0}s`);
    }
    
    if (featureList.imageEnhancement) {
      console.log('\n✨ Image Enhancement:');
      console.log(`   Upload: ${featureList.imageEnhancement.upload_limit || '∞'} | Download: ${featureList.imageEnhancement.download_limit || '∞'} | Wait: ${featureList.imageEnhancement.wtime || 0}s`);
    }
    
    if (featureList.aiStyleTransfer) {
      console.log('\n🎨 AI Style Transfer:');
      console.log(`   Upload: ${featureList.aiStyleTransfer.upload_limit || '∞'} | Download: ${featureList.aiStyleTransfer.download_limit || '∞'} | Wait: ${featureList.aiStyleTransfer.wtime || 0}s`);
    }
    
    if (featureList.superResolution) {
      console.log('\n🔍 Super Resolution:');
      console.log(`   Upload: ${featureList.superResolution.upload_limit || '∞'} | Download: ${featureList.superResolution.download_limit || '∞'} | Wait: ${featureList.superResolution.wtime || 0}s`);
    }
    
    if (featureList.oldPhotoRestoration) {
      console.log('\n📷 Old Photo Restoration:');
      console.log(`   Upload: ${featureList.oldPhotoRestoration.upload_limit || '∞'} | Download: ${featureList.oldPhotoRestoration.download_limit || '∞'} | Wait: ${featureList.oldPhotoRestoration.wtime || 0}s`);
    }
    
    if (featureList.backgroundBlur) {
      console.log('\n🌫️  Background Blur:');
      console.log(`   Upload: ${featureList.backgroundBlur.upload_limit || '∞'} | Download: ${featureList.backgroundBlur.download_limit || '∞'} | Wait: ${featureList.backgroundBlur.wtime || 0}s`);
    }
    
    console.log('\nSession Quota:', featuresData.sessionQuota);
    
    // Test 3: Watermark Removal Endpoint Info
    console.log('\n\n📊 Test 3: Watermark Removal Endpoint\n');
    const wmResponse = await axios.get(`${WORKER_URL}/remove-watermark`);
    console.log('Watermark Removal Info:', wmResponse.data);
    
    // Test 4: Object Removal Endpoint Info
    console.log('\n\n📊 Test 4: Object Removal Endpoint\n');
    const objResponse = await axios.get(`${WORKER_URL}/remove-object`);
    console.log('Object Removal Info:', objResponse.data);
    
    // Test 5: API Proxy Functionality
    console.log('\n\n📊 Test 5: Testing API Proxy (Background Removal)\n');
    const apiTestResponse = await axios.get(`${WORKER_URL}/api/web/nologinmethodlist`);
    const apiData = apiTestResponse.data.data || {};
    console.log('✅ API Proxy Working!');
    console.log('Features detected in response:');
    console.log('   - wn_bgcut (Background Removal):', apiData.wn_bgcut ? '✅' : '❌');
    console.log('   - wn_superremove (Watermark Removal):', apiData.wn_superremove ? '✅' : '❌');
    console.log('   - mcp_remove (Object Removal):', apiData.mcp_remove ? '✅' : '❌');
    console.log('   - wn_enhancer (Image Enhancement):', apiData.wn_enhancer ? '✅' : '❌');
    
    // Test 6: Reset Session
    console.log('\n\n📊 Test 6: Testing Session Reset\n');
    const resetResponse = await axios.get(`${WORKER_URL}/reset`);
    console.log('Reset Status:', resetResponse.data.message);
    console.log('New Sessions Total:', resetResponse.data.totalSessions);
    console.log('Fresh Quota:', resetResponse.data.quota);
    
    // Summary
    console.log('\n' + '=' .repeat(70));
    console.log('📋 TEST SUMMARY');
    console.log('=' .repeat(70));
    console.log('✅ Health Check - PASSED');
    console.log('✅ Features Endpoint - PASSED');
    console.log('✅ Watermark Removal Info - PASSED');
    console.log('✅ Object Removal Info - PASSED');
    console.log('✅ API Proxy - PASSED');
    console.log('✅ Session Management - PASSED');
    console.log('\n🎉 ALL TESTS PASSED!\n');
    
    console.log('💡 USAGE EXAMPLES:');
    console.log('-'.repeat(70));
    console.log('1. Get all features:');
    console.log('   curl https://photogrid-proxy.llamai.workers.dev/features\n');
    
    console.log('2. Watermark removal info:');
    console.log('   curl https://photogrid-proxy.llamai.workers.dev/remove-watermark\n');
    
    console.log('3. Object removal info:');
    console.log('   curl https://photogrid-proxy.llamai.workers.dev/remove-object\n');
    
    console.log('4. Process actual images (via API proxy):');
    console.log('   POST https://photogrid-proxy.llamai.workers.dev/api/ai/remove/watermark');
    console.log('   POST https://photogrid-proxy.llamai.workers.dev/api/ai/remove/object\n');
    
    console.log('=' .repeat(70) + '\n');
    
  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      if (error.response.data) {
        console.error('Response:', JSON.stringify(error.response.data, null, 2));
      }
    }
  }
}

// Run the test
testNewFeatures();
