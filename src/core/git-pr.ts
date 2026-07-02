import { execSync } from 'child_process';
import { Octokit } from '@octokit/rest';

export interface GitPRConfig {
  workspacePath: string;
  githubToken: string;
  baseBranch?: string;
}

export function getOwnerAndRepo(workspacePath: string): { owner: string; repo: string } {
  if (process.env.GITHUB_REPOSITORY) {
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
    return { owner, repo };
  }

  const extract = (url: string): { owner: string; repo: string } | null => {
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
    const originUrl = execSync('git remote get-url origin', { cwd: workspacePath, stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8' }).trim();
    const res = extract(originUrl);
    if (res) return res;
  } catch {
    // Ignore origin failure
  }

  try {
    const remotes = execSync('git remote', { cwd: workspacePath, stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8' }).trim().split(/\s+/).filter(Boolean);
    for (const remote of remotes) {
      try {
        const url = execSync(`git remote get-url ${remote}`, { cwd: workspacePath, stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8' }).trim();
        const res = extract(url);
        if (res) return res;
      } catch {
        // Ignore individual remote failures
      }
    }
  } catch {
    // Ignore git remote command failure
  }

  throw new Error('Could not determine GitHub owner and repository. Please ensure you are in a Git repository with a GitHub remote, or set GITHUB_REPOSITORY environment variable (e.g. $env:GITHUB_REPOSITORY="owner/repo" in PowerShell or export GITHUB_REPOSITORY="owner/repo" in Bash).');
}

export class GitPRManager {
  private workspacePath: string;
  private githubToken: string;
  private baseBranch: string;

  constructor(config: GitPRConfig) {
    this.workspacePath = config.workspacePath;
    this.githubToken = config.githubToken;
    this.baseBranch = config.baseBranch || 'main';
  }

  private runGit(args: string[]): string {
    return execSync(`git ${args.join(' ')}`, { cwd: this.workspacePath, encoding: 'utf8' }).trim();
  }

  async createPullRequest(
    branchName: string,
    prTitle: string,
    prBody: string,
    filesToCommit: string[] // List of files that were added/modified/deleted
  ): Promise<string> {
    const { owner, repo } = getOwnerAndRepo(this.workspacePath);

    // Save current branch to restore it later
    let originalBranch = 'main';
    try {
      originalBranch = this.runGit(['rev-parse', '--abbrev-ref', 'HEAD']);
    } catch {
      // Ignore
    }

    // Check if base branch exists locally or can be checked out
    try {
      this.runGit(['checkout', this.baseBranch]);
    } catch (err: any) {
      throw new Error(`The specified base branch "${this.baseBranch}" could not be checked out. Please ensure this branch exists in your local Git repository.`);
    }

    try {
      // 1. Create and checkout new branch from baseBranch
      this.runGit(['checkout', '-b', branchName]);

      // 2. Add files
      for (const file of filesToCommit) {
        try {
          this.runGit(['add', `"${file}"`]);
        } catch {
          // File might have been deleted, try to add with -A or rm
          try {
            this.runGit(['rm', `"${file}"`]);
          } catch {
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
      const octokit = new Octokit({ auth: this.githubToken });
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
      } catch {
        // Ignore if checkout back fails
      }

      return response.data.html_url;
    } catch (err: any) {
      // Clean up local temp branch and restore original branch on failure
      try {
        this.runGit(['checkout', originalBranch]);
        this.runGit(['branch', '-D', branchName]);
      } catch {
        // Ignore branch cleanup errors to bubble up the original error
      }
      throw err;
    }
  }
}
