// Local storage utility for API keys in light mode (no login)
// This is only used client-side

export interface StoredApiKey {
  id: string;
  provider: 'openai' | 'anthropic' | 'gemini';
  keyName: string;
  apiKey: string;
  defaultModel: string;
  isActive: boolean;
  createdAt: string;
}

const STORAGE_KEY = 'guc_resume_enhancer_api_keys';

export const localApiKeyStorage = {
  // Get all API keys from local storage
  getAll: (): StoredApiKey[] => {
    if (typeof window === 'undefined') return [];

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to read API keys from local storage:', error);
      return [];
    }
  },

  // Get a single API key by ID
  getById: (id: string): StoredApiKey | null => {
    const keys = localApiKeyStorage.getAll();
    return keys.find(key => key.id === id) || null;
  },

  // Get API key by provider
  getByProvider: (provider: string): StoredApiKey | null => {
    const keys = localApiKeyStorage.getAll();
    return keys.find(key => key.provider === provider && key.isActive) || null;
  },

  // Add a new API key
  add: (apiKey: Omit<StoredApiKey, 'id' | 'createdAt'>): StoredApiKey => {
    const keys = localApiKeyStorage.getAll();

    // Check if provider already exists
    const existingIndex = keys.findIndex(k => k.provider === apiKey.provider);

    const newKey: StoredApiKey = {
      ...apiKey,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      // Replace existing key for this provider
      keys[existingIndex] = newKey;
    } else {
      // Add new key
      keys.push(newKey);
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
      return newKey;
    } catch (error) {
      console.error('Failed to save API key to local storage:', error);
      throw new Error('Failed to save API key');
    }
  },

  // Update an existing API key
  update: (id: string, updates: Partial<StoredApiKey>): StoredApiKey | null => {
    const keys = localApiKeyStorage.getAll();
    const index = keys.findIndex(key => key.id === id);

    if (index === -1) return null;

    keys[index] = { ...keys[index], ...updates };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
      return keys[index];
    } catch (error) {
      console.error('Failed to update API key in local storage:', error);
      throw new Error('Failed to update API key');
    }
  },

  // Delete an API key
  delete: (id: string): boolean => {
    const keys = localApiKeyStorage.getAll();
    const filteredKeys = keys.filter(key => key.id !== id);

    if (filteredKeys.length === keys.length) return false;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredKeys));
      return true;
    } catch (error) {
      console.error('Failed to delete API key from local storage:', error);
      throw new Error('Failed to delete API key');
    }
  },

  // Clear all API keys
  clear: (): void => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear API keys from local storage:', error);
    }
  },

  // Check if user has any API keys configured
  hasAnyKeys: (): boolean => {
    return localApiKeyStorage.getAll().length > 0;
  },

  // Get active API key for a provider
  getActiveKeyForProvider: (provider: string): StoredApiKey | null => {
    const keys = localApiKeyStorage.getAll();
    return keys.find(key => key.provider === provider && key.isActive) || null;
  },
};
