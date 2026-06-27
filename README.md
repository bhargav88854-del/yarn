# YarnTrack 🧵

A professional warehouse **inventory management system** for tracking yarn &
thread stock — built with Next.js (App Router), Prisma, PostgreSQL, and an
inventory-aware AI assistant powered by Google Gemini.

> **Live demo:** _add your Vercel URL here after deploying_
> **Logins:** `admin@gmail.com` / `admin123` · `staff@gmail.com` / `staff123`

---

## Features

**Inventory**
- Yarn catalogue with auto-generated IDs (`Y001`, `Y002`, …), per-yarn unit,
  cost, reorder level, rack location and supplier.
- Server-side **search, filter, sort and pagination** (case-insensitive).
- Inline **stock IN / OUT** movements that atomically adjust quantity —
  stock only ever moves through the transaction log (no silent edits).

**Valuation & reports**
- Dashboard KPIs: total stock value (₹), stock count, types, low-stock count.
- **Stock Value by Material** chart + monthly movement chart.
- Low-stock report against each yarn's own reorder level.

**Reorder & labels**
- **Reorder page**: yarns below reorder level grouped into one purchase order
  per supplier, with suggested order quantities and cost.
- **QR labels**: printable QR per yarn — scan to open its detail page.

**Audit & roles**
- Every movement records a **note, reference (PO/invoice), and who logged it**.
- **Role-based access**: admins manage yarns and import; staff log movements.

**Data**
- **CSV import / export** for inventory and the full transaction log.

**AI assistant**
- Floating chat widget backed by **Google Gemini**, grounded in a live
  inventory snapshot — ask "what's low on stock?", "total value?",
  "where is Y008?".

**Auth**
- Email/password sign-in via **Auth.js (NextAuth v5)**, JWT sessions,
  middleware-protected routes.

---

## Tech stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router, Server Components) |
| Language | TypeScript (strict) |
| Database | PostgreSQL (Supabase) via Prisma ORM |
| Auth | Auth.js / NextAuth v5 (credentials, bcrypt) |
| UI | Tailwind CSS, shadcn/ui, Recharts, lucide-react |
| AI | Google Gemini (`gemini-2.5-flash`) |
| Tests | Vitest |
| Hosting | Vercel |

---

## Getting started (local)

### 1. Prerequisites
- Node.js 20+
- A PostgreSQL database (a free [Supabase](https://supabase.com) project works)

### 2. Environment
Copy the example and fill it in:
```bash
cp .env.example .env
```
| Variable | What it is |
|---|---|
| `DATABASE_URL` | Supabase **pooled** connection (port 6543, `?pgbouncer=true`) |
| `DIRECT_URL` | Supabase **direct** connection (port 5432) — for migrations |
| `AUTH_SECRET` | `openssl rand -base64 33` |
| `GEMINI_API_KEY` | from [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |

### 3. Install, migrate, seed, run
```bash
npm install
npx prisma migrate deploy   # creates the schema
npm run seed                # demo yarns + admin/staff users
npm run dev                 # http://localhost:3000
```

---

## Scripts
| Command | Does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | `prisma generate` + `migrate deploy` + `next build` |
| `npm run seed` | Seed demo data |
| `npm test` | Run the Vitest suite |

---

## Deployment (Vercel + Supabase)

1. **Supabase** → create a project → Settings → Database → copy the **pooled**
   (`DATABASE_URL`) and **direct** (`DIRECT_URL`) connection strings.
2. Push this repo to GitHub.
3. **Vercel** → New Project → import the repo.
4. Add env vars: `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `GEMINI_API_KEY`.
5. Deploy. The build runs `prisma migrate deploy` automatically; run
   `npm run seed` once against the prod DB to load the demo data.

---

## Project structure
```
app/
  (app)/        dashboard, inventory, transactions, reorder, reports, storage, labels
  api/          yarns, transactions, reports, chat, auth, csv import/export
  login/        sign-in page
components/      UI + feature components (yarn-table, charts, chat-widget, …)
lib/            prisma, auth helpers, reports, csv, validation, utils
prisma/         schema + seed
tests/          Vitest unit tests
```

---

Built with [Claude Code](https://claude.com/claude-code).
