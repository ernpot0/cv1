
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../lib/mockDb';
import { JobPost, Message } from '../types';
import { useAppContext } from '../App';

const JobView: React.FC = () => {
  const { jobId } = useParams();
  const { user } = useAppContext();
  const [job, setJob] = useState<JobPost | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [msgContent, setMsgContent] = useState('');

  useEffect(() => {
    if (jobId) {
      const found = db.getJobPosts().find(j => j.id === jobId);
      if (found) setJob(found);
    }
  }, [jobId]);

  const sendApplication = () => {
    if (!msgContent.trim() || !user || !job) return;
    const msgs = db.getMessages();
    const newMsg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: user.id,
      receiverId: job.employerId,
      content: `APPLICATION FOR ${job.title.toUpperCase()}:\n\n${msgContent}`,
      timestamp: Date.now(),
      read: false
    };
    db.saveMessages([...msgs, newMsg]);
    alert('Your application has been sent to the employer!');
    setShowApplyModal(false);
  };

  if (!job) return <div className="p-20 text-center font-black text-slate-300 uppercase">Opportunity Not Found</div>;

  return (
    <div className="max-w-4xl mx-auto py-20 px-4">
      <nav className="mb-12 no-print">
        <Link to="/" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition flex items-center gap-2">
          <span>&larr;</span> Back to Jobs Market
        </Link>
      </nav>

      <div className="bg-white rounded-[4rem] border shadow-2xl overflow-hidden relative">
        <div className="h-4" style={{ backgroundColor: job.themeColor }}></div>
        
        <div className="p-16">
          <header className="mb-16">
            <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-tight mb-6">{job.title}</h1>
            <div className="flex flex-wrap gap-8">
               <div className="flex flex-col">
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Company</span>
                 <span className="text-sm font-bold text-slate-800">{job.companyName}</span>
               </div>
               <div className="flex flex-col">
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Location</span>
                 <span className="text-sm font-bold text-slate-800">{job.location}</span>
               </div>
               <div className="flex flex-col">
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Salary</span>
                 <span className="text-sm font-bold text-slate-800">{job.salaryRange || 'Market Rate'}</span>
               </div>
               <div className="flex flex-col">
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Type</span>
                 <span className="text-sm font-bold text-indigo-600">{job.type}</span>
               </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2 space-y-12">
               <section>
                 <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-6">About the role</h3>
                 <p className="text-base text-slate-600 leading-loose whitespace-pre-line">{job.description}</p>
               </section>
            </div>

            <div className="space-y-12">
               <section>
                 <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-6">Requirements</h3>
                 <ul className="space-y-4">
                   {job.requirements.map((req, i) => (
                     <li key={i} className="flex items-start gap-3">
                       <div className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: job.themeColor }}></div>
                       <span className="text-sm font-bold text-slate-700">{req}</span>
                     </li>
                   ))}
                 </ul>
               </section>

               <div className="pt-10 border-t border-slate-100 no-print">
                 {!user || user.role === 'JOB_SEEKER' ? (
                   <button 
                     onClick={() => user ? setShowApplyModal(true) : alert('Please sign in as a job seeker to apply.')}
                     className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition"
                   >
                     Apply for this position
                   </button>
                 ) : (
                   <p className="text-[10px] font-black uppercase text-slate-300 text-center">Viewing as employer</p>
                 )}
               </div>
            </div>
          </div>
        </div>
      </div>

      {showApplyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[3rem] p-12 max-w-lg w-full shadow-2xl border">
            <h3 className="text-2xl font-black mb-1 uppercase tracking-tight">Apply for Role</h3>
            <p className="text-xs text-slate-400 mb-10 uppercase tracking-widest font-bold">Introduce yourself to {job.companyName}</p>
            <textarea 
              className="w-full p-6 border-2 border-slate-50 rounded-3xl h-48 mb-10 outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 resize-none text-sm font-medium"
              placeholder="Tell them why you're a great fit for this position..."
              value={msgContent}
              onChange={e => setMsgContent(e.target.value)}
            />
            <div className="flex gap-4">
               <button onClick={() => setShowApplyModal(false)} className="flex-1 py-4 text-xs font-black uppercase text-slate-400">Cancel</button>
               <button onClick={sendApplication} className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Submit Application</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobView;
