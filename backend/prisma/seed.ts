import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient, Role, CustomerType, CustomerStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL || '';
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const users = [
    { email: 'admin@erp.com', name: 'Admin User', role: Role.ADMIN },
    { email: 'sales@erp.com', name: 'Sales User', role: Role.SALES },
    { email: 'warehouse@erp.com', name: 'Warehouse User', role: Role.WAREHOUSE },
    { email: 'accounts@erp.com', name: 'Accounts User', role: Role.ACCOUNTS },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        password: passwordHash,
        name: user.name,
        role: user.role,
      },
    });
  }

  const admin = await prisma.user.findUniqueOrThrow({ where: { email: 'admin@erp.com' } });

  // Seed customers
  await prisma.customer.upsert({
    where: { id: 'seed-customer-1' },
    update: {},
    create: {
      id: 'seed-customer-1',
      name: 'Rajesh Traders',
      mobile: '9876543210',
      email: 'rajesh@traders.com',
      businessName: 'Rajesh Traders Pvt Ltd',
      gstNumber: '29ABCDE1234F1Z5',
      customerType: CustomerType.WHOLESALE,
      address: '12 Industrial Area, Bangalore',
      status: CustomerStatus.ACTIVE,
      notes: 'Regular wholesale buyer',
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.customer.upsert({
    where: { id: 'seed-customer-2' },
    update: {},
    create: {
      id: 'seed-customer-2',
      name: 'Priya Supermart',
      mobile: '9123456789',
      email: 'priya@supermart.in',
      businessName: 'Priya Supermart',
      customerType: CustomerType.RETAIL,
      address: '45 MG Road, Mumbai',
      status: CustomerStatus.LEAD,
      notes: 'Interested in bulk orders',
      followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.customer.upsert({
    where: { id: 'seed-customer-3' },
    update: {},
    create: {
      id: 'seed-customer-3',
      name: 'National Distributors',
      mobile: '9988776655',
      email: 'info@nationaldist.com',
      businessName: 'National Distributors LLP',
      gstNumber: '07GHIJK5678L2M3',
      customerType: CustomerType.DISTRIBUTOR,
      address: '78 Nehru Place, Delhi',
      status: CustomerStatus.ACTIVE,
      notes: 'North India distribution partner',
    },
  });

  // Seed products
  await prisma.product.upsert({
    where: { sku: 'SKU-001' },
    update: {},
    create: {
      name: 'Premium Rice 25kg',
      sku: 'SKU-001',
      category: 'Grains',
      unitPrice: 1250.00,
      currentStock: 100,
      minStockAlert: 20,
      location: 'Warehouse A',
    },
  });

  await prisma.product.upsert({
    where: { sku: 'SKU-002' },
    update: {},
    create: {
      name: 'Cooking Oil 5L',
      sku: 'SKU-002',
      category: 'Oils',
      unitPrice: 680.00,
      currentStock: 50,
      minStockAlert: 10,
      location: 'Warehouse B',
    },
  });

  await prisma.product.upsert({
    where: { sku: 'SKU-003' },
    update: {},
    create: {
      name: 'Sugar 10kg',
      sku: 'SKU-003',
      category: 'Sweeteners',
      unitPrice: 450.00,
      currentStock: 8,
      minStockAlert: 15,
      location: 'Warehouse A',
    },
  });

  await prisma.product.upsert({
    where: { sku: 'SKU-004' },
    update: {},
    create: {
      name: 'Wheat Flour 50kg',
      sku: 'SKU-004',
      category: 'Grains',
      unitPrice: 1800.00,
      currentStock: 75,
      minStockAlert: 25,
      location: 'Warehouse A',
    },
  });

  await prisma.product.upsert({
    where: { sku: 'SKU-005' },
    update: {},
    create: {
      name: 'Toor Dal 30kg',
      sku: 'SKU-005',
      category: 'Pulses',
      unitPrice: 3200.00,
      currentStock: 5,
      minStockAlert: 10,
      location: 'Warehouse B',
    },
  });

  console.log('✅ Seed completed successfully.');
  console.log('');
  console.log('Test credentials (all roles use password: password123):');
  console.log('  Admin:     admin@erp.com');
  console.log('  Sales:     sales@erp.com');
  console.log('  Warehouse: warehouse@erp.com');
  console.log('  Accounts:  accounts@erp.com');
  console.log('');
  console.log('Seeded: 4 users, 3 customers, 5 products (2 with low stock alerts)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
