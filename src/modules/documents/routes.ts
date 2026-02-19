import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { staffOrAdmin } from '../../middlewares/role.middleware';
import { cacheMiddleware } from '../../middlewares/cache.middleware';
import {
  createType,
  createTypeValidators,
  listTypes,
  getType,
  typeIdValidators,
  upload,
  uploadValidators,
  uploadHandler,
  getDocument,
  documentIdValidators,
  listMyDocuments,
  updateStatus,
  updateStatusValidators,
  downloadChecklist,
} from './controller';

const router = Router();

router.get('/types', cacheMiddleware({ keyPrefix: 'documents:types', ttlSeconds: 600 }), listTypes);

router.use(authMiddleware);

router.get('/my', listMyDocuments);
router.post('/upload', uploadHandler, uploadValidators, upload);
router.get('/checklist/pdf', downloadChecklist);
router.get('/:id', documentIdValidators, getDocument);

router.use(staffOrAdmin);

router.post('/types', createTypeValidators, createType);
router.get('/types/:id', typeIdValidators, getType);
router.patch('/:id/status', updateStatusValidators, updateStatus);

export const documentsRoutes = router;
