/**
 * Debug GPT-5.2 response format
 */

import fetch from 'node-fetch';

async function debugGPT() {
  const baseUrl = 'https://n33-ai.qwen4346.workers.dev/v1';
  
  console.log('🔍 Debugging GPT-5.2 response format...\n');
  
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test'
    },
    body: JSON.stringify({
      model: 'gpt-5.2',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say hello in one word' }
      ],
      max_tokens: 50,
      temperature: 0.7,
      stream: false
    })
  });
  
  const rawText = await response.text();
  
  console.log('Raw Response:');
  console.log('='.repeat(60));
  console.log(rawText);
  console.log('='.repeat(60));
  
  // Try to parse as JSON
  try {
    const data = JSON.parse(rawText);
    console.log('\nParsed JSON:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.choices && data.choices[0]) {
      console.log('\nExtracted content:', data.choices[0].message?.content || 'N/A');
    }
  } catch (e) {
    console.log('\n❌ Not valid JSON');
    console.log('Error:', e.message);
  }
}

debugGPT().catch(console.error);
