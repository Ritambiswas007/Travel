import { reportsRepository } from './repository';
import { prisma } from '../../config/prisma';
import type { Prisma } from '@prisma/client';
import type { CreateReportDto, ListReportsQueryDto } from './dto';

export const reportsService = {
  async create(dto: CreateReportDto) {
    return reportsRepository.create({
      name: dto.name,
      type: dto.type,
      params: dto.params as Prisma.JsonObject | undefined,
    });
  },

  async getById(id: string) {
    const report = await reportsRepository.findById(id);
    if (!report) {
      throw Object.assign(new Error('Report not found'), { statusCode: 404 });
    }
    return report;
  },

  async list(query: ListReportsQueryDto) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    return reportsRepository.list({ page, limit, type: query.type });
  },

  async getBookingsReport(params: { from?: Date; to?: Date }) {
    const where: Prisma.BookingWhereInput = { deletedAt: null };
    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (params.from) dateFilter.gte = params.from;
    if (params.to) dateFilter.lte = params.to;
    if (Object.keys(dateFilter).length > 0) where.createdAt = dateFilter;
    const bookings = await prisma.booking.findMany({
      where,
      include: { package: true, user: { select: { id: true, email: true } } },
    });
    const byStatus = await prisma.booking.groupBy({
      by: ['status'],
      where,
      _count: true,
      _sum: { finalAmount: true },
    });
    return { bookings, summary: byStatus };
  },

  async getRevenueReport(params: { from?: Date; to?: Date }) {
    const where: Prisma.PaymentWhereInput = { status: 'SUCCEEDED' };
    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (params.from) dateFilter.gte = params.from;
    if (params.to) dateFilter.lte = params.to;
    if (Object.keys(dateFilter).length > 0) where.paidAt = dateFilter;
    const payments = await prisma.payment.findMany({
      where,
      include: { booking: true },
    });
    const total = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    return { payments, total };
  },
};
