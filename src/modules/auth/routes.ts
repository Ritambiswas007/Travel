import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import {
  loginEmail,
  loginEmailValidators,
  loginPhone,
  loginPhoneValidators,
  sendOtp,
  sendOtpValidators,
  register,
  registerValidators,
  refresh,
  refreshValidators,
  logout,
  logoutValidators,
  logoutAll,
  forgotPassword,
  forgotPasswordValidators,
  resetPassword,
  resetPasswordValidators,
} from './controller';

const router = Router();

router.post('/login/email', loginEmailValidators, loginEmail);
router.post('/login/phone', loginPhoneValidators, loginPhone);
router.post('/send-otp', sendOtpValidators, sendOtp);
router.post('/register', registerValidators, register);
router.post('/refresh', refreshValidators, refresh);
router.post('/logout', logoutValidators, logout);
router.post('/forgot-password', forgotPasswordValidators, forgotPassword);
router.post('/reset-password', resetPasswordValidators, resetPassword);

router.post('/logout-all', authMiddleware, logoutAll);

export const authRoutes = router;
