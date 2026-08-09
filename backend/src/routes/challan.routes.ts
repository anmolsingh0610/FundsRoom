import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createChallanSchema, updateChallanSchema } from '../schemas/challan.schema';
import { Role } from '../generated/prisma';

export const router = Router();
router.use(authenticate);

// List challans
router.get('/', async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
  const status = req.query.status as string;

  const where: any = {};
  if (status && ['DRAFT', 'CONFIRMED', 'CANCELLED'].includes(status)) {
    where.status = status;
  }

  const [data, total] = await Promise.all([
    prisma.salesChallan.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, businessName: true } },
        createdBy: { select: { id: true, name: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.salesChallan.count({ where }),
  ]);

  res.json({
    success: true,
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// Get challan by ID
router.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const challan = await prisma.salesChallan.findUnique({
    where: { id },
    include: {
      customer: true,
      createdBy: { select: { id: true, name: true } },
      items: true,
    },
  });

  if (!challan) {
    res.status(404).json({ success: false, message: 'Challan not found' });
    return;
  }

  res.json({ success: true, data: challan });
});

// Generate challan number
async function generateChallanNumber(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 86400000);

  const count = await prisma.salesChallan.count({
    where: {
      createdAt: { gte: startOfDay, lt: endOfDay },
    },
  });

  const seq = String(count + 1).padStart(4, '0');
  return `CH-${dateStr}-${seq}`;
}

// Create challan (DRAFT)
router.post('/', authorize(Role.ADMIN, Role.SALES), validate(createChallanSchema), async (req: Request, res: Response) => {
  const { customerId, items } = req.body;

  // Verify customer exists
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) {
    res.status(404).json({ success: false, message: 'Customer not found' });
    return;
  }

  const challanNumber = await generateChallanNumber();
  let totalQuantity = 0;

  // Fetch products and build items with snapshots
  const challanItems: any[] = [];
  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product) {
      res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
      return;
    }

    const unitPrice = Number(product.unitPrice);
    const lineTotal = unitPrice * item.quantity;
    totalQuantity += item.quantity;

    challanItems.push({
      productId: product.id,
      productSnapshot: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category,
        unitPrice: unitPrice,
        location: product.location,
      },
      quantity: item.quantity,
      unitPrice: unitPrice,
      lineTotal: lineTotal,
    });
  }

  const challan = await prisma.salesChallan.create({
    data: {
      challanNumber,
      customerId,
      totalQuantity,
      status: 'DRAFT',
      createdById: req.user!.userId,
      items: { create: challanItems },
    },
    include: {
      customer: true,
      createdBy: { select: { id: true, name: true } },
      items: true,
    },
  });

  res.status(201).json({ success: true, data: challan });
});

// Update draft challan
router.put('/:id', authorize(Role.ADMIN, Role.SALES), validate(updateChallanSchema), async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const existing = await prisma.salesChallan.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ success: false, message: 'Challan not found' });
    return;
  }
  if (existing.status !== 'DRAFT') {
    res.status(400).json({ success: false, message: 'Only draft challans can be edited' });
    return;
  }

  const { customerId, items } = req.body;
  let totalQuantity = 0;

  const challanItems: any[] = [];
  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product) {
      res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
      return;
    }

    const unitPrice = Number(product.unitPrice);
    const lineTotal = unitPrice * item.quantity;
    totalQuantity += item.quantity;

    challanItems.push({
      productId: product.id,
      productSnapshot: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category,
        unitPrice: unitPrice,
        location: product.location,
      },
      quantity: item.quantity,
      unitPrice: unitPrice,
      lineTotal: lineTotal,
    });
  }

  // Delete old items and recreate
  const challan = await prisma.$transaction(async (tx: any) => {
    await tx.salesChallanItem.deleteMany({ where: { challanId: id } });
    return tx.salesChallan.update({
      where: { id },
      data: {
        customerId,
        totalQuantity,
        items: { create: challanItems },
      },
      include: {
        customer: true,
        createdBy: { select: { id: true, name: true } },
        items: true,
      },
    });
  });

  res.json({ success: true, data: challan });
});

// Confirm challan
router.patch('/:id/confirm', authorize(Role.ADMIN, Role.SALES), async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const challan: any = await prisma.salesChallan.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!challan) {
    res.status(404).json({ success: false, message: 'Challan not found' });
    return;
  }
  if (challan.status !== 'DRAFT') {
    res.status(400).json({ success: false, message: 'Only draft challans can be confirmed' });
    return;
  }

  // Check stock availability for all items
  const insufficientStock: { productName: string; required: number; available: number }[] = [];

  for (const item of challan.items) {
    if (!item.productId) continue;
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product) continue;

    if (product.currentStock < item.quantity) {
      const snapshot = item.productSnapshot as any;
      insufficientStock.push({
        productName: snapshot?.name || product.name,
        required: item.quantity,
        available: product.currentStock,
      });
    }
  }

  if (insufficientStock.length > 0) {
    res.status(400).json({
      success: false,
      message: 'Insufficient stock for one or more products',
      errors: insufficientStock,
    });
    return;
  }

  // Confirm: reduce stock and create movements in transaction
  const updated = await prisma.$transaction(async (tx: any) => {
    for (const item of challan.items) {
      if (!item.productId) continue;

      await tx.product.update({
        where: { id: item.productId },
        data: { currentStock: { decrement: item.quantity } },
      });

      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          quantityChanged: item.quantity,
          movementType: 'OUT',
          reason: `Sales Challan ${challan.challanNumber}`,
          createdById: req.user!.userId,
        },
      });
    }

    return tx.salesChallan.update({
      where: { id },
      data: { status: 'CONFIRMED' },
      include: {
        customer: true,
        createdBy: { select: { id: true, name: true } },
        items: true,
      },
    });
  });

  res.json({ success: true, data: updated });
});

// Cancel challan
router.patch('/:id/cancel', authorize(Role.ADMIN, Role.SALES), async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const challan: any = await prisma.salesChallan.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!challan) {
    res.status(404).json({ success: false, message: 'Challan not found' });
    return;
  }
  if (challan.status === 'CANCELLED') {
    res.status(400).json({ success: false, message: 'Challan is already cancelled' });
    return;
  }

  const updated = await prisma.$transaction(async (tx: any) => {
    // If confirmed, restore stock
    if (challan.status === 'CONFIRMED') {
      for (const item of challan.items) {
        if (!item.productId) continue;

        await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: { increment: item.quantity } },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantityChanged: item.quantity,
            movementType: 'IN',
            reason: `Cancelled Challan ${challan.challanNumber}`,
            createdById: req.user!.userId,
          },
        });
      }
    }

    return tx.salesChallan.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        customer: true,
        createdBy: { select: { id: true, name: true } },
        items: true,
      },
    });
  });

  res.json({ success: true, data: updated });
});
