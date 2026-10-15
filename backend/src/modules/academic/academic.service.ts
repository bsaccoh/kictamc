import { prisma } from '../../utils/prisma';
import { QualificationLevel, DocumentType } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler';

export class AcademicService {
  // ==========================================
  // FACULTIES
  // ==========================================

  async listFaculties(params: {
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const { search, status, sortBy = 'name', sortOrder = 'asc', page, limit } = params;

    const where: any = {};

    if (status === 'ACTIVE') {
      where.isActive = true;
    } else if (status === 'INACTIVE') {
      where.isActive = false;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { code: { contains: q, mode: 'insensitive' } },
        { deanName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Determine orderBy
    let orderBy: any = { [sortBy]: sortOrder };
    if (sortBy === 'coursesCount') {
      orderBy = { courses: { _count: sortOrder } };
    } else if (sortBy === 'departmentsCount') {
      orderBy = { departments: { _count: sortOrder } };
    }

    // Pagination
    const take = limit && limit > 0 ? Number(limit) : undefined;
    const skip = page && page > 0 && take ? (Number(page) - 1) * take : undefined;

    const [totalCount, faculties, totalAll, activeCount, inactiveCount, allCoursesCount] =
      await Promise.all([
        prisma.faculty.count({ where }),
        prisma.faculty.findMany({
          where,
          include: {
            departments: {
              select: { id: true, name: true, code: true, isActive: true },
            },
            courses: {
              select: { id: true, name: true, code: true, qualificationLevel: true, isActive: true },
            },
            _count: {
              select: { departments: true, courses: true },
            },
          },
          orderBy,
          skip,
          take,
        }),
        prisma.faculty.count(),
        prisma.faculty.count({ where: { isActive: true } }),
        prisma.faculty.count({ where: { isActive: false } }),
        prisma.course.count(),
      ]);

    return {
      faculties,
      pagination: {
        total: totalCount,
        page: page ? Number(page) : 1,
        limit: take || totalCount,
        totalPages: take ? Math.ceil(totalCount / take) : 1,
      },
      metrics: {
        totalFaculties: totalAll,
        activeFaculties: activeCount,
        inactiveFaculties: inactiveCount,
        totalCourses: allCoursesCount,
      },
    };
  }

  async getFacultyById(id: string) {
    const faculty = await prisma.faculty.findUnique({
      where: { id },
      include: {
        departments: {
          include: {
            _count: { select: { courses: true } },
          },
        },
        courses: {
          include: {
            department: { select: { id: true, name: true, code: true } },
            academicYear: { select: { id: true, name: true } },
            _count: { select: { applications: true } },
          },
          orderBy: [{ qualificationLevel: 'asc' }, { name: 'asc' }],
        },
        _count: {
          select: { departments: true, courses: true },
        },
      },
    });

    if (!faculty) throw new AppError('Faculty not found', 404);
    return faculty;
  }

  async createFaculty(
    data: {
      name: string;
      code: string;
      description?: string | null;
      deanName?: string | null;
      email?: string | null;
      phone?: string | null;
      officeLocation?: string | null;
      isActive?: boolean;
    },
    staffUserId?: string
  ) {
    const trimmedCode = data.code.trim().toUpperCase();
    const trimmedName = data.name.trim();

    const existingCode = await prisma.faculty.findUnique({
      where: { code: trimmedCode },
    });
    if (existingCode) {
      throw new AppError(`A faculty with code "${trimmedCode}" already exists`, 409);
    }

    const existingName = await prisma.faculty.findUnique({
      where: { name: trimmedName },
    });
    if (existingName) {
      throw new AppError(`A faculty named "${trimmedName}" already exists`, 409);
    }

    const faculty = await prisma.faculty.create({
      data: {
        name: trimmedName,
        code: trimmedCode,
        description: data.description?.trim() || null,
        deanName: data.deanName?.trim() || null,
        email: data.email?.trim() || null,
        phone: data.phone?.trim() || null,
        officeLocation: data.officeLocation?.trim() || null,
        isActive: data.isActive ?? true,
      },
    });

    if (staffUserId) {
      await prisma.auditLog.create({
        data: {
          userId: staffUserId,
          action: 'FACULTY_CREATE',
          resource: 'Faculty',
          resourceId: faculty.id,
          details: { name: faculty.name, code: faculty.code, isActive: faculty.isActive },
        },
      });
    }

    return faculty;
  }

  async updateFaculty(
    id: string,
    data: {
      name?: string;
      code?: string;
      description?: string | null;
      deanName?: string | null;
      email?: string | null;
      phone?: string | null;
      officeLocation?: string | null;
      isActive?: boolean;
    },
    staffUserId?: string
  ) {
    const existing = await prisma.faculty.findUnique({ where: { id } });
    if (!existing) throw new AppError('Faculty not found', 404);

    if (data.code && data.code.trim().toUpperCase() !== existing.code) {
      const trimmedCode = data.code.trim().toUpperCase();
      const codeConflict = await prisma.faculty.findUnique({ where: { code: trimmedCode } });
      if (codeConflict) {
        throw new AppError(`A faculty with code "${trimmedCode}" already exists`, 409);
      }
    }

    if (data.name && data.name.trim() !== existing.name) {
      const trimmedName = data.name.trim();
      const nameConflict = await prisma.faculty.findUnique({ where: { name: trimmedName } });
      if (nameConflict) {
        throw new AppError(`A faculty with name "${trimmedName}" already exists`, 409);
      }
    }

    const updated = await prisma.faculty.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.code && { code: data.code.trim().toUpperCase() }),
        ...(data.description !== undefined && { description: data.description?.trim() || null }),
        ...(data.deanName !== undefined && { deanName: data.deanName?.trim() || null }),
        ...(data.email !== undefined && { email: data.email?.trim() || null }),
        ...(data.phone !== undefined && { phone: data.phone?.trim() || null }),
        ...(data.officeLocation !== undefined && {
          officeLocation: data.officeLocation?.trim() || null,
        }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    if (staffUserId) {
      await prisma.auditLog.create({
        data: {
          userId: staffUserId,
          action: 'FACULTY_UPDATE',
          resource: 'Faculty',
          resourceId: updated.id,
          details: { changes: data },
        },
      });
    }

    return updated;
  }

  async deleteFaculty(id: string, staffUserId?: string) {
    const faculty = await prisma.faculty.findUnique({
      where: { id },
      include: {
        _count: { select: { courses: true, departments: true } },
        courses: { select: { id: true } },
      },
    });

    if (!faculty) throw new AppError('Faculty not found', 404);

    // Check if courses are attached
    if (faculty._count.courses > 0) {
      throw new AppError(
        `Cannot delete faculty "${faculty.name}": It has ${faculty._count.courses} associated course(s). To preserve curriculum and historical records, please deactivate or reassign courses before attempting deletion.`,
        400
      );
    }

    // Check if departments are attached
    if (faculty._count.departments > 0) {
      throw new AppError(
        `Cannot delete faculty "${faculty.name}": It has ${faculty._count.departments} associated department(s). Please reassign or remove departments first, or deactivate the faculty.`,
        400
      );
    }

    await prisma.faculty.delete({ where: { id } });

    if (staffUserId) {
      await prisma.auditLog.create({
        data: {
          userId: staffUserId,
          action: 'FACULTY_DELETE',
          resource: 'Faculty',
          resourceId: id,
          details: { name: faculty.name, code: faculty.code },
        },
      });
    }

    return { message: `Faculty "${faculty.name}" deleted successfully` };
  }

  // ==========================================
  // COURSES
  // ==========================================

  async listCourses(params: {
    qualificationLevel?: QualificationLevel;
    facultyId?: string;
    departmentId?: string;
    academicYearId?: string;
    isActive?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const {
      qualificationLevel,
      facultyId,
      departmentId,
      academicYearId,
      isActive,
      search,
      sortBy = 'name',
      sortOrder = 'asc',
      page,
      limit,
    } = params;

    const where: any = {};

    if (qualificationLevel) where.qualificationLevel = qualificationLevel;
    if (facultyId && facultyId !== 'ALL') where.facultyId = facultyId;
    if (departmentId && departmentId !== 'ALL') where.departmentId = departmentId;
    if (academicYearId && academicYearId !== 'ALL') where.academicYearId = academicYearId;
    if (isActive !== undefined) where.isActive = isActive;

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { code: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { qualificationAward: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Pagination
    const take = limit && limit > 0 ? Number(limit) : undefined;
    const skip = page && page > 0 && take ? (Number(page) - 1) * take : undefined;

    let orderBy: any = [{ [sortBy]: sortOrder }];
    if (sortBy === 'qualificationLevel') {
      orderBy = [{ qualificationLevel: sortOrder }, { name: 'asc' }];
    }

    const [totalCount, courses, totalAll, activeCount, inactiveCount, facultiesList] =
      await Promise.all([
        prisma.course.count({ where }),
        prisma.course.findMany({
          where,
          include: {
            faculty: { select: { id: true, name: true, code: true, isActive: true } },
            department: { select: { id: true, name: true, code: true, isActive: true } },
            academicYear: { select: { id: true, name: true, isActive: true } },
            documentRequirements: true,
            _count: {
              select: { applications: true },
            },
          },
          orderBy,
          skip,
          take,
        }),
        prisma.course.count(),
        prisma.course.count({ where: { isActive: true } }),
        prisma.course.count({ where: { isActive: false } }),
        prisma.faculty.findMany({
          where: { courses: { some: {} } },
          select: { id: true },
        }),
      ]);

    return {
      courses,
      pagination: {
        total: totalCount,
        page: page ? Number(page) : 1,
        limit: take || totalCount,
        totalPages: take ? Math.ceil(totalCount / take) : 1,
      },
      metrics: {
        totalCourses: totalAll,
        activeCourses: activeCount,
        inactiveCourses: inactiveCount,
        facultiesOfferingCourses: facultiesList.length,
      },
    };
  }

  async getCourseById(id: string) {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        faculty: true,
        department: true,
        academicYear: {
          include: {
            intakes: {
              orderBy: { startDate: 'asc' },
            },
          },
        },
        documentRequirements: true,
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!course) throw new AppError('Course not found', 404);
    return course;
  }

  async createCourse(data: any, staffUserId?: string) {
    const trimmedCode = data.code.trim().toUpperCase();
    const existing = await prisma.course.findUnique({
      where: { code: trimmedCode },
    });
    if (existing) {
      throw new AppError(`A course with code ${trimmedCode} already exists`, 409);
    }

    // If facultyId is provided, verify it exists and is active
    if (data.facultyId) {
      const faculty = await prisma.faculty.findUnique({ where: { id: data.facultyId } });
      if (!faculty) throw new AppError('Specified faculty not found', 404);
      if (!faculty.isActive) {
        throw new AppError('Cannot assign course to an inactive faculty', 400);
      }
    }

    const { documentRequirements, ...courseData } = data;

    const course = await prisma.course.create({
      data: {
        ...courseData,
        code: trimmedCode,
        name: courseData.name.trim(),
        duration: courseData.duration ? Number(courseData.duration) : 3,
        durationUnit: courseData.durationUnit || 'Years',
        openingDate: courseData.openingDate ? new Date(courseData.openingDate) : null,
        closingDate: courseData.closingDate ? new Date(courseData.closingDate) : null,
        documentRequirements: {
          create: (documentRequirements || []).map((req: any) => ({
            documentType: req.documentType as DocumentType,
            name: req.name.trim(),
            description: req.description?.trim() || null,
            isMandatory: req.isMandatory ?? true,
          })),
        },
      },
      include: {
        faculty: true,
        department: true,
        documentRequirements: true,
      },
    });

    if (staffUserId) {
      await prisma.auditLog.create({
        data: {
          userId: staffUserId,
          action: 'COURSE_CREATE',
          resource: 'Course',
          resourceId: course.id,
          details: { name: course.name, code: course.code, level: course.qualificationLevel },
        },
      });
    }

    return course;
  }

  async updateCourse(id: string, data: any, staffUserId?: string) {
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) throw new AppError('Course not found', 404);

    if (data.code && data.code.trim().toUpperCase() !== course.code) {
      const trimmedCode = data.code.trim().toUpperCase();
      const existing = await prisma.course.findUnique({ where: { code: trimmedCode } });
      if (existing) {
        throw new AppError(`A course with code ${trimmedCode} already exists`, 409);
      }
    }

    if (data.facultyId) {
      const faculty = await prisma.faculty.findUnique({ where: { id: data.facultyId } });
      if (!faculty) throw new AppError('Specified faculty not found', 404);
    }

    const updated = await prisma.course.update({
      where: { id },
      data: {
        ...data,
        ...(data.code && { code: data.code.trim().toUpperCase() }),
        ...(data.name && { name: data.name.trim() }),
        ...(data.duration !== undefined && { duration: Number(data.duration) }),
        openingDate: data.openingDate ? new Date(data.openingDate) : undefined,
        closingDate: data.closingDate ? new Date(data.closingDate) : undefined,
      },
      include: {
        faculty: true,
        department: true,
        documentRequirements: true,
      },
    });

    if (staffUserId) {
      await prisma.auditLog.create({
        data: {
          userId: staffUserId,
          action: 'COURSE_UPDATE',
          resource: 'Course',
          resourceId: updated.id,
          details: { changes: data },
        },
      });
    }

    return updated;
  }

  async deleteCourse(id: string, staffUserId?: string) {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        _count: { select: { applications: true } },
      },
    });

    if (!course) throw new AppError('Course not found', 404);

    if (course._count.applications > 0) {
      throw new AppError(
        `Cannot permanently delete course "${course.name}" (${course.code}): It is referenced by ${course._count.applications} student application(s). Deleting it would compromise historical records and payment logs. Please deactivate the course instead to close admissions.`,
        400
      );
    }

    // Clean up document requirements first
    await prisma.courseDocumentRequirement.deleteMany({ where: { courseId: id } });
    await prisma.course.delete({ where: { id } });

    if (staffUserId) {
      await prisma.auditLog.create({
        data: {
          userId: staffUserId,
          action: 'COURSE_DELETE',
          resource: 'Course',
          resourceId: id,
          details: { name: course.name, code: course.code },
        },
      });
    }

    return { message: `Course "${course.name}" removed successfully` };
  }

  // ==========================================
  // DEPARTMENTS
  // ==========================================

  async listDepartments(activeOnly = false, facultyId?: string) {
    return prisma.department.findMany({
      where: {
        ...(activeOnly && { isActive: true }),
        ...(facultyId && { facultyId }),
      },
      include: {
        faculty: { select: { id: true, name: true, code: true } },
        _count: {
          select: { courses: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async listDepartmentsPaginated(query: {
    page?: number;
    limit?: number;
    search?: string;
    facultyId?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'ALL';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      page = 1,
      limit = 10,
      search,
      facultyId,
      status = 'ALL',
      sortBy = 'name',
      sortOrder = 'asc',
    } = query;

    const where: Prisma.DepartmentWhereInput = {};

    if (status === 'ACTIVE') {
      where.isActive = true;
    } else if (status === 'INACTIVE') {
      where.isActive = false;
    }

    if (facultyId && facultyId !== 'ALL') {
      where.facultyId = facultyId;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { code: { contains: q, mode: 'insensitive' } },
        { hodName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }

    let orderBy: any = { [sortBy]: sortOrder };
    if (sortBy === 'coursesCount') {
      orderBy = { courses: { _count: sortOrder } };
    }

    const take = limit > 0 ? Number(limit) : undefined;
    const skip = page > 0 && take ? (Number(page) - 1) * take : undefined;

    const [totalCount, departments, totalAll, activeCount, inactiveCount, allCoursesCount, facultiesCount] =
      await Promise.all([
        prisma.department.count({ where }),
        prisma.department.findMany({
          where,
          include: {
            faculty: {
              select: { id: true, name: true, code: true, isActive: true },
            },
            courses: {
              select: { id: true, name: true, code: true, qualificationLevel: true, isActive: true },
            },
            _count: {
              select: { courses: true },
            },
          },
          orderBy,
          skip,
          take,
        }),
        prisma.department.count(),
        prisma.department.count({ where: { isActive: true } }),
        prisma.department.count({ where: { isActive: false } }),
        prisma.course.count(),
        prisma.faculty.count({ where: { isActive: true } }),
      ]);

    return {
      departments,
      pagination: {
        total: totalCount,
        page: Number(page),
        limit: take || totalCount,
        totalPages: take ? Math.ceil(totalCount / take) : 1,
      },
      metrics: {
        totalDepartments: totalAll,
        activeDepartments: activeCount,
        inactiveDepartments: inactiveCount,
        totalCourses: allCoursesCount,
        facultiesRepresented: facultiesCount,
      },
    };
  }

  async getDepartmentById(id: string) {
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
            code: true,
            deanName: true,
            email: true,
            phone: true,
            officeLocation: true,
            isActive: true,
          },
        },
        courses: {
          include: {
            academicYear: { select: { id: true, name: true } },
            _count: { select: { applications: true } },
          },
          orderBy: [{ qualificationLevel: 'asc' }, { name: 'asc' }],
        },
        _count: {
          select: { courses: true },
        },
      },
    });

    if (!department) throw new AppError('Department not found', 404);
    return department;
  }

  async createDepartment(
    data: {
      facultyId?: string | null;
      name: string;
      code: string;
      description?: string | null;
      hodName?: string | null;
      hodTitle?: string | null;
      email?: string | null;
      phone?: string | null;
      officeLocation?: string | null;
      isActive?: boolean;
    },
    actorId?: string
  ) {
    const existing = await prisma.department.findFirst({
      where: { OR: [{ name: data.name.trim() }, { code: data.code.trim().toUpperCase() }] },
    });
    if (existing) {
      throw new AppError('A department with this name or code already exists', 409);
    }

    const dept = await prisma.department.create({
      data: {
        facultyId: data.facultyId || null,
        name: data.name.trim(),
        code: data.code.trim().toUpperCase(),
        description: data.description?.trim() || null,
        hodName: data.hodName?.trim() || null,
        hodTitle: data.hodTitle?.trim() || null,
        email: data.email?.trim() || null,
        phone: data.phone?.trim() || null,
        officeLocation: data.officeLocation?.trim() || null,
        isActive: data.isActive ?? true,
      },
      include: {
        faculty: true,
      },
    });

    await createAuditLog({
      userId: actorId,
      action: 'CREATE_DEPARTMENT',
      entity: 'Department',
      entityId: dept.id,
      details: { name: dept.name, code: dept.code, facultyId: dept.facultyId },
    });

    return dept;
  }

  async updateDepartment(
    id: string,
    data: {
      facultyId?: string | null;
      name?: string;
      code?: string;
      description?: string | null;
      hodName?: string | null;
      hodTitle?: string | null;
      email?: string | null;
      phone?: string | null;
      officeLocation?: string | null;
      isActive?: boolean;
    },
    actorId?: string
  ) {
    const existing = await prisma.department.findUnique({ where: { id } });
    if (!existing) throw new AppError('Department not found', 404);

    if (data.name || data.code) {
      const conflict = await prisma.department.findFirst({
        where: {
          id: { not: id },
          OR: [
            ...(data.name ? [{ name: data.name.trim() }] : []),
            ...(data.code ? [{ code: data.code.trim().toUpperCase() }] : []),
          ],
        },
      });
      if (conflict) {
        throw new AppError('A department with this name or code already exists', 409);
      }
    }

    const updated = await prisma.department.update({
      where: { id },
      data: {
        ...(data.facultyId !== undefined && { facultyId: data.facultyId || null }),
        ...(data.name && { name: data.name.trim() }),
        ...(data.code && { code: data.code.trim().toUpperCase() }),
        ...(data.description !== undefined && { description: data.description?.trim() || null }),
        ...(data.hodName !== undefined && { hodName: data.hodName?.trim() || null }),
        ...(data.hodTitle !== undefined && { hodTitle: data.hodTitle?.trim() || null }),
        ...(data.email !== undefined && { email: data.email?.trim() || null }),
        ...(data.phone !== undefined && { phone: data.phone?.trim() || null }),
        ...(data.officeLocation !== undefined && { officeLocation: data.officeLocation?.trim() || null }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      include: {
        faculty: true,
      },
    });

    await createAuditLog({
      userId: actorId,
      action: 'UPDATE_DEPARTMENT',
      entity: 'Department',
      entityId: updated.id,
      details: { updatedFields: Object.keys(data) },
    });

    return updated;
  }

  async deleteDepartment(id: string, actorId?: string) {
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        _count: { select: { courses: true } },
      },
    });

    if (!department) throw new AppError('Department not found', 404);

    if (department._count.courses > 0) {
      throw new AppError(
        `Cannot delete department "${department.name}": It has ${department._count.courses} associated course(s). Please reassign or remove courses first, or deactivate the department.`,
        400
      );
    }

    await prisma.department.delete({ where: { id } });

    await createAuditLog({
      userId: actorId,
      action: 'DELETE_DEPARTMENT',
      entity: 'Department',
      entityId: id,
      details: { name: department.name, code: department.code },
    });

    return { message: `Department "${department.name}" removed successfully.` };
  }

  // ==========================================
  // ACADEMIC YEARS & INTAKES
  // ==========================================

  async listAcademicYears(activeOnly = false) {
    return prisma.academicYear.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      include: {
        intakes: {
          orderBy: { startDate: 'asc' },
        },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async createAcademicYear(data: {
    name: string;
    startDate: string;
    endDate: string;
    isActive?: boolean;
  }) {
    const existing = await prisma.academicYear.findUnique({
      where: { name: data.name },
    });
    if (existing) {
      throw new AppError(`Academic year ${data.name} already exists`, 409);
    }

    return prisma.academicYear.create({
      data: {
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isActive: data.isActive ?? true,
      },
    });
  }

  async updateAcademicYear(
    id: string,
    data: { name?: string; startDate?: string; endDate?: string; isActive?: boolean }
  ) {
    const year = await prisma.academicYear.findUnique({ where: { id } });
    if (!year) throw new AppError('Academic year not found', 404);

    return prisma.academicYear.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  async listIntakes(academicYearId?: string, activeOnly = false) {
    return prisma.admissionIntake.findMany({
      where: {
        ...(academicYearId && { academicYearId }),
        ...(activeOnly && { isActive: true }),
      },
      include: {
        academicYear: true,
      },
      orderBy: { startDate: 'asc' },
    });
  }

  async createIntake(data: {
    academicYearId: string;
    name: string;
    startDate: string;
    endDate: string;
    applicationDeadline: string;
    isActive?: boolean;
  }) {
    const year = await prisma.academicYear.findUnique({
      where: { id: data.academicYearId },
    });
    if (!year) throw new AppError('Associated academic year not found', 404);

    return prisma.admissionIntake.create({
      data: {
        academicYearId: data.academicYearId,
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        applicationDeadline: new Date(data.applicationDeadline),
        isActive: data.isActive ?? true,
      },
    });
  }

  async updateIntake(
    id: string,
    data: {
      name?: string;
      startDate?: string;
      endDate?: string;
      applicationDeadline?: string;
      isActive?: boolean;
    }
  ) {
    const intake = await prisma.admissionIntake.findUnique({ where: { id } });
    if (!intake) throw new AppError('Admission intake not found', 404);

    return prisma.admissionIntake.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
        ...(data.applicationDeadline && {
          applicationDeadline: new Date(data.applicationDeadline),
        }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  async addCourseDocumentRequirement(
    courseId: string,
    data: {
      documentType: DocumentType;
      name: string;
      description?: string;
      isMandatory?: boolean;
    }
  ) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new AppError('Course not found', 404);

    return prisma.courseDocumentRequirement.create({
      data: {
        courseId,
        documentType: data.documentType,
        name: data.name,
        description: data.description,
        isMandatory: data.isMandatory ?? true,
      },
    });
  }

  async deleteCourseDocumentRequirement(courseId: string, requirementId: string) {
    const req = await prisma.courseDocumentRequirement.findFirst({
      where: { id: requirementId, courseId },
    });
    if (!req) throw new AppError('Requirement not found for this course', 404);

    await prisma.courseDocumentRequirement.delete({
      where: { id: requirementId },
    });

    return { message: 'Document requirement removed successfully' };
  }
}

export const academicService = new AcademicService();
