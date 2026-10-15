import { Router } from 'express';
import { applicationsController } from './applications.controller';
import { requireAuth } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validator';
import {
  updateApplicationDraftSchema,
  addEducationSchema,
} from './applications.schemas';

const router = Router();

router.use(requireAuth);

router.post('/draft', applicationsController.getOrCreateDraft);
router.get('/me', applicationsController.getMyApplications);
router.get('/:id', applicationsController.getApplicationById);
router.patch('/:id', validateRequest(updateApplicationDraftSchema), applicationsController.updateDraft);
router.post('/:id/educations', validateRequest(addEducationSchema), applicationsController.addEducation);
router.delete('/:id/educations/:eduId', applicationsController.deleteEducation);
router.post('/:id/submit', applicationsController.submitApplication);
router.post('/:id/accept-offer', applicationsController.acceptAdmissionOffer);

export const applicationsRoutes = router;
