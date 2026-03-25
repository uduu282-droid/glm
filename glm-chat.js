/**
 * GLM AI Chat - Complete Implementation
 * Supports all GLM models with vision capabilities
 */

import fetch from 'node-fetch';

class GLMChat {
    constructor(options = {}) {
        this.baseUrl = options.baseUrl || 'https://api.featherlabs.online/v1';  // FIXED DOMAIN
        this.apiKey = options.apiKey || 'vtx-RUmIksxLD8Qf8njF3JsMXLqICnZEohaM';
        this.defaultModel = options.model || 'glm-4.6';
        this.conversationHistory = [];
    }

    /**
     * Get available models
     */
    async getModels() {
        try {
            const response = await fetch(`${this.baseUrl}/models`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.data || data.models || [];
        } catch (error) {
            console.error('Error fetching models:', error.message);
            return [];
        }
    }

    /**
     * Send a chat message
     */
    async chat(message, options = {}) {
        const {
            model = this.defaultModel,
            temperature = 0.7,
            maxTokens = 1024,
            stream = false,
            image = null // Optional image URL for vision models
        } = options;

        // Build messages array
        let messages;
        if (image) {
            // Vision model format
            messages = [{
                role: "user",
                content: [
                    { type: "text", text: message },
                    { type: "image_url", image_url: { url: image } }
                ]
            }];
        } else {
            // Standard text format
            messages = [{
                role: "user",
                content: message
            }];
        }

        // Add conversation history if exists
        if (this.conversationHistory.length > 0) {
            messages = [...this.conversationHistory, ...messages];
        }

        const requestBody = {
            model: model,
            messages: messages,
            temperature: temperature,
            max_tokens: maxTokens,
            stream: stream
        };

        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API Error: ${response.status} - ${errorData.message || response.statusText}`);
            }

            const data = await response.json();
            
            // Extract response
            const assistantMessage = data.choices?.[0]?.message?.content || '';
            
            // Update conversation history
            this.conversationHistory.push({ role: 'user', content: message });
            this.conversationHistory.push({ role: 'assistant', content: assistantMessage });
            
            // Keep history manageable (last 10 messages)
            if (this.conversationHistory.length > 10) {
                this.conversationHistory = this.conversationHistory.slice(-10);
            }

            return {
                success: true,
                response: assistantMessage,
                usage: data.usage,
                model: data.model
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Clear conversation history
     */
    clearHistory() {
        this.conversationHistory = [];
    }

    /**
     * Simple test function
     */
    async test() {
        console.log('🧪 Testing GLM API...\n');
        
        // Test 1: Get models
        console.log('📋 Fetching available models...');
        const models = await this.getModels();
        console.log(`✅ Found ${models.length} models:`);
        models.forEach(m => console.log(`   - ${m.id || m.name || m}`));
        console.log('');

        // Test 2: Simple chat
        console.log('💬 Testing simple chat...');
        const result = await this.chat('Hello! Please respond with just "Testing successful!"');
        
        if (result.success) {
            console.log(`✅ Success! Model: ${result.model}`);
            console.log(`Response: ${result.response.substring(0, 100)}${result.response.length > 100 ? '...' : ''}`);
            console.log(`Usage: ${JSON.stringify(result.usage)}`);
        } else {
            console.log(`❌ Error: ${result.error}`);
        }

        return result.success;
    }
}

// CLI mode
if (process.argv[1]?.includes('glm-chat.js')) {
    const glm = new GLMChat();
    
    if (process.argv.includes('--test')) {
        await glm.test();
    } else {
        // Interactive mode
        console.log('🤖 GLM AI Chat - Interactive Mode\n');
        console.log('Type your message (or "quit" to exit):\n');
        
        const readline = await import('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const askQuestion = () => {
            rl.question('> ', async (message) => {
                if (message.toLowerCase() === 'quit' || message.toLowerCase() === 'exit') {
                    rl.close();
                    return;
                }

                const result = await glm.chat(message);
                
                if (result.success) {
                    console.log('\n🤖 Assistant:', result.response);
                } else {
                    console.log('\n❌ Error:', result.error);
                }
                
                console.log('');
                askQuestion();
            });
        };

        askQuestion();
    }
}

export default GLMChat;
