
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../lib/mockDb';
import { CV, Message, User } from '../types';
import { useAppContext } from '../App';

const SeekerDashboard: React.FC = () => {
  const { user } = useAppContext();
  const [cvs, setCvs] = useState<CV[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      setCvs(db.getCVS().filter(cv => cv.userId === user.id));
      const messages = db.getMessages();
      setUnreadCount(messages.filter(m => m.receiverId === user.id && !m.read).length);
    }
  }, [user]);

  return (
    <div className="space-y-12 py-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-stone-900 tracking-tight mb-2">My Careers</h1>
          <p className="text-[10px] text-stone-400 uppercase tracking-[0.3em] font-bold">Manage your professional identities and inquiries.</p>
        </div>
        <div className="flex gap-4">
          <Link to="/messages" className="px-8 py-4 bg-white border border-stone-100 rounded-2xl font-black text-[10px] uppercase tracking-widest text-stone-500 shadow-sm hover:shadow-lg transition relative">
            Inquiries
            {unreadCount > 0 && <span className="absolute -top-2 -right-2 bg-orange-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black">{unreadCount}</span>}
          </Link>
          <Link to="/builder" className="px-8 py-4 bg-stone-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-stone-100 hover:bg-orange-700 transition">+ New Profile</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {cvs.map(cv => (
          <div key={cv.id} className="bg-white p-10 rounded-[2.5rem] border border-stone-100 shadow-sm hover:shadow-2xl hover:border-orange-200 transition-all group flex flex-col">
            <div className="flex justify-between items-start mb-8">
              <div className="w-20 h-20 rounded-2xl bg-stone-50 overflow-hidden shadow-inner border border-stone-100">
                {cv.photoUrl ? (
                  <img src={cv.photoUrl} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-200 text-2xl font-black">{cv.fullName.charAt(0)}</div>
                )}
              </div>
              <div className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${cv.visibility === 'PUBLIC' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-stone-50 text-stone-400 border-stone-100'}`}>{cv.visibility}</div>
            </div>
            <h3 className="text-xl font-black text-stone-900 mb-1 group-hover:text-orange-700 transition leading-tight">{cv.jobTitle || 'New Draft'}</h3>
            <p className="text-[10px] text-stone-300 font-bold uppercase tracking-widest mb-10">Updated {new Date(cv.updatedAt).toLocaleDateString()}</p>
            <div className="grid grid-cols-2 gap-4 mt-auto pt-8 border-t border-stone-50">
              <Link to={`/builder/${cv.id}`} className="py-3 text-center text-[10px] font-black uppercase bg-[#fafaf9] text-stone-400 rounded-xl hover:bg-stone-100 transition border border-stone-100">Edit</Link>
              <Link to={`/cv/${cv.id}`} className="py-3 text-center text-[10px] font-black uppercase bg-stone-900 text-white rounded-xl shadow-lg shadow-stone-100 hover:bg-orange-700 transition">View</Link>
            </div>
          </div>
        ))}
        {cvs.length === 0 && (
          <div className="col-span-full py-40 text-center border-4 border-dashed border-stone-100 rounded-[3rem] bg-white/50">
             <p className="text-stone-300 font-black uppercase tracking-[0.3em] text-2xl italic opacity-20 mb-6">No Profiles</p>
             <Link to="/builder" className="text-orange-700 font-black text-[10px] uppercase tracking-widest hover:underline">Launch your first identity &rarr;</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeekerDashboard;
