import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import { router as authRoutes } from './routes/auth.routes';
import { router as customerRoutes } from './routes/customer.routes';
import { router as productRoutes } from './routes/product.routes';
import { router as challanRoutes } from './routes/challan.routes';
import { router as dashboardRoutes } from './routes/dashboard.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Mini ERP + CRM API is running' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/challans', challanRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Global error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
