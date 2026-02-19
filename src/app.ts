import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { config } from './config/env';
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.middleware';
import { webhook as paymentWebhook } from './modules/payments/controller';

import { authRoutes } from './modules/auth/routes';
import { usersRoutes } from './modules/users/routes';
import { staffRoutes } from './modules/staff/routes';
import { packagesRoutes } from './modules/packages/routes';
import { bookingsRoutes } from './modules/bookings/routes';
import { transportRoutes } from './modules/transport/routes';
import { paymentsRoutes } from './modules/payments/routes';
import { leadsRoutes } from './modules/leads/routes';
import { documentsRoutes } from './modules/documents/routes';
import { visaRoutes } from './modules/visa/routes';
import { supportRoutes } from './modules/support/routes';
import { reviewsRoutes } from './modules/reviews/routes';
import { couponsRoutes } from './modules/coupons/routes';
import { bannersRoutes } from './modules/banners/routes';
import { citiesRoutes } from './modules/cities/routes';
import { formsRoutes } from './modules/forms/routes';
import { notificationsRoutes } from './modules/notifications/routes';
import { reportsRoutes } from './modules/reports/routes';
import { aiRoutes } from './modules/ai/routes';

const app = express();
const apiPrefix = config.apiPrefix;

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

app.post(
  `${apiPrefix}/payments/webhook`,
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    const raw = req.body as Buffer;
    (req as express.Request & { rawBody?: Buffer }).rawBody = raw;
    try {
      (req as express.Request).body = raw.length ? JSON.parse(raw.toString()) : {};
    } catch {
      (req as express.Request).body = {};
    }
    next();
  },
  paymentWebhook
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/users`, usersRoutes);
app.use(`${apiPrefix}/staff`, staffRoutes);
app.use(`${apiPrefix}/packages`, packagesRoutes);
app.use(`${apiPrefix}/bookings`, bookingsRoutes);
app.use(`${apiPrefix}/transport`, transportRoutes);
app.use(`${apiPrefix}/payments`, paymentsRoutes);
app.use(`${apiPrefix}/leads`, leadsRoutes);
app.use(`${apiPrefix}/documents`, documentsRoutes);
app.use(`${apiPrefix}/visa`, visaRoutes);
app.use(`${apiPrefix}/support`, supportRoutes);
app.use(`${apiPrefix}/reviews`, reviewsRoutes);
app.use(`${apiPrefix}/coupons`, couponsRoutes);
app.use(`${apiPrefix}/banners`, bannersRoutes);
app.use(`${apiPrefix}/cities`, citiesRoutes);
app.use(`${apiPrefix}/forms`, formsRoutes);
app.use(`${apiPrefix}/notifications`, notificationsRoutes);
app.use(`${apiPrefix}/reports`, reportsRoutes);
app.use(`${apiPrefix}/ai`, aiRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
