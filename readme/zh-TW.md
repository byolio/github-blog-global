# blog-global

[中文](zh-CN.md) | **繁體中文** | [English](en.md) | [日本語](ja.md) | [한국어](ko.md) | [Español](es.md) | [Français](fr.md) | [Deutsch](de.md) | [Русский](ru.md) | [Português](pt.md) | [العربية](ar.md) | [हिन्दी](hi.md) | [Italiano](it.md) | [Nederlands](nl.md) | [Polski](pl.md) | [Türkçe](tr.md) | [Tiếng Việt](vi.md) | [ไทย](th.md) | [Bahasa Indonesia](id.md) | [Bahasa Melayu](ms.md)

用 AI 把 GitHub Pages 部落格翻譯成多語系。

目前僅支援透過 CLI：增量翻譯、插入語言切換連結、可選自動建立 PR。

目前完整支援 **Jekyll** 框架。

## 注意事項（適用專案結構）

必須在**部落格倉庫根目錄**執行，且倉庫需符合以下結構，否則無法正確掃描文章 / 注入連結 / 提交 PR：

```text
your-blog/                 ← 在這裡執行 node cli.js
├── _config.yml            ← 必須有
├── _posts/                ← 必須有，基準語言原文放這裡
│   └── 2026-06-23-hello.md
├── .git/                  ← 必須是 Git 倉庫
└── （遠端需為 GitHub）
```

| 條件 | 要求 |
| ---- | ---- |
| 框架 | Jekyll：同時存在 `_config.yml` 與 `_posts/` |
| 文章格式 | `_posts/` 下 `.md` / `.markdown`；建議檔名 `YYYY-MM-DD-slug.md`（pretty permalink） |
| 執行目錄 | 部落格倉庫根目錄，不是 blog-global 工具目錄 |
| 自動 PR | 已設定 GitHub remote；提供有 `repo` 權限的 Token；`--base-branch` 本地存在 |
| 不支援 | Hugo；純靜態 HTML 站；文章不在 `_posts/` 的非標準佈局 |

譯文會產生到倉庫根下的 `{lang}/`（如 `en/xxx.md`），**不會**寫入 `_posts/`，避免污染首頁與標籤。

## 環境需求

- Node.js ≥ 18
- AI API Key（OpenRouter / 矽基流動 / 相容 OpenAI 的自訂介面）
- 若需自動建立 PR：GitHub Token（`repo` 權限）

## 使用方式

在**部落格倉庫根目錄**執行。

### 1. 取得 CLI

從 [Releases](https://github.com/byolio/github-blog-global/releases) 下載 `blog-global-cli-*.zip`，解壓得到 `cli.js`。

或自行建置：

```bash
npm install
npm run build
npm run package:cli   # → dist/cli.js
```

### 2. 互動式執行

```bash
node cli.js
# or
node /path/to/blog-global/dist/cli.js
```

依提示選擇：AI Provider → API Key → 模型 → 來源語言 → 目標語言 → site URL（可空）→ PR 分支 → 是否建立 PR → Github Token。

### 3. 非互動執行

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

| 參數 | 說明 |
| ---- | ---- |
| `--provider` | `openrouter` / `siliconflow` / `custom` |
| `--api-key` | AI Key；也可用環境變數 `BLOG_GLOBAL_API_KEY` |
| `--model` | 模型名稱（矽基流動需帶組織前綴） |
| `--base-url` | 僅 `custom` 時需要 |
| `--base-lang` | 基準語言，如 `zh-CN` |
| `--target-langs` | 目標語言，逗號分隔，如 `en,ja` |
| `--site-url` | 可選；不填則語言連結為相對路徑 |
| `--create-pr` | 翻譯後建立 PR |
| `--token` | GitHub Token；也可用 `GITHUB_TOKEN` |
| `--base-branch` | PR 目標分支，如 `master` / `main` |

可選設定檔 `.blog-global.yml`（放在部落格倉庫根目錄，**不要寫 API Key**）：

```yaml
provider: siliconflow
model: deepseek-ai/DeepSeek-V3
base_lang: zh-CN
target_langs:
  - en
site_url: https://example.com
```

### 4. 執行結果

| 路徑 | 說明 |
| ---- | ---- |
| `_posts/xxx.md` | 原文，頂部插入語言連結 |
| `en/xxx.md` | 英文 page |
| `.blog-global/state.json` | 增量狀態，下次只翻有變更的文章 |

語言連結範例：

```markdown
> 🌐 [中文](/2026/06/23/DDD/) | [English](/en/2026/06/23/DDD/)
```

合併 PR 後，首頁仍只顯示原文；透過文內連結進入譯文。

## 支援的語言

`zh-CN` `zh-TW` `en` `ja` `ko` `es` `fr` `de` `ru` `pt` `ar` `hi` `it` `nl` `pl` `tr` `vi` `th` `id` `ms`
