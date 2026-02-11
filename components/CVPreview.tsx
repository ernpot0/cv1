
import React from 'react';
import { CV } from '../types';

interface CVPreviewProps {
  cv: CV;
}

export const CVPreview: React.FC<CVPreviewProps> = ({ cv }) => {
  const accent = cv.themeColor || '#1d70b8';
  const template = cv.template || 'modern';
  
  const formattedLocation = cv.city || cv.state || cv.country 
    ? [cv.city, cv.state, cv.country].filter(Boolean).join(', ') 
    : (cv.location || 'Remote');

  // --- Canadian Style Template ---
  if (template === 'canadian') {
    return (
      <div className="max-w-[850px] mx-auto bg-white min-h-[1100px] shadow-2xl print:shadow-none font-serif text-slate-900 p-16 space-y-8">
        <header className="text-center border-b-2 border-slate-100 pb-8">
          <h1 className="text-4xl font-bold uppercase tracking-tight mb-2">{cv.fullName || 'Full Name'}</h1>
          <p className="text-lg text-slate-600 mb-4">{cv.jobTitle || 'Your Profession'}</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs font-semibold text-slate-500">
            {cv.phone && <span>{cv.phone}</span>}
            {cv.email && <span>{cv.email}</span>}
            <span>{formattedLocation}</span>
          </div>
        </header>

        {cv.summary && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest border-b border-slate-200 pb-1 mb-3" style={{ color: accent }}>Professional Summary</h2>
            <p className="text-sm leading-relaxed text-justify">{cv.summary}</p>
          </section>
        )}

        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest border-b border-slate-200 pb-1 mb-5" style={{ color: accent }}>Work Experience</h2>
          <div className="space-y-6">
            {cv.experiences.map(exp => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-base">{exp.position}</h3>
                  <span className="text-xs font-semibold text-slate-400">{exp.startDate} – {exp.endDate}</span>
                </div>
                <p className="text-xs font-bold text-slate-500 italic mb-2">{exp.company}</p>
                <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest border-b border-slate-200 pb-1 mb-4" style={{ color: accent }}>Education</h2>
          <div className="space-y-4">
            {cv.educations.map(edu => (
              <div key={edu.id} className="flex justify-between items-baseline">
                <div>
                  <h3 className="text-sm font-bold">{edu.degree}</h3>
                  <p className="text-xs text-slate-500">{edu.school}</p>
                </div>
                <span className="text-xs font-semibold text-slate-400">{edu.year}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-2 gap-8">
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest border-b border-slate-200 pb-1 mb-4" style={{ color: accent }}>Skills</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {cv.skills.map((skill, i) => (
                <span key={i} className="text-sm text-slate-700 font-medium">• {skill}</span>
              ))}
            </div>
          </section>
          {cv.languages && cv.languages.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest border-b border-slate-200 pb-1 mb-4" style={{ color: accent }}>Languages</h2>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {cv.languages.map((lang, i) => (
                  <span key={i} className="text-sm text-slate-700 font-medium">• {lang}</span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  // --- Minimalist Template ---
  if (template === 'minimalist') {
    return (
      <div className="max-w-[850px] mx-auto bg-white min-h-[1100px] shadow-2xl print:shadow-none font-sans p-16 space-y-12">
        <header className="flex justify-between items-start border-l-8 pl-8" style={{ borderLeftColor: accent }}>
          <div>
            <h1 className="text-5xl font-light tracking-tighter mb-2">{cv.fullName || 'Full Name'}</h1>
            <p className="text-xl text-slate-400 font-medium uppercase tracking-[0.2em]">{cv.jobTitle}</p>
          </div>
          <div className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest leading-loose">
            <p>{formattedLocation}</p>
            <p>{cv.phone}</p>
            <p>{cv.email}</p>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-12">
          <div className="col-span-8 space-y-12">
            <section>
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-6">Experience</h2>
              <div className="space-y-10">
                {cv.experiences.map(exp => (
                  <div key={exp.id}>
                    <h3 className="text-lg font-bold mb-1">{exp.position}</h3>
                    <p className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-4">{exp.company} / {exp.startDate}-{exp.endDate}</p>
                    <p className="text-sm text-slate-500 leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
          <div className="col-span-4 space-y-12">
            <section>
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-6">Capabilities</h2>
              <div className="flex flex-col gap-3">
                {cv.skills.map((s, i) => (
                  <span key={i} className="text-xs font-bold text-slate-700 uppercase tracking-tighter">{s}</span>
                ))}
              </div>
            </section>
            {cv.languages && cv.languages.length > 0 && (
              <section>
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-6">Languages</h2>
                <div className="flex flex-col gap-3">
                  {cv.languages.map((l, i) => (
                    <span key={i} className="text-xs font-bold text-slate-700 uppercase tracking-tighter">{l}</span>
                  ))}
                </div>
              </section>
            )}
            <section>
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-6">Learning</h2>
              <div className="space-y-4">
                {cv.educations.map(edu => (
                  <div key={edu.id}>
                    <p className="text-xs font-black text-slate-900">{edu.degree}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">{edu.school}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  // --- Modern Style Template (Default) ---
  return (
    <div className="max-w-[850px] mx-auto bg-white flex flex-col md:flex-row min-h-[1100px] shadow-2xl print:shadow-none font-sans border border-slate-200 print:border-none">
      <div className="w-full md:w-1/3 bg-slate-800 text-white p-8 flex flex-col gap-10 print:bg-slate-800">
        <div className="relative group">
          <div className="w-full aspect-square bg-white rounded-3xl overflow-hidden border-4 border-slate-700 shadow-xl transition-transform duration-300 group-hover:scale-105">
            {cv.photoUrl ? (
              <img src={cv.photoUrl} alt={cv.fullName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
              </div>
            )}
          </div>
        </div>

        <section>
          <h3 className="text-sm font-bold uppercase tracking-widest border-b border-slate-600 pb-2 mb-5">Contact</h3>
          <div className="space-y-4 text-xs text-slate-300">
            <div className="flex items-center gap-3">
              <span className="text-white bg-slate-700 p-1.5 rounded-lg text-[10px]">📞</span>
              <span className="leading-tight">{cv.phone || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white bg-slate-700 p-1.5 rounded-lg text-[10px]">📍</span>
              <span className="leading-tight">{formattedLocation}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white bg-slate-700 p-1.5 rounded-lg text-[10px]">✉️</span>
              <span className="break-all leading-tight">{cv.email || 'N/A'}</span>
            </div>
          </div>
        </section>

        {cv.languages && cv.languages.length > 0 && (
          <section>
            <h3 className="text-sm font-bold uppercase tracking-widest border-b border-slate-600 pb-2 mb-5">Languages</h3>
            <div className="flex flex-wrap gap-2">
              {cv.languages.map((lang, i) => (
                <span key={i} className="text-[10px] font-black uppercase tracking-tight bg-slate-700 px-3 py-1 rounded-lg">{lang}</span>
              ))}
            </div>
          </section>
        )}

        {cv.educations.length > 0 && (
          <section>
            <h3 className="text-sm font-bold uppercase tracking-widest border-b border-slate-600 pb-2 mb-5">Education</h3>
            <div className="space-y-6">
              {cv.educations.map(edu => (
                <div key={edu.id} className="text-xs">
                  <p className="font-bold text-white mb-1 leading-snug">{edu.degree}</p>
                  <p className="text-slate-400 mb-1">{edu.year}</p>
                  <p className="text-slate-300 italic">{edu.school}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="flex-1 flex flex-col">
        <div style={{ backgroundColor: accent }} className="p-12 text-white flex flex-col justify-center min-h-[180px]">
          <h1 className="text-5xl font-extrabold tracking-tight mb-2 uppercase">{cv.fullName || 'Full Name'}</h1>
          <p className="text-xl font-light tracking-[0.2em] uppercase opacity-90">{cv.jobTitle || 'Your Profession'}</p>
        </div>

        <div className="p-12 space-y-12">
          <section>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-4 border-b-2 border-slate-50 pb-2">About Me</h2>
            <p className="text-sm text-slate-600 leading-relaxed text-justify whitespace-pre-line">{cv.summary}</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-6 border-b-2 border-slate-50 pb-2">Experience</h2>
            <div className="space-y-10">
              {cv.experiences.map(exp => (
                <div key={exp.id} className="relative pl-6 border-l-2 border-slate-100">
                  <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: accent }}></div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h4 className="font-bold text-slate-900 text-base">{exp.position}</h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{exp.startDate} – {exp.endDate}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 mb-3 italic">{exp.company}</p>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-6 border-b-2 border-slate-50 pb-2">Skills</h2>
            <div className="grid grid-cols-2 gap-y-4 gap-x-12">
              {cv.skills.map((skill, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }}></div>
                  <span className="text-xs text-slate-700 font-semibold">{skill}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
