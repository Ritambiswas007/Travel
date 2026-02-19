import { prisma } from '../../config/prisma';
import { Prisma } from '@prisma/client';

export const couponsRepository = {
  async findByCode(code: string) {
    return prisma.coupon.findFirst({
      where: { code: code.toUpperCase().trim(), deletedAt: null, isActive: true },
    });
  },

  async findById(id: string) {
    return prisma.coupon.findFirst({
      where: { id, deletedAt: null },
    });
  },

  async create(data: Prisma.CouponCreateInput) {
    return prisma.coupon.create({ data });
  },

  async list(params: { page: number; limit: number; isActive?: boolean }) {
    const where: Prisma.CouponWhereInput = { deletedAt: null };
    if (params.isActive !== undefined) where.isActive = params.isActive;
    const [items, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.coupon.count({ where }),
    ]);
    return { items, total };
  },

  async update(id: string, data: Prisma.CouponUpdateInput) {
    return prisma.coupon.update({ where: { id }, data });
  },

  async incrementUsage(id: string) {
    return prisma.coupon.update({
      where: { id },
      data: { usedCount: { increment: 1 } },
    });
  },

  async recordUsage(couponId: string, userId: string, bookingId: string, discountAmount: Prisma.Decimal) {
    return prisma.couponUsage.create({
      data: { couponId, userId, bookingId, discountAmount },
    });
  },
};
