import bcrypt from 'bcryptjs';
import { prisma } from '../../config/prisma';
import { staffRepository } from './repository';
import type { CreateStaffDto, UpdateStaffDto, ListStaffQueryDto } from './dto';

const SALT_ROUNDS = 10;

export const staffService = {
  async create(dto: CreateStaffDto) {
    const existing = await prisma.user.findFirst({
      where: { email: dto.email, deletedAt: null },
    });
    if (existing) {
      throw Object.assign(new Error('Email already registered'), { statusCode: 409 });
    }
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: 'STAFF',
      },
    });
    const staff = await prisma.staff.create({
      data: {
        userId: user.id,
        name: dto.name,
        department: dto.department,
      },
    });
    return staffRepository.findById(staff.id);
  },

  async list(query: ListStaffQueryDto) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    return staffRepository.list({
      page,
      limit,
      isActive: query.isActive,
      search: query.search,
    });
  },

  async getById(id: string) {
    const staff = await staffRepository.findById(id);
    if (!staff) {
      throw Object.assign(new Error('Staff not found'), { statusCode: 404 });
    }
    return staff;
  },

  async update(id: string, dto: UpdateStaffDto) {
    const staff = await staffRepository.findById(id);
    if (!staff) {
      throw Object.assign(new Error('Staff not found'), { statusCode: 404 });
    }
    return staffRepository.update(id, {
      name: dto.name,
      department: dto.department,
      isActive: dto.isActive,
    });
  },
};
