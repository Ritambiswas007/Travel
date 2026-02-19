import { usersRepository } from './repository';
import type { UpdateProfileDto, ListUsersQueryDto } from './dto';

export const usersService = {
  async getProfile(userId: string) {
    const user = await usersRepository.findById(userId);
    if (!user) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }
    return user;
  },

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const updated = await usersRepository.updateProfile(userId, dto);
    if (!updated) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }
    return updated;
  },

  async list(query: ListUsersQueryDto) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const role = query.role as 'ADMIN' | 'STAFF' | 'USER' | undefined;
    return usersRepository.list({ page, limit, role, search: query.search });
  },
};
