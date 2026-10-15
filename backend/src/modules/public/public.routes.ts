import { Router } from 'express';
import { publicController } from './public.controller';

const router = Router();

router.get('/overview', publicController.getOverview);
router.get('/news', publicController.getNews);
router.get('/news/:slug', publicController.getNewsArticle);
router.get('/events', publicController.getEvents);
router.post('/enquiry', publicController.submitEnquiry);

export const publicRoutes = router;
