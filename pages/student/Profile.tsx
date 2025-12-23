
import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { 
  GraduationCap, Phone, Shield, Hash, LogOut, 
  BookOpen, Calendar, MapPin, Zap,
  Clock, CreditCard, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentProfile: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Interactive ID Card Profile */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden group">
        <div className="h-32 bg-indigo-600 relative overflow-hidden transition-all duration-700">
           <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:24px_24px]"></div>
           <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl transition-transform duration-1000 group-hover:scale-110"></div>
        </div>
        <div className="px-8 pb-10 relative">
          <div className="absolute -top-12 left-8">
            <div className="w-28 h-28 bg-white dark:bg-navy-900 rounded-2xl shadow-xl p-2 border border-slate-100 dark:border-white/10 relative">
               <div className="w-full h-full bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-black text-5xl shadow-inner uppercase tracking-tighter overflow-hidden">
                  <span className="relative z-10">{user?.fullName?.charAt(0)}</span>
               </div>
               <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 border-4 border-white dark:border-navy-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <Shield size={14} fill="currentColor" />
               </div>
            </div>
          </div>
          
          <div className="pt-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase">{user?.fullName}</h2>
              <div className="flex flex-wrap items-center gap-2">
                 <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.15em] flex items-center gap-1.5 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">
                    <GraduationCap size={14} /> {user?.course}-kurs Talaba
                 </span>
                 <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.15em] flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Faol
                 </span>
              </div>
            </div>
            <button 
              onClick={() => { logout(); navigate('/login'); }}
              className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-rose-500/20 transition-all active:scale-95"
            >
              <LogOut size={16} /> Tizimdan chiqish
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Details */}
        <div className="bg-white dark:bg-navy-900 p-8 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-8">
          <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-3 uppercase tracking-[0.15em] leading-none border-b dark:border-white/5 pb-6">
             <CreditCard size={18} className="text-indigo-600" /> Shaxsiy ma'lumotlar
          </h3>
          <div className="space-y-6">
               <div className="flex items-center gap-5 group">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-navy-950/50 rounded-xl flex items-center justify-center text-indigo-600 border border-slate-200 dark:border-white/5 shadow-inner transition-all group-hover:bg-indigo-600 group-hover:text-white"><MapPin size={22}/></div>
                  <div className="min-w-0 flex-1">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Fakultet / Yo'nalish</p>
                     <p className="text-sm font-black text-slate-800 dark:text-slate-100 leading-tight truncate">{user?.facultet?.name || 'Kiritilmagan'}</p>
                  </div>
               </div>
               <div className="flex items-center gap-5 group">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-navy-950/50 rounded-xl flex items-center justify-center text-indigo-600 border border-slate-200 dark:border-white/5 shadow-inner transition-all group-hover:bg-indigo-600 group-hover:text-white"><Hash size={22}/></div>
                  <div className="min-w-0 flex-1">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">HEMIS ID</p>
                     <p className="text-sm font-black font-mono text-slate-800 dark:text-slate-100 tracking-wider">{user?.hemisId || '---'}</p>
                  </div>
               </div>
               <div className="flex items-center gap-5 group">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-navy-950/50 rounded-xl flex items-center justify-center text-indigo-600 border border-slate-200 dark:border-white/5 shadow-inner transition-all group-hover:bg-indigo-600 group-hover:text-white"><Phone size={22}/></div>
                  <div className="min-w-0 flex-1">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Telefon</p>
                     <p className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight">{user?.phoneNumber || 'Kiritilmagan'}</p>
                  </div>
               </div>
          </div>
        </div>

        {/* System Settings & Activity */}
        <div className="bg-white dark:bg-navy-900 p-8 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-8">
          <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-3 uppercase tracking-[0.15em] leading-none border-b dark:border-white/5 pb-6">
             <ShieldCheck size={18} className="text-indigo-600" /> Xavfsizlik
          </h3>
          <div className="bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 p-5 rounded-xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-2 opacity-10"><Zap size={32} className="text-indigo-600" /></div>
             <p className="text-[10px] text-indigo-900/80 dark:text-indigo-400 font-bold leading-relaxed italic relative z-10">
                Sizning harakatlaringiz tizimda qayd etiladi. Login va parolni begonalarga bermang.
             </p>
          </div>
          <div className="space-y-4 pt-4">
             <button className="w-full py-4 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/10 hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2">
                <Shield size={16} /> Parolni yangilash
             </button>
             <div className="flex flex-col items-center gap-3">
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Oxirgi kirish</p>
                <div className="flex items-center gap-4 text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                   <span className="flex items-center gap-1.5"><Calendar size={14}/> {new Date().toLocaleDateString()}</span>
                   <span className="flex items-center gap-1.5"><Clock size={14}/> {new Date().toLocaleTimeString()}</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
