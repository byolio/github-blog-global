# blog-global

[中文](zh-CN.md) | [繁體中文](zh-TW.md) | [English](en.md) | [日本語](ja.md) | [한국어](ko.md) | [Español](es.md) | [Français](fr.md) | [Deutsch](de.md) | **Русский** | [Português](pt.md) | [العربية](ar.md) | [हिन्दी](hi.md) | [Italiano](it.md) | [Nederlands](nl.md) | [Polski](pl.md) | [Türkçe](tr.md) | [Tiếng Việt](vi.md) | [ไทย](th.md) | [Bahasa Indonesia](id.md) | [Bahasa Melayu](ms.md)

Переводите блоги GitHub Pages на несколько языков с помощью ИИ.

Пока только CLI: инкрементальный перевод, ссылки переключения языка, опциональное автосоздание PR.

Полностью поддерживаемый фреймворк: **Jekyll**.

## Важно (нужная структура проекта)

Запускайте в **корне репозитория блога**. Без этой структуры сканирование, вставка ссылок или создание PR не сработают:

```text
your-blog/                 ← здесь запускайте node cli.js
├── _config.yml            ← обязательно
├── _posts/                ← обязательно; сюда кладите посты базового языка
│   └── 2026-06-23-hello.md
├── .git/                  ← должен быть Git-репозиторий
└── (удалённый репозиторий должен быть на GitHub)
```

| Условие | Требование |
| ---- | ---- |
| Фреймворк | Jekyll: нужны и `_config.yml`, и `_posts/` |
| Формат | `.md` / `.markdown` в `_posts/`; лучше `YYYY-MM-DD-slug.md` (pretty permalink) |
| Каталог | Корень блога, не каталог инструмента blog-global |
| Авто-PR | Настроен GitHub remote; токен с правом `repo`; `--base-branch` есть локально |
| Не поддерживается | Hugo; обычные статические HTML-сайты; схемы без `_posts/` |

Переводы пишутся в `{lang}/` в корне (например `en/xxx.md`), **не** в `_posts/`, чтобы не засорять главную и теги.

## Требования

- Node.js ≥ 18
- AI API Key (OpenRouter / SiliconFlow / совместимый с OpenAI endpoint)
- Для авто-PR: GitHub Token с правом `repo`

## Использование

Запускайте из **корня репозитория блога**.

### 1. Получить CLI

Скачайте `blog-global-cli-*.zip` из [Releases](https://github.com/byolio/github-blog-global/releases) и распакуйте — получите `cli.js`.

Или соберите из исходников:

```bash
npm install
npm run build
npm run package:cli   # → dist/cli.js
```

### 2. Интерактивный режим

```bash
node cli.js
# or
node /path/to/blog-global/dist/cli.js
```

Следуйте подсказкам: AI Provider → API Key → модель → исходный язык → целевые языки → site URL (необязательно) → ветка PR → создавать PR? → GitHub Token.

### 3. Неинтерактивный режим

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

| Параметр | Описание |
| ---- | ---- |
| `--provider` | `openrouter` / `siliconflow` / `custom` |
| `--api-key` | AI Key; или переменная `BLOG_GLOBAL_API_KEY` |
| `--model` | Имя модели (для SiliconFlow нужен префикс организации) |
| `--base-url` | Нужен только при `custom` |
| `--base-lang` | Базовый язык, напр. `zh-CN` |
| `--target-langs` | Целевые языки через запятую, напр. `en,ja` |
| `--site-url` | Необязательно; без него — относительные ссылки |
| `--create-pr` | Создать Pull Request после перевода |
| `--token` | GitHub Token; или переменная `GITHUB_TOKEN` |
| `--base-branch` | Базовая ветка PR, напр. `master` / `main` |

Опциональный файл `.blog-global.yml` в корне блога (**не храните API Key здесь**):

```yaml
provider: siliconflow
model: deepseek-ai/DeepSeek-V3
base_lang: zh-CN
target_langs:
  - en
site_url: https://example.com
```

### 4. Результат

| Путь | Описание |
| ---- | ---- |
| `_posts/xxx.md` | Оригинал со вставленными языковыми ссылками |
| `en/xxx.md` | Английская page |
| `.blog-global/state.json` | Инкрементальное состояние для следующего запуска |

Пример языковой ссылки:

```markdown
> 🌐 [中文](/2026/06/23/DDD/) | [English](/en/2026/06/23/DDD/)
```

После слияния PR на главной по-прежнему только оригинал; переводы открываются по ссылкам в статье.

## Поддерживаемые языки

`zh-CN` `zh-TW` `en` `ja` `ko` `es` `fr` `de` `ru` `pt` `ar` `hi` `it` `nl` `pl` `tr` `vi` `th` `id` `ms`
