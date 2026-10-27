import { Router } from 'express';
import { academicController } from './academic.controller';
import { requireAuth } from '../../middleware/auth';
import { requireCapability } from '../../middleware/capabilities';
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

// Staff Protected Management Routes — capability-based guards

// Faculties (Admin-level write; ADMISSIONS_OFFICER cannot add faculties)
router.post(
  '/faculties',
  requireAuth,
  requireCapability('academic-years:manage'),
  validateRequest(createFacultySchema),
  academicController.createFaculty
);
router.patch(
  '/faculties/:id',
  requireAuth,
  requireCapability('academic-years:manage'),
  validateRequest(updateFacultySchema),
  academicController.updateFaculty
);
router.delete(
  '/faculties/:id',
  requireAuth,
  requireCapability('academic-years:manage'),
  academicController.deleteFaculty
);

router.post(
  '/academic-years',
  requireAuth,
  requireCapability('academic-years:manage'),
  validateRequest(createAcademicYearSchema),
  academicController.createAcademicYear
);
router.patch(
  '/academic-years/:id',
  requireAuth,
  requireCapability('academic-years:manage'),
  validateRequest(updateAcademicYearSchema),
  academicController.updateAcademicYear
);

router.post(
  '/intakes',
  requireAuth,
  requireCapability('academic-years:manage'),
  validateRequest(createIntakeSchema),
  academicController.createIntake
);
router.patch(
  '/intakes/:id',
  requireAuth,
  requireCapability('academic-years:manage'),
  validateRequest(updateIntakeSchema),
  academicController.updateIntake
);

router.post(
  '/departments',
  requireAuth,
  requireCapability('academics:write'),
  validateRequest(createDepartmentSchema),
  academicController.createDepartment
);
router.patch(
  '/departments/:id',
  requireAuth,
  requireCapability('academics:write'),
  validateRequest(updateDepartmentSchema),
  academicController.updateDepartment
);
router.delete(
  '/departments/:id',
  requireAuth,
  requireCapability('academics:write'),
  academicController.deleteDepartment
);

router.post(
  '/courses',
  requireAuth,
  requireCapability('academics:write'),
  validateRequest(createCourseSchema),
  academicController.createCourse
);
router.patch(
  '/courses/:id',
  requireAuth,
  requireCapability('academics:write'),
  validateRequest(updateCourseSchema),
  academicController.updateCourse
);
router.delete(
  '/courses/:id',
  requireAuth,
  requireCapability('academics:write'),
  academicController.deleteCourse
);

router.post(
  '/courses/:id/requirements',
  requireAuth,
  requireCapability('academics:write'),
  validateRequest(addCourseDocumentReqSchema),
  academicController.addDocumentRequirement
);
router.delete(
  '/courses/:id/requirements/:reqId',
  requireAuth,
  requireCapability('academics:write'),
  academicController.deleteDocumentRequirement
);

export const academicRoutes = router;
