import axios from 'axios';
import fs from 'fs';
import path from 'path';

const WORKER_URL = 'https://aihubmix-worker.llamai.workers.dev';

// All 20 free models
const ALL_MODELS = [
  // Coding Models
  'coding-glm-5-free',
  'coding-glm-5-turbo-free',
  'coding-minimax-m2.7-free',
  'minimax-m2.5-free',
  'coding-minimax-m2.5-free',
  'coding-minimax-m2.1-free',
  'coding-glm-4.7-free',
  'coding-glm-4.6-free',
  'coding-minimax-m2-free',
  'kimi-for-coding-free',
  
  // General Purpose
  'gpt-4.1-free',
  'gpt-4.1-mini-free',
  'gpt-4.1-nano-free',
  'gpt-4o-free',
  'glm-4.7-flash-free',
  'step-3.5-flash-free',
  'mimo-v2-flash-free',
  
  // Vision Models
  'gemini-3.1-flash-image-preview-free',
  'gemini-3-flash-preview-free',
  'gemini-2.0-flash-free'
];

async function testModel(modelId) {
  try {
    const response = await axios.post(
      `${WORKER_URL}/v1/chat/completions`,
      {
        model: modelId,
        messages: [
          {
            role: 'user',
            content: 'Hi! Just testing. Respond with one word: "Working".'
          }
        ]
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      }
    );
    
    if (response.data.choices && response.data.choices.length > 0) {
      const content = response.data.choices[0].message.content;
      return { 
        success: true, 
        model: modelId, 
        response: content.substring(0, 100),
        usage: response.data.usage || null
      };
    } else {
      return { success: false, model: modelId, error: 'No choices in response' };
    }
    
  } catch (error) {
    let errorMsg = error.message;
    if (error.response?.data?.error) {
      errorMsg = error.response.data.error.message || JSON.stringify(error.response.data);
    }
    return { success: false, model: modelId, error: errorMsg };
  }
}

async function main() {
  console.log('🔍 Testing All 20 Free AIHubMix Models via Worker\n');
  console.log('=' .repeat(80));
  console.log(`Worker: ${WORKER_URL}`);
  console.log(`Total Models: ${ALL_MODELS.length}\n`);
  
  // Test health and models endpoint first
  try {
    console.log('📊 Checking endpoints...\n');
    
    const health = await axios.get(`${WORKER_URL}/health`);
    console.log('✅ Health:', health.data);
    
    const modelsList = await axios.get(`${WORKER_URL}/models`);
    console.log('✅ Available models:', modelsList.data.models.length);
    console.log('');
  } catch (error) {
    console.log('❌ Endpoint check failed:', error.message);
  }
  
  console.log('🚀 Starting model tests...\n');
  console.log('(This may take a few minutes)\n');
  
  const results = [];
  const categories = {
    coding: [],
    general: [],
    vision: []
  };
  
  // Categorize models
  ALL_MODELS.forEach(modelId => {
    if (modelId.includes('coding') || modelId.includes('kimi')) {
      categories.coding.push(modelId);
    } else if (modelId.includes('gemini') || modelId.includes('image')) {
      categories.vision.push(modelId);
    } else {
      categories.general.push(modelId);
    }
  });
  
  // Test each category
  for (const [category, models] of Object.entries(categories)) {
    console.log(`\n📁 Testing ${category.toUpperCase()} models (${models.length} models)\n`);
    console.log('-'.repeat(80));
    
    const categoryResults = [];
    
    for (const modelId of models) {
      process.stdout.write(`  🧪 ${modelId.padEnd(45)} ... `);
      
      const result = await testModel(modelId);
      categoryResults.push(result);
      results.push(result);
      
      if (result.success) {
        process.stdout.write('✅\n');
      } else {
        process.stdout.write('❌\n');
        console.log(`     Error: ${result.error.substring(0, 100)}`);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Category summary
    const catSuccess = categoryResults.filter(r => r.success).length;
    const catFailed = categoryResults.filter(r => !r.success).length;
    console.log(`\n   ${category.toUpperCase()} Summary: ✅ ${catSuccess} | ❌ ${catFailed}\n`);
  }
  
  // Final Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 FINAL TEST SUMMARY');
  console.log('='.repeat(80));
  
  const successes = results.filter(r => r.success);
  const failures = results.filter(r => !r.success);
  
  console.log(`\nTotal Models Tested: ${results.length}`);
  console.log(`✅ Successful: ${successes.length} (${Math.round(successes.length / results.length * 100)}%)`);
  console.log(`❌ Failed: ${failures.length} (${Math.round(failures.length / results.length * 100)}%)\n`);
  
  if (successes.length > 0) {
    console.log('✅ WORKING MODELS:\n');
    successes.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.model}`);
    });
  }
  
  if (failures.length > 0) {
    console.log('\n❌ FAILED MODELS:\n');
    failures.forEach((f, i) => {
      console.log(`   ${i + 1}. ${f.model}`);
      console.log(`      Error: ${f.error.substring(0, 150)}`);
    });
  }
  
  // Save results to file
  const outputDir = path.join(process.cwd(), 'aihubmix_test_results');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportFile = path.join(outputDir, `test_report_${timestamp}.json`);
  
  const report = {
    timestamp,
    worker: WORKER_URL,
    totalModels: results.length,
    successful: successes.length,
    failed: failures.length,
    successRate: `${Math.round(successes.length / results.length * 100)}%`,
    results,
    workingModels: successes.map(s => s.model),
    failedModels: failures.map(f => f.model)
  };
  
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(`\n💾 Full report saved to: ${reportFile}\n`);
  
  // Quick reference
  console.log('📝 QUICK USAGE EXAMPLE:\n');
  console.log(`curl ${WORKER_URL}/v1/chat/completions \\`);
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -d \'{"model": "gpt-4o-free", "messages": [{"role": "user", "content": "Hello!"}]}\'\n');
}

main().catch(console.error);
