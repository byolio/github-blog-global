# blog-global

[中文](zh-CN.md) | [繁體中文](zh-TW.md) | [English](en.md) | [日本語](ja.md) | [한국어](ko.md) | [Español](es.md) | [Français](fr.md) | [Deutsch](de.md) | [Русский](ru.md) | [Português](pt.md) | [العربية](ar.md) | [हिन्दी](hi.md) | [Italiano](it.md) | [Nederlands](nl.md) | [Polski](pl.md) | [Türkçe](tr.md) | [Tiếng Việt](vi.md) | **ไทย** | [Bahasa Indonesia](id.md) | [Bahasa Melayu](ms.md)

ใช้ AI แปลบล็อก GitHub Pages เป็นหลายภาษา

ตอนนี้รองรับเฉพาะ CLI: แปลแบบเพิ่มทีละส่วน แทรกลิงก์สลับภาษา และสร้าง PR อัตโนมัติได้ตามต้องการ

เฟรมเวิร์กที่รองรับเต็มรูปแบบ: **Jekyll**

## ข้อควรระวัง (โครงสร้างโปรเจกต์ที่ต้องมี)

รันที่**รากของที่เก็บบล็อก** หากโครงสร้างไม่ตรงตามนี้ การสแกนบทความ / แทรกลิงก์ / สร้าง PR จะล้มเหลว:

```text
your-blog/                 ← รัน node cli.js ที่นี่
├── _config.yml            ← จำเป็น
├── _posts/                ← จำเป็น; วางโพสต์ภาษาฐานไว้ที่นี่
│   └── 2026-06-23-hello.md
├── .git/                  ← ต้องเป็นที่เก็บ Git
└── (รีโมตต้องเป็น GitHub)
```

| เงื่อนไข | ข้อกำหนด |
| ---- | ---- |
| เฟรมเวิร์ก | Jekyll: ต้องมีทั้ง `_config.yml` และ `_posts/` |
| รูปแบบโพสต์ | `.md` / `.markdown` ใน `_posts/`; แนะนำ `YYYY-MM-DD-slug.md` (pretty permalink) |
| ไดเรกทอรีที่รัน | รากของบล็อก ไม่ใช่โฟลเดอร์เครื่องมือ blog-global |
| PR อัตโนมัติ | ตั้งค่า GitHub remote แล้ว; Token ที่มีสิทธิ์ `repo`; มี `--base-branch` ในเครื่อง |
| ไม่รองรับ | Hugo; ไซต์ HTML คงที่ธรรมดา; เลย์เอาต์ที่ไม่มี `_posts/` |

ไฟล์แปลจะถูกเขียนที่ `{lang}/` ในรากของที่เก็บ (เช่น `en/xxx.md`) **ไม่**ใส่ใน `_posts/` เพื่อไม่ให้หน้าแรกและแท็กปนกัน

## ข้อกำหนดสภาพแวดล้อม

- Node.js ≥ 18
- AI API Key (OpenRouter / SiliconFlow / เอนด์พอยต์ที่เข้ากันได้กับ OpenAI)
- สำหรับ PR อัตโนมัติ: GitHub Token ที่มีสิทธิ์ `repo`

## วิธีใช้

รันจาก**รากของที่เก็บบล็อก**

### 1. รับ CLI

ดาวน์โหลด `blog-global-cli-*.zip` จาก [Releases](https://github.com/byolio/github-blog-global/releases) แล้วแตกไฟล์เพื่อได้ `cli.js`

หรือสร้างจากซอร์ส:

```bash
npm install
npm run build
npm run package:cli   # → dist/cli.js
```

### 2. โหมดโต้ตอบ

```bash
node cli.js
# or
node /path/to/blog-global/dist/cli.js
```

ทำตามพรอมต์: AI Provider → API Key → โมเดล → ภาษาต้นทาง → ภาษาเป้าหมาย → site URL (ไม่บังคับ) → สาขา PR → สร้าง PR หรือไม่ → GitHub Token

### 3. โหมดไม่โต้ตอบ

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

| พารามิเตอร์ | คำอธิบาย |
| ---- | ---- |
| `--provider` | `openrouter` / `siliconflow` / `custom` |
| `--api-key` | AI Key; หรือตัวแปรสภาพแวดล้อม `BLOG_GLOBAL_API_KEY` |
| `--model` | ชื่อโมเดล (SiliconFlow ต้องมีคำนำหน้าองค์กร) |
| `--base-url` | จำเป็นเฉพาะเมื่อ provider เป็น `custom` |
| `--base-lang` | ภาษาฐาน เช่น `zh-CN` |
| `--target-langs` | ภาษาเป้าหมาย คั่นด้วยจุลภาค เช่น `en,ja` |
| `--site-url` | ไม่บังคับ; ถ้าไม่ใส่จะใช้ลิงก์ภาษาแบบสัมพัทธ์ |
| `--create-pr` | สร้าง Pull Request หลังแปล |
| `--token` | GitHub Token; หรือตัวแปร `GITHUB_TOKEN` |
| `--base-branch` | สาขาฐานของ PR เช่น `master` / `main` |

ไฟล์ตั้งค่าทางเลือก `.blog-global.yml` ที่รากบล็อก (**อย่าใส่ API Key ที่นี่**):

```yaml
provider: siliconflow
model: deepseek-ai/DeepSeek-V3
base_lang: zh-CN
target_langs:
  - en
site_url: https://example.com
```

### 4. ผลลัพธ์

| พาธ | คำอธิบาย |
| ---- | ---- |
| `_posts/xxx.md` | ต้นฉบับ พร้อมลิงก์สลับภาษา |
| `en/xxx.md` | หน้าภาษาอังกฤษ |
| `.blog-global/state.json` | สถานะแบบเพิ่มทีละส่วนสำหรับรอบถัดไป |

ตัวอย่างลิงก์ภาษา:

```markdown
> 🌐 [中文](/2026/06/23/DDD/) | [English](/en/2026/06/23/DDD/)
```

หลังรวม PR หน้าแรกยังแสดงเฉพาะต้นฉบับ; เปิดคำแปลผ่านลิงก์ในบทความ

## ภาษาที่รองรับ

`zh-CN` `zh-TW` `en` `ja` `ko` `es` `fr` `de` `ru` `pt` `ar` `hi` `it` `nl` `pl` `tr` `vi` `th` `id` `ms`
