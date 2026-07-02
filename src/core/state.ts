import * as fs from 'fs';
import * as path from 'path';

export interface FileState {
  hash: string;
  translated: Record<string, string>; // lang -> hash
}

export interface StateSchema {
  version: number;
  files: Record<string, FileState>; // filePath -> FileState
}

export class StateManager {
  private statePath: string;

  constructor(workspacePath: string) {
    this.statePath = path.join(workspacePath, '.blog-global', 'state.json');
  }

  readState(): StateSchema {
    if (fs.existsSync(this.statePath)) {
      try {
        const content = fs.readFileSync(this.statePath, 'utf8');
        return JSON.parse(content) as StateSchema;
      } catch {
        // Fallback if file is corrupted
      }
    }
    return {
      version: 1,
      files: {}
    };
  }

  saveState(state: StateSchema): void {
    const dir = path.dirname(this.statePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.statePath, JSON.stringify(state, null, 2), 'utf8');
  }
}
