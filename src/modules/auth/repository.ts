import { prisma } from '../../config/prisma';
import { UserRole } from '@prisma/client';

export const authRepository = {
  async findUserByEmail(email: string) {
    return prisma.user.findFirst({
      where: { email, deletedAt: null },
      include: { admin: true, staff: true },
    });
  },

  async findUserByPhone(phone: string) {
    return prisma.user.findFirst({
      where: { phone, deletedAt: null },
      include: { admin: true, staff: true },
    });
  },

  async findUserById(id: string) {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: { admin: true, staff: true },
    });
  },

  async createUser(data: {
    email?: string;
    phone?: string;
    passwordHash?: string;
    role: UserRole;
    name?: string;
  }) {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        phone: data.phone,
        passwordHash: data.passwordHash,
        role: data.role,
      },
    });
    if (data.role === 'ADMIN' && data.name) {
      await prisma.admin.create({
        data: { userId: user.id, name: data.name },
      });
    }
    if (data.role === 'STAFF' && data.name) {
      await prisma.staff.create({
        data: { userId: user.id, name: data.name },
      });
    }
    return authRepository.findUserById(user.id);
  },

  async createSession(data: {
    userId: string;
    refreshToken: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: Date;
  }) {
    return prisma.session.create({ data });
  },

  async findSessionByRefreshToken(refreshToken: string) {
    return prisma.session.findUnique({
      where: { refreshToken },
      include: { user: { include: { admin: true, staff: true } } },
    });
  },

  async deleteSession(id: string) {
    return prisma.session.delete({ where: { id } });
  },

  async deleteSessionsByUserId(userId: string) {
    return prisma.session.deleteMany({ where: { userId } });
  },

  async updateLastLogin(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  },

  async createOtp(data: {
    userId?: string;
    email?: string;
    phone?: string;
    otp: string;
    purpose: string;
    expiresAt: Date;
  }) {
    return prisma.oTP.create({ data });
  },

  async findValidOtp(identifier: { email?: string; phone?: string }, purpose: string) {
    const where: Record<string, unknown> = {
      purpose,
      expiresAt: { gt: new Date() },
      usedAt: null,
    };
    if (identifier.email) (where as { email?: string }).email = identifier.email;
    if (identifier.phone) (where as { phone?: string }).phone = identifier.phone;
    return prisma.oTP.findFirst({ where, orderBy: { createdAt: 'desc' } });
  },

  async findValidOtpByValue(otpValue: string, purpose: string) {
    return prisma.oTP.findFirst({
      where: {
        otp: otpValue,
        purpose,
        expiresAt: { gt: new Date() },
        usedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async markOtpUsed(id: string) {
    return prisma.oTP.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  },

  async updatePassword(userId: string, passwordHash: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  },
};
