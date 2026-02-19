export interface SendNotificationDto {
  userId?: string;
  title: string;
  body?: string;
  type?: string;
  channel?: 'email' | 'sms' | 'push';
  data?: Record<string, string>;
}

export interface ListNotificationsQueryDto {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}
