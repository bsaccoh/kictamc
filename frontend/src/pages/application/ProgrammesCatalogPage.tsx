import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Filter,
  Clock,
  Award,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Building2,
  DollarSign,
  FileText
} from 'lucide-react';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';

export const ProgrammesCatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedAward, setSelectedAward] = useState('ALL');

  // Fetch courses
  const { data: rawCourses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['courses-student-catalog'],
    queryFn: () => api.get<any>('/courses?isActive=true'),
  });
  const courses: any[] = Array.isArray(rawCourses) ? rawCourses : rawCourses?.courses || [];

  // Fetch faculties
  const { data: rawFaculties = [] } = useQuery({
    queryKey: ['faculties-student-catalog'],
    queryFn: () => api.get<any>('/faculties?status=ACTIVE'),
  });
  const faculties: any[] = Array.isArray(rawFaculties) ? rawFaculties : rawFaculties?.faculties || [];

  // Fetch departments
  const { data: departments = [], isLoading: deptsLoading } = useQuery({
    queryKey: ['departments-student-catalog'],
    queryFn: () => api.get<any[]>('/departments'),
  });

  const filteredCourses = courses.filter((c) => {
    if (c.isActive === false) return false;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFaculty = selectedFaculty === 'ALL' || c.facultyId === selectedFaculty;
    const matchesDept = selectedDept === 'ALL' || c.departmentId === selectedDept;
    const matchesAward = selectedAward === 'ALL' || c.qualificationLevel === selectedAward;

    return matchesSearch && matchesFaculty && matchesDept && matchesAward;
  });

  const awardLevels = Array.from(new Set(courses.map((c) => c.qualificationLevel).filter(Boolean)));

  const formatLevel = (lvl: string) => {
    switch (lvl) {
      case 'DEGREE':
        return 'Degree Programme';
      case 'HIGHER_DIPLOMA':
        return 'Higher Diploma';
      case 'LOWER_DIPLOMA':
        return 'Lower Diploma';
      default:
        return lvl.replace(/_/g, ' ');
    }
  };

  const getDuration = (lvl: string) => {
    switch (lvl) {
      case 'DEGREE':
        return '3 - 4 Years';
      case 'HIGHER_DIPLOMA':
        return '2 Years';
      case 'LOWER_DIPLOMA':
        return '1 - 2 Years';
      default:
        return '2 Years';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Institutional Banner */}
      <div className="bg-navy-900 border border-navy-800 rounded-xl p-6 sm:p-8 text-white relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gold-500/20 text-gold-400 border border-gold-500/30">
              Academic Year 2026/2027 Admissions
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-serif">
            Academic Programmes & Course Catalog
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            Explore accredited degree and diploma programmes offered by Kenema ICT &
            Management College. Review entry prerequisites and select your intended qualification.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by programme title, code, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-navy-600 focus:border-navy-600"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          <select
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-navy-600 focus:border-navy-600"
          >
            <option value="ALL">All Faculties</option>
            {faculties.map((fac: any) => (
              <option key={fac.id} value={fac.id}>
                {fac.name} ({fac.code})
              </option>
            ))}
          </select>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-navy-600 focus:border-navy-600"
          >
            <option value="ALL">All Departments</option>
            {departments.map((dept: any) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>

          <select
            value={selectedAward}
            onChange={(e) => setSelectedAward(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-navy-600 focus:border-navy-600"
          >
            <option value="ALL">All Qualifications</option>
            {awardLevels.map((lvl: string) => (
              <option key={lvl} value={lvl}>
                {formatLevel(lvl)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Courses List Grid */}
      {coursesLoading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-navy-700 border-t-gold-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-500">Loading academic catalog...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Programmes Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Try adjusting your search criteria or resetting filters to view all available courses.
          </p>
          <Button
            variant="secondary"
            className="mt-4 text-xs"
            onClick={() => {
              setSearchQuery('');
              setSelectedFaculty('ALL');
              setSelectedDept('ALL');
              setSelectedAward('ALL');
            }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course: any) => {
            const feeInSLE = (course.applicationFeeMinor / 100).toLocaleString('en-US', {
              minimumFractionDigits: 2,
            });
            const tuitionSLE = ((course.tuitionFeeMinor ?? 450000) / 100).toLocaleString('en-US', {
              minimumFractionDigits: 2,
            });

            return (
              <div
                key={course.id}
                className="bg-white border border-slate-200 hover:border-navy-300 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-navy-50 text-navy-800 border border-navy-200/50 font-mono">
                      {course.code}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-gold-50 text-gold-800 border border-gold-300/60">
                      {formatLevel(course.qualificationLevel)}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-navy-950 group-hover:text-navy-700 transition-colors leading-snug">
                    {course.name}
                  </h3>

                  {(course.faculty || course.department) && (
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-navy-800 shrink-0" />
                      <span>{course.faculty?.name || course.department?.name}</span>
                    </p>
                  )}

                  <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                    {course.description ||
                      'Comprehensive curriculum designed for practical industry mastery in ICT & Business management in Sierra Leone.'}
                  </p>

                  {/* Requirements & Duration details */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                        <Clock className="w-3.5 h-3.5" />
                        Duration:
                      </span>
                      <span className="font-semibold text-slate-800">
                        {course.duration || (course.qualificationLevel === 'DEGREE' ? 3 : 2)}{' '}
                        {course.durationUnit || 'Years'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                        <DollarSign className="w-3.5 h-3.5" />
                        Annual Tuition Fee:
                      </span>
                      <span className="font-bold text-emerald-800 font-mono">
                        SLE {tuitionSLE} / yr
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                        <FileText className="w-3.5 h-3.5" />
                        Application Voucher:
                      </span>
                      <span className="font-bold text-slate-700 font-mono">
                        SLE {feeInSLE} ({course.currency || 'SLE'})
                      </span>
                    </div>

                    {course.studyModes && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Study Modes:</span>
                        <span className="font-medium text-slate-700">{course.studyModes}</span>
                      </div>
                    )}
                  </div>

                  {course.admissionRequirements && (
                    <div className="mt-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] text-slate-600">
                      <span className="font-semibold text-navy-900 block mb-0.5 flex items-center gap-1">
                        <GraduationCap className="w-3 h-3 text-gold-600" />
                        Entry Requirements:
                      </span>
                      <span className="line-clamp-2">{course.admissionRequirements}</span>
                    </div>
                  )}
                </div>

                {/* Action */}
                <div className="mt-5 pt-3 border-t border-slate-100">
                  <Link to={`/apply?courseId=${course.id}`}>
                    <Button
                      variant="primary"
                      className="w-full text-xs py-2 bg-navy-900 hover:bg-navy-800 flex items-center justify-center gap-1.5 text-white"
                    >
                      <span>Apply for Programme</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gold-400" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
