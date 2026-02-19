import { Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { transportService } from './service';
import { AuthRequest } from '../../middlewares/auth.middleware';

export const flightValidators = [
  body('bookingId').isUUID(),
  body('airline').trim().notEmpty(),
  body('flightNumber').trim().notEmpty(),
  body('departureCity').trim().notEmpty(),
  body('arrivalCity').trim().notEmpty(),
  body('departureAt').isISO8601(),
  body('arrivalAt').isISO8601(),
  body('seatNumber').optional().trim(),
  body('pnr').optional().trim(),
];

export async function addFlight(
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
    const flight = await transportService.addFlight(req.body);
    res.status(201).json({ success: true, data: flight });
  } catch (e) {
    next(e);
  }
}

export const trainValidators = [
  body('bookingId').isUUID(),
  body('trainName').trim().notEmpty(),
  body('trainNumber').trim().notEmpty(),
  body('departureCity').trim().notEmpty(),
  body('arrivalCity').trim().notEmpty(),
  body('departureAt').isISO8601(),
  body('arrivalAt').isISO8601(),
  body('coach').optional().trim(),
  body('seatNumber').optional().trim(),
  body('pnr').optional().trim(),
];

export async function addTrain(
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
    const train = await transportService.addTrain(req.body);
    res.status(201).json({ success: true, data: train });
  } catch (e) {
    next(e);
  }
}

export const busValidators = [
  body('bookingId').isUUID(),
  body('busOperator').trim().notEmpty(),
  body('departureCity').trim().notEmpty(),
  body('arrivalCity').trim().notEmpty(),
  body('departureAt').isISO8601(),
  body('arrivalAt').isISO8601(),
  body('seatNumber').optional().trim(),
];

export async function addBus(
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
    const bus = await transportService.addBus(req.body);
    res.status(201).json({ success: true, data: bus });
  } catch (e) {
    next(e);
  }
}
