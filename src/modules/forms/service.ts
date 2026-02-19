import { formsRepository } from './repository';
import type { Prisma } from '@prisma/client';
import type { CreateFormDto, CreateFieldDto, SubmitFormDto } from './dto';

export const formsService = {
  async createForm(dto: CreateFormDto) {
    const code = dto.code.toUpperCase().trim();
    const existing = await formsRepository.findFormByCode(code);
    if (existing) {
      throw Object.assign(new Error('Form code already exists'), { statusCode: 409 });
    }
    return formsRepository.createForm({
      name: dto.name,
      code,
      description: dto.description,
    });
  },

  async getFormById(id: string) {
    const form = await formsRepository.findFormById(id);
    if (!form) {
      throw Object.assign(new Error('Form not found'), { statusCode: 404 });
    }
    return form;
  },

  async getFormByCode(code: string) {
    const form = await formsRepository.findFormByCode(code);
    if (!form) {
      throw Object.assign(new Error('Form not found'), { statusCode: 404 });
    }
    return form;
  },

  async listForms(page: number, limit: number) {
    return formsRepository.listForms({ page, limit });
  },

  async addField(formId: string, dto: CreateFieldDto) {
    const form = await formsRepository.findFormById(formId);
    if (!form) {
      throw Object.assign(new Error('Form not found'), { statusCode: 404 });
    }
    return formsRepository.addField(formId, {
      name: dto.name,
      label: dto.label,
      type: dto.type,
      required: dto.required ?? false,
      options: dto.options as Prisma.InputJsonValue | undefined,
      sortOrder: dto.sortOrder ?? 0,
    });
  },

  async submit(formId: string, userId: string | null, dto: SubmitFormDto) {
    const form = await formsRepository.findFormById(formId);
    if (!form || !form.isActive) {
      throw Object.assign(new Error('Form not found or inactive'), { statusCode: 404 });
    }
    return formsRepository.createSubmission(formId, userId, dto.data as Prisma.InputJsonValue);
  },
};
