import { prisma } from '../../config/prisma';
import { Prisma } from '@prisma/client';

export const citiesRepository = {
  async create(data: Prisma.CityCreateInput) {
    return prisma.city.create({ data });
  },

  async findById(id: string) {
    return prisma.city.findFirst({
      where: { id, deletedAt: null },
    });
  },

  async findBySlug(slug: string) {
    return prisma.city.findFirst({
      where: { slug, deletedAt: null },
    });
  },

  async list(params: { page: number; limit: number; isActive?: boolean }) {
    const where: Prisma.CityWhereInput = { deletedAt: null };
    if (params.isActive !== undefined) where.isActive = params.isActive;
    const [items, total] = await Promise.all([
      prisma.city.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      }),
      prisma.city.count({ where }),
    ]);
    return { items, total };
  },

  async update(id: string, data: Prisma.CityUpdateInput) {
    return prisma.city.update({ where: { id }, data });
  },

  async softDelete(id: string) {
    return prisma.city.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};
