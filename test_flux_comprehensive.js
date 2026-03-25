// Comprehensive test for Flux Image Generator
import { FluxImageGenerator } from './flux_image_generator.js';

async function runTests() {
    console.log('🧪 FLUX Image Generator - Comprehensive Testing\n');
    
    const generator = new FluxImageGenerator();
    const results = [];
    
    // Test 1: Basic generation
    console.log('Test 1: Basic Generation');
    console.log('-'.repeat(50));
    const start1 = Date.now();
    const result1 = await generator.generate('a simple cat', {
        width: 512,
        height: 512,
        num_inference_steps: 20
    });
    const time1 = ((Date.now() - start1) / 1000).toFixed(2);
    results.push({
        test: 'Basic Generation',
        success: result1.success,
        time: time1,
        error: result1.error || null
    });
    console.log(`Time: ${time1}s\n`);
    
    // Test 2: Higher quality
    console.log('\nTest 2: Higher Quality (50 steps)');
    console.log('-'.repeat(50));
    const start2 = Date.now();
    const result2 = await generator.generate('a beautiful landscape with mountains and lake at sunset', {
        width: 512,
        height: 512,
        num_inference_steps: 50,
        guidance_scale: 5.0
    });
    const time2 = ((Date.now() - start2) / 1000).toFixed(2);
    results.push({
        test: 'High Quality (50 steps)',
        success: result2.success,
        time: time2,
        error: result2.error || null
    });
    console.log(`Time: ${time2}s\n`);
    
    // Test 3: Different aspect ratio
    console.log('\nTest 3: Portrait Mode (768x1024)');
    console.log('-'.repeat(50));
    const start3 = Date.now();
    const result3 = await generator.generate('a portrait of a wise owl', {
        width: 768,
        height: 1024,
        num_inference_steps: 30
    });
    const time3 = ((Date.now() - start3) / 1000).toFixed(2);
    results.push({
        test: 'Portrait Mode',
        success: result3.success,
        time: time3,
        error: result3.error || null
    });
    console.log(`Time: ${time3}s\n`);
    
    // Test 4: Square format
    console.log('\nTest 4: Square Format (1024x1024)');
    console.log('-'.repeat(50));
    const start4 = Date.now();
    const result4 = await generator.generate('futuristic cyberpunk city at night', {
        width: 1024,
        height: 1024,
        num_inference_steps: 30
    });
    const time4 = ((Date.now() - start4) / 1000).toFixed(2);
    results.push({
        test: 'Square Format (1024x1024)',
        success: result4.success,
        time: time4,
        error: result4.error || null
    });
    console.log(`Time: ${time4}s\n`);
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${results.length}`);
    console.log(`Successful: ${results.filter(r => r.success).length}`);
    console.log(`Failed: ${results.filter(r => !r.success).length}`);
    console.log(`Success Rate: ${(results.filter(r => r.success).length / results.length * 100).toFixed(1)}%`);
    console.log('\nDetailed Results:');
    results.forEach((r, i) => {
        console.log(`\n${i + 1}. ${r.test}`);
        console.log(`   Status: ${r.success ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`   Time: ${r.time}s`);
        if (r.error) console.log(`   Error: ${r.error}`);
    });
    
    // Save results
    const fs = require('fs');
    const reportFile = 'flux_test_results.json';
    fs.writeFileSync(reportFile, JSON.stringify({
        timestamp: new Date().toISOString(),
        totalTests: results.length,
        successRate: (results.filter(r => r.success).length / results.length * 100).toFixed(1) + '%',
        results: results
    }, null, 2));
    console.log(`\n💾 Results saved to: ${reportFile}`);
    
    return results;
}

runTests().catch(console.error);
