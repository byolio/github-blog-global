export interface DetectResult {
    framework: 'jekyll' | 'hugo' | 'hexo' | 'unknown';
    postsDir: string;
    i18nStrategy: {
        type: 'directory';
        pattern: string;
    };
}
export declare class Detector {
    static detect(workspacePath: string): DetectResult;
}
