import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  MapPin,
  Users,
  Laptop,
  BookOpen,
  Award,
  X,
  Maximize2,
  Calendar,
} from 'lucide-react';

export const CampusLifePage: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    title: string;
    description: string;
    location: string;
  } | null>(null);

  const galleryItems = [
    {
      src: '/kictamc-college-front.jpg',
      title: 'College Front View & Student Cohort',
      description:
        'The main college building and entrance with the authentic student group in Kenema, Eastern Province.',
      location: '19 Bockarie Gbay Street, Kenema',
      category: 'Campus',
    },
    {
      src: '/kictamc-campus.jpg',
      title: 'Student Body in Front of College Blue Wall',
      description:
        'Students gathered outside the administrative wing, demonstrating collegiate solidarity and unity.',
      location: 'Kenema Main Campus',
      category: 'Students',
    },
    {
      src: '/campus-building.jpg',
      title: 'Kenema Campus Academic Facility',
      description:
        'Exterior perspective of the academic complex housing lecture halls, study rooms, and computer labs.',
      location: 'Kenema, Sierra Leone',
      category: 'Facilities',
    },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Header Banner */}
      <section className="bg-[#142D4E] text-white py-14 border-b border-[#203c62]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C69A43]">
              Student Experience
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Campus Life &amp; Authentic Gallery
            </h1>
            <p className="text-sm sm:text-base text-slate-300">
              Discover student life at KICTAM College &mdash; combining hands-on technical training, vibrant peer collaboration, and community spirit.
            </p>
          </div>
        </div>
      </section>

      {/* Campus Culture Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-[#E1E6ED] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#142D4E] text-[#C69A43] flex items-center justify-center font-bold">
              <Laptop className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#142D4E]">Practical Computing Labs</h3>
            <p className="text-xs text-[#697586] leading-relaxed">
              Modern computer workstations configured with networking tools, office applications, and programming environments for daily hands-on practice.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E1E6ED] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#142D4E] text-[#C69A43] flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#142D4E]">Student Leadership &amp; Clubs</h3>
            <p className="text-xs text-[#697586] leading-relaxed">
              Student representative council, ICT study circles, debate clubs, and entrepreneurial workshops that nurture leadership and teamwork.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E1E6ED] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#142D4E] text-[#C69A43] flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#142D4E]">Community Service</h3>
            <p className="text-xs text-[#697586] leading-relaxed">
              Students participate in regional digital literacy outreach and community volunteering in alignment with our motto “Non Sibi Sed Patriae”.
            </p>
          </div>
        </div>
      </section>

      {/* Authentic Photo Gallery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#C69A43]">
              Photo Documentation
            </span>
            <h2 className="text-2xl font-bold text-[#142D4E]">
              Authentic Institutional Photography
            </h2>
            <p className="text-xs text-[#697586]">
              Real imagery of our campus facilities and student community in Kenema.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-medium">Click any photo to view full size</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedImage(item)}
              className="bg-white rounded-xl overflow-hidden border border-[#E1E6ED] shadow-sm hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="relative overflow-hidden h-64 bg-slate-100">
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-4 h-4" />
                </div>
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#142D4E]/90 text-[#C69A43]">
                  {item.category}
                </div>
              </div>

              <div className="p-4 space-y-1">
                <h3 className="text-sm font-bold text-[#142D4E] group-hover:text-[#C69A43] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-[#697586] line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-[#C69A43]" />
                  <span>{item.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-black flex items-center justify-center max-h-[70vh] overflow-hidden">
              <img
                src={selectedImage.src}
                alt={selectedImage.title}
                className="max-h-[70vh] w-auto object-contain mx-auto"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-full hover:bg-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-2 bg-white">
              <div className="flex items-center justify-between text-xs text-[#C69A43] font-bold uppercase">
                <span>Authentic Institutional Asset</span>
                <span>{selectedImage.location}</span>
              </div>
              <h3 className="text-lg font-bold text-[#142D4E]">{selectedImage.title}</h3>
              <p className="text-xs sm:text-sm text-[#697586] leading-relaxed">
                {selectedImage.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
