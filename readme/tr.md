# blog-global

[中文](zh-CN.md) | [繁體中文](zh-TW.md) | [English](en.md) | [日本語](ja.md) | [한국어](ko.md) | [Español](es.md) | [Français](fr.md) | [Deutsch](de.md) | [Русский](ru.md) | [Português](pt.md) | [العربية](ar.md) | [हिन्दी](hi.md) | [Italiano](it.md) | [Nederlands](nl.md) | [Polski](pl.md) | **Türkçe** | [Tiếng Việt](vi.md) | [ไทย](th.md) | [Bahasa Indonesia](id.md) | [Bahasa Melayu](ms.md)

GitHub Pages bloglarını yapay zeka ile birden fazla dile çevirin.

Şimdilik yalnızca CLI: artımlı çeviri, dil değiştirme bağlantıları ve isteğe bağlı otomatik PR.

Tam desteklenen çerçeve: **Jekyll**.

## Dikkat (gerekli proje yapısı)

**Blog deposunun kökünde** çalıştırın. Bu yapı yoksa tarama, bağlantı ekleme veya PR oluşturma başarısız olur:

```text
your-blog/                 ← node cli.js burada çalıştırılır
├── _config.yml            ← zorunlu
├── _posts/                ← zorunlu; temel dil yazılarını buraya koyun
│   └── 2026-06-23-hello.md
├── .git/                  ← bir Git deposu olmalıdır
└── (uzak depo GitHub olmalıdır)
```

| Koşul | Gereksinim |
| ---- | ---- |
| Çerçeve | Jekyll: `_config.yml` ve `_posts/` birlikte olmalı |
| Yazı biçimi | `_posts/` altında `.md` / `.markdown`; tercih `YYYY-MM-DD-slug.md` (pretty permalink) |
| Çalışma dizini | Blog kökü, blog-global araç dizini değil |
| Otomatik PR | GitHub remote ayarlı; `repo` kapsamlı Token; `--base-branch` yerelde var |
| Desteklenmez | Hugo; düz statik HTML siteler; `_posts/` olmayan düzenler |

Çeviriler kökte `{lang}/` altına yazılır (ör. `en/xxx.md`), **`_posts/` içine değil**; ana sayfa ve etiketler bozulmasın diye.

## Gereksinimler

- Node.js ≥ 18
- AI API Anahtarı (OpenRouter / SiliconFlow / OpenAI uyumlu özel uç nokta)
- Otomatik PR için: `repo` kapsamlı GitHub Token

## Kullanım

**Blog deposunun kökünden** çalıştırın.

### 1. CLI’yi alın

[Releases](https://github.com/byolio/github-blog-global/releases) sayfasından `blog-global-cli-*.zip` indirip açın; `cli.js` elde edilir.

Veya kaynaktan derleyin:

```bash
npm install
npm run build
npm run package:cli   # → dist/cli.js
```

### 2. Etkileşimli mod

```bash
node cli.js
# or
node /path/to/blog-global/dist/cli.js
```

İstemleri izleyin: AI Provider → API Key → model → kaynak dil → hedef diller → site URL (isteğe bağlı) → PR dalı → PR oluşturulsun mu? → GitHub Token.

### 3. Etkileşimsiz mod

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

| Seçenek | Açıklama |
| ---- | ---- |
| `--provider` | `openrouter` / `siliconflow` / `custom` |
| `--api-key` | AI anahtarı; veya ortam değişkeni `BLOG_GLOBAL_API_KEY` |
| `--model` | Model adı (SiliconFlow için kuruluş öneki gerekir) |
| `--base-url` | Yalnızca provider `custom` iken gerekli |
| `--base-lang` | Temel dil, örn. `zh-CN` |
| `--target-langs` | Hedef diller, virgülle ayrılmış, örn. `en,ja` |
| `--site-url` | İsteğe bağlı; boş bırakılırsa göreli dil bağlantıları |
| `--create-pr` | Çeviriden sonra Pull Request oluştur |
| `--token` | GitHub Token; veya ortam değişkeni `GITHUB_TOKEN` |
| `--base-branch` | PR temel dalı, örn. `master` / `main` |

İsteğe bağlı yapılandırma `.blog-global.yml` (blog kökünde; **API anahtarını buraya yazmayın**):

```yaml
provider: siliconflow
model: deepseek-ai/DeepSeek-V3
base_lang: zh-CN
target_langs:
  - en
site_url: https://example.com
```

### 4. Çıktı

| Yol | Açıklama |
| ---- | ---- |
| `_posts/xxx.md` | Dil bağlantıları eklenmiş orijinal |
| `en/xxx.md` | İngilizce page |
| `.blog-global/state.json` | Sonraki çalıştırma için artımlı durum |

Dil bağlantısı örneği:

```markdown
> 🌐 [中文](/2026/06/23/DDD/) | [English](/en/2026/06/23/DDD/)
```

PR birleştirildikten sonra ana sayfa hâlâ yalnızca orijinalleri gösterir; çevirilere yazı içi bağlantılardan gidin.

## Desteklenen diller

`zh-CN` `zh-TW` `en` `ja` `ko` `es` `fr` `de` `ru` `pt` `ar` `hi` `it` `nl` `pl` `tr` `vi` `th` `id` `ms`
