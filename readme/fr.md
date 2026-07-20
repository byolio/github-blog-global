# blog-global

[中文](zh-CN.md) | [繁體中文](zh-TW.md) | [English](en.md) | [日本語](ja.md) | [한국어](ko.md) | [Español](es.md) | **Français** | [Deutsch](de.md) | [Русский](ru.md) | [Português](pt.md) | [العربية](ar.md) | [हिन्दी](hi.md) | [Italiano](it.md) | [Nederlands](nl.md) | [Polski](pl.md) | [Türkçe](tr.md) | [Tiếng Việt](vi.md) | [ไทย](th.md) | [Bahasa Indonesia](id.md) | [Bahasa Melayu](ms.md)

Traduisez un blog GitHub Pages en plusieurs langues grâce à l’IA.

Pour l’instant, CLI uniquement : traduction incrémentale, liens de changement de langue, PR automatique optionnelle.

Framework pleinement pris en charge : **Jekyll**.

## Remarques (structure requise)

Exécutez à la **racine du dépôt du blog**. La structure suivante est obligatoire, sinon le scan, l’injection de liens ou la PR échoueront :

```text
your-blog/                 ← exécutez node cli.js ici
├── _config.yml            ← obligatoire
├── _posts/                ← obligatoire ; placez ici les articles de la langue de base
│   └── 2026-06-23-hello.md
├── .git/                  ← doit être un dépôt Git
└── (le remote doit être GitHub)
```

| Condition | Exigence |
| ---- | ---- |
| Framework | Jekyll : `_config.yml` et `_posts/` doivent exister |
| Format | `.md` / `.markdown` sous `_posts/` ; préférer `YYYY-MM-DD-slug.md` (pretty permalink) |
| Répertoire | Racine du blog, pas le dossier de l’outil blog-global |
| PR auto | Remote GitHub configuré ; token avec portée `repo` ; `--base-branch` existe en local |
| Non pris en charge | Hugo ; sites HTML statiques simples ; layouts sans `_posts/` |

Les traductions sont écrites dans `{lang}/` à la racine (ex. `en/xxx.md`), **pas** dans `_posts/`, pour ne pas polluer la page d’accueil ni les tags.

## Prérequis

- Node.js ≥ 18
- Clé API IA (OpenRouter / SiliconFlow / endpoint compatible OpenAI)
- Pour les PR auto : GitHub Token avec portée `repo`

## Utilisation

Exécutez depuis la **racine du dépôt du blog**.

### 1. Obtenir la CLI

Téléchargez `blog-global-cli-*.zip` depuis [Releases](https://github.com/byolio/github-blog-global/releases) et décompressez pour obtenir `cli.js`.

Ou compilez depuis les sources :

```bash
npm install
npm run build
npm run package:cli   # → dist/cli.js
```

### 2. Mode interactif

```bash
node cli.js
# or
node /path/to/blog-global/dist/cli.js
```

Suivez les invites : AI Provider → API Key → modèle → langue source → langues cibles → site URL (optionnel) → branche PR → créer une PR ? → GitHub Token.

### 3. Mode non interactif

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

| Option | Description |
| ---- | ---- |
| `--provider` | `openrouter` / `siliconflow` / `custom` |
| `--api-key` | Clé IA ; ou variable `BLOG_GLOBAL_API_KEY` |
| `--model` | Nom du modèle (SiliconFlow nécessite un préfixe d’organisation) |
| `--base-url` | Requis uniquement si le provider est `custom` |
| `--base-lang` | Langue de base, ex. `zh-CN` |
| `--target-langs` | Langues cibles séparées par des virgules, ex. `en,ja` |
| `--site-url` | Optionnel ; sans valeur, liens relatifs |
| `--create-pr` | Créer une Pull Request après traduction |
| `--token` | GitHub Token ; ou variable `GITHUB_TOKEN` |
| `--base-branch` | Branche de base de la PR, ex. `master` / `main` |

Fichier optionnel `.blog-global.yml` à la racine du blog (**n’y mettez pas la clé API**) :

```yaml
provider: siliconflow
model: deepseek-ai/DeepSeek-V3
base_lang: zh-CN
target_langs:
  - en
site_url: https://example.com
```

### 4. Résultat

| Chemin | Description |
| ---- | ---- |
| `_posts/xxx.md` | Article original avec liens de langue |
| `en/xxx.md` | Page anglaise |
| `.blog-global/state.json` | État incrémental pour la prochaine exécution |

Exemple de lien de langue :

```markdown
> 🌐 [中文](/2026/06/23/DDD/) | [English](/en/2026/06/23/DDD/)
```

Après fusion de la PR, la page d’accueil n’affiche toujours que l’original ; les traductions s’ouvrent via les liens dans l’article.

## Langues prises en charge

`zh-CN` `zh-TW` `en` `ja` `ko` `es` `fr` `de` `ru` `pt` `ar` `hi` `it` `nl` `pl` `tr` `vi` `th` `id` `ms`
