# Agent Standard — Frontend Project Coding Guidelines

เอกสารนี้รวบรวมมาตรฐานทั้งหมดของโปรเจกต์ฝั่ง Frontend เพื่อให้ Agent ใช้เป็นแนวทางในการสร้างและแก้ไขโค้ดให้ถูกต้องตามข้อกำหนดทุกด้าน

---

## 1. Stack & Technology

### 1.1 Core Stack

| Component | Version | Note |
| --- | --- | --- |
| **Framework** | Next.js 15 | App Router — ห้ามใช้ Pages Router |
| **Language** | TypeScript 5 | Strict mode บังคับ |
| **Styling** | Tailwind CSS v4 | ห้ามใช้ inline style |
| **Runtime** | Node.js 22+ LTS | |

**Setup command:** `npx create-next-app@latest`

ตอบ prompt ดังนี้:
- TypeScript → **Yes**
- ESLint → **Yes**
- Tailwind CSS → **Yes**
- `src/` directory → **Yes**
- App Router → **Yes**
- Turbopack → **Yes**
- Import alias → **Yes** (default `@/*`)

### 1.2 Dependencies เพิ่มเติม (ติดตั้งหลัง create)

| Package | Purpose |
| --- | --- |
| `js-cookie` + `@types/js-cookie` | จัดการ Cookie ฝั่ง Client |
| `dayjs` | แปลง UTC DateTime → Local Display |
| `zod` | Form validation schema |
| `react-hook-form` + `@hookform/resolvers` | Form state management |

### 1.3 Config Standards

- `tsconfig.json` ต้องตั้งค่า `"strict": true`
- ห้ามใช้ `any` type — ใช้ `unknown` แล้ว narrow type แทน
- ห้ามใช้ `@ts-ignore` — แก้ type error จริงเสมอ
- เก็บ API URL ใน `process.env.NEXT_PUBLIC_API_URL`

---

## 2. Architecture & Project Structure

### 2.1 Folder Structure (`src/`)

```
src/
├── app/                        # App Router — Pages & Layouts
│   ├── (auth)/                # Route Group — หน้า Login/Register
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (main)/                # Route Group — หน้าหลัก (Protected)
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── <feature>/
│   │   │   ├── page.tsx       # List page
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx   # Detail page
│   │   │   └── _components/   # Page-specific components
│   │   └── layout.tsx
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home (redirect to dashboard หรือ login)
│   └── globals.css
├── components/                 # Shared Reusable Components
│   ├── ui/                    # Base UI (Button, Input, Table, etc.)
│   └── <feature>/             # Feature-shared components
├── hooks/                      # Custom React Hooks
│   ├── use-auth.ts
│   └── use-<feature>.ts
├── lib/                        # Utilities & Configs
│   ├── api-client.ts          # API fetcher (ส่ง request ไป backend)
│   ├── auth.ts                # Token management
│   └── utils.ts               # Format helpers (date, money, etc.)
├── types/                      # TypeScript Type Definitions
│   ├── api.ts                 # Backend response types
│   └── <feature>.ts           # Feature-specific types
└── constants/                  # App-wide constants
    └── index.ts
```

### 2.2 Naming Rules

- **Folders & Files:** `kebab-case` ทั้งหมด (ตัวพิมพ์เล็กคั่นขีดกลาง)
- **React Components:** `PascalCase` ทั้งชื่อไฟล์และ function — `ProductTable.tsx`
- **Hooks:** ขึ้นต้นด้วย `use-` — `use-products.ts`
- **Page components:** ตั้งชื่อตาม Next.js convention — `page.tsx`, `layout.tsx`
- **Page-specific components:** วางใน `_components/` ภายใน folder ของ page นั้น

### 2.3 Server Component vs Client Component

| ใช้ Server Component | ใช้ Client Component |
| --- | --- |
| ดึงข้อมูลจาก Backend โดยตรง | มี state (`useState`, `useReducer`) |
| ไม่มี user interaction | มี event handler (`onClick`, `onChange`) |
| ลด bundle size | ใช้ browser API |
| Pass data ลง Child | ใช้ hooks (`useEffect`, custom hooks) |

**กฎ:** ใช้ Server Component เป็นค่าเริ่มต้น — เพิ่ม `'use client'` เมื่อจำเป็นเท่านั้น

---

## 3. Backend API Contract

### 3.1 Response Format มาตรฐาน

Backend ส่ง response ในรูปแบบนี้เสมอ:

```typescript
interface ApiResponse<T = unknown> {
  success: boolean;
  code: ApiCode;
  message: string | null;
  data: T | null;
  pagination?: Pagination;
  requestId?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
```

### 3.2 Error Codes จาก Backend

| Code | HTTP | ความหมาย | การจัดการ |
| --- | --- | --- | --- |
| `SUCCESS` | 200 | สำเร็จ | แสดงข้อมูล |
| `DATA_NOT_FOUND` | 200 | ไม่พบข้อมูล | แสดง empty state |
| `INVALID_PARAM` | 400 | ข้อมูลไม่ถูกต้อง | แสดง validation error |
| `UNAUTHORIZED` | 401 | ไม่มีสิทธิ์ | Redirect ไป login |
| `TOKEN_EXPIRED` | 401 | Token หมดอายุ | Refresh token หรือ logout |
| `MISSING_AUTHORIZATION` | 403 | ไม่มี token | Redirect ไป login |
| `CONFLICT` | 409 | ข้อมูลซ้ำ | แสดง error message |
| `TOO_MANY_REQUESTS` | 429 | เรียกถี่เกินไป | แสดง retry message |
| `INTERNAL_ERROR` | 500 | Server error | แสดง generic error |

### 3.3 Data Type Rules (Backend → Frontend)

| Backend ส่งมา | Frontend จัดการ |
| --- | --- |
| DateTime: ISO 8601 UTC String `"2026-12-31T23:59:59.000Z"` | แปลงเป็น Local timezone ด้วย `dayjs` เมื่อ display |
| Money: `String` `"1500.00"` | parse เป็น number เมื่อ display — ห้าม arithmetic บน string โดยตรง |
| ID: `String` (MongoDB ObjectId) | ใช้เป็น string เสมอ |
| ค่าว่าง: `null` | handle `null` ก่อน display เสมอ |
| Boolean: `true`/`false` | ใช้ตรงๆ |

### 3.4 Auth: JWT Bearer Token

- Backend ต้องการ `Authorization: Bearer <token>` ทุก protected endpoint
- เก็บ token ใน **httpOnly cookie** (ปลอดภัยที่สุด) — ห้ามเก็บใน `localStorage`
- Middleware (`src/middleware.ts`) ตรวจสอบ cookie และ redirect หากไม่มี token
- เมื่อได้ `TOKEN_EXPIRED` ให้ logout และ redirect ไป login

---

## 4. TypeScript Standards

### 4.1 Naming Convention

| ประเภท | รูปแบบ | ใช้กับ |
| --- | --- | --- |
| `camelCase` | `fetchProducts` | Variable, Function, Method |
| `PascalCase` | `ProductTable` | Component, Class, Type, Interface |
| `UPPER_SNAKE_CASE` | `MAX_PAGE_SIZE` | Constants |
| `kebab-case` | `product-table` | File, Folder |
| `snake_case` | `product_name` | API request/response fields เท่านั้น |

### 4.2 Type Best Practices

- **ห้ามใช้ `any`** — ใช้ `unknown` แล้ว narrow ด้วย type guard แทน
- **Interface สำหรับ Object shapes** — `interface Product { ... }`
- **Type สำหรับ Union/Intersection** — `type Status = 'active' | 'inactive'`
- **Generic types** สำหรับ reusable structures — `ApiResponse<Product>`
- ระบุ return type ของ async function เสมอ — `async function fetchProducts(): Promise<Product[]>`

### 4.3 Code Rules

- **Variable:** บังคับใช้ `const` — ใช้ `let` เมื่อต้องเปลี่ยนค่าเท่านั้น — **ห้ามใช้ `var`**
- **Async:** บังคับใช้ `async/await` — ห้ามใช้ `.then()/.catch()`
- **Equality:** บังคับใช้ `===` เสมอ
- **Guard Clauses:** ตรวจเงื่อนไขล้มเหลวก่อน แล้ว return ออก — ห้ามซ้อน if/else

---

## 5. API Integration Standard

### 5.1 API Client

ใช้ `src/lib/api-client.ts` เป็นจุดกลางส่ง HTTP Request — ห้าม `fetch()` โดยตรงในหน้า/component

```typescript
// ✅ Correct
import { apiClient } from '@/lib/api-client';
const result = await apiClient.get<Product[]>('/api/v1/products');

// ❌ Incorrect
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products`);
```

### 5.2 Error Handling Pattern

```typescript
// ✅ Correct — ตรวจ code จาก backend ก่อนใช้ data
const result = await apiClient.get<Product[]>('/api/v1/products');
if (!result.success) {
  // handle error
  return;
}
// ใช้ result.data ได้ที่นี่
```

### 5.3 Pagination

```typescript
// Query params: ?page=1&limit=10
const result = await apiClient.get<Product[]>('/api/v1/products', {
  params: { page, limit },
});
const { data, pagination } = result;
// pagination.page, pagination.limit, pagination.total, pagination.totalPages
```

---

## 6. Component Patterns

### 6.1 Page Structure (Server Component)

```
app/(main)/<feature>/page.tsx         ← Server Component, ดึงข้อมูล
app/(main)/<feature>/_components/     ← Client Components สำหรับ interaction
```

### 6.2 Loading & Error States

- ทุก Page ต้องมี `loading.tsx` (Suspense fallback)
- ทุก Page ต้องมี `error.tsx` (Error boundary — ต้องเป็น Client Component)
- แสดง skeleton loader ระหว่าง fetch ข้อมูล

### 6.3 Form Pattern

- ใช้ `react-hook-form` + `zod` เสมอ
- Zod schema ต้องสอดคล้องกับ Backend validation
- แสดง field-level error ใต้ input ทันที

---

## 7. Routing & Navigation

### 7.1 Route Structure

- **Route Groups** `(group)` — จัดกลุ่ม layout ไม่กระทบ URL
- **Protected routes** อยู่ใน `(main)` — มี auth middleware ตรวจสอบ
- **Auth routes** อยู่ใน `(auth)` — redirect ถ้ามี token อยู่แล้ว
- **Dynamic routes** ใช้ `[id]` — เช่น `products/[id]/page.tsx`

### 7.2 Middleware (`src/middleware.ts`)

- ตรวจ token ทุก request ที่ไปหน้าใน `(main)`
- Redirect ไป `/login` หากไม่มี token
- Redirect ไป `/dashboard` หาก login แล้วเข้า `(auth)` อีก

### 7.3 Navigation

- ใช้ `<Link>` จาก `next/link` เสมอ — ห้ามใช้ `<a>` tag
- Programmatic navigation ใช้ `useRouter()` จาก `next/navigation`

---

## 8. Styling Standard

### 8.1 Tailwind CSS Rules

- ใช้ **Tailwind utility classes** เท่านั้น — ห้ามใช้ inline style หรือ CSS module
- จัด class ตามลำดับ: layout → spacing → sizing → typography → color → state
- ใช้ `cn()` utility สำหรับ conditional class (จาก `clsx` หรือ `tailwind-merge`)

### 8.2 Responsive Design

- Mobile-first approach — เขียน base style ก่อน แล้ว breakpoint ใหญ่ขึ้น
- Breakpoints: `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px)

---

## 9. Performance & Bundle Optimization Standards ⭐ NEW

### 9.1 Eliminating Waterfalls (CRITICAL - Vercel Best Practices)

**ปัญหา:** Sequential API calls ทำให้ page load ช้า

```typescript
// ❌ BAD - Sequential (waterfall pattern)
async function DashboardPage() {
  const products = await fetchProducts(); // Wait 300ms
  const categories = await fetchCategories(); // Wait 300ms
  const stats = await fetchStats(); // Wait 300ms
  // Total: 900ms
}

// ✅ GOOD - Parallel (waterfall-free)
async function DashboardPage() {
  const [products, categories, stats] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
    fetchStats(),
  ]);
  // Total: 300ms (3x faster!)
}
```

**กฎ:** ทุก independent requests ต้องใช้ `Promise.all()`

---

### 9.2 Bundle Size Optimization (CRITICAL)

```typescript
// ✅ Dynamic imports สำหรับ heavy components
import dynamic from 'next/dynamic';

const HeavyModal = dynamic(() => import('./HeavyModal'), {
  loading: () => <Skeleton />,
  ssr: false,  // Load client-side only
});

const Charts = dynamic(() => import('./Charts'), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});

// ✅ next/image สำหรับ image optimization
import Image from 'next/image';

<Image
  src="/product.jpg"
  alt="Product"
  width={400}
  height={300}
  priority={isPriority}  // Only for above-fold images
  placeholder="blur"
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

**กฎ:**
- Heavy libraries/components → `next/dynamic`
- Images → `next/image` (ไม่ใช่ `<img>`)
- 3rd party analytics → defer load หลัง hydration

---

### 9.3 Server-Side Performance (HIGH)

```typescript
// ✅ Per-request caching (React Server Components)
import { cache } from 'react';

export const getUser = cache(async (userId: string) => {
  return apiClient.get(`/api/v1/users/${userId}`);
});

// ✅ Reuse cache - only 1 network call per request
async function Dashboard() {
  const user1 = await getUser('123');  // Network call
  const user2 = await getUser('123');  // ✅ From cache!
}
```

**กฎ:**
- ใช้ `React.cache()` สำหรับ deduplication
- Parallel fetch สำหรับ independent data
- `<Suspense>` boundaries สำหรับ streaming

---

### 9.4 Re-render Optimization (MEDIUM)

```typescript
// ✅ Memoize expensive components
import { memo } from 'react';

export const ProductTable = memo(function ProductTable({ data }) {
  // Only re-render if `data` prop changes
  return <table>...</table>;
});

// ✅ Memoize callbacks passed to children
const handleChange = useCallback((e) => {
  // Stable callback reference
}, [dependency]);

// ✅ Defer state updates
const [isPending, startTransition] = useTransition();

const handleSort = () => {
  startTransition(() => {
    setSort(newSort);  // Non-blocking update
  });
};
```

**กฎ:**
- Expensive components → `memo()`
- Callbacks to children → `useCallback()`
- Non-urgent updates → `startTransition()`

---

### 9.5 Error Handling & Retry Logic (HIGH)

```typescript
// ✅ Comprehensive error handling
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Exponential backoff
      const delay = 1000 * Math.pow(2, i);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

// ✅ Handle specific error codes
const result = await apiClient.get('/api/v1/products');

if (result.code === 'TOKEN_EXPIRED') {
  await logout();  // Clear session
  redirect('/login');
}

if (result.code === 'TOO_MANY_REQUESTS') {
  // Retry with backoff
}
```

**กฎ:**
- Network errors → retry with exponential backoff
- `TOKEN_EXPIRED` → logout + redirect
- `TOO_MANY_REQUESTS` → throttle + retry

---

### 9.6 Suspense & Streaming for Better UX (HIGH)

```typescript
// ✅ Independent Suspense boundaries
export default async function ProductsPage() {
  return (
    <div>
      {/* Stats loads independently */}
      <Suspense fallback={<StatsSkeleton />}>
        <StatsSection />
      </Suspense>

      {/* Table loads independently */}
      <Suspense fallback={<TableSkeleton />}>
        <ProductTableSection />
      </Suspense>
    </div>
  );
}

// Stream content to browser as it's ready
async function StatsSection() {
  const result = await apiClient.get('/api/v1/stats');
  return <StatsDisplay data={result.data} />;
}

async function ProductTableSection() {
  const result = await apiClient.get('/api/v1/products');
  return <ProductTable data={result.data} />;
}
```

**กฎ:**
- ทุก major section → own `<Suspense>` boundary
- Stream content ASAP (ไม่รอ slow requests)
- Skeleton UI สำหรับ loading states

---

## 10. Environment Variables

```dotenv
# API
NEXT_PUBLIC_API_URL=http://localhost:3000    # ชี้ไป Backend server

# Auth (ถ้าต้องการ Server-side token management)
AUTH_SECRET=your-secret-key-min-32-chars    # สำหรับ encrypt cookie
```

**กฎ:**
- `NEXT_PUBLIC_` prefix — expose ให้ฝั่ง Client ได้
- ไม่มี prefix — Server-side เท่านั้น (ปลอดภัยกว่า)
- ห้าม commit `.env` จริงเข้า Git — commit เฉพาะ `.env.example`

---

## 10. Standard npm Scripts

| Command | หน้าที่ |
| --- | --- |
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Build production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | TypeScript type checking (ไม่ emit) |

---

## Quick Reference — กฎเหล็กสรุป (24 Rules)

### **Type Safety & Code Quality**
| # | กฎ | รายละเอียด |
| --- | --- | --- |
| 1 | **No `any` type** | ใช้ `unknown` + type guard แทน |
| 2 | **Server Component First** | เพิ่ม `'use client'` เมื่อจำเป็นเท่านั้น |
| 3 | **API Client เดียว** | ใช้ `apiClient` จาก `@/lib/api-client` เสมอ |
| 4 | **Check `success` ก่อน** | ตรวจ `result.success` ก่อนใช้ `result.data` เสมอ |
| 5 | **No var** | ใช้ `const`/`let` เท่านั้น |
| 6 | **Async/Await Only** | ห้ามใช้ `.then()/.catch()` |

### **Security & Auth**
| # | กฎ | รายละเอียด |
| --- | --- | --- |
| 7 | **Auth ใน httpOnly Cookie** | ห้ามเก็บ JWT ใน localStorage |
| 8 | **Middleware ตรวจ Auth** | ทุก protected route ผ่าน `middleware.ts` |
| 9 | **No token to Client** | Server Actions เท่านั้น สำหรับ mutations |
| 10 | **getServerToken() ใน Layout** | Protected routes check token + redirect |

### **UI & Forms**
| # | กฎ | รายละเอียด |
| --- | --- | --- |
| 11 | **No inline style** | ใช้ Tailwind utilities เท่านั้น |
| 12 | **react-hook-form + zod** | ใช้ทุก form — ห้าม uncontrolled form |
| 13 | **Link ไม่ใช่ `<a>`** | ใช้ `<Link>` จาก `next/link` เสมอ |
| 14 | **Loading + Error states** | ทุก page ต้องมี `loading.tsx` และ `error.tsx` |
| 15 | **kebab-case files** | ทุก file/folder ตัวพิมพ์เล็กคั่นขีด ยกเว้น Component |

### **Data & DateTime**
| # | กฎ | รายละเอียด |
| --- | --- | --- |
| 16 | **UTC → Local บน display** | แปลง datetime ด้วย `dayjs` ก่อนแสดง |
| 17 | **Money as String จาก API** | parse ก่อน display ด้วย `formatMoney()` |
| 18 | **upd_date ทุก Update** | Optimistic Locking เพื่อป้องกัน race conditions |

### **Performance & Bundle Optimization** ⭐ NEW
| # | กฎ | รายละเอียด |
| --- | --- | --- |
| 19 | **Promise.all()** | Parallel fetching ไม่มี waterfalls |
| 20 | **next/dynamic** | Heavy components/modals → lazy load |
| 21 | **next/image** | ทุก images ใช้ `Image` component |
| 22 | **React.cache()** | Dedup per-request API calls |
| 23 | **Suspense Boundaries** | Stream content ด้วย `<Suspense>` |
| 24 | **Error Retry Logic** | Network errors → exponential backoff |
