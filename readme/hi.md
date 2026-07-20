# blog-global

[中文](zh-CN.md) | [繁體中文](zh-TW.md) | [English](en.md) | [日本語](ja.md) | [한국어](ko.md) | [Español](es.md) | [Français](fr.md) | [Deutsch](de.md) | [Русский](ru.md) | [Português](pt.md) | [العربية](ar.md) | **हिन्दी** | [Italiano](it.md) | [Nederlands](nl.md) | [Polski](pl.md) | [Türkçe](tr.md) | [Tiếng Việt](vi.md) | [ไทย](th.md) | [Bahasa Indonesia](id.md) | [Bahasa Melayu](ms.md)

AI की मदद से GitHub Pages ब्लॉग को कई भाषाओं में अनुवाद करें।

अभी केवल CLI: इन्क्रिमेंटल अनुवाद, भाषा स्विच लिंक, और वैकल्पिक ऑटो PR।

पूर्ण रूप से समर्थित फ्रेमवर्क: **Jekyll**।

## ध्यान दें (आवश्यक प्रोजेक्ट संरचना)

**ब्लॉग रिपॉजिटरी रूट** में चलाएँ। यह संरचना आवश्यक है, नहीं तो स्कैन / लिंक इंजेक्शन / PR असफल होंगे:

```text
your-blog/                 ← यहाँ node cli.js चलाएँ
├── _config.yml            ← आवश्यक
├── _posts/                ← आवश्यक; बेस भाषा की पोस्ट यहाँ रखें
│   └── 2026-06-23-hello.md
├── .git/                  ← Git रिपॉजिटरी होनी चाहिए
└── (रिमोट GitHub होना चाहिए)
```

| शर्त | आवश्यकता |
| ---- | ---- |
| फ्रेमवर्क | Jekyll: `_config.yml` और `_posts/` दोनों होने चाहिए |
| पोस्ट प्रारूप | `_posts/` में `.md` / `.markdown`; बेहतर `YYYY-MM-DD-slug.md` (pretty permalink) |
| वर्किंग डायरेक्टरी | ब्लॉग रूट, blog-global टूल डायरेक्टरी नहीं |
| ऑटो PR | GitHub remote सेट; `repo` स्कोप वाला Token; `--base-branch` लोकल मौजूद |
| असमर्थित | Hugo; सादे स्टैटिक HTML साइट; `_posts/` के बिना लेआउट |

अनुवाद रिपो रूट पर `{lang}/` में लिखे जाते हैं (जैसे `en/xxx.md`), **`_posts/` में नहीं**, ताकि होमपेज और टैग साफ रहें।

## आवश्यकताएँ

- Node.js ≥ 18
- AI API Key (OpenRouter / SiliconFlow / OpenAI-compatible कस्टम एंडपॉइंट)
- ऑटो PR के लिए: `repo` स्कोप वाला GitHub Token

## उपयोग

**ब्लॉग रिपॉजिटरी रूट** से चलाएँ।

### 1. CLI प्राप्त करें

[Releases](https://github.com/byolio/github-blog-global/releases) से `blog-global-cli-*.zip` डाउनलोड कर अनज़िप करें — `cli.js` मिलेगा।

या सोर्स से बिल्ड करें:

```bash
npm install
npm run build
npm run package:cli   # → dist/cli.js
```

### 2. इंटरैक्टिव मोड

```bash
node cli.js
# or
node /path/to/blog-global/dist/cli.js
```

प्रॉम्प्ट के अनुसार चुनें: AI Provider → API Key → मॉडल → स्रोत भाषा → लक्ष्य भाषाएँ → site URL (वैकल्पिक) → PR ब्रांच → PR बनाएँ? → GitHub Token।

### 3. नॉन-इंटरैक्टिव मोड

```bash
node cli.js \
  --provider siliconflow \
  --api-key $BLOG_GLOBAL_API_KEY \
  --model deepseek-ai/DeepSeek-V3 \
  --base-lang zh-CN \
  --target-langs en \
  --create-pr \
  --token $GITHUB_TOKEN \
  --base-branch master \
  --site-url https://example.com
```

| फ्लैग | विवरण |
| ---- | ---- |
| `--provider` | `openrouter` / `siliconflow` / `custom` |
| `--api-key` | AI Key; या एनव `BLOG_GLOBAL_API_KEY` |
| `--model` | मॉडल नाम (SiliconFlow में ऑर्ग प्रीफिक्स चाहिए) |
| `--base-url` | केवल `custom` पर आवश्यक |
| `--base-lang` | बेस भाषा, जैसे `zh-CN` |
| `--target-langs` | लक्ष्य भाषाएँ, कॉमा से अलग, जैसे `en,ja` |
| `--site-url` | वैकल्पिक; खाली छोड़ने पर रिलेटिव भाषा लिंक |
| `--create-pr` | अनुवाद के बाद Pull Request बनाएँ |
| `--token` | GitHub Token; या एनव `GITHUB_TOKEN` |
| `--base-branch` | PR बेस ब्रांच, जैसे `master` / `main` |

वैकल्पिक कॉन्फ़िग `.blog-global.yml` ब्लॉग रूट में (**API Key यहाँ न लिखें**):

```yaml
provider: siliconflow
model: deepseek-ai/DeepSeek-V3
base_lang: zh-CN
target_langs:
  - en
site_url: https://example.com
```

### 4. आउटपुट

| पथ | विवरण |
| ---- | ---- |
| `_posts/xxx.md` | मूल पोस्ट, भाषा स्विच लिंक के साथ |
| `en/xxx.md` | अंग्रेज़ी page |
| `.blog-global/state.json` | अगली रन के लिए इन्क्रिमेंटल स्टेट |

भाषा लिंक उदाहरण:

```markdown
> 🌐 [中文](/2026/06/23/DDD/) | [English](/en/2026/06/23/DDD/)
```

PR मर्ज के बाद होमपेज पर केवल मूल दिखता है; अनुवाद इन-पेज लिंक से खोलें।

## समर्थित भाषाएँ

`zh-CN` `zh-TW` `en` `ja` `ko` `es` `fr` `de` `ru` `pt` `ar` `hi` `it` `nl` `pl` `tr` `vi` `th` `id` `ms`
