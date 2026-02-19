export interface CreateTicketDto {
  subject: string;
  message: string;
  priority?: string;
}

export interface ReplyDto {
  message: string;
  isStaff?: boolean;
}
