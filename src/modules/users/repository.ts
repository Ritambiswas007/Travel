import { prisma } from '../../config/prisma';
import { UserRole } from '@prisma/client';

export const usersRepository = {
  async findById(id: string) {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        emailVerified: true,
        phoneVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        admin: { select: { name: true } },
        staff: { select: { name: true, department: true } },
      },
    });
  },

  async updateProfile(userId: string, data: { name?: string; email?: string; phone?: string }) {
    const user = await prisma.user.findFirst({
      where: { id: userId },
      include: { admin: true, staff: true },
    });
    if (!user) return null;
    if (data.email !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: { email: data.email },
      });
    }
    if (data.phone !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: { phone: data.phone },
      });
    }
    if (data.name !== undefined) {
      if (user.admin) {
        await prisma.admin.update({
          where: { userId },
          data: { name: data.name },
        });
      }
      if (user.staff) {
        await prisma.staff.update({
          where: { userId },
          data: { name: data.name },
        });
      }
    }
    return usersRepository.findById(userId);
  },

  async list(params: { page: number; limit: number; role?: UserRole; search?: string }) {
    const where: { deletedAt: null; role?: UserRole; OR?: Array<{ email?: { contains: string; mode: 'insensitive' }; phone?: { contains: string } }> } = {
      deletedAt: null,
    };
    if (params.role) where.role = params.role;
    if (params.search) {
      where.OR = [
        { email: { contains: params.search, mode: 'insensitive' } },
        { phone: { contains: params.search } },
      ];
    }
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          admin: { select: { name: true } },
          staff: { select: { name: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);
    return { items, total };
  },
};
