import { BlogGlobalConfig } from './config';
export interface TranslationTask {
    filePath: string;
    content: string;
    sourceLang: string;
    targetLang: string;
}
export interface TranslationResult {
    filePath: string;
    targetLang: string;
    translatedContent: string;
    success: boolean;
    error?: string;
}
export declare class Translator {
    private openai;
    private config;
    constructor(config: BlogGlobalConfig);
    private getRetryAfterMs;
    private retryWithBackoff;
    private extractJson;
    private translateSingle;
    translate(tasks: TranslationTask[], concurrency?: number): Promise<TranslationResult[]>;
}
