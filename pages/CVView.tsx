
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../lib/mockDb';
import { CV, UserRole, Message, SavedCandidate } from '../types';
import { useAppContext } from '../App';
import { CVPreview } from '../components/CVPreview';

const CVView: React.FC = () => {
  const { cvId } = useParams();
  const { user } = useAppContext();
  const navigate = useNavigate();
  const [cv, setCv] = useState<CV | null>(null);
  const [isAllowed, setIsAllowed] = useState(false);
  const [showModal, setShowModal] = useState<'contact' | 'auth_prompt' | null>(null);
  const [msgContent, setMsgContent] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (cvId) {
      const all = db.getCVS();
      const found = all.find(c => c.id === cvId);
      if (found) {
        setCv(found);
        setIsAllowed(db.canViewCV(found, user));
        
        if (user && user.role === UserRole.EMPLOYER) {
          const saved = db.getSavedCandidates();
          setIsSaved(saved.some(s => s.employerId === user.id && s.cvId === cvId));
        }
      }
    }
  }, [cvId, user]);

  const handleRestrictedAction = (action: () => void) => {
    if (!user) {
      setShowModal('auth_prompt');
    } else {
      action();
    }
  };

  const toggleSave = () => {
    if (user && user.role !== UserRole.EMPLOYER) {
      alert('Only employers can save candidates.');
      return;
    }
    const saved = db.getSavedCandidates();
    if (isSaved) {
      db.saveSavedCandidates(saved.filter(s => !(s.employerId === user!.id && s.cvId === cvId)));
      setIsSaved(false);
    } else {
      db.saveSavedCandidates([...saved, { id: Math.random().toString(), employerId: user!.id, cvId: cvId!, timestamp: Date.now() }]);
      setIsSaved(true);
    }
  };

  const sendMessage = () => {
    if (!msgContent.trim()) return;
    const msgs = db.getMessages();
    const newMsg: Message = {
      id: Math.random().toString(),
      senderId: user!.id,
      receiverId: cv!.userId,
      content: msgContent,
      timestamp: Date.now(),
      read: false
    };
    db.saveMessages([...msgs, newMsg]);
    setMsgContent('');
    setShowModal(null);
    alert('Message sent successfully!');
  };

  if (!cv) return <div className="p-20 text-center font-bold text-slate-400 uppercase tracking-widest">Profile Not Found</div>;
  
  if (!isAllowed) return (
    <div className="max-w-md mx-auto mt-20 p-12 bg-white rounded-[3rem] shadow-2xl text-center border-2 border-slate-50">
      <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-amber-500 shadow-inner">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
      </div>
      <h2 className="text-2xl font-black mb-4 uppercase tracking-tighter text-slate-900">Restricted Profile</h2>
      <p className="text-sm text-slate-500 mb-10 font-medium leading-relaxed uppercase tracking-widest">The owner of this CV has set their visibility to private or employers only. Please sign in to verify access.</p>
      <div className="space-y-3">
        <Link to="/login" className="block w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Sign In to Platform</Link>
        <Link to="/" className="block w-full py-4 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-indigo-600 transition">Back to Marketplace</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      <nav className="max-w-[850px] mx-auto px-4 py-8 flex justify-between items-center no-print">
        <Link to="/" className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition flex items-center gap-2">
          <span>&larr;</span> Back to Market
        </Link>
        <div className="flex gap-3">
          {(!user || user.id !== cv.userId) && (
            <>
              <button 
                onClick={() => handleRestrictedAction(toggleSave)}
                className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isSaved ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-white text-slate-700 border border-slate-200 shadow-sm'}`}
              >
                {isSaved ? 'Saved' : 'Save'}
              </button>
              <button 
                onClick={() => handleRestrictedAction(() => setShowModal('contact'))}
                className="px-6 py-3 bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-indigo-600 transition"
              >
                Contact
              </button>
            </>
          )}
          <button onClick={() => window.print()} className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-100">Export PDF</button>
        </div>
      </nav>

      <div className="print:p-0">
        <CVPreview cv={cv} />
      </div>

      {/* Modals */}
      {showModal === 'contact' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl border">
            <h3 className="text-2xl font-black mb-1 uppercase tracking-tight">Contact {cv.fullName.split(' ')[0]}</h3>
            <p className="text-xs text-slate-400 mb-8 uppercase tracking-widest font-bold">Your inquiry will be sent to their dashboard.</p>
            <textarea 
              className="w-full p-5 border-2 border-slate-50 rounded-2xl h-44 mb-8 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none resize-none text-sm font-medium"
              placeholder="Hi, we are impressed by your profile and would love to connect regarding..."
              value={msgContent}
              onChange={e => setMsgContent(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowModal(null)} className="px-6 py-2 text-xs font-black uppercase text-slate-400">Cancel</button>
              <button onClick={sendMessage} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100">Send Message</button>
            </div>
          </div>
        </div>
      )}

      {showModal === 'auth_prompt' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600 font-black text-2xl uppercase">?</div>
            <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">Sign In Required</h3>
            <p className="text-sm text-slate-500 mb-10 font-medium leading-relaxed">To contact candidates or save profiles, you must be a registered member of ProCV.</p>
            <div className="space-y-3">
              <Link to="/register" className="block w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100">Join Platform Free</Link>
              <Link to="/login" className="block w-full py-4 text-slate-900 border-2 border-slate-50 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition">Already a member? Sign In</Link>
              <button onClick={() => setShowModal(null)} className="block w-full py-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CVView;
