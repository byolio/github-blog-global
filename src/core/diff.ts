import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { StateSchema } from './state';
import { readTextFile } from '../utils/fs-utils';

export interface DiffResult {
  added: string[];
  modified: string[];
  deleted: string[];
}

export class DiffDetector {
  static getHash(content: string): string {
    return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
  }

  static getDiff(
    workspacePath: string,
    state: StateSchema,
    postsDir: string,
    ignoreCheck: (filePath: string) => boolean,
    targetLangs: string[] = []
  ): DiffResult {
    const added: string[] = [];
    const modified: string[] = [];
    const deleted: string[] = [];

    const fullPostsDir = path.join(workspacePath, postsDir);
    const existingFiles = new Set<string>();

    if (fs.existsSync(fullPostsDir)) {
      const scanDir = (dir: string) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const relativePath = path.relative(workspacePath, fullPath).replace(/\\/g, '/');

          if (ignoreCheck(relativePath)) {
            continue;
          }

          if (entry.isDirectory()) {
            scanDir(fullPath);
          } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.markdown'))) {
            existingFiles.add(relativePath);
            const content = readTextFile(fullPath);
            const currentHash = this.getHash(content);

            const fileState = state.files[relativePath];
            if (!fileState) {
              added.push(relativePath);
            } else if (fileState.hash !== currentHash) {
              modified.push(relativePath);
            } else if (targetLangs.some(lang => !fileState.translated[lang])) {
              // Content unchanged, but a previous run failed to translate into
              // one or more target languages. Retry those on this run.
              modified.push(relativePath);
            }
          }
        }
      };

      scanDir(fullPostsDir);
    }

    // Detect deleted files
    for (const relativePath of Object.keys(state.files)) {
      if (!existingFiles.has(relativePath)) {
        deleted.push(relativePath);
      }
    }

    return { added, modified, deleted };
  }
}
