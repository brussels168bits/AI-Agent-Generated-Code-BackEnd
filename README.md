# AI-Agent-Generated-Code-From-Requirements

บริการ HTTP ตัวอย่าง (Express + MongoDB driver) สำหรับ **Items CRUD** ภายใต้ `/api/v1/items` พร้อม **gateway headers** แทน JWT, soft delete, optimistic locking, transaction + audit log ตามมาตรฐานใน `agent.md`

## ความต้องการของระบบ

- **Node.js** `>= 24.11.0` (โปรเจกต์ใช้ ESM เท่านั้น)
- **MongoDB** ที่ใช้งานได้ (ค่า `MONGODB_URI` ใน `.env` ควรรองรับการเขียนแบบ replica set / transaction ตามที่ deploy ใช้จริง)

## การติดตั้งและรัน

```bash
npm install
```

คัดลอก `.env.example` เป็น `.env` แล้วตั้งค่าอย่างน้อย:

| ตัวแปร | ความหมาย |
|--------|-----------|
| `MONGODB_URI` | URI ของ MongoDB |
| `DB_NAME` | ชื่อฐานข้อมูล |
| `GATEWAY_TOKEN` | ค่าเดียวกับ header `x-gateway-token` สำหรับเรียก API |
| `PORT` | พอร์ตเซิร์ฟเวอร์ (ค่าเริ่มต้น `3000`) |

สร้าง index ของ collection `items` (ครั้งหนึ่งต่อ environment หรือหลัง deploy):

```bash
npm run db:items-indexes
```

รันแอป:

```bash
npm run dev
```

หรือ production-style:

```bash
npm start
```

## สคริปต์ npm

| สคริปต์ | คำอธิบาย |
|---------|----------|
| `npm run dev` | รันเซิร์ฟเวอร์พร้อม `--watch` |
| `npm start` | รัน `src/server.js` |
| `npm run lint` | ESLint (`src`, `scripts`) |
| `npm run format` | Prettier |
| `npm test` | `node --test` (รันทุก test) |
| `npm run test:unit` | รันเฉพาะ unit test |
| `npm run test:integration` | รันเฉพาะ integration test |
| `npm run audit:check` | ตรวจ dependency vulnerabilities |
| `npm run db:items-indexes` | สร้าง unique + compound index สำหรับ `items` |

## API หลัก

| Method | Path | หมายเหตุ |
|--------|------|----------|
| `GET` | `/health` | health check (ไม่ต้องมี gateway headers) |
| `GET` | `/api/v1/items` | list + pagination + filter |
| `GET` | `/api/v1/items/:itemId` | detail |
| `POST` | `/api/v1/items` | create |
| `PUT` | `/api/v1/items/:itemId` | full replace + `upd_date` |
| `PATCH` | `/api/v1/items/:itemId` | partial update + `upd_date` |
| `DELETE` | `/api/v1/items/:itemId` | soft delete + body `upd_date` |

ทุกคำขอใต้ `/api/v1/items` ต้องมี headers:

- `x-gateway-token` — ตรงกับ `GATEWAY_TOKEN`
- `x-ou-id`, `x-branch-id`, `x-user-id` — สตริง ObjectId 24 ตัว (hex)

รูปแบบ response, รหัส error, audit, transaction ฯลฯ อยู่ใน `agent.md` และสเปครายละเอียดของโมดูลใน `prompt-items-crud.md`

## โครงสร้างโฟลเดอร์ (สรุป)

```
src/
  app.js, server.js
  config/          # database, logger
  middlewares/    # request-id, validate, error-handler, gateway-auth, …
  modules/
    health/       # GET /health
    items/        # route, controller, service, repository, validator
  utils/
scripts/
  create-items-indexes.js
bruno/             # Bruno collection ทดสอบ API (ดู bruno/README.md)
.cursor/rules/   # คำแนะนำ Cursor + Bruno
```

## ทดสอบด้วย Bruno

คอลเลกชันอยู่ที่โฟลเดอร์ `bruno/` (มี `bruno.json` และไฟล์ `.bru`) — เปิดได้ทั้ง **Bruno Desktop** และ **Bruno extension ใน Cursor/VS Code**

ขั้นตอนรัน CRUD แบบชุดและการตั้ง `gatewayToken` อธิบายไว้ใน `bruno/README.md`

## เอกสารอ้างอิงใน repo

- `agent.md` — มาตรฐานโปรเจกต์ (API response, MongoDB, error handling, …)
- `prompt-items-crud.md` — สเปคโมดูล `items` ที่ implement แล้ว
