import { citiesRepository } from './repository';
import type { CreateCityDto, UpdateCityDto } from './dto';

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export const citiesService = {
  async create(dto: CreateCityDto) {
    const slug = dto.slug || slugify(dto.name);
    const existing = await citiesRepository.findBySlug(slug);
    if (existing) {
      throw Object.assign(new Error('City slug already exists'), { statusCode: 409 });
    }
    return citiesRepository.create({
      name: dto.name,
      slug,
      country: dto.country ?? 'India',
      description: dto.description,
      imageUrl: dto.imageUrl,
      sortOrder: dto.sortOrder ?? 0,
    });
  },

  async getById(id: string) {
    const city = await citiesRepository.findById(id);
    if (!city) {
      throw Object.assign(new Error('City not found'), { statusCode: 404 });
    }
    return city;
  },

  async getBySlug(slug: string) {
    const city = await citiesRepository.findBySlug(slug);
    if (!city) {
      throw Object.assign(new Error('City not found'), { statusCode: 404 });
    }
    return city;
  },

  async list(query: { page?: number; limit?: number; isActive?: boolean }) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    return citiesRepository.list({ page, limit, isActive: query.isActive });
  },

  async update(id: string, dto: UpdateCityDto) {
    const city = await citiesRepository.findById(id);
    if (!city) {
      throw Object.assign(new Error('City not found'), { statusCode: 404 });
    }
    if (dto.slug && dto.slug !== city.slug) {
      const existing = await citiesRepository.findBySlug(dto.slug);
      if (existing) {
        throw Object.assign(new Error('City slug already exists'), { statusCode: 409 });
      }
    }
    return citiesRepository.update(id, {
      name: dto.name,
      slug: dto.slug,
      country: dto.country,
      description: dto.description,
      imageUrl: dto.imageUrl,
      isActive: dto.isActive,
      sortOrder: dto.sortOrder,
    });
  },

  async delete(id: string) {
    const city = await citiesRepository.findById(id);
    if (!city) {
      throw Object.assign(new Error('City not found'), { statusCode: 404 });
    }
    return citiesRepository.softDelete(id);
  },
};
