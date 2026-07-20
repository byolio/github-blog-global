# blog-global

**中文** | [繁體中文](zh-TW.md) | [English](en.md) | [日本語](ja.md) | [한국어](ko.md) | [Español](es.md) | [Français](fr.md) | [Deutsch](de.md) | [Русский](ru.md) | [Português](pt.md) | [العربية](ar.md) | [हिन्दी](hi.md) | [Italiano](it.md) | [Nederlands](nl.md) | [Polski](pl.md) | [Türkçe](tr.md) | [Tiếng Việt](vi.md) | [ไทย](th.md) | [Bahasa Indonesia](id.md) | [Bahasa Melayu](ms.md)

用 AI 把 GitHub Pages 博客翻译成多语言。

目前仅支持通过 CLI 完成：增量翻译、注入语言切换链接、可选自动创建 PR。

当前仅完整支持 **Jekyll** 框架。

## 注意事项（适用项目结构）

必须在**博客仓库根目录**运行，且仓库需满足以下结构，否则无法正确扫描文章 / 注入链接 / 提交 PR：

```text
your-blog/                 ← 在这里执行 node cli.js
├── _config.yml            ← 必须有
├── _posts/                ← 必须有，基准语言原文放这里
│   └── 2026-06-23-hello.md
├── .git/                  ← 必须是 Git 仓库
└── （远端需为 GitHub）
```

| 条件 | 要求 |
| ---- | ---- |
| 框架 | Jekyll：同时存在 `_config.yml` 与 `_posts/` |
| 文章格式 | `_posts/` 下 `.md` / `.markdown`；建议文件名 `YYYY-MM-DD-slug.md`（pretty permalink） |
| 运行目录 | 博客仓库根目录，不是 blog-global 工具目录 |
| 自动 PR | 已配置 GitHub remote；提供有 `repo` 权限的 Token；`--base-branch` 本地存在 |
| 不支持 | Hugo；纯静态 HTML 站；文章不在 `_posts/` 的非标准布局 |

译文会生成到仓库根下的 `{lang}/`（如 `en/xxx.md`），**不会**写入 `_posts/`，避免污染主页与标签。

## 环境要求

- Node.js ≥ 18
- AI API Key（OpenRouter / 硅基流动 / 兼容 OpenAI 的自定义接口）
- 若需自动建 PR：GitHub Token（`repo` 权限）

## 使用方式

在**博客仓库根目录**执行。

### 1. 获取 CLI

从 [Releases](https://github.com/byolio/github-blog-global/releases) 下载 `blog-global-cli-*.zip`，解压得到 `cli.js`。

或自行构建：

```bash
npm install
npm run build
npm run package:cli   # → dist/cli.js
```

### 2. 交互式运行

```bash
node cli.js
# or
node /path/to/blog-global/dist/cli.js
```

按提示选择：AI Provider → API Key → 模型 → 源语言 → 目标语言 → site URL（可空）→ PR 分支 → 是否建 PR → Github Token。

### 3. 非交互运行

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

| 参数 | 说明 |
| ---- | ---- |
| `--provider` | `openrouter` / `siliconflow` / `custom` |
| `--api-key` | AI Key；也可用环境变量 `BLOG_GLOBAL_API_KEY` |
| `--model` | 模型名（硅基流动需带组织前缀） |
| `--base-url` | 仅 `custom` 时需要 |
| `--base-lang` | 基准语言，如 `zh-CN` |
| `--target-langs` | 目标语言，逗号分隔，如 `en,ja` |
| `--site-url` | 可选；不填则语言链接为相对路径 |
| `--create-pr` | 翻译后创建 PR |
| `--token` | GitHub Token；也可用 `GITHUB_TOKEN` |
| `--base-branch` | PR 目标分支，如 `master` / `main` |

可选配置文件 `.blog-global.yml`（放在博客仓库根目录，**不要写 API Key**）：

```yaml
provider: siliconflow
model: deepseek-ai/DeepSeek-V3
base_lang: zh-CN
target_langs:
  - en
site_url: https://example.com
```

### 4. 运行结果

| 路径 | 说明 |
| ---- | ---- |
| `_posts/xxx.md` | 原文，顶部插入语言链接 |
| `en/xxx.md` | 英文 page |
| `.blog-global/state.json` | 增量状态，下次只翻有变更的文章 |

语言链接示例：

```markdown
> 🌐 [中文](/2026/06/23/DDD/) | [English](/en/2026/06/23/DDD/)
```

合并 PR 后，主页仍只显示原文；通过文内链接进入译文。

## 支持的语言

`zh-CN` `zh-TW` `en` `ja` `ko` `es` `fr` `de` `ru` `pt` `ar` `hi` `it` `nl` `pl` `tr` `vi` `th` `id` `ms`
