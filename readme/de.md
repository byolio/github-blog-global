# blog-global

[中文](zh-CN.md) | [繁體中文](zh-TW.md) | [English](en.md) | [日本語](ja.md) | [한국어](ko.md) | [Español](es.md) | [Français](fr.md) | **Deutsch** | [Русский](ru.md) | [Português](pt.md) | [العربية](ar.md) | [हिन्दी](hi.md) | [Italiano](it.md) | [Nederlands](nl.md) | [Polski](pl.md) | [Türkçe](tr.md) | [Tiếng Việt](vi.md) | [ไทย](th.md) | [Bahasa Indonesia](id.md) | [Bahasa Melayu](ms.md)

Übersetzen Sie GitHub-Pages-Blogs mit KI in mehrere Sprachen.

Derzeit nur CLI: inkrementelle Übersetzung, Sprachumschalt-Links, optional automatische PRs.

Voll unterstütztes Framework: **Jekyll**.

## Hinweise (erforderliche Projektstruktur)

Im **Wurzelverzeichnis des Blog-Repositories** ausführen. Ohne diese Struktur schlagen Scan, Link-Einfügung oder PR fehl:

```text
your-blog/                 ← hier `node cli.js` ausführen
├── _config.yml            ← erforderlich
├── _posts/                ← erforderlich; Basis-Sprachbeiträge hier ablegen
│   └── 2026-06-23-hello.md
├── .git/                  ← muss ein Git-Repository sein
└── (Remote muss GitHub sein)
```

| Bedingung | Anforderung |
| ---- | ---- |
| Framework | Jekyll: sowohl `_config.yml` als auch `_posts/` vorhanden |
| Beitragsformat | `.md` / `.markdown` unter `_posts/`; bevorzugt `YYYY-MM-DD-slug.md` (pretty permalink) |
| Arbeitsverzeichnis | Blog-Repo-Wurzel, nicht das blog-global-Toolverzeichnis |
| Auto-PR | GitHub-Remote konfiguriert; Token mit `repo`-Scope; `--base-branch` lokal vorhanden |
| Nicht unterstützt | Hugo; reine statische HTML-Sites; Layouts ohne `_posts/` |

Übersetzungen landen unter `{lang}/` im Repo-Root (z. B. `en/xxx.md`), **nicht** in `_posts/`, damit Startseite und Tags sauber bleiben.

## Voraussetzungen

- Node.js ≥ 18
- KI-API-Key (OpenRouter / SiliconFlow / OpenAI-kompatibler Custom-Endpoint)
- Für Auto-PRs: GitHub-Token mit `repo`-Scope

## Verwendung

Im **Wurzelverzeichnis des Blog-Repositories** ausführen.

### 1. CLI holen

`blog-global-cli-*.zip` von [Releases](https://github.com/byolio/github-blog-global/releases) herunterladen und entpacken, um `cli.js` zu erhalten.

Oder aus dem Quellcode bauen:

```bash
npm install
npm run build
npm run package:cli   # → dist/cli.js
```

### 2. Interaktiver Modus

```bash
node cli.js
# or
node /path/to/blog-global/dist/cli.js
```

Den Eingaben folgen: AI Provider → API Key → Modell → Quellsprache → Zielsprachen → site URL (optional) → PR-Branch → PR erstellen? → GitHub Token.

### 3. Nicht-interaktiver Modus

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

| Option | Beschreibung |
| ---- | ---- |
| `--provider` | `openrouter` / `siliconflow` / `custom` |
| `--api-key` | KI-Key; oder Umgebungsvariable `BLOG_GLOBAL_API_KEY` |
| `--model` | Modellname (SiliconFlow braucht Organisationspräfix) |
| `--base-url` | Nur bei Provider `custom` nötig |
| `--base-lang` | Basissprache, z. B. `zh-CN` |
| `--target-langs` | Zielsprachen, kommagetrennt, z. B. `en,ja` |
| `--site-url` | Optional; ohne Angabe relative Sprachlinks |
| `--create-pr` | Nach der Übersetzung eine Pull Request erstellen |
| `--token` | GitHub-Token; oder Umgebungsvariable `GITHUB_TOKEN` |
| `--base-branch` | PR-Basisbranch, z. B. `master` / `main` |

Optionale Konfiguration `.blog-global.yml` im Blog-Root (**API-Key nicht speichern**):

```yaml
provider: siliconflow
model: deepseek-ai/DeepSeek-V3
base_lang: zh-CN
target_langs:
  - en
site_url: https://example.com
```

### 4. Ergebnis

| Pfad | Beschreibung |
| ---- | ---- |
| `_posts/xxx.md` | Original mit eingefügten Sprachlinks |
| `en/xxx.md` | Englische Page |
| `.blog-global/state.json` | Inkrementeller Zustand für den nächsten Lauf |

Beispiel für Sprachlinks:

```markdown
> 🌐 [中文](/2026/06/23/DDD/) | [English](/en/2026/06/23/DDD/)
```

Nach dem Mergen der PR zeigt die Startseite weiterhin nur Originale; Übersetzungen öffnen sich über die Links im Beitrag.

## Unterstützte Sprachen

`zh-CN` `zh-TW` `en` `ja` `ko` `es` `fr` `de` `ru` `pt` `ar` `hi` `it` `nl` `pl` `tr` `vi` `th` `id` `ms`
