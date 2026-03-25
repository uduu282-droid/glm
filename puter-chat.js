
// js/puter-chat.js - Example implementation
const puter = require('puter-js');

// Configuration
const CONFIG = {
  DEFAULT_MODEL: 'claude-sonnet-4-5'
};

/**
 * Send a message using Puter.js AI
 * @param {string} message - The user's message
 * @param {Array} conversationHistory - Previous conversation messages
 * @returns {Promise} - Stream or response from AI
 */
async function sendMessage(message, conversationHistory = []) {
  try {
    // Format messages for the API
    const messages = conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    messages.push({ role: 'user', content: message });

    // Send chat request with streaming
    const response = await puter.ai.chat(messages, {
      model: CONFIG.DEFAULT_MODEL,
      stream: true
    });

    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

/**
 * Process a streaming response
 * @param {AsyncIterable} stream - The response stream
 * @param {Function} onChunk - Callback for each chunk
 */
async function processStream(stream, onChunk) {
  try {
    for await (const chunk of stream) {
      if (chunk?.text) {
        onChunk(chunk.text);
      }
    }
  } catch (error) {
    console.error('Error processing stream:', error);
  }
}

module.exports = {
  sendMessage,
  processStream,
  CONFIG
};
