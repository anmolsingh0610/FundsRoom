import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { signToken } from '../lib/jwt';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { loginSchema } from '../schemas/auth.schema';

export const router = Router();

router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(401).json({ success: false, message: 'Invalid email or password' });
    return;
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    res.status(401).json({ success: false, message: 'Invalid email or password' });
    return;
  }

  const token = signToken({ userId: user.id, email: user.email, role: user.role });
  const { password: _, ...userWithoutPassword } = user;

  res.json({
    success: true,
    data: {
      token,
      user: userWithoutPassword,
    },
  });
});

router.get('/me', authenticate, async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  res.json({ success: true, data: { user } });
});
