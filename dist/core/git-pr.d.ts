export interface GitPRConfig {
    workspacePath: string;
    githubToken: string;
    baseBranch?: string;
}
export declare function getOwnerAndRepo(workspacePath: string): {
    owner: string;
    repo: string;
};
export declare class GitPRManager {
    private workspacePath;
    private githubToken;
    private baseBranch;
    constructor(config: GitPRConfig);
    private runGit;
    createPullRequest(branchName: string, prTitle: string, prBody: string, filesToCommit: string[]): Promise<string>;
}
