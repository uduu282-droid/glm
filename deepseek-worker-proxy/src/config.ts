// DeepSeek API Configuration

export const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';
export const DEEPSEEK_API_VERSION = 'v1';

// Available DeepSeek models
export const DEEPSEEK_MODELS = {
	'deepseek-chat': 'DeepSeek Chat V3',
	'deepseek-coder': 'DeepSeek Coder',
	'deepseek-v2': 'DeepSeek V2',
	'deepseek-v2.5': 'DeepSeek V2.5'
} as const;

export type DeepSeekModel = keyof typeof DEEPSEEK_MODELS;
