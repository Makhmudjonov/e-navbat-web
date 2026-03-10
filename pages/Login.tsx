
// HEMIS Login Page
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { apiService } from '../services/api';
import { UserRole } from '../types';
import { User, Lock, ArrowRight, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let response;
      if (role === UserRole.ADMIN) {
        response = await apiService.loginAdmin(username, password);
      } else {
        response = await apiService.loginStudent(username, password);
      }
      login(response.user, response.token);
      navigate(role === UserRole.ADMIN ? '/admin' : '/student');
    } catch (error: any) {
      alert(error.message || 'Kirishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex flex-col items-center justify-center p-4 sm:p-6 font-sans transition-colors duration-500">
      {/* Decorative Blur Elements */}
      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 dark:bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/5 dark:bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-[400px] relative z-10">
        {/* Branding Section */}
        <div className="flex flex-col items-center mb-8 sm:mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse"></div>
            <img 
              src="https://jurnal.tashmeduni.uz/assets/logo-BTn80Xba.png" 
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain relative z-10 dark:brightness-110 drop-shadow-2xl" 
              alt="logo" 
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none text-center">
            Elektron <span className="text-blue-500">Navbat</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-3">Portalga kirish</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 dark:bg-navy-900/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-none border border-white dark:border-white/5 p-6 sm:p-10 animate-in fade-in zoom-in-95 duration-700 delay-100">
          
          {/* Role Switcher */}
          <div className="flex bg-slate-100/50 dark:bg-navy-950/50 p-1 rounded-2xl mb-8 border border-slate-200/50 dark:border-white/5">
            <button 
              type="button"
              onClick={() => setRole(UserRole.STUDENT)}
              className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${role === UserRole.STUDENT ? 'bg-white dark:bg-white/10 text-blue-500 dark:text-white shadow-sm ring-1 ring-slate-200/50 dark:ring-white/5' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >
              Talaba
            </button>
            <button 
              type="button"
              onClick={() => setRole(UserRole.ADMIN)}
              className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${role === UserRole.ADMIN ? 'bg-white dark:bg-white/10 text-blue-500 dark:text-white shadow-sm ring-1 ring-slate-200/50 dark:ring-white/5' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >
              Admin
            </button>
          </div>

          {role === UserRole.ADMIN ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="group">
                <div className="flex justify-between mb-2 px-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Admin ID</label>
                </div>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    className="w-full bg-slate-50 dark:bg-navy-950/50 border border-slate-200/50 dark:border-white/5 rounded-2xl pl-12 pr-4 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-300"
                    placeholder="Admin loginini kiriting"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="group">
                <div className="flex justify-between mb-2 px-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Parol</label>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="password"
                    className="w-full bg-slate-50 dark:bg-navy-950/50 border border-slate-200/50 dark:border-white/5 rounded-2xl pl-12 pr-4 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-300"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-5 sm:py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 transition-all active:scale-[0.97] flex items-center justify-center gap-3 disabled:opacity-70 mt-4 overflow-hidden group/btn"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    Tizimga kirish 
                    <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center px-4">
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                  Tizimga kirish uchun HEMIS platformasidan foydalaning.
                </p>
              </div>
              
              <button
                type="button"
                onClick={() => {
                  window.location.href = 'https://api-navbat.tashmeduni.uz/api/auth/student/hemis/login';
                }}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-5 sm:py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 transition-all active:scale-[0.97] flex items-center justify-center gap-3 overflow-hidden group/btn"
              >
                <img 
                  src="https://hemis.tashmeduni.uz/static/crop/6/9/320_320_90_693523311.jpg" 
                  className="w-6 h-6 rounded-full border border-white/20" 
                  alt="hemis" 
                  referrerPolicy="no-referrer"
                />
                HEMIS orqali kirish
                <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
              
              <div className="flex items-center gap-4 py-2">
                <div className="h-[1px] flex-1 bg-slate-200 dark:bg-white/5"></div>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Yoki</span>
                <div className="h-[1px] flex-1 bg-slate-200 dark:bg-white/5"></div>
              </div>
              
              <p className="text-[9px] text-center text-slate-400 dark:text-slate-500 font-medium">
                Muammo yuzaga kelsa, dekanatga murojaat qiling.
              </p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center animate-in fade-in duration-1000 delay-500">
           <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-60">© TDTU Elektron Navbat Tizimi</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
