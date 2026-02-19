import { prisma } from '../../config/prisma';
import { Prisma } from '@prisma/client';

export const packagesRepository = {
  async create(data: Prisma.PackageCreateInput) {
    return prisma.package.create({
      data,
      include: { city: true },
    });
  },

  async findById(id: string) {
    return prisma.package.findFirst({
      where: { id, deletedAt: null },
      include: {
        city: true,
        variants: true,
        itineraries: { orderBy: { dayNumber: 'asc' } },
        schedules: { where: { isActive: true }, orderBy: { startDate: 'asc' } },
      },
    });
  },

  async findBySlug(slug: string) {
    return prisma.package.findFirst({
      where: { slug, deletedAt: null },
      include: {
        city: true,
        variants: true,
        itineraries: { orderBy: { dayNumber: 'asc' } },
        schedules: { where: { isActive: true }, orderBy: { startDate: 'asc' } },
      },
    });
  },

  async list(params: {
    page: number;
    limit: number;
    cityId?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    search?: string;
  }) {
    const where: Prisma.PackageWhereInput = { deletedAt: null };
    if (params.cityId) where.cityId = params.cityId;
    if (params.isActive !== undefined) where.isActive = params.isActive;
    if (params.isFeatured !== undefined) where.isFeatured = params.isFeatured;
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      prisma.package.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        include: { city: true, variants: true },
      }),
      prisma.package.count({ where }),
    ]);
    return { items, total };
  },

  async update(id: string, data: Prisma.PackageUpdateInput) {
    return prisma.package.update({
      where: { id },
      data,
      include: { city: true },
    });
  },

  async softDelete(id: string) {
    return prisma.package.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  async createVariant(packageId: string, data: Prisma.PackageVariantCreateWithoutPackageInput) {
    return prisma.packageVariant.create({
      data: { packageId, ...data },
    });
  },

  async createItinerary(packageId: string, data: Prisma.ItineraryCreateWithoutPackageInput) {
    return prisma.itinerary.create({
      data: { packageId, ...data },
    });
  },

  async createSchedule(packageId: string, data: Prisma.PackageScheduleCreateWithoutPackageInput) {
    return prisma.packageSchedule.create({
      data: { packageId, ...data },
    });
  },
};
