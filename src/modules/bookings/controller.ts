import { Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { bookingsService } from './service';
import { AuthRequest } from '../../middlewares/auth.middleware';

export const createBookingValidators = [
  body('packageId').isUUID(),
  body('packageScheduleId').isUUID(),
  body('packageVariantId').isUUID(),
  body('travelers').isArray().notEmpty(),
  body('travelers.*.firstName').trim().notEmpty(),
  body('travelers.*.lastName').trim().notEmpty(),
  body('travelers.*.email').optional().isEmail(),
  body('travelers.*.phone').optional().trim(),
  body('travelers.*.dateOfBirth').optional().isISO8601(),
  body('travelers.*.passportNo').optional().trim(),
  body('travelers.*.passportExpiry').optional().isISO8601(),
  body('travelers.*.seatPreference').optional().trim(),
  body('addons').optional().isArray(),
  body('addons.*.name').optional().trim().notEmpty(),
  body('addons.*.amount').optional().isFloat({ min: 0 }),
  body('addons.*.quantity').optional().isInt({ min: 1 }).toInt(),
  body('couponCode').optional().trim(),
  body('specialRequests').optional().trim(),
];

export async function createBooking(
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
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const booking = await bookingsService.create(req.user.id, req.body);
    res.status(201).json({ success: true, data: booking });
  } catch (e) {
    next(e);
  }
}

export const bookingIdValidators = [param('id').isUUID()];

export async function getBooking(
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
    // For regular users, restrict to their own booking.
    // Staff/Admin can view any booking.
    const role = req.user?.role;
    const userId =
      role === 'STAFF' || role === 'ADMIN'
        ? undefined
        : req.user?.id;
    const booking = await bookingsService.getById(req.params.id, userId);
    res.json({ success: true, data: booking });
  } catch (e) {
    next(e);
  }
}

export const listBookingsValidators = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('status').optional().isIn(['DRAFT', 'PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'REFUNDED']),
  query('userId').optional().isUUID(),
];

export async function listMyBookings(
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
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const result = await bookingsService.listMyBookings(req.user.id, req.query as Record<string, unknown>);
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

export async function listBookingsAdmin(
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
    const result = await bookingsService.listAdmin(req.query as Record<string, unknown>);
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

export const updateStepValidators = [
  param('id').isUUID(),
  body('step').isInt({ min: 1 }).toInt(),
  body('travelers').optional().isArray(),
  body('addons').optional().isArray(),
  body('specialRequests').optional().trim(),
];

export async function updateStep(
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
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const booking = await bookingsService.updateStep(req.params.id, req.user.id, req.body);
    res.json({ success: true, data: booking });
  } catch (e) {
    next(e);
  }
}

export const applyCouponValidators = [
  param('id').isUUID(),
  body('couponCode').trim().notEmpty(),
];

export async function applyCoupon(
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
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const booking = await bookingsService.applyCoupon(req.params.id, req.user.id, { couponCode: req.body.couponCode });
    res.json({ success: true, data: booking });
  } catch (e) {
    next(e);
  }
}

export async function confirmBooking(
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
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const booking = await bookingsService.confirm(req.params.id, req.user.id);
    res.json({ success: true, data: booking });
  } catch (e) {
    next(e);
  }
}

export async function cancelBooking(
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
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const booking = await bookingsService.cancel(req.params.id, req.user.id);
    res.json({ success: true, data: booking });
  } catch (e) {
    next(e);
  }
}
