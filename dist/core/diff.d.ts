import { StateSchema } from './state';
export interface DiffResult {
    added: string[];
    modified: string[];
    deleted: string[];
}
export declare class DiffDetector {
    static getHash(content: string): string;
    static getDiff(workspacePath: string, state: StateSchema, postsDir: string, ignoreCheck: (filePath: string) => boolean, targetLangs?: string[]): DiffResult;
}
