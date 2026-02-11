
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../lib/mockDb';
import { CV, Message, SavedCandidate, JobPost } from '../types';
import { useAppContext } from '../App';

const EmployerDashboard: React.FC = () => {
  const { user } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'search' | 'saved' | 'jobs'>('search');
  const [results, setResults] = useState<CV[]>([]);
  const [savedItems, setSavedItems] = useState<CV[]>([]);
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const all = db.getCVS();
    const visible = all.filter(cv => db.canViewCV(cv, user));
    
    setResults(visible.filter(cv => 
      cv.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cv.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
      cv.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    ));

    if (user) {
      const savedIds = db.getSavedCandidates().filter(s => s.employerId === user.id).map(s => s.cvId);
      setSavedItems(all.filter(cv => savedIds.includes(cv.id)));
      
      const messages = db.getMessages();
      setUnreadCount(messages.filter(m => m.receiverId === user.id && !m.read).length);

      const allJobs = db.getJobPosts();
      setJobPosts(allJobs.filter(j => j.employerId === user.id));
    }
  }, [searchTerm, user, activeTab]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 py-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Workspace</h1>
          <p className="text-sm text-slate-500 uppercase tracking-widest font-bold">Manage your hiring pipeline and job advertisements.</p>
        </div>
        <div className="flex gap-4">
          <Link to="/messages" className="px-8 py-4 bg-white border-2 border-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 shadow-sm hover:shadow-lg transition relative">
            Messages
            {unreadCount > 0 && <span className="absolute -top-2 -right-2 bg-indigo-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[8px] animate-bounce">{unreadCount}</span>}
          </Link>
          <Link to="/job-builder" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 hover:translate-y-[-2px] transition-transform">Post New Job</Link>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 relative group">
          <input 
            className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-50 rounded-[2rem] shadow-xl shadow-slate-100 outline-none focus:border-indigo-500 transition-all text-lg font-bold"
            placeholder="Search candidates or jobs..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-6 top-6 text-3xl opacity-20 group-focus-within:opacity-100 transition">🔍</span>
        </div>
        
        <div className="flex bg-white p-2 rounded-[2rem] border shadow-sm overflow-x-auto no-scrollbar">
           <button onClick={() => setActiveTab('search')} className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition whitespace-nowrap ${activeTab === 'search' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>Talent Market ({results.length})</button>
           <button onClick={() => setActiveTab('saved')} className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition whitespace-nowrap ${activeTab === 'saved' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>Saved ({savedItems.length})</button>
           <button onClick={() => setActiveTab('jobs')} className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition whitespace-nowrap ${activeTab === 'jobs' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>My Job Ads ({jobPosts.length})</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {activeTab === 'jobs' ? (
          jobPosts.map(job => (
            <div key={job.id} className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-sm hover:shadow-2xl transition-all group relative">
               <div className="flex justify-between items-start mb-6">
                  <div className="border-l-4 pl-4" style={{ borderLeftColor: job.themeColor }}>
                    <h3 className="text-xl font-black text-slate-900">{job.title}</h3>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">{job.location}</p>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${job.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}>{job.status}</span>
               </div>
               <div className="flex gap-4 mb-6">
                  <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg">{job.type}</span>
                  <span className="text-[10px] font-black bg-slate-50 text-slate-400 px-3 py-1 rounded-lg">{job.salaryRange}</span>
               </div>
               <div className="flex gap-3 pt-6 border-t border-slate-50">
                  <Link to={`/job-builder/${job.id}`} className="flex-1 py-3 bg-slate-50 text-slate-400 text-center rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition">Edit Post</Link>
                  <Link to={`/jobs/${job.id}`} className="flex-1 py-3 bg-slate-900 text-white text-center rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition shadow-lg">View Live</Link>
               </div>
            </div>
          ))
        ) : (
          (activeTab === 'search' ? results : savedItems).map(cv => (
            <div key={cv.id} className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-2xl font-black uppercase overflow-hidden shadow-inner">
                      {cv.photoUrl ? <img src={cv.photoUrl} className="w-full h-full object-cover" /> : cv.fullName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition">{cv.fullName}</h3>
                      <p className="text-xs font-black uppercase tracking-widest text-indigo-500">{cv.jobTitle}</p>
                    </div>
                 </div>
                 <div className="text-[10px] font-black uppercase tracking-widest text-slate-300">Updated {new Date(cv.updatedAt).toLocaleDateString()}</div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                 {cv.skills.slice(0, 4).map((s, i) => (
                   <span key={i} className="px-3 py-1.5 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase border border-slate-100">{s}</span>
                 ))}
                 {cv.skills.length > 4 && <span className="text-[10px] text-slate-300 font-bold self-center">+{cv.skills.length - 4} more</span>}
              </div>

              <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-2 mb-8 italic">"{cv.summary || 'Expert professional with a focus on delivering high-quality results.'}"</p>

              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                   <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                   {cv.location || 'Remote'}
                 </span>
                 <Link to={`/cv/${cv.id}`} className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors shadow-xl shadow-slate-100">Full Profile</Link>
              </div>
            </div>
          ))
        )}
        
        {((activeTab === 'jobs' ? jobPosts : (activeTab === 'search' ? results : savedItems)).length === 0) && (
          <div className="col-span-full py-32 text-center border-4 border-dashed border-slate-50 rounded-[4rem]">
             <div className="text-slate-200 text-6xl mb-4 italic font-black uppercase">Emply</div>
             <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Start building your pipeline today.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerDashboard;
