import { z } from 'zod';

export const qualificationLevelEnum = z.enum(['LOWER_DIPLOMA', 'HIGHER_DIPLOMA', 'DEGREE']);

export const createAcademicYearSchema = z.object({
  body: z.object({
    name: z.string().min(4, 'Name is required (e.g. 2026/2027)'),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    isActive: z.boolean().optional().default(true),
  }),
});

export const updateAcademicYearSchema = z.object({
  body: z.object({
    name: z.string().min(4).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const createIntakeSchema = z.object({
  body: z.object({
    academicYearId: z.string().uuid(),
    name: z.string().min(3, 'Intake name is required'),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    applicationDeadline: z.string().datetime(),
    isActive: z.boolean().optional().default(true),
  }),
});

export const updateIntakeSchema = z.object({
  body: z.object({
    name: z.string().min(3).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    applicationDeadline: z.string().datetime().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const createFacultySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Faculty name must be at least 2 characters'),
    code: z.string().min(2, 'Faculty code must be at least 2 characters').max(15).toUpperCase(),
    description: z.string().optional().nullable(),
    deanName: z.string().optional().nullable(),
    email: z.string().email('Invalid email address').optional().nullable().or(z.literal('')),
    phone: z.string().optional().nullable(),
    officeLocation: z.string().optional().nullable(),
    isActive: z.boolean().optional().default(true),
  }),
});

export const updateFacultySchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    code: z.string().min(2).max(15).toUpperCase().optional(),
    description: z.string().optional().nullable(),
    deanName: z.string().optional().nullable(),
    email: z.string().email('Invalid email address').optional().nullable().or(z.literal('')),
    phone: z.string().optional().nullable(),
    officeLocation: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});

export const createDepartmentSchema = z.object({
  body: z.object({
    facultyId: z.string().uuid('Please select a valid parent faculty').optional().nullable(),
    name: z.string().min(3, 'Department name must be at least 3 characters'),
    code: z.string().min(2, 'Department code must be at least 2 characters').max(15).toUpperCase(),
    description: z.string().optional().nullable(),
    hodName: z.string().optional().nullable(),
    hodTitle: z.string().optional().nullable(),
    email: z.string().email('Invalid email address').optional().nullable().or(z.literal('')),
    phone: z.string().optional().nullable(),
    officeLocation: z.string().optional().nullable(),
    isActive: z.boolean().optional().default(true),
  }),
});

export const updateDepartmentSchema = z.object({
  body: z.object({
    facultyId: z.string().uuid().optional().nullable(),
    name: z.string().min(3).optional(),
    code: z.string().min(2).max(15).toUpperCase().optional(),
    description: z.string().optional().nullable(),
    hodName: z.string().optional().nullable(),
    hodTitle: z.string().optional().nullable(),
    email: z.string().email('Invalid email address').optional().nullable().or(z.literal('')),
    phone: z.string().optional().nullable(),
    officeLocation: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});

export const createCourseSchema = z.object({
  body: z.object({
    facultyId: z.string().uuid().optional().nullable(),
    departmentId: z.string().uuid().optional().nullable(),
    academicYearId: z.string().uuid().optional().nullable(),
    name: z.string().min(3, 'Course title is required'),
    code: z.string().min(2, 'Course code is required').toUpperCase(),
    qualificationLevel: qualificationLevelEnum,
    qualificationAward: z.string().optional().nullable(),
    duration: z.number().int().positive().optional().default(3),
    durationUnit: z.string().optional().default('Years'),
    description: z.string().optional().nullable(),
    detailedDescription: z.string().optional().nullable(),
    admissionRequirements: z.string().optional().nullable(),
    learningOutcomes: z.string().optional().nullable(),
    creditUnits: z.number().int().nonnegative().optional().default(120),
    intakeCapacity: z.number().int().positive().optional().default(50),
    applicationFeeMinor: z.number().int().nonnegative('Fee must be a positive integer in minor units'),
    tuitionFeeMinor: z.number().int().nonnegative().optional().default(450000),
    currency: z.string().default('SLE'),
    studyModes: z.string().default('Full-Time,Evening'),
    preferredCampuses: z.string().default('Kenema Main Campus'),
    openingDate: z.string().datetime().optional().nullable(),
    closingDate: z.string().datetime().optional().nullable(),
    isActive: z.boolean().optional().default(true),
    documentRequirements: z
      .array(
        z.object({
          documentType: z.enum([
            'EXAM_RESULT',
            'TESTIMONIAL',
            'BIRTH_CERTIFICATE',
            'ID_DOCUMENT',
            'PASSPORT_PHOTO',
            'OTHER',
          ]),
          name: z.string().min(2),
          description: z.string().optional(),
          isMandatory: z.boolean().default(true),
        })
      )
      .optional(),
  }),
});

export const updateCourseSchema = z.object({
  body: z.object({
    facultyId: z.string().uuid().optional().nullable(),
    departmentId: z.string().uuid().optional().nullable(),
    academicYearId: z.string().uuid().optional().nullable(),
    name: z.string().min(3).optional(),
    code: z.string().min(2).toUpperCase().optional(),
    qualificationLevel: qualificationLevelEnum.optional(),
    qualificationAward: z.string().optional().nullable(),
    duration: z.number().int().positive().optional(),
    durationUnit: z.string().optional(),
    description: z.string().optional().nullable(),
    detailedDescription: z.string().optional().nullable(),
    admissionRequirements: z.string().optional().nullable(),
    learningOutcomes: z.string().optional().nullable(),
    creditUnits: z.number().int().nonnegative().optional(),
    intakeCapacity: z.number().int().positive().optional(),
    applicationFeeMinor: z.number().int().nonnegative().optional(),
    tuitionFeeMinor: z.number().int().nonnegative().optional(),
    currency: z.string().optional(),
    studyModes: z.string().optional(),
    preferredCampuses: z.string().optional(),
    openingDate: z.string().datetime().optional().nullable(),
    closingDate: z.string().datetime().optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});

export const addCourseDocumentReqSchema = z.object({
  body: z.object({
    documentType: z.enum([
      'EXAM_RESULT',
      'TESTIMONIAL',
      'BIRTH_CERTIFICATE',
      'ID_DOCUMENT',
      'PASSPORT_PHOTO',
      'OTHER',
    ]),
    name: z.string().min(2),
    description: z.string().optional(),
    isMandatory: z.boolean().default(true),
  }),
});
