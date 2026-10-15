import { prisma } from '../../utils/prisma';
import { ApplicationStatus, PaymentStatus } from '@prisma/client';
import { generateApplicationReference } from '../../utils/tokens';
import { AppError } from '../../middleware/errorHandler';

export class ApplicationsService {
  async getOrCreateDraft(userId: string) {
    // 1. Check for existing draft application
    let draft = await prisma.application.findFirst({
      where: {
        applicantId: userId,
        status: ApplicationStatus.DRAFT,
      },
      include: {
        academicYear: true,
        intake: true,
        course: {
          include: {
            department: true,
            documentRequirements: true,
          },
        },
        educations: true,
        documents: true,
      },
    });

    if (draft) return draft;

    // 2. If no draft exists, locate active academic year, active intake, and active course
    const activeYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
      include: {
        intakes: { where: { isActive: true } },
      },
    });

    if (!activeYear || activeYear.intakes.length === 0) {
      throw new AppError('No active admission intakes currently available.', 400);
    }

    const activeCourse = await prisma.course.findFirst({
      where: { isActive: true },
    });

    if (!activeCourse) {
      throw new AppError('No active academic courses found.', 400);
    }

    // 3. Create fresh draft application with unique reference
    const currentYear = new Date().getFullYear();
    const reference = generateApplicationReference(currentYear);

    draft = await prisma.application.create({
      data: {
        applicantId: userId,
        applicationReference: reference,
        academicYearId: activeYear.id,
        intakeId: activeYear.intakes[0].id,
        courseId: activeCourse.id,
        status: ApplicationStatus.DRAFT,
        paymentStatus: PaymentStatus.UNPAID,
        currentStep: 1,
      },
      include: {
        academicYear: true,
        intake: true,
        course: {
          include: {
            department: true,
            documentRequirements: true,
          },
        },
        educations: true,
        documents: true,
      },
    });

    return draft;
  }

  async getMyApplications(userId: string) {
    return prisma.application.findMany({
      where: { applicantId: userId },
      include: {
        applicant: {
          select: {
            id: true,
            email: true,
            phone: true,
            firstName: true,
            middleName: true,
            surname: true,
            studentProfile: true,
          },
        },
        academicYear: true,
        intake: true,
        course: {
          include: { department: true, faculty: true },
        },
        documents: true,
        payments: true,
        confirmationToken: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listAdminApplications(params: {
    status?: ApplicationStatus;
    academicYearId?: string;
    courseId?: string;
    facultyId?: string;
    departmentId?: string;
    interviewStatus?: string;
    search?: string;
  }) {
    const { status, academicYearId, courseId, facultyId, departmentId, interviewStatus, search } = params;

    const courseWhere: any = {};
    if (courseId && courseId !== 'ALL') courseWhere.id = courseId;
    if (facultyId && facultyId !== 'ALL') courseWhere.facultyId = facultyId;
    if (departmentId && departmentId !== 'ALL') courseWhere.departmentId = departmentId;

    return prisma.application.findMany({
      where: {
        ...(status && { status }),
        ...(academicYearId && academicYearId !== 'ALL' && { academicYearId }),
        ...(Object.keys(courseWhere).length > 0 && { course: courseWhere }),
        ...(interviewStatus && interviewStatus !== 'ALL' && { interviewStatus }),
        ...(search && {
          OR: [
            { applicationReference: { contains: search, mode: 'insensitive' } },
            { applicant: { firstName: { contains: search, mode: 'insensitive' } } },
            { applicant: { surname: { contains: search, mode: 'insensitive' } } },
            { applicant: { email: { contains: search, mode: 'insensitive' } } },
            { applicant: { phone: { contains: search } } },
          ],
        }),
      },
      include: {
        applicant: {
          select: {
            id: true,
            email: true,
            phone: true,
            firstName: true,
            middleName: true,
            surname: true,
            studentProfile: true,
          },
        },
        academicYear: true,
        intake: true,
        course: {
          include: {
            department: true,
            faculty: true,
          },
        },
        documents: true,
        payments: {
          include: { confirmationToken: true },
        },
        confirmationToken: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getApplicationById(id: string, userId: string, isStaff = false) {
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        applicant: {
          select: {
            id: true,
            email: true,
            phone: true,
            firstName: true,
            middleName: true,
            surname: true,
            studentProfile: true,
          },
        },
        academicYear: true,
        intake: true,
        course: {
          include: {
            department: true,
            documentRequirements: true,
          },
        },
        educations: true,
        documents: true,
        payments: {
          include: { confirmationToken: true },
        },
        statusHistories: {
          orderBy: { createdAt: 'desc' },
        },
        confirmationToken: true,
      },
    });

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    // Object-level authorization check: applicant can only view their own application
    if (!isStaff && application.applicantId !== userId) {
      throw new AppError('Access forbidden: You cannot view another student application.', 403);
    }

    return application;
  }

  async updateDraft(id: string, userId: string, data: any) {
    const application = await prisma.application.findUnique({ where: { id } });
    if (!application) throw new AppError('Application not found', 404);

    if (application.applicantId !== userId) {
      throw new AppError('Access forbidden', 403);
    }

    if (
      application.status !== ApplicationStatus.DRAFT &&
      application.status !== ApplicationStatus.ACTION_REQUIRED
    ) {
      throw new AppError(
        `Application cannot be modified in status "${application.status}".`,
        400
      );
    }

    const {
      currentStep,
      academicYearId,
      intakeId,
      courseId,
      studyMode,
      preferredCampus,
      personal,
      contact,
      parent,
      emergency,
    } = data;

    // 1. Update Application base properties
    await prisma.application.update({
      where: { id },
      data: {
        ...(currentStep !== undefined && { currentStep }),
        ...(academicYearId && { academicYearId }),
        ...(intakeId && { intakeId }),
        ...(courseId && { courseId }),
        ...(studyMode && { studyMode }),
        ...(preferredCampus && { preferredCampus }),
      },
    });

    // 2. Update Student User base names if provided
    if (personal?.firstName || personal?.surname || personal?.middleName !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          ...(personal.firstName && { firstName: personal.firstName }),
          ...(personal.middleName !== undefined && { middleName: personal.middleName || null }),
          ...(personal.surname && { surname: personal.surname }),
        },
      });
    }

    // 3. Upsert Student Profile with personal, contact, parent, and emergency details
    const profileUpdate: any = {};
    if (personal) {
      if (personal.dateOfBirth) profileUpdate.dateOfBirth = new Date(personal.dateOfBirth);
      if (personal.gender !== undefined) profileUpdate.gender = personal.gender;
      if (personal.nationality !== undefined) profileUpdate.nationality = personal.nationality;
      if (personal.placeOfBirth !== undefined) profileUpdate.placeOfBirth = personal.placeOfBirth;
      if (personal.maritalStatus !== undefined) profileUpdate.maritalStatus = personal.maritalStatus;
      if (personal.passportPhotoUrl !== undefined)
        profileUpdate.passportPhotoUrl = personal.passportPhotoUrl;
    }

    if (contact) {
      if (contact.residentialAddress !== undefined)
        profileUpdate.residentialAddress = contact.residentialAddress;
      if (contact.townCity !== undefined) profileUpdate.townCity = contact.townCity;
      if (contact.chiefdom !== undefined) profileUpdate.chiefdom = contact.chiefdom;
      if (contact.district !== undefined) profileUpdate.district = contact.district;
      if (contact.regionProvince !== undefined)
        profileUpdate.regionProvince = contact.regionProvince;
      if (contact.postalAddress !== undefined) profileUpdate.postalAddress = contact.postalAddress;
    }

    if (parent) {
      if (parent.parentFullName !== undefined) profileUpdate.parentFullName = parent.parentFullName;
      if (parent.parentRelationship !== undefined)
        profileUpdate.parentRelationship = parent.parentRelationship;
      if (parent.parentPhone !== undefined) profileUpdate.parentPhone = parent.parentPhone;
      if (parent.parentAltPhone !== undefined) profileUpdate.parentAltPhone = parent.parentAltPhone;
      if (parent.parentAddress !== undefined) profileUpdate.parentAddress = parent.parentAddress;
      if (parent.parentEmail !== undefined)
        profileUpdate.parentEmail = parent.parentEmail || null;
      if (parent.parentOccupation !== undefined)
        profileUpdate.parentOccupation = parent.parentOccupation;
    }

    if (emergency) {
      if (emergency.emergencyFullName !== undefined)
        profileUpdate.emergencyFullName = emergency.emergencyFullName;
      if (emergency.emergencyRelationship !== undefined)
        profileUpdate.emergencyRelationship = emergency.emergencyRelationship;
      if (emergency.emergencyPhone !== undefined)
        profileUpdate.emergencyPhone = emergency.emergencyPhone;
      if (emergency.emergencyAddress !== undefined)
        profileUpdate.emergencyAddress = emergency.emergencyAddress;
    }

    if (Object.keys(profileUpdate).length > 0) {
      await prisma.studentProfile.upsert({
        where: { userId },
        update: profileUpdate,
        create: {
          userId,
          ...profileUpdate,
        },
      });
    }

    return this.getApplicationById(id, userId, false);
  }

  // Educational History
  async addEducation(applicationId: string, userId: string, data: any) {
    const app = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!app || app.applicantId !== userId) {
      throw new AppError('Application not found or unauthorized', 404);
    }

    return prisma.applicationEducation.create({
      data: {
        applicationId,
        institutionName: data.institutionName,
        institutionLocation: data.institutionLocation,
        examinationType: data.examinationType,
        examinationYear: data.examinationYear,
        candidateNumber: data.candidateNumber || null,
        qualificationObtained: data.qualificationObtained,
        completionStatus: data.completionStatus || 'COMPLETED',
        subjectsAndGrades: data.subjectsAndGrades || null,
      },
    });
  }

  async deleteEducation(applicationId: string, userId: string, educationId: string) {
    const app = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!app || app.applicantId !== userId) {
      throw new AppError('Application not found or unauthorized', 404);
    }

    const edu = await prisma.applicationEducation.findFirst({
      where: { id: educationId, applicationId },
    });
    if (!edu) throw new AppError('Education record not found', 404);

    await prisma.applicationEducation.delete({
      where: { id: educationId },
    });

    return { message: 'Education record deleted successfully' };
  }

  async submitApplication(id: string, userId: string, declarationAccepted: boolean) {
    if (!declarationAccepted) {
      throw new AppError('You must accept the truthfulness declaration before submitting.', 400);
    }

    const app = await prisma.application.findUnique({
      where: { id },
      include: {
        applicant: { include: { studentProfile: true } },
        course: { include: { department: true, documentRequirements: true } },
        intake: true,
        educations: true,
        documents: true,
      },
    });

    if (!app || app.applicantId !== userId) {
      throw new AppError('Application not found or unauthorized', 404);
    }

    if (
      app.status !== ApplicationStatus.DRAFT &&
      app.status !== ApplicationStatus.ACTION_REQUIRED
    ) {
      throw new AppError(`Application is already in status "${app.status}".`, 400);
    }

    // 1. Check admission intake deadline
    if (!app.intake.isActive || new Date(app.intake.applicationDeadline) < new Date()) {
      throw new AppError('The admission deadline for this intake has closed.', 400);
    }

    // 2. Check course active
    if (!app.course.isActive) {
      throw new AppError('The selected course is currently inactive.', 400);
    }

    // 3. Check applicant profile completeness
    const profile = app.applicant.studentProfile;
    if (!profile?.dateOfBirth || !profile?.residentialAddress || !profile?.townCity) {
      throw new AppError(
        'Please complete your personal and contact address details before submitting.',
        400
      );
    }

    // 4. Check education records (at least one)
    if (app.educations.length === 0) {
      throw new AppError(
        'Please add at least one prior educational qualification before submitting.',
        400
      );
    }

    // 5. Check mandatory documents
    const mandatoryRequirements = (app.course.documentRequirements || []).filter(
      (r) => r.isMandatory
    );
    const uploadedTypes = new Set(app.documents.map((d) => d.documentType));
    const missingDocs = mandatoryRequirements.filter((r) => !uploadedTypes.has(r.documentType));

    if (missingDocs.length > 0) {
      const missingNames = missingDocs.map((m) => m.name).join(', ');
      throw new AppError(
        `Missing mandatory document(s): ${missingNames}. Please upload them before submitting.`,
        400
      );
    }

    // 6. Execute atomic submission transaction
    const fromStatus = app.status;
    const toStatus = ApplicationStatus.AWAITING_PAYMENT;

    return prisma.$transaction(async (tx) => {
      const updated = await tx.application.update({
        where: { id },
        data: {
          status: toStatus,
          submittedAt: new Date(),
          declarationAccepted: true,
          declarationAcceptedAt: new Date(),
          // Auditable Snapshot
          courseNameSnapshot: app.course.name,
          courseCodeSnapshot: app.course.code,
          courseLevelSnapshot: app.course.qualificationLevel,
          departmentNameSnapshot: app.course.department?.name || null,
          applicationFeeMinorSnapshot: app.course.applicationFeeMinor,
          tuitionFeeMinorSnapshot: app.course.tuitionFeeMinor,
          currencySnapshot: app.course.currency,
        },
        include: {
          course: { include: { department: true } },
          academicYear: true,
          intake: true,
          educations: true,
          documents: true,
          statusHistories: true,
        },
      });

      // Status history
      await tx.applicationStatusHistory.create({
        data: {
          applicationId: id,
          fromStatus,
          toStatus,
          changedByUserId: userId,
          changeReason: 'Applicant submitted application through portal.',
        },
      });

      // Notification
      await tx.notification.create({
        data: {
          userId,
          title: 'Application Submitted Successfully',
          message: `Your application (${app.applicationReference}) for ${app.course.name} has been submitted. Please complete your fee payment of SLE ${(app.course.applicationFeeMinor / 100).toFixed(2)} to proceed to admissions review.`,
          type: 'SUCCESS',
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          userId,
          userEmail: app.applicant.email,
          action: 'APPLICATION_SUBMITTED',
          resource: 'Application',
          resourceId: id,
          details: {
            applicationReference: app.applicationReference,
            courseCode: app.course.code,
            fee: app.course.applicationFeeMinor,
          },
        },
      });

      return updated;
    });
  }

  // Admissions Staff: Issue Admission Decision
  async decideApplication(
    id: string,
    staffUserId: string,
    data: {
      decision: 'APPROVED' | 'REJECTED';
      decisionNotes?: string;
      rejectionReason?: string;
    }
  ) {
    const app = await prisma.application.findUnique({
      where: { id },
      include: {
        applicant: true,
        course: true,
      },
    });

    if (!app) throw new AppError('Application not found', 404);

    const fromStatus = app.status;
    const toStatus =
      data.decision === 'APPROVED' ? ApplicationStatus.APPROVED : ApplicationStatus.REJECTED;
    const remarks =
      data.decision === 'APPROVED'
        ? data.decisionNotes || 'Application successfully approved for admission.'
        : data.rejectionReason || data.decisionNotes || 'Application does not meet current admission requirements.';

    return prisma.$transaction(async (tx) => {
      const isApproved = data.decision === 'APPROVED';
      const updated = await tx.application.update({
        where: { id },
        data: {
          status: toStatus,
          decisionAt: new Date(),
          decidedByUserId: staffUserId,
          decisionRemarks: remarks,
          acceptanceLetterPublished: isApproved,
          acceptanceLetterPublishedAt: isApproved ? new Date() : null,
          ...(isApproved && app.interviewStatus === 'SCHEDULED' && {
            interviewStatus: 'PASSED',
            interviewConductedAt: new Date(),
          }),
        },
        include: {
          applicant: { select: { firstName: true, surname: true, email: true } },
          course: true,
          decidedBy: { select: { firstName: true, surname: true, email: true } },
        },
      });

      // Status history
      await tx.applicationStatusHistory.create({
        data: {
          applicationId: id,
          fromStatus,
          toStatus,
          changedByUserId: staffUserId,
          changeReason: `Admissions Board Decision: ${data.decision}. ${remarks}`,
        },
      });

      // Student notification
      await tx.notification.create({
        data: {
          userId: app.applicantId,
          title:
            data.decision === 'APPROVED'
              ? 'Admission Offer — Congratulations!'
              : 'Admissions Decision Update',
          message:
            data.decision === 'APPROVED'
              ? `Congratulations ${app.applicant.firstName}! Your application (${app.applicationReference}) for ${app.course.name} has been APPROVED by the KICTAMC Admissions Board.`
              : `Your application (${app.applicationReference}) for ${app.course.name} has been reviewed. Outcome: Not Accepted. Reason: ${remarks}`,
          type: data.decision === 'APPROVED' ? 'SUCCESS' : 'ERROR',
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          userId: staffUserId,
          action: data.decision === 'APPROVED' ? 'APPLICATION_APPROVED' : 'APPLICATION_REJECTED',
          resource: 'Application',
          resourceId: id,
          details: {
            applicationReference: app.applicationReference,
            decision: data.decision,
            remarks,
          },
        },
      });

      return updated;
    });
  }

  // Admissions Staff: Request Applicant Correction
  async requestCorrection(id: string, staffUserId: string, reason: string) {
    if (!reason || reason.trim().length === 0) {
      throw new AppError('A valid correction reason must be provided.', 400);
    }

    const app = await prisma.application.findUnique({
      where: { id },
      include: {
        applicant: true,
        course: true,
      },
    });

    if (!app) throw new AppError('Application not found', 404);

    return prisma.$transaction(async (tx) => {
      const updated = await tx.application.update({
        where: { id },
        data: {
          status: ApplicationStatus.ACTION_REQUIRED,
          correctionNotes: reason,
        },
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: id,
          fromStatus: app.status,
          toStatus: ApplicationStatus.ACTION_REQUIRED,
          changedByUserId: staffUserId,
          changeReason: `Admissions officer requested correction: ${reason}`,
        },
      });

      await tx.notification.create({
        data: {
          userId: app.applicantId,
          title: 'Action Required on Your Application',
          message: `The Admissions Office has requested corrections for application ${app.applicationReference}: ${reason}. Please update your submission.`,
          type: 'WARNING',
        },
      });

      await tx.auditLog.create({
        data: {
          userId: staffUserId,
          action: 'APPLICATION_CORRECTION_REQUESTED',
          resource: 'Application',
          resourceId: id,
          details: {
            applicationReference: app.applicationReference,
            reason,
          },
        },
      });

      return updated;
    });
  }

  // Staff: Save Reviewer Notes
  async updateReviewerNotes(id: string, staffUserId: string, notes: string) {
    const app = await prisma.application.findUnique({ where: { id } });
    if (!app) throw new AppError('Application not found', 404);

    const updated = await prisma.application.update({
      where: { id },
      data: {
        correctionNotes: notes,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: staffUserId,
        action: 'APPLICATION_NOTES_UPDATED',
        resource: 'Application',
        resourceId: id,
        details: { notes },
      },
    });

    return updated;
  }

  // Staff: Configure and publish interview schedule for applicant
  async scheduleInterview(
    id: string,
    staffUserId: string,
    data: {
      interviewDate: string;
      interviewTime: string;
      interviewVenue: string;
      interviewMode?: string;
      interviewNotes?: string;
    }
  ) {
    const app = await prisma.application.findUnique({
      where: { id },
      include: { applicant: true, course: true },
    });

    if (!app) throw new AppError('Application not found', 404);

    const interviewDateObj = new Date(data.interviewDate);
    if (isNaN(interviewDateObj.getTime())) {
      throw new AppError('Invalid interview date provided', 400);
    }

    const updated = await prisma.application.update({
      where: { id },
      data: {
        interviewDate: interviewDateObj,
        interviewTime: data.interviewTime,
        interviewVenue: data.interviewVenue,
        interviewMode: data.interviewMode || 'IN_PERSON',
        interviewNotes: data.interviewNotes || null,
        interviewStatus: 'SCHEDULED',
        interviewScheduledAt: new Date(),
      },
      include: {
        applicant: { select: { firstName: true, surname: true, email: true, phone: true } },
        course: true,
      },
    });

    const dateFormatted = interviewDateObj.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    // Notify applicant
    await prisma.notification.create({
      data: {
        userId: app.applicantId,
        title: 'Admissions Interview Scheduled',
        message: `Your admissions interview for ${app.course.name} is scheduled for ${dateFormatted} at ${data.interviewTime}. Venue: ${data.interviewVenue}. Please check your applicant portal for full instructions and preparation materials.`,
        type: 'INFO',
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: staffUserId,
        action: 'APPLICATION_INTERVIEW_SCHEDULED',
        resource: 'Application',
        resourceId: id,
        details: {
          applicationReference: app.applicationReference,
          interviewDate: data.interviewDate,
          interviewTime: data.interviewTime,
          interviewVenue: data.interviewVenue,
          interviewMode: data.interviewMode,
        },
      },
    });

    return updated;
  }

  // Staff: Verify interview outcome, record result, and approve admission
  async recordInterviewDecision(
    id: string,
    staffUserId: string,
    data: {
      interviewResult: 'PASSED' | 'FAILED';
      interviewScore?: number;
      panelRemarks?: string;
    }
  ) {
    const app = await prisma.application.findUnique({
      where: { id },
      include: { applicant: true, course: true },
    });

    if (!app) throw new AppError('Application not found', 404);

    const isPassed = data.interviewResult === 'PASSED';
    const fromStatus = app.status;
    const toStatus = isPassed ? ApplicationStatus.APPROVED : ApplicationStatus.REJECTED;
    const remarks =
      data.panelRemarks ||
      (isPassed
        ? 'Admissions interview verified and passed successfully. Provisional admission approved.'
        : 'Candidate did not meet interview qualification benchmarks.');

    return prisma.$transaction(async (tx) => {
      const updated = await tx.application.update({
        where: { id },
        data: {
          interviewStatus: isPassed ? 'PASSED' : 'FAILED',
          interviewScore: data.interviewScore !== undefined ? Number(data.interviewScore) : null,
          interviewConductedAt: new Date(),
          status: toStatus,
          decisionAt: new Date(),
          decidedByUserId: staffUserId,
          decisionRemarks: remarks,
          acceptanceLetterPublished: isPassed,
          acceptanceLetterPublishedAt: isPassed ? new Date() : null,
        },
        include: {
          applicant: { select: { firstName: true, surname: true, email: true } },
          course: true,
          decidedBy: { select: { firstName: true, surname: true, email: true } },
        },
      });

      // Status history
      await tx.applicationStatusHistory.create({
        data: {
          applicationId: id,
          fromStatus,
          toStatus,
          changedByUserId: staffUserId,
          changeReason: `Interview Verification Result: ${data.interviewResult}. ${remarks}`,
        },
      });

      // Notification to applicant
      await tx.notification.create({
        data: {
          userId: app.applicantId,
          title: isPassed
            ? 'Interview Successful — Acceptance Letter Published!'
            : 'Admissions Interview Outcome',
          message: isPassed
            ? `Congratulations ${app.applicant.firstName}! Your admissions interview for ${app.course.name} was successful and verified. Your official Provisional Acceptance Letter is now generated and published to your portal.`
            : `Your admissions interview for ${app.course.name} has concluded. Outcome: Not Accepted. Reason: ${remarks}`,
          type: isPassed ? 'SUCCESS' : 'ERROR',
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          userId: staffUserId,
          action: isPassed
            ? 'INTERVIEW_PASSED_ADMISSION_APPROVED'
            : 'INTERVIEW_FAILED_APPLICATION_REJECTED',
          resource: 'Application',
          resourceId: id,
          details: {
            applicationReference: app.applicationReference,
            interviewResult: data.interviewResult,
            score: data.interviewScore,
            remarks,
            acceptanceLetterPublished: isPassed,
          },
        },
      });

      return updated;
    });
  }

  // Staff: Batch schedule interviews for multiple applications
  async batchScheduleInterview(
    applicationIds: string[],
    staffUserId: string,
    data: {
      interviewDate: string;
      interviewTime: string;
      interviewVenue: string;
      interviewMode?: string;
      interviewNotes?: string;
    }
  ) {
    if (!applicationIds || applicationIds.length === 0) {
      throw new AppError('No applications selected for batch interview scheduling', 400);
    }

    const interviewDateObj = new Date(data.interviewDate);
    if (isNaN(interviewDateObj.getTime())) {
      throw new AppError('Invalid interview date provided', 400);
    }

    const dateFormatted = interviewDateObj.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const applications = await prisma.application.findMany({
      where: { id: { in: applicationIds } },
      include: { applicant: true, course: true },
    });

    let successCount = 0;

    for (const app of applications) {
      const fromStatus = app.status;
      const toStatus =
        app.status === ApplicationStatus.SUBMITTED
          ? ApplicationStatus.UNDER_REVIEW
          : app.status;

      await prisma.$transaction(async (tx) => {
        await tx.application.update({
          where: { id: app.id },
          data: {
            status: toStatus,
            interviewDate: interviewDateObj,
            interviewTime: data.interviewTime,
            interviewVenue: data.interviewVenue,
            interviewMode: data.interviewMode || 'IN_PERSON',
            interviewNotes: data.interviewNotes || null,
            interviewStatus: 'SCHEDULED',
            interviewScheduledAt: new Date(),
          },
        });

        if (fromStatus !== toStatus) {
          await tx.applicationStatusHistory.create({
            data: {
              applicationId: app.id,
              fromStatus,
              toStatus,
              changedByUserId: staffUserId,
              changeReason: `Admissions Interview scheduled for ${dateFormatted} at ${data.interviewTime}.`,
            },
          });
        }

        await tx.notification.create({
          data: {
            userId: app.applicantId,
            title: 'Admissions Interview Scheduled',
            message: `Your admissions interview for ${app.course.name} is scheduled for ${dateFormatted} at ${data.interviewTime}. Venue: ${data.interviewVenue}. Check your portal for preparation details.`,
            type: 'INFO',
          },
        });
      });

      successCount++;
    }

    await prisma.auditLog.create({
      data: {
        userId: staffUserId,
        action: 'BATCH_INTERVIEW_SCHEDULED',
        resource: 'Application',
        resourceId: `BATCH_${successCount}`,
        details: {
          count: successCount,
          applicationIds,
          interviewDate: data.interviewDate,
          interviewTime: data.interviewTime,
          interviewVenue: data.interviewVenue,
        },
      },
    });

    return {
      count: successCount,
      message: `Successfully scheduled interview for ${successCount} applicant(s).`,
    };
  }

  // Staff: Batch approve or reject applications
  async batchDecideApplications(
    applicationIds: string[],
    staffUserId: string,
    data: {
      decision: 'APPROVED' | 'REJECTED' | 'SHORTLIST_FOR_INTERVIEW';
      remarks?: string;
      publishAcceptanceLetter?: boolean;
    }
  ) {
    if (!applicationIds || applicationIds.length === 0) {
      throw new AppError('No applications selected for batch decision', 400);
    }

    const applications = await prisma.application.findMany({
      where: { id: { in: applicationIds } },
      include: { applicant: true, course: true },
    });

    const isApproved = data.decision === 'APPROVED';
    const isShortlist = data.decision === 'SHORTLIST_FOR_INTERVIEW';
    const toStatus = isApproved
      ? ApplicationStatus.APPROVED
      : isShortlist
      ? ApplicationStatus.UNDER_REVIEW
      : ApplicationStatus.REJECTED;

    const defaultRemarks = isApproved
      ? 'Batch admission approval: Candidate meets all academic entrance criteria. Provisional offer issued.'
      : isShortlist
      ? 'Shortlisted for admissions interview and assessment.'
      : 'Application rejected: Candidate does not satisfy collegiate entry benchmark.';

    const remarks = data.remarks || defaultRemarks;
    const shouldPublishLetter = isApproved && data.publishAcceptanceLetter !== false;

    let successCount = 0;

    for (const app of applications) {
      const fromStatus = app.status;

      await prisma.$transaction(async (tx) => {
        await tx.application.update({
          where: { id: app.id },
          data: {
            status: toStatus,
            decisionAt: new Date(),
            decidedByUserId: staffUserId,
            decisionRemarks: remarks,
            acceptanceLetterPublished: shouldPublishLetter,
            acceptanceLetterPublishedAt: shouldPublishLetter ? new Date() : null,
            ...(isApproved &&
              app.interviewStatus === 'SCHEDULED' && {
                interviewStatus: 'PASSED',
                interviewConductedAt: new Date(),
              }),
          },
        });

        await tx.applicationStatusHistory.create({
          data: {
            applicationId: app.id,
            fromStatus,
            toStatus,
            changedByUserId: staffUserId,
            changeReason: `Batch Admissions Board Decision: ${data.decision}. ${remarks}`,
          },
        });

        await tx.notification.create({
          data: {
            userId: app.applicantId,
            title: isApproved
              ? 'Admission Offer — Acceptance Letter Published!'
              : isShortlist
              ? 'Application Shortlisted for Admissions Review'
              : 'Admissions Decision Update',
            message: isApproved
              ? `Congratulations ${app.applicant.firstName}! Your application (${app.applicationReference}) for ${app.course.name} has been APPROVED by the Admissions Board. Your official Provisional Acceptance Letter is now available in your portal.`
              : isShortlist
              ? `Good news ${app.applicant.firstName}! Your application (${app.applicationReference}) for ${app.course.name} has been shortlisted for upcoming interviews.`
              : `Your application (${app.applicationReference}) for ${app.course.name} has been reviewed. Outcome: Not Accepted. Reason: ${remarks}`,
            type: isApproved ? 'SUCCESS' : isShortlist ? 'INFO' : 'ERROR',
          },
        });
      });

      successCount++;
    }

    await prisma.auditLog.create({
      data: {
        userId: staffUserId,
        action: 'BATCH_ADMISSION_DECISION',
        resource: 'Application',
        resourceId: `BATCH_${data.decision}_${successCount}`,
        details: {
          decision: data.decision,
          count: successCount,
          applicationIds,
          remarks,
          publishedLetters: shouldPublishLetter,
        },
      },
    });

    return {
      count: successCount,
      message: `Successfully processed batch decision (${data.decision}) for ${successCount} applicant(s).`,
    };
  }

  // Staff: Batch publish acceptance letters
  async batchPublishAcceptance(applicationIds: string[], staffUserId: string) {
    if (!applicationIds || applicationIds.length === 0) {
      throw new AppError('No applications selected for batch publication', 400);
    }

    const applications = await prisma.application.findMany({
      where: {
        id: { in: applicationIds },
        status: ApplicationStatus.APPROVED,
      },
      include: { applicant: true, course: true },
    });

    let count = 0;
    for (const app of applications) {
      await prisma.$transaction(async (tx) => {
        await tx.application.update({
          where: { id: app.id },
          data: {
            acceptanceLetterPublished: true,
            acceptanceLetterPublishedAt: new Date(),
          },
        });

        await tx.notification.create({
          data: {
            userId: app.applicantId,
            title: 'Official Acceptance Letter Published',
            message: `Your official Provisional Acceptance Letter for ${app.course.name} is now generated and ready to download in your portal.`,
            type: 'SUCCESS',
          },
        });
      });
      count++;
    }

    await prisma.auditLog.create({
      data: {
        userId: staffUserId,
        action: 'BATCH_ACCEPTANCE_LETTERS_PUBLISHED',
        resource: 'Application',
        resourceId: `BATCH_LETTERS_${count}`,
        details: { count, applicationIds },
      },
    });

    return {
      count,
      message: `Successfully published acceptance letters for ${count} applicant(s).`,
    };
  }

  // Applicant accepts their provisional admission offer
  async acceptAdmissionOffer(id: string, userId: string) {
    const app = await prisma.application.findUnique({
      where: { id },
      include: { course: true, applicant: true },
    });

    if (!app) throw new AppError('Application not found', 404);
    if (app.applicantId !== userId) {
      throw new AppError('Unauthorized: You can only accept offers for your own application', 403);
    }
    if (app.status !== ApplicationStatus.APPROVED) {
      throw new AppError('Application must be approved before accepting the offer', 400);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const res = await tx.application.update({
        where: { id },
        data: {
          offerAccepted: true,
          offerAcceptedAt: new Date(),
        },
        include: {
          course: true,
          applicant: true,
          academicYear: true,
        },
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: id,
          fromStatus: app.status,
          toStatus: app.status,
          changedByUserId: userId,
          changeReason: `Applicant formally accepted provisional admission offer for ${app.course.name}.`,
        },
      });

      await tx.notification.create({
        data: {
          userId,
          title: 'Admission Offer Accepted!',
          message: `Congratulations! You have formally accepted your admission offer for ${app.course.name}. Please proceed to pay your matriculation fee (1st installment or full session) to complete enrollment and receive your official Matriculation Number.`,
          type: 'SUCCESS',
        },
      });

      return res;
    });

    return updated;
  }

  // Staff issues or assigns official matriculation number
  async issueMatriculationNumber(id: string, staffUserId: string, customNumber?: string) {
    const app = await prisma.application.findUnique({
      where: { id },
      include: { course: true, academicYear: true, applicant: true },
    });

    if (!app) throw new AppError('Application not found', 404);
    if (app.status !== ApplicationStatus.APPROVED) {
      throw new AppError('Cannot matriculate an unapproved application', 400);
    }

    let matNo = customNumber?.trim();
    if (!matNo) {
      const yearStr = app.academicYear?.name?.match(/\d{4}/)?.[0] || new Date().getFullYear().toString();
      const courseCodeClean = (app.course.code || 'GEN')
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(0, 4)
        .toUpperCase();
      const count = await prisma.application.count({
        where: { isEnrolled: true },
      });
      const seq = String(count + 1).padStart(4, '0');
      matNo = `KICTAMC/${yearStr}/${courseCodeClean}/${seq}`;
    }

    // Check unique
    const existing = await prisma.application.findUnique({
      where: { matriculationNumber: matNo },
    });
    if (existing && existing.id !== id) {
      throw new AppError(`Matriculation Number ${matNo} is already assigned to another student.`, 400);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const res = await tx.application.update({
        where: { id },
        data: {
          matriculationNumber: matNo,
          isEnrolled: true,
          enrolledAt: new Date(),
          matriculationFeePaid: true,
          status: ApplicationStatus.APPROVED,
        },
        include: {
          course: true,
          applicant: true,
          academicYear: true,
        },
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: id,
          fromStatus: app.status,
          toStatus: app.status,
          changedByUserId: staffUserId,
          changeReason: `Official Matriculation Number assigned: ${matNo}. Student clearance and enrollment confirmed.`,
        },
      });

      await tx.notification.create({
        data: {
          userId: app.applicantId,
          title: 'Official Matriculation Number Issued!',
          message: `Congratulations! Your matriculation has been certified. Your official KICTAMC Matriculation Number is: ${matNo}. You can view and print your Student ID Clearance Card from your portal.`,
          type: 'SUCCESS',
        },
      });

      await tx.auditLog.create({
        data: {
          userId: staffUserId,
          action: 'ISSUE_MATRICULATION_NUMBER',
          resource: 'Application',
          resourceId: id,
          details: {
            applicationReference: app.applicationReference,
            matriculationNumber: matNo,
            courseName: app.course.name,
          },
        },
      });

      return res;
    });

    return updated;
  }
}

export const applicationsService = new ApplicationsService();
