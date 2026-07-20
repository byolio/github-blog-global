# blog-global

[中文](zh-CN.md) | [繁體中文](zh-TW.md) | [English](en.md) | **日本語** | [한국어](ko.md) | [Español](es.md) | [Français](fr.md) | [Deutsch](de.md) | [Русский](ru.md) | [Português](pt.md) | [العربية](ar.md) | [हिन्दी](hi.md) | [Italiano](it.md) | [Nederlands](nl.md) | [Polski](pl.md) | [Türkçe](tr.md) | [Tiếng Việt](vi.md) | [ไทย](th.md) | [Bahasa Indonesia](id.md) | [Bahasa Melayu](ms.md)

AI で GitHub Pages ブログを多言語に翻訳します。

現時点では CLI のみ対応：差分翻訳、言語切替リンクの挿入、任意で PR 自動作成。

完全対応フレームワーク：**Jekyll**。

## 注意事項（必要なプロジェクト構成）

**ブログリポジトリのルート**で実行してください。次の構成でないと、記事スキャン / リンク挿入 / PR 作成が正しく動きません：

```text
your-blog/                 ← ここで node cli.js を実行
├── _config.yml            ← 必須
├── _posts/                ← 必須。基準言語の記事を置く
│   └── 2026-06-23-hello.md
├── .git/                  ← Git リポジトリであること
└── （リモートは GitHub であること）
```

| 条件 | 要件 |
| ---- | ---- |
| フレームワーク | Jekyll：`_config.yml` と `_posts/` の両方が必要 |
| 記事形式 | `_posts/` 内の `.md` / `.markdown`。推奨ファイル名 `YYYY-MM-DD-slug.md`（pretty permalink） |
| 実行ディレクトリ | ブログリポジトリのルート（blog-global 本体のディレクトリではない） |
| 自動 PR | GitHub remote 設定済み；`repo` 権限の Token；`--base-branch` がローカルに存在 |
| 非対応 | Hugo；素の静的 HTML サイト；`_posts/` がない非標準構成 |

翻訳はリポジトリ直下の `{lang}/`（例：`en/xxx.md`）に出力されます。**`_posts/` には書きません**（トップページやタグ汚染を防ぐため）。

## 動作環境

- Node.js ≥ 18
- AI API Key（OpenRouter / SiliconFlow / OpenAI 互換のカスタムエンドポイント）
- 自動 PR 用：`repo` 権限の GitHub Token

## 使い方

**ブログリポジトリのルート**で実行します。

### 1. CLI の入手

[Releases](https://github.com/byolio/github-blog-global/releases) から `blog-global-cli-*.zip` をダウンロードし、解凍して `cli.js` を取得します。

またはソースからビルド：

```bash
npm install
npm run build
npm run package:cli   # → dist/cli.js
```

### 2. 対話モード

```bash
node cli.js
# or
node /path/to/blog-global/dist/cli.js
```

画面の指示に従います：AI Provider → API Key → モデル → ソース言語 → 対象言語 → site URL（任意）→ PR ブランチ → PR 作成の可否 → GitHub Token。

### 3. 非対話モード

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

| 引数 | 説明 |
| ---- | ---- |
| `--provider` | `openrouter` / `siliconflow` / `custom` |
| `--api-key` | AI Key。環境変数 `BLOG_GLOBAL_API_KEY` でも可 |
| `--model` | モデル名（SiliconFlow は組織プレフィックス付き） |
| `--base-url` | `custom` のときのみ必須 |
| `--base-lang` | 基準言語。例：`zh-CN` |
| `--target-langs` | 対象言語。カンマ区切り。例：`en,ja` |
| `--site-url` | 任意。省略時は相対パスの言語リンク |
| `--create-pr` | 翻訳後に PR を作成 |
| `--token` | GitHub Token。環境変数 `GITHUB_TOKEN` でも可 |
| `--base-branch` | PR のベースブランチ。例：`master` / `main` |

任意の設定ファイル `.blog-global.yml`（ブログルートに配置。**API Key は書かない**）：

```yaml
provider: siliconflow
model: deepseek-ai/DeepSeek-V3
base_lang: zh-CN
target_langs:
  - en
site_url: https://example.com
```

### 4. 実行結果

| パス | 説明 |
| ---- | ---- |
| `_posts/xxx.md` | 原文。先頭に言語切替リンクを挿入 |
| `en/xxx.md` | 英語 page |
| `.blog-global/state.json` | 差分状態。次回は変更分だけ翻訳 |

言語リンクの例：

```markdown
> 🌐 [中文](/2026/06/23/DDD/) | [English](/en/2026/06/23/DDD/)
```

PR をマージ後もトップには原文のみ表示され、ページ内リンクから翻訳へ移動します。

## 対応言語

`zh-CN` `zh-TW` `en` `ja` `ko` `es` `fr` `de` `ru` `pt` `ar` `hi` `it` `nl` `pl` `tr` `vi` `th` `id` `ms`
