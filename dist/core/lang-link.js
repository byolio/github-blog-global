"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LangLinkInjector = void 0;
const languages_1 = require("../utils/languages");
class LangLinkInjector {
    static inject(fileContent, currentLang, pages) {
        // Generate the links line
        const linksList = pages.map(page => `[${(0, languages_1.getLanguageNativeName)(page.lang)}](${page.path})`);
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
        }
        else {
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
            }
            else {
                return [linksLine, '', ...lines].join('\n');
            }
        }
    }
}
exports.LangLinkInjector = LangLinkInjector;
