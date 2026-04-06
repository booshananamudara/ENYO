# ShopEnyo.com

E-commerce shopping aggregator web platform. Users add products from various online stores using the EnyoCart Chrome extension, then checkout once on ShopEnyo.com.

## Architecture

```
Client Component / Page
    ↓ calls
API Route Handler     ← parses request, validates with Zod, returns response
    ↓ delegates to
Service Layer         ← contains ALL business logic, throws typed errors
    ↓ uses
Repository Layer      ← Prisma queries, data access only
    ↓ returns
DTO Layer             ← maps Prisma models to client-safe response objects
```

## Tech Stack

- **Framework**: Next.js 14+ (App Router, TypeScript)
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: NextAuth.js v5 (Credentials + Google OAuth)
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Validation**: Zod
- **Email**: Resend
- **State**: React Context + useReducer (cart)
- **Charts**: Recharts
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+
- npm
- PostgreSQL instance

## Setup

```bash
# Install dependencies
npm install

# Copy env file and configure
cp .env.example .env.local

# Run database migrations
npx prisma migrate dev

# Seed the database
npx tsx prisma/seed.ts

# Start dev server
npm run dev
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Login, register, forgot password
│   ├── (storefront)/       # Customer-facing pages
│   ├── (admin)/            # Admin dashboard pages
│   └── api/                # API route handlers
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   ├── storefront/         # Customer-facing components
│   ├── admin/              # Admin components
│   └── shared/             # Reusable components (DataTable, StatusBadge, etc.)
├── lib/
│   ├── types/              # TypeScript types (single source of truth)
│   ├── validators/         # Zod schemas (shared client/server)
│   ├── services/           # Business logic layer
│   ├── repositories/       # Data access layer (Prisma)
│   ├── dto/                # Data Transfer Objects
│   ├── interfaces/         # Abstract interfaces
│   ├── auth.ts             # NextAuth configuration
│   ├── order-state-machine.ts # Order status transitions
│   └── constants.ts        # Payment registry, status configs
├── hooks/                  # React hooks
├── contexts/               # React Context providers
└── emails/                 # Email templates
```

## Coding Standards

- **SOLID**: Single responsibility per file, strategy pattern for payments, state machine for orders
- **DRY**: Shared Zod schemas, single DataTable<T>, shared StatusBadge, single api-client.ts
- **KISS**: React Context for cart, server components by default, flat component hierarchy

## API Routes

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/health` | GET | No | Health check |
| `/api/orders` | GET | User | List orders (admin sees all) |
| `/api/orders` | POST | User | Create order |
| `/api/orders/[id]` | GET | User | Order detail |
| `/api/orders/[id]` | PATCH | Admin | Update order status |
| `/api/orders/[id]/fulfill` | POST | Admin | Mark fulfilled |
| `/api/customers` | GET | Admin | List customers |
| `/api/returns` | GET | User | List returns |
| `/api/returns` | POST | User | Create return |
| `/api/returns/[id]` | PATCH | Admin | Update return |
| `/api/payments` | GET | Admin | List payments |
| `/api/payments/webhook` | POST | No | Bankful webhook |
| `/api/payments/initiate` | POST | User | Initiate payment |
| `/api/exchange-rates` | GET | No | Exchange rates |
| `/api/exchange-rates` | PUT | Admin | Update rates |
| `/api/analytics` | GET | Admin | Dashboard stats |
| `/api/extension/auth` | POST | No | Extension login |
| `/api/extension/cart` | POST | JWT | Submit cart |

## Chrome Extension Integration

1. Extension base64-encodes cart → redirects to `shopEnyo.com/checkout?cart=ENCODED`
2. Extension POSTs to `/api/extension/auth` → receives JWT
3. Extension POSTs cart to `/api/extension/cart` with Bearer token

## Seed Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@shopEnyo.com | admin123 | SUPER_ADMIN |
| staff@shopEnyo.com | staff123 | ADMIN |
| alice@example.com | customer123 | CUSTOMER |
| bob@example.com | customer123 | CUSTOMER |
| carol@example.com | customer123 | CUSTOMER |

## Scripts

```bash
npm run dev        # Start development server
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
npm run db:migrate # Run Prisma migrations
npm run db:seed    # Seed database
```

## Deployment

1. Deploy to Vercel
2. Add PostgreSQL (Neon or Supabase)
3. Set environment variables
4. Run `npx prisma migrate deploy`
