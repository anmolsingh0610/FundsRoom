import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction): void {
  console.error('[Error]', err.message || err);

  // Prisma known request errors
  if (err.constructor?.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[])?.join(', ') || 'field';
      res.status(409).json({ success: false, message: `Duplicate value for ${target}` });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Record not found' });
      return;
    }
  }

  // Prisma validation errors
  if (err.constructor?.name === 'PrismaClientValidationError') {
    res.status(400).json({ success: false, message: 'Invalid data provided' });
    return;
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
  });
}
