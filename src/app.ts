import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { corsOptions } from './config/cors';

import healthRoutes from './routes/healthRoutes';
import authRoutes from './routes/authRoutes';
import sparePartRoutes from './routes/sparePartRoutes';
import purchaseRoutes from './routes/purchaseRoutes';
import saleRoutes from './routes/saleRoutes';
import paymentRoutes from './routes/paymentRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import userRoutes from './routes/userRoutes';

import { errorHandler } from './middleware/errorMiddleware';
import { notFoundHandler } from './middleware/notFoundMiddleware';

const app: Application = express();

// Global Middlewares
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/spare-parts', sparePartRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error & Not Found Handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
