import { getLanguageNativeName } from '../utils/languages';

export interface PageInfo {
  lang: string;
  path: string; // The URL/permalink of the page
}

export class LangLinkInjector {
  static inject(
    fileContent: string,
    currentLang: string,
    pages: PageInfo[]
  ): string {
    // Generate the links line
    const linksList = pages.map(page => `[${getLanguageNativeName(page.lang)}](${page.path})`);
    const linksLine = `> 🌐 ${linksList.join(' | ')}`;

    // Normalize newlines to \n
    const normalizedContent = fileContent.replace(/\r\n/g, '\n');
    const lines = normalizedContent.split('\n');

    // Look for existing links line
    const regex = /^>\s*🌐\s*\[.+\]\(.+\)/;
    let existingIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (regex.test(lines[i])) {
        existingIndex = i;
        break;
      }
    }

    if (existingIndex !== -1) {
      lines[existingIndex] = linksLine;
      return lines.join('\n');
    } else {
      // Find the end of the front matter
      let frontMatterEndIndex = -1;
      if (lines[0] === '---') {
        for (let i = 1; i < lines.length; i++) {
          if (lines[i] === '---') {
            frontMatterEndIndex = i;
            break;
          }
        }
      }

      if (frontMatterEndIndex !== -1) {
        const newLines = [
          ...lines.slice(0, frontMatterEndIndex + 1),
          '',
          linksLine,
          ''
        ];

        let nextContentStart = frontMatterEndIndex + 1;
        while (nextContentStart < lines.length && lines[nextContentStart].trim() === '') {
          nextContentStart++;
        }
        newLines.push(...lines.slice(nextContentStart));
        return newLines.join('\n');
      } else {
        return [linksLine, '', ...lines].join('\n');
      }
    }
  }
}
