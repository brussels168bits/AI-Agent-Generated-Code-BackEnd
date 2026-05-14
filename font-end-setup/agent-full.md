# Agent Full — Frontend Full Templates Reference

> **Tier 2 — โหลดเมื่อต้องการ** | อ่านเมื่อต้องการ Full Code Templates
> Rules & Standards อยู่ใน `agent.md` (อ่านก่อนเสมอ)
>
> **โหลดเมื่อ:**
> - สร้าง/แก้ไข `api-client.ts`, `auth.ts`, `utils.ts`
> - สร้าง/แก้ไข `middleware.ts`
> - สร้าง CRUD Page ใหม่ทั้งชุด (list page, detail page, form)
> - ต้องการ Type definitions ฉบับเต็ม
> - สร้าง Custom hooks สำหรับ data fetching

---

## 1. Stack & Technology

| Component | Version | Note |
| --- | --- | --- |
| **Framework** | Next.js 15 | App Router |
| **Language** | TypeScript 5 | Strict mode |
| **Styling** | Tailwind CSS v4 | Utility-first |
| **Runtime** | Node.js 22+ LTS | |

---

## 2. TypeScript Type Definitions

### 2.1 Backend API Types (`src/types/api.ts`)

```typescript
// Backend Error Codes
export type ApiCode =
  | 'SUCCESS'
  | 'DATA_NOT_FOUND'
  | 'INVALID_PARAM'
  | 'INVALID_HEADER'
  | 'UNAUTHORIZED'
  | 'TOKEN_EXPIRED'
  | 'MISSING_ORIGIN'
  | 'MISSING_AUTHORIZATION'
  | 'MISSING_CONTENT_TYPE'
  | 'METHOD_NOT_ALLOWED'
  | 'CONFLICT'
  | 'REQUEST_NOT_SECURE'
  | 'TOO_MANY_REQUESTS'
  | 'INTERNAL_ERROR';

// Pagination
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Standard API Response Wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  code: ApiCode;
  message: string | null;
  data: T | null;
  pagination?: Pagination;
  requestId?: string;
}

// API Error
export class ApiError extends Error {
  constructor(
    public readonly code: ApiCode,
    public readonly httpStatus: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

---

## 3. API Client (`src/lib/api-client.ts`)

```typescript
import { ApiResponse } from '@/types/api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface RequestOptions {
  params?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  token?: string;
  cache?: RequestCache;
  revalidate?: number;
}

function buildUrl(path: string, params?: RequestOptions['params']): string {
  const url = new URL(path, BASE_URL);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

function buildHeaders(token?: string, extra?: Record<string, string>): HeadersInit {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function request<T>(
  method: string,
  path: string,
  options: RequestOptions & { body?: unknown } = {},
): Promise<ApiResponse<T>> {
  const { params, headers, token, body, cache, revalidate } = options;

  const fetchOptions: RequestInit = {
    method,
    headers: buildHeaders(token, headers),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    ...(cache ? { cache } : {}),
    ...(revalidate !== undefined ? { next: { revalidate } } : {}),
  };

  const res = await fetch(buildUrl(path, params), fetchOptions);
  const json: ApiResponse<T> = await res.json();
  return json;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>('GET', path, options),

  post: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>('POST', path, { ...options, body }),

  patch: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>('PATCH', path, { ...options, body }),

  put: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>('PUT', path, { ...options, body }),

  delete: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('DELETE', path, { ...options, body }),
};
```

---

## 4. Auth Token Management (`src/lib/auth.ts`)

```typescript
import { cookies } from 'next/headers';

const TOKEN_COOKIE = 'auth_token';

// Server-side: อ่าน token จาก cookie (ใช้ใน Server Component / Server Action)
export async function getServerToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(TOKEN_COOKIE)?.value;
}

// Server-side: set token (ใช้ใน Server Action หลัง login สำเร็จ)
export async function setServerToken(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,  // 1 day
    path: '/',
  });
}

// Server-side: ลบ token (logout)
export async function clearServerToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE);
}
```

---

## 5. Utility Functions (`src/lib/utils.ts`)

```typescript
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

dayjs.extend(utc);
dayjs.extend(timezone);

// Tailwind class merging utility
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// แปลง UTC ISO string → Local datetime string สำหรับ display
export function formatDateTime(isoString: string | null | undefined): string {
  if (!isoString) return '—';
  return dayjs.utc(isoString).local().format('DD/MM/YYYY HH:mm');
}

// แปลง UTC ISO string → Local date string สำหรับ display
export function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return '—';
  return dayjs.utc(isoString).local().format('DD/MM/YYYY');
}

// แสดงค่าเงิน (Backend ส่งเป็น String)
export function formatMoney(value: string | null | undefined, currency = 'THB'): string {
  if (value === null || value === undefined) return '—';
  const num = parseFloat(value);
  if (isNaN(num)) return '—';
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(num);
}

// แสดงตัวเลขทั่วไปพร้อม comma
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('th-TH').format(value);
}

// แปลง Local datetime → UTC ISO string สำหรับ send ไป Backend
export function toUtcIso(localDateString: string): string {
  return dayjs(localDateString).utc().toISOString();
}
```

---

## 6. Route Middleware (`src/middleware.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';

const TOKEN_COOKIE = 'auth_token';

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest): NextResponse {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const pathname = request.nextUrl.pathname;

  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // ไม่มี token และพยายามเข้า protected route → redirect login
  if (!token && !isPublicPath) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // มี token และพยายามเข้า auth route → redirect dashboard
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
```

---

## 6.1 Advanced Middleware: Auth & Error Handling

```typescript
import { NextRequest, NextResponse } from 'next/server';

const TOKEN_COOKIE = 'auth_token';
const PUBLIC_PATHS = ['/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest): NextResponse {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const pathname = request.nextUrl.pathname;

  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // ไม่มี token และพยายามเข้า protected route → redirect login
  if (!token && !isPublicPath) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // มี token และพยายามเข้า auth route → redirect dashboard
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // ✅ Add custom headers for logging/tracing (Vercel pattern)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);
  requestHeaders.set('x-has-token', token ? 'true' : 'false');

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
```

---

## 6.2 Performance: Parallel Data Fetching & Caching

```typescript
// ✅ Vercel Best Practice: async-parallel + server-cache-react

import { cache } from 'react';
import { apiClient } from '@/lib/api-client';

// ✅ Per-request cache (React 18)
export const getProducts = cache(async (token: string) => {
  return apiClient.get('/api/v1/products', { token });
});

export const getCategories = cache(async (token: string) => {
  return apiClient.get('/api/v1/categories', { token });
});

export const getStats = cache(async (token: string) => {
  return apiClient.get('/api/v1/stats', { token });
});

// ✅ Parallel fetching instead of sequential (waterfall)
export async function fetchDashboardData(token: string) {
  // ❌ BAD - Sequential (waterfall)
  // const products = await getProducts(token);
  // const categories = await getCategories(token);
  // const stats = await getStats(token);

  // ✅ GOOD - Parallel
  const [productsResult, categoriesResult, statsResult] = await Promise.all([
    getProducts(token),
    getCategories(token),
    getStats(token),
  ]);

  return {
    products: productsResult.data,
    categories: categoriesResult.data,
    stats: statsResult.data,
  };
}
```

---

## 6.3 Bundle Optimization: Dynamic Imports & Code Splitting

```typescript
// ✅ Vercel Best Practice: bundle-dynamic-imports

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// ✅ Heavy modals/components → load on demand
const CreateProductModal = dynamic(
  () => import('./_components/create-product-modal'),
  {
    loading: () => <div className="h-96 animate-pulse rounded bg-gray-200" />,
    ssr: false,  // Load only client-side
  },
);

// ✅ Chart library → defer until needed
const ProductChart = dynamic(
  () => import('./_components/product-chart'),
  {
    loading: () => <div>Loading chart...</div>,
    ssr: false,  // Charts don't need SSR
  },
);

// ✅ Use in page
export default function ProductsDashboard() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <button onClick={() => setShowModal(true)}>Create Product</button>
      
      {/* Modal loads only when needed */}
      {showModal && (
        <Suspense fallback={<div>Loading...</div>}>
          <CreateProductModal onClose={() => setShowModal(false)} />
        </Suspense>
      )}

      {/* Chart loads separately */}
      <Suspense fallback={<div>Loading chart...</div>}>
        <ProductChart />
      </Suspense>
    </div>
  );
}
```

---

## 6.4 Rendering: Suspense & Streaming for Better UX

```typescript
// ✅ Vercel Best Practice: async-suspense-boundaries

import { Suspense } from 'react';
import { ProductTableSkeleton, StatsSkeletonLoader } from './_components/skeletons';

// Server Component - stream content as it's ready
export default async function ProductsPage({ searchParams }: PageProps) {
  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-semibold">Dashboard</h1>

      {/* Stats load independently */}
      <Suspense fallback={<StatsSkeletonLoader />}>
        <StatsSection />
      </Suspense>

      {/* Products table loads independently */}
      <Suspense fallback={<ProductTableSkeleton />}>
        <ProductTableSection searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

// Each section fetches independently - streams to client when ready
async function StatsSection() {
  const token = await getServerToken();
  const statsResult = await apiClient.get('/api/v1/stats', { token });
  
  return (
    <div className="mb-6 grid grid-cols-3 gap-4">
      {/* Render stats */}
    </div>
  );
}

async function ProductTableSection({ searchParams }: PageProps) {
  const { page = '1', limit = '10' } = await searchParams;
  const token = await getServerToken();
  
  const result = await apiClient.get<Product[]>('/api/v1/products', {
    params: { page, limit },
    token,
  });

  return <ProductTable data={result.data} pagination={result.pagination} />;
}
```

---

## 6.5 Re-render Optimization: Memoization & Callbacks

```typescript
// ✅ Vercel Best Practice: rerender-memo + rerender-dependencies

'use client';

import { memo, useCallback, useMemo } from 'react';
import { Product, Pagination } from '@/types/api';

// ✅ Memoize expensive components
interface ProductTableProps {
  data: Product[];
  pagination?: Pagination;
  onPageChange: (page: number) => void;
}

export const ProductTable = memo(function ProductTable({
  data,
  pagination,
  onPageChange,
}: ProductTableProps) {
  return (
    <div>
      <table className="w-full">
        {/* Table content */}
      </table>

      {pagination && pagination.totalPages > 1 && (
        <PaginationControls
          pagination={pagination}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
});

// ✅ Memoize row component
interface ProductRowProps {
  item: Product;
  onSelect: (id: string) => void;
}

export const ProductRow = memo(function ProductRow({
  item,
  onSelect,
}: ProductRowProps) {
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-4 py-3">{item.name}</td>
      <td className="px-4 py-3">{formatMoney(item.price)}</td>
      <td className="px-4 py-3">
        <button onClick={() => onSelect(item.id)}>View</button>
      </td>
    </tr>
  );
});

// ✅ Parent component - memoize callback
'use client';

export function ProductListContainer() {
  const router = useRouter();
  
  // ✅ Memoize to prevent child re-renders
  const handlePageChange = useCallback((page: number) => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    router.push(`?${params.toString()}`);
  }, [router]);

  const handleSelectProduct = useCallback((id: string) => {
    router.push(`/products/${id}`);
  }, [router]);

  const memoizedCallback = useMemo(
    () => handleSelectProduct,
    [handleSelectProduct],
  );

  return (
    <ProductTable
      data={products}
      pagination={pagination}
      onPageChange={handlePageChange}
    />
  );
}
```

---

## 6.6 Image Optimization & Performance

```typescript
// ✅ Vercel Best Practice: bundle-preload + rendering-resource-hints

import Image from 'next/image';
import { Suspense } from 'react';

// ✅ Product card with optimized image
interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  return (
    <div className="rounded-lg border">
      {/* ✅ Use next/image for optimization */}
      <Image
        src={product.imageUrl}
        alt={product.name}
        width={400}
        height={300}
        priority={priority}  // First 2-3 images
        placeholder="blur"   // Blur-up effect
        blurDataURL={product.blurUrl}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="h-48 w-full object-cover"
      />
      <div className="p-4">
        <h3 className="font-semibold">{product.name}</h3>
        <p className="text-sm text-gray-600">{formatMoney(product.price)}</p>
      </div>
    </div>
  );
}

// ✅ Grid with preload hints
export default function ProductsGrid() {
  return (
    <>
      {/* Preload first image on hover */}
      <link rel="preload" as="image" href="/products/hero.jpg" />
      
      <div className="grid grid-cols-3 gap-4">
        {products.map((product, idx) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={idx < 3}  // Prioritize first 3 images
          />
        ))}
      </div>
    </>
  );
}
```

---

## 6.7 Error Handling: Comprehensive Error Recovery

```typescript
// ✅ Comprehensive error handling pattern

interface FetchOptions extends RequestOptions {
  maxRetries?: number;
  retryDelay?: number;
}

export async function apiClientWithRetry<T>(
  method: string,
  path: string,
  options: FetchOptions & { body?: unknown } = {},
): Promise<ApiResponse<T>> {
  const { maxRetries = 3, retryDelay = 1000, ...requestOptions } = options;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await request<T>(method, path, requestOptions);

      // ✅ Handle specific error codes
      if (result.code === 'TOKEN_EXPIRED') {
        // Clear token and redirect to login
        await clearServerToken();
        throw new ApiError(
          'TOKEN_EXPIRED',
          401,
          'Your session has expired. Please login again.',
        );
      }

      if (result.code === 'UNAUTHORIZED') {
        throw new ApiError('UNAUTHORIZED', 403, 'You do not have permission to access this resource.');
      }

      if (result.code === 'TOO_MANY_REQUESTS') {
        // Retry with exponential backoff
        const delay = retryDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      return result;
    } catch (error) {
      // Network error - retry
      if (attempt === maxRetries - 1) {
        throw error;
      }

      const delay = retryDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error('Max retries exceeded');
}
```

---

## 6.8 Server Actions: Secure Form Mutations

```typescript
// ✅ Vercel Best Practice: server-auth-actions + No token passed to client

'use server';

import { redirect } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { getServerToken } from '@/lib/auth';
import { createProductSchema, CreateProductInput } from '@/types/product';

// ✅ Server Action - token never exposed to client
export async function createProductAction(
  data: CreateProductInput,
): Promise<{ error?: string; data?: Product }> {
  // Validate input
  const validation = createProductSchema.safeParse(data);
  if (!validation.success) {
    return { error: 'Invalid input' };
  }

  // Get token server-side only
  const token = await getServerToken();
  if (!token) {
    return { error: 'Unauthorized' };
  }

  try {
    const result = await apiClient.post<Product>('/api/v1/products', data, {
      token,
    });

    if (!result.success) {
      return { error: result.message || 'Failed to create product' };
    }

    return { data: result.data };
  } catch (error) {
    return { error: 'An error occurred while creating the product' };
  }
}

// ✅ Similarly for update/delete
export async function updateProductAction(
  id: string,
  data: UpdateProductInput,
): Promise<{ error?: string }> {
  const token = await getServerToken();
  if (!token) return { error: 'Unauthorized' };

  const result = await apiClient.patch(`/api/v1/products/${id}`, data, {
    token,
  });

  if (!result.success) {
    return { error: result.message };
  }

  return {};
}
```

---

## 6.9 Client: Using Server Actions in Forms (No Token Passed)

```typescript
// ✅ Client Component - uses Server Actions

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProductAction } from './_actions';
import { createProductSchema, CreateProductInput } from '@/types/product';

interface ProductFormProps {
  // ❌ NO token prop
}

export function ProductForm({}: ProductFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: { status: 'active' },
  });

  const onSubmit = async (data: CreateProductInput) => {
    setServerError(null);

    // ✅ Call Server Action (no token needed)
    const result = await createProductAction(data);

    if (result.error) {
      setServerError(result.error);
      return;
    }

    router.push('/products');
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
      {serverError && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          ชื่อสินค้า
        </label>
        <input
          {...register('name')}
          className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="กรอกชื่อสินค้า"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          ราคา
        </label>
        <input
          {...register('price', { valueAsNumber: true })}
          type="number"
          step="0.01"
          min="0"
          className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0.00"
        />
        {errors.price && (
          <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
      </button>
    </form>
  );
}
```

---

## 7. Constants (`src/constants/index.ts`)

```typescript
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
    ME: '/api/v1/auth/me',
  },
  // เพิ่ม resource อื่นๆ ที่นี่
  PRODUCTS: '/api/v1/products',
} as const;

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 10;
```

---

## 8. CRUD Page Templates

### 8.1 List Page (Server Component)

```typescript
// src/app/(main)/<feature>/page.tsx
import { apiClient } from '@/lib/api-client';
import { getServerToken } from '@/lib/auth';
import { Product } from '@/types/product';
import { ProductTable } from './_components/product-table';

interface PageProps {
  searchParams: Promise<{ page?: string; limit?: string }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const { page = '1', limit = '10' } = await searchParams;
  const token = await getServerToken();

  const result = await apiClient.get<Product[]>('/api/v1/products', {
    params: { page, limit },
    token,
  });

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-semibold">Products</h1>
      {result.success && result.data ? (
        <ProductTable
          data={result.data}
          pagination={result.pagination}
        />
      ) : (
        <p className="text-gray-500">ไม่พบข้อมูล</p>
      )}
    </div>
  );
}
```

### 8.2 List Page Loading (`loading.tsx`)

```typescript
// src/app/(main)/<feature>/loading.tsx
export default function Loading() {
  return (
    <div className="p-6">
      <div className="mb-6 h-8 w-40 animate-pulse rounded bg-gray-200" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded bg-gray-100" />
        ))}
      </div>
    </div>
  );
}
```

### 8.3 Error Page (`error.tsx`)

```typescript
// src/app/(main)/<feature>/error.tsx
'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center p-12">
      <h2 className="mb-2 text-xl font-semibold text-red-600">เกิดข้อผิดพลาด</h2>
      <p className="mb-4 text-gray-500">{error.message}</p>
      <button
        onClick={reset}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        ลองอีกครั้ง
      </button>
    </div>
  );
}
```

### 8.4 Data Table Component (Client Component)

```typescript
// src/app/(main)/<feature>/_components/product-table.tsx
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Pagination } from '@/types/api';
import { Product } from '@/types/product';
import { formatDateTime, formatMoney } from '@/lib/utils';

interface ProductTableProps {
  data: Product[];
  pagination?: Pagination;
}

export function ProductTable({ data, pagination }: ProductTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b bg-gray-50 text-left">
            <th className="px-4 py-3 font-medium text-gray-600">ชื่อ</th>
            <th className="px-4 py-3 font-medium text-gray-600">ราคา</th>
            <th className="px-4 py-3 font-medium text-gray-600">สถานะ</th>
            <th className="px-4 py-3 font-medium text-gray-600">วันที่สร้าง</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                ไม่พบข้อมูล
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3">{formatMoney(item.price)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      item.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDateTime(item.cr_date)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>
            แสดง {(pagination.page - 1) * pagination.limit + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)} จาก {pagination.total} รายการ
          </span>
          <div className="flex gap-1">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                className={`rounded px-3 py-1 ${
                  p === pagination.page
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 9. Form Templates (Create / Edit)

### 9.1 Zod Schema & Types

```typescript
// src/types/product.ts
import { z } from 'zod';

// Response type จาก Backend
export interface Product {
  id: string;
  name: string;
  price: string;        // Backend ส่งเป็น String (Decimal128)
  status: 'active' | 'inactive';
  cr_date: string;      // ISO 8601 UTC
  upd_date: string;     // ISO 8601 UTC — ใช้สำหรับ Optimistic Locking
}

// Zod schema สำหรับ Create form
export const createProductSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อ').max(200, 'ชื่อยาวเกินไป'),
  price: z.number({ invalid_type_error: 'กรุณากรอกราคา' }).min(0, 'ราคาต้องไม่ติดลบ'),
  status: z.enum(['active', 'inactive']).default('active'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

// Zod schema สำหรับ Update form (ต้องมี upd_date สำหรับ Optimistic Locking)
export const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  price: z.number().min(0).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  upd_date: z.string().min(1, 'upd_date is required'),
});

export type UpdateProductInput = z.infer<typeof updateProductSchema>;
```

### 9.2 Create Form (Client Component)

```typescript
// src/app/(main)/<feature>/_components/product-form.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { createProductSchema, CreateProductInput } from '@/types/product';

interface ProductFormProps {
  token: string;
}

export function ProductForm({ token }: ProductFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: { status: 'active' },
  });

  const onSubmit = async (data: CreateProductInput) => {
    setServerError(null);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/products`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      },
    );

    const result = await res.json();

    if (!result.success) {
      setServerError(result.message ?? 'เกิดข้อผิดพลาด');
      return;
    }

    router.push('/products');
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
      {serverError && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          ชื่อสินค้า
        </label>
        <input
          {...register('name')}
          className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="กรอกชื่อสินค้า"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          ราคา
        </label>
        <input
          {...register('price', { valueAsNumber: true })}
          type="number"
          step="0.01"
          min="0"
          className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0.00"
        />
        {errors.price && (
          <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          สถานะ
        </label>
        <select
          {...register('status')}
          className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded border px-4 py-2 text-sm hover:bg-gray-50"
        >
          ยกเลิก
        </button>
      </div>
    </form>
  );
}
```

---

## 10. Custom Hooks

### 10.1 Client-side Data Fetching Hook

```typescript
// src/hooks/use-products.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { ApiResponse, Pagination } from '@/types/api';
import { Product } from '@/types/product';

interface UseProductsOptions {
  token: string;
  page?: number;
  limit?: number;
}

interface UseProductsResult {
  data: Product[];
  pagination: Pagination | undefined;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProducts({
  token,
  page = 1,
  limit = 10,
}: UseProductsOptions): UseProductsResult {
  const [data, setData] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await apiClient.get<Product[]>('/api/v1/products', {
      params: { page, limit },
      token,
    });

    if (result.success && result.data) {
      setData(result.data);
      setPagination(result.pagination);
    } else {
      setError(result.message ?? 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    }

    setIsLoading(false);
  }, [token, page, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, pagination, isLoading, error, refetch: fetchData };
}
```

---

## 11. Server Actions (Login / Logout)

```typescript
// src/app/(auth)/login/_actions.ts
'use server';

import { redirect } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { setServerToken, clearServerToken } from '@/lib/auth';

interface LoginPayload {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    username: string;
    ou_id: string;
    branch_id: string;
  };
}

export async function loginAction(payload: LoginPayload): Promise<{ error?: string }> {
  const result = await apiClient.post<LoginResponse>('/api/v1/auth/login', payload);

  if (!result.success || !result.data) {
    return { error: result.message ?? 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' };
  }

  await setServerToken(result.data.token);
  redirect('/dashboard');
}

export async function logoutAction(): Promise<void> {
  await clearServerToken();
  redirect('/login');
}
```

---

## 12. Root Layout (`src/app/layout.tsx`)

```typescript
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'My App',
  description: 'Application description',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
```

---

## 13. Protected Layout (`src/app/(main)/layout.tsx`)

```typescript
import { redirect } from 'next/navigation';
import { getServerToken } from '@/lib/auth';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getServerToken();
  if (!token) redirect('/login');

  return (
    <div className="flex min-h-screen">
      {/* Sidebar หรือ Nav */}
      <aside className="w-60 border-r bg-white p-4">
        <nav className="space-y-1">
          {/* Navigation links */}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
```

---

## 14. `.env.example`

```dotenv
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3000

# Auth (Server-side cookie encryption — ถ้าต้องการ)
AUTH_SECRET=your-secret-key-min-32-chars-change-this
```

---

## Quick Reference — กฎเหล็กสรุป

### **Code Quality & Type Safety**
| # | กฎ | รายละเอียด |
| --- | --- | --- |
| 1 | **No `any` type** | ใช้ `unknown` + type guard แทน |
| 2 | **Server Component First** | เพิ่ม `'use client'` เมื่อจำเป็นเท่านั้น |
| 3 | **API Client เดียว** | ใช้ `apiClient` จาก `@/lib/api-client` เสมอ |
| 4 | **Check `success` ก่อน** | ตรวจ `result.success` ก่อนใช้ `result.data` เสมอ |
| 5 | **kebab-case files** | ยกเว้น Component files ที่ใช้ PascalCase |

### **Security & Authentication**
| # | กฎ | รายละเอียด |
| --- | --- | --- |
| 6 | **Auth ใน httpOnly Cookie** | ห้ามเก็บ JWT ใน localStorage |
| 7 | **Middleware ตรวจ Auth** | ทุก protected route ผ่าน `middleware.ts` |
| 8 | **Server Actions สำหรับ mutation** | ไม่ส่ง token ให้ Client Components |
| 9 | **getServerToken() ใน Layout** | Layout ที่ protected ต้อง check token และ redirect ถ้าไม่มี |

### **Styling & UI**
| # | กฎ | รายละเอียด |
| --- | --- | --- |
| 10 | **No inline style** | ใช้ Tailwind utilities เท่านั้น |
| 11 | **Loading + Error states** | ทุก page ต้องมี `loading.tsx` และ `error.tsx` |

### **Data & Forms**
| # | กฎ | รายละเอียด |
| --- | --- | --- |
| 12 | **react-hook-form + zod** | ใช้ทุก form |
| 13 | **UTC → Local บน display** | ใช้ `formatDateTime()` จาก `utils.ts` เสมอ |
| 14 | **Money as String** | ใช้ `formatMoney()` จาก `utils.ts` เสมอ |
| 15 | **upd_date ทุก Update** | ส่ง `upd_date` กลับไปด้วยเสมอ (Optimistic Locking) |

### **Performance & Bundle Optimization** ⭐ NEW
| # | กฎ | รายละเอียด |
| --- | --- | --- |
| 16 | **Parallel Fetching** | ใช้ `Promise.all()` สำหรับ independent requests |
| 17 | **Dynamic Imports** | ใช้ `next/dynamic` สำหรับ heavy components |
| 18 | **React.cache()** | Cache per-request results (Server Components) |
| 19 | **Suspense Boundaries** | Stream content ด้วย `<Suspense>` |
| 20 | **Memoize Components** | ใช้ `memo()` สำหรับ expensive components |
| 21 | **useCallback** | Memoize callbacks ที่ pass to children |
| 22 | **next/image** | ใช้ `Image` component สำหรับ optimization |
| 23 | **Error Handling** | Retry logic + exponential backoff สำหรับ network errors |
| 24 | **Server Actions** | ไม่ expose secrets (token) ให้ client |
