# blog-global

[中文](zh-CN.md) | [繁體中文](zh-TW.md) | [English](en.md) | [日本語](ja.md) | [한국어](ko.md) | [Español](es.md) | [Français](fr.md) | [Deutsch](de.md) | [Русский](ru.md) | [Português](pt.md) | [العربية](ar.md) | [हिन्दी](hi.md) | **Italiano** | [Nederlands](nl.md) | [Polski](pl.md) | [Türkçe](tr.md) | [Tiếng Việt](vi.md) | [ไทย](th.md) | [Bahasa Indonesia](id.md) | [Bahasa Melayu](ms.md)

Traduci i blog GitHub Pages in più lingue con l’IA.

Per ora solo CLI: traduzione incrementale, link di cambio lingua e creazione PR opzionale.

Framework completamente supportato: **Jekyll**.

## Note (struttura del progetto)

Esegui nella **radice del repository del blog**. Senza questa struttura scansione, link o PR non funzionano correttamente:

```text
your-blog/                 ← esegui node cli.js qui
├── _config.yml            ← obbligatorio
├── _posts/                ← obbligatorio; metti qui i post della lingua base
│   └── 2026-06-23-hello.md
├── .git/                  ← deve essere un repository Git
└── (il remote deve essere GitHub)
```

| Condizione | Requisito |
| ---- | ---- |
| Framework | Jekyll: devono esistere `_config.yml` e `_posts/` |
| Formato | `.md` / `.markdown` in `_posts/`; preferibile `YYYY-MM-DD-slug.md` (pretty permalink) |
| Directory | Radice del blog, non la cartella dello strumento blog-global |
| PR automatica | Remote GitHub configurato; token con scope `repo`; `--base-branch` esiste in locale |
| Non supportato | Hugo; siti HTML statici semplici; layout senza `_posts/` |

Le traduzioni vengono scritte in `{lang}/` nella root (es. `en/xxx.md`), **non** in `_posts/`, per non inquinare home e tag.

## Requisiti

- Node.js ≥ 18
- API Key IA (OpenRouter / SiliconFlow / endpoint compatibile OpenAI)
- Per PR automatiche: GitHub Token con scope `repo`

## Utilizzo

Esegui dalla **radice del repository del blog**.

### 1. Ottenere la CLI

Scarica `blog-global-cli-*.zip` da [Releases](https://github.com/byolio/github-blog-global/releases) e decomprimi per ottenere `cli.js`.

Oppure compila dal codice sorgente:

```bash
npm install
npm run build
npm run package:cli   # → dist/cli.js
```

### 2. Modalità interattiva

```bash
node cli.js
# or
node /path/to/blog-global/dist/cli.js
```

Segui i prompt: AI Provider → API Key → modello → lingua sorgente → lingue di destinazione → site URL (opzionale) → branch PR → creare PR? → GitHub Token.

### 3. Modalità non interattiva

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

| Opzione | Descrizione |
| ---- | ---- |
| `--provider` | `openrouter` / `siliconflow` / `custom` |
| `--api-key` | Chiave IA; oppure variabile `BLOG_GLOBAL_API_KEY` |
| `--model` | Nome modello (SiliconFlow richiede prefisso organizzazione) |
| `--base-url` | Necessario solo se il provider è `custom` |
| `--base-lang` | Lingua base, es. `zh-CN` |
| `--target-langs` | Lingue di destinazione separate da virgola, es. `en,ja` |
| `--site-url` | Opzionale; se omesso, link relativi |
| `--create-pr` | Crea una Pull Request dopo la traduzione |
| `--token` | GitHub Token; oppure variabile `GITHUB_TOKEN` |
| `--base-branch` | Branch base della PR, es. `master` / `main` |

File opzionale `.blog-global.yml` nella root del blog (**non salvare l’API Key qui**):

```yaml
provider: siliconflow
model: deepseek-ai/DeepSeek-V3
base_lang: zh-CN
target_langs:
  - en
site_url: https://example.com
```

### 4. Risultato

| Percorso | Descrizione |
| ---- | ---- |
| `_posts/xxx.md` | Originale con link di lingua inseriti |
| `en/xxx.md` | Page in inglese |
| `.blog-global/state.json` | Stato incrementale per la prossima esecuzione |

Esempio di link lingua:

```markdown
> 🌐 [中文](/2026/06/23/DDD/) | [English](/en/2026/06/23/DDD/)
```

Dopo il merge della PR la home mostra ancora solo l’originale; le traduzioni si aprono dai link nell’articolo.

## Lingue supportate

`zh-CN` `zh-TW` `en` `ja` `ko` `es` `fr` `de` `ru` `pt` `ar` `hi` `it` `nl` `pl` `tr` `vi` `th` `id` `ms`
