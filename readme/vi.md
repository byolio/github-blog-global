# blog-global

[中文](zh-CN.md) | [繁體中文](zh-TW.md) | [English](en.md) | [日本語](ja.md) | [한국어](ko.md) | [Español](es.md) | [Français](fr.md) | [Deutsch](de.md) | [Русский](ru.md) | [Português](pt.md) | [العربية](ar.md) | [हिन्दी](hi.md) | [Italiano](it.md) | [Nederlands](nl.md) | [Polski](pl.md) | [Türkçe](tr.md) | **Tiếng Việt** | [ไทย](th.md) | [Bahasa Indonesia](id.md) | [Bahasa Melayu](ms.md)

Dùng AI dịch blog GitHub Pages sang nhiều ngôn ngữ.

Hiện chỉ hỗ trợ CLI: dịch tăng dần, chèn liên kết chuyển ngôn ngữ, tùy chọn tạo PR tự động.

Framework hỗ trợ đầy đủ: **Jekyll**.

## Lưu ý (cấu trúc dự án bắt buộc)

Chạy ở **thư mục gốc kho blog**. Nếu không đúng cấu trúc sau, quét bài / chèn liên kết / tạo PR sẽ thất bại:

```text
your-blog/                 ← chạy node cli.js tại đây
├── _config.yml            ← bắt buộc
├── _posts/                ← bắt buộc; đặt bài ngôn ngữ gốc ở đây
│   └── 2026-06-23-hello.md
├── .git/                  ← phải là kho Git
└── (remote phải là GitHub)
```

| Điều kiện | Yêu cầu |
| ---- | ---- |
| Framework | Jekyll: phải có cả `_config.yml` và `_posts/` |
| Định dạng bài | `.md` / `.markdown` trong `_posts/`; nên dùng `YYYY-MM-DD-slug.md` (pretty permalink) |
| Thư mục chạy | Gốc kho blog, không phải thư mục công cụ blog-global |
| PR tự động | Đã cấu hình GitHub remote; Token quyền `repo`; `--base-branch` tồn tại cục bộ |
| Không hỗ trợ | Hugo; site HTML tĩnh thuần; bố cục không có `_posts/` |

Bản dịch được ghi vào `{lang}/` ở gốc kho (ví dụ `en/xxx.md`), **không** ghi vào `_posts/`, tránh làm bẩn trang chủ và thẻ.

## Yêu cầu môi trường

- Node.js ≥ 18
- AI API Key (OpenRouter / SiliconFlow / endpoint tùy chỉnh tương thích OpenAI)
- Để tạo PR tự động: GitHub Token quyền `repo`

## Cách dùng

Chạy từ **thư mục gốc kho blog**.

### 1. Lấy CLI

Tải `blog-global-cli-*.zip` từ [Releases](https://github.com/byolio/github-blog-global/releases), giải nén để có `cli.js`.

Hoặc tự build từ mã nguồn:

```bash
npm install
npm run build
npm run package:cli   # → dist/cli.js
```

### 2. Chế độ tương tác

```bash
node cli.js
# or
node /path/to/blog-global/dist/cli.js
```

Làm theo gợi ý: AI Provider → API Key → model → ngôn ngữ nguồn → ngôn ngữ đích → site URL (tuỳ chọn) → nhánh PR → có tạo PR không? → GitHub Token.

### 3. Chế độ không tương tác

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

| Tham số | Mô tả |
| ---- | ---- |
| `--provider` | `openrouter` / `siliconflow` / `custom` |
| `--api-key` | AI Key; hoặc biến môi trường `BLOG_GLOBAL_API_KEY` |
| `--model` | Tên model (SiliconFlow cần tiền tố tổ chức) |
| `--base-url` | Chỉ cần khi provider là `custom` |
| `--base-lang` | Ngôn ngữ gốc, ví dụ `zh-CN` |
| `--target-langs` | Ngôn ngữ đích, cách nhau bằng dấu phẩy, ví dụ `en,ja` |
| `--site-url` | Tuỳ chọn; bỏ trống thì dùng liên kết tương đối |
| `--create-pr` | Tạo Pull Request sau khi dịch |
| `--token` | GitHub Token; hoặc biến `GITHUB_TOKEN` |
| `--base-branch` | Nhánh cơ sở của PR, ví dụ `master` / `main` |

File cấu hình tuỳ chọn `.blog-global.yml` ở gốc blog (**không ghi API Key vào đây**):

```yaml
provider: siliconflow
model: deepseek-ai/DeepSeek-V3
base_lang: zh-CN
target_langs:
  - en
site_url: https://example.com
```

### 4. Kết quả

| Đường dẫn | Mô tả |
| ---- | ---- |
| `_posts/xxx.md` | Bản gốc, đã chèn liên kết chuyển ngôn ngữ |
| `en/xxx.md` | Trang tiếng Anh |
| `.blog-global/state.json` | Trạng thái tăng dần cho lần chạy sau |

Ví dụ liên kết ngôn ngữ:

```markdown
> 🌐 [中文](/2026/06/23/DDD/) | [English](/en/2026/06/23/DDD/)
```

Sau khi merge PR, trang chủ vẫn chỉ hiện bản gốc; mở bản dịch qua liên kết trong bài.

## Ngôn ngữ được hỗ trợ

`zh-CN` `zh-TW` `en` `ja` `ko` `es` `fr` `de` `ru` `pt` `ar` `hi` `it` `nl` `pl` `tr` `vi` `th` `id` `ms`
