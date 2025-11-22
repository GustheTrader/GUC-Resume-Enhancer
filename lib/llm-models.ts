// AI Model configurations for different providers

export interface ModelConfig {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'gemini';
  maxTokens?: number;
  supportsStreaming?: boolean;
}

export const AI_MODELS: Record<string, ModelConfig[]> = {
  openai: [
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: 'openai',
      maxTokens: 128000,
      supportsStreaming: true,
    },
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      provider: 'openai',
      maxTokens: 128000,
      supportsStreaming: true,
    },
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      provider: 'openai',
      maxTokens: 128000,
      supportsStreaming: true,
    },
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'openai',
      maxTokens: 8192,
      supportsStreaming: true,
    },
  ],
  anthropic: [
    {
      id: 'claude-3-5-sonnet-20241022',
      name: 'Claude 3.5 Sonnet',
      provider: 'anthropic',
      maxTokens: 200000,
      supportsStreaming: true,
    },
    {
      id: 'claude-3-opus-20240229',
      name: 'Claude 3 Opus',
      provider: 'anthropic',
      maxTokens: 200000,
      supportsStreaming: true,
    },
    {
      id: 'claude-3-sonnet-20240229',
      name: 'Claude 3 Sonnet',
      provider: 'anthropic',
      maxTokens: 200000,
      supportsStreaming: true,
    },
    {
      id: 'claude-3-haiku-20240307',
      name: 'Claude 3 Haiku',
      provider: 'anthropic',
      maxTokens: 200000,
      supportsStreaming: true,
    },
  ],
  gemini: [
    {
      id: 'gemini-1.5-pro',
      name: 'Gemini 1.5 Pro',
      provider: 'gemini',
      maxTokens: 1000000,
      supportsStreaming: true,
    },
    {
      id: 'gemini-1.5-flash',
      name: 'Gemini 1.5 Flash',
      provider: 'gemini',
      maxTokens: 1000000,
      supportsStreaming: true,
    },
    {
      id: 'gemini-pro',
      name: 'Gemini Pro',
      provider: 'gemini',
      maxTokens: 30720,
      supportsStreaming: true,
    },
  ],
};

// Get all models for a specific provider
export function getModelsForProvider(provider: 'openai' | 'anthropic' | 'gemini'): ModelConfig[] {
  return AI_MODELS[provider] || [];
}

// Get default model for a provider
export function getDefaultModel(provider: 'openai' | 'anthropic' | 'gemini'): string {
  const defaults = {
    openai: 'gpt-4o-mini',
    anthropic: 'claude-3-5-sonnet-20241022',
    gemini: 'gemini-1.5-flash',
  };
  return defaults[provider] || '';
}

// Get model config by ID
export function getModelById(modelId: string): ModelConfig | undefined {
  for (const models of Object.values(AI_MODELS)) {
    const model = models.find(m => m.id === modelId);
    if (model) return model;
  }
  return undefined;
}

// Validate if a model exists for a provider
export function isValidModel(provider: string, modelId: string): boolean {
  const models = AI_MODELS[provider as keyof typeof AI_MODELS];
  if (!models) return false;
  return models.some(m => m.id === modelId);
}

// Get all available providers
export function getAvailableProviders(): Array<{ id: string; name: string }> {
  return [
    { id: 'openai', name: 'OpenAI' },
    { id: 'anthropic', name: 'Anthropic' },
    { id: 'gemini', name: 'Google Gemini' },
  ];
}
