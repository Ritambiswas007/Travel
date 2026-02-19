import { packagesRepository } from './repository';
import type {
  CreatePackageDto,
  UpdatePackageDto,
  CreateVariantDto,
  CreateItineraryDto,
  CreateScheduleDto,
  ListPackagesQueryDto,
} from './dto';

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export const packagesService = {
  async create(dto: CreatePackageDto) {
    const slug = dto.slug || slugify(dto.name);
    const existing = await packagesRepository.findBySlug(slug);
    if (existing) {
      throw Object.assign(new Error('Package slug already exists'), { statusCode: 409 });
    }
    return packagesRepository.create({
      name: dto.name,
      slug,
      description: dto.description,
      summary: dto.summary,
      imageUrl: dto.imageUrl,
      city: dto.cityId ? { connect: { id: dto.cityId } } : undefined,
      isActive: dto.isActive ?? true,
      isFeatured: dto.isFeatured ?? false,
      metaTitle: dto.metaTitle,
      metaDesc: dto.metaDesc,
    });
  },

  async getById(id: string) {
    const pkg = await packagesRepository.findById(id);
    if (!pkg) {
      throw Object.assign(new Error('Package not found'), { statusCode: 404 });
    }
    return pkg;
  },

  async getBySlug(slug: string) {
    const pkg = await packagesRepository.findBySlug(slug);
    if (!pkg) {
      throw Object.assign(new Error('Package not found'), { statusCode: 404 });
    }
    return pkg;
  },

  async list(query: ListPackagesQueryDto) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    return packagesRepository.list({
      page,
      limit,
      cityId: query.cityId,
      isActive: query.isActive,
      isFeatured: query.isFeatured,
      search: query.search,
    });
  },

  async update(id: string, dto: UpdatePackageDto) {
    const pkg = await packagesRepository.findById(id);
    if (!pkg) {
      throw Object.assign(new Error('Package not found'), { statusCode: 404 });
    }
    if (dto.slug && dto.slug !== pkg.slug) {
      const existing = await packagesRepository.findBySlug(dto.slug);
      if (existing) {
        throw Object.assign(new Error('Package slug already exists'), { statusCode: 409 });
      }
    }
    return packagesRepository.update(id, {
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      summary: dto.summary,
      imageUrl: dto.imageUrl,
      city: dto.cityId !== undefined ? (dto.cityId ? { connect: { id: dto.cityId } } : { disconnect: true }) : undefined,
      isActive: dto.isActive,
      isFeatured: dto.isFeatured,
      metaTitle: dto.metaTitle,
      metaDesc: dto.metaDesc,
    });
  },

  async delete(id: string) {
    const pkg = await packagesRepository.findById(id);
    if (!pkg) {
      throw Object.assign(new Error('Package not found'), { statusCode: 404 });
    }
    return packagesRepository.softDelete(id);
  },

  async addVariant(packageId: string, dto: CreateVariantDto) {
    const pkg = await packagesRepository.findById(packageId);
    if (!pkg) {
      throw Object.assign(new Error('Package not found'), { statusCode: 404 });
    }
    return packagesRepository.createVariant(packageId, {
      name: dto.name,
      description: dto.description,
      basePrice: dto.basePrice,
      currency: dto.currency ?? 'INR',
      durationDays: dto.durationDays ?? 1,
      maxTravelers: dto.maxTravelers,
      isDefault: dto.isDefault ?? false,
    });
  },

  async addItinerary(packageId: string, dto: CreateItineraryDto) {
    const pkg = await packagesRepository.findById(packageId);
    if (!pkg) {
      throw Object.assign(new Error('Package not found'), { statusCode: 404 });
    }
    return packagesRepository.createItinerary(packageId, {
      dayNumber: dto.dayNumber,
      title: dto.title,
      description: dto.description,
      activities: dto.activities,
    });
  },

  async addSchedule(packageId: string, dto: CreateScheduleDto) {
    const pkg = await packagesRepository.findById(packageId);
    if (!pkg) {
      throw Object.assign(new Error('Package not found'), { statusCode: 404 });
    }
    return packagesRepository.createSchedule(packageId, {
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      availableSeats: dto.availableSeats ?? 0,
    });
  },
};
