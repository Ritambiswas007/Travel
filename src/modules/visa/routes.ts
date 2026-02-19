import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import {
  create,
  createValidators,
  getById,
  applicationIdValidators,
  listMine,
  update,
  updateValidators,
  submit,
  addDocument,
  addDocumentValidators,
} from './controller';

const router = Router();

router.use(authMiddleware);

router.post('/', createValidators, create);
router.get('/my', listMine);
router.get('/:id', applicationIdValidators, getById);
router.patch('/:id', updateValidators, update);
router.post('/:id/submit', applicationIdValidators, submit);
router.post('/:id/documents', addDocumentValidators, addDocument);

export const visaRoutes = router;
