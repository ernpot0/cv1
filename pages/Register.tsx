import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../lib/mockDb';
import { UserRole } from '../types';
import { useAppContext } from '../App';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: UserRole.JOB_SEEKER
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useAppContext();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const users = db.getUsers();
    if (users.find(u => u.email === formData.email)) {
      setError('Identity already registered.');
      return;
    }
    const newUser = { id: Math.random().toString(36).substr(2, 9), ...formData };
    db.saveUsers([...users, newUser]);
    setUser(newUser);
    navigate('/');
  };

  return (
    <div className="max-w-xl mx-auto mt-16 mb-24 px-4">
      <div className="bg-white p-12 rounded-3xl shadow-xl border border-slate-200">
        <div className="text-center mb-12">
           <div className="flex justify-center items-baseline text-4xl font-extrabold tracking-tight mb-4">
             <span className="text-emerald-600">CV</span>
             <span className="text-slate-400 lowercase">s</span>
             <span className="text-emerald-600 lowercase">tall</span>
           </div>
           <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create Member Account</h2>
           <p className="text-slate-400 mt-2 text-sm font-medium uppercase tracking-widest">Join the professional mart</p>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border border-red-100 text-red-700 px-6 py-4 rounded-xl text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({...formData, role: UserRole.JOB_SEEKER})}
              className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.role === UserRole.JOB_SEEKER ? 'border-emerald-600 bg-emerald-50' : 'border-slate-50 bg-slate-50 hover:border-slate-200'}`}
            >
              <span className={`text-xs font-bold uppercase tracking-widest ${formData.role === UserRole.JOB_SEEKER ? 'text-emerald-600' : 'text-slate-400'}`}>The Talent</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, role: UserRole.EMPLOYER})}
              className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.role === UserRole.EMPLOYER ? 'border-emerald-600 bg-emerald-50' : 'border-slate-50 bg-slate-50 hover:border-slate-200'}`}
            >
              <span className={`text-xs font-bold uppercase tracking-widest ${formData.role === UserRole.EMPLOYER ? 'text-emerald-600' : 'text-slate-400'}`}>The Recruiter</span>
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Full Legal Name</label>
              <input 
                type="text" 
                required
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-600 outline-none font-medium"
                placeholder="Julian Stall"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Work Email</label>
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-600 outline-none font-medium"
                placeholder="name@email.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Password</label>
              <input 
                type="password" 
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-600 outline-none font-medium"
                placeholder="Create secure key"
              />
            </div>
          </div>
          
          <button 
            type="submit"
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-emerald-600 transition shadow-lg mt-4"
          >
            Initialize Account
          </button>
        </form>

        <p className="mt-10 text-center text-sm font-medium text-slate-400 pt-8 border-t border-slate-50">
          Member already? <Link to="/login" className="text-emerald-600 font-bold hover:underline">Sign In Here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;