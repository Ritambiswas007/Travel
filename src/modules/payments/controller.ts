import { Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import { paymentsService } from './service';
import { AuthRequest } from '../../middlewares/auth.middleware';

export const createOrderValidators = [
  body('bookingId').isUUID(),
  body('amount').optional().isFloat({ min: 0 }),
  body('currency').optional().trim(),
  body('idempotencyKey').optional().trim(),
];

export async function createOrder(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
      res.status(400).json({ success: false, errors: errs.array() });
      return;
    }
    const result = await paymentsService.createOrder(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

export async function webhook(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
    const rawStr = rawBody ? rawBody.toString() : JSON.stringify(req.body);
    const isValid = await paymentsService.verifyWebhook(rawStr, signature);
    if (!isValid) {
      res.status(400).json({ success: false, message: 'Invalid signature' });
      return;
    }
    await paymentsService.handleWebhook(req.body);
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
}

export const paymentIdValidators = [param('id').isUUID()];

export async function getPayment(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
      res.status(400).json({ success: false, errors: errs.array() });
      return;
    }
    const payment = await paymentsService.getPayment(req.params.id);
    res.json({ success: true, data: payment });
  } catch (e) {
    next(e);
  }
}

export const bookingIdValidators = [param('bookingId').isUUID()];

export async function getByBooking(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
      res.status(400).json({ success: false, errors: errs.array() });
      return;
    }
    const payments = await paymentsService.getByBookingId(req.params.bookingId);
    res.json({ success: true, data: payments });
  } catch (e) {
    next(e);
  }
}

export const refundValidators = [
  body('paymentId').isUUID(),
  body('amount').isFloat({ min: 0 }),
  body('reason').optional().trim(),
];

export async function initiateRefund(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
      res.status(400).json({ success: false, errors: errs.array() });
      return;
    }
    const refund = await paymentsService.initiateRefund(req.body);
    res.status(201).json({ success: true, data: refund });
  } catch (e) {
    next(e);
  }
}
