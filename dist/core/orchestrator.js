"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Orchestrator = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const gray_matter_1 = __importDefault(require("gray-matter"));
const config_1 = require("./config");
const detector_1 = require("./detector");
const ignore_1 = require("./ignore");
const state_1 = require("./state");
const diff_1 = require("./diff");
const translator_1 = require("./translator");
const generator_1 = require("./generator");
const lang_link_1 = require("./lang-link");
const git_pr_1 = require("./git-pr");
const fs_utils_1 = require("../utils/fs-utils");
class Orchestrator {
    config;
    workspacePath;
    constructor(config, workspacePath) {
        this.config = config;
        this.workspacePath = workspacePath;
    }
    resolvePageUrl(filePath, lang, framework) {
        let relativePath;
        const fullPath = path.join(this.workspacePath, filePath);
        let permalink;
        if (fs.existsSync(fullPath)) {
            try {
                const content = (0, fs_utils_1.readTextFile)(fullPath);
                const parsed = (0, gray_matter_1.default)(content);
                if (typeof parsed.data.permalink === 'string') {
                    permalink = parsed.data.permalink;
                }
            }
            catch {
                // Ignore
            }
        }
        if (permalink) {
            relativePath = permalink;
        }
        else {
            // Fallback URL generation
            let cleanPath = filePath.replace(/\\/g, '/');
            // Strip posts directory prefixes
            cleanPath = cleanPath.replace(/^(_posts|source\/_posts)\//, '');
            cleanPath = cleanPath.replace(/\.(md|markdown)$/, '');
            relativePath = lang === this.config.baseLang
                ? `/${cleanPath}/`
                : `/${lang}/${cleanPath}/`;
        }
        const siteUrl = (0, config_1.normalizeSiteUrl)(this.config.siteUrl);
        if (!siteUrl) {
            return relativePath;
        }
        return `${siteUrl}${relativePath.startsWith('/') ? '' : '/'}${relativePath}`;
    }
    async run() {
        try {
            // 1. Detect framework
            const detectResult = detector_1.Detector.detect(this.workspacePath);
            if (detectResult.framework === 'unknown') {
                console.log('Warning: Unknown blog framework detected. Using default directory strategy.');
            }
            else {
                console.log(`Detected framework: ${detectResult.framework}`);
            }
            // 2. Initialize State and Ignore
            const stateManager = new state_1.StateManager(this.workspacePath);
            const state = stateManager.readState();
            const ignoreParser = new ignore_1.IgnoreParser(this.workspacePath);
            // 3. Get Diff
            const diff = diff_1.DiffDetector.getDiff(this.workspacePath, state, detectResult.postsDir, (p) => ignoreParser.ignores(p), this.config.targetLangs);
            const hasChanges = diff.added.length > 0 || diff.modified.length > 0 || diff.deleted.length > 0;
            if (!hasChanges) {
                console.log('No new, modified, or deleted blog posts found. Everything is up to date.');
                return { translatedCount: 0, success: true };
            }
            console.log(`Found changes: ${diff.added.length} added, ${diff.modified.length} modified, ${diff.deleted.length} deleted.`);
            const filesToCommit = new Set();
            // 4. Handle Deleted Files
            for (const deletedFile of diff.deleted) {
                const fileState = state.files[deletedFile];
                if (fileState) {
                    for (const lang of Object.keys(fileState.translated)) {
                        // Re-run generator logic to find where the translated file was stored
                        const dummyResult = generator_1.FileGenerator.generate(deletedFile, '', lang, detectResult);
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
            const tasks = [];
            const pendingFiles = [...diff.added, ...diff.modified];
            for (const file of pendingFiles) {
                const fullPath = path.join(this.workspacePath, file);
                if (!fs.existsSync(fullPath))
                    continue;
                const content = (0, fs_utils_1.readTextFile)(fullPath);
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
                const translator = new translator_1.Translator(this.config);
                const results = await translator.translate(tasks);
                // Group results by original file
                const resultsByFile = {};
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
                    const originalContent = (0, fs_utils_1.readTextFile)(originalFullPath);
                    const originalHash = diff_1.DiffDetector.getHash(originalContent);
                    const fileState = state.files[file] || { hash: originalHash, translated: {} };
                    fileState.hash = originalHash;
                    for (const res of fileResults) {
                        if (res.success) {
                            // Generate translated file content and path
                            const genResult = generator_1.FileGenerator.generate(file, res.translatedContent, res.targetLang, detectResult);
                            const fullGenPath = path.join(this.workspacePath, genResult.generatedPath);
                            const genDir = path.dirname(fullGenPath);
                            if (!fs.existsSync(genDir)) {
                                fs.mkdirSync(genDir, { recursive: true });
                            }
                            fs.writeFileSync(fullGenPath, genResult.content, 'utf8');
                            filesToCommit.add(genResult.generatedPath);
                            // Update state
                            fileState.translated[res.targetLang] = diff_1.DiffDetector.getHash(genResult.content);
                            translatedCount++;
                        }
                        else {
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
                if (!fs.existsSync(originalFullPath))
                    continue;
                // Build pages list
                const pages = [];
                // Base language page
                const originalUrl = this.resolvePageUrl(originalFile, this.config.baseLang, detectResult.framework);
                pages.push({ lang: this.config.baseLang, path: originalUrl });
                // Translated pages
                for (const targetLang of Object.keys(fileState.translated)) {
                    const dummyResult = generator_1.FileGenerator.generate(originalFile, '', targetLang, detectResult);
                    const targetUrl = this.resolvePageUrl(dummyResult.generatedPath, targetLang, detectResult.framework);
                    pages.push({ lang: targetLang, path: targetUrl });
                }
                // Sort pages to keep consistent order (base language first, then alphabetical by lang code)
                pages.sort((a, b) => {
                    if (a.lang === this.config.baseLang)
                        return -1;
                    if (b.lang === this.config.baseLang)
                        return 1;
                    return a.lang.localeCompare(b.lang);
                });
                // Inject links into original file
                const originalContent = (0, fs_utils_1.readTextFile)(originalFullPath);
                const updatedOriginalContent = lang_link_1.LangLinkInjector.inject(originalContent, this.config.baseLang, pages);
                if (originalContent !== updatedOriginalContent) {
                    fs.writeFileSync(originalFullPath, updatedOriginalContent, 'utf8');
                    filesToCommit.add(originalFile);
                    // Recalculate original hash because we modified it with links
                    fileState.hash = diff_1.DiffDetector.getHash(updatedOriginalContent);
                }
                // Inject links into translated files
                for (const targetLang of Object.keys(fileState.translated)) {
                    const dummyResult = generator_1.FileGenerator.generate(originalFile, '', targetLang, detectResult);
                    const fullGenPath = path.join(this.workspacePath, dummyResult.generatedPath);
                    if (fs.existsSync(fullGenPath)) {
                        const genContent = (0, fs_utils_1.readTextFile)(fullGenPath);
                        const updatedGenContent = lang_link_1.LangLinkInjector.inject(genContent, targetLang, pages);
                        if (genContent !== updatedGenContent) {
                            fs.writeFileSync(fullGenPath, updatedGenContent, 'utf8');
                            filesToCommit.add(dummyResult.generatedPath);
                            fileState.translated[targetLang] = diff_1.DiffDetector.getHash(updatedGenContent);
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
            let prUrl;
            if (this.config.createPr && this.config.githubToken && filesToCommit.size > 0) {
                console.log('Creating Pull Request...');
                const gitPRManager = new git_pr_1.GitPRManager({
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
                prUrl = await gitPRManager.createPullRequest(branchName, prTitle, prBody, Array.from(filesToCommit));
                console.log(`Pull Request created successfully: ${prUrl}`);
            }
            return {
                translatedCount,
                prUrl,
                filesToCommit: Array.from(filesToCommit),
                success: true
            };
        }
        catch (error) {
            return {
                translatedCount: 0,
                success: false,
                error: error.message || String(error)
            };
        }
    }
}
exports.Orchestrator = Orchestrator;
