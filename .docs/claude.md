# Yarn Inventory Management System — CLAUDE.md

## Project Overview

A professional web-based inventory management system for tracking yarn/thread stock in a warehouse. Built with Next.js App Router, Prisma ORM, and PostgreSQL (Supabase).

## Tech Stack

- **Frontend:** Next.js 14 (App Router), Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes (Route Handlers)
- **Database:** PostgreSQL via Supabase
- **ORM:** Prisma
- **Deployment:** Vercel

## Project Structure

```
yarn-inventory/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                  # Dashboard
│   ├── inventory/
│   │   ├── page.tsx              # Yarn list
│   │   └── [id]/page.tsx         # Yarn detail/edit
│   ├── transactions/
│   │   └── page.tsx
│   ├── reports/
│   │   └── page.tsx
│   ├── storage/
│   │   └── page.tsx              # Rack layout view
│   └── api/
│       ├── yarns/
│       │   ├── route.ts          # GET all, POST new
│       │   └── [id]/route.ts     # GET one, PUT, DELETE
│       ├── transactions/
│       │   └── route.ts
│       └── reports/
│           └── route.ts
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── yarn-table.tsx
│   ├── stock-form.tsx
│   ├── dashboard-stats.tsx
│   ├── rack-layout.tsx
│   └── low-stock-alert.tsx
├── lib/
│   ├── prisma.ts                 # Prisma client singleton
│   └── utils.ts
├── prisma/
│   └── schema.prisma
├── .env.local
└── CLAUDE.md
```

## Database Schema (Prisma)

```prisma
model Yarn {
  id          Int           @id @default(autoincrement())
  yarnId      String        @unique  // Y001, Y002...
  name        String
  material    String
  color       String
  quantity    Int
  location    String        // Rack A-12
  supplier    String
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  transactions Transaction[]
}

model Transaction {
  id        Int      @id @default(autoincrement())
  yarnId    Int
  type      String   // IN or OUT
  quantity  Int
  date      DateTime @default(now())
  yarn      Yarn     @relation(fields: [yarnId], references: [id])
}
```

## Core Features

1. **Dashboard** — KPI cards (total stock, yarn types, low stock count, recent activity)
2. **Inventory Table** — sortable, filterable, paginated yarn list with inline edit
3. **Stock Movement** — log IN/OUT, auto-updates quantity, shows running balance
4. **Search & Filter** — by name, color, material, rack location
5. **Rack Layout View** — visual grid of racks, click rack to see yarns stored there
6. **Reports** — current inventory, low stock list, monthly usage chart

## Key Conventions

- Yarn IDs: `Y001`, `Y002`, ... (auto-generated on create)
- Locations: `Rack A-12`, `Rack B-3`
- Transaction types: `IN` | `OUT`
- Default unit: **Cones**
- Low stock threshold: `quantity < 50`
- Dates: stored as UTC, displayed as `DD-MM-YYYY`

## API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/yarns` | GET | List all yarns (with filters) |
| `/api/yarns` | POST | Create yarn |
| `/api/yarns/[id]` | GET | Get single yarn |
| `/api/yarns/[id]` | PUT | Update yarn |
| `/api/yarns/[id]` | DELETE | Delete yarn |
| `/api/transactions` | GET | List transactions |
| `/api/transactions` | POST | Log stock movement |
| `/api/reports` | GET | Aggregated report data |

## Code Style

- TypeScript strict mode — always
- Server Components by default, `"use client"` only when needed (forms, charts)
- Fetch data in Server Components using Prisma directly — no useEffect for data
- Use `shadcn/ui` for all UI components (Table, Dialog, Card, Badge, etc.)
- Tailwind only — no custom CSS files
- Error handling: every API route returns `{ error: string }` with proper HTTP status

## What Claude Should Do

- Use Prisma transactions when stock movement updates yarn quantity
- Validate `quantity > 0` and `type === 'IN' | 'OUT'` in API routes with Zod
- Generate `yarnId` as `Y${String(count + 1).padStart(3, '0')}` on creation
- Group rack layout by prefix: `Rack A` groups `A-1`, `A-2`, `A-12`
- Low stock badge: red if `< 50`, yellow if `< 100`, green otherwise
- Use `next/navigation` `useRouter` for redirects after form actions
- Use Server Actions for forms where possible

## What Claude Should NOT Do

- Don't use `useEffect` for data fetching — use Server Components or SWR
- Don't use raw SQL — Prisma only
- Don't use `pages/` directory — App Router only
- Don't use `axios` — use native `fetch`
- Don't create separate Express backend — API routes handle everything

## Environment Variables (.env.local)

```
DATABASE_URL=postgresql://...         # Supabase connection string
DIRECT_URL=postgresql://...           # Supabase direct URL (for Prisma migrations)
```