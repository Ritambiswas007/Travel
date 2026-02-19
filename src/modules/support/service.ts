import { supportRepository } from './repository';
import type { CreateTicketDto, ReplyDto } from './dto';

export const supportService = {
  async create(userId: string, dto: CreateTicketDto) {
    return supportRepository.create({
      user: { connect: { id: userId } },
      subject: dto.subject,
      priority: dto.priority || 'NORMAL',
      messages: {
        create: {
          message: dto.message,
          isStaff: false,
        },
      },
    });
  },

  async getById(id: string, userId?: string) {
    const ticket = await supportRepository.findById(id);
    if (!ticket) {
      throw Object.assign(new Error('Ticket not found'), { statusCode: 404 });
    }
    if (userId && ticket.userId !== userId) {
      throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
    }
    return ticket;
  },

  async listByUser(userId: string, page: number, limit: number) {
    return supportRepository.listByUser(userId, { page, limit });
  },

  async reply(ticketId: string, userId: string, dto: ReplyDto, isStaff: boolean) {
    const ticket = await supportRepository.findById(ticketId);
    if (!ticket) {
      throw Object.assign(new Error('Ticket not found'), { statusCode: 404 });
    }
    if (!isStaff && ticket.userId !== userId) {
      throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
    }
    if (ticket.status === 'CLOSED') {
      throw Object.assign(new Error('Ticket is closed'), { statusCode: 400 });
    }
    return supportRepository.addMessage({
      ticket: { connect: { id: ticketId } },
      message: dto.message,
      isStaff: dto.isStaff ?? isStaff,
      senderId: isStaff ? undefined : userId,
    });
  },

  async close(ticketId: string, userId: string) {
    const ticket = await supportRepository.findById(ticketId);
    if (!ticket || ticket.userId !== userId) {
      throw Object.assign(new Error('Ticket not found'), { statusCode: 404 });
    }
    return supportRepository.updateTicketStatus(ticketId, 'CLOSED', new Date());
  },
};
