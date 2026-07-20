# blog-global

[中文](zh-CN.md) | [繁體中文](zh-TW.md) | **English** | [日本語](ja.md) | [한국어](ko.md) | [Español](es.md) | [Français](fr.md) | [Deutsch](de.md) | [Русский](ru.md) | [Português](pt.md) | [العربية](ar.md) | [हिन्दी](hi.md) | [Italiano](it.md) | [Nederlands](nl.md) | [Polski](pl.md) | [Türkçe](tr.md) | [Tiếng Việt](vi.md) | [ไทย](th.md) | [Bahasa Indonesia](id.md) | [Bahasa Melayu](ms.md)

AI-powered multi-language translation for GitHub Pages blogs.

CLI only for now: incremental translation, language switch links, and optional automatic PR creation.

Fully supported framework: **Jekyll**.

## Notes (required project layout)

Run in the **blog repository root**. The repository must match this layout; otherwise scanning, link injection, or PR creation will fail:

```text
your-blog/                 ← run `node cli.js` here
├── _config.yml            ← required
├── _posts/                ← required; place base-language posts here
│   └── 2026-06-23-hello.md
├── .git/                  ← must be a Git repository
└── (remote must be on GitHub)
```

| Condition | Requirement |
| ---- | ---- |
| Framework | Jekyll: both `_config.yml` and `_posts/` must exist |
| Post format | `.md` / `.markdown` under `_posts/`; prefer `YYYY-MM-DD-slug.md` (pretty permalink) |
| Working directory | Blog repository root, not the blog-global tool directory |
| Auto PR | GitHub remote configured; token with `repo` scope; `--base-branch` exists locally |
| Not supported | Hugo; plain static HTML sites; non-standard layouts without `_posts/` |

Translations are written under `{lang}/` at the repo root (e.g. `en/xxx.md`), **not** into `_posts/`, so the homepage and tags stay clean.

## Environment

- Node.js ≥ 18
- AI API Key (OpenRouter / SiliconFlow / OpenAI-compatible custom endpoint)
- For automatic PRs: GitHub Token with `repo` scope

## Usage

Run from the **blog repository root**.

### 1. Get the CLI

Download `blog-global-cli-*.zip` from [Releases](https://github.com/byolio/github-blog-global/releases) and unzip to get `cli.js`.

Or build from source:

```bash
npm install
npm run build
npm run package:cli   # → dist/cli.js
```

### 2. Interactive mode

```bash
node cli.js
# or
node /path/to/blog-global/dist/cli.js
```

Follow the prompts: AI Provider → API Key → model → source language → target languages → site URL (optional) → PR branch → create PR? → GitHub Token.

### 3. Non-interactive mode

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

| Flag | Description |
| ---- | ---- |
| `--provider` | `openrouter` / `siliconflow` / `custom` |
| `--api-key` | AI Key; or environment variable `BLOG_GLOBAL_API_KEY` |
| `--model` | Model name (SiliconFlow requires an organization prefix) |
| `--base-url` | Required only when provider is `custom` |
| `--base-lang` | Base language, e.g. `zh-CN` |
| `--target-langs` | Target languages, comma-separated, e.g. `en,ja` |
| `--site-url` | Optional; omit to use relative language links |
| `--create-pr` | Create a Pull Request after translation |
| `--token` | GitHub Token; or environment variable `GITHUB_TOKEN` |
| `--base-branch` | PR base branch, e.g. `master` / `main` |

Optional config file `.blog-global.yml` in the blog root (**do not store the API Key here**):

```yaml
provider: siliconflow
model: deepseek-ai/DeepSeek-V3
base_lang: zh-CN
target_langs:
  - en
site_url: https://example.com
```

### 4. Output

| Path | Description |
| ---- | ---- |
| `_posts/xxx.md` | Original post with language switch links inserted |
| `en/xxx.md` | English page |
| `.blog-global/state.json` | Incremental state so the next run only translates changes |

Language link example:

```markdown
> 🌐 [中文](/2026/06/23/DDD/) | [English](/en/2026/06/23/DDD/)
```

After merging the PR, the homepage still shows only originals; open translations via the in-page links.

## Supported languages

`zh-CN` `zh-TW` `en` `ja` `ko` `es` `fr` `de` `ru` `pt` `ar` `hi` `it` `nl` `pl` `tr` `vi` `th` `id` `ms`
