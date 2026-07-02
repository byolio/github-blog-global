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
  // Public site root (e.g. https://www.byolio.blog). When set, language
  // switch links are generated as absolute URLs against this domain instead
  // of site-relative paths.
  siteUrl?: string;
}

export function normalizeSiteUrl(siteUrl?: string): string | undefined {
  if (!siteUrl) return undefined;
  let url = siteUrl.trim();
  if (!url) return undefined;
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  return url.replace(/\/+$/, '');
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
