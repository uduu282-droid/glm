import ZAIBrowserAPI from './zai_browser_api.js';
import fs from 'fs';
import path from 'path';

/**
 * 💬 Z.AI Conversation Manager with History
 * 
 * Features:
 * - Maintains conversation history
 * - Saves sessions to disk
 * - Can reference previous messages
 * - Exports conversations
 */

class ConversationManager {
    constructor(options = {}) {
        this.api = new ZAIBrowserAPI();
        this.history = [];
        this.sessionName = options.sessionName || `session-${Date.now()}`;
        this.savePath = path.join(process.cwd(), 'conversations', `${this.sessionName}.json`);
        this.isOpen = false;
        
        // Ensure conversations directory exists
        const convDir = path.join(process.cwd(), 'conversations');
        if (!fs.existsSync(convDir)) {
            fs.mkdirSync(convDir, { recursive: true });
        }
    }

    async start() {
        console.log('💬 Starting Conversation Manager...\n');
        await this.api.initialize();
        this.isOpen = true;
        
        // Load existing history if available
        if (fs.existsSync(this.savePath)) {
            const saved = JSON.parse(fs.readFileSync(this.savePath, 'utf8'));
            this.history = saved.history || [];
            console.log(`📂 Loaded ${this.history.length} previous messages from ${this.sessionName}\n`);
        }
        
        console.log('✅ Conversation ready\n');
    }

    async chat(userMessage, context = '') {
        if (!this.isOpen) {
            await this.start();
        }

        // Build prompt with context if provided
        let fullPrompt = userMessage;
        
        if (context) {
            fullPrompt = `${context}\n\n${userMessage}`;
        }

        console.log(`👤 You: ${userMessage}`);
        
        try {
            const response = await this.api.ask(fullPrompt, { timeout: 40000 });
            
            console.log(`🤖 AI: ${response.substring(0, 200)}...\n`);
            
            // Add to history
            this.history.push({
                timestamp: new Date().toISOString(),
                user: userMessage,
                ai: response,
                context: context || null
            });
            
            // Auto-save
            this.save();
            
            return response;
        } catch (error) {
            console.log(`❌ Error: ${error.message}\n`);
            return null;
        }
    }

    async followUp(question) {
        // Get last few messages for context
        const recentHistory = this.history.slice(-3);
        
        if (recentHistory.length === 0) {
            return await this.chat(question);
        }

        // Build context from recent messages
        let context = 'Previous conversation:\n';
        recentHistory.forEach((msg, i) => {
            context += `\nUser: ${msg.user}\nAI: ${msg.ai.substring(0, 150)}...\n`;
        });

        context += '\nBased on the above conversation, answer this follow-up:';
        
        return await this.chat(question, context);
    }

    save() {
        const data = {
            sessionName: this.sessionName,
            startTime: this.history[0]?.timestamp || new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            messageCount: this.history.length,
            history: this.history
        };
        
        fs.writeFileSync(this.savePath, JSON.stringify(data, null, 2));
        console.log(`💾 Saved ${this.history.length} messages to ${this.sessionName}.json`);
    }

    export(format = 'txt') {
        if (format === 'txt') {
            const txtPath = this.savePath.replace('.json', '.txt');
            let content = `Conversation: ${this.sessionName}\n`;
            content += `Messages: ${this.history.length}\n`;
            content += '='.repeat(60) + '\n\n';
            
            this.history.forEach((msg, i) => {
                content += `[${i + 1}] ${new Date(msg.timestamp).toLocaleString()}\n`;
                content += `👤 User: ${msg.user}\n`;
                content += `🤖 AI: ${msg.ai}\n`;
                content += '-'.repeat(60) + '\n\n';
            });
            
            fs.writeFileSync(txtPath, content);
            console.log(`📄 Exported to ${txtPath}`);
            return txtPath;
        }
        
        return this.savePath;
    }

    getHistory() {
        return this.history;
    }

    clearHistory() {
        this.history = [];
        console.log('🗑️ Conversation history cleared\n');
    }

    async close() {
        if (this.isOpen) {
            this.save();
            await this.api.close();
            this.isOpen = false;
            console.log('👋 Conversation closed\n');
        }
    }
}

// Interactive demo
async function main() {
    const manager = new ConversationManager({
        sessionName: 'math-tutoring'
    });

    try {
        await manager.start();

        console.log('🎓 Math Tutoring Session Example\n');
        console.log('='.repeat(60));

        // Question 1
        await manager.chat('What is 59 multiplied by 55?');

        // Follow-up question (uses context)
        await manager.followUp('Can you show me another way to solve it?');

        // Another follow-up
        await manager.followUp('Why does the distributive property work?');

        // New topic (no context needed)
        await manager.chat('Explain what prime numbers are.');

        // Show history
        console.log('\n📊 Conversation Summary:');
        console.log(`Total messages: ${manager.getHistory().length}`);
        
        // Export
        manager.export('txt');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await manager.close();
    }
}

// Export for use in other files
export default ConversationManager;

// Run demo
if (process.argv[1]?.includes('conversation_manager.js')) {
    main().catch(console.error);
}
