import { visaRepository } from './repository';
import type { CreateVisaApplicationDto, UpdateVisaApplicationDto, AddVisaDocumentDto } from './dto';

export const visaService = {
  async create(userId: string, dto: CreateVisaApplicationDto) {
    return visaRepository.create({
      user: { connect: { id: userId } },
      country: dto.country,
      type: dto.type,
    });
  },

  async getById(id: string, userId?: string) {
    const app = await visaRepository.findById(id);
    if (!app) {
      throw Object.assign(new Error('Visa application not found'), { statusCode: 404 });
    }
    if (userId && app.userId !== userId) {
      throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
    }
    return app;
  },

  async listByUser(userId: string) {
    return visaRepository.listByUser(userId);
  },

  async update(id: string, userId: string, dto: UpdateVisaApplicationDto) {
    const app = await visaRepository.findById(id);
    if (!app || app.userId !== userId) {
      throw Object.assign(new Error('Visa application not found'), { statusCode: 404 });
    }
    if (app.status !== 'DRAFT') {
      throw Object.assign(new Error('Only draft applications can be updated'), { statusCode: 400 });
    }
    return visaRepository.update(id, {
      country: dto.country,
      type: dto.type,
      status: dto.status,
    });
  },

  async submit(id: string, userId: string) {
    const app = await visaRepository.findById(id);
    if (!app || app.userId !== userId) {
      throw Object.assign(new Error('Visa application not found'), { statusCode: 404 });
    }
    if (app.status !== 'DRAFT') {
      throw Object.assign(new Error('Already submitted'), { statusCode: 400 });
    }
    return visaRepository.update(id, { status: 'SUBMITTED', submittedAt: new Date() });
  },

  async addDocument(applicationId: string, userId: string, dto: AddVisaDocumentDto) {
    const app = await visaRepository.findById(applicationId);
    if (!app || app.userId !== userId) {
      throw Object.assign(new Error('Visa application not found'), { statusCode: 404 });
    }
    if (app.status !== 'DRAFT') {
      throw Object.assign(new Error('Cannot add document after submission'), { statusCode: 400 });
    }
    return visaRepository.addDocument(applicationId, {
      type: dto.type,
      fileUrl: dto.fileUrl,
      storagePath: dto.storagePath,
    });
  },
};
