import { DetectResult } from './detector';
export interface FileGeneratorResult {
    generatedPath: string;
    content: string;
}
export declare class FileGenerator {
    static generate(originalPath: string, translatedContent: string, targetLang: string, detectResult: DetectResult): FileGeneratorResult;
}
