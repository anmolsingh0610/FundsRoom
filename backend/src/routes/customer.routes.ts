import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCustomerSchema, updateCustomerSchema, addFollowUpSchema } from '../schemas/customer.schema';
import { Role } from '@prisma/client';

export const router = Router();
router.use(authenticate);

// List customers with pagination, search, filters
router.get('/', async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
  const search = (req.query.search as string) || '';
  const status = req.query.status as string;
  const customerType = req.query.type as string;

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { mobile: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { businessName: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status && ['LEAD', 'ACTIVE', 'INACTIVE'].includes(status)) {
    where.status = status;
  }

  if (customerType && ['RETAIL', 'WHOLESALE', 'DISTRIBUTOR'].includes(customerType)) {
    where.customerType = customerType;
  }

  const [data, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.customer.count({ where }),
  ]);

  res.json({
    success: true,
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// Get customer by ID with follow-ups
router.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      followUps: {
        include: { createdBy: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!customer) {
    res.status(404).json({ success: false, message: 'Customer not found' });
    return;
  }

  res.json({ success: true, data: customer });
});

// Create customer
router.post('/', authorize(Role.ADMIN, Role.SALES), validate(createCustomerSchema), async (req: Request, res: Response) => {
  const data = req.body;
  if (data.followUpDate) {
    data.followUpDate = new Date(data.followUpDate);
  }

  const customer = await prisma.customer.create({ data });
  res.status(201).json({ success: true, data: customer });
});

// Update customer
router.put('/:id', authorize(Role.ADMIN, Role.SALES), validate(updateCustomerSchema), async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ success: false, message: 'Customer not found' });
    return;
  }

  const data = req.body;
  if (data.followUpDate) {
    data.followUpDate = new Date(data.followUpDate);
  }

  const customer = await prisma.customer.update({ where: { id }, data });
  res.json({ success: true, data: customer });
});

// Add follow-up note
router.post('/:id/follow-ups', authorize(Role.ADMIN, Role.SALES), validate(addFollowUpSchema), async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ success: false, message: 'Customer not found' });
    return;
  }

  const followUp = await prisma.customerFollowUp.create({
    data: {
      customerId: id,
      note: req.body.note,
      createdById: req.user!.userId,
    },
    include: { createdBy: { select: { id: true, name: true } } },
  });

  res.status(201).json({ success: true, data: followUp });
});
