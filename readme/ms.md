# blog-global

[中文](zh-CN.md) | [繁體中文](zh-TW.md) | [English](en.md) | [日本語](ja.md) | [한국어](ko.md) | [Español](es.md) | [Français](fr.md) | [Deutsch](de.md) | [Русский](ru.md) | [Português](pt.md) | [العربية](ar.md) | [हिन्दी](hi.md) | [Italiano](it.md) | [Nederlands](nl.md) | [Polski](pl.md) | [Türkçe](tr.md) | [Tiếng Việt](vi.md) | [ไทย](th.md) | [Bahasa Indonesia](id.md) | **Bahasa Melayu**

Terjemahkan blog GitHub Pages ke pelbagai bahasa dengan AI.

Buat masa ini hanya CLI: terjemahan beransur, pautan tukar bahasa, dan penciptaan PR automatik pilihan.

Rangka kerja yang disokong sepenuhnya: **Jekyll**.

## Nota (struktur projek yang diperlukan)

Jalankan di **akar repositori blog**. Tanpa struktur ini, imbasan / suntikan pautan / penciptaan PR akan gagal:

```text
your-blog/                 ← jalankan node cli.js di sini
├── _config.yml            ← wajib
├── _posts/                ← wajib; letakkan pos bahasa asas di sini
│   └── 2026-06-23-hello.md
├── .git/                  ← mesti repositori Git
└── (jauh mesti GitHub)
```

| Syarat | Keperluan |
| ---- | ---- |
| Rangka kerja | Jekyll: `_config.yml` dan `_posts/` mesti wujud |
| Format pos | `.md` / `.markdown` dalam `_posts/`; lebih baik `YYYY-MM-DD-slug.md` (pretty permalink) |
| Direktori kerja | Akar blog, bukan direktori alat blog-global |
| PR automatik | Remote GitHub dikonfigurasi; Token skop `repo`; `--base-branch` wujud secara tempatan |
| Tidak disokong | Hugo; tapak HTML statik biasa; susun atur tanpa `_posts/` |

Terjemahan ditulis ke `{lang}/` di akar repo (cth. `en/xxx.md`), **bukan** ke `_posts/`, supaya laman utama dan tag kekal bersih.

## Keperluan

- Node.js ≥ 18
- AI API Key (OpenRouter / SiliconFlow / titik akhir tersuai serasi OpenAI)
- Untuk PR automatik: GitHub Token dengan skop `repo`

## Cara guna

Jalankan dari **akar repositori blog**.

### 1. Dapatkan CLI

Muat turun `blog-global-cli-*.zip` dari [Releases](https://github.com/byolio/github-blog-global/releases) lalu ekstrak untuk mendapat `cli.js`.

Atau bina daripada sumber:

```bash
npm install
npm run build
npm run package:cli   # → dist/cli.js
```

### 2. Mod interaktif

```bash
node cli.js
# or
node /path/to/blog-global/dist/cli.js
```

Ikuti gesaan: AI Provider → API Key → model → bahasa sumber → bahasa sasaran → site URL (pilihan) → cabang PR → cipta PR? → GitHub Token.

### 3. Mod bukan interaktif

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

| Pilihan | Penerangan |
| ---- | ---- |
| `--provider` | `openrouter` / `siliconflow` / `custom` |
| `--api-key` | Kunci AI; atau pembolehubah `BLOG_GLOBAL_API_KEY` |
| `--model` | Nama model (SiliconFlow memerlukan awalan organisasi) |
| `--base-url` | Hanya diperlukan jika provider ialah `custom` |
| `--base-lang` | Bahasa asas, cth. `zh-CN` |
| `--target-langs` | Bahasa sasaran dipisahkan koma, cth. `en,ja` |
| `--site-url` | Pilihan; jika kosong, pautan bahasa relatif |
| `--create-pr` | Cipta Pull Request selepas terjemahan |
| `--token` | GitHub Token; atau pembolehubah `GITHUB_TOKEN` |
| `--base-branch` | Cabang asas PR, cth. `master` / `main` |

Fail konfigurasi pilihan `.blog-global.yml` di akar blog (**jangan simpan API Key di sini**):

```yaml
provider: siliconflow
model: deepseek-ai/DeepSeek-V3
base_lang: zh-CN
target_langs:
  - en
site_url: https://example.com
```

### 4. Hasil

| Laluan | Penerangan |
| ---- | ---- |
| `_posts/xxx.md` | Asal dengan pautan bahasa dimasukkan |
| `en/xxx.md` | Page bahasa Inggeris |
| `.blog-global/state.json` | Keadaan beransur untuk larian seterusnya |

Contoh pautan bahasa:

```markdown
> 🌐 [中文](/2026/06/23/DDD/) | [English](/en/2026/06/23/DDD/)
```

Selepas gabung PR, laman utama masih hanya menunjukkan asal; buka terjemahan melalui pautan dalam artikel.

## Bahasa yang disokong

`zh-CN` `zh-TW` `en` `ja` `ko` `es` `fr` `de` `ru` `pt` `ar` `hi` `it` `nl` `pl` `tr` `vi` `th` `id` `ms`
