import { Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { authService } from './service';
import { AuthRequest } from '../../middlewares/auth.middleware';

export const loginEmailValidators = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

export async function loginEmail(
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
    const result = await authService.loginWithEmail(
      { email: req.body.email, password: req.body.password },
      req.headers['user-agent'],
      req.ip
    );
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

export const loginPhoneValidators = [
  body('phone').notEmpty().trim(),
  body('otp').notEmpty().trim(),
];

export async function loginPhone(
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
    const result = await authService.loginWithPhone(
      { phone: req.body.phone, otp: req.body.otp },
      req.headers['user-agent'],
      req.ip
    );
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

export const sendOtpValidators = [
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim().notEmpty(),
  body('purpose').isIn(['login', 'register', 'forgot_password', 'verify']),
];

export async function sendOtp(
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
    const result = await authService.sendOtp({
      email: req.body.email,
      phone: req.body.phone,
      purpose: req.body.purpose,
    });
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

export const registerValidators = [
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim().notEmpty(),
  body('password').optional().isLength({ min: 6 }),
  body('name').trim().notEmpty(),
  body('role').optional().isIn(['USER', 'STAFF', 'ADMIN']),
];

export async function register(
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
    const result = await authService.register(
      {
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password,
        name: req.body.name,
        role: req.body.role,
      },
      req.headers['user-agent'],
      req.ip
    );
    res.status(201).json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

export const refreshValidators = [
  body('refreshToken').notEmpty(),
];

export async function refresh(
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
    const result = await authService.refreshTokens({
      refreshToken: req.body.refreshToken,
    });
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

export const logoutValidators = [
  body('refreshToken').notEmpty(),
];

export async function logout(
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
    await authService.logout(req.body.refreshToken);
    res.json({ success: true, message: 'Logged out' });
  } catch (e) {
    next(e);
  }
}

export async function logoutAll(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    await authService.logoutAll(req.user.id);
    res.json({ success: true, message: 'Logged out from all devices' });
  } catch (e) {
    next(e);
  }
}

export const forgotPasswordValidators = [
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim().notEmpty(),
];

export async function forgotPassword(
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
    const result = await authService.forgotPassword({
      email: req.body.email,
      phone: req.body.phone,
    });
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

export const resetPasswordValidators = [
  body('token').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
];

export async function resetPassword(
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
    await authService.resetPassword(req.body.token, req.body.newPassword);
    res.json({ success: true, message: 'Password reset successful' });
  } catch (e) {
    next(e);
  }
}
