import { Env, ChatCompletionRequest, ChatCompletionResponse, DeepSeekCredentials } from './types';
import { DEEPSEEK_BASE_URL } from './config';

/**
 * DeepSeek API Client
 * Handles communication with DeepSeek's API
 */
export class DeepSeekAPIClient {
	private env: Env;
	private credentials: DeepSeekCredentials;

	constructor(env: Env, credentials: DeepSeekCredentials) {
		this.env = env;
		this.credentials = credentials;
	}

	/**
	 * Get the appropriate headers for API requests
	 */
	private getHeaders(): Record<string, string> {
		return {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${this.credentials.api_key}`
		};
	}

	/**
	 * Get the base URL for API requests
	 */
	private getBaseUrl(): string {
		return this.credentials.base_url || DEEPSEEK_BASE_URL;
	}

	/**
	 * Make a chat completion request to DeepSeek API
	 */
	async chatCompletions(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
		const url = `${this.getBaseUrl()}/${request.model}/chat/completions`;
		
		console.log(`[DeepSeekAPI] Request to: ${url}`);
		console.log(`[DeepSeekAPI] Model: ${request.model}`);
		
		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: this.getHeaders(),
				body: JSON.stringify({
					model: request.model,
					messages: request.messages,
					stream: request.stream || false,
					temperature: request.temperature,
					max_tokens: request.max_tokens,
					top_p: request.top_p,
					tools: request.tools,
					tool_choice: request.tool_choice
				})
			});

			if (!response.ok) {
				const errorText = await response.text();
				let errorMessage = `DeepSeek API error: ${response.status}`;
				
				try {
					const errorData = JSON.parse(errorText);
					errorMessage = `DeepSeek API error: ${errorData.error?.message || errorText}`;
				} catch {
					errorMessage += ` - ${errorText}`;
				}
				
				throw new Error(errorMessage);
			}

			const data = await response.json();
			console.log(`[DeepSeekAPI] Response received successfully`);
			
			return data as ChatCompletionResponse;

		} catch (error) {
			console.error('[DeepSeekAPI] Request failed:', error instanceof Error ? error.message : error);
			throw error;
		}
	}

	/**
	 * Check if credentials are valid by making a test request
	 */
	async validateCredentials(): Promise<boolean> {
		try {
			await this.chatCompletions({
				model: 'deepseek-chat',
				messages: [{ role: 'user', content: 'Hi' }],
				max_tokens: 5
			});
			return true;
		} catch (error) {
			console.error('[DeepSeekAPI] Credential validation failed:', error);
			return false;
		}
	}
}
