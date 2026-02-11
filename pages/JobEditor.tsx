
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GoogleGenAI } from '@google/genai';
import { db } from '../lib/mockDb';
import { JobPost, JobPostStatus } from '../types';
import { useAppContext } from '../App';

const JobEditor: React.FC = () => {
  const { jobId } = useParams();
  const { user } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'info'|'description'|'requirements'|'design'>('info');
  const [loadingAI, setLoadingAI] = useState<{ [key: string]: boolean }>({});
  const [newReq, setNewReq] = useState('');

  const [job, setJob] = useState<JobPost>({
    id: jobId || `job_${Math.random().toString(36).substr(2, 9)}`,
    employerId: user?.id || '',
    companyName: user?.fullName || '',
    title: '',
    location: '',
    type: 'Full-time',
    salaryRange: '',
    description: '',
    requirements: [],
    benefits: [],
    status: JobPostStatus.ACTIVE,
    updatedAt: Date.now(),
    themeColor: '#4f46e5'
  });

  useEffect(() => {
    if (jobId) {
      const existing = db.getJobPosts().find(j => j.id === jobId);
      if (existing) {
        if (existing.employerId !== user?.id) navigate('/dashboard/employer');
        else setJob(existing);
      }
    }
  }, [jobId, user]);

  const saveJob = () => {
    const allJobs = db.getJobPosts();
    const updated = { ...job, updatedAt: Date.now() };
    const idx = allJobs.findIndex(j => j.id === job.id);
    if (idx > -1) allJobs[idx] = updated;
    else allJobs.push(updated);
    db.saveJobPosts(allJobs);
    alert('Job advertisement saved successfully.');
    navigate('/dashboard/employer');
  };

  const addRequirement = () => {
    if (newReq.trim() && !job.requirements.includes(newReq.trim())) {
      setJob(prev => ({ ...prev, requirements: [...prev.requirements, newReq.trim()] }));
      setNewReq('');
    }
  };

  const removeRequirement = (req: string) => {
    setJob(prev => ({ ...prev, requirements: prev.requirements.filter(r => r !== req) }));
  };

  const aiPolish = async () => {
    if (!job.description || job.description.length < 5) {
      alert("Please provide a basic description for AI to polish.");
      return;
    }

    setLoadingAI({ polish: true });
    try {
      // Corrected: Initialization using the named apiKey parameter and direct environment variable
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Rewrite this job description for a ${job.title} role at ${job.companyName} to be more engaging, professional, and exciting for potential candidates. Use high-impact language: "${job.description}"`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      if (response.text) {
        setJob(prev => ({ ...prev, description: response.text.trim() }));
      }
    } catch (e) {
      console.error(e);
      alert('AI Polishing encountered an error.');
    } finally {
      setLoadingAI({ polish: false });
    }
  };

  const sectionLabel = (label: string) => (
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</label>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-12 min-h-[calc(100vh-10rem)] py-8">
      {/* Editor Column */}
      <div className="w-full lg:w-1/2 flex flex-col gap-6">
        <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Job Studio</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Create the perfect opportunity</p>
            </div>
            <button 
              onClick={saveJob}
              className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition transform active:scale-95 shadow-2xl shadow-indigo-100"
            >
              Publish Ad
            </button>
          </div>

          <div className="flex gap-2 mb-12 overflow-x-auto pb-4 no-scrollbar">
            {(['info', 'description', 'requirements', 'design'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-[10px] font-black rounded-full transition-all whitespace-nowrap ${activeTab === tab ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50 uppercase tracking-widest'}`}
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
                    {sectionLabel('Job Title')}
                    <input className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 font-bold" placeholder="Software Architect" value={job.title} onChange={e => setJob({...job, title: e.target.value})} />
                  </div>
                  <div>
                    {sectionLabel('Location')}
                    <input className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 font-bold" placeholder="San Francisco, CA" value={job.location} onChange={e => setJob({...job, location: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    {sectionLabel('Employment Type')}
                    <select className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 font-bold" value={job.type} onChange={e => setJob({...job, type: e.target.value as any})}>
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Contract</option>
                      <option>Remote</option>
                    </select>
                  </div>
                  <div>
                    {sectionLabel('Salary Range')}
                    <input className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 font-bold" placeholder="$120k - $160k" value={job.salaryRange} onChange={e => setJob({...job, salaryRange: e.target.value})} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'description' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex justify-between items-center">
                  {sectionLabel('Role Overview')}
                  <button onClick={aiPolish} disabled={loadingAI.polish} className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-800 disabled:opacity-50">
                    {loadingAI.polish ? '✨ Polishing...' : '✨ AI Polish'}
                  </button>
                </div>
                <textarea className="w-full p-6 bg-slate-50 border-2 border-slate-50 rounded-[2.5rem] h-72 outline-none focus:ring-4 focus:ring-indigo-50 resize-none leading-relaxed text-sm font-medium" placeholder="Describe the role, team, and impact..." value={job.description} onChange={e => setJob({...job, description: e.target.value})} />
              </div>
            )}

            {activeTab === 'requirements' && (
              <div className="space-y-10 animate-in fade-in duration-300">
                <div className="flex gap-4">
                  <input className="flex-grow p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-bold" placeholder="Add requirement (e.g. 5+ years React)..." value={newReq} onChange={e => setNewReq(e.target.value)} onKeyDown={e => e.key === 'Enter' && addRequirement()} />
                  <button onClick={addRequirement} className="px-10 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600">Add</button>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {job.requirements.map((req, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl group">
                      <span className="text-sm font-bold text-slate-700">{req}</span>
                      <button onClick={() => removeRequirement(req)} className="text-slate-300 hover:text-red-500">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'design' && (
              <div className="space-y-10 animate-in fade-in duration-300">
                <div>
                  {sectionLabel('Brand Identity Color')}
                  <div className="flex flex-wrap gap-4 mt-4">
                    {['#4f46e5', '#0f172a', '#dc2626', '#16a34a', '#7c3aed', '#db2777'].map(c => (
                      <button key={c} onClick={() => setJob({...job, themeColor: c})} className={`w-12 h-12 rounded-xl border-4 transition-all ${job.themeColor === c ? 'border-indigo-200 scale-110 shadow-lg' : 'border-white'}`} style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
                <div>
                  {sectionLabel('Post Visibility')}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <button onClick={() => setJob({...job, status: JobPostStatus.ACTIVE})} className={`p-6 rounded-2xl border-4 transition-all text-xs font-black uppercase tracking-widest ${job.status === JobPostStatus.ACTIVE ? 'bg-indigo-600 text-white border-indigo-100' : 'bg-white text-slate-400 border-slate-50'}`}>Active (Public)</button>
                    <button onClick={() => setJob({...job, status: JobPostStatus.CLOSED})} className={`p-6 rounded-2xl border-4 transition-all text-xs font-black uppercase tracking-widest ${job.status === JobPostStatus.CLOSED ? 'bg-slate-900 text-white border-slate-800' : 'bg-white text-slate-400 border-slate-50'}`}>Closed</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Column */}
      <div className="flex-1 bg-white rounded-[3.5rem] border-4 border-slate-50 shadow-2xl overflow-hidden h-[calc(100vh-10rem)] sticky top-24">
        <div className="h-full overflow-y-auto p-12 space-y-12">
           <header className="border-l-8 pl-8 py-4" style={{ borderLeftColor: job.themeColor }}>
             <h2 className="text-4xl font-black text-slate-900 leading-tight mb-2">{job.title || 'Untitled Role'}</h2>
             <div className="flex flex-wrap gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
               <span className="flex items-center gap-1"><span className="text-lg">🏢</span> {job.companyName}</span>
               <span className="flex items-center gap-1"><span className="text-lg">📍</span> {job.location || 'Location Pending'}</span>
               <span className="flex items-center gap-1"><span className="text-lg">💰</span> {job.salaryRange || 'TBD'}</span>
               <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg">{job.type}</span>
             </div>
           </header>

           <section>
             <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-300 mb-6">Description</h3>
             <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{job.description || 'Provide a description to see preview...'}</p>
           </section>

           <section>
             <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-300 mb-6">Requirements</h3>
             <div className="space-y-4">
               {job.requirements.map((req, idx) => (
                 <div key={idx} className="flex items-center gap-4">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: job.themeColor }}></div>
                   <span className="text-sm font-bold text-slate-700">{req}</span>
                 </div>
               ))}
               {job.requirements.length === 0 && <p className="text-xs text-slate-300 italic">No requirements added yet.</p>}
             </div>
           </section>
        </div>
      </div>
    </div>
  );
};

export default JobEditor;
