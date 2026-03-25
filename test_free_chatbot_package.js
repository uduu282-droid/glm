
const {
  createPhindChat,
  createDuckDuckGoChat,
  createBlackboxChat,
} = require("free-chatbot");

async function testAllProviders() {
  console.log("=== Testing Free Chatbot Package ===\n");
  
  // Test 1: Phind Provider
  console.log("1. Testing Phind Provider:");
  try {
    const phind = createPhindChat();
    console.time("Phind Response Time");
    const phindResponse = await phind.chat("What is JavaScript in one sentence?");
    console.timeEnd("Phind Response Time");
    console.log("Phind response:", phindResponse);
    console.log("-----------------------------\n");
  } catch (error) {
    console.error("Phind Error:", error.message);
    console.log("-----------------------------\n");
  }

  // Test 2: DuckDuckGo Provider
  console.log("2. Testing DuckDuckGo Provider:");
  try {
    const ddg = createDuckDuckGoChat();
    console.time("DuckDuckGo Response Time");
    const ddgResponse = await ddg.chat("What is Python in one sentence?");
    console.timeEnd("DuckDuckGo Response Time");
    console.log("DuckDuckGo response:", ddgResponse);
    console.log("-----------------------------\n");
  } catch (error) {
    console.error("DuckDuckGo Error:", error.message);
    console.log("-----------------------------\n");
  }

  // Test 3: Blackbox Provider
  console.log("3. Testing Blackbox Provider:");
  try {
    const blackbox = createBlackboxChat();
    console.time("Blackbox Response Time");
    const blackboxResponse = await blackbox.chat("Write a simple hello world function in JavaScript");
    console.timeEnd("Blackbox Response Time");
    console.log("Blackbox response:", blackboxResponse);
    console.log("-----------------------------\n");
  } catch (error) {
    console.error("Blackbox Error:", error.message);
    console.log("-----------------------------\n");
  }

  console.log("=== Testing Complete ===");
}

testAllProviders().catch(console.error);
