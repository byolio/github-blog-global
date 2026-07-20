# blog-global

[中文](zh-CN.md) | [繁體中文](zh-TW.md) | [English](en.md) | [日本語](ja.md) | **한국어** | [Español](es.md) | [Français](fr.md) | [Deutsch](de.md) | [Русский](ru.md) | [Português](pt.md) | [العربية](ar.md) | [हिन्दी](hi.md) | [Italiano](it.md) | [Nederlands](nl.md) | [Polski](pl.md) | [Türkçe](tr.md) | [Tiếng Việt](vi.md) | [ไทย](th.md) | [Bahasa Indonesia](id.md) | [Bahasa Melayu](ms.md)

AI로 GitHub Pages 블로그를 다국어로 번역합니다.

현재는 CLI만 지원합니다: 증분 번역, 언어 전환 링크 삽입, 선택적 자동 PR 생성.

완전히 지원하는 프레임워크: **Jekyll**.

## 주의사항 (필요한 프로젝트 구조)

**블로그 저장소 루트**에서 실행해야 합니다. 아래 구조가 아니면 글 스캔 / 링크 삽입 / PR 생성이 제대로 동작하지 않습니다:

```text
your-blog/                 ← 여기서 node cli.js 실행
├── _config.yml            ← 필수
├── _posts/                ← 필수. 기준 언어 글을 여기에 둡니다
│   └── 2026-06-23-hello.md
├── .git/                  ← Git 저장소여야 함
└── (원격은 GitHub 이어야 함)
```

| 조건 | 요구사항 |
| ---- | ---- |
| 프레임워크 | Jekyll: `_config.yml` 과 `_posts/` 가 모두 있어야 함 |
| 글 형식 | `_posts/` 아래 `.md` / `.markdown`. 권장 파일명 `YYYY-MM-DD-slug.md` (pretty permalink) |
| 실행 디렉터리 | 블로그 저장소 루트 (blog-global 도구 디렉터리 아님) |
| 자동 PR | GitHub remote 설정됨; `repo` 권한 Token; `--base-branch` 가 로컬에 존재 |
| 미지원 | Hugo; 순수 정적 HTML 사이트; `_posts/` 없는 비표준 구조 |

번역본은 저장소 루트의 `{lang}/` (예: `en/xxx.md`) 에 생성되며, **`_posts/` 에는 쓰지 않습니다** (홈·태그 오염 방지).

## 환경 요구사항

- Node.js ≥ 18
- AI API Key (OpenRouter / SiliconFlow / OpenAI 호환 커스텀 엔드포인트)
- 자동 PR: `repo` 권한의 GitHub Token

## 사용 방법

**블로그 저장소 루트**에서 실행합니다.

### 1. CLI 받기

[Releases](https://github.com/byolio/github-blog-global/releases) 에서 `blog-global-cli-*.zip` 을 받아 압축을 풀면 `cli.js` 가 있습니다.

또는 소스에서 빌드:

```bash
npm install
npm run build
npm run package:cli   # → dist/cli.js
```

### 2. 대화형 실행

```bash
node cli.js
# or
node /path/to/blog-global/dist/cli.js
```

안내에 따라 선택: AI Provider → API Key → 모델 → 소스 언어 → 대상 언어 → site URL(선택) → PR 브랜치 → PR 생성 여부 → GitHub Token.

### 3. 비대화형 실행

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

| 옵션 | 설명 |
| ---- | ---- |
| `--provider` | `openrouter` / `siliconflow` / `custom` |
| `--api-key` | AI Key. 환경 변수 `BLOG_GLOBAL_API_KEY` 도 가능 |
| `--model` | 모델 이름 (SiliconFlow 는 조직 접두사 필요) |
| `--base-url` | `custom` 일 때만 필요 |
| `--base-lang` | 기준 언어. 예: `zh-CN` |
| `--target-langs` | 대상 언어. 쉼표 구분. 예: `en,ja` |
| `--site-url` | 선택. 생략 시 상대 경로 언어 링크 |
| `--create-pr` | 번역 후 PR 생성 |
| `--token` | GitHub Token. 환경 변수 `GITHUB_TOKEN` 도 가능 |
| `--base-branch` | PR 기준 브랜치. 예: `master` / `main` |

선택 설정 파일 `.blog-global.yml` (블로그 루트에 둠. **API Key 를 넣지 마세요**):

```yaml
provider: siliconflow
model: deepseek-ai/DeepSeek-V3
base_lang: zh-CN
target_langs:
  - en
site_url: https://example.com
```

### 4. 실행 결과

| 경로 | 설명 |
| ---- | ---- |
| `_posts/xxx.md` | 원문. 상단에 언어 전환 링크 삽입 |
| `en/xxx.md` | 영어 page |
| `.blog-global/state.json` | 증분 상태. 다음 실행 시 변경분만 번역 |

언어 링크 예시:

```markdown
> 🌐 [中文](/2026/06/23/DDD/) | [English](/en/2026/06/23/DDD/)
```

PR 병합 후에도 홈에는 원문만 보이며, 본문 링크로 번역본에 들어갑니다.

## 지원 언어

`zh-CN` `zh-TW` `en` `ja` `ko` `es` `fr` `de` `ru` `pt` `ar` `hi` `it` `nl` `pl` `tr` `vi` `th` `id` `ms`
