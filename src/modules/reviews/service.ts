import { reviewsRepository } from './repository';
import type { CreateReviewDto, UpdateReviewDto, ListReviewsQueryDto } from './dto';

export const reviewsService = {
  async create(userId: string, dto: CreateReviewDto) {
    if (dto.rating < 1 || dto.rating > 5) {
      throw Object.assign(new Error('Rating must be between 1 and 5'), { statusCode: 400 });
    }
    return reviewsRepository.create({
      user: { connect: { id: userId } },
      package: dto.packageId ? { connect: { id: dto.packageId } } : undefined,
      rating: dto.rating,
      title: dto.title,
      comment: dto.comment,
    });
  },

  async getById(id: string) {
    const review = await reviewsRepository.findById(id);
    if (!review) {
      throw Object.assign(new Error('Review not found'), { statusCode: 404 });
    }
    return review;
  },

  async list(query: ListReviewsQueryDto) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    return reviewsRepository.list({
      page,
      limit,
      packageId: query.packageId,
      rating: query.rating,
    });
  },

  async update(id: string, userId: string, dto: UpdateReviewDto) {
    const review = await reviewsRepository.findById(id);
    if (!review || review.userId !== userId) {
      throw Object.assign(new Error('Review not found'), { statusCode: 404 });
    }
    if (dto.rating !== undefined && (dto.rating < 1 || dto.rating > 5)) {
      throw Object.assign(new Error('Rating must be between 1 and 5'), { statusCode: 400 });
    }
    return reviewsRepository.update(id, {
      rating: dto.rating,
      title: dto.title,
      comment: dto.comment,
      isPublic: dto.isPublic,
    });
  },
};
