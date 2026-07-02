import * as fs from 'fs';
import * as path from 'path';

export interface DetectResult {
  framework: 'jekyll' | 'hugo' | 'hexo' | 'unknown';
  postsDir: string;
  i18nStrategy: {
    type: 'directory';
    pattern: string;
  };
}

export class Detector {
  static detect(workspacePath: string): DetectResult {
    const hasConfigYml = fs.existsSync(path.join(workspacePath, '_config.yml'));
    const hasPostsDir = fs.existsSync(path.join(workspacePath, '_posts'));
    const hasSourcePostsDir = fs.existsSync(path.join(workspacePath, 'source', '_posts'));
    const hasPackageJson = fs.existsSync(path.join(workspacePath, 'package.json'));

    let isHexo = false;
    if (hasPackageJson) {
      try {
        const pkg = JSON.parse(fs.readFileSync(path.join(workspacePath, 'package.json'), 'utf8'));
        if (pkg.dependencies?.hexo || pkg.devDependencies?.hexo) {
          isHexo = true;
        }
      } catch {
        // Ignore JSON parsing errors
      }
    }

    if (hasConfigYml && hasPostsDir && !isHexo && !hasSourcePostsDir) {
      return {
        framework: 'jekyll',
        postsDir: '_posts',
        i18nStrategy: {
          type: 'directory',
          pattern: '/{lang}/_posts/{file}'
        }
      };
    }

    if (hasConfigYml && (hasSourcePostsDir || isHexo)) {
      return {
        framework: 'hexo',
        postsDir: 'source/_posts',
        i18nStrategy: {
          type: 'directory',
          pattern: '/source/_posts/{lang}/{file}'
        }
      };
    }

    // Default fallback or unknown
    return {
      framework: 'unknown',
      postsDir: '_posts',
      i18nStrategy: {
        type: 'directory',
        pattern: '/{lang}/_posts/{file}'
      }
    };
  }
}
