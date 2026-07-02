import { BlogGlobalConfig } from './config';
export interface OrchestratorResult {
    translatedCount: number;
    prUrl?: string;
    filesToCommit?: string[];
    success: boolean;
    error?: string;
}
export declare class Orchestrator {
    private config;
    private workspacePath;
    constructor(config: BlogGlobalConfig, workspacePath: string);
    private resolvePageUrl;
    run(): Promise<OrchestratorResult>;
}
