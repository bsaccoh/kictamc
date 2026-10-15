import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-950 text-slate-400 text-xs py-8 border-t border-navy-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-slate-300">
            Kenema ICT & Management College (KICTAMC)
          </p>
          <p className="text-slate-500 mt-0.5">
            Admissions Office: 19 Bockarie Gbay Street Kenema • Contact: +23272808080 • admissions@kictamc.edu.sl
          </p>
        </div>
        <div className="flex items-center gap-6 text-slate-400">
          <span>Phase 1 — Student Application Portal</span>
          <span>© {new Date().getFullYear()} KICTAMC. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};
