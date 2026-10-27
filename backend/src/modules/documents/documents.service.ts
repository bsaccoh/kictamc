import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { prisma } from '../../utils/prisma';
import { DocumentType, DocumentStatus, Role, ApplicationStatus } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler';
import { config } from '../../config';

export class DocumentsService {
  // Validate magic bytes / file signatures to prevent disguised malware
  verifyFileSignature(buffer: Buffer, mimeType: string): boolean {
    if (buffer.length < 4) return false;

    // PDF magic bytes: %PDF (0x25, 0x50, 0x44, 0x46)
    if (mimeType === 'application/pdf') {
      return (
        buffer[0] === 0x25 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x44 &&
        buffer[3] === 0x46
      );
    }

    // PNG magic bytes: 0x89, 0x50, 0x4E, 0x47
    if (mimeType === 'image/png') {
      return (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47
      );
    }

    // JPEG magic bytes: 0xFF, 0xD8, 0xFF
    if (mimeType === 'image/jpeg') {
      return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    }

    return false;
  }

  async uploadApplicationDocument(
    applicationId: string,
    userId: string,
    file: Express.Multer.File,
    documentType: DocumentType
  ) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { course: true },
    });

    if (!app) throw new AppError('Application not found', 404);
    if (app.applicantId !== userId) throw new AppError('Unauthorized', 403);

    // Prevent upload if already approved or rejected
    if (
      app.status === ApplicationStatus.APPROVED ||
      app.status === ApplicationStatus.REJECTED
    ) {
      throw new AppError('Documents cannot be uploaded for finalized applications.', 400);
    }

    // Check MIME type against allowed list
    if (!config.storage.allowedMimeTypes.includes(file.mimetype)) {
      throw new AppError(
        'Invalid file format. Only PDF, JPEG, and PNG documents are accepted.',
        400
      );
    }

    // Verify file signature
    const isValidSignature = this.verifyFileSignature(file.buffer, file.mimetype);
    if (!isValidSignature) {
      throw new AppError(
        'File content does not match the claimed file type signature. Upload rejected.',
        400
      );
    }

    // Generate safe storage filename using UUID
    const ext =
      file.mimetype === 'application/pdf'
        ? '.pdf'
        : file.mimetype === 'image/png'
        ? '.png'
        : '.jpg';
    const safeFilename = `${crypto.randomUUID()}${ext}`;
    const targetDir = path.join(config.storage.baseDir, 'documents');

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const storagePath = path.join(targetDir, safeFilename);
    fs.writeFileSync(storagePath, file.buffer);

    // Check if a document of this type already exists for this application; if so, replace it
    const existing = await prisma.applicationDocument.findFirst({
      where: { applicationId, documentType },
    });

    if (existing) {
      // Remove old file from disk if it exists
      if (fs.existsSync(existing.storagePath)) {
        try {
          fs.unlinkSync(existing.storagePath);
        } catch {
          // ignore unlink error
        }
      }

      return prisma.applicationDocument.update({
        where: { id: existing.id },
        data: {
          originalFilename: file.originalname,
          storagePath,
          fileSizeBytes: file.size,
          mimeType: file.mimetype,
          status: DocumentStatus.PENDING,
          rejectionReason: null,
          verifiedAt: null,
          verifiedByUserId: null,
        },
      });
    }

    return prisma.applicationDocument.create({
      data: {
        applicationId,
        documentType,
        originalFilename: file.originalname,
        storagePath,
        fileSizeBytes: file.size,
        mimeType: file.mimetype,
        status: DocumentStatus.PENDING,
      },
    });
  }

  async deleteApplicationDocument(applicationId: string, userId: string, documentId: string) {
    const app = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!app || app.applicantId !== userId) throw new AppError('Unauthorized', 403);

    const doc = await prisma.applicationDocument.findFirst({
      where: { id: documentId, applicationId },
    });
    if (!doc) throw new AppError('Document not found', 404);

    if (doc.status === DocumentStatus.VERIFIED) {
      throw new AppError('Verified documents cannot be deleted.', 400);
    }

    if (fs.existsSync(doc.storagePath)) {
      try {
        fs.unlinkSync(doc.storagePath);
      } catch {
        // ignore
      }
    }

    await prisma.applicationDocument.delete({ where: { id: documentId } });
    return { message: 'Document removed successfully.' };
  }

  async getDocumentFile(documentId: string, userId: string, userRole: Role) {
    const doc = await prisma.applicationDocument.findUnique({
      where: { id: documentId },
      include: {
        application: true,
      },
    });

    if (!doc) throw new AppError('Document not found', 404);

    const isStaff = userRole !== Role.APPLICANT && userRole !== Role.STUDENT;
    if (!isStaff && doc.application.applicantId !== userId) {
      throw new AppError('Access forbidden: You cannot view this document.', 403);
    }

    if (!fs.existsSync(doc.storagePath)) {
      throw new AppError('Stored document file missing on disk', 404);
    }

    return {
      filePath: doc.storagePath,
      mimeType: doc.mimeType,
      originalFilename: doc.originalFilename,
    };
  }

  // Admissions Officer Verification
  async verifyDocument(documentId: string, staffUserId: string) {
    const doc = await prisma.applicationDocument.findUnique({
      where: { id: documentId },
      include: { application: true },
    });
    if (!doc) throw new AppError('Document not found', 404);

    const updated = await prisma.applicationDocument.update({
      where: { id: documentId },
      data: {
        status: DocumentStatus.VERIFIED,
        verifiedAt: new Date(),
        verifiedByUserId: staffUserId,
        rejectionReason: null,
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: staffUserId,
        action: 'DOCUMENT_VERIFIED',
        resource: 'ApplicationDocument',
        resourceId: documentId,
        details: {
          applicationReference: doc.application.applicationReference,
          documentType: doc.documentType,
        },
      },
    });

    return updated;
  }

  async rejectDocument(documentId: string, staffUserId: string, reason: string) {
    if (!reason || reason.trim().length === 0) {
      throw new AppError('A valid rejection reason is required.', 400);
    }

    const doc = await prisma.applicationDocument.findUnique({
      where: { id: documentId },
      include: { application: true },
    });
    if (!doc) throw new AppError('Document not found', 404);

    const updated = await prisma.applicationDocument.update({
      where: { id: documentId },
      data: {
        status: DocumentStatus.REJECTED,
        rejectionReason: reason,
        verifiedAt: new Date(),
        verifiedByUserId: staffUserId,
      },
    });

    // Notify applicant
    await prisma.notification.create({
      data: {
        userId: doc.application.applicantId,
        title: 'Document Correction Required',
        message: `Your uploaded ${doc.documentType} for application ${doc.application.applicationReference} was rejected. Reason: ${reason}. Please upload a replacement.`,
        type: 'WARNING',
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: staffUserId,
        action: 'DOCUMENT_REJECTED',
        resource: 'ApplicationDocument',
        resourceId: documentId,
        details: {
          applicationReference: doc.application.applicationReference,
          documentType: doc.documentType,
          reason,
        },
      },
    });

    return updated;
  }
}

export const documentsService = new DocumentsService();
