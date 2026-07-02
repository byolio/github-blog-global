import * as fs from 'fs';

export function stripBOM(content: string): string {
  return content.charCodeAt(0) === 0xFEFF ? content.slice(1) : content;
}

export function readTextFile(filePath: string): string {
  return stripBOM(fs.readFileSync(filePath, 'utf8'));
}
