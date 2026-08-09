import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createProductSchema, updateProductSchema, stockMovementSchema } from '../schemas/product.schema';
import { Role } from '../generated/prisma';

export const router = Router();
router.use(authenticate);

// List products
router.get('/', async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
  const search = (req.query.search as string) || '';
  const category = req.query.category as string;
  const lowStock = req.query.lowStock === 'true';

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
      { category: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (category) {
    where.category = { equals: category, mode: 'insensitive' };
  }

  let data: any[];
  let total: number;

  if (lowStock) {
    // Prisma can't compare two columns natively, so we filter in JS
    const allMatching = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    data = allMatching.filter((p: any) => p.currentStock <= p.minStockAlert);
    total = data.length;
    // Apply pagination manually
    data = data.slice((page - 1) * limit, page * limit);
  } else {
    [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);
  }

  res.json({
    success: true,
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// Get product by ID with stock movements
router.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      stockMovements: {
        include: { createdBy: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  });

  if (!product) {
    res.status(404).json({ success: false, message: 'Product not found' });
    return;
  }

  res.json({ success: true, data: product });
});

// Create product
router.post('/', authorize(Role.ADMIN, Role.WAREHOUSE), validate(createProductSchema), async (req: Request, res: Response) => {
  const product = await prisma.product.create({ data: req.body });
  res.status(201).json({ success: true, data: product });
});

// Update product
router.put('/:id', authorize(Role.ADMIN, Role.WAREHOUSE), validate(updateProductSchema), async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ success: false, message: 'Product not found' });
    return;
  }

  const product = await prisma.product.update({ where: { id }, data: req.body });
  res.json({ success: true, data: product });
});

// Record stock movement
router.post('/:id/stock-movements', authorize(Role.ADMIN, Role.WAREHOUSE), validate(stockMovementSchema), async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { quantityChanged, movementType, reason } = req.body;

  const result = await prisma.$transaction(async (tx: any) => {
    const product = await tx.product.findUnique({ where: { id } });
    if (!product) {
      throw Object.assign(new Error('Product not found'), { statusCode: 404 });
    }

    if (movementType === 'OUT' && product.currentStock < quantityChanged) {
      throw Object.assign(
        new Error(`Insufficient stock. Available: ${product.currentStock}, Requested: ${quantityChanged}`),
        { statusCode: 400 }
      );
    }

    const stockChange = movementType === 'IN' ? quantityChanged : -quantityChanged;

    await tx.product.update({
      where: { id },
      data: { currentStock: { increment: stockChange } },
    });

    return tx.stockMovement.create({
      data: {
        productId: id,
        quantityChanged,
        movementType,
        reason,
        createdById: req.user!.userId,
      },
      include: { createdBy: { select: { id: true, name: true } } },
    });
  });

  res.status(201).json({ success: true, data: result });
});

// List stock movements for a product
router.get('/:id/stock-movements', async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));

  const [data, total] = await Promise.all([
    prisma.stockMovement.findMany({
      where: { productId: id },
      include: { createdBy: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.stockMovement.count({ where: { productId: id } }),
  ]);

  res.json({
    success: true,
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});
