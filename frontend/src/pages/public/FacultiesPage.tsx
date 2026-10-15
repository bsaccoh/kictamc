import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { publicApi, PublicFaculty } from '../../services/publicApi';
import { BookOpen, Layers, Laptop, Briefcase, FileSpreadsheet, ArrowRight, CheckCircle2 } from 'lucide-react';

export const FacultiesPage: React.FC = () => {
  const { data: faculties, isLoading } = useQuery({
    queryKey: ['publicFaculties'],
    queryFn: publicApi.getFaculties,
  });

  return (
    <div className="space-y-16 pb-20">
      {/* Header Banner */}
      <section className="bg-[#142D4E] text-white py-14 border-b border-[#203c62]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C69A43]">
              Academics
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Faculties &amp; Academic Departments
            </h1>
            <p className="text-sm sm:text-base text-slate-300">
              Discover our established academic faculties delivering specialized diplomas and degrees in Kenema.
            </p>
          </div>
        </div>
      </section>

      {/* Faculties Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-48 bg-white rounded-xl animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : faculties && faculties.length > 0 ? (
          <div className="space-y-8">
            {faculties.map((faculty: PublicFaculty) => (
              <div
                key={faculty.id}
                className="bg-white rounded-2xl border border-[#E1E6ED] shadow-sm hover:shadow-md transition-shadow p-6 sm:p-8 space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-[#E1E6ED] pb-6">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold px-2.5 py-1 rounded bg-[#142D4E] text-white">
                        {faculty.code}
                      </span>
                      <span className="text-xs text-[#C69A43] font-bold uppercase tracking-wider">
                        Academic Faculty
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#142D4E]">
                      {faculty.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#697586] leading-relaxed">
                      {faculty.description || 'Offers accredited courses focused on applied knowledge and practical competence.'}
                    </p>
                  </div>

                  <Link
                    to={`/courses?faculty=${faculty.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-900 bg-[#C69A43] hover:bg-[#d8a94d] rounded-md shadow shrink-0 self-start"
                  >
                    Explore Courses
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {faculty.departments && faculty.departments.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                      Constituent Academic Departments
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {faculty.departments.map((dept) => (
                        <div
                          key={dept.id}
                          className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1"
                        >
                          <span className="text-[10px] font-bold text-[#C69A43] uppercase">
                            {dept.code}
                          </span>
                          <h4 className="text-xs font-bold text-[#142D4E]">{dept.name}</h4>
                          <p className="text-[11px] text-[#697586] line-clamp-2">
                            {dept.description || 'Department conducting lectures and practical sessions.'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-[#E1E6ED]">
            <Layers className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-700">No faculties listed</h3>
            <p className="text-xs text-slate-500 mt-1">Please check back or contact the registry.</p>
          </div>
        )}
      </section>
    </div>
  );
};
