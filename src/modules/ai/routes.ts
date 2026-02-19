import { Router } from 'express';
import { optionalAuth } from '../../middlewares/auth.middleware';
import {
  getRecommendations,
  recommendationValidators,
  answerFAQ,
  faqValidators,
  bookingAssistant,
  bookingAssistantValidators,
} from './controller';

const router = Router();

router.use(optionalAuth);

router.post('/recommendations', recommendationValidators, getRecommendations);
router.post('/faq', faqValidators, answerFAQ);
router.post('/booking-assistant', bookingAssistantValidators, bookingAssistant);

export const aiRoutes = router;
