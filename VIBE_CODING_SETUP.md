# คู่มือ Setup โปรเจกต์ใหม่ — Vibe Coding

วิธี setup ระบบให้ AI generate code ตาม standard ได้เลย  
ไม่ต้องเขียนโค้ดเอง — ให้ AI ทำทั้งหมด

---

## ภาพรวม: ทำงานยังไง

```
agent.md          ← Standard บอก AI ว่ามีกฎอะไรบ้าง
agent-full.md     ← Template โค้ดสำหรับ AI อ่านเมื่อต้องการรายละเอียด
Cursor Rule       ← โหลด agent.md เข้า AI context อัตโนมัติ (ทุกไฟล์)
prompt.md         ← สิ่งที่เราเขียนบอก AI ว่าต้องการ Feature อะไร
```

---

## ขั้นตอน Setup

### 1. Copy ไฟล์ Standard

Copy ไฟล์เหล่านี้จาก repo นี้เข้าโปรเจกต์ใหม่ทั้งหมด:

| ไฟล์ | วางที่ | ทำอะไร |
| --- | --- | --- |
| `agent.md` | root ของโปรเจกต์ | Standard ฉบับเต็ม — AI อ่านเป็น reference |
| `agent-full.md` | root ของโปรเจกต์ | Template โค้ดครบชุด — AI อ่านเมื่อสร้าง CRUD |
| `.cursor/rules/brussels-dev.mdc` | `.cursor/rules/` | Cursor Rule โหลด standard อัตโนมัติ |

> **ถ้าใช้ Claude Code (claude.ai)** แทน Cursor: สร้าง `CLAUDE.md` ที่ root แล้ว paste เนื้อหาจาก `brussels-dev.mdc` ลงไปแทน

---

### 2. แก้ไข Cursor Rule ให้ชี้ไฟล์ถูก

เปิด `.cursor/rules/brussels-dev.mdc` แล้วตรวจว่า path ใน Tier 2 ถูกต้อง:

```
- **Tier 2 (`agent-full.md`):** Full Code Templates — อ่านเพิ่มเมื่อ:
```

ถ้าย้ายชื่อไฟล์ให้แก้ path ในส่วนนี้ตามจริง

---

### 3. เขียน `prompt.md` สำหรับ Feature ที่ต้องการ

นี่คือสิ่งเดียวที่ต้องเขียนเอง — บอก AI ว่าต้องการอะไร  
ดูตัวอย่าง `prompt-items-crud.md` เป็นแม่แบบ

**โครงสร้าง prompt ที่ดี:**

```markdown
# Task: CRUD API — Module `<ชื่อ module>`

## 0. มาตรฐาน
อ่าน `agent.md` ให้ครบก่อน — โค้ดทั้งหมดต้องตรงตาม standard

## 1. Scope
Resource: `<ชื่อ resource>`
Base path: `/api/v1/<resource-plural>`

## 2. Auth
JWT (`authenticate`) หรือ Gateway (`gatewayAuth`) — ระบุชัดว่าใช้แบบไหน

## 3. Database Schema
Collection: `<collection_name>`
Fields:
- field_name: ชนิด — คำอธิบาย

Indexes:
- Unique: { ... }
- Compound (ESR): { ... }

## 4. API Endpoints
### GET /api/v1/<resource> — List
Query params: page, limit, <filter fields>
Response fields: <ระบุเฉพาะที่ต้องการ>

### GET /api/v1/<resource>/:id — Detail

### POST — Create
Business rules: <ถ้ามี เช่น ซ้ำ code ไม่ได้>

### PATCH /:id — Update
Rules: <ระบุ fields ที่ห้ามเปลี่ยน>

### DELETE /:id — Soft Delete

## 5. ENV (ถ้าเพิ่ม)
NEW_VAR=description
```

---

### 4. Prompt AI ให้ Generate

**วิธีที่ 1 — Cursor (แนะนำ)**

1. เปิด `prompt.md` ที่เขียนไว้
2. กด `Cmd+L` (Mac) หรือ `Ctrl+L` (Windows) เปิด Chat
3. พิมพ์:

```
ดู prompt.md แล้ว implement ทั้งหมดตาม agent.md
สร้างไฟล์ครบทุก layer: route, validator, controller, service, repository
รวม index script และ bruno collection
```

**วิธีที่ 2 — Claude Code**

```bash
claude "ดู prompt.md และ agent.md แล้ว implement CRUD module ตาม standard"
```

---

### 5. ตรวจสอบหลัง Generate

AI จะ generate ไฟล์เหล่านี้ให้:

```
src/modules/<module>/
  <module>.route.js
  <module>.validator.js
  <module>.controller.js
  <module>.service.js
  <module>.repository.js

scripts/create-<module>-indexes.js
bruno/<Module>/   (ถ้าขอ)
```

**ก่อน test ต้องทำ:**

```bash
# 1. Wire route ใน app.js (AI ควรทำให้แล้ว — ตรวจดู)
# src/app.js: app.use('/api/v1/<module>', <module>Route);

# 2. รัน index script
npm run db:<module>-indexes

# 3. เพิ่ม script ใน package.json (ถ้ายังไม่มี)
# "db:<module>-indexes": "node scripts/create-<module>-indexes.js"

# 4. รัน dev
npm run dev

# 5. ทดสอบ
curl http://localhost:3000/health
```

---

## Checklist ตรวจ AI Output

ดู Checklist จาก `.cursor/rules/brussels-dev.mdc` ข้อ "Checklist ก่อน Finish" ครบทุกข้อ  
หรือดูฉบับเต็มใน `agent.md` หัวข้อ Quick Reference

**ข้อที่ลืมบ่อย:**

- [ ] ทุก Query มี `ou_id` + `branch_id` + `is_deleted: false` (ผ่าน `tenantFilter()`)
- [ ] Create/Update/Delete อยู่ใน Transaction พร้อม Log
- [ ] ใช้ `serializeDoc()` ก่อน return จาก Repository
- [ ] Route mount ใน `app.js` แล้ว
- [ ] Index script รันแล้ว

---

## สรุปไฟล์ที่ต้อง Copy เข้าโปรเจกต์ใหม่

```
agent.md                          ← Standard ฉบับเต็ม
agent-full.md                     ← Template โค้ด
.cursor/rules/brussels-dev.mdc    ← Cursor Rule (auto-load)
```

ไฟล์ที่เขียนเองต่อโปรเจกต์:

```
prompt-<feature>.md               ← Prompt บอก AI ว่าต้องการ Feature ไหน
```

---

*ดู `prompt-items-crud.md` เป็นตัวอย่าง prompt สมบูรณ์*
