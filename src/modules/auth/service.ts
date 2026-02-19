import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../config/env';
import { authRepository } from './repository';
import { generateOtp, getOtpExpiry, validateOtpFormat } from '../../utils/otp';
import type {
  LoginEmailDto,
  LoginPhoneDto,
  SendOtpDto,
  RegisterDto,
  ForgotPasswordDto,
  RefreshTokenDto,
  AuthResponseDto,
} from './dto';
import { UserRole } from '@prisma/client';

const SALT_ROUNDS = 10;

function signAccessToken(userId: string, role: UserRole): string {
  return jwt.sign(
    { userId, role, type: 'access' },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiry } as jwt.SignOptions
  );
}

function signRefreshToken(userId: string, role: UserRole): string {
  return jwt.sign(
    { userId, role, type: 'refresh' },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiry } as jwt.SignOptions
  );
}

function getExpiresInSeconds(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) return 900;
  const n = parseInt(match[1], 10);
  const u = match[2];
  if (u === 's') return n;
  if (u === 'm') return n * 60;
  if (u === 'h') return n * 3600;
  if (u === 'd') return n * 86400;
  return 900;
}

function buildAuthResponse(user: NonNullable<Awaited<ReturnType<typeof authRepository.findUserById>>>, accessToken: string, refreshToken: string): AuthResponseDto {
  const name = user.name ?? user.admin?.name ?? user.staff?.name ?? null;
  return {
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      ...(name && { name }),
    },
    accessToken,
    refreshToken,
    expiresIn: getExpiresInSeconds(config.jwt.accessExpiry),
  };
}

export const authService = {
  async loginWithEmail(dto: LoginEmailDto, userAgent?: string, ip?: string): Promise<AuthResponseDto> {
    const user = await authRepository.findUserByEmail(dto.email);
    if (!user || !user.passwordHash) {
      throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    }
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    }
    if (!user.isActive) {
      throw Object.assign(new Error('Account is disabled'), { statusCode: 403 });
    }
    const accessToken = signAccessToken(user.id, user.role);
    const refreshToken = signRefreshToken(user.id, user.role);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await authRepository.createSession({
      userId: user.id,
      refreshToken,
      userAgent,
      ipAddress: ip,
      expiresAt,
    });
    await authRepository.updateLastLogin(user.id);
    return buildAuthResponse(user, accessToken, refreshToken);
  },

  async sendOtp(dto: SendOtpDto): Promise<{ sent: boolean; message: string }> {
    if (!dto.email && !dto.phone) {
      throw Object.assign(new Error('Email or phone required'), { statusCode: 400 });
    }
    const otp = generateOtp();
    const expiresAt = getOtpExpiry();
    await authRepository.createOtp({
      email: dto.email,
      phone: dto.phone,
      otp,
      purpose: dto.purpose,
      expiresAt,
    });
    return {
      sent: true,
      message: dto.phone ? 'OTP sent to phone' : 'OTP sent to email',
    };
  },

  async loginWithPhone(dto: LoginPhoneDto, userAgent?: string, ip?: string): Promise<AuthResponseDto> {
    if (!validateOtpFormat(dto.otp)) {
      throw Object.assign(new Error('Invalid OTP format'), { statusCode: 400 });
    }
    const otpRecord = await authRepository.findValidOtp({ phone: dto.phone }, 'login');
    if (!otpRecord || otpRecord.otp !== dto.otp) {
      throw Object.assign(new Error('Invalid or expired OTP'), { statusCode: 401 });
    }
    let user = await authRepository.findUserByPhone(dto.phone);
    if (!user) {
      user = (await authRepository.createUser({
        phone: dto.phone,
        role: 'USER',
      }))!;
    }
    await authRepository.markOtpUsed(otpRecord.id);
    if (!user.isActive) {
      throw Object.assign(new Error('Account is disabled'), { statusCode: 403 });
    }
    const accessToken = signAccessToken(user.id, user.role);
    const refreshToken = signRefreshToken(user.id, user.role);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await authRepository.createSession({
      userId: user.id,
      refreshToken,
      userAgent,
      ipAddress: ip,
      expiresAt,
    });
    await authRepository.updateLastLogin(user.id);
    return buildAuthResponse(user, accessToken, refreshToken);
  },

  async register(dto: RegisterDto, userAgent?: string, ip?: string): Promise<AuthResponseDto> {
    if (!dto.email && !dto.phone) {
      throw Object.assign(new Error('Email or phone required'), { statusCode: 400 });
    }
    if (dto.email) {
      const existing = await authRepository.findUserByEmail(dto.email);
      if (existing) {
        throw Object.assign(new Error('Email already registered'), { statusCode: 409 });
      }
    }
    if (dto.phone) {
      const existing = await authRepository.findUserByPhone(dto.phone);
      if (existing) {
        throw Object.assign(new Error('Phone already registered'), { statusCode: 409 });
      }
    }
    const role = (dto.role as UserRole) || 'USER';
    const passwordHash = dto.password
      ? await bcrypt.hash(dto.password, SALT_ROUNDS)
      : undefined;
    const user = await authRepository.createUser({
      email: dto.email ?? undefined,
      phone: dto.phone ?? undefined,
      passwordHash,
      role,
      name: dto.name,
    });
    if (!user) throw new Error('Failed to create user');
    const accessToken = signAccessToken(user.id, user.role);
    const refreshToken = signRefreshToken(user.id, user.role);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await authRepository.createSession({
      userId: user.id,
      refreshToken,
      userAgent,
      ipAddress: ip,
      expiresAt,
    });
    return buildAuthResponse(user, accessToken, refreshToken);
  },

  async refreshTokens(dto: RefreshTokenDto): Promise<AuthResponseDto> {
    const session = await authRepository.findSessionByRefreshToken(dto.refreshToken);
    if (!session || session.expiresAt < new Date()) {
      throw Object.assign(new Error('Invalid or expired refresh token'), { statusCode: 401 });
    }
    const user = session.user;
    if (!user.isActive) {
      throw Object.assign(new Error('Account is disabled'), { statusCode: 403 });
    }
    await authRepository.deleteSession(session.id);
    const accessToken = signAccessToken(user.id, user.role);
    const refreshToken = signRefreshToken(user.id, user.role);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await authRepository.createSession({
      userId: user.id,
      refreshToken,
      userAgent: session.userAgent ?? undefined,
      ipAddress: session.ipAddress ?? undefined,
      expiresAt,
    });
    return buildAuthResponse(user, accessToken, refreshToken);
  },

  async logout(refreshToken: string): Promise<void> {
    const session = await authRepository.findSessionByRefreshToken(refreshToken);
    if (session) {
      await authRepository.deleteSession(session.id);
    }
  },

  async logoutAll(userId: string): Promise<void> {
    await authRepository.deleteSessionsByUserId(userId);
  },

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    if (!dto.email && !dto.phone) {
      throw Object.assign(new Error('Email or phone required'), { statusCode: 400 });
    }
    const otp = generateOtp();
    const expiresAt = getOtpExpiry();
    let user = null;
    if (dto.email) user = await authRepository.findUserByEmail(dto.email);
    if (dto.phone) user = await authRepository.findUserByPhone(dto.phone);
    if (!user) {
      return { message: 'If an account exists, you will receive reset instructions.' };
    }
    await authRepository.createOtp({
      userId: user.id,
      email: dto.email,
      phone: dto.phone,
      otp,
      purpose: 'forgot_password',
      expiresAt,
    });
    return { message: 'If an account exists, you will receive reset instructions.' };
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const record = await authRepository.findValidOtpByValue(token, 'forgot_password');
    if (!record || !record.userId) {
      throw Object.assign(new Error('Invalid or expired reset token'), { statusCode: 400 });
    }
    await authRepository.updatePassword(record.userId, await bcrypt.hash(newPassword, SALT_ROUNDS));
    await authRepository.markOtpUsed(record.id);
  },
};
