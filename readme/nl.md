# blog-global

[中文](zh-CN.md) | [繁體中文](zh-TW.md) | [English](en.md) | [日本語](ja.md) | [한국어](ko.md) | [Español](es.md) | [Français](fr.md) | [Deutsch](de.md) | [Русский](ru.md) | [Português](pt.md) | [العربية](ar.md) | [हिन्दी](hi.md) | [Italiano](it.md) | **Nederlands** | [Polski](pl.md) | [Türkçe](tr.md) | [Tiếng Việt](vi.md) | [ไทย](th.md) | [Bahasa Indonesia](id.md) | [Bahasa Melayu](ms.md)

Vertaal GitHub Pages-blogs naar meerdere talen met AI.

Voorlopig alleen CLI: incrementele vertaling, taalschakellinks en optionele automatische PR.

Volledig ondersteund framework: **Jekyll**.

## Let op (vereiste projectstructuur)

Voer uit in de **root van de blogrepository**. Zonder deze structuur mislukken scannen, link-injectie of PR-aanmaak:

```text
your-blog/                 ← voer hier node cli.js uit
├── _config.yml            ← verplicht
├── _posts/                ← verplicht; plaats hier posts in de basistaal
│   └── 2026-06-23-hello.md
├── .git/                  ← moet een Git-repository zijn
└── (remote moet GitHub zijn)
```

| Voorwaarde | Eis |
| ---- | ---- |
| Framework | Jekyll: zowel `_config.yml` als `_posts/` aanwezig |
| Postformaat | `.md` / `.markdown` onder `_posts/`; bij voorkeur `YYYY-MM-DD-slug.md` (pretty permalink) |
| Werkmap | Root van de blog, niet de map van de blog-global-tool |
| Auto-PR | GitHub-remote geconfigureerd; token met `repo`-scope; `--base-branch` lokaal aanwezig |
| Niet ondersteund | Hugo; plain statische HTML-sites; layouts zonder `_posts/` |

Vertalingen worden geschreven naar `{lang}/` in de root (bijv. `en/xxx.md`), **niet** naar `_posts/`, zodat homepage en tags schoon blijven.

## Vereisten

- Node.js ≥ 18
- AI API-sleutel (OpenRouter / SiliconFlow / OpenAI-compatibel custom endpoint)
- Voor auto-PR: GitHub Token met `repo`-scope

## Gebruik

Voer uit vanuit de **root van de blogrepository**.

### 1. CLI ophalen

Download `blog-global-cli-*.zip` van [Releases](https://github.com/byolio/github-blog-global/releases) en pak uit om `cli.js` te krijgen.

Of bouw vanuit de broncode:

```bash
npm install
npm run build
npm run package:cli   # → dist/cli.js
```

### 2. Interactieve modus

```bash
node cli.js
# or
node /path/to/blog-global/dist/cli.js
```

Volg de prompts: AI Provider → API Key → model → brontaal → doeltalen → site URL (optioneel) → PR-branch → PR maken? → GitHub Token.

### 3. Niet-interactieve modus

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

| Optie | Beschrijving |
| ---- | ---- |
| `--provider` | `openrouter` / `siliconflow` / `custom` |
| `--api-key` | AI-sleutel; of env `BLOG_GLOBAL_API_KEY` |
| `--model` | Modelnaam (SiliconFlow vereist organisatiëprefix) |
| `--base-url` | Alleen nodig bij provider `custom` |
| `--base-lang` | Basistaal, bijv. `zh-CN` |
| `--target-langs` | Doeltalen, kommagescheiden, bijv. `en,ja` |
| `--site-url` | Optioneel; zonder waarde relatieve taallinks |
| `--create-pr` | Maak na vertaling een Pull Request |
| `--token` | GitHub Token; of env `GITHUB_TOKEN` |
| `--base-branch` | PR-basisbranch, bijv. `master` / `main` |

Optioneel configuratiebestand `.blog-global.yml` in de blogroot (**sla hier geen API-sleutel op**):

```yaml
provider: siliconflow
model: deepseek-ai/DeepSeek-V3
base_lang: zh-CN
target_langs:
  - en
site_url: https://example.com
```

### 4. Resultaat

| Pad | Beschrijving |
| ---- | ---- |
| `_posts/xxx.md` | Origineel met ingevoegde taallinks |
| `en/xxx.md` | Engelse page |
| `.blog-global/state.json` | Incrementele status voor de volgende run |

Voorbeeld van een taallink:

```markdown
> 🌐 [中文](/2026/06/23/DDD/) | [English](/en/2026/06/23/DDD/)
```

Na het mergen van de PR toont de homepage nog steeds alleen originelen; open vertalingen via de links in het artikel.

## Ondersteunde talen

`zh-CN` `zh-TW` `en` `ja` `ko` `es` `fr` `de` `ru` `pt` `ar` `hi` `it` `nl` `pl` `tr` `vi` `th` `id` `ms`
