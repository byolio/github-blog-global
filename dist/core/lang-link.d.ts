export interface PageInfo {
    lang: string;
    path: string;
}
export declare class LangLinkInjector {
    static inject(fileContent: string, currentLang: string, pages: PageInfo[]): string;
}
