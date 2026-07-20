# blog-global

[中文](zh-CN.md) | [繁體中文](zh-TW.md) | [English](en.md) | [日本語](ja.md) | [한국어](ko.md) | [Español](es.md) | [Français](fr.md) | [Deutsch](de.md) | [Русский](ru.md) | [Português](pt.md) | [العربية](ar.md) | [हिन्दी](hi.md) | [Italiano](it.md) | [Nederlands](nl.md) | **Polski** | [Türkçe](tr.md) | [Tiếng Việt](vi.md) | [ไทย](th.md) | [Bahasa Indonesia](id.md) | [Bahasa Melayu](ms.md)

Tłumacz blogi GitHub Pages na wiele języków za pomocą AI.

Na razie tylko CLI: tłumaczenie przyrostowe, linki zmiany języka i opcjonalne automatyczne PR.

W pełni wspierany framework: **Jekyll**.

## Uwagi (wymagana struktura projektu)

Uruchamiaj w **katalogu głównym repozytorium bloga**. Bez tej struktury skanowanie, wstawianie linków lub tworzenie PR się nie powiedzie:

```text
your-blog/                 ← tutaj uruchom node cli.js
├── _config.yml            ← wymagane
├── _posts/                ← wymagane; tu umieść posty języka bazowego
│   └── 2026-06-23-hello.md
├── .git/                  ← musi być repozytorium Git
└── (zdalne repozytorium musi być na GitHub)
```

| Warunek | Wymaganie |
| ---- | ---- |
| Framework | Jekyll: muszą istnieć `_config.yml` i `_posts/` |
| Format | `.md` / `.markdown` w `_posts/`; preferowane `YYYY-MM-DD-slug.md` (pretty permalink) |
| Katalog | Root bloga, nie katalog narzędzia blog-global |
| Auto-PR | Skonfigurowany remote GitHub; token z zakresem `repo`; `--base-branch` istnieje lokalnie |
| Nieobsługiwane | Hugo; proste statyczne HTML; layouty bez `_posts/` |

Tłumaczenia trafiają do `{lang}/` w rootcie (np. `en/xxx.md`), **nie** do `_posts/`, by nie zaśmiecać strony głównej i tagów.

## Wymagania

- Node.js ≥ 18
- Klucz API AI (OpenRouter / SiliconFlow / endpoint zgodny z OpenAI)
- Do auto-PR: GitHub Token z zakresem `repo`

## Użycie

Uruchamiaj z **katalogu głównego repozytorium bloga**.

### 1. Pobierz CLI

Pobierz `blog-global-cli-*.zip` z [Releases](https://github.com/byolio/github-blog-global/releases) i rozpakuj, aby uzyskać `cli.js`.

Lub zbuduj ze źródeł:

```bash
npm install
npm run build
npm run package:cli   # → dist/cli.js
```

### 2. Tryb interaktywny

```bash
node cli.js
# or
node /path/to/blog-global/dist/cli.js
```

Postępuj według podpowiedzi: AI Provider → API Key → model → język źródłowy → języki docelowe → site URL (opcjonalnie) → gałąź PR → utworzyć PR? → GitHub Token.

### 3. Tryb nieinteraktywny

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

| Flaga | Opis |
| ---- | ---- |
| `--provider` | `openrouter` / `siliconflow` / `custom` |
| `--api-key` | Klucz AI; lub zmienna `BLOG_GLOBAL_API_KEY` |
| `--model` | Nazwa modelu (SiliconFlow wymaga prefiksu organizacji) |
| `--base-url` | Wymagane tylko przy `custom` |
| `--base-lang` | Język bazowy, np. `zh-CN` |
| `--target-langs` | Języki docelowe, po przecinku, np. `en,ja` |
| `--site-url` | Opcjonalne; bez wartości — względne linki językowe |
| `--create-pr` | Utwórz Pull Request po tłumaczeniu |
| `--token` | GitHub Token; lub zmienna `GITHUB_TOKEN` |
| `--base-branch` | Gałąź bazowa PR, np. `master` / `main` |

Opcjonalny plik `.blog-global.yml` w rootcie bloga (**nie zapisuj tu klucza API**):

```yaml
provider: siliconflow
model: deepseek-ai/DeepSeek-V3
base_lang: zh-CN
target_langs:
  - en
site_url: https://example.com
```

### 4. Wynik

| Ścieżka | Opis |
| ---- | ---- |
| `_posts/xxx.md` | Oryginał z wstawionymi linkami językowymi |
| `en/xxx.md` | Angielska page |
| `.blog-global/state.json` | Stan przyrostowy na kolejny przebieg |

Przykład linku językowego:

```markdown
> 🌐 [中文](/2026/06/23/DDD/) | [English](/en/2026/06/23/DDD/)
```

Po scaleniu PR strona główna nadal pokazuje tylko oryginały; tłumaczenia otwierasz linkami w artykule.

## Obsługiwane języki

`zh-CN` `zh-TW` `en` `ja` `ko` `es` `fr` `de` `ru` `pt` `ar` `hi` `it` `nl` `pl` `tr` `vi` `th` `id` `ms`
