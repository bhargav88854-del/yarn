# YarnTrack — Yarn Inventory Management System

Warehouse system for tracking yarn / thread stock: inventory by rack, stock
movements in and out, low-stock alerts, and monthly usage reports.

## Stack

- Next.js 14 (App Router, TypeScript)
- Prisma ORM + SQLite (dev) — swap to PostgreSQL/Supabase for production
- Tailwind CSS + Radix UI primitives
- Recharts for reporting

## Getting started

```bash
npm install
cp .env.example .env          # SQLite, zero-config
npx prisma migrate dev        # create the database
npm run seed                  # load sample yarns + movements
npm run dev                   # http://localhost:3000
```

## Routes

| Path | Purpose |
|---|---|
| `/` | Landing page |
| `/dashboard` | KPI cards, recent yarns, low-stock alerts |
| `/inventory` | Searchable/filterable yarn table, add/edit/delete, stock in/out |
| `/inventory/[id]` | Yarn detail + edit + movement history |
| `/transactions` | Stock movement log (IN/OUT) |
| `/reports` | Low-stock report + monthly usage chart |
| `/storage` | Rack layout grouped by rack prefix |

## API

`/api/yarns`, `/api/yarns/[id]`, `/api/transactions`, `/api/reports` — JSON
route handlers, Zod-validated, stock movements run in a Prisma transaction.

## Conventions

- Yarn IDs: `Y001`, `Y002`, …
- Locations: `Rack A-12`
- Unit: cones · Low-stock threshold: `< 50`
- Low-stock badge: red `< 50`, amber `< 100`, green otherwise
