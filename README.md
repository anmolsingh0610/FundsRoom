# Mini ERP + CRM Operations Portal

A full-stack ERP/CRM system built for wholesale/distribution companies. Manages customers, products, stock, sales challans, and CRM follow-ups with role-based access control.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js, TypeScript, Express.js v5, Prisma ORM v7 |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Zustand, React Router v7 |
| **Database** | PostgreSQL 16 |
| **Auth** | JWT (JSON Web Tokens) |
| **Validation** | Zod v4 |
| **Icons** | Lucide React |

## Architecture

```
D:\crm\
├── backend/                  # Express.js REST API
│   ├── prisma/               # Database schema & migrations
│   │   ├── schema.prisma     # Prisma schema (7 models, 5 enums)
│   │   └── seed.ts           # Test data seeder
│   └── src/
│       ├── generated/prisma/ # Prisma-generated client
│       ├── lib/              # Prisma client singleton, JWT utilities
│       ├── middleware/       # Auth, validation, error handling
│       ├── schemas/          # Zod validation schemas
│       ├── routes/           # Express route handlers
│       └── index.ts          # App entry point
├── frontend/                 # React SPA
│   └── src/
│       ├── components/       # Layout shell + UI component library
│       ├── pages/            # Route-level page components
│       ├── stores/           # Zustand state (auth, toasts)
│       └── lib/              # Axios API client
├── docker-compose.yml        # Full-stack Docker setup
└── .env.example              # Environment variable template
```

### Database Schema

```
User ──────── StockMovement ──── Product
  │                                │
  ├── CustomerFollowUp             ├── SalesChallanItem (JSON snapshot)
  │           │                    │
  └── SalesChallan ── Customer     └── SalesChallan
```

**Models:** User, Customer, CustomerFollowUp, Product, StockMovement, SalesChallan, SalesChallanItem

**Enums:** Role (ADMIN/SALES/WAREHOUSE/ACCOUNTS), CustomerType, CustomerStatus, StockMovementType, ChallanStatus

## Core Modules

### 1. Authentication & Roles
- JWT-based login with role-based access control
- 4 roles: Admin, Sales, Warehouse, Accounts
- Protected routes with middleware guards

### 2. Customer CRM
- Full CRUD with search (name/mobile/email/business)
- Filter by status (Lead/Active/Inactive) and type (Retail/Wholesale/Distributor)
- Follow-up notes timeline with audit trail
- Pagination support

### 3. Product & Inventory
- Product management with SKU, category, pricing
- Stock movement log (IN/OUT) with full audit trail
- Low-stock alerts (currentStock ≤ minStockAlert)
- Atomic stock transactions with Prisma

### 4. Sales Challan
- Auto-generated challan numbers: `CH-YYYYMMDD-XXXX`
- Multi-product line items with quantity
- Product snapshot JSON stored at creation time
- Draft → Confirmed → Cancelled workflow
- **Stock validation on confirm:** checks ALL items atomically, returns detailed error if insufficient
- **Stock restoration on cancel:** reverses stock if challan was confirmed

## API Endpoints

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| `POST` | `/api/auth/login` | ❌ | All | Login, returns JWT |
| `GET` | `/api/auth/me` | ✅ | All | Current user profile |
| `GET` | `/api/dashboard/stats` | ✅ | All | Dashboard statistics |
| `GET` | `/api/customers` | ✅ | All | List (paginated, search, filter) |
| `GET` | `/api/customers/:id` | ✅ | All | Detail with follow-ups |
| `POST` | `/api/customers` | ✅ | Admin, Sales | Create |
| `PUT` | `/api/customers/:id` | ✅ | Admin, Sales | Update |
| `POST` | `/api/customers/:id/follow-ups` | ✅ | Admin, Sales | Add follow-up note |
| `GET` | `/api/products` | ✅ | All | List (paginated, search, filter, lowStock) |
| `GET` | `/api/products/:id` | ✅ | All | Detail with stock movements |
| `POST` | `/api/products` | ✅ | Admin, Warehouse | Create |
| `PUT` | `/api/products/:id` | ✅ | Admin, Warehouse | Update |
| `POST` | `/api/products/:id/stock-movements` | ✅ | Admin, Warehouse | Record IN/OUT |
| `GET` | `/api/products/:id/stock-movements` | ✅ | All | Movement history |
| `GET` | `/api/challans` | ✅ | All | List (paginated, filter by status) |
| `GET` | `/api/challans/:id` | ✅ | All | Detail with items |
| `POST` | `/api/challans` | ✅ | Admin, Sales | Create as draft |
| `PUT` | `/api/challans/:id` | ✅ | Admin, Sales | Update draft |
| `PATCH` | `/api/challans/:id/confirm` | ✅ | Admin, Sales | Confirm (reduces stock) |
| `PATCH` | `/api/challans/:id/cancel` | ✅ | Admin, Sales | Cancel (restores stock if confirmed) |

## Quick Start (Local)

### Prerequisites
- Node.js v20+ (`node --version`)
- PostgreSQL 16 (local or cloud — [Neon](https://neon.tech) free tier recommended)

### 1. Clone and install
```bash
git clone <repo-url>
cd crm

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment
```bash
# Copy and edit backend/.env
cp backend/.env.example backend/.env
# Set your DATABASE_URL, e.g.:
# DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/mini_erp_crm?schema=public"
# For Neon: DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

### 3. Set up database
```bash
cd backend

# Run migrations
npm run db:migrate

# Seed test data
npm run db:seed
```

### 4. Start development servers
```bash
# Terminal 1 — Backend (http://localhost:3000)
cd backend
npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend
npm run dev
```

### 5. Open in browser
Navigate to `http://localhost:5173` and log in.

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@erp.com | password123 |
| **Sales** | sales@erp.com | password123 |
| **Warehouse** | warehouse@erp.com | password123 |
| **Accounts** | accounts@erp.com | password123 |

## Docker Setup (Bonus)

```bash
# Start all services (PostgreSQL + Backend + Frontend)
docker-compose up -d

# Run migrations & seed
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npm run db:seed

# Access:
# Frontend: http://localhost:5173
# Backend:  http://localhost:3000
# Database: localhost:5432
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | `fallback-secret` | JWT signing key |
| `JWT_EXPIRES_IN` | ❌ | `7d` | Token expiry duration |
| `PORT` | ❌ | `3000` | Backend server port |
| `FRONTEND_URL` | ❌ | `http://localhost:5173` | CORS origin |
| `NODE_ENV` | ❌ | `development` | Environment mode |
| `VITE_API_URL` | ❌ | `/api` | Frontend API base URL |

## Design Decisions & Assumptions

1. **Product Snapshots:** Challan line items store a JSON snapshot of product data at creation time. This ensures historical accuracy even if products are later modified.

2. **Atomic Stock Operations:** All stock changes (challan confirm/cancel, manual movements) use Prisma transactions to prevent race conditions.

3. **Challan Number Format:** Auto-generated as `CH-YYYYMMDD-XXXX` where XXXX is a daily sequential counter. This ensures uniqueness per day.

4. **Stock Validation:** When confirming a challan, ALL items are validated before ANY stock is reduced. If any product has insufficient stock, the entire operation is rejected with detailed error information.

5. **Role-Based Access:** 
   - Admin: Full access to all modules
   - Sales: Customers + Challans (no direct stock management)
   - Warehouse: Products + Stock movements (no customer/challan access)
   - Accounts: Read-only access to all modules

6. **Soft Workflow:** Challans follow Draft → Confirmed → Cancelled flow. Cancelling a confirmed challan restores stock with audit trail.

## Known Limitations

1. No password reset/change functionality
2. No file upload (product images)
3. No PDF export for challans/invoices
4. No real-time notifications/WebSocket support
5. No audit log for user actions beyond stock movements
6. Low-stock filter uses in-memory filtering (Prisma can't compare two columns natively)

## Bonus Features Included

- [x] Docker setup (Dockerfile + docker-compose.yml)
- [ ] GitHub Actions deployment
- [ ] Export invoice as PDF
- [ ] Upload product image to AWS S3
