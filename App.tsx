
import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { User, UserRole, CV, CVVisibility, JobPost, JobPostStatus } from './types.ts';
import { db } from './lib/mockDb.ts';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import SeekerDashboard from './pages/SeekerDashboard.tsx';
import EmployerDashboard from './pages/EmployerDashboard.tsx';
import CVEditor from './pages/CVEditor.tsx';
import JobEditor from './pages/JobEditor.tsx';
import CVView from './pages/CVView.tsx';
import JobView from './pages/JobView.tsx';
import MessagesPage from './pages/Messages.tsx';
import { Layout } from './components/Layout.tsx';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('procv_session');
    if (saved) {
      const parsed = JSON.parse(saved);
      setUser(parsed);
    }
  }, []);

  const handleSetUser = (u: User | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem('procv_session', JSON.stringify(u));
    } else {
      localStorage.removeItem('procv_session');
    }
  };

  const logout = () => handleSetUser(null);

  return (
    <AppContext.Provider value={{ user, setUser: handleSetUser, logout }}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="messages" element={user ? <MessagesPage /> : <Navigate to="/login" />} />
            <Route path="dashboard/seeker" element={user?.role === UserRole.JOB_SEEKER ? <SeekerDashboard /> : <Navigate to="/login" />} />
            <Route path="dashboard/employer" element={user?.role === UserRole.EMPLOYER ? <EmployerDashboard /> : <Navigate to="/login" />} />
            <Route path="builder/:cvId?" element={user?.role === UserRole.JOB_SEEKER ? <CVEditor /> : <Navigate to="/login" />} />
            <Route path="job-builder/:jobId?" element={user?.role === UserRole.EMPLOYER ? <JobEditor /> : <Navigate to="/login" />} />
          </Route>
          <Route path="cv/:cvId" element={<CVView />} />
          <Route path="jobs/:jobId" element={<JobView />} />
        </Routes>
      </HashRouter>
    </AppContext.Provider>
  );
};

const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [publicCvs, setPublicCvs] = useState<CV[]>([]);
  const [activeJobs, setActiveJobs] = useState<JobPost[]>([]);
  const [mode, setMode] = useState<'talent' | 'jobs'>('talent');
  const [currentSlide, setCurrentSlide] = useState(0);
  const { user } = useAppContext();

  useEffect(() => {
    const allCvs = db.getCVS();
    setPublicCvs(allCvs.filter(cv => cv.visibility === CVVisibility.PUBLIC));
    
    const allJobs = db.getJobPosts();
    setActiveJobs(allJobs.filter(j => j.status === JobPostStatus.ACTIVE));
  }, []);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % 3);
    }, 10000);
    return () => clearInterval(slideInterval);
  }, []);

  const filteredCvs = useMemo(() => {
    return countryFilter 
      ? publicCvs.filter(cv => cv.country === countryFilter)
      : publicCvs;
  }, [publicCvs, countryFilter]);

  const scoredCvs = useMemo(() => {
    if (!searchTerm.trim()) return filteredCvs.map(cv => ({ ...cv, score: 1 }));
    const keywords = searchTerm.toLowerCase().split(/\s+/).filter(k => k.length > 1);
    return filteredCvs.map(cv => {
      let score = 0;
      const title = (cv.jobTitle || '').toLowerCase();
      const skills = (cv.skills || []).map(s => s.toLowerCase());
      const locText = [cv.city, cv.state, cv.country, cv.location].filter(Boolean).join(' ').toLowerCase();
      
      keywords.forEach(k => {
        if (title.includes(k)) score += 20;
        if (locText.includes(k)) score += 15;
        if (skills.some(s => s.includes(k))) score += 10;
        if (cv.fullName.toLowerCase().includes(k)) score += 5;
      });
      return { ...cv, score };
    }).filter(cv => cv.score > 0).sort((a, b) => b.score - a.score);
  }, [filteredCvs, searchTerm]);

  const scoredJobs = useMemo(() => {
    if (!searchTerm.trim()) return activeJobs.map(j => ({ ...j, score: 1 }));
    const keywords = searchTerm.toLowerCase().split(/\s+/).filter(k => k.length > 1);
    return activeJobs.map(job => {
      let score = 0;
      const title = job.title.toLowerCase();
      const loc = job.location.toLowerCase();
      const reqs = job.requirements.map(r => r.toLowerCase());
      keywords.forEach(k => {
        if (title.includes(k)) score += 20;
        if (loc.includes(k)) score += 15;
        if (reqs.some(r => r.includes(k))) score += 10;
        if (job.companyName.toLowerCase().includes(k)) score += 5;
      });
      return { ...job, score };
    }).filter(j => j.score > 0).sort((a, b) => b.score - a.score);
  }, [activeJobs, searchTerm]);

  const spotlightContent = [
    { 
      title: "The Talent Mart", 
      desc: "Source elite professionals from our verified talent inventory.",
      cta: "Browse Talent",
      color: "bg-[#002B5B]",
      icon: (
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      )
    },
    { 
      title: "Premium Listings", 
      desc: "Discover high-impact roles from the world's most innovative teams.",
      cta: "Explore Jobs",
      color: "bg-slate-900",
      icon: (
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full">
          <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
        </svg>
      )
    },
    { 
      title: "Studio Access", 
      desc: "Craft a professional presence that commands immediate attention.",
      cta: "Start Building",
      color: "bg-emerald-600",
      icon: (
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full">
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.995.995 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
        </svg>
      )
    }
  ];

  return (
    <div className="space-y-20 py-8">
      {/* Mart Hero Slider */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 h-[500px] flex items-center shadow-xl">
        <div className="absolute inset-0 opacity-10 transition-opacity duration-1000">
          <div className="absolute top-0 right-0 w-[600px] h-full text-white transform translate-x-1/3 rotate-12 transition-all duration-700">
             {spotlightContent[currentSlide].icon}
          </div>
        </div>

        <div className="relative z-10 w-full px-8 md:px-16">
          <div className="max-w-2xl">
            <div className="h-[240px] relative">
              {spotlightContent.map((item, idx) => (
                <div 
                  key={idx}
                  className={`absolute top-0 left-0 transition-all duration-700 ${currentSlide === idx ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'}`}
                >
                  <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
                    {item.title}
                  </h1>
                  <p className="text-xl text-slate-400 mb-10 font-medium">
                    {item.desc}
                  </p>
                  <button onClick={() => setMode(idx === 1 ? 'jobs' : 'talent')} className={`px-10 py-4 ${item.color} text-white rounded-xl font-bold text-sm uppercase tracking-wider hover:opacity-90 transition shadow-lg`}>
                    {item.cta}
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex gap-3 mt-12">
              {spotlightContent.map((_, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-12 bg-white' : 'w-2 bg-slate-700'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Modern Search Control */}
      <section className="max-w-5xl mx-auto px-4 text-center">
        <div className="inline-flex p-1.5 bg-slate-200 rounded-2xl mb-10">
          <button onClick={() => setMode('talent')} className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${mode === 'talent' ? 'bg-white text-[#002B5B] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Talent Market</button>
          <button onClick={() => setMode('jobs')} className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${mode === 'jobs' ? 'bg-white text-[#002B5B] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Job Board</button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <input 
              type="text" 
              placeholder={mode === 'talent' ? "Search talent inventory (React, Designer, Toronto...)" : "Search open listings..."}
              className="w-full pl-14 pr-6 py-6 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-blue-50 focus:border-[#002B5B] transition-all text-lg font-semibold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute left-6 top-7 text-slate-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </span>
          </div>

          {mode === 'talent' && (
            <div className="md:w-64">
              <select 
                className="w-full h-full px-6 py-6 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-blue-50 focus:border-[#002B5B] transition-all text-sm font-bold text-slate-600 appearance-none"
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
              >
                <option value="">All Countries</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="flex justify-between items-center mb-10 border-b border-slate-100 pb-6">
          <h3 className="text-2xl font-bold text-slate-900">{mode === 'talent' ? 'Available Talent' : 'Latest Opportunities'}</h3>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{mode === 'talent' ? scoredCvs.length : scoredJobs.length} Stock Found</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mode === 'talent' ? (
            scoredCvs.map(cv => (
              <div key={cv.id} className="mart-card p-8 rounded-2xl flex flex-col h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xl uppercase overflow-hidden">
                    {cv.photoUrl ? <img src={cv.photoUrl} className="w-full h-full object-cover" /> : cv.fullName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 leading-tight">{cv.fullName}</h4>
                    <p className="text-sm font-semibold text-[#002B5B] mt-0.5">{cv.jobTitle}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {cv.skills.slice(0, 3).map((s, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[11px] font-bold uppercase tracking-tight border border-slate-100">{s}</span>
                  ))}
                </div>
                
                <p className="text-sm text-slate-500 leading-relaxed mb-8 line-clamp-3">{cv.summary}</p>
                
                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                    {[cv.city, cv.country].filter(Boolean).join(', ') || (cv.location || 'Global')}
                  </span>
                  <Link to={`/cv/${cv.id}`} className="px-6 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#002B5B] transition shadow-sm">Inspect</Link>
                </div>
              </div>
            ))
          ) : (
            scoredJobs.map(job => (
              <div key={job.id} className="mart-card p-8 rounded-2xl flex flex-col h-full">
                <div className="mb-6">
                  <h4 className="text-xl font-bold text-slate-900 leading-tight mb-2">{job.title}</h4>
                  <p className="text-sm font-semibold text-[#002B5B]">{job.companyName}</p>
                </div>
                
                <div className="flex gap-2 mb-6">
                  <span className="px-3 py-1 bg-blue-50 text-[#002B5B] rounded-lg text-[10px] font-bold uppercase tracking-tighter">{job.type}</span>
                  <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-tighter">{job.salaryRange}</span>
                </div>
                
                <p className="text-sm text-slate-500 leading-relaxed mb-8 line-clamp-3 flex-grow">{job.description}</p>
                
                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                    {job.location}
                  </span>
                  <Link to={`/jobs/${job.id}`} className="px-6 py-2 bg-[#002B5B] text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-900 transition shadow-sm">Details</Link>
                </div>
              </div>
            ))
          )}

          {(mode === 'talent' ? scoredCvs : scoredJobs).length === 0 && (
            <div className="col-span-full py-32 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white">
              <p className="text-slate-300 text-3xl font-bold mb-2">No Matching Items</p>
              <p className="text-sm text-slate-400 font-medium">Try adjusting your search filters to find more talent or jobs.</p>
            </div>
          )}
        </div>
      </section>

      {!user && (
        <section className="bg-white rounded-3xl p-12 md:p-20 text-center border border-slate-200 shadow-sm">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Access the Full Mart Experience</h2>
            <p className="text-slate-500 mb-10 text-lg leading-relaxed font-medium">Join our global professional community to unlock direct inquiries, save listings, and create a high-impact profile.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="px-10 py-4 bg-[#002B5B] text-white rounded-xl font-bold uppercase tracking-wider hover:bg-[#001f42] transition shadow-md">Join Now</Link>
              <Link to="/login" className="px-10 py-4 bg-white text-slate-900 border border-slate-200 rounded-xl font-bold uppercase tracking-wider hover:border-[#002B5B] transition">Sign In</Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default App;
