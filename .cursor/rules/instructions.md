# Bruno + Cursor (โปรเจกต์นี้)

อ้างอิงเอกสารทางการ: [Configure Cursor with Bruno](https://docs.usebruno.com/agents/cursor), [ติดตั้ง VS Code / Cursor extension](https://docs.usebruno.com/vs-code-extension/install-config), [ดัชนีเอกสารสำหรับ LLM](https://docs.usebruno.com/llms.txt)

## 1) ติดตั้ง Bruno ใน Cursor

1. เปิด **Extensions** (`Ctrl+Shift+X`)
2. ค้นหา **Bruno** แล้วติดตั้งส่วนขยายจาก Marketplace: [`bruno-api-client.bruno`](https://marketplace.visualstudio.com/items?itemName=bruno-api-client.bruno) (ใช้ร่วมกับ Cursor ได้เหมือน VS Code)
3. รีโหลดหน้าต่างถ้าถูกขอ

## 2) เปิดคอลเลกชันในโปรเจกต์นี้

- โฟลเดอร์คอลเลกชันอยู่ที่ **`bruno/`** (มี `bruno.json` และไฟล์ `.bru`)
- ในแถบ **Bruno** ของส่วนขยาย: เปิด / import collection แล้วชี้ไปที่โฟลเดอร์ `bruno`
- เลือก environment **`local`** แล้วแก้ค่า `gatewayToken` ให้ตรงกับ `GATEWAY_TOKEN` ใน `.env` ของเซิร์ฟเวอร์
- ทดสอบ CRUD แบบครบชุด: คลิกขวาโฟลเดอร์ **`Items`** → **Run** (สคริปต์ `script:post-response` จะอัปเดต `itemId`, `updDate`, `itemCode` ใน environment หลัง create/put/patch และหลัง get สำหรับ `updDate`) — รายละเอียดใน **`bruno/README.md`**

## 3) ให้ AI ช่วยงาน Bruno โดยตรง (Cursor rules)

- กฎเฉพาะไฟล์ `.bru` อยู่ที่ **`.cursor/rules/bruno.mdc`** (เปิดเมื่อแก้ `**/*.bru`)
- ถ้าต้องการ **prompt ยาวแบบทางการของ Bruno** ให้คัดลอกจาก repo [bruno-collections/ai-assistant-prompts](https://github.com/bruno-collections/ai-assistant-prompts/tree/main/prompts/cursor) เช่นไฟล์ [`.cursorrules-bru`](https://raw.githubusercontent.com/bruno-collections/ai-assistant-prompts/main/prompts/cursor/.cursorrules-bru) ไปวางใน **User Rules** ของ Cursor หรือรวมเข้ากับกฎโปรเจกต์ที่คุณใช้อยู่ (ไฟล์นั้นยาว — ใช้เมื่อต้องการความละเอียดสูงสุดเรื่อง bru-lang / tests)

## 4) API ของโปรเจกต์นี้

- รูปแบบ response / error ให้ยึด **`agent.md`**
- `items` ใช้ header: `x-gateway-token`, `x-ou-id`, `x-branch-id`, `x-user-id` (ไม่ใช้ Bearer JWT)
