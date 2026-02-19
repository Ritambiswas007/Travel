import { prisma } from '../../config/prisma';
import { Prisma } from '@prisma/client';

export const reviewsRepository = {
  async create(data: Prisma.ReviewCreateInput) {
    return prisma.review.create({
      data,
      include: { package: true },
    });
  },

  async findById(id: string) {
    return prisma.review.findFirst({
      where: { id, deletedAt: null },
      include: { user: true, package: true },
    });
  },

  async list(params: { page: number; limit: number; packageId?: string; rating?: number }) {
    const where: Prisma.ReviewWhereInput = { deletedAt: null, isPublic: true };
    if (params.packageId) where.packageId = params.packageId;
    if (params.rating) where.rating = params.rating;
    const [items, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true } }, package: { select: { id: true, name: true } } },
      }),
      prisma.review.count({ where }),
    ]);
    return { items, total };
  },

  async update(id: string, data: Prisma.ReviewUpdateInput) {
    return prisma.review.update({
      where: { id },
      data,
      include: { package: true },
    });
  },
};
