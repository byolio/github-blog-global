import * as fs from 'fs';
import * as path from 'path';
import ignore, { Ignore } from 'ignore';

export class IgnoreParser {
  private ig: Ignore;

  constructor(workspacePath: string) {
    this.ig = ignore();
    // Default ignores
    this.ig.add(['.git/**', 'node_modules/**', '.blog-global/**']);

    const ignorePath = path.join(workspacePath, '.blog-global-ignore');
    if (fs.existsSync(ignorePath)) {
      try {
        const content = fs.readFileSync(ignorePath, 'utf8');
        this.ig.add(content);
      } catch {
        // Ignore read errors
      }
    }
  }

  ignores(filePath: string): boolean {
    // Normalize path to relative with forward slashes for the ignore library
    const normalized = filePath.replace(/\\/g, '/');
    return this.ig.ignores(normalized);
  }
}
