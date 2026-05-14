# Production Guide — AI Agent Generated Code From Requirements

> คู่มือสำหรับ CEO และทีม: ตั้งแต่เริ่มเขียนโค้ดจนถึงขึ้น Production จริง

---

## สารบัญ

1. [ภาพรวมโปรเจค](#1-ภาพรวมโปรเจค)
2. [โครงสร้างทีม — Skills เปรียบเหมือนพนักงาน](#2-โครงสร้างทีม--skills-เปรียบเหมือนพนักงาน)
3. [Workflow ตั้งแต่ต้นจนจบ](#3-workflow-ตั้งแต่ต้นจนจบ)
4. [รายละเอียดแต่ละ Skill](#4-รายละเอียดแต่ละ-skill)
5. [วิธีติดตั้ง Skills ที่ยังขาด](#5-วิธีติดตั้ง-skills-ที่ยังขาด)
6. [Checklist ก่อนขึ้น Production](#6-checklist-ก่อนขึ้น-production)

---

## 1. ภาพรวมโปรเจค

| รายการ | รายละเอียด |
|---|---|
| **ชื่อโปรเจค** | ai-agent-generated-code-from-requirements |
| **ประเภท** | REST API (Node.js / Express) |
| **Database** | MongoDB |
| **Runtime** | Node.js >= 24.11.0 |
| **Module System** | ESM (`type: "module"`) |
| **Port เริ่มต้น** | 3000 |

### Stack หลัก

```
Express 4       — HTTP framework + routing
MongoDB 6       — Database driver
Joi 17          — Request validation
Pino 9          — Structured logging
express-rate-limit — Rate limiting (100 req/min)
dotenv          — Environment config
```

### API Endpoints ปัจจุบัน

```
GET    /health              — Health check
GET    /api/v1/items        — List items (auth required)
GET    /api/v1/items/:id    — Get item by ID (auth required)
POST   /api/v1/items        — Create item (auth required)
PUT    /api/v1/items/:id    — Replace item (auth required)
PATCH  /api/v1/items/:id    — Update item (auth required)
DELETE /api/v1/items/:id    — Delete item (auth required)
```

> ทุก endpoint ใน `/api/v1/items` ผ่าน `gatewayAuth` middleware

---

## 2. โครงสร้างทีม — Skills เปรียบเหมือนพนักงาน

```
CEO (คุณ)
│
├── CTO / สถาปนิก          → /init
│
├── Engineering
│   ├── Senior Backend Dev  → express-rest-api + mongodb + /simplify
│   └── Senior Frontend Dev → vercel-react-best-practices + nextjs-on-vercel
│                              + ui-ux-designer + shadcn-tailwind
│
├── QA Engineer             → integration-testing (ติดตั้งเพิ่ม)
├── Tech Lead               → /review
├── Security Engineer       → /security-review
├── Technical Writer        → api-reference-documentation (ติดตั้งเพิ่ม)
├── DevOps Engineer         → ci-cd-architecture (ติดตั้งเพิ่ม)
├── SRE / Ops               → monitoring-observability (ติดตั้งเพิ่ม)
└── Automation              → /schedule + /loop
```

### สถานะทีม

| ตำแหน่ง | Skill | Install Count | สถานะ |
|---|---|---|---|
| CTO / สถาปนิก | `/init` | — | ✅ พร้อมใช้ |
| Senior Backend — Code Quality | `/simplify` | — | ✅ พร้อมใช้ |
| Senior Backend — Express API | `express-rest-api` | 579 | ⬇️ ต้องติดตั้ง |
| Senior Backend — MongoDB | `mongodb` | 1,300 | ⬇️ ต้องติดตั้ง |
| Senior Frontend — React/Next.js | `vercel-react-best-practices` | **397,600** | ⬇️ ต้องติดตั้ง |
| Senior Frontend — Deployment | `nextjs-on-vercel` | 139 | ⬇️ ต้องติดตั้ง |
| Senior Frontend — UX/UI Design | `ui-ux-designer` | 1,100 | ⬇️ ต้องติดตั้ง |
| Senior Frontend — UI Components | `shadcn-tailwind` | 77 | ⬇️ ต้องติดตั้ง |
| Tech Lead | `/review` | — | ✅ พร้อมใช้ |
| Security Engineer | `/security-review` | — | ✅ พร้อมใช้ |
| Automation | `/schedule` + `/loop` | — | ✅ พร้อมใช้ |
| QA Engineer | `integration-testing` | 352 | ⬇️ ต้องติดตั้ง |
| Technical Writer | `api-reference-documentation` | 336 | ⬇️ ต้องติดตั้ง |
| DevOps Engineer | `ci-cd-architecture` | 58 | ⬇️ ต้องติดตั้ง |
| SRE / Ops | `monitoring-observability` | 11,000 | ⬇️ ต้องติดตั้ง |

---

## 3. Workflow ตั้งแต่ต้นจนจบ

```
Phase 1 — SETUP
──────────────────────────────────────────────────────────────
  [CTO] /init
  └─ สร้าง CLAUDE.md วางโครงสร้างโปรเจค, conventions,
     และ architecture decisions ให้ทีมทุกคนเข้าใจตรงกัน

Phase 2a — BACKEND DEVELOPMENT
──────────────────────────────────────────────────────────────
  [Senior Backend] express-rest-api + mongodb + /simplify
  └─ เขียน Express routes, controllers, services, repositories
     ตาม pattern ที่มีในโปรเจค (items module เป็น template)
     ใช้ mongodb skill จัดการ query, index, aggregation
     รัน /simplify ทุกครั้งก่อนส่ง PR เพื่อตรวจคุณภาพโค้ด

Phase 2b — FRONTEND DEVELOPMENT  (Next.js — ยังไม่เริ่ม)
──────────────────────────────────────────────────────────────
  [Senior Frontend] vercel-react-best-practices + nextjs-on-vercel
                    + ui-ux-designer + shadcn-tailwind
  └─ ออกแบบ UI/UX ด้วย ui-ux-designer ก่อนเขียนโค้ด
     เขียน Next.js components ตาม vercel-react-best-practices
     ใช้ shadcn/ui + Tailwind สำหรับ UI components
     ตั้ง deployment บน Vercel ด้วย nextjs-on-vercel skill

Phase 3 — TESTING
──────────────────────────────────────────────────────────────
  [QA Engineer] integration-testing
  └─ เขียน integration tests ครอบคลุมทุก endpoint
     ทดสอบ happy path + edge case + error case
     รัน: npm run test:unit | npm run test:integration

Phase 4 — CODE REVIEW
──────────────────────────────────────────────────────────────
  [Tech Lead] /review
  └─ Review PR ทุก branch ก่อน merge เข้า main
     ตรวจ logic, naming, consistency, performance

Phase 5 — SECURITY
──────────────────────────────────────────────────────────────
  [Security Engineer] /security-review
  └─ Audit ช่องโหว่ก่อน deploy ทุกครั้ง
     ตรวจ: injection, auth bypass, rate limit, headers,
     dependency vulnerabilities (npm audit)

Phase 6 — DOCUMENTATION
──────────────────────────────────────────────────────────────
  [Technical Writer] api-reference-documentation
  └─ สร้าง API Reference / OpenAPI spec
     ให้ทีม Frontend, Mobile, และ Partner เรียกใช้ได้ถูกต้อง

Phase 7 — CI/CD PIPELINE
──────────────────────────────────────────────────────────────
  [DevOps Engineer] ci-cd-architecture
  └─ ออกแบบและตั้ง pipeline อัตโนมัติ
     lint → test → security scan → build → deploy
     ทุก push ไป main ผ่านกระบวนการนี้โดยอัตโนมัติ

Phase 8 — PRODUCTION MONITORING
──────────────────────────────────────────────────────────────
  [SRE / Ops] monitoring-observability
  └─ ตั้ง monitoring, alerting, และ dashboards
     ดู error rate, latency, throughput 24/7
     ตั้ง alert เมื่อ service ผิดปกติ

Phase 9 — AUTOMATION (ต่อเนื่อง)
──────────────────────────────────────────────────────────────
  [Automation] /schedule + /loop
  └─ รัน recurring tasks อัตโนมัติ
     เช่น: health check ทุก 5 นาที, cleanup job รายวัน
```

---

## 4. รายละเอียดแต่ละ Skill

---

### `/init` — CTO / สถาปนิก

**บทบาท:** วางรากฐานโปรเจคให้แข็งแรง ก่อนที่ทีมจะเริ่มทำงาน

**ทำอะไร:**
- สร้างไฟล์ `CLAUDE.md` ที่รวม architecture, conventions, และ decisions
- บันทึก tech stack, module structure, และ env variables
- กำหนด coding standards ให้ทีมใช้ร่วมกัน

**เมื่อใช้:**
- เริ่มโปรเจคใหม่ หรือเมื่อโปรเจคขยายใหญ่ขึ้นมาก

**วิธีใช้:**
```
/init
```

---

### Senior Backend Developer

> **Tech Stack ที่ใช้ในโปรเจคนี้:** Node.js 24 / Express 4 / MongoDB 6 / Joi / Pino

---

#### `/simplify` — Senior Backend (Code Quality)

**บทบาท:** ตรวจและปรับโค้ด Backend ให้กระชับ อ่านง่าย ก่อนส่ง PR

**ทำอะไร:**
- ตรวจหาโค้ดที่ซ้ำซ้อนและ refactor
- ลด complexity ที่ไม่จำเป็น
- ปรับให้โค้ดอ่านง่ายและ maintain ง่าย

**เมื่อใช้:** หลังเขียน feature เสร็จ ก่อน submit PR

**วิธีใช้:**
```
/simplify
```

---

#### `express-rest-api` — Senior Backend (Express)

**บทบาท:** ผู้เชี่ยวชาญ Express REST API patterns ตรงกับ stack ที่ใช้อยู่

**ทำอะไร:**
- แนะนำ pattern สำหรับ routes, middleware, controllers
- ช่วยเขียน error handling และ response format ให้สม่ำเสมอ
- ช่วย setup middleware ใหม่ (auth, validation, logging)
- ตรวจ API design ให้ตรงกับ REST standards

**เมื่อใช้:**
- เพิ่ม module ใหม่นอกจาก items
- แก้ปัญหา middleware หรือ routing

**Install Count:** 579 | **Source:** `pluginagentmarketplace/custom-plugin-nodejs`

**วิธีติดตั้ง:**
```bash
npx skills add pluginagentmarketplace/custom-plugin-nodejs@express-rest-api -g -y
```

---

#### `mongodb` — Senior Backend (Database)

**บทบาท:** ผู้เชี่ยวชาญ MongoDB driver ที่โปรเจคนี้ใช้อยู่ (native driver ไม่ใช่ Mongoose)

**ทำอะไร:**
- ช่วยเขียน query, filter, projection ที่ถูกต้อง
- แนะนำ index strategy เพื่อ performance
- ช่วยเขียน aggregation pipeline
- ตรวจ schema design และ data modeling

**เมื่อใช้:**
- เพิ่ม collection ใหม่
- แก้ปัญหา query performance
- รัน `npm run db:items-indexes` แล้วต้องการเพิ่ม index

**Install Count:** 1,300 | **Source:** `hoodini/ai-agents-skills`

**วิธีติดตั้ง:**
```bash
npx skills add hoodini/ai-agents-skills@mongodb -g -y
```

---

### Senior Frontend Developer

> **Tech Stack ที่วางแผน:** Next.js (App Router) / React / Tailwind CSS / shadcn/ui / Vercel

---

#### `vercel-react-best-practices` — Senior Frontend (React/Next.js)

**บทบาท:** คู่มือ React และ Next.js จาก Vercel เอง — skill ยอดนิยมอันดับต้นๆ

**ทำอะไร:**
- แนะนำ React patterns ที่ถูกต้อง (Server Components, Client Components)
- Next.js App Router conventions และ best practices
- Performance optimization (caching, streaming, lazy loading)
- Data fetching patterns ที่เหมาะกับ Next.js

**เมื่อใช้:**
- เริ่มเขียน Frontend ครั้งแรก
- ทุกครั้งที่สร้าง component หรือ page ใหม่

**Install Count:** 397,600+ | **Source:** `vercel-labs/agent-skills` (official)

**วิธีติดตั้ง:**
```bash
npx skills add vercel-labs/agent-skills@vercel-react-best-practices -g -y
```

---

#### `nextjs-on-vercel` — Senior Frontend (Deployment)

**บทบาท:** ผู้เชี่ยวชาญการ deploy Next.js ขึ้น Vercel โดยเฉพาะ

**ทำอะไร:**
- ตั้งค่า Vercel project ให้ถูกต้อง
- จัดการ environment variables บน Vercel
- ตั้ง domain, preview deployments, edge functions
- ต่อ Frontend บน Vercel เข้ากับ Backend API ที่ deploy แยก

**เมื่อใช้:**
- เมื่อพร้อม deploy Frontend ครั้งแรก
- แก้ปัญหา deployment หรือ build บน Vercel

**Install Count:** 139 | **Source:** `andrelandgraf/fullstackrecipes`

**วิธีติดตั้ง:**
```bash
npx skills add andrelandgraf/fullstackrecipes@nextjs-on-vercel -g -y
```

---

#### `ui-ux-designer` — Senior Frontend (UX/UI Design)

**บทบาท:** นักออกแบบ UX/UI ที่ช่วยให้ UI สวยงามและใช้งานได้ดีก่อนลงมือโค้ด

**ทำอะไร:**
- ออกแบบ user flow และ wireframe
- แนะนำ UX patterns ที่เหมาะกับ use case
- ตรวจ accessibility (a11y) ให้ผ่านมาตรฐาน
- แนะนำ color scheme, typography, spacing

**เมื่อใช้:**
- ก่อนเริ่มเขียนหน้าใหม่ทุกหน้า
- เมื่อต้องการ feedback ด้าน design ก่อนส่ง stakeholder

**Install Count:** 1,100 | **Source:** `sickn33/antigravity-awesome-skills`

**วิธีติดตั้ง:**
```bash
npx skills add sickn33/antigravity-awesome-skills@ui-ux-designer -g -y
```

---

#### `shadcn-tailwind` — Senior Frontend (UI Components)

**บทบาท:** ผู้เชี่ยวชาญ shadcn/ui + Tailwind CSS — คู่ที่นิยมใช้กับ Next.js มากที่สุด

**ทำอะไร:**
- ช่วยเลือกและใช้ shadcn/ui components ได้ถูกต้อง
- เขียน Tailwind classes อย่างมีระบบ
- ปรับ theme ให้ตรง brand
- ช่วย customize components ให้ตรง design

**เมื่อใช้:**
- ทุกครั้งที่สร้าง UI component
- เมื่อต้องการ style หรือ layout ที่ซับซ้อน

**Install Count:** 77 | **Source:** `tenequm/claude-plugins`

**วิธีติดตั้ง:**
```bash
npx skills add tenequm/claude-plugins@shadcn-tailwind -g -y
```

---

### `integration-testing` — QA Engineer

**บทบาท:** รับประกันว่า API ทำงานถูกต้องครบทุก scenario ก่อน deploy

**ทำอะไร:**
- เขียน integration tests ให้ครอบคลุมทุก endpoint
- ทดสอบทั้ง happy path, edge case, และ error handling
- ตรวจ request/response schema ให้ถูกต้อง

**เมื่อใช้:**
- ก่อน merge ทุก feature branch
- หลังแก้ bug ใหญ่

**Install Count:** 352 | **Source:** `aj-geddes/useful-ai-prompts`

**วิธีติดตั้ง:**
```bash
npx skills add aj-geddes/useful-ai-prompts@integration-testing -g -y
```

---

### `/review` — Tech Lead

**บทบาท:** Gate keeper ของ main branch ไม่มี code ผ่านโดยไม่ได้ review

**ทำอะไร:**
- Review PR อย่างละเอียด
- ตรวจ logic, naming, consistency
- แนะนำการปรับปรุงก่อน approve

**เมื่อใช้:**
- ทุกครั้งก่อน merge PR เข้า main

**วิธีใช้:**
```
/review
```

---

### `/security-review` — Security Engineer

**บทบาท:** ด่านสุดท้ายก่อน production — ไม่มีช่องโหว่หลุดออกไป

**ทำอะไร:**
- ตรวจ OWASP Top 10 vulnerabilities
- ตรวจ authentication/authorization flow
- ตรวจ rate limiting, headers, และ input validation
- ตรวจ dependency vulnerabilities (`npm audit`)

**เมื่อใช้:**
- ก่อน deploy ทุกครั้ง
- หลังเพิ่ม dependency ใหม่

**วิธีใช้:**
```
/security-review
```

---

### `api-reference-documentation` — Technical Writer

**บทบาท:** แปลงโค้ดเป็นเอกสารที่ทีมอื่นใช้งานได้จริง

**ทำอะไร:**
- สร้าง API Reference ครบทุก endpoint
- สร้าง OpenAPI/Swagger spec
- เขียน request/response examples
- อธิบาย authentication และ error codes

**เมื่อใช้:**
- หลัง feature พร้อม deploy
- เมื่อต้องการแชร์ API กับทีมอื่น

**Install Count:** 336 | **Source:** `aj-geddes/useful-ai-prompts`

**วิธีติดตั้ง:**
```bash
npx skills add aj-geddes/useful-ai-prompts@api-reference-documentation -g -y
```

---

### `ci-cd-architecture` — DevOps Engineer

**บทบาท:** ทำให้ deployment เป็นอัตโนมัติ — push code แล้ว production อัพเดตเอง

**ทำอะไร:**
- ออกแบบ CI/CD pipeline ตั้งแต่ต้นจนจบ
- ตั้ง GitHub Actions / GitLab CI
- กำหนด stages: lint → test → security → build → deploy
- ตั้ง rollback strategy

**เมื่อใช้:**
- เมื่อโปรเจคพร้อม deploy ครั้งแรก
- เมื่อต้องการทำ deployment automation

**Install Count:** 58 | **Source:** `oakoss/agent-skills`

**วิธีติดตั้ง:**
```bash
npx skills add oakoss/agent-skills@ci-cd-architecture -g -y
```

---

### `monitoring-observability` — SRE / Ops

**บทบาท:** ดู production 24/7 — รู้ก่อนที่ user จะแจ้งปัญหา

**ทำอะไร:**
- ตั้ง monitoring dashboards
- ตั้ง alerting เมื่อ error rate สูงหรือ latency เกิน threshold
- ดู logs จาก Pino อย่างมีระบบ
- ติดตาม throughput และ resource usage

**เมื่อใช้:**
- หลัง deploy ขึ้น production
- เมื่อมี incident หรือ performance issue

**Install Count:** 11,000+ | **Source:** `supercent-io/skills-template`

**วิธีติดตั้ง:**
```bash
npx skills add supercent-io/skills-template@monitoring-observability -g -y
```

---

### `/schedule` + `/loop` — Automation

**บทบาท:** ทำงานซ้ำๆ แทนคน — ไม่มีใครลืม, ไม่มีใครขาด

**ทำอะไร:**
- `/schedule` — ตั้ง cron job สำหรับ agent task เช่น รายงานประจำวัน
- `/loop` — รัน command ซ้ำๆ ในช่วงเวลาที่กำหนด เช่น health check ทุก 5 นาที

**ตัวอย่างใช้งาน:**
```
/loop 5m /health-check
/schedule ทุกวันจันทร์ 9 โมงเช้า ให้ summary report ของ production
```

---

## 5. วิธีติดตั้ง Skills ที่ยังขาด

### ติดตั้งทีม Backend

```bash
# Senior Backend — Express REST API
npx skills add pluginagentmarketplace/custom-plugin-nodejs@express-rest-api -g -y

# Senior Backend — MongoDB
npx skills add hoodini/ai-agents-skills@mongodb -g -y
```

### ติดตั้งทีม Frontend

```bash
# Senior Frontend — React/Next.js Best Practices (จาก Vercel official)
npx skills add vercel-labs/agent-skills@vercel-react-best-practices -g -y

# Senior Frontend — Deploy Next.js บน Vercel
npx skills add andrelandgraf/fullstackrecipes@nextjs-on-vercel -g -y

# Senior Frontend — UX/UI Design
npx skills add sickn33/antigravity-awesome-skills@ui-ux-designer -g -y

# Senior Frontend — shadcn/ui + Tailwind CSS
npx skills add tenequm/claude-plugins@shadcn-tailwind -g -y
```

### ติดตั้งทีม QA, Writer, DevOps, Ops

```bash
# QA Engineer
npx skills add aj-geddes/useful-ai-prompts@integration-testing -g -y

# Technical Writer
npx skills add aj-geddes/useful-ai-prompts@api-reference-documentation -g -y

# DevOps Engineer
npx skills add oakoss/agent-skills@ci-cd-architecture -g -y

# SRE / Ops
npx skills add supercent-io/skills-template@monitoring-observability -g -y
```

### ติดตั้งทั้งหมดทีเดียว (10 skills)

```bash
npx skills add pluginagentmarketplace/custom-plugin-nodejs@express-rest-api -g -y && \
npx skills add hoodini/ai-agents-skills@mongodb -g -y && \
npx skills add vercel-labs/agent-skills@vercel-react-best-practices -g -y && \
npx skills add andrelandgraf/fullstackrecipes@nextjs-on-vercel -g -y && \
npx skills add sickn33/antigravity-awesome-skills@ui-ux-designer -g -y && \
npx skills add tenequm/claude-plugins@shadcn-tailwind -g -y && \
npx skills add aj-geddes/useful-ai-prompts@integration-testing -g -y && \
npx skills add aj-geddes/useful-ai-prompts@api-reference-documentation -g -y && \
npx skills add oakoss/agent-skills@ci-cd-architecture -g -y && \
npx skills add supercent-io/skills-template@monitoring-observability -g -y
```

ตรวจสอบ skills ที่ติดตั้งแล้ว:
```bash
npx skills check
```

---

## 6. Checklist ก่อนขึ้น Production

### Phase Setup
- [ ] รัน `/init` สร้าง CLAUDE.md วางโครงสร้างโปรเจค
- [ ] ตั้งค่า `.env` ให้ครบ (`PORT`, `MONGODB_URI`, `NODE_ENV`, auth keys)
- [ ] ตรวจ `engines.node >= 24.11.0` ใน server ที่จะ deploy

### Phase Backend Development
- [ ] ใช้ `express-rest-api` skill เมื่อเพิ่ม route หรือ middleware ใหม่
- [ ] ใช้ `mongodb` skill เมื่อเพิ่ม collection หรือ query ใหม่
- [ ] รัน `/simplify` บนโค้ดที่แก้ไขล่าสุด
- [ ] รัน `npm run lint` ผ่านสะอาด
- [ ] รัน `npm run format` จัดรูปแบบโค้ด
- [ ] รัน `npm run db:items-indexes` เมื่อเพิ่ม index ใหม่

### Phase Frontend Development (เมื่อเริ่มทำ Next.js)
- [ ] ใช้ `ui-ux-designer` skill ออกแบบ UX/UI ก่อนเขียนโค้ดทุกหน้า
- [ ] ตั้งโปรเจค Next.js ด้วย `vercel-react-best-practices` เป็น guide
- [ ] ใช้ `shadcn-tailwind` skill สำหรับ UI components ทุกตัว
- [ ] เชื่อม Frontend กับ Backend API ที่ `/api/v1/items`
- [ ] ใช้ `nextjs-on-vercel` skill ตั้ง Vercel project และ deploy

### Phase Testing
- [ ] รัน `npm run test:unit` — ผ่านทุก test
- [ ] รัน `npm run test:integration` — ผ่านทุก test
- [ ] ใช้ `integration-testing` skill เขียน test ให้ครอบคลุม edge case

### Phase Review
- [ ] รัน `/review` บน PR ก่อน merge เข้า main
- [ ] แก้ไขทุก issue ที่ Tech Lead แนะนำ

### Phase Security
- [ ] รัน `/security-review` บน branch ปัจจุบัน
- [ ] รัน `npm run audit:check` — ไม่มี moderate/high vulnerability
- [ ] ตรวจ `gatewayAuth` middleware ทำงานถูกต้อง
- [ ] ตรวจ rate limit ตั้งค่าเหมาะสมกับ traffic จริง

### Phase Documentation
- [ ] ใช้ `api-reference-documentation` skill สร้าง API docs ครบทุก endpoint
- [ ] ตรวจ request/response examples ถูกต้อง
- [ ] เผยแพร่ docs ให้ทีมที่เกี่ยวข้อง

### Phase CI/CD
- [ ] ใช้ `ci-cd-architecture` skill ออกแบบ pipeline
- [ ] ตั้ง pipeline: lint → test → security scan → deploy
- [ ] ทดสอบ pipeline รัน end-to-end ผ่าน

### Phase Production
- [ ] Deploy ครั้งแรกบน staging environment ก่อน
- [ ] ทดสอบ `/health` endpoint ตอบ 200
- [ ] ใช้ `monitoring-observability` skill ตั้ง monitoring dashboard
- [ ] ตั้ง alert สำหรับ error rate > 1% และ latency > 500ms
- [ ] ตั้ง `/loop` หรือ `/schedule` สำหรับ automated health check
- [ ] Deploy ขึ้น production
- [ ] ตรวจสอบ logs ผ่าน Pino หลัง deploy 30 นาทีแรก

---

> **หมายเหตุสำหรับ CEO:** แต่ละ Phase ควรรันตามลำดับ อย่า skip Security review เด็ดขาด แม้จะเร่งเวลา เพราะต้นทุนในการแก้ปัญหาหลัง production สูงกว่ามาก
