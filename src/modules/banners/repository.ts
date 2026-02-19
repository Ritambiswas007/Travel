import { prisma } from '../../config/prisma';
import { Prisma } from '@prisma/client';

export const bannersRepository = {
  async create(data: Prisma.BannerCreateInput) {
    return prisma.banner.create({ data });
  },

  async findById(id: string) {
    return prisma.banner.findFirst({
      where: { id, deletedAt: null },
    });
  },

  async listActive(position?: string) {
    const where: Prisma.BannerWhereInput = {
      deletedAt: null,
      isActive: true,
      OR: [
        { startAt: null, endAt: null },
        {
          startAt: { lte: new Date() },
          endAt: { gte: new Date() },
        },
      ],
    };
    if (position) where.position = position;
    return prisma.banner.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
  },

  async listAdmin(params: { page: number; limit: number }) {
    const where: Prisma.BannerWhereInput = { deletedAt: null };
    const [items, total] = await Promise.all([
      prisma.banner.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.banner.count({ where }),
    ]);
    return { items, total };
  },

  async update(id: string, data: Prisma.BannerUpdateInput) {
    return prisma.banner.update({ where: { id }, data });
  },

  async softDelete(id: string) {
    return prisma.banner.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};
