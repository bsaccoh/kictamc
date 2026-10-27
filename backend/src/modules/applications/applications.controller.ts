import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import { applicationsService } from './applications.service';
import { sendSuccess, sendCreated } from '../../utils/response';
import { parsePagination, buildPaginatedResult } from '../../utils/pagination';
import { Role } from '@prisma/client';

export class ApplicationsController {
  async getOrCreateDraft(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const draft = await applicationsService.getOrCreateDraft(req.user!.userId);
      return sendSuccess(res, draft, 'Application draft retrieved.');
    } catch (error) {
      next(error);
    }
  }

  async getMyApplications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const applications = await applicationsService.getMyApplications(req.user!.userId);
      return sendSuccess(res, applications, 'My applications retrieved.');
    } catch (error) {
      next(error);
    }
  }

  async listAdminApplications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { status, academicYearId, courseId, facultyId, departmentId, interviewStatus, search } = req.query;
      const pagination = parsePagination(req);
      const { items, total } = await applicationsService.listAdminApplications({
        status: status as any,
        academicYearId: academicYearId as string,
        courseId: courseId as string,
        facultyId: facultyId as string,
        departmentId: departmentId as string,
        interviewStatus: interviewStatus as string,
        search: search as string,
        skip: pagination.skip,
        take: pagination.take,
      });
      return sendSuccess(
        res,
        buildPaginatedResult(items, total, pagination),
        'Admin applications retrieved.'
      );
    } catch (error) {
      next(error);
    }
  }

  async getApplicationById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const isStaff = ![Role.APPLICANT, Role.STUDENT].includes(req.user!.role as any);
      const application = await applicationsService.getApplicationById(
        id,
        req.user!.userId,
        isStaff
      );
      return sendSuccess(res, application, 'Application details retrieved.');
    } catch (error) {
      next(error);
    }
  }

  async updateDraft(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const updated = await applicationsService.updateDraft(id, req.user!.userId, req.body);
      return sendSuccess(res, updated, 'Application draft saved successfully.');
    } catch (error) {
      next(error);
    }
  }

  async addEducation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const education = await applicationsService.addEducation(id, req.user!.userId, req.body);
      return sendCreated(res, education, 'Education record added.');
    } catch (error) {
      next(error);
    }
  }

  async deleteEducation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const eduId = String(req.params.eduId);
      const result = await applicationsService.deleteEducation(id, req.user!.userId, eduId);
      return sendSuccess(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  async submitApplication(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const { declarationAccepted } = req.body;
      const result = await applicationsService.submitApplication(
        id,
        req.user!.userId,
        Boolean(declarationAccepted)
      );
      return sendSuccess(res, result, 'Application submitted successfully.');
    } catch (error) {
      next(error);
    }
  }

  async decideApplication(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const { decision, decisionNotes, rejectionReason } = req.body;
      const result = await applicationsService.decideApplication(id, req.user!.userId, {
        decision,
        decisionNotes,
        rejectionReason,
      });
      return sendSuccess(res, result, `Application marked as ${decision}.`);
    } catch (error) {
      next(error);
    }
  }

  async requestCorrection(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const { reason } = req.body;
      const result = await applicationsService.requestCorrection(id, req.user!.userId, reason);
      return sendSuccess(res, result, 'Correction request sent to applicant.');
    } catch (error) {
      next(error);
    }
  }

  async updateReviewerNotes(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const { notes } = req.body;
      const result = await applicationsService.updateReviewerNotes(id, req.user!.userId, notes);
      return sendSuccess(res, result, 'Reviewer notes updated.');
    } catch (error) {
      next(error);
    }
  }

  async scheduleInterview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const { interviewDate, interviewTime, interviewVenue, interviewMode, interviewNotes } = req.body;
      const result = await applicationsService.scheduleInterview(id, req.user!.userId, {
        interviewDate,
        interviewTime,
        interviewVenue,
        interviewMode,
        interviewNotes,
      });
      return sendSuccess(res, result, 'Interview schedule published and applicant notified.');
    } catch (error) {
      next(error);
    }
  }

  async recordInterviewDecision(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const { interviewResult, interviewScore, panelRemarks } = req.body;
      const result = await applicationsService.recordInterviewDecision(id, req.user!.userId, {
        interviewResult,
        interviewScore,
        panelRemarks,
      });
      return sendSuccess(
        res,
        result,
        interviewResult === 'PASSED'
          ? 'Interview verified as successful. Acceptance letter generated and published.'
          : 'Interview recorded as unsuccessful.'
      );
    } catch (error) {
      next(error);
    }
  }

  async batchScheduleInterview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { applicationIds, interviewDate, interviewTime, interviewVenue, interviewMode, interviewNotes } = req.body;
      const result = await applicationsService.batchScheduleInterview(
        applicationIds,
        req.user!.userId,
        {
          interviewDate,
          interviewTime,
          interviewVenue,
          interviewMode,
          interviewNotes,
        }
      );
      return sendSuccess(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  async batchDecideApplications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { applicationIds, decision, remarks, publishAcceptanceLetter } = req.body;
      const result = await applicationsService.batchDecideApplications(
        applicationIds,
        req.user!.userId,
        {
          decision,
          remarks,
          publishAcceptanceLetter,
        }
      );
      return sendSuccess(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  async batchPublishAcceptance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { applicationIds } = req.body;
      const result = await applicationsService.batchPublishAcceptance(
        applicationIds,
        req.user!.userId
      );
      return sendSuccess(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  async acceptAdmissionOffer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const applicationId = String(req.params.id);
      const result = await applicationsService.acceptAdmissionOffer(
        applicationId,
        req.user!.userId
      );
      return sendSuccess(res, result, 'Admission offer accepted successfully.');
    } catch (error) {
      next(error);
    }
  }

  async issueMatriculationNumber(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const applicationId = String(req.params.id);
      const { matriculationNumber } = req.body;
      const result = await applicationsService.issueMatriculationNumber(
        applicationId,
        req.user!.userId,
        matriculationNumber
      );
      return sendSuccess(res, result, 'Official Matriculation Number issued.');
    } catch (error) {
      next(error);
    }
  }
}

export const applicationsController = new ApplicationsController();
