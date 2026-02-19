import { prisma } from '../../config/prisma';
import { Prisma } from '@prisma/client';

export const formsRepository = {
  async createForm(data: Prisma.DynamicFormCreateInput) {
    return prisma.dynamicForm.create({
      data,
      include: { fields: true },
    });
  },

  async findFormById(id: string) {
    return prisma.dynamicForm.findFirst({
      where: { id, deletedAt: null },
      include: { fields: { orderBy: { sortOrder: 'asc' } } },
    });
  },

  async findFormByCode(code: string) {
    return prisma.dynamicForm.findFirst({
      where: { code, deletedAt: null, isActive: true },
      include: { fields: { orderBy: { sortOrder: 'asc' } } },
    });
  },

  async listForms(params: { page: number; limit: number }) {
    const where: Prisma.DynamicFormWhereInput = { deletedAt: null };
    const [items, total] = await Promise.all([
      prisma.dynamicForm.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { name: 'asc' },
        include: { fields: true },
      }),
      prisma.dynamicForm.count({ where }),
    ]);
    return { items, total };
  },

  async addField(formId: string, data: Prisma.FormFieldCreateWithoutFormInput) {
    return prisma.formField.create({
      data: { formId, ...data },
    });
  },

  async createSubmission(formId: string, userId: string | null, data: Prisma.InputJsonValue) {
    return prisma.formSubmission.create({
      data: {
        formId,
        userId,
        data,
      },
      include: { form: true },
    });
  },
};
