import { Request, Response, NextFunction } from 'express';
import { academicService } from './academic.service';
import { sendSuccess, sendCreated } from '../../utils/response';
import { QualificationLevel } from '@prisma/client';

export class AcademicController {
  // ==========================================
  // FACULTIES
  // ==========================================

  async getFaculties(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, status, sortBy, sortOrder, page, limit, paginated } = req.query;
      const result = await academicService.listFaculties({
        search: search as string,
        status: status as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      if (page || limit || paginated === 'true') {
        return sendSuccess(res, result, 'Faculties retrieved successfully.');
      }
      return sendSuccess(res, result.faculties, 'Faculties retrieved successfully.');
    } catch (error) {
      next(error);
    }
  }

  async getFacultyById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const faculty = await academicService.getFacultyById(id);
      return sendSuccess(res, faculty, 'Faculty details retrieved.');
    } catch (error) {
      next(error);
    }
  }

  async createFaculty(req: Request, res: Response, next: NextFunction) {
    try {
      const staffUserId = req.user?.id;
      const faculty = await academicService.createFaculty(req.body, staffUserId);
      return sendCreated(res, faculty, 'Faculty created successfully.');
    } catch (error) {
      next(error);
    }
  }

  async updateFaculty(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const staffUserId = req.user?.id;
      const faculty = await academicService.updateFaculty(id, req.body, staffUserId);
      return sendSuccess(res, faculty, 'Faculty updated successfully.');
    } catch (error) {
      next(error);
    }
  }

  async deleteFaculty(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const staffUserId = req.user?.id;
      const result = await academicService.deleteFaculty(id, staffUserId);
      return sendSuccess(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // COURSES
  // ==========================================

  async getCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        qualificationLevel,
        facultyId,
        departmentId,
        academicYearId,
        isActive,
        search,
        sortBy,
        sortOrder,
        page,
        limit,
      } = req.query;

      const result = await academicService.listCourses({
        qualificationLevel: qualificationLevel as QualificationLevel,
        facultyId: facultyId as string,
        departmentId: departmentId as string,
        academicYearId: academicYearId as string,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        search: search as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      if (page || limit || req.query.paginated === 'true') {
        return sendSuccess(res, result, 'Courses retrieved successfully.');
      }
      return sendSuccess(res, result.courses, 'Courses retrieved successfully.');
    } catch (error) {
      next(error);
    }
  }

  async getCourseById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const course = await academicService.getCourseById(id);
      return sendSuccess(res, course, 'Course details retrieved.');
    } catch (error) {
      next(error);
    }
  }

  async createCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const staffUserId = req.user?.id;
      const course = await academicService.createCourse(req.body, staffUserId);
      return sendCreated(res, course, 'Course created successfully.');
    } catch (error) {
      next(error);
    }
  }

  async updateCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const staffUserId = req.user?.id;
      const course = await academicService.updateCourse(id, req.body, staffUserId);
      return sendSuccess(res, course, 'Course updated successfully.');
    } catch (error) {
      next(error);
    }
  }

  async deleteCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const staffUserId = req.user?.id;
      const result = await academicService.deleteCourse(id, staffUserId);
      return sendSuccess(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  async addDocumentRequirement(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const reqDoc = await academicService.addCourseDocumentRequirement(id, req.body);
      return sendCreated(res, reqDoc, 'Course document requirement added.');
    } catch (error) {
      next(error);
    }
  }

  async deleteDocumentRequirement(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const reqId = String(req.params.reqId);
      const result = await academicService.deleteCourseDocumentRequirement(id, reqId);
      return sendSuccess(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // DEPARTMENTS
  // ==========================================

  async getDepartments(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, facultyId, status, sortBy, sortOrder, activeOnly } = req.query;

      // Backward compatible mode if no pagination/filter parameters
      if (!page && !limit && !search && !status && !sortBy) {
        const isOnlyActive = activeOnly === 'true';
        const departments = await academicService.listDepartments(isOnlyActive, facultyId as string);
        return sendSuccess(res, departments, 'Departments retrieved.');
      }

      const result = await academicService.listDepartmentsPaginated({
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        search: search as string,
        facultyId: facultyId as string,
        status: status as 'ACTIVE' | 'INACTIVE' | 'ALL',
        sortBy: sortBy as string,
        sortOrder: (sortOrder as 'asc' | 'desc') || 'asc',
      });

      return sendSuccess(res, result, 'Departments retrieved successfully.');
    } catch (error) {
      next(error);
    }
  }

  async getDepartmentById(req: Request, res: Response, next: NextFunction) {
    try {
      const department = await academicService.getDepartmentById(req.params.id);
      return sendSuccess(res, department, 'Department details retrieved.');
    } catch (error) {
      next(error);
    }
  }

  async createDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const department = await academicService.createDepartment(req.body, (req as any).user?.id);
      return sendCreated(res, department, 'Department created successfully.');
    } catch (error) {
      next(error);
    }
  }

  async updateDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const department = await academicService.updateDepartment(
        req.params.id,
        req.body,
        (req as any).user?.id
      );
      return sendSuccess(res, department, 'Department updated successfully.');
    } catch (error) {
      next(error);
    }
  }

  async deleteDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await academicService.deleteDepartment(req.params.id, (req as any).user?.id);
      return sendSuccess(res, result, 'Department deleted successfully.');
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // ACADEMIC YEARS & INTAKES
  // ==========================================

  async getAcademicYears(req: Request, res: Response, next: NextFunction) {
    try {
      const activeOnly = req.query.activeOnly === 'true';
      const years = await academicService.listAcademicYears(activeOnly);
      return sendSuccess(res, years, 'Academic years retrieved.');
    } catch (error) {
      next(error);
    }
  }

  async createAcademicYear(req: Request, res: Response, next: NextFunction) {
    try {
      const year = await academicService.createAcademicYear(req.body);
      return sendCreated(res, year, 'Academic year created successfully.');
    } catch (error) {
      next(error);
    }
  }

  async updateAcademicYear(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const year = await academicService.updateAcademicYear(id, req.body);
      return sendSuccess(res, year, 'Academic year updated successfully.');
    } catch (error) {
      next(error);
    }
  }

  async getIntakes(req: Request, res: Response, next: NextFunction) {
    try {
      const academicYearId = req.query.academicYearId as string;
      const activeOnly = req.query.activeOnly === 'true';
      const intakes = await academicService.listIntakes(academicYearId, activeOnly);
      return sendSuccess(res, intakes, 'Intakes retrieved.');
    } catch (error) {
      next(error);
    }
  }

  async createIntake(req: Request, res: Response, next: NextFunction) {
    try {
      const intake = await academicService.createIntake(req.body);
      return sendCreated(res, intake, 'Admission intake created successfully.');
    } catch (error) {
      next(error);
    }
  }

  async updateIntake(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const intake = await academicService.updateIntake(id, req.body);
      return sendSuccess(res, intake, 'Admission intake updated successfully.');
    } catch (error) {
      next(error);
    }
  }
}

export const academicController = new AcademicController();
