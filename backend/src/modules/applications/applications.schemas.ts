import { z } from 'zod';

export const createDraftApplicationSchema = z.object({
  body: z.object({
    academicYearId: z.string().uuid(),
    intakeId: z.string().uuid(),
    courseId: z.string().uuid(),
    studyMode: z.string().default('Full-Time'),
    preferredCampus: z.string().default('Kenema Main Campus'),
  }),
});

export const updateApplicationDraftSchema = z.object({
  body: z.object({
    currentStep: z.number().int().min(1).max(9).optional(),
    academicYearId: z.string().uuid().optional(),
    intakeId: z.string().uuid().optional(),
    courseId: z.string().uuid().optional(),
    studyMode: z.string().optional(),
    preferredCampus: z.string().optional(),

    // Step 1: Personal info (updates StudentProfile)
    personal: z
      .object({
        firstName: z.string().min(2).optional(),
        middleName: z.string().optional().nullable(),
        surname: z.string().min(2).optional(),
        dateOfBirth: z.string().datetime().optional().nullable(),
        gender: z.string().optional().nullable(),
        nationality: z.string().optional().nullable(),
        placeOfBirth: z.string().optional().nullable(),
        maritalStatus: z.string().optional().nullable(),
        passportPhotoUrl: z.string().optional().nullable(),
      })
      .optional(),

    // Step 2: Contact & Address
    contact: z
      .object({
        phone: z.string().optional(),
        residentialAddress: z.string().optional().nullable(),
        townCity: z.string().optional().nullable(),
        chiefdom: z.string().optional().nullable(),
        district: z.string().optional().nullable(),
        regionProvince: z.string().optional().nullable(),
        postalAddress: z.string().optional().nullable(),
      })
      .optional(),

    // Step 3: Parent / Guardian
    parent: z
      .object({
        parentFullName: z.string().optional().nullable(),
        parentRelationship: z.string().optional().nullable(),
        parentPhone: z.string().optional().nullable(),
        parentAltPhone: z.string().optional().nullable(),
        parentAddress: z.string().optional().nullable(),
        parentEmail: z.string().email().optional().nullable().or(z.literal('')),
        parentOccupation: z.string().optional().nullable(),
      })
      .optional(),

    // Step 4: Emergency Contact
    emergency: z
      .object({
        emergencyFullName: z.string().optional().nullable(),
        emergencyRelationship: z.string().optional().nullable(),
        emergencyPhone: z.string().optional().nullable(),
        emergencyAddress: z.string().optional().nullable(),
      })
      .optional(),
  }),
});

export const addEducationSchema = z.object({
  body: z.object({
    institutionName: z.string().min(2, 'Institution name is required'),
    institutionLocation: z.string().min(2, 'Location is required'),
    examinationType: z.string().min(2, 'Examination type is required (e.g. WASSCE, BECE)'),
    examinationYear: z.number().int().min(1970).max(new Date().getFullYear()),
    candidateNumber: z.string().optional().nullable(),
    qualificationObtained: z.string().min(2, 'Qualification obtained is required'),
    completionStatus: z.string().default('COMPLETED'),
    subjectsAndGrades: z
      .array(
        z.object({
          subject: z.string().min(1),
          grade: z.string().min(1),
        })
      )
      .optional(),
  }),
});
