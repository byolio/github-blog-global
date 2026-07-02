export interface Language {
    code: string;
    name: string;
    englishName: string;
    nativeName: string;
}
export declare const SUPPORTED_LANGUAGES: Language[];
export declare function isValidLanguageCode(code: string): boolean;
export declare function getLanguageNativeName(code: string): string;
export declare function getSupportedLanguageCodesList(): string;
