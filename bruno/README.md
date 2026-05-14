# Bruno — ทดสอบ Items CRUD

## ก่อนรัน

1. สตาร์ท API: `npm run dev` (ค่าเริ่มต้น `http://localhost:3000`)
2. ใน Bruno เลือก environment **`local`**
3. แก้ **`gatewayToken`** ใน `environments/local.bru` ให้ตรงกับ **`GATEWAY_TOKEN`** ใน `.env` ของโปรเจกต์

ครั้งแรกให้ **Run โฟลเดอร์ `Items`** หรือรัน **create item** อย่างน้อยหนึ่งครั้งก่อน เพื่อให้สคริปต์ตั้งค่า `itemId`, `updDate`, `itemCode` ใน environment (ไฟล์ env ไม่ต้องใส่สามตัวแปรนี้ล่วงหน้า)

## รัน CRUD แบบครบชุด

1. เปิดแผง Bruno → โหลด collection จากโฟลเดอร์ `bruno/`
2. คลิกขวาโฟลเดอร์ **`Items`** → **Run** (หรือรันทีละ request ตามลำดับ `seq`)

ลำดับในโฟลเดอร์:

| seq | Request     | หมายเหตุ |
|-----|-------------|----------|
| 2   | list items  | อ่านรายการ |
| 3   | create item | สร้าง `itemCode` แบบไม่ซ้ำ + `bru.setEnvVar` เก็บ `itemId` / `updDate` / `itemCode` |
| 4   | get item    | ดึงรายละเอียด + อัปเดต `updDate` |
| 5   | put item    | full replace (ใช้ `itemCode` เดิม + `updDate` ล่าสุด) |
| 6   | patch item  | partial update + optimistic lock |
| 7   | delete item | soft delete |

ถ้ารัน **create** คนเดียวแล้วค่อยทด **get/put/patch/delete** ภายหลัง ให้เลือก environment **`local`** อยู่ (ตัวแปรถูกตั้งในเซสชัน Bruno หลังรัน create)

## ถ้าล้มเหลว

- **401** — `gatewayToken` ไม่ตรง `.env`
- **400 INVALID_HEADER** — `ouId` / `branchId` / `userId` ต้องเป็น ObjectId 24 ตัว (hex)
- **409** บน put/patch/delete — รัน **get item** ก่อนเพื่อดึง `updDate` ล่าสุด หรือรันโฟลเดอร์ **Items** ใหม่ตั้งแต่ create
