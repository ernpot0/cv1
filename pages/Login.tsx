import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../lib/mockDb';
import { useAppContext } from '../App';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useAppContext();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users = db.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setUser(user);
      navigate('/');
    } else {
      setError('Credentials did not match our records.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 mb-32 px-4">
      <div className="bg-white p-10 rounded-2xl shadow-xl border border-slate-200">
        <div className="text-center mb-10">
           <div className="flex justify-center items-baseline text-4xl font-extrabold tracking-tight mb-6">
             <span className="text-emerald-600">CV</span>
             <span className="text-slate-400 lowercase">s</span>
             <span className="text-emerald-600 lowercase">tall</span>
           </div>
           <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sign In</h2>
           <p className="text-slate-400 mt-2 text-sm font-medium">Welcome back to the Talent Mart</p>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border border-red-100 text-red-700 px-6 py-4 rounded-xl text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-emerald-600 transition-all outline-none font-medium"
              placeholder="name@email.com"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Password</label>
              <button type="button" className="text-xs font-bold text-emerald-600 hover:underline">Forgot?</button>
            </div>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-emerald-600 transition-all outline-none"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-[#002B5B] text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-slate-800 transition shadow-lg mt-4"
          >
            Authenticate
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-50 text-center">
          <p className="text-sm font-medium text-slate-400">
            No account yet? <Link to="/register" className="text-emerald-600 font-bold hover:underline">Join the Mart</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;