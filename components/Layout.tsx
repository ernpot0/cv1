import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../App';
import { UserRole } from '../types';
import { db } from '../lib/mockDb';

export const Layout: React.FC = () => {
  const { user, logout } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkMessages = () => {
      if (user) {
        const messages = db.getMessages();
        const count = messages.filter(m => m.receiverId === user.id && !m.read).length;
        setUnreadCount(count);
      }
    };
    checkMessages();
    const interval = setInterval(checkMessages, 3000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="sticky top-0 z-[60] bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Link to="/" className="flex items-center group">
                <div className="flex items-baseline text-3xl font-extrabold tracking-tight">
                  <span className="text-emerald-600">CV</span>
                  <span className="text-slate-400 lowercase">s</span>
                  <span className="text-emerald-600 lowercase">tall</span>
                </div>
              </Link>
              
              {user && (
                <div className="hidden md:ml-10 md:flex md:space-x-8">
                  <Link to={user.role === UserRole.JOB_SEEKER ? "/dashboard/seeker" : "/dashboard/employer"} 
                    className={`text-sm font-semibold transition-colors ${location.pathname.includes('dashboard') ? 'text-[#002B5B]' : 'text-slate-500 hover:text-slate-900'}`}>
                    Workspace
                  </Link>
                  <Link to={user.role === UserRole.JOB_SEEKER ? "/builder" : "/job-builder"} 
                    className={`text-sm font-semibold transition-colors ${location.pathname.includes('builder') ? 'text-[#002B5B]' : 'text-slate-500 hover:text-slate-900'}`}>
                    {user.role === UserRole.JOB_SEEKER ? 'The Studio' : 'Post Listing'}
                  </Link>
                  <Link to="/messages" 
                    className={`text-sm font-semibold transition-colors relative ${location.pathname.includes('messages') ? 'text-[#002B5B]' : 'text-slate-500 hover:text-slate-900'}`}>
                    Inquiries
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-4 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-6">
                {user ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-200">
                        {user.fullName.charAt(0)}
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{user.fullName}</span>
                    </div>
                    <button onClick={handleLogout} className="text-xs font-bold text-slate-400 hover:text-red-600 transition-colors uppercase tracking-wider">
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-slate-500 hover:text-slate-900 text-sm font-semibold">Sign In</Link>
                    <Link to="/register" className="bg-[#002B5B] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-[#001f42] transition shadow-md shadow-indigo-100">
                      Join Mart
                    </Link>
                  </>
                )}
              </div>

              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden bg-white border-b transition-all duration-300 ${isMenuOpen ? 'max-h-96' : 'max-h-0'} overflow-hidden`}>
          <div className="p-4 space-y-2">
            {!user ? (
              <>
                <Link to="/login" className="block p-3 text-slate-600 font-semibold rounded-lg hover:bg-slate-50">Sign In</Link>
                <Link to="/register" className="block p-3 bg-[#002B5B] text-white text-center font-bold rounded-lg shadow-md">Join Mart</Link>
              </>
            ) : (
              <>
                <Link to={user.role === UserRole.JOB_SEEKER ? "/dashboard/seeker" : "/dashboard/employer"} className="block p-3 text-slate-600 font-semibold rounded-lg hover:bg-slate-50">Workspace</Link>
                <Link to={user.role === UserRole.JOB_SEEKER ? "/builder" : "/job-builder"} className="block p-3 text-slate-600 font-semibold rounded-lg hover:bg-slate-50">{user.role === UserRole.JOB_SEEKER ? 'The Studio' : 'Post Listing'}</Link>
                <Link to="/messages" className="block p-3 text-slate-600 font-semibold rounded-lg hover:bg-slate-50">Inquiries</Link>
                <button onClick={handleLogout} className="w-full text-left p-3 text-red-500 font-semibold rounded-lg hover:bg-red-50">Sign Out</button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-slate-200 py-16 mt-20 no-print">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <Link to="/" className="flex items-baseline text-2xl font-extrabold tracking-tight mb-4">
              <span className="text-emerald-600">CV</span>
              <span className="text-slate-400 lowercase">s</span>
              <span className="text-emerald-600 lowercase">tall</span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed">The professional mart for discovery and elite career crafting.</p>
          </div>
          <div>
            <h4 className="text-slate-900 font-bold mb-4 uppercase text-xs tracking-widest">Navigation</h4>
            <div className="flex flex-col gap-2 text-slate-500 text-sm font-medium">
              <Link to="/" className="hover:text-emerald-600">Talent Mart</Link>
              <Link to="/" className="hover:text-emerald-600">Job Board</Link>
              <Link to="/register" className="hover:text-emerald-600">Join Platform</Link>
            </div>
          </div>
          <div>
            <h4 className="text-slate-900 font-bold mb-4 uppercase text-xs tracking-widest">Connect</h4>
            <p className="text-slate-500 text-sm mb-4">Quality professional networking established 2025.</p>
            <div className="flex gap-4 text-slate-400">
               <span className="hover:text-emerald-600 cursor-pointer">LinkedIn</span>
               <span className="hover:text-emerald-600 cursor-pointer">Twitter</span>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 pt-12 mt-12 border-t border-slate-100 text-center">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-[0.2em]">CVstall &copy; 2025 - All Professional Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
};