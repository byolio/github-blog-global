# blog-global

[中文](zh-CN.md) | [繁體中文](zh-TW.md) | [English](en.md) | [日本語](ja.md) | [한국어](ko.md) | **Español** | [Français](fr.md) | [Deutsch](de.md) | [Русский](ru.md) | [Português](pt.md) | [العربية](ar.md) | [हिन्दी](hi.md) | [Italiano](it.md) | [Nederlands](nl.md) | [Polski](pl.md) | [Türkçe](tr.md) | [Tiếng Việt](vi.md) | [ไทย](th.md) | [Bahasa Indonesia](id.md) | [Bahasa Melayu](ms.md)

Traduce blogs de GitHub Pages a varios idiomas con IA.

Por ahora solo CLI: traducción incremental, enlaces de cambio de idioma y creación opcional de PR.

Framework totalmente compatible: **Jekyll**.

## Notas (estructura del proyecto)

Ejecuta en la **raíz del repositorio del blog**. Debe coincidir con esta estructura; si no, el escaneo, los enlaces o el PR fallarán:

```text
your-blog/                 ← ejecuta node cli.js aquí
├── _config.yml            ← obligatorio
├── _posts/                ← obligatorio; coloca aquí los posts del idioma base
│   └── 2026-06-23-hello.md
├── .git/                  ← debe ser un repositorio Git
└── (el remoto debe ser GitHub)
```

| Condición | Requisito |
| ---- | ---- |
| Framework | Jekyll: deben existir `_config.yml` y `_posts/` |
| Formato | `.md` / `.markdown` en `_posts/`; preferible `YYYY-MM-DD-slug.md` (pretty permalink) |
| Directorio | Raíz del blog, no el directorio de la herramienta blog-global |
| PR automático | Remoto de GitHub configurado; token con alcance `repo`; `--base-branch` existe en local |
| No compatible | Hugo; sitios HTML estáticos simples; diseños sin `_posts/` |

Las traducciones se escriben en `{lang}/` en la raíz (p. ej. `en/xxx.md`), **no** en `_posts/`, para no contaminar la portada ni las etiquetas.

## Requisitos

- Node.js ≥ 18
- API Key de IA (OpenRouter / SiliconFlow / endpoint compatible con OpenAI)
- Para PR automático: GitHub Token con alcance `repo`

## Uso

Ejecuta desde la **raíz del repositorio del blog**.

### 1. Obtener la CLI

Descarga `blog-global-cli-*.zip` desde [Releases](https://github.com/byolio/github-blog-global/releases) y descomprime para obtener `cli.js`.

O compila desde el código fuente:

```bash
npm install
npm run build
npm run package:cli   # → dist/cli.js
```

### 2. Modo interactivo

```bash
node cli.js
# or
node /path/to/blog-global/dist/cli.js
```

Sigue las indicaciones: AI Provider → API Key → modelo → idioma origen → idiomas destino → site URL (opcional) → rama del PR → ¿crear PR? → GitHub Token.

### 3. Modo no interactivo

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

| Opción | Descripción |
| ---- | ---- |
| `--provider` | `openrouter` / `siliconflow` / `custom` |
| `--api-key` | Clave de IA; o variable `BLOG_GLOBAL_API_KEY` |
| `--model` | Nombre del modelo (SiliconFlow requiere prefijo de organización) |
| `--base-url` | Solo necesario si el provider es `custom` |
| `--base-lang` | Idioma base, p. ej. `zh-CN` |
| `--target-langs` | Idiomas destino separados por comas, p. ej. `en,ja` |
| `--site-url` | Opcional; si se omite, los enlaces son relativos |
| `--create-pr` | Crear un Pull Request tras traducir |
| `--token` | GitHub Token; o variable `GITHUB_TOKEN` |
| `--base-branch` | Rama base del PR, p. ej. `master` / `main` |

Archivo opcional `.blog-global.yml` en la raíz del blog (**no guardes la API Key aquí**):

```yaml
provider: siliconflow
model: deepseek-ai/DeepSeek-V3
base_lang: zh-CN
target_langs:
  - en
site_url: https://example.com
```

### 4. Resultado

| Ruta | Descripción |
| ---- | ---- |
| `_posts/xxx.md` | Original con enlaces de idioma insertados |
| `en/xxx.md` | Página en inglés |
| `.blog-global/state.json` | Estado incremental para la siguiente ejecución |

Ejemplo de enlace de idioma:

```markdown
> 🌐 [中文](/2026/06/23/DDD/) | [English](/en/2026/06/23/DDD/)
```

Tras fusionar el PR, la portada sigue mostrando solo el original; las traducciones se abren con los enlaces del artículo.

## Idiomas admitidos

`zh-CN` `zh-TW` `en` `ja` `ko` `es` `fr` `de` `ru` `pt` `ar` `hi` `it` `nl` `pl` `tr` `vi` `th` `id` `ms`
