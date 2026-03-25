import ZAIBrowserAPI from './zai_browser_api.js';

/**
 * 🎓 Z.AI Study Assistant - Advanced Usage Example
 * 
 * Demonstrates:
 * - Multiple question types
 * - Subject-specific queries
 * - Keeping browser open for session efficiency
 * - Error handling
 */

class StudyAssistant {
    constructor() {
        this.api = new ZAIBrowserAPI();
        this.isOpen = false;
    }

    async start() {
        console.log('🎓 Z.AI Study Assistant Starting...\n');
        await this.api.initialize();
        this.isOpen = true;
        console.log('✅ Study session started\n');
    }

    async ask(subject, question) {
        if (!this.isOpen) {
            await this.start();
        }

        console.log(`📚 ${subject}`);
        console.log('─'.repeat(60));
        console.log(`❓ ${question}\n`);

        try {
            const answer = await this.api.ask(question, { timeout: 40000 });
            
            console.log('💡 Answer:');
            console.log(answer);
            console.log('\n');
            
            return answer;
        } catch (error) {
            console.log(`❌ Error: ${error.message}\n`);
            return null;
        }
    }

    async quiz(category, questions) {
        console.log(`\n🧠 ${category} QUIZ`);
        console.log('='.repeat(60));
        
        const results = [];
        
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            console.log(`\nQuestion ${i + 1}/${questions.length}: ${q}`);
            
            const answer = await this.api.ask(q);
            results.push({ question: q, answer });
            
            // Brief pause between questions
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        return results;
    }

    async end() {
        if (this.isOpen) {
            await this.api.close();
            this.isOpen = false;
            console.log('👋 Study session ended\n');
        }
    }
}

// Main execution
async function main() {
    const assistant = new StudyAssistant();

    try {
        // Start session (keeps browser open)
        await assistant.start();

        // Math problems
        await assistant.ask('Mathematics', 'What is 59 multiplied by 55? Show step-by-step work.');
        await assistant.ask('Mathematics', 'Explain the quadratic formula with an example.');

        // Science
        await assistant.ask('Physics', 'Explain Newton\'s three laws of motion with real-world examples.');
        await assistant.ask('Chemistry', 'What is the difference between ionic and covalent bonds?');

        // History
        await assistant.ask('History', 'What were the main causes of World War I?');

        // Literature
        await assistant.ask('Literature', 'Who wrote Romeo and Juliet and what is the play about?');

        // Computer Science
        await assistant.ask('Computer Science', 'Explain the difference between stack and heap memory.');

        console.log('='.repeat(60));
        console.log('✅ All questions answered!');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ Study session error:', error.message);
    } finally {
        // Clean up
        await assistant.end();
    }
}

// Run the study assistant
main().catch(console.error);
