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
    siteUrl?: string;
}
export declare function normalizeSiteUrl(siteUrl?: string): string | undefined;
export declare const PROVIDER_BASE_URLS: Record<string, string>;
export declare function getBaseURL(provider: string, customUrl?: string): string;
