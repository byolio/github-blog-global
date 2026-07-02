export interface FileState {
    hash: string;
    translated: Record<string, string>;
}
export interface StateSchema {
    version: number;
    files: Record<string, FileState>;
}
export declare class StateManager {
    private statePath;
    constructor(workspacePath: string);
    readState(): StateSchema;
    saveState(state: StateSchema): void;
}
