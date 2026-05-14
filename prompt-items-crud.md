# Task: CRUD API — Module `items` (สเปค + โค้ดอ้างอิง)

> **สถานะ:** โปรเจกต์นี้ **implement แล้ว** — ใช้เอกสารนี้คู่กับ `agent.md` เป็นสัญญา API / มาตรฐาน และดูโค้ดจริงที่ `src/modules/items/` และ `src/middlewares/gateway-auth.js`

---

## 0. มาตรฐานบังคับ

อ่าน `agent.md` ให้ครบก่อนเขียนหรือแก้โค้ด  
ทุกอย่างต้องสอดคล้อง `agent.md` (รวมถึงการอัปเดตล่าสุด: health response, `readPreference: primary` สำหรับ transaction, gateway auth หมวด 19.5, `serializeDoc` หมวด 26)

---

## 1. ขอบเขตงาน (Scope)

CRUD สำหรับ resource **`items`** ภายใต้ base path:

```
/api/v1/items
```

ใน `src/app.js`: `app.use('/api/v1/items', itemsRoute);`  
Health แยกที่ root: `GET /health` (ดู `src/modules/health/health.route.js`)

---

## 2. Request Headers (แทน JWT สำหรับโมดูลนี้)

> โมดูล `items` **ไม่ใช้ Bearer JWT** — ใช้ custom headers + `GATEWAY_TOKEN`  
> Middleware: `src/middlewares/gateway-auth.js` (ดูรายละเอียดใน `agent.md` หมวด **19.5**)

| Header | ชนิด | บังคับ | หมายเหตุ |
| --- | --- | --- | --- |
| `x-ou-id` | String (ObjectId 24 hex) | ✅ | tenant → `req.user.ou_id` (string) |
| `x-branch-id` | String (ObjectId 24 hex) | ✅ | tenant → `req.user.branch_id` (string) |
| `x-user-id` | String (ObjectId 24 hex) | ✅ | audit → `cr_by` / `upd_by` / `deleted_by` เป็น `req.user.userId` (string) |
| `x-gateway-token` | String | ✅ | ต้องตรง `process.env.GATEWAY_TOKEN` |

**Logic (`gateway-auth.js`) ตามโค้ดจริง:**

1. `x-gateway-token` !== `GATEWAY_TOKEN` (หรือไม่มี env) → `AppError(401, 'UNAUTHORIZED', 'Invalid gateway token')`
2. `x-ou-id` / `x-branch-id` / `x-user-id` ไม่ครบหรือไม่ใช่ ObjectId 24 hex → `AppError(400, 'INVALID_HEADER', 'Missing required headers')`
3. สำเร็จ → `req.user = { ou_id, branch_id, userId }` (ค่าเป็น string ของ ObjectId)

---

## 3. Database Schema

**Collection:** `items`

```javascript
{
  _id:         ObjectId,
  ou_id:       ObjectId,
  branch_id:   ObjectId,
  code:        String,
  name:        String,
  description: String | null,
  status:      String,          // 'active' | 'inactive'
  tags:        Array<String>,
  is_deleted:  Boolean,
  cr_by:       String,
  cr_date:     Date,
  cr_prog:     String,
  upd_by:      String,
  upd_date:    Date,
  upd_prog:    String,
  deleted_by:      String | null,   // ตอน soft delete
  deleted_date:    Date | null,
  deleted_prog:    String | null,
}
```

**Unique index:** `uk_ou_branch_code` บน `{ ou_id, branch_id, code }`  
**Compound index:** `idx_ou_branch_deleted_status_date` บน `{ ou_id, branch_id, is_deleted, status, cr_date }`

สคริปต์สร้าง index: `scripts/create-items-indexes.js` → `npm run db:items-indexes`

---

## 4. API Endpoints

### 4.1 GET `/api/v1/items` — List

Query: `page`, `limit`, `status`, `code`, `name` (รายละเอียด validation ใน `items.validator.js`)

**Response รายการแต่ละแถว (โค้ดจริง):** `id`, `code`, `name`, `description`, `status`, `tags`, `upd_date` เท่านั้น — ไม่ส่ง `cr_*` ใน list

### 4.2 GET `/api/v1/items/:itemId` — Detail

- พบ: `200` + `code: SUCCESS` + `data` (มี `cr_by`, `cr_date`, `upd_by`, `upd_date`, …)
- ไม่พบ: **`200`** + `code: DATA_NOT_FOUND` + `data: null` (ตาม `items.controller.js`)

### 4.3 POST — Create

- ซ้ำ `code` ภายใต้ tenant เดียวกัน (รวมเอกสารที่ยังมี `code` เดิมใน index) → `409 CONFLICT` ข้อความ `Item code already exists` (รวมกรณี E11000)
- Transaction: insert `items` + `items_logs` (INSERT)
- `cr_prog` / `upd_prog` = `'/api/v1/items'`

### 4.4 PUT — Full replace

- `upd_date` optimistic lock — ไม่ match → `409 CONFLICT` `Data not found or already modified`
- ซ้ำ `code` กับ item อื่น (คนละ `_id`) → `409 CONFLICT` `Item code already exists`
- `upd_prog` = `'/api/v1/items/:itemId'` (สตริงลิเทรัลใน DB ตามมาตรฐาน program name)

### 4.5 PATCH — Partial update

- ไม่อนุญาตเปลี่ยน `code`
- อย่างน้อย 1 field นอกจาก `upd_date` — ไม่ผ่าน Joi / service → `400 INVALID_PARAM` `No fields to update`
- Optimistic lock / log เหมือน PUT

### 4.6 DELETE — Soft delete

- Body: `{ "upd_date": "<ISO>" }`
- ตั้ง `is_deleted`, `deleted_by`, `deleted_date`, `deleted_prog`, และ `upd_*` — `deleted_prog` / `upd_prog` = `'/api/v1/items/:itemId'`

---

## 5. Log Collection (`items_logs`)

ตาม `agent.md` หมวด 14 — **โค้ดจริง:** ทุก log ใส่ `cr_by`, `cr_date`, `cr_prog`

- INSERT: `cr_prog` = `'/api/v1/items'`
- UPDATE / DELETE: `cr_prog` = `'/api/v1/items/:itemId'` (สตริงเดียวกับ `upd_prog` ของเอกสารหลักหลังเขียน)

`changed_fields` สำหรับ PUT/PATCH ตาม field ที่เปลี่ยนจริงใน repository

---

## 6. ENV

```dotenv
GATEWAY_TOKEN=your-internal-gateway-secret
```

รวมถึง `MONGODB_URI`, `DB_NAME`, `PORT` ตาม `agent.md` หมวด 25.3 และ `.env.example` ของ repo

---

## 7. ไฟล์ที่เกี่ยวข้อง (โครงสร้างจริง)

```
src/middlewares/gateway-auth.js
src/modules/items/
  items.route.js
  items.validator.js
  items.controller.js
  items.service.js
  items.repository.js
src/modules/health/health.route.js
src/config/database.js       # readPreference: 'primary' (รองรับ withTransaction)
scripts/create-items-indexes.js
bruno/                       # collection ทดสอบ API — ดู bruno/README.md
```

---

## 8. Checklist (โปรเจกต์อ้างอิง — ใช้ตรวจก่อน commit / PR)

- [x] ทุก endpoint `/api/v1/items` ผ่าน `gatewayAuth`
- [x] Response envelope ตาม `agent.md` หมวด 5
- [x] Validation Joi ใน `items.validator.js` + middleware `validate`
- [x] Tenant + `is_deleted: false` ในทุก read/write ที่เกี่ยวกับรายการที่ยังใช้งาน
- [x] Optimistic locking `upd_date` บน PUT/PATCH/DELETE
- [x] Transaction ครอบ write + `items_logs`
- [x] `changed_fields` บน UPDATE log
- [x] Duplicate key / ซ้ำ code → `409 CONFLICT`
- [x] `cr_prog` / `upd_prog` ตาม naming standard
- [x] Index + สคริปต์ `npm run db:items-indexes`

---

## 9. พฤติกรรมจริงเพิ่มเติม (สรุปจากโค้ด)

| หัวข้อ | ค่า / พฤติกรรม |
|--------|----------------|
| Mongo `readPreference` | `'primary'` ใน `database.js` — multi-doc transaction ไม่รองรับ `primaryPreferred` |
| HTTP เมื่อไม่พบ detail | `200` + `DATA_NOT_FOUND` |
| Conflict optimistic / ไม่พบเอกสาร | HTTP `409`, `code: CONFLICT`, message `Data not found or already modified` |
| Duplicate `code` | HTTP `409`, `code: CONFLICT`, message `Item code already exists` |
| Rate limit | ใช้กับ path ขึ้นต้น `/api/` — health ไม่ถูก rate limit ชุดนี้ |
