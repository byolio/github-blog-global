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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitPRManager = void 0;
exports.getOwnerAndRepo = getOwnerAndRepo;
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const rest_1 = require("@octokit/rest");
function getOwnerAndRepo(workspacePath) {
    if (process.env.GITHUB_REPOSITORY) {
        const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
        return { owner, repo };
    }
    const extract = (url) => {
        const match = url.match(/github\.com[/:]([^/]+)\/([^/]+)/);
        if (match) {
            let repo = match[2].trim();
            if (repo.endsWith('.git')) {
                repo = repo.substring(0, repo.length - 4);
            }
            return { owner: match[1], repo };
        }
        return null;
    };
    try {
        const originUrl = (0, child_process_1.execSync)('git remote get-url origin', { cwd: workspacePath, stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8' }).trim();
        const res = extract(originUrl);
        if (res)
            return res;
    }
    catch {
        // Ignore origin failure
    }
    try {
        const remotes = (0, child_process_1.execSync)('git remote', { cwd: workspacePath, stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8' }).trim().split(/\s+/).filter(Boolean);
        for (const remote of remotes) {
            try {
                const url = (0, child_process_1.execSync)(`git remote get-url ${remote}`, { cwd: workspacePath, stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8' }).trim();
                const res = extract(url);
                if (res)
                    return res;
            }
            catch {
                // Ignore individual remote failures
            }
        }
    }
    catch {
        // Ignore git remote command failure
    }
    throw new Error('Could not determine GitHub owner and repository. Please ensure you are in a Git repository with a GitHub remote, or set GITHUB_REPOSITORY environment variable (e.g. $env:GITHUB_REPOSITORY="owner/repo" in PowerShell or export GITHUB_REPOSITORY="owner/repo" in Bash).');
}
class GitPRManager {
    workspacePath;
    githubToken;
    baseBranch;
    constructor(config) {
        this.workspacePath = config.workspacePath;
        this.githubToken = config.githubToken;
        this.baseBranch = config.baseBranch || 'main';
    }
    runGit(args) {
        return (0, child_process_1.execSync)(`git ${args.join(' ')}`, { cwd: this.workspacePath, encoding: 'utf8' }).trim();
    }
    async createPullRequest(branchName, prTitle, prBody, filesToCommit // List of files that were added/modified/deleted
    ) {
        const { owner, repo } = getOwnerAndRepo(this.workspacePath);
        // Save current branch to restore it later
        let originalBranch = 'main';
        try {
            originalBranch = this.runGit(['rev-parse', '--abbrev-ref', 'HEAD']);
        }
        catch {
            // Ignore
        }
        // Back up the current contents of files we're about to commit. If PR
        // creation fails after the commit, checking back out to originalBranch
        // would otherwise silently discard this work (it only exists in the
        // temporary branch's commit). Restoring from this backup keeps the
        // translated/modified files on disk as local (uncommitted) changes.
        const backups = new Map();
        for (const file of filesToCommit) {
            const fullPath = path.join(this.workspacePath, file);
            backups.set(file, fs.existsSync(fullPath) ? fs.readFileSync(fullPath) : null);
        }
        const restoreBackups = () => {
            for (const [file, content] of backups.entries()) {
                const fullPath = path.join(this.workspacePath, file);
                try {
                    if (content === null) {
                        if (fs.existsSync(fullPath))
                            fs.unlinkSync(fullPath);
                    }
                    else {
                        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
                        fs.writeFileSync(fullPath, content);
                    }
                }
                catch {
                    // Best-effort restore; ignore individual file failures
                }
            }
        };
        // Check if base branch exists locally or can be checked out
        try {
            this.runGit(['checkout', this.baseBranch]);
        }
        catch (err) {
            throw new Error(`The specified base branch "${this.baseBranch}" could not be checked out. Please ensure this branch exists in your local Git repository.`);
        }
        try {
            // 1. Create and checkout new branch from baseBranch
            this.runGit(['checkout', '-b', branchName]);
            // 2. Add files
            for (const file of filesToCommit) {
                try {
                    this.runGit(['add', `"${file}"`]);
                }
                catch {
                    // File might have been deleted, try to add with -A or rm
                    try {
                        this.runGit(['rm', `"${file}"`]);
                    }
                    catch {
                        // Ignore if file doesn't exist
                    }
                }
            }
            // 3. Commit with inline user config to avoid modifying global config
            const commitMsg = prTitle;
            this.runGit([
                '-c', 'user.name="github-actions[bot]"',
                '-c', 'user.email="41898282+github-actions[bot]@users.noreply.github.com"',
                'commit', '-m', `"${commitMsg.replace(/"/g, '\\"')}"`
            ]);
            // 4. Push to remote using token for auth
            const pushUrl = `https://x-access-token:${this.githubToken}@github.com/${owner}/${repo}.git`;
            this.runGit(['push', '-u', pushUrl, `HEAD:refs/heads/${branchName}`]);
            // 5. Create PR via Octokit
            const octokit = new rest_1.Octokit({ auth: this.githubToken });
            const response = await octokit.pulls.create({
                owner,
                repo,
                title: prTitle,
                head: branchName,
                base: this.baseBranch,
                body: prBody
            });
            // 6. Checkout back to original branch
            try {
                this.runGit(['checkout', originalBranch]);
            }
            catch {
                // Ignore if checkout back fails
            }
            return response.data.html_url;
        }
        catch (err) {
            // Clean up local temp branch and restore original branch on failure
            try {
                this.runGit(['checkout', originalBranch]);
                this.runGit(['branch', '-D', branchName]);
            }
            catch {
                // Ignore branch cleanup errors to bubble up the original error
            }
            // Restore translated/modified files so the failed attempt doesn't lose work
            restoreBackups();
            throw err;
        }
    }
}
exports.GitPRManager = GitPRManager;
