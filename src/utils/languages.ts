export interface Language {
  code: string;
  name: string;
  englishName: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'zh-CN', name: '简体中文', englishName: 'Chinese (Simplified)', nativeName: '中文' },
  { code: 'zh-TW', name: '繁体中文', englishName: 'Chinese (Traditional)', nativeName: '繁體中文' },
  { code: 'en', name: '英语', englishName: 'English', nativeName: 'English' },
  { code: 'ja', name: '日语', englishName: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: '韩语', englishName: 'Korean', nativeName: '한국어' },
  { code: 'es', name: '西班牙语', englishName: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: '法语', englishName: 'French', nativeName: 'Français' },
  { code: 'de', name: '德语', englishName: 'German', nativeName: 'Deutsch' },
  { code: 'ru', name: '俄语', englishName: 'Russian', nativeName: 'Русский' },
  { code: 'pt', name: '葡萄牙语', englishName: 'Portuguese', nativeName: 'Português' },
  { code: 'ar', name: '阿拉伯语', englishName: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: '印地语', englishName: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'it', name: '意大利语', englishName: 'Italian', nativeName: 'Italiano' },
  { code: 'nl', name: '荷兰语', englishName: 'Dutch', nativeName: 'Nederlands' },
  { code: 'pl', name: '波兰语', englishName: 'Polish', nativeName: 'Polski' },
  { code: 'tr', name: '土耳其语', englishName: 'Turkish', nativeName: 'Türkçe' },
  { code: 'vi', name: '越南语', englishName: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'th', name: '泰语', englishName: 'Thai', nativeName: 'ไทย' },
  { code: 'id', name: '印尼语', englishName: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'ms', name: '马来语', englishName: 'Malay', nativeName: 'Bahasa Melayu' }
];

export function isValidLanguageCode(code: string): boolean {
  return SUPPORTED_LANGUAGES.some(lang => lang.code === code);
}

export function getLanguageNativeName(code: string): string {
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
  return lang ? lang.nativeName : code;
}
