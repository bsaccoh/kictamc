import { Request, Response, NextFunction } from 'express';
import { publicService } from './public.service';

export const publicController = {
  async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await publicService.getOverview();
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  async getNews(req: Request, res: Response, next: NextFunction) {
    try {
      const category = req.query.category as string | undefined;
      const search = req.query.q as string | undefined;
      const data = await publicService.getNewsArticles(category, search);
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  async getNewsArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const data = await publicService.getNewsArticleBySlug(slug);
      if (!data) {
        return res.status(404).json({
          success: false,
          message: 'News article not found or not published.',
        });
      }
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  async getEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const category = req.query.category as string | undefined;
      const data = await publicService.getCollegeEvents(category);
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  async submitEnquiry(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await publicService.submitEnquiry(req.body);
      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
