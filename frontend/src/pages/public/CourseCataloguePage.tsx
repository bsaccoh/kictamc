import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { publicApi, PublicCourse } from '../../services/publicApi';
import {
  Search,
  Filter,
  BookOpen,
  Clock,
  MapPin,
  GraduationCap,
  ArrowRight,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export const CourseCataloguePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialLevel = searchParams.get('level') || 'ALL';
  const initialFaculty = searchParams.get('faculty') || 'ALL';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(initialLevel);
  const [selectedFaculty, setSelectedFaculty] = useState(initialFaculty);

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['publicCourses'],
    queryFn: publicApi.getCourses,
  });

  const { data: faculties } = useQuery({
    queryKey: ['publicFaculties'],
    queryFn: publicApi.getFaculties,
  });

  // Filter courses
  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    return courses.filter((c: PublicCourse) => {
      // Search
      const matchesSearch =
        !searchQuery.trim() ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));

      // Level
      const matchesLevel = selectedLevel === 'ALL' || c.qualificationLevel === selectedLevel;

      // Faculty / Department
      const matchesFaculty =
        selectedFaculty === 'ALL' ||
        c.facultyId === selectedFaculty ||
        c.departmentId === selectedFaculty;

      return matchesSearch && matchesLevel && matchesFaculty;
    });
  }, [courses, searchQuery, selectedLevel, selectedFaculty]);

  return (
    <div className="space-y-12 pb-20">
      {/* Header Banner */}
      <section className="bg-[#142D4E] text-white py-14 border-b border-[#203c62]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C69A43]">
              Academic Programmes
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Official Course Catalogue
            </h1>
            <p className="text-sm sm:text-base text-slate-300">
              Browse accredited Degree, Higher National Diploma, and Lower Diploma programmes offered at KICTAM College, Kenema.
            </p>
          </div>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl border border-[#E1E6ED] shadow-sm p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by programme name or code (e.g. BIT, Diploma)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C69A43] focus:border-transparent"
              />
            </div>

            {/* Level Filter */}
            <div className="md:col-span-4">
              <select
                value={selectedLevel}
                onChange={(e) => {
                  setSelectedLevel(e.target.value);
                  if (e.target.value === 'ALL') {
                    searchParams.delete('level');
                  } else {
                    searchParams.set('level', e.target.value);
                  }
                  setSearchParams(searchParams);
                }}
                className="w-full px-3 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C69A43] focus:border-transparent bg-white"
              >
                <option value="ALL">All Qualification Levels</option>
                <option value="DEGREE">Bachelor Degree Programmes</option>
                <option value="HIGHER_DIPLOMA">Higher National Diplomas (HND)</option>
                <option value="LOWER_DIPLOMA">Lower Diplomas</option>
              </select>
            </div>

            {/* Faculty Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedFaculty}
                onChange={(e) => {
                  setSelectedFaculty(e.target.value);
                  if (e.target.value === 'ALL') {
                    searchParams.delete('faculty');
                  } else {
                    searchParams.set('faculty', e.target.value);
                  }
                  setSearchParams(searchParams);
                }}
                className="w-full px-3 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C69A43] focus:border-transparent bg-white"
              >
                <option value="ALL">All Faculties / Disciplines</option>
                {faculties?.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#697586] pt-1">
            <span>
              Showing <strong className="text-[#142D4E]">{filteredCourses.length}</strong> programmes
            </span>
            {(searchQuery || selectedLevel !== 'ALL' || selectedFaculty !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedLevel('ALL');
                  setSelectedFaculty('ALL');
                  setSearchParams({});
                }}
                className="text-[#C69A43] hover:underline font-semibold"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Course Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {coursesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-72 bg-white rounded-xl animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course: PublicCourse) => (
              <div
                key={course.id}
                className="bg-white rounded-xl border border-[#E1E6ED] shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-[#142D4E] border border-slate-200">
                      {course.code}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                      {course.qualificationLevel.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#142D4E] leading-snug">
                    {course.name}
                  </h3>

                  <p className="text-xs text-[#697586] line-clamp-3 leading-relaxed">
                    {course.description ||
                      'Focused on developing practical proficiency, digital competence, and applied problem-solving.'}
                  </p>

                  <div className="pt-2 text-xs text-slate-500 space-y-1.5 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#C69A43]" />
                      <span>Duration: {course.duration} {course.durationUnit}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#C69A43]" />
                      <span>Campus: {course.preferredCampuses || 'Kenema Main Campus'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#C69A43]" />
                      <span>Modes: {course.studyModes || 'Full-Time, Evening'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-[#E1E6ED] flex items-center justify-between gap-3">
                  <Link
                    to={`/courses/${course.id}`}
                    className="text-xs font-semibold text-[#142D4E] hover:text-[#C69A43] transition-colors"
                  >
                    View Details
                  </Link>
                  <Link
                    to={`/apply?courseId=${course.id}`}
                    className="px-3.5 py-1.5 text-xs font-bold text-slate-900 bg-[#C69A43] hover:bg-[#d8a94d] rounded shadow-sm transition-colors"
                  >
                    Apply Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-[#E1E6ED] space-y-3">
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-[#142D4E]">No programmes matched your criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your keyword search or changing the qualification level filter.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
