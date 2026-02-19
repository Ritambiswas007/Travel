import { prisma } from '../../config/prisma';
import { leadsRepository } from './repository';
import type { CreateLeadDto, UpdateLeadDto, AssignLeadDto, ListLeadsQueryDto } from './dto';
import { LeadStatus } from '@prisma/client';
import type { Prisma } from '@prisma/client';

export const leadsService = {
  async create(dto: CreateLeadDto) {
    return leadsRepository.create({
      email: dto.email,
      phone: dto.phone,
      name: dto.name,
      message: dto.message,
      source: dto.sourceId ? { connect: { id: dto.sourceId } } : undefined,
      metadata: dto.metadata as Prisma.InputJsonValue | undefined,
    });
  },

  async ingestFromFacebook(payload: { entry?: Array<{ id: string; changes?: Array<{ value?: { leadgen_id?: string } }> }> }) {
    const leadIds: string[] = [];
    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        const leadgenId = change.value?.leadgen_id;
        if (leadgenId) leadIds.push(leadgenId);
      }
    }
    return leadIds;
  },

  async getById(id: string) {
    const lead = await leadsRepository.findById(id);
    if (!lead) {
      throw Object.assign(new Error('Lead not found'), { statusCode: 404 });
    }
    return lead;
  },

  async list(query: ListLeadsQueryDto) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    return leadsRepository.list({
      page,
      limit,
      status: query.status,
      sourceId: query.sourceId,
    });
  },

  async update(id: string, dto: UpdateLeadDto) {
    const lead = await leadsRepository.findById(id);
    if (!lead) {
      throw Object.assign(new Error('Lead not found'), { statusCode: 404 });
    }
    return leadsRepository.update(id, {
      status: dto.status,
      score: dto.score,
      convertedBookingId: dto.convertedBookingId,
    });
  },

  async assign(id: string, dto: AssignLeadDto) {
    const lead = await leadsRepository.findById(id);
    if (!lead) {
      throw Object.assign(new Error('Lead not found'), { statusCode: 404 });
    }
    const staff = await prisma.staff.findFirst({
      where: { id: dto.staffId, deletedAt: null },
    });
    if (!staff) {
      throw Object.assign(new Error('Staff not found'), { statusCode: 404 });
    }
    return leadsRepository.assign(id, dto.staffId);
  },

  async autoAssign(leadId: string) {
    const staff = await prisma.staff.findFirst({
      where: { isActive: true, deletedAt: null },
      orderBy: { leadAssignments: { _count: 'asc' } },
    });
    if (staff) {
      return leadsRepository.assign(leadId, staff.id);
    }
    return leadsRepository.findById(leadId);
  },
};
