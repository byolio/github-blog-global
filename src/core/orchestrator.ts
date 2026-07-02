import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import { BlogGlobalConfig } from './config';
import { Detector } from './detector';
import { IgnoreParser } from './ignore';
import { StateManager, StateSchema } from './state';
import { DiffDetector } from './diff';
import { Translator, TranslationTask } from './translator';
import { FileGenerator } from './generator';
import { LangLinkInjector, PageInfo } from './lang-link';
import { GitPRManager } from './git-pr';

export interface OrchestratorResult {
  translatedCount: number;
  prUrl?: string;
  filesToCommit?: string[];
  success: boolean;
  error?: string;
}

export class Orchestrator {
  private config: BlogGlobalConfig;
  private workspacePath: string;

  constructor(config: BlogGlobalConfig, workspacePath: string) {
    this.config = config;
    this.workspacePath = workspacePath;
  }

  private resolvePageUrl(filePath: string, lang: string, framework: string): string {
    const fullPath = path.join(this.workspacePath, filePath);
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const parsed = matter(content);
        if (typeof parsed.data.permalink === 'string') {
          return parsed.data.permalink;
        }
      } catch {
        // Ignore
      }
    }

    // Fallback URL generation
    let cleanPath = filePath.replace(/\\/g, '/');
    // Strip posts directory prefixes
    cleanPath = cleanPath.replace(/^(_posts|source\/_posts)\//, '');
    cleanPath = cleanPath.replace(/\.(md|markdown)$/, '');

    if (lang === this.config.baseLang) {
      return `/${cleanPath}/`;
    } else {
      return `/${lang}/${cleanPath}/`;
    }
  }

  async run(): Promise<OrchestratorResult> {
    try {
      // 1. Detect framework
      const detectResult = Detector.detect(this.workspacePath);
      if (detectResult.framework === 'unknown') {
        console.log('Warning: Unknown blog framework detected. Using default directory strategy.');
      } else {
        console.log(`Detected framework: ${detectResult.framework}`);
      }

      // 2. Initialize State and Ignore
      const stateManager = new StateManager(this.workspacePath);
      const state = stateManager.readState();
      const ignoreParser = new IgnoreParser(this.workspacePath);

      // 3. Get Diff
      const diff = DiffDetector.getDiff(
        this.workspacePath,
        state,
        detectResult.postsDir,
        (p) => ignoreParser.ignores(p)
      );

      const hasChanges = diff.added.length > 0 || diff.modified.length > 0 || diff.deleted.length > 0;
      if (!hasChanges) {
        console.log('No new, modified, or deleted blog posts found. Everything is up to date.');
        return { translatedCount: 0, success: true };
      }

      console.log(`Found changes: ${diff.added.length} added, ${diff.modified.length} modified, ${diff.deleted.length} deleted.`);

      const filesToCommit = new Set<string>();

      // 4. Handle Deleted Files
      for (const deletedFile of diff.deleted) {
        const fileState = state.files[deletedFile];
        if (fileState) {
          for (const lang of Object.keys(fileState.translated)) {
            // Re-run generator logic to find where the translated file was stored
            const dummyResult = FileGenerator.generate(deletedFile, '', lang, detectResult);
            const fullGeneratedPath = path.join(this.workspacePath, dummyResult.generatedPath);
            if (fs.existsSync(fullGeneratedPath)) {
              fs.unlinkSync(fullGeneratedPath);
              filesToCommit.add(dummyResult.generatedPath);
            }
          }
          delete state.files[deletedFile];
        }
      }

      // 5. Prepare Translation Tasks
      const tasks: TranslationTask[] = [];
      const pendingFiles = [...diff.added, ...diff.modified];

      for (const file of pendingFiles) {
        const fullPath = path.join(this.workspacePath, file);
        if (!fs.existsSync(fullPath)) continue;

        const content = fs.readFileSync(fullPath, 'utf8');
        for (const targetLang of this.config.targetLangs) {
          tasks.push({
            filePath: file,
            content,
            sourceLang: this.config.baseLang,
            targetLang
          });
        }
      }

      // 6. Run Translator
      let translatedCount = 0;
      if (tasks.length > 0) {
        console.log(`Translating ${pendingFiles.length} files into ${this.config.targetLangs.length} languages (${tasks.length} tasks)...`);
        const translator = new Translator(this.config);
        const results = await translator.translate(tasks);

        // Group results by original file
        const resultsByFile: Record<string, typeof results> = {};
        for (const res of results) {
          if (!resultsByFile[res.filePath]) {
            resultsByFile[res.filePath] = [];
          }
          resultsByFile[res.filePath].push(res);
        }

        // 7. Generate translated files and update state
        for (const file of pendingFiles) {
          const fileResults = resultsByFile[file] || [];
          const originalFullPath = path.join(this.workspacePath, file);
          const originalContent = fs.readFileSync(originalFullPath, 'utf8');
          const originalHash = DiffDetector.getHash(originalContent);

          const fileState = state.files[file] || { hash: originalHash, translated: {} };
          fileState.hash = originalHash;

          for (const res of fileResults) {
            if (res.success) {
              // Generate translated file content and path
              const genResult = FileGenerator.generate(
                file,
                res.translatedContent,
                res.targetLang,
                detectResult
              );

              const fullGenPath = path.join(this.workspacePath, genResult.generatedPath);
              const genDir = path.dirname(fullGenPath);
              if (!fs.existsSync(genDir)) {
                fs.mkdirSync(genDir, { recursive: true });
              }

              fs.writeFileSync(fullGenPath, genResult.content, 'utf8');
              filesToCommit.add(genResult.generatedPath);

              // Update state
              fileState.translated[res.targetLang] = DiffDetector.getHash(genResult.content);
              translatedCount++;
            } else {
              console.error(`Failed to translate ${file} to ${res.targetLang}:`, res.error);
            }
          }

          state.files[file] = fileState;
        }
      }

      // 8. Inject/Update Language Switching Links
      // We need to update links for ALL files currently in state (both newly translated and pre-existing)
      // to ensure language switcher links are always correct and up to date.
      console.log('Injecting/updating language switching links...');
      for (const [originalFile, fileState] of Object.entries(state.files)) {
        const originalFullPath = path.join(this.workspacePath, originalFile);
        if (!fs.existsSync(originalFullPath)) continue;

        // Build pages list
        const pages: PageInfo[] = [];

        // Base language page
        const originalUrl = this.resolvePageUrl(originalFile, this.config.baseLang, detectResult.framework);
        pages.push({ lang: this.config.baseLang, path: originalUrl });

        // Translated pages
        for (const targetLang of Object.keys(fileState.translated)) {
          const dummyResult = FileGenerator.generate(originalFile, '', targetLang, detectResult);
          const targetUrl = this.resolvePageUrl(dummyResult.generatedPath, targetLang, detectResult.framework);
          pages.push({ lang: targetLang, path: targetUrl });
        }

        // Sort pages to keep consistent order (base language first, then alphabetical by lang code)
        pages.sort((a, b) => {
          if (a.lang === this.config.baseLang) return -1;
          if (b.lang === this.config.baseLang) return 1;
          return a.lang.localeCompare(b.lang);
        });

        // Inject links into original file
        const originalContent = fs.readFileSync(originalFullPath, 'utf8');
        const updatedOriginalContent = LangLinkInjector.inject(originalContent, this.config.baseLang, pages);
        if (originalContent !== updatedOriginalContent) {
          fs.writeFileSync(originalFullPath, updatedOriginalContent, 'utf8');
          filesToCommit.add(originalFile);
          // Recalculate original hash because we modified it with links
          fileState.hash = DiffDetector.getHash(updatedOriginalContent);
        }

        // Inject links into translated files
        for (const targetLang of Object.keys(fileState.translated)) {
          const dummyResult = FileGenerator.generate(originalFile, '', targetLang, detectResult);
          const fullGenPath = path.join(this.workspacePath, dummyResult.generatedPath);
          if (fs.existsSync(fullGenPath)) {
            const genContent = fs.readFileSync(fullGenPath, 'utf8');
            const updatedGenContent = LangLinkInjector.inject(genContent, targetLang, pages);
            if (genContent !== updatedGenContent) {
              fs.writeFileSync(fullGenPath, updatedGenContent, 'utf8');
              filesToCommit.add(dummyResult.generatedPath);
              fileState.translated[targetLang] = DiffDetector.getHash(updatedGenContent);
            }
          }
        }
      }

      // Save state.json
      stateManager.saveState(state);
      // Ensure state.json is committed
      const stateRelativePath = '.blog-global/state.json';
      filesToCommit.add(stateRelativePath);

      // 9. Git and PR creation
      let prUrl: string | undefined;
      if (this.config.createPr && this.config.githubToken && filesToCommit.size > 0) {
        console.log('Creating Pull Request...');
        const gitPRManager = new GitPRManager({
          workspacePath: this.workspacePath,
          githubToken: this.config.githubToken,
          baseBranch: this.config.baseBranch || 'main'
        });

        const branchName = `blog-global/translate-${Date.now()}`;
        const prTitle = '[blog-global] Auto translation update';
        const prBody = `This Pull Request was automatically generated by [blog-global](https://github.com/your-name/blog-global) to translate blog posts.

### Summary of Changes:
- Translated posts to: ${this.config.targetLangs.join(', ')}
- Updated language switching links across all pages
- Updated \`.blog-global/state.json\`

*This is an automated PR. Please review and merge.*`;

        prUrl = await gitPRManager.createPullRequest(
          branchName,
          prTitle,
          prBody,
          Array.from(filesToCommit)
        );
        console.log(`Pull Request created successfully: ${prUrl}`);
      }

      return {
        translatedCount,
        prUrl,
        filesToCommit: Array.from(filesToCommit),
        success: true
      };
    } catch (error: any) {
      return {
        translatedCount: 0,
        success: false,
        error: error.message || String(error)
      };
    }
  }
}
