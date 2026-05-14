# Agent Full — Project Full Templates Reference

> **Tier 2 — โหลดเมื่อต้องการ** | อ่านเมื่อต้องการ Full Code Templates
> Rules & Critical Snippets อยู่ใน `agent-summary.md` (อ่านก่อนเสมอ)
>
> **โหลดเมื่อ:**
> - สร้าง/แก้ไข `database.js`, `logger.js`, `error-handler.js`, `authenticate.js`, `validate.js`
> - สร้าง/แก้ไข `server.js`, `app.js`
> - สร้าง CRUD Module ใหม่ทั้งชุด (route/validator/controller/service/repository)
> - ต้องการ Transaction template หรือ serializeDoc ฉบับเต็ม

---

## 1. Stack & Technology

### 1.1 Core Runtime

| Component | Version | Note |
| --- | --- | --- |
| **Runtime** | Node.js 24.11 LTS | ใช้ ESM (`import`/`export`) เท่านั้น |
| **Database** | MongoDB >= 8.0 | Replica Set Configuration |
| **OS** | Ubuntu 24.04 LTS | Production Environment |
| **Process Manager** | PM2 ^5.4.2 | ใช้คู่กับ `pm2-logrotate` |

### 1.2 Production Dependencies (Pinned)

| Package | Version | Purpose |
| --- | --- | --- |
| `express` | `^4.21.0` | Web Framework |
| `mongodb` | `^6.6.0` | Official MongoDB Driver |
| `jsonwebtoken` | `^9.0.2` | JWT Authentication |
| `joi` | `^17.13.0` | Request Validation |
| `express-rate-limit` | `^7.4.0` | Rate Limiting Middleware |
| `node-cron` | `^3.0.3` | Task Scheduling |
| `dotenv` | `^16.4.5` | Environment Variable Management |
| `pino` | `^9.2.0` | High-performance JSON Logger |
| `pino-pretty` | `^11.0.0` | Pretty Print Logger (Dev only) |
| `dayjs` | `^1.11.13` | Date & Time (+plugins: utc, timezone) |
| `p-limit` | `^5.0.0` | Promise Concurrency Control |
| `fast-json-stable-stringify` | `^2.1.0` | Deterministic JSON stringify |
| `pm2` | `^5.4.2` | Process Manager |
| `pm2-logrotate` | `^2.7.0` | Log Rotation |

### 1.3 Dev Dependencies

| Package | Version | Purpose |
| --- | --- | --- |
| Test Runner | Native `node:test` | ห้ามใช้ Jest/Mocha |
| `eslint` | `^9.12.0` | Linter (New Flat Config) |
| `prettier` | `^3.2.5` | Code Formatter |

### 1.4 Config Standards

- `package.json` ต้องตั้งค่า `"type": "module"` และ `"node": ">=24.11.0"`
- เก็บวันที่ใน DB เป็น **UTC** เสมอ — แปลง Timezone เฉพาะ Presentation Layer
- ใช้ `dayjs.utc()` จัดการเวลาทั้งหมด
- **Update Policy:** Patch/Minor อัปเดตได้ / Major ต้องผ่าน Regression Test และ Tech Lead อนุมัติก่อน

---

## 2. Architecture & Project Structure

### 2.1 4-Layer Pattern (Separation of Concerns)

| Layer | หน้าที่ | กฎ |
| --- | --- | --- |
| **Route** | รับ Request & Routing | ห้ามใส่ Logic ใดๆ, เรียก Middleware ที่นี่ |
| **Controller** | Orchestrator & Response | Validate Input, เรียก Service, ส่ง Response กลับ |
| **Service** | **Business Logic** | ห้ามมี DB Query โดยตรง |
| **Repository** | Data Access (DAL) | ใช้ MongoDB Driver เท่านั้น, ห้ามเรียก Service อื่น |

### 2.2 Folder Structure (`src/`)

```
src/
├── adapters/       # เชื่อมต่อ Third-party API (Line, Payment Gateway)
├── config/         # การตั้งค่าระบบ (Database, Environment)
├── middlewares/    # Auth, Rate Limit, Error Handler
├── modules/        # Feature-Based (รวม 4 Layer ไว้ในโฟลเดอร์เดียว)
│   └── <module>/
│       ├── <module>.route.js
│       ├── <module>.validator.js
│       ├── <module>.controller.js
│       ├── <module>.service.js
│       ├── <module>.repository.js
│       └── tests/unit-test/
├── utils/          # ฟังก์ชันตัวช่วยส่วนกลาง
├── app.js          # Express Instance, Middleware, Routes
└── server.js       # Entry Point (Bootstrap DB → Listen Port)
```

### 2.3 Naming Rules

- **Folders & Files:** `kebab-case` ทั้งหมด
- **File Suffix:** ต้องมีคำระบุประเภทเสมอ — `.controller.js`, `.service.js`, `.repository.js`, `.validator.js`, `.route.js`

### 2.4 Entry Points

| ไฟล์ | บทบาท |
| --- | --- |
| `server.js` | Bootstrap: เชื่อมต่อ DB → Start Server (listen) |
| `app.js` | Config: สร้าง Express Instance, ติดตั้ง Middleware, เชื่อมต่อ Routes |

### 2.5 Standard npm Scripts

| Command | หน้าที่ |
| --- | --- |
| `npm run dev` | รันในโหมด Watch |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run test` | รัน Test ทั้งหมด |
| `npm run test:unit` | Unit Test |
| `npm run test:integration` | Integration Test |
| `npm run audit:check` | ตรวจสอบ Security ของ Dependencies |
| `npm run structure:check` | ตรวจสอบโครงสร้างไฟล์ |
| `npm run routes:check` | ตรวจสอบ URL Naming |
| `npm run db:check` | ตรวจสอบมาตรฐาน Database |

---

## 3. Code Style Standard

### 3.1 Naming Convention

| ประเภท | รูปแบบ | ใช้กับ |
| --- | --- | --- |
| `camelCase` | `findProducts` | Variable, Function |
| `PascalCase` | `ProductService` | Class, Interface |
| `snake_case` | `product_name`, `ou_id` | **Database Field**, **JSON API** |
| `UPPER_SNAKE_CASE` | `MAX_LIMIT` | Constants |
| `kebab-case` | `bank-accounts` | Folder, File, URL Path |

### 3.2 Code Rules (Summary)

- ใช้ `const`/`let` เท่านั้น, `async/await` เท่านั้น, `===` เท่านั้น
- ห้ามใช้ `console.log` — ใช้ `pino` Logger แทน
- 1 Function ทำ 1 สิ่ง, Guard Clauses (Early Return), ห้ามซ้อน if/else

### 3.3 Middleware Rules

- **Do:** Auth, Logging, Header/Body Parser, Rate Limiting เท่านั้น
- **Don't:** ห้ามนำ Business Logic หรือ DB Query ขนาดใหญ่มาไว้ใน Middleware

---

## 4. API Routing & Naming Standard

### 4.1 Naming Rules

- **Noun + Plural:** ใช้คำนามพหูพจน์เสมอ — `/users`, `/bank-accounts`
- **kebab-case:** URL Path ตัวพิมพ์เล็กคั่นขีดกลาง
- **Versioning Required:** ต้องระบุ `/api/v1/...` เสมอ
- **HTTP Methods แทนกริยา:** `GET`=Read, `POST`=Create, `PUT`=Replace, `PATCH`=Update, `DELETE`=Delete
- **Minimal Nesting:** ซ้อนไม่เกิน 2 ระดับ — `/bank-accounts/:id/slips`
- **Custom Actions:** ต่อท้าย Resource — `POST /slips/:id/verify`
- **Query Params:** สำหรับ Filter/Sort/Pagination เท่านั้น

### 4.2 Mandatory Health Check

ทุก Service **ต้องมี** `GET /health`:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-03-30T03:31:51Z",
    "uptime": 1234
  }
}
```

---

## 5. API Response Standard

### 5.1 HTTP Status Codes & Result Codes

> **กฎเหล็ก:** ใช้ HTTP Status จริงเสมอ — `code` ใน Body ต้องเป็น `UPPER_SNAKE_CASE`

| HTTP | Code | Meaning |
| --- | --- | --- |
| 200 | `SUCCESS` | สำเร็จ |
| 200 | `DATA_NOT_FOUND` | ค้นหาสำเร็จแต่ไม่มีข้อมูล |
| 400 | `INVALID_PARAM` | พารามิเตอร์ไม่ถูกต้อง |
| 400 | `INVALID_HEADER` | Header Content-Type ไม่ถูกต้อง |
| 401 | `UNAUTHORIZED` | ไม่มีสิทธิ์ |
| 401 | `TOKEN_EXPIRED` | Access Token หมดอายุ |
| 403 | `MISSING_ORIGIN` | ไม่มี Origin Header |
| 403 | `MISSING_AUTHORIZATION` | ไม่มี Authorization Header |
| 403 | `MISSING_CONTENT_TYPE` | ไม่มี Content-Type Header |
| 405 | `METHOD_NOT_ALLOWED` | Method ไม่รองรับ |
| 409 | `CONFLICT` | ข้อมูลซ้ำ/ขัดแย้ง |
| 426 | `REQUEST_NOT_SECURE` | Request ไม่ปลอดภัย |
| 429 | `TOO_MANY_REQUESTS` | เรียกถี่เกินไป |
| 500 | `INTERNAL_ERROR` | Server Error |

### 5.2 Response Structure

**ลำดับฟิลด์:** `success` → `code` → `message` → `data` → (`pagination` หรือ `requestId`)

```json
// Success (Single Object)
{ "success": true, "code": "SUCCESS", "message": null, "data": { ... } }

// Success (List + Pagination)
{
  "success": true, "code": "SUCCESS", "message": null,
  "data": [...],
  "pagination": { "page": 1, "limit": 20, "total": 150, "totalPages": 8 }
}

// Error
{ "success": false, "code": "INVALID_PARAM", "message": "...", "data": null, "requestId": "uuid-xxx" }
```

### 5.3 Data Type Rules

| ประเภท | กฎ |
| --- | --- |
| **DateTime** | ส่งเป็น ISO 8601 String เสมอ — `"2026-12-31T23:59:59.000Z"` |
| **ค่าว่าง** | ส่งเป็น `null` — ห้ามตัด Key ทิ้งหรือส่ง `""` |
| **Boolean** | `true`/`false` — ห้ามใช้ `"true"`, `1`, `0` |
| **IDs** | ส่งเป็น `String` เสมอ |
| **ค่าเงิน** | บังคับส่งเป็น `String` เสมอ — ป้องกัน Floating-point Error |

---

## 6. API Validation Standard

- ใช้ **Joi** เป็น Validation Library มาตรฐาน
- ชื่อไฟล์: `<module>.validator.js` ใน `src/modules/<module-name>/`

```javascript
// MongoDB ObjectId pattern (project-standard)
const objectId = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .messages({ 'string.pattern.base': 'Invalid MongoDB ObjectId format' });
```

---

## 7. API Rate Limit Standard

### 7.1 Default Limits

| ประเภท | windowMs | Max Requests | หมายเหตุ |
| --- | --- | --- | --- |
| **General API** | 1 นาที | 100 | Authenticated endpoints |
| **Auth Endpoints** | 15 นาที | 5–10 | Login, Register (นับเฉพาะที่ล้มเหลว) |

### 7.2 Implementation Rules

- **Status Code:** คืน `429 Too Many Requests` — `code: "TOO_MANY_REQUESTS"`
- **Headers:** `standardHeaders: true`, `legacyHeaders: false`
- **Auth Strict:** `skipSuccessfulRequests: true`
- **Trust Proxy:** `app.set('trust proxy', 1)` ถ้าอยู่หลัง Load Balancer

---

## 8. Query Parameter Standard

### 8.1 Pagination Defaults

| Parameter | Default | Limit | Auto-Correction |
| --- | --- | --- | --- |
| `page` | `1` | Min: 1 | < 1 → ปรับเป็น `1` |
| `limit` | `10` | Max: 100 | > 100 → ปรับเป็น `100` |

---

## 9. MongoDB Connection Standard

### 9.1 Core Rules

- **ห้ามใช้ Mongoose** — ใช้ `mongodb` driver (`^6.x.x`) เท่านั้น
- **ห้าม Hardcode URI** — ต้องอ่านจาก `process.env.MONGODB_URI` และ `process.env.DB_NAME`
- **Replica Set:** ระบุทุกโหนดใน URI — `mongodb://host1:27017,host2:27017,...`
- **Singleton Pattern:** ใช้ไฟล์ `src/config/database.js` เป็นจุดเชื่อมต่อกลาง

### 9.2 Read Preference

| Preference | ใช้กับ |
| --- | --- |
| `primaryPreferred` | Core Services (Default) |
| `primary` | ธุรกรรมการเงิน, การตัดเครดิต |
| `secondary` / `secondaryPreferred` | Report, Read-only Data |

### 9.3 Connection Template (`src/config/database.js`)

```javascript
import { MongoClient } from 'mongodb';

const DB_OPTIONS = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  writeConcern: { w: 'majority', j: true, wtimeoutMS: 5000 },
  readPreference: 'primaryPreferred',
};

let client = null;
let db = null;

export async function connectDatabase() {
  if (db) return db;
  if (!process.env.MONGODB_URI || !process.env.DB_NAME) {
    throw new Error('[Database] Missing MONGODB_URI or DB_NAME config.');
  }
  client = new MongoClient(process.env.MONGODB_URI, DB_OPTIONS);
  await client.connect();
  db = client.db(process.env.DB_NAME);
  return db;
}

export function getDatabase() {
  if (!db) throw new Error('[Database] Call connectDatabase() first.');
  return db;
}

export function getClient() {
  if (!client) throw new Error('[Database] Call connectDatabase() first.');
  return client;
}

export async function closeDatabase() {
  if (client) { await client.close(); client = null; db = null; }
}
```

---

## 10. MongoDB Design Standard

### 10.1 Naming Convention

| องค์ประกอบ | รูปแบบ | ตัวอย่าง |
| --- | --- | --- |
| **Database** | `snake_case` | `inventory_management_db` |
| **Collection** | `snake_case` | `su_agent_whitelist`, `users` |
| **Field** | `snake_case` | `first_name`, `is_active`, `cr_date` |
| **Index ทั่วไป** | `idx_[fields]` | `idx_user_id_status` |
| **Unique Index** | `uk_[fields]` | `uk_email`, `uk_username` |
| **TTL Index** | `ttl_[fields]` | `ttl_exp_date`, `ttl_cr_date` |

### 10.2 Data Types

| ประเภท | ชนิด | กฎ |
| --- | --- | --- |
| ID / Reference | `ObjectId` | ห้ามใช้ String เก็บ ID |
| Date / Time | `Date` (ISODate UTC) | บังคับ UTC |
| Currency | `Decimal128` | ห้ามใช้ Double |
| Boolean | `true` / `false` | ห้ามใช้ 0/1 หรือ Y/N |
| Enum / Status | `String` | ใช้คำเต็ม เช่น `active`, `pending` |

---

## 11. MongoDB Index Standard

### 11.1 ESR Rule (Compound Index)

เรียงลำดับ Field ตาม **Equality → Sort → Range** เสมอ:

```javascript
// E=user_id (Equality), S=cr_date (Sort), R=total_amount (Range)
db.collection('orders').createIndex(
  { user_id: 1, cr_date: -1, total_amount: 1 },
  { name: 'idx_user_id_cr_date_total' }
);
```

### 11.2 Index Types

- **Unique:** `{ unique: true }` — ชื่อขึ้นต้น `uk_`
- **TTL (ลบเมื่อ field ถึงเวลา):** `{ expireAfterSeconds: 0 }` — ชื่อขึ้นต้น `ttl_`
- **TTL (ลบหลัง N วินาที):** `{ expireAfterSeconds: 86400 }`

### 11.3 Covered Query & Aggregate

- Index ต้องครอบคลุมทุกฟิลด์ใน `find()` และ `project()` — ใส่ `_id: 0` ถ้าไม่ได้ Index บน `_id`
- **$lookup:** บังคับมี Index ที่ `foreignField`
- **$group:** ต้องผ่าน `$match` (พร้อม Index) ก่อนเสมอ

---

## 12. MongoDB Query Standard

### 12.1 Tenant Isolation (กฎเหล็ก)

**ทุก Query (Read/Write/Aggregate) บังคับระบุ `ou_id` และ `branch_id` เป็นเงื่อนไขแรกเสมอ**

```javascript
// Find
const users = await db.collection('users').find({
  ou_id: currentOuId,
  branch_id: currentBranchId,
  status: 'active'
}).toArray();

// Aggregate — $match แรกต้องมี ou_id และ branch_id
const summary = await db.collection('orders').aggregate([
  { $match: { ou_id: currentOuId, branch_id: currentBranchId, status: 'completed' } },
  { $group: { _id: '$payment_method', total: { $sum: '$amount' } } }
]).toArray();
```

### 12.2 Query Rules

- **ESR Order:** เรียง Condition: Equality → Sort → Range
- **Projection:** ดึงเฉพาะ Field ที่ใช้ — ห้าม Over-fetching
- **Detail:** ใช้ `findOne()` เสมอ — ห้ามใช้ `find().toArray()[0]`

---

## 13. Data Domain Standard

### 13.1 Data Scoping

**ทุก Query บังคับระบุ `ou_id` และ `branch_id`** เพื่อป้องกัน Data Leakage ข้ามสาขา

### 13.2 Audit Fields

**เมื่อ CREATE:** ตั้งค่าทั้ง `cr_` และ `upd_` ให้เท่ากัน:

```javascript
const now = new Date();
const payload = {
  ...data,
  cr_by: username,
  cr_date: now,
  cr_prog: '/api/v1/user/signup',
  upd_by: username,      // ⬅️ ต้อง Set ด้วย (Optimistic Locking)
  upd_date: now,
  upd_prog: '/api/v1/user/signup'
};
```

**เมื่อ UPDATE:** อัปเดตชุด `upd_` เสมอ:

```javascript
const updatePayload = {
  ...newData,
  upd_by: username,
  upd_date: new Date(),
  upd_prog: '/api/v1/user/profile'
};
```

### 13.3 Optimistic Locking

**บังคับใช้ `upd_date` ของข้อมูลเดิมเป็นเงื่อนไขตรวจสอบ Version ทุกครั้งที่ UPDATE:**

```javascript
const result = await db.collection('products').updateOne(
  {
    _id: new ObjectId(id),
    upd_date: original_upd_date // ⬅️ เช็ค Version ป้องกัน Concurrent Update
  },
  { $set: updatePayload }
);

if (result.matchedCount === 0) {
  throw new Error('Data has been modified by another user. Please refresh and try again.');
}
```

---

## 14. Log Setting Standard

### 14.1 Data Scoping

ทุก Log Document บังคับมี `ou_id`, `branch_id`, และ `ref_id` (อ้างอิงเอกสารต้นทาง)

### 14.2 Action Types & Snapshot

แบ่งเป็น 3 Actions: `INSERT`, `UPDATE`, `DELETE`

**INSERT:**
```javascript
{
  ref_id: new ObjectId(original_id),
  ou_id: new ObjectId(ou_id),
  branch_id: new ObjectId(branch_id),
  action: 'INSERT',
  request_id: 'uuid-xxxx',
  changed_fields: null,
  snapshot_data: { old: null, new: { /* ข้อมูลทั้งหมดที่ถูกสร้าง */ } },
  cr_by: 'username', cr_date: new Date(), cr_prog: '/api/v1/items'
}
```

**UPDATE:**
```javascript
{
  action: 'UPDATE',
  changed_fields: { desc: { old: 'test', new: 'new test' } },
  snapshot_data: { old: { /* Object เต็มก่อนแก้ไข */ }, new: { /* Object เต็มหลังแก้ไข */ } }
}
```

**DELETE:**
```javascript
{
  action: 'DELETE',
  changed_fields: null,
  snapshot_data: { old: { /* Object เต็มก่อนลบ */ }, new: null }
}
```

---

## 15. Program Naming Standard (`cr_prog` / `upd_prog`)

| ช่องทาง | Format | ตัวอย่าง |
| --- | --- | --- |
| **RESTful API** | API Path เต็ม | `/api/v1/bank-accounts` |
| **Scheduled Job / Cron** | `kebab-case` Job Name | `daily-sales-report`, `calculate-commission` |

---

## 16. Global Error Handler

### 16.1 Custom Error Class (`src/utils/app-error.js`)

```javascript
export class AppError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

// ตัวอย่างการ throw
throw new AppError(400, 'INVALID_PARAM', 'amount must be greater than 0');
throw new AppError(404, 'DATA_NOT_FOUND', 'User not found');
throw new AppError(409, 'CONFLICT', 'Email already exists');
```

### 16.2 Error Handler Middleware (`src/middlewares/error-handler.js`)

```javascript
import { logger } from '../config/logger.js';

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode ?? 500;
  const code = err.code ?? 'INTERNAL_ERROR';
  const message = err.message ?? 'Internal server error';

  logger.error({ requestId: req.requestId, code, message, stack: err.stack });

  return res.status(statusCode).json({
    success: false, code, message, data: null, requestId: req.requestId,
  });
}
```

### 16.3 Pattern ใช้งานใน Controller

```javascript
// ✅ Correct — โยน error ผ่าน next()
export async function createUser(req, res, next) {
  try {
    const result = await userService.create(req.body);
    return res.status(200).json({ success: true, code: 'SUCCESS', data: result });
  } catch (err) {
    next(err); // ส่งให้ errorHandler จัดการ
  }
}
```

---

## 17. Request ID Middleware (`src/middlewares/request-id.js`)

```javascript
import { randomUUID } from 'crypto';

export function requestId(req, res, next) {
  req.requestId = req.headers['x-request-id'] ?? randomUUID();
  res.setHeader('x-request-id', req.requestId);
  next();
}
```

> วางเป็น Middleware **ลำดับแรกสุด** ใน `app.js` — `app.use(requestId);`

---

## 18. Authentication Flow

### 18.1 Auth Middleware (`src/middlewares/authenticate.js`)

```javascript
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/app-error.js';

export function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return next(new AppError(403, 'MISSING_AUTHORIZATION', 'Missing Authorization header'));
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return next(new AppError(401, 'UNAUTHORIZED', 'Invalid token format'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, username, ou_id, branch_id, ... }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError(401, 'TOKEN_EXPIRED', 'Access token is expired'));
    }
    return next(new AppError(401, 'UNAUTHORIZED', 'Invalid token'));
  }
}
```

### 18.2 การดึงข้อมูล User Context

```javascript
// Controller ส่งต่อ user context ให้ Service
export async function createUser(req, res, next) {
  try {
    const result = await userService.create(req.body, req.user);
    return res.status(200).json({ success: true, code: 'SUCCESS', data: result });
  } catch (err) { next(err); }
}

// Service รับ userContext — ดึง ou_id, branch_id, username
async function create(data, userContext) {
  const { username, ou_id, branch_id } = userContext;
  // ใช้ ou_id, branch_id สำหรับ Tenant Isolation
  // ใช้ username สำหรับ cr_by / upd_by
}
```

---

## 19. Soft Delete Standard

### 19.1 Fields มาตรฐาน

| Field | Type | ค่าเริ่มต้น | ความหมาย |
| --- | --- | --- | --- |
| `is_deleted` | `Boolean` | `false` | true = ถูก Soft Delete |
| `deleted_by` | `String` | `null` | username ที่ลบ |
| `deleted_date` | `Date` | `null` | เวลาที่ลบ |
| `deleted_prog` | `String` | `null` | Endpoint/Job ที่ลบ |

### 19.2 การ Soft Delete ใน Repository

```javascript
async function softDelete(id, original_upd_date, userContext) {
  const { username, ou_id, branch_id } = userContext;
  const now = new Date();

  const result = await db.collection('products').updateOne(
    {
      _id: new ObjectId(id),
      ou_id: new ObjectId(ou_id),
      branch_id: new ObjectId(branch_id),
      is_deleted: false,
      upd_date: original_upd_date, // Optimistic Locking
    },
    {
      $set: {
        is_deleted: true,
        deleted_by: username, deleted_date: now, deleted_prog: '/api/v1/products',
        upd_by: username, upd_date: now, upd_prog: '/api/v1/products',
      },
    },
  );

  if (result.matchedCount === 0) {
    throw new AppError(409, 'CONFLICT', 'Data not found or already modified');
  }
}
```

### 19.3 กฎการ Query

```javascript
// ✅ ต้องใส่ is_deleted: false ทุก Query
const products = await db.collection('products').find({
  ou_id: new ObjectId(ou_id),
  branch_id: new ObjectId(branch_id),
  is_deleted: false,  // ⬅️ บังคับเสมอ
  status: 'active',
}).toArray();
```

### 19.4 Index สำหรับ Soft Delete

```javascript
db.collection('products').createIndex(
  { ou_id: 1, branch_id: 1, is_deleted: 1, status: 1, cr_date: -1 },
  { name: 'idx_ou_branch_deleted_status_date' },
);
```

---

## 20. Logger Config (`src/config/logger.js`)

```javascript
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  ...(process.env.NODE_ENV !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' },
    },
  }),
});
```

| Level | ใช้กับ |
| --- | --- |
| `info` | การทำงานปกติ, request เข้า/ออก |
| `debug` | ข้อมูล verbose สำหรับ debug |
| `error` | Exception ที่เกิดขึ้น |
| `warn` | สถานการณ์ผิดปกติแต่ยังทำงานได้ |

---

## 21. Validate Middleware (`src/middlewares/validate.js`)

```javascript
import { AppError } from '../utils/app-error.js';

export function validate(schema, target = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[target], {
      abortEarly: false,   // รวม error ทุกช่องก่อน throw
      allowUnknown: false, // ห้ามส่ง field ที่ไม่ได้ define ใน schema
      stripUnknown: true,  // ตัด field ที่ไม่รู้จักออกอัตโนมัติ
    });

    if (error) {
      const message = error.details.map((d) => d.message).join(', ');
      return next(new AppError(400, 'INVALID_PARAM', message));
    }

    req[target] = value;
    next();
  };
}
```

---

## 22. MongoDB Transaction Standard

### 22.1 เมื่อไหร่ต้องใช้ Transaction

ใช้เมื่อมี **2 operations ขึ้นไป** ที่ต้องสำเร็จหรือล้มเหลวพร้อมกัน:
- เขียนข้อมูลหลัก + บันทึก Log ในคราวเดียวกัน
- โอนเงิน (หัก A + เพิ่ม B)
- สร้างเอกสารหลัก + เอกสารย่อยหลายตัว

### 22.2 Transaction Template

```javascript
import { getClient } from '../../config/database.js';

async function createWithLog(data, userContext) {
  const client = getClient();
  const session = client.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      const db = client.db(process.env.DB_NAME);
      const now = new Date();

      const payload = {
        ...data,
        ou_id: new ObjectId(userContext.ou_id),
        branch_id: new ObjectId(userContext.branch_id),
        is_deleted: false,
        cr_by: userContext.username, cr_date: now, cr_prog: '/api/v1/products',
        upd_by: userContext.username, upd_date: now, upd_prog: '/api/v1/products',
      };

      const { insertedId } = await db.collection('products').insertOne(payload, { session });
      result = { _id: insertedId.toString(), ...data };

      await db.collection('products_logs').insertOne(
        {
          ref_id: insertedId,
          ou_id: new ObjectId(userContext.ou_id),
          branch_id: new ObjectId(userContext.branch_id),
          action: 'INSERT', changed_fields: null,
          snapshot_data: { old: null, new: payload },
          cr_by: userContext.username, cr_date: now, cr_prog: '/api/v1/products',
        },
        { session },
      );
    });

    return result;
  } finally {
    await session.endSession();
  }
}
```

---

## 23. CRUD Boilerplate (ตัวอย่างครบวงจร)

ตัวอย่าง Module `products` — ใช้เป็นแม่แบบสำหรับทุก Module

---

### 23.1 Route (`products.route.js`)

```javascript
import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { validate } from '../../middlewares/validate.js';
import * as controller from './products.controller.js';
import { createSchema, updateSchema, listSchema } from './products.validator.js';

const router = Router();

router.get('/',       authenticate, validate(listSchema, 'query'), controller.list);
router.get('/:id',    authenticate,                                controller.detail);
router.post('/',      authenticate, validate(createSchema),        controller.create);
router.patch('/:id',  authenticate, validate(updateSchema),        controller.update);
router.delete('/:id', authenticate,                                controller.remove);

export default router;
```

---

### 23.2 Validator (`products.validator.js`)

```javascript
import Joi from 'joi';

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid MongoDB ObjectId format',
});

export const listSchema = Joi.object({
  page:   Joi.number().min(1).default(1),
  limit:  Joi.number().min(1).max(100).default(10),
  status: Joi.string().valid('active', 'inactive'),
});

export const createSchema = Joi.object({
  name:   Joi.string().min(1).max(200).required(),
  price:  Joi.number().min(0).required(),
  status: Joi.string().valid('active', 'inactive').default('active'),
});

export const updateSchema = Joi.object({
  name:     Joi.string().min(1).max(200),
  price:    Joi.number().min(0),
  status:   Joi.string().valid('active', 'inactive'),
  upd_date: Joi.date().iso().required(), // ⬅️ Optimistic Locking
}).min(2);
```

---

### 23.3 Controller (`products.controller.js`)

```javascript
import * as service from './products.service.js';

export async function list(req, res, next) {
  try {
    const result = await service.list(req.query, req.user);
    return res.status(200).json({
      success: true, code: 'SUCCESS', message: null,
      data: result.data, pagination: result.pagination,
    });
  } catch (err) { next(err); }
}

export async function detail(req, res, next) {
  try {
    const result = await service.findById(req.params.id, req.user);
    const code = result ? 'SUCCESS' : 'DATA_NOT_FOUND';
    return res.status(200).json({ success: true, code, message: null, data: result });
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    const result = await service.create(req.body, req.user);
    return res.status(200).json({ success: true, code: 'SUCCESS', message: null, data: result });
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    const result = await service.update(req.params.id, req.body, req.user);
    return res.status(200).json({ success: true, code: 'SUCCESS', message: null, data: result });
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    const { upd_date } = req.body;
    await service.softDelete(req.params.id, upd_date, req.user);
    return res.status(200).json({ success: true, code: 'SUCCESS', message: null, data: null });
  } catch (err) { next(err); }
}
```

---

### 23.4 Service (`products.service.js`)

```javascript
import * as repo from './products.repository.js';
import { AppError } from '../../utils/app-error.js';

export async function list(query, userContext) {
  let { page = 1, limit = 10 } = query;
  page  = Math.max(1, parseInt(page));
  limit = Math.min(100, Math.max(1, parseInt(limit)));
  return repo.findAll({ ...query, page, limit }, userContext);
}

export async function findById(id, userContext) {
  return repo.findById(id, userContext);
}

export async function create(data, userContext) {
  return repo.create(data, userContext);
}

export async function update(id, data, userContext) {
  const { upd_date, ...updateData } = data;
  if (!Object.keys(updateData).length) {
    throw new AppError(400, 'INVALID_PARAM', 'No fields to update');
  }
  return repo.update(id, new Date(upd_date), updateData, userContext);
}

export async function softDelete(id, upd_date, userContext) {
  if (!upd_date) throw new AppError(400, 'INVALID_PARAM', 'upd_date is required');
  return repo.softDelete(id, new Date(upd_date), userContext);
}
```

---

### 23.5 Repository (`products.repository.js`)

```javascript
import { ObjectId, Decimal128 } from 'mongodb';
import { getDatabase, getClient } from '../../config/database.js';
import { AppError } from '../../utils/app-error.js';
import { serializeDoc } from '../../utils/format.js';

function col() { return getDatabase().collection('products'); }

function tenantFilter(userContext) {
  return {
    ou_id:      new ObjectId(userContext.ou_id),
    branch_id:  new ObjectId(userContext.branch_id),
    is_deleted: false,
  };
}

// LIST
export async function findAll({ page, limit, status }, userContext) {
  const filter = { ...tenantFilter(userContext), ...(status && { status }) };

  const [data, total] = await Promise.all([
    col()
      .find(filter, { projection: { name: 1, price: 1, status: 1, _id: 1 } })
      .sort({ cr_date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
    col().countDocuments(filter),
  ]);

  return {
    data: data.map((d) => ({ id: d._id.toString(), ...serializeDoc(d) })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

// DETAIL
export async function findById(id, userContext) {
  const doc = await col().findOne(
    { _id: new ObjectId(id), ...tenantFilter(userContext) },
    { projection: { name: 1, price: 1, status: 1, upd_date: 1 } },
  );
  if (!doc) return null;
  return { id: doc._id.toString(), ...serializeDoc(doc) };
}

// CREATE (with Transaction + Log)
export async function create(data, userContext) {
  const client = getClient();
  const session = client.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const db = getDatabase();
      const now = new Date();
      const payload = {
        ...data,
        price: Decimal128.fromString(String(data.price)), // ✅ แปลงค่าเงิน → Decimal128
        ...tenantFilter(userContext),
        cr_by: userContext.username, cr_date: now, cr_prog: '/api/v1/products',
        upd_by: userContext.username, upd_date: now, upd_prog: '/api/v1/products',
      };
      const { insertedId } = await db.collection('products').insertOne(payload, { session });
      await db.collection('products_logs').insertOne({
        ref_id: insertedId,
        ou_id: payload.ou_id, branch_id: payload.branch_id,
        action: 'INSERT', changed_fields: null,
        snapshot_data: { old: null, new: payload },
        cr_by: userContext.username, cr_date: now, cr_prog: '/api/v1/products',
      }, { session });
      result = { id: insertedId.toString(), ...data };
    });
    return result;
  } finally {
    await session.endSession();
  }
}

// UPDATE (with Transaction + Optimistic Locking + Log)
export async function update(id, original_upd_date, updateData, userContext) {
  const client = getClient();
  const session = client.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const db = getDatabase();
      const now = new Date();
      const filter = { _id: new ObjectId(id), ...tenantFilter(userContext), upd_date: original_upd_date };
      const oldDoc = await db.collection('products').findOne(filter, { session });
      if (!oldDoc) throw new AppError(409, 'CONFLICT', 'Data not found or already modified');

      const setPayload = { ...updateData, upd_by: userContext.username, upd_date: now, upd_prog: '/api/v1/products' };
      await db.collection('products').updateOne(filter, { $set: setPayload }, { session });

      const changedFields = Object.fromEntries(
        Object.entries(updateData).map(([k, v]) => [k, { old: oldDoc[k], new: v }]),
      );
      await db.collection('products_logs').insertOne({
        ref_id: oldDoc._id,
        ou_id: oldDoc.ou_id, branch_id: oldDoc.branch_id,
        action: 'UPDATE', changed_fields: changedFields,
        snapshot_data: { old: oldDoc, new: { ...oldDoc, ...setPayload } },
        cr_by: userContext.username, cr_date: now, cr_prog: '/api/v1/products',
      }, { session });
      result = { id };
    });
    return result;
  } finally {
    await session.endSession();
  }
}

// SOFT DELETE (with Transaction + Log)
export async function softDelete(id, original_upd_date, userContext) {
  const client = getClient();
  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      const db = getDatabase();
      const now = new Date();
      const filter = { _id: new ObjectId(id), ...tenantFilter(userContext), upd_date: original_upd_date };
      const oldDoc = await db.collection('products').findOne(filter, { session });
      if (!oldDoc) throw new AppError(409, 'CONFLICT', 'Data not found or already modified');

      const setPayload = {
        is_deleted: true,
        deleted_by: userContext.username, deleted_date: now, deleted_prog: '/api/v1/products',
        upd_by: userContext.username, upd_date: now, upd_prog: '/api/v1/products',
      };
      await db.collection('products').updateOne({ _id: oldDoc._id }, { $set: setPayload }, { session });
      await db.collection('products_logs').insertOne({
        ref_id: oldDoc._id,
        ou_id: oldDoc.ou_id, branch_id: oldDoc.branch_id,
        action: 'DELETE', changed_fields: null,
        snapshot_data: { old: oldDoc, new: null },
        cr_by: userContext.username, cr_date: now, cr_prog: '/api/v1/products',
      }, { session });
    });
  } finally {
    await session.endSession();
  }
}
```

---

## 24. Application Boilerplate

### 24.1 `src/server.js`

```javascript
import 'dotenv/config';
import { connectDatabase } from './config/database.js';
import { logger } from './config/logger.js';
import app from './app.js';

const PORT = process.env.PORT ?? 3000;

async function bootstrap() {
  await connectDatabase();
  logger.info('[Database] Connected successfully');
  app.listen(PORT, () => {
    logger.info(`[Server] Running on port ${PORT} | ENV: ${process.env.NODE_ENV}`);
  });
}

bootstrap().catch((err) => {
  logger.error({ err }, '[Server] Failed to start');
  process.exit(1);
});
```

---

### 24.2 `src/app.js` — Middleware Order (ห้ามสลับ)

```javascript
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { requestId } from './middlewares/request-id.js';
import { errorHandler } from './middlewares/error-handler.js';
import healthRoute from './modules/health/health.route.js';
import productsRoute from './modules/products/products.route.js';

const app = express();

// 1. Request ID — ต้องเป็นลำดับแรกสุดเสมอ
app.use(requestId);

// 2. Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Trust Proxy
app.set('trust proxy', 1);

// 4. Rate Limit
app.use('/api/', rateLimit({
  windowMs: 60 * 1000, max: 100,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, code: 'TOO_MANY_REQUESTS', message: 'Too many requests, please try again later.', data: null },
}));

// 5. Routes
app.use('/health', healthRoute);
app.use('/api/v1/products', productsRoute);

// 6. 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false, code: 'METHOD_NOT_ALLOWED',
    message: `Cannot ${req.method} ${req.originalUrl}`, data: null, requestId: req.requestId,
  });
});

// 7. Global Error Handler — ต้องอยู่สุดท้ายเสมอ
app.use(errorHandler);

export default app;
```

---

## 25. Decimal128 → String Conversion (`src/utils/format.js`)

```javascript
import { Decimal128 } from 'mongodb';

/**
 * แปลง Decimal128 → String และ Date → ISO 8601 ก่อนส่ง Response
 * ใช้ใน Repository ตอน map ผลลัพธ์จาก DB
 */
export function serializeDoc(doc) {
  if (!doc) return null;

  const result = {};
  for (const [key, value] of Object.entries(doc)) {
    if (key === '_id') continue;
    if (value instanceof Decimal128) {
      result[key] = value.toString();       // ✅ Decimal128 → String
    } else if (value instanceof Date) {
      result[key] = value.toISOString();    // ✅ Date → ISO 8601
    } else {
      result[key] = value;
    }
  }
  return result;
}
```

> `Decimal128.fromString(String(data.price))` — แปลงก่อนเก็บลง DB เสมอ

---

## Quick Reference — กฎเหล็กสรุป

| # | กฎ | รายละเอียด |
| --- | --- | --- |
| 1 | **Tenant Isolation** | ทุก Query ต้องมี `ou_id` + `branch_id` |
| 2 | **Optimistic Locking** | ทุก Update ต้องเช็ค `upd_date` เดิม |
| 3 | **Audit Fields** | ทุก Create/Update ต้องมี `cr_*` / `upd_*` ครบทั้งชุด |
| 4 | **No Mongoose** | ใช้ `mongodb` driver เท่านั้น |
| 5 | **No Hardcode** | URI, Credentials ต้องอ่านจาก ENV เสมอ |
| 6 | **Real HTTP Status** | ห้ามส่ง 200 แต่ Code เป็น Error |
| 7 | **ISO 8601 DateTime** | ส่งวันที่เป็น String UTC เสมอ |
| 8 | **Money as String** | ค่าเงินส่งเป็น String ป้องกัน Float Error |
| 9 | **findOne for Detail** | ห้ามใช้ `find().toArray()[0]` |
| 10 | **ESR Index Order** | Equality → Sort → Range เสมอ |
| 11 | **Global Error Handler** | ทุก error ต้อง `next(err)` — ห้าม res.json() เองใน Controller |
| 12 | **Request ID** | ทุก Request ต้องมี `requestId` — ใส่ใน Error Response และ Log เสมอ |
| 13 | **Auth Middleware** | decode JWT ใน Middleware เท่านั้น — attach `req.user` ให้ Controller |
| 14 | **Soft Delete** | ใช้ `is_deleted: false` — ทุก Query ต้องกรอง `is_deleted` เสมอ |
| 15 | **Transaction** | Create/Update/Delete + Log ต้องอยู่ใน Transaction เดียวกัน |
| 16 | **CRUD Pattern** | Route → Validator → Controller → Service → Repository เสมอ |
| 17 | **Validate Middleware** | ใช้ `validate(schema)` ใน Route — ห้าม validate เองใน Controller |
| 18 | **Logger** | ใช้ `pino` เท่านั้น — `info` ปกติ, `error` exception, `debug` verbose |
| 19 | **Middleware Order** | requestId → bodyPa