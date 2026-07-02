import * as path from 'path';
import matter from 'gray-matter';
import { DetectResult } from './detector';

export interface FileGeneratorResult {
  generatedPath: string;
  content: string;
}

export class FileGenerator {
  static generate(
    originalPath: string,
    translatedContent: string,
    targetLang: string,
    detectResult: DetectResult
  ): FileGeneratorResult {
    const { framework, postsDir } = detectResult;

    // Get file name relative to postsDir
    const relativeFilename = path.relative(postsDir, originalPath).replace(/\\/g, '/');

    let generatedPath = '';
    if (framework === 'jekyll') {
      // jekyll path: /{lang}/_posts/filename
      generatedPath = path.join(targetLang, '_posts', relativeFilename).replace(/\\/g, '/');
    } else if (framework === 'hexo') {
      // hexo path: /source/_posts/{lang}/filename
      generatedPath = path.join('source', '_posts', targetLang, relativeFilename).replace(/\\/g, '/');
    } else {
      // Fallback: directory based
      generatedPath = path.join(targetLang, postsDir, relativeFilename).replace(/\\/g, '/');
    }

    // Update lang and permalink in front matter
    const parsed = matter(translatedContent);
    const updatedData = { ...parsed.data };
    
    // Inject lang
    updatedData.lang = targetLang;

    // Prepend targetLang to permalink if it exists
    if (typeof updatedData.permalink === 'string') {
      let perm = updatedData.permalink.trim();
      const langPrefix = `/${targetLang}/`;
      if (!perm.startsWith(langPrefix)) {
        // Strip leading slash if any, then prepend
        const cleanPerm = perm.startsWith('/') ? perm.substring(1) : perm;
        updatedData.permalink = `/${targetLang}/${cleanPerm}`;
      }
    }

    const content = matter.stringify(parsed.content, updatedData);

    return {
      generatedPath,
      content
    };
  }
}
