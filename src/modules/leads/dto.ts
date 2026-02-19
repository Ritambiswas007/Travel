import { LeadStatus } from '@prisma/client';

export interface CreateLeadDto {
  email?: string;
  phone?: string;
  name?: string;
  message?: string;
  sourceId?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateLeadDto {
  status?: LeadStatus;
  score?: number;
  convertedBookingId?: string;
}

export interface AssignLeadDto {
  staffId: string;
}

export interface ListLeadsQueryDto {
  page?: number;
  limit?: number;
  status?: LeadStatus;
  sourceId?: string;
}
