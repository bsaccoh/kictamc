import { Router } from 'express';
import { publicController } from './public.controller';

import { documentConfigService } from '../documentConfig/documentConfig.service';

const router = Router();

router.get('/overview', publicController.getOverview);
router.get('/news', publicController.getNews);
router.get('/news/:slug', publicController.getNewsArticle);
router.get('/events', publicController.getEvents);
router.post('/enquiry', publicController.submitEnquiry);

router.get('/document-config/:type', async (req, res, next) => {
  try {
    const type = req.params.type === 'receipt' ? 'receipt' : 'letter';
    const config = await documentConfigService.getConfig(type);
    res.json({ success: true, data: config });
  } catch (error) {
    next(error);
  }
});

export const publicRoutes = router;
