import { bannersRepository } from './repository';
import type { CreateBannerDto, UpdateBannerDto } from './dto';

export const bannersService = {
  async create(dto: CreateBannerDto) {
    return bannersRepository.create({
      title: dto.title,
      imageUrl: dto.imageUrl,
      linkUrl: dto.linkUrl,
      position: dto.position ?? 'HOME_TOP',
      sortOrder: dto.sortOrder ?? 0,
      startAt: dto.startAt ? new Date(dto.startAt) : undefined,
      endAt: dto.endAt ? new Date(dto.endAt) : undefined,
    });
  },

  async getById(id: string) {
    const banner = await bannersRepository.findById(id);
    if (!banner) {
      throw Object.assign(new Error('Banner not found'), { statusCode: 404 });
    }
    return banner;
  },

  async listActive(position?: string) {
    return bannersRepository.listActive(position);
  },

  async listAdmin(page: number, limit: number) {
    return bannersRepository.listAdmin({ page, limit });
  },

  async update(id: string, dto: UpdateBannerDto) {
    const banner = await bannersRepository.findById(id);
    if (!banner) {
      throw Object.assign(new Error('Banner not found'), { statusCode: 404 });
    }
    return bannersRepository.update(id, {
      title: dto.title,
      imageUrl: dto.imageUrl,
      linkUrl: dto.linkUrl,
      position: dto.position,
      sortOrder: dto.sortOrder,
      isActive: dto.isActive,
      startAt: dto.startAt ? new Date(dto.startAt) : undefined,
      endAt: dto.endAt ? new Date(dto.endAt) : undefined,
    });
  },

  async delete(id: string) {
    const banner = await bannersRepository.findById(id);
    if (!banner) {
      throw Object.assign(new Error('Banner not found'), { statusCode: 404 });
    }
    return bannersRepository.softDelete(id);
  },
};
