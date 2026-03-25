// OpenAI-compatible API routes for Gemini

import type { Context } from 'hono';
import type { Env, AccountCredentials } from '../types';
import { GeminiAuthManager } from '../auth-manager';

export function setupOpenAIRoutes(app: any) {
  // Chat completions endpoint
  app.post('/v1/chat/completions', async (c: Context<{ Bindings: Env }>) => {
    try {
      const body = await c.req.json();
      const { model = 'gemini-2.5-pro', messages, stream = false } = body;

      // Validate request
      if (!messages || !Array.isArray(messages)) {
        return c.json({
          error: {
            message: 'Invalid request. "messages" array is required.',
            type: 'invalid_request_error'
          }
        }, { status: 400 });
      }

      // Select account with rotation logic
      const authManager = new GeminiAuthManager(c.env.GEMINI_TOKEN_CACHE);
      const credentials = await authManager.selectAccount();

      if (!credentials) {
        return c.json({
          error: {
            message: 'No available accounts. Please add accounts first.',
            type: 'no_accounts_available'
          }
        }, { status: 503 });
      }

      // Convert OpenAI format to Gemini format
      const geminiMessages = convertToGeminiFormat(messages);

      // Make API call to Gemini
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${credentials.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: geminiMessages,
            generationConfig: {
              temperature: body.temperature || 0.7,
              topP: body.top_p || 0.9,
              topK: body.top_k || 40,
              maxOutputTokens: body.max_tokens || 8192,
            },
          }),
        }
      );

      // Handle errors
      if (!response.ok) {
        const errorText = await response.text();
        
        // Handle quota exceeded - trigger failover
        if (response.status === 429) {
          console.log(`Account quota exceeded, trying different account...`);
          // The auth manager will handle retry logic
          throw new Error(`Quota exceeded: ${errorText}`);
        }

        return c.json({
          error: {
            message: errorText || 'Gemini API error',
            type: 'api_error',
            code: response.status
          }
        }, { status: response.status });
      }

      const geminiResponse = await response.json();

      // Convert Gemini response to OpenAI format
      const openAIResponse = convertToOpenAIFormat(geminiResponse, model);

      return c.json(openAIResponse);

    } catch (error) {
      console.error('Chat completion error:', error);
      
      return c.json({
        error: {
          message: error instanceof Error ? error.message : 'Internal server error',
          type: 'worker_error'
        }
      }, { status: 500 });
    }
  });
}

/**
 * Convert OpenAI messages format to Gemini format
 */
function convertToGeminiFormat(messages: any[]) {
  return messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));
}

/**
 * Convert Gemini response to OpenAI format
 */
function convertToOpenAIFormat(geminiResponse: any, model: string) {
  const candidate = geminiResponse.candidates?.[0];
  const content = candidate?.content?.parts?.[0]?.text || '';

  return {
    id: `chatcmpl-${Date.now()}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: model,
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: content,
        },
        finish_reason: candidate?.finishReason || 'stop',
      },
    ],
    usage: {
      prompt_tokens: geminiResponse.usageMetadata?.promptTokenCount || 0,
      completion_tokens: geminiResponse.usageMetadata?.candidatesTokenCount || 0,
      total_tokens: geminiResponse.usageMetadata?.totalTokenCount || 0,
    },
  };
}
