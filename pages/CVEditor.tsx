
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GoogleGenAI } from '@google/genai';
import { db } from '../lib/mockDb';
import { CV, CVVisibility, Experience, Education, Reference, Course } from '../types';
import { useAppContext } from '../App';
import { CVPreview } from '../components/CVPreview';

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const CVEditor: React.FC = () => {
  const { cvId } = useParams();
  const { user } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'info'|'experience'|'education'|'courses'|'skills'|'languages'|'references'|'design'>('info');
  const [loadingAI, setLoadingAI] = useState<{ [key: string]: boolean }>({});
  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  const [cv, setCv] = useState<CV>({
    id: cvId || `cv_${Math.random().toString(36).substr(2, 9)}`,
    userId: user?.id || '',
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: '',
    location: '',
    city: '',
    state: '',
    country: '',
    jobTitle: '',
    summary: '',
    experiences: [],
    educations: [],
    courses: [],
    languages: [],
    skills: [],
    references: [],
    visibility: CVVisibility.PRIVATE,
    updatedAt: Date.now(),
    themeColor: '#1d70b8',
    photoUrl: '',
    template: 'modern'
  });

  useEffect(() => {
    if (cvId) {
      const existing = db.getCVS().find(c => c.id === cvId);
      if (existing) {
        if (existing.userId !== user?.id) navigate('/dashboard/seeker');
        else setCv({ 
          ...existing, 
          courses: existing.courses || [], 
          languages: existing.languages || [],
          template: existing.template || 'modern',
          city: existing.city || '',
          state: existing.state || '',
          country: existing.country || ''
        });
      }
    }
  }, [cvId, user]);

  const saveCV = () => {
    const allCvs = db.getCVS();
    const updated = { ...cv, updatedAt: Date.now() };
    const idx = allCvs.findIndex(c => c.id === cv.id);
    if (idx > -1) allCvs[idx] = updated;
    else allCvs.push(updated);
    db.saveCVS(allCvs);
    alert('CV Profile saved successfully.');
  };

  const addSkill = () => {
    if (newSkill.trim() && !cv.skills.includes(newSkill.trim())) {
      setCv(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !cv.languages.includes(newLanguage.trim())) {
      setCv(prev => ({ ...prev, languages: [...prev.languages, newLanguage.trim()] }));
      setNewLanguage('');
    }
  };

  const removeSkill = (skill: string) => {
    setCv(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const removeLanguage = (lang: string) => {
    setCv(prev => ({ ...prev, languages: prev.languages.filter(l => l !== lang) }));
  };

  const aiPolish = async (type: 'summary' | 'experience', id?: string) => {
    let prompt = '';
    let currentText = '';

    if (type === 'summary') {
      currentText = cv.summary;
      prompt = `I am a ${cv.jobTitle}. Rewrite this professional summary to be more polished, modern, and high-impact. Keep it under 4 sentences: "${currentText}"`;
    } else if (type === 'experience' && id) {
      const exp = cv.experiences.find(e => e.id === id);
      if (!exp) return;
      currentText = exp.description;
      prompt = `I worked as a ${exp.position} at ${exp.company}. Rewrite these bullet points or description to be more professional, using strong action verbs: "${currentText}"`;
    }

    if (!currentText || currentText.length < 3) {
      alert("Please provide some text for AI to analyze.");
      return;
    }

    const loadingKey = id || type;
    setLoadingAI(prev => ({ ...prev, [loadingKey]: true }));

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      if (response.text) {
        const polished = response.text.trim();
        if (type === 'summary') {
          setCv(prev => ({ ...prev, summary: polished }));
        } else if (id && type === 'experience') {
          setCv(prev => ({
            ...prev,
            experiences: prev.experiences.map(ex => ex.id === id ? { ...ex, description: polished } : ex)
          }));
        }
      }
    } catch (e) {
      console.error(e);
      alert('AI Polishing encountered an error. Please try again.');
    } finally {
      setLoadingAI(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const sectionLabel = (label: string) => (
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</label>
  );

  const cardContainer = (children: React.ReactNode, onRemove?: () => void) => (
    <div className="p-8 border-2 border-slate-50 rounded-[2.5rem] bg-white shadow-sm space-y-6 relative group animate-in fade-in slide-in-from-bottom-2 duration-300">
      {onRemove && (
        <button onClick={onRemove} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-xl">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      )}
      {children}
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-12 min-h-[calc(100vh-10rem)] py-8">
      {/* Sidebar Controls */}
      <div className="w-full lg:w-1/2 flex flex-col gap-6 no-print">
        <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Studio</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Design your professional presence</p>
            </div>
            <button 
              onClick={saveCV}
              className="px-10 py-4 bg-[#002B5B] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition transform active:scale-95 shadow-2xl shadow-indigo-100"
            >
              Save Changes
            </button>
          </div>

          {/* Navigation */}
          <div className="flex gap-2 mb-12 overflow-x-auto pb-4 no-scrollbar">
            {(['info', 'experience', 'education', 'courses', 'skills', 'languages', 'references', 'design'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-[10px] font-black rounded-full transition-all whitespace-nowrap ${activeTab === tab ? 'bg-[#002B5B] text-white shadow-xl shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50 uppercase tracking-widest'}`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="space-y-10 min-h-[500px]">
            {activeTab === 'info' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    {sectionLabel('Full Name')}
                    <input className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 font-bold transition-all" value={cv.fullName} onChange={e => setCv({...cv, fullName: e.target.value})} />
                  </div>
                  <div>
                    {sectionLabel('Job Title')}
                    <input className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 font-bold transition-all" value={cv.jobTitle} onChange={e => setCv({...cv, jobTitle: e.target.value})} />
                  </div>
                </div>
                <div>
                  {sectionLabel('Photo URL')}
                  <input className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 text-sm transition-all" placeholder="Paste direct image link..." value={cv.photoUrl} onChange={e => setCv({...cv, photoUrl: e.target.value})} />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    {sectionLabel('Bio / Summary')}
                    <button onClick={() => aiPolish('summary')} disabled={loadingAI['summary']} className="text-[10px] font-black uppercase tracking-widest text-[#002B5B] hover:text-slate-700 transition disabled:opacity-50">
                      {loadingAI['summary'] ? '✨ POLISHING...' : '✨ AI POLISH'}
                    </button>
                  </div>
                  <textarea className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-[2rem] outline-none focus:ring-4 focus:ring-blue-50 h-44 resize-none text-sm leading-relaxed transition-all" value={cv.summary} onChange={e => setCv({...cv, summary: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    {sectionLabel('Email Address')}
                    <input className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm transition-all" placeholder="Email Address" value={cv.email} onChange={e => setCv({...cv, email: e.target.value})} />
                  </div>
                  <div>
                    {sectionLabel('Phone Number')}
                    <input className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm transition-all" placeholder="Phone Number" value={cv.phone} onChange={e => setCv({...cv, phone: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    {sectionLabel('City')}
                    <input className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm transition-all font-medium" placeholder="City" value={cv.city} onChange={e => setCv({...cv, city: e.target.value})} />
                  </div>
                  <div>
                    {sectionLabel('State / Province')}
                    <input className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm transition-all font-medium" placeholder="State/Prov" value={cv.state} onChange={e => setCv({...cv, state: e.target.value})} />
                  </div>
                  <div>
                    {sectionLabel('Country')}
                    <select 
                      className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm transition-all font-medium outline-none" 
                      value={cv.country} 
                      onChange={e => setCv({...cv, country: e.target.value})}
                    >
                      <option value="">Select Country</option>
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  {sectionLabel('Legacy Address String')}
                  <input className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm transition-all font-medium" placeholder="e.g. Toronto, ON (Legacy field)" value={cv.location} onChange={e => setCv({...cv, location: e.target.value})} />
                </div>
              </div>
            )}

            {activeTab === 'experience' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {cv.experiences.map(exp => cardContainer(
                  <div className="space-y-6" key={exp.id}>
                    <div className="grid grid-cols-2 gap-6">
                      <input className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 font-bold text-sm" placeholder="Job Title" value={exp.position} onChange={e => setCv({...cv, experiences: cv.experiences.map(ex => ex.id === exp.id ? {...ex, position: e.target.value} : ex)})} />
                      <input className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 text-sm font-semibold" placeholder="Company" value={exp.company} onChange={e => setCv({...cv, experiences: cv.experiences.map(ex => ex.id === exp.id ? {...ex, company: e.target.value} : ex)})} />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <input className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none text-xs" placeholder="Start (e.g. May 2018)" value={exp.startDate} onChange={e => setCv({...cv, experiences: cv.experiences.map(ex => ex.id === exp.id ? {...ex, startDate: e.target.value} : ex)})} />
                      <input className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none text-xs" placeholder="End (e.g. Present)" value={exp.endDate} onChange={e => setCv({...cv, experiences: cv.experiences.map(ex => ex.id === exp.id ? {...ex, endDate: e.target.value} : ex)})} />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        {sectionLabel('Impact & Responsibilities')}
                        <button onClick={() => aiPolish('experience', exp.id)} disabled={loadingAI[exp.id]} className="text-[10px] font-black uppercase tracking-widest text-[#002B5B] hover:text-slate-700 disabled:opacity-50">
                          {loadingAI[exp.id] ? '✨ POLISHING...' : '✨ AI POLISH'}
                        </button>
                      </div>
                      <textarea className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 text-sm h-32 leading-relaxed" placeholder="What did you achieve here?" value={exp.description} onChange={e => setCv({...cv, experiences: cv.experiences.map(ex => ex.id === exp.id ? {...ex, description: e.target.value} : ex)})} />
                    </div>
                  </div>,
                  () => setCv({...cv, experiences: cv.experiences.filter(e => e.id !== exp.id)})
                ))}
                <button onClick={() => setCv({...cv, experiences: [...cv.experiences, {id: Math.random().toString(), company: '', position: '', startDate: '', endDate: '', description: ''}]})} className="w-full py-10 border-4 border-dashed border-slate-50 rounded-[3rem] text-slate-300 font-black hover:bg-slate-50 hover:text-blue-400 transition-all uppercase text-[10px] tracking-[0.4em]">+ Add Experience</button>
              </div>
            )}

            {activeTab === 'education' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {cv.educations.map(edu => cardContainer(
                  <div className="grid grid-cols-2 gap-6" key={edu.id}>
                    <div className="col-span-2">
                      {sectionLabel('Degree / Program')}
                      <input className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-sm" value={edu.degree} onChange={e => setCv({...cv, educations: cv.educations.map(ed => ed.id === edu.id ? {...ed, degree: e.target.value} : ed)})} />
                    </div>
                    <div>
                      {sectionLabel('School / University')}
                      <input className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm" value={edu.school} onChange={e => setCv({...cv, educations: cv.educations.map(ed => ed.id === edu.id ? {...ed, school: e.target.value} : ed)})} />
                    </div>
                    <div>
                      {sectionLabel('Years')}
                      <input className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm" value={edu.year} onChange={e => setCv({...cv, educations: cv.educations.map(ed => ed.id === edu.id ? {...ed, year: e.target.value} : ed)})} />
                    </div>
                  </div>,
                  () => setCv({...cv, educations: cv.educations.filter(e => e.id !== edu.id)})
                ))}
                <button onClick={() => setCv({...cv, educations: [...cv.educations, {id: Math.random().toString(), school: '', degree: '', year: ''}]})} className="w-full py-10 border-4 border-dashed border-slate-50 rounded-[3rem] text-slate-300 font-black hover:bg-slate-50 hover:text-blue-400 transition-all uppercase text-[10px] tracking-[0.4em]">+ Add Education</button>
              </div>
            )}

            {activeTab === 'courses' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {cv.courses.map(course => cardContainer(
                  <div className="grid grid-cols-2 gap-6" key={course.id}>
                    <div className="col-span-2">
                      {sectionLabel('Course / Certificate Name')}
                      <input className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-sm" value={course.title} onChange={e => setCv({...cv, courses: cv.courses.map(c => c.id === course.id ? {...c, title: e.target.value} : c)})} />
                    </div>
                    <div>
                      {sectionLabel('Platform / Institution')}
                      <input className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm" value={course.institution} onChange={e => setCv({...cv, courses: cv.courses.map(c => c.id === course.id ? {...c, institution: e.target.value} : c)})} />
                    </div>
                    <div>
                      {sectionLabel('Completion Year')}
                      <input className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm" value={course.year} onChange={e => setCv({...cv, courses: cv.courses.map(c => c.id === course.id ? {...c, year: e.target.value} : c)})} />
                    </div>
                  </div>,
                  () => setCv({...cv, courses: cv.courses.filter(c => c.id !== course.id)})
                ))}
                <button 
                  onClick={() => setCv({...cv, courses: [...cv.courses, {id: Math.random().toString(), title: '', institution: '', year: ''}]})} 
                  className="w-full py-10 border-4 border-dashed border-blue-100 rounded-[3rem] text-blue-300 font-black hover:bg-blue-50/50 hover:text-[#002B5B] transition-all uppercase text-[10px] tracking-[0.4em]"
                >
                  + Add New Course Card
                </button>
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="space-y-10 animate-in fade-in duration-300">
                <div className="flex gap-4">
                  <input 
                    className="flex-grow p-5 bg-white border-2 border-slate-50 shadow-sm rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 text-sm font-bold transition-all" 
                    placeholder="Enter skill (e.g. React, UI/UX)..." 
                    value={newSkill} 
                    onChange={e => setNewSkill(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addSkill()}
                  />
                  <button onClick={addSkill} className="px-10 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#002B5B] shadow-xl transition-all">Add</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {cv.skills.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between px-5 py-4 bg-blue-50/40 text-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-tight border border-blue-100 group">
                      {s}
                      <button onClick={() => removeSkill(s)} className="text-slate-300 hover:text-red-500 transition-colors ml-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'languages' && (
              <div className="space-y-10 animate-in fade-in duration-300">
                <div className="flex gap-4">
                  <input 
                    className="flex-grow p-5 bg-white border-2 border-slate-50 shadow-sm rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 text-sm font-bold transition-all" 
                    placeholder="Enter language (e.g. English - Fluent)..." 
                    value={newLanguage} 
                    onChange={e => setNewLanguage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addLanguage()}
                  />
                  <button onClick={addLanguage} className="px-10 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#002B5B] shadow-xl transition-all">Add</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {cv.languages.map((l, idx) => (
                    <div key={idx} className="flex items-center justify-between px-5 py-4 bg-slate-50 text-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-tight border border-slate-100 group">
                      {l}
                      <button onClick={() => removeLanguage(l)} className="text-slate-300 hover:text-red-500 transition-colors ml-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'references' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {cv.references.map(ref => cardContainer(
                  <div className="space-y-6" key={ref.id}>
                    <div>
                      {sectionLabel('Reference Full Name')}
                      <input className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-sm" value={ref.name} onChange={e => setCv({...cv, references: cv.references.map(r => r.id === ref.id ? {...r, name: e.target.value} : r)})} />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <input className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-xs" placeholder="Position" value={ref.position} onChange={e => setCv({...cv, references: cv.references.map(r => r.id === ref.id ? {...r, position: e.target.value} : r)})} />
                      <input className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-xs" placeholder="Email" value={ref.email} onChange={e => setCv({...cv, references: cv.references.map(r => r.id === ref.id ? {...r, email: e.target.value} : r)})} />
                      <div className="col-span-2">
                        <input className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-xs" placeholder="Phone" value={ref.phone} onChange={e => setCv({...cv, references: cv.references.map(r => r.id === ref.id ? {...r, phone: e.target.value} : r)})} />
                      </div>
                    </div>
                  </div>,
                  () => setCv({...cv, references: cv.references.filter(r => r.id !== ref.id)})
                ))}
                <button onClick={() => setCv({...cv, references: [...cv.references, {id: Math.random().toString(), name: '', position: '', email: '', phone: ''}]})} className="w-full py-10 border-4 border-dashed border-slate-50 rounded-[3rem] text-slate-300 font-black hover:bg-slate-50 hover:text-blue-400 transition-all uppercase text-[10px] tracking-[0.4em]">+ Add Reference</button>
              </div>
            )}

            {activeTab === 'design' && (
              <div className="space-y-12 animate-in fade-in duration-300">
                <div>
                  {sectionLabel('Select Layout Template')}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    <button 
                      onClick={() => setCv({...cv, template: 'modern'})}
                      className={`p-6 rounded-[2rem] border-4 flex flex-col items-center gap-3 transition-all ${cv.template === 'modern' ? 'bg-[#002B5B] text-white border-slate-200' : 'bg-white border-slate-50 text-slate-400 hover:border-slate-100'}`}
                    >
                      <div className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center font-black">M</div>
                      <span className="text-[10px] font-black uppercase tracking-widest">Modern (Split)</span>
                    </button>
                    <button 
                      onClick={() => setCv({...cv, template: 'canadian'})}
                      className={`p-6 rounded-[2rem] border-4 flex flex-col items-center gap-3 transition-all ${cv.template === 'canadian' ? 'bg-[#002B5B] text-white border-slate-200' : 'bg-white border-slate-50 text-slate-400 hover:border-slate-100'}`}
                    >
                      <div className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center font-black">CA</div>
                      <span className="text-[10px] font-black uppercase tracking-widest">Canadian Style</span>
                    </button>
                    <button 
                      onClick={() => setCv({...cv, template: 'minimalist'})}
                      className={`p-6 rounded-[2rem] border-4 flex flex-col items-center gap-3 transition-all ${cv.template === 'minimalist' ? 'bg-[#002B5B] text-white border-slate-200' : 'bg-white border-slate-50 text-slate-400 hover:border-slate-100'}`}
                    >
                      <div className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center font-black">MI</div>
                      <span className="text-[10px] font-black uppercase tracking-widest">Minimalist</span>
                    </button>
                  </div>
                </div>

                <div>
                  {sectionLabel('Accent Identity Color')}
                  <div className="flex flex-wrap gap-5 mt-6">
                    {['#1d70b8', '#002B5B', '#dc2626', '#16a34a', '#7c3aed', '#ea580c', '#ec4899'].map(color => (
                      <button 
                        key={color} 
                        onClick={() => setCv({...cv, themeColor: color})}
                        className={`w-14 h-14 rounded-2xl border-4 transition-all shadow-xl hover:scale-110 ${cv.themeColor === color ? 'border-[#002B5B] scale-125' : 'border-white'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="p-12 bg-slate-50 rounded-[3rem] border-2 border-white shadow-inner">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8">Privacy Options</h4>
                  <div className="space-y-4">
                    {Object.values(CVVisibility).map(v => (
                      <button 
                        key={v}
                        onClick={() => setCv({...cv, visibility: v})}
                        className={`flex items-center justify-between w-full p-6 rounded-[2rem] border-4 transition-all ${cv.visibility === v ? 'bg-[#002B5B] text-white border-slate-200 shadow-2xl' : 'bg-white text-slate-400 border-white hover:border-slate-50'}`}
                      >
                        <span className="text-xs font-black uppercase tracking-[0.2em]">{v.replace('_', ' ')}</span>
                        <div className={`w-6 h-6 rounded-full border-4 flex items-center justify-center ${cv.visibility === v ? 'border-slate-400 bg-white' : 'border-slate-100'}`}>
                           {cv.visibility === v && <div className="w-2 h-2 rounded-full bg-[#002B5B]"></div>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Preview Column */}
      <div className="flex-1 overflow-hidden sticky top-24 h-[calc(100vh-8rem)]">
        <div className="h-full bg-white rounded-[3rem] overflow-y-auto border-4 border-slate-50 shadow-2xl p-4 md:p-10 print:p-0 print:bg-white print:static print:h-auto no-scrollbar">
           <div className="mb-4 flex items-center justify-between px-2 no-print">
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Preview: {cv.template?.toUpperCase() || 'MODERN'}</span>
             <span className="text-[8px] font-bold text-slate-300 uppercase">Live Update Active</span>
           </div>
           <CVPreview cv={cv} />
        </div>
      </div>
    </div>
  );
};

export default CVEditor;
