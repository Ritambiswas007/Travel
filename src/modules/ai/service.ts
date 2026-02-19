import { config } from '../../config/env';
import { prisma } from '../../config/prisma';
import type { RecommendationRequestDto, FAQRequestDto, BookingAssistantDto } from './dto';

async function callHook(url: string | undefined, body: Record<string, unknown>): Promise<Record<string, unknown> | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export const aiService = {
  async getRecommendations(dto: RecommendationRequestDto) {
    if (!config.ai.enabled || !config.ai.recommendationHook) {
      const packages = await prisma.package.findMany({
        where: { isActive: true, deletedAt: null, isFeatured: true },
        take: dto.limit ?? 10,
        include: { city: true },
      });
      return { recommendations: packages };
    }
    const result = await callHook(config.ai.recommendationHook, {
      userId: dto.userId,
      context: dto.context,
      limit: dto.limit ?? 10,
    });
    if (result?.recommendations) return result;
    const packages = await prisma.package.findMany({
      where: { isActive: true, deletedAt: null },
      take: dto.limit ?? 10,
      include: { city: true },
    });
    return { recommendations: packages };
  },

  async answerFAQ(dto: FAQRequestDto) {
    if (!config.ai.enabled || !config.ai.faqHook) {
      return { answer: 'Please contact support for this question.', source: 'fallback' };
    }
    const result = await callHook(config.ai.faqHook, {
      question: dto.question,
      context: dto.context,
    });
    if (result?.answer) return result;
    return { answer: 'Please contact support for this question.', source: 'fallback' };
  },

  async bookingAssistant(dto: BookingAssistantDto) {
    if (!config.ai.enabled || !config.ai.bookingAssistantHook) {
      return { response: 'Booking assistant is not available. Please use the booking form or contact support.', suggestions: [] };
    }
    const result = await callHook(config.ai.bookingAssistantHook, {
      query: dto.query,
      bookingId: dto.bookingId,
      context: dto.context,
    });
    if (result) return result;
    return { response: 'Please try again or contact support.', suggestions: [] };
  },
};
