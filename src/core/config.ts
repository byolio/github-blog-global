export interface BlogGlobalConfig {
  aiProvider: 'openrouter' | 'siliconflow' | 'custom';
  aiApiKey: string;
  aiModel: string;
  aiBaseUrl?: string;
  baseLang: string;
  targetLangs: string[];
  githubToken?: string;
  createPr?: boolean;
  baseBranch?: string;
}

export const PROVIDER_BASE_URLS: Record<string, string> = {
  openrouter: 'https://openrouter.ai/api/v1',
  siliconflow: 'https://api.siliconflow.cn/v1'
};

export function getBaseURL(provider: string, customUrl?: string): string {
  if (provider === 'custom') {
    if (!customUrl) {
      throw new Error('ai_base_url is required when ai_provider is custom');
    }
    return customUrl;
  }
  const url = PROVIDER_BASE_URLS[provider];
  if (!url) {
    throw new Error(`Unsupported AI provider: ${provider}`);
  }
  return url;
}
