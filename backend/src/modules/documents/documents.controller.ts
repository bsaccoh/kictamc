import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import { documentsService } from './documents.service';
import { sendSuccess, sendCreated } from '../../utils/response';
import { DocumentType } from '@prisma/client';
import fs from 'fs';
import { AppError } from '../../middleware/errorHandler';

export class DocumentsController {
  async uploadDocument(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError('No file uploaded', 400);
      }

      const applicationId = String(req.params.id);
      const documentType = req.body.documentType as DocumentType;

      if (!documentType) {
        throw new AppError('documentType is required', 400);
      }

      const doc = await documentsService.uploadApplicationDocument(
        applicationId,
        req.user!.userId,
        req.file,
        documentType
      );

      return sendCreated(res, doc, 'Document uploaded successfully.');
    } catch (error) {
      next(error);
    }
  }

  async deleteDocument(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const applicationId = String(req.params.id);
      const documentId = String(req.params.docId);

      const result = await documentsService.deleteApplicationDocument(
        applicationId,
        req.user!.userId,
        documentId
      );

      return sendSuccess(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  async downloadOrStreamDocument(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const documentId = String(req.params.id);
      const fileInfo = await documentsService.getDocumentFile(
        documentId,
        req.user!.userId,
        req.user!.role
      );

      res.setHeader('Content-Type', fileInfo.mimeType);
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${encodeURIComponent(fileInfo.originalFilename)}"`
      );

      const readStream = fs.createReadStream(fileInfo.filePath);
      readStream.pipe(res);
    } catch (error) {
      next(error);
    }
  }

  async verifyDocument(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const documentId = String(req.params.id);
      const verified = await documentsService.verifyDocument(documentId, req.user!.userId);
      return sendSuccess(res, verified, 'Document marked as verified.');
    } catch (error) {
      next(error);
    }
  }

  async rejectDocument(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const documentId = String(req.params.id);
      const { reason } = req.body;
      const rejected = await documentsService.rejectDocument(
        documentId,
        req.user!.userId,
        reason
      );
      return sendSuccess(res, rejected, 'Document rejected with remarks.');
    } catch (error) {
      next(error);
    }
  }
}

export const documentsController = new DocumentsController();
