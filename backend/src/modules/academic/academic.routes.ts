import { Router } from 'express';
import { academicController } from './academic.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validator';
import {
  createAcademicYearSchema,
  updateAcademicYearSchema,
  createIntakeSchema,
  updateIntakeSchema,
  createFacultySchema,
  updateFacultySchema,
  createDepartmentSchema,
  updateDepartmentSchema,
  createCourseSchema,
  updateCourseSchema,
  addCourseDocumentReqSchema,
} from './academic.schemas';
import { Role } from '@prisma/client';

const router = Router();

// Public / Read routes
router.get('/faculties', academicController.getFaculties);
router.get('/faculties/:id', academicController.getFacultyById);
router.get('/academic-years', academicController.getAcademicYears);
router.get('/intakes', academicController.getIntakes);
router.get('/departments', academicController.getDepartments);
router.get('/departments/:id', academicController.getDepartmentById);
router.get('/courses', academicController.getCourses);
router.get('/courses/:id', academicController.getCourseById);

// Staff Protected Management Routes
const staffRoles = [Role.SYSTEM_ADMIN, Role.ADMISSIONS_OFFICER];

// Faculties (Admin Only)
router.post(
  '/faculties',
  requireAuth,
  requireRole([Role.SYSTEM_ADMIN]),
  validateRequest(createFacultySchema),
  academicController.createFaculty
);
router.patch(
  '/faculties/:id',
  requireAuth,
  requireRole([Role.SYSTEM_ADMIN]),
  validateRequest(updateFacultySchema),
  academicController.updateFaculty
);
router.delete(
  '/faculties/:id',
  requireAuth,
  requireRole([Role.SYSTEM_ADMIN]),
  academicController.deleteFaculty
);

router.post(
  '/academic-years',
  requireAuth,
  requireRole([Role.SYSTEM_ADMIN]),
  validateRequest(createAcademicYearSchema),
  academicController.createAcademicYear
);
router.patch(
  '/academic-years/:id',
  requireAuth,
  requireRole([Role.SYSTEM_ADMIN]),
  validateRequest(updateAcademicYearSchema),
  academicController.updateAcademicYear
);

router.post(
  '/intakes',
  requireAuth,
  requireRole([Role.SYSTEM_ADMIN]),
  validateRequest(createIntakeSchema),
  academicController.createIntake
);
router.patch(
  '/intakes/:id',
  requireAuth,
  requireRole([Role.SYSTEM_ADMIN]),
  validateRequest(updateIntakeSchema),
  academicController.updateIntake
);

router.post(
  '/departments',
  requireAuth,
  requireRole(staffRoles),
  validateRequest(createDepartmentSchema),
  academicController.createDepartment
);
router.patch(
  '/departments/:id',
  requireAuth,
  requireRole(staffRoles),
  validateRequest(updateDepartmentSchema),
  academicController.updateDepartment
);
router.delete(
  '/departments/:id',
  requireAuth,
  requireRole(staffRoles),
  academicController.deleteDepartment
);

router.post(
  '/courses',
  requireAuth,
  requireRole(staffRoles),
  validateRequest(createCourseSchema),
  academicController.createCourse
);
router.patch(
  '/courses/:id',
  requireAuth,
  requireRole(staffRoles),
  validateRequest(updateCourseSchema),
  academicController.updateCourse
);
router.delete(
  '/courses/:id',
  requireAuth,
  requireRole(staffRoles),
  academicController.deleteCourse
);

router.post(
  '/courses/:id/requirements',
  requireAuth,
  requireRole(staffRoles),
  validateRequest(addCourseDocumentReqSchema),
  academicController.addDocumentRequirement
);
router.delete(
  '/courses/:id/requirements/:reqId',
  requireAuth,
  requireRole(staffRoles),
  academicController.deleteDocumentRequirement
);

export const academicRoutes = router;
