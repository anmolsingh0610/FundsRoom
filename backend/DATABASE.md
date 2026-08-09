# Database Schema — Mini ERP + CRM

PostgreSQL schema managed with **Prisma ORM** (`backend/prisma/schema.prisma`).

## Entity Relationship Overview

```
User (roles: ADMIN, SALES, WAREHOUSE, ACCOUNTS)
  ├── StockMovement (createdBy)
  ├── SalesChallan (createdBy)
  └── CustomerFollowUp (createdBy)

Customer
  ├── CustomerFollowUp (notes timeline)
  └── SalesChallan

Product
  ├── StockMovement
  └── SalesChallanItem (optional productId + JSON snapshot)

SalesChallan
  └── SalesChallanItem (productSnapshot JSON)
```

## Tables

| Model | Purpose |
|-------|---------|
| **User** | JWT auth; role-based access |
| **Customer** | CRM records with type, status, follow-up date |
| **CustomerFollowUp** | Append-only follow-up notes per customer |
| **Product** | Inventory master with stock levels |
| **StockMovement** | Audit log for IN/OUT stock changes |
| **SalesChallan** | Delivery challan header (Draft / Confirmed / Cancelled) |
| **SalesChallanItem** | Line items with **product snapshot JSON** |

## Enums

- **Role:** `ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`
- **CustomerType:** `RETAIL`, `WHOLESALE`, `DISTRIBUTOR`
- **CustomerStatus:** `LEAD`, `ACTIVE`, `INACTIVE`
- **StockMovementType:** `IN`, `OUT`
- **ChallanStatus:** `DRAFT`, `CONFIRMED`, `CANCELLED`

## Product Snapshot (SalesChallanItem)

When a challan is created, each line stores a JSON snapshot so historical data remains even if the product is later edited:

```json
{
  "id": "clx...",
  "name": "Premium Rice 25kg",
  "sku": "SKU-001",
  "category": "Grains",
  "unitPrice": "1250.00",
  "location": "Warehouse A"
}
```

## Setup Commands

```powershell
cd D:\crm\backend

# Generate Prisma Client
npm run db:generate

# Apply migrations (requires PostgreSQL running)
npm run db:migrate

# Seed test users & sample data
npm run db:seed
```

## Test Login Credentials (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@erp.com | password123 |
| Sales | sales@erp.com | password123 |
| Warehouse | warehouse@erp.com | password123 |
| Accounts | accounts@erp.com | password123 |

## Local PostgreSQL Options

1. **Prisma local dev DB:** `npx prisma dev` (runs Postgres in terminal)
2. **Docker:** `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=yourpassword postgres:16`
3. **Cloud (free):** [Neon](https://neon.tech) or [Supabase](https://supabase.com) — paste URL into `backend/.env`

Update `DATABASE_URL` in `backend/.env` before running migrations.
