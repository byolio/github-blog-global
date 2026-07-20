import { DetectResult } from './detector';
export interface FileGeneratorResult {
    generatedPath: string;
    content: string;
    permalink?: string;
}
export declare function jekyllPrettyUrl(postPath: string, frontMatterDate?: unknown): string | undefined;
export declare class FileGenerator {
    static legacyGeneratedPath(originalPath: string, targetLang: string, detectResult: DetectResult): string | undefined;
    static generate(originalPath: string, translatedContent: string, targetLang: string, detectResult: DetectResult): FileGeneratorResult;
}
