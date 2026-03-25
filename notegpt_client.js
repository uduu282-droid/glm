import fetch from 'node-fetch';

/**
 * 📝 NoteGPT API Client
 * 
 * Wrapper for notegpt.io API
 * Endpoint: https://notegpt.io/api/v2/chat/stream
 */

class NoteGPTClient {
    constructor(options = {}) {
        this.baseUrl = 'https://notegpt.io/api/v2';
        this.anonymousId = options.anonymousId || this.generateAnonymousId();
        this.sessionId = null;
        
        // Default cookies (will be updated with real ones)
        this.cookies = {
            '_ga': `GA1.2.${Math.random().toString(36).substring(2, 15)}.${Date.now()}`,
            '_gid': `GA1.2.${Math.random().toString(36).substring(2, 15)}.${Date.now()}`,
            '_gat_gtag_UA_252982427_14': '1',
            'anonymous_user_id': this.anonymousId,
            'sbox-guid': `${Date.now()}|${Math.floor(Math.random() * 1000)}|${Math.floor(Math.random() * 1000000000)}`,
            'g_state': '{"i_l":0,"i_ll":' + Date.now() + ',"i_b":"","i_e":{"enable_itp_optimization":0}}',
            '_ga_PFX3BRW5RQ': `GS2.1.s${Date.now()}$o1$g0$t${Date.now()}$j39$l0$h${Math.floor(Math.random() * 1000000000)}`
        };
    }

    /**
     * Generate anonymous user ID
     */
    generateAnonymousId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Get cookie string for headers
     */
    getCookieString() {
        return Object.entries(this.cookies)
            .map(([key, value]) => `${key}=${value}`)
            .join('; ');
    }

    /**
     * Send chat message (streaming)
     */
    async chat(message, options = {}) {
        const {
            model = 'gpt-4o-mini',
            temperature = 0.7,
            maxTokens = 2048,
            stream = true,
            onChunk // Callback for streaming chunks
        } = options;

        const url = `${this.baseUrl}/chat/stream`;
        
        const payload = {
            message: message,
            model: model,
            temperature: temperature,
            max_tokens: maxTokens,
            stream: stream
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': '*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Origin': 'https://notegpt.io',
                'Referer': 'https://notegpt.io/ai-chat',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
                'Cookie': this.getCookieString()
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`NoteGPT API error: ${response.status} ${response.statusText}`);
        }

        // Handle streaming response
        if (stream) {
            return await this.handleStream(response, onChunk);
        } else {
            return await response.json();
        }
    }

    /**
     * Handle Server-Sent Events stream
     */
    async handleStream(response, onChunk) {
        // For node-fetch v3, we need to handle the stream differently
        const chunks = [];
        let fullResponse = '';

        // Get the response as text and parse SSE manually
        const text = await response.text();
        const lines = text.split('\n').filter(line => line.trim());

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const data = line.substring(6);
                
                if (data === '[DONE]') {
                    continue;
                }

                try {
                    const parsed = JSON.parse(data);
                    
                    // Extract content from different possible formats
                    const content = parsed.choices?.[0]?.delta?.content || 
                                  parsed.choices?.[0]?.text || 
                                  parsed.content || 
                                  '';

                    if (content) {
                        fullResponse += content;
                        chunks.push(content);

                        // Call callback if provided
                        if (onChunk) {
                            await onChunk(content, fullResponse);
                        }
                    }
                } catch (e) {
                    // Skip invalid JSON or incomplete chunks
                }
            }
        }

        return {
            text: fullResponse,
            chunks: chunks
        };
    }

    /**
     * Simple non-streaming chat
     */
    async ask(message, options = {}) {
        const result = await this.chat(message, {
            ...options,
            stream: false
        });

        return result.choices?.[0]?.message?.content || 
               result.response || 
               JSON.stringify(result);
    }

    /**
     * Update session from browser cookies
     */
    loadCookies(cookies) {
        this.cookies = { ...this.cookies, ...cookies };
    }
}

// Export as default
export default NoteGPTClient;

// Also export named
export { NoteGPTClient };
