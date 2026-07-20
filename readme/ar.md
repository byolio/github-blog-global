# blog-global

[中文](zh-CN.md) | [繁體中文](zh-TW.md) | [English](en.md) | [日本語](ja.md) | [한국어](ko.md) | [Español](es.md) | [Français](fr.md) | [Deutsch](de.md) | [Русский](ru.md) | [Português](pt.md) | **العربية** | [हिन्दी](hi.md) | [Italiano](it.md) | [Nederlands](nl.md) | [Polski](pl.md) | [Türkçe](tr.md) | [Tiếng Việt](vi.md) | [ไทย](th.md) | [Bahasa Indonesia](id.md) | [Bahasa Melayu](ms.md)

ترجم مدونات GitHub Pages إلى لغات متعددة باستخدام الذكاء الاصطناعي.

حالياً عبر CLI فقط: ترجمة تزايدية، روابط تبديل اللغة، وإنشاء PR اختياري تلقائياً.

الإطار المدعوم بالكامل: **Jekyll**.

## ملاحظات (هيكل المشروع المطلوب)

شغّل الأداة في **جذر مستودع المدونة**. يجب أن يطابق الهيكل التالي وإلا سيفشل المسح أو حقن الروابط أو إنشاء PR:

```text
your-blog/                 ← نفّذ node cli.js هنا
├── _config.yml            ← مطلوب
├── _posts/                ← مطلوب؛ ضع مقالات اللغة الأساسية هنا
│   └── 2026-06-23-hello.md
├── .git/                  ← يجب أن يكون مستودع Git
└── (يجب أن يكون البُعد على GitHub)
```

| الشرط | المتطلب |
| ---- | ---- |
| الإطار | Jekyll: وجود `_config.yml` و`_posts/` معاً |
| تنسيق المقال | `.md` / `.markdown` داخل `_posts/`؛ يُفضّل `YYYY-MM-DD-slug.md` (pretty permalink) |
| مجلد التشغيل | جذر المدونة وليس مجلد أداة blog-global |
| PR تلقائي | remote على GitHub؛ رمز بصلاحية `repo`؛ وجود `--base-branch` محلياً |
| غير مدعوم | Hugo؛ مواقع HTML ثابتة بسيطة؛ تخطيطات بلا `_posts/` |

تُكتب الترجمات في `{lang}/` بجذر المستودع (مثل `en/xxx.md`)، **وليس** داخل `_posts/`، حتى لا تختلط الصفحة الرئيسية والوسوم.

## المتطلبات

- Node.js ≥ 18
- مفتاح API للذكاء الاصطناعي (OpenRouter / SiliconFlow / نقطة نهاية متوافقة مع OpenAI)
- لإنشاء PR تلقائياً: GitHub Token بصلاحية `repo`

## طريقة الاستخدام

شغّل من **جذر مستودع المدونة**.

### 1. الحصول على CLI

حمّل `blog-global-cli-*.zip` من [Releases](https://github.com/byolio/github-blog-global/releases) ثم فك الضغط للحصول على `cli.js`.

أو ابنِ من المصدر:

```bash
npm install
npm run build
npm run package:cli   # → dist/cli.js
```

### 2. الوضع التفاعلي

```bash
node cli.js
# or
node /path/to/blog-global/dist/cli.js
```

اتبع المطالبات: AI Provider → API Key → النموذج → لغة المصدر → اللغات الهدف → site URL (اختياري) → فرع PR → هل تُنشئ PR؟ → GitHub Token.

### 3. الوضع غير التفاعلي

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

| الخيار | الوصف |
| ---- | ---- |
| `--provider` | `openrouter` / `siliconflow` / `custom` |
| `--api-key` | مفتاح الذكاء الاصطناعي؛ أو المتغير `BLOG_GLOBAL_API_KEY` |
| `--model` | اسم النموذج (SiliconFlow يحتاج بادئة المؤسسة) |
| `--base-url` | مطلوب فقط عندما يكون الموفر `custom` |
| `--base-lang` | اللغة الأساسية، مثل `zh-CN` |
| `--target-langs` | اللغات الهدف مفصولة بفواصل، مثل `en,ja` |
| `--site-url` | اختياري؛ بدونها تكون روابط اللغة نسبية |
| `--create-pr` | إنشاء Pull Request بعد الترجمة |
| `--token` | GitHub Token؛ أو المتغير `GITHUB_TOKEN` |
| `--base-branch` | فرع أساس الـ PR، مثل `master` / `main` |

ملف إعداد اختياري `.blog-global.yml` في جذر المدونة (**لا تضع مفتاح API هنا**):

```yaml
provider: siliconflow
model: deepseek-ai/DeepSeek-V3
base_lang: zh-CN
target_langs:
  - en
site_url: https://example.com
```

### 4. الناتج

| المسار | الوصف |
| ---- | ---- |
| `_posts/xxx.md` | الأصل مع إدراج روابط اللغة |
| `en/xxx.md` | صفحة إنجليزية |
| `.blog-global/state.json` | حالة تزايدية للجولة التالية |

مثال على رابط اللغة:

```markdown
> 🌐 [中文](/2026/06/23/DDD/) | [English](/en/2026/06/23/DDD/)
```

بعد دمج الـ PR تبقى الصفحة الرئيسية تعرض الأصل فقط؛ افتح الترجمات عبر الروابط داخل المقال.

## اللغات المدعومة

`zh-CN` `zh-TW` `en` `ja` `ko` `es` `fr` `de` `ru` `pt` `ar` `hi` `it` `nl` `pl` `tr` `vi` `th` `id` `ms`
