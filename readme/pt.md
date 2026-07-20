# blog-global

[中文](zh-CN.md) | [繁體中文](zh-TW.md) | [English](en.md) | [日本語](ja.md) | [한국어](ko.md) | [Español](es.md) | [Français](fr.md) | [Deutsch](de.md) | [Русский](ru.md) | **Português** | [العربية](ar.md) | [हिन्दी](hi.md) | [Italiano](it.md) | [Nederlands](nl.md) | [Polski](pl.md) | [Türkçe](tr.md) | [Tiếng Việt](vi.md) | [ไทย](th.md) | [Bahasa Indonesia](id.md) | [Bahasa Melayu](ms.md)

Traduza blogs do GitHub Pages para vários idiomas com IA.

Por enquanto só CLI: tradução incremental, links de troca de idioma e criação opcional de PR.

Framework totalmente suportado: **Jekyll**.

## Avisos (estrutura do projeto)

Execute na **raiz do repositório do blog**. Sem esta estrutura, a varredura, a injeção de links ou o PR falharão:

```text
your-blog/                 ← execute node cli.js aqui
├── _config.yml            ← obrigatório
├── _posts/                ← obrigatório; coloque aqui os posts do idioma base
│   └── 2026-06-23-hello.md
├── .git/                  ← deve ser um repositório Git
└── (o remoto deve ser o GitHub)
```

| Condição | Requisito |
| ---- | ---- |
| Framework | Jekyll: `_config.yml` e `_posts/` devem existir |
| Formato | `.md` / `.markdown` em `_posts/`; preferir `YYYY-MM-DD-slug.md` (pretty permalink) |
| Diretório | Raiz do blog, não o diretório da ferramenta blog-global |
| PR automático | Remote do GitHub configurado; token com escopo `repo`; `--base-branch` existe localmente |
| Não suportado | Hugo; sites HTML estáticos simples; layouts sem `_posts/` |

As traduções vão para `{lang}/` na raiz (ex.: `en/xxx.md`), **não** para `_posts/`, evitando poluir a home e as tags.

## Requisitos

- Node.js ≥ 18
- API Key de IA (OpenRouter / SiliconFlow / endpoint compatível com OpenAI)
- Para PR automático: GitHub Token com escopo `repo`

## Uso

Execute a partir da **raiz do repositório do blog**.

### 1. Obter a CLI

Baixe `blog-global-cli-*.zip` em [Releases](https://github.com/byolio/github-blog-global/releases) e descompacte para obter `cli.js`.

Ou compile a partir do código-fonte:

```bash
npm install
npm run build
npm run package:cli   # → dist/cli.js
```

### 2. Modo interativo

```bash
node cli.js
# or
node /path/to/blog-global/dist/cli.js
```

Siga as perguntas: AI Provider → API Key → modelo → idioma de origem → idiomas de destino → site URL (opcional) → branch do PR → criar PR? → GitHub Token.

### 3. Modo não interativo

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

| Opção | Descrição |
| ---- | ---- |
| `--provider` | `openrouter` / `siliconflow` / `custom` |
| `--api-key` | Chave de IA; ou variável `BLOG_GLOBAL_API_KEY` |
| `--model` | Nome do modelo (SiliconFlow exige prefixo da organização) |
| `--base-url` | Necessário apenas se o provider for `custom` |
| `--base-lang` | Idioma base, ex.: `zh-CN` |
| `--target-langs` | Idiomas de destino separados por vírgula, ex.: `en,ja` |
| `--site-url` | Opcional; se omitido, links relativos |
| `--create-pr` | Criar um Pull Request após a tradução |
| `--token` | GitHub Token; ou variável `GITHUB_TOKEN` |
| `--base-branch` | Branch base do PR, ex.: `master` / `main` |

Arquivo opcional `.blog-global.yml` na raiz do blog (**não guarde a API Key aqui**):

```yaml
provider: siliconflow
model: deepseek-ai/DeepSeek-V3
base_lang: zh-CN
target_langs:
  - en
site_url: https://example.com
```

### 4. Resultado

| Caminho | Descrição |
| ---- | ---- |
| `_posts/xxx.md` | Original com links de idioma inseridos |
| `en/xxx.md` | Página em inglês |
| `.blog-global/state.json` | Estado incremental para a próxima execução |

Exemplo de link de idioma:

```markdown
> 🌐 [中文](/2026/06/23/DDD/) | [English](/en/2026/06/23/DDD/)
```

Após mesclar o PR, a home continua mostrando só o original; as traduções abrem pelos links do artigo.

## Idiomas suportados

`zh-CN` `zh-TW` `en` `ja` `ko` `es` `fr` `de` `ru` `pt` `ar` `hi` `it` `nl` `pl` `tr` `vi` `th` `id` `ms`
