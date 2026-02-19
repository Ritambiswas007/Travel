export interface RecommendationRequestDto {
  userId?: string;
  context?: string;
  limit?: number;
}

export interface FAQRequestDto {
  question: string;
  context?: string;
}

export interface BookingAssistantDto {
  query: string;
  bookingId?: string;
  context?: string;
}
