import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

export const router = Router();
router.use(authenticate);

router.get('/stats', async (_req: Request, res: Response) => {
  const now = new Date();

  const [
    totalCustomers,
    activeCustomers,
    totalProducts,
    totalChallans,
    recentChallans,
    allProducts,
    pendingFollowUps,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.customer.count({ where: { status: 'ACTIVE' } }),
    prisma.product.count(),
    prisma.salesChallan.count(),
    prisma.salesChallan.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
    }),
    prisma.product.findMany({ select: { currentStock: true, minStockAlert: true } }),
    prisma.customer.count({
      where: {
        followUpDate: { lte: now },
        status: { not: 'INACTIVE' },
      },
    }),
  ]);

  const lowStockProducts = allProducts.filter((p: any) => p.currentStock <= p.minStockAlert).length;

  res.json({
    success: true,
    data: {
      totalCustomers,
      activeCustomers,
      totalProducts,
      lowStockProducts,
      totalChallans,
      recentChallans,
      pendingFollowUps,
    },
  });
});
