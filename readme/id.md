# blog-global

[中文](zh-CN.md) | [繁體中文](zh-TW.md) | [English](en.md) | [日本語](ja.md) | [한국어](ko.md) | [Español](es.md) | [Français](fr.md) | [Deutsch](de.md) | [Русский](ru.md) | [Português](pt.md) | [العربية](ar.md) | [हिन्दी](hi.md) | [Italiano](it.md) | [Nederlands](nl.md) | [Polski](pl.md) | [Türkçe](tr.md) | [Tiếng Việt](vi.md) | [ไทย](th.md) | **Bahasa Indonesia** | [Bahasa Melayu](ms.md)

Terjemahkan blog GitHub Pages ke banyak bahasa dengan AI.

Untuk saat ini hanya CLI: terjemahan inkremental, tautan ganti bahasa, dan pembuatan PR otomatis opsional.

Kerangka yang didukung penuh: **Jekyll**.

## Catatan (struktur proyek yang diperlukan)

Jalankan di **akar repositori blog**. Tanpa struktur ini, pemindaian / injeksi tautan / pembuatan PR akan gagal:

```text
your-blog/                 ← jalankan node cli.js di sini
├── _config.yml            ← wajib
├── _posts/                ← wajib; taruh pos bahasa dasar di sini
│   └── 2026-06-23-hello.md
├── .git/                  ← harus berupa repositori Git
└── (remote harus GitHub)
```

| Kondisi | Persyaratan |
| ---- | ---- |
| Kerangka | Jekyll: `_config.yml` dan `_posts/` harus ada |
| Format pos | `.md` / `.markdown` di `_posts/`; sebaiknya `YYYY-MM-DD-slug.md` (pretty permalink) |
| Direktori kerja | Akar blog, bukan direktori alat blog-global |
| PR otomatis | Remote GitHub dikonfigurasi; Token dengan cakupan `repo`; `--base-branch` ada secara lokal |
| Tidak didukung | Hugo; situs HTML statis biasa; tata letak tanpa `_posts/` |

Terjemahan ditulis ke `{lang}/` di akar repo (mis. `en/xxx.md`), **bukan** ke `_posts/`, agar beranda dan tag tetap bersih.

## Persyaratan

- Node.js ≥ 18
- AI API Key (OpenRouter / SiliconFlow / endpoint kustom yang kompatibel OpenAI)
- Untuk PR otomatis: GitHub Token dengan cakupan `repo`

## Cara menggunakan

Jalankan dari **akar repositori blog**.

### 1. Dapatkan CLI

Unduh `blog-global-cli-*.zip` dari [Releases](https://github.com/byolio/github-blog-global/releases) lalu ekstrak untuk mendapat `cli.js`.

Atau bangun dari sumber:

```bash
npm install
npm run build
npm run package:cli   # → dist/cli.js
```

### 2. Mode interaktif

```bash
node cli.js
# or
node /path/to/blog-global/dist/cli.js
```

Ikuti petunjuk: AI Provider → API Key → model → bahasa sumber → bahasa target → site URL (opsional) → cabang PR → buat PR? → GitHub Token.

### 3. Mode non-interaktif

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

| Opsi | Deskripsi |
| ---- | ---- |
| `--provider` | `openrouter` / `siliconflow` / `custom` |
| `--api-key` | Kunci AI; atau variabel `BLOG_GLOBAL_API_KEY` |
| `--model` | Nama model (SiliconFlow memerlukan awalan organisasi) |
| `--base-url` | Hanya diperlukan jika provider `custom` |
| `--base-lang` | Bahasa dasar, mis. `zh-CN` |
| `--target-langs` | Bahasa target dipisah koma, mis. `en,ja` |
| `--site-url` | Opsional; jika kosong, tautan bahasa relatif |
| `--create-pr` | Buat Pull Request setelah terjemahan |
| `--token` | GitHub Token; atau variabel `GITHUB_TOKEN` |
| `--base-branch` | Cabang dasar PR, mis. `master` / `main` |

File konfigurasi opsional `.blog-global.yml` di akar blog (**jangan simpan API Key di sini**):

```yaml
provider: siliconflow
model: deepseek-ai/DeepSeek-V3
base_lang: zh-CN
target_langs:
  - en
site_url: https://example.com
```

### 4. Hasil

| Jalur | Deskripsi |
| ---- | ---- |
| `_posts/xxx.md` | Asli dengan tautan bahasa disisipkan |
| `en/xxx.md` | Page bahasa Inggris |
| `.blog-global/state.json` | Status inkremental untuk menjalankan berikutnya |

Contoh tautan bahasa:

```markdown
> 🌐 [中文](/2026/06/23/DDD/) | [English](/en/2026/06/23/DDD/)
```

Setelah PR digabung, beranda tetap hanya menampilkan asli; buka terjemahan lewat tautan di dalam artikel.

## Bahasa yang didukung

`zh-CN` `zh-TW` `en` `ja` `ko` `es` `fr` `de` `ru` `pt` `ar` `hi` `it` `nl` `pl` `tr` `vi` `th` `id` `ms`
