import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { optionalAuth } from '../../middlewares/auth.middleware';
import { staffOrAdmin } from '../../middlewares/role.middleware';
import {
  createForm,
  createFormValidators,
  listForms,
  listFormsValidators,
  getFormById,
  getFormByCode,
  formIdValidators,
  codeValidators,
  addField,
  addFieldValidators,
  submit,
  submitValidators,
} from './controller';

const router = Router();

router.get('/code/:code', codeValidators, getFormByCode);

router.use(optionalAuth);

router.post('/:id/submit', submitValidators, submit);

router.use(authMiddleware);
router.use(staffOrAdmin);

router.post('/', createFormValidators, createForm);
router.get('/', listFormsValidators, listForms);
router.get('/:id', formIdValidators, getFormById);
router.post('/:id/fields', addFieldValidators, addField);

export const formsRoutes = router;
