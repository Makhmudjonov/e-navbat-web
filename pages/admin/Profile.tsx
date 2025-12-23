
import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { User as UserIcon, Shield, Calendar, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminProfile: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="h-32 bg-primary"></div>
        <div className="px-10 pb-10 relative">
          <div className="absolute -top-16 left-10">
            <div className="w-32 h-32 bg-white dark:bg-slate-800 rounded-xl shadow-xl p-1.5 border border-slate-100 dark:border-slate-700">
               <div className="w-full h-full bg-primary rounded flex items-center justify-center text-white font-bold text-4xl shadow-inner uppercase">
                  {user?.fullName?.charAt(0)}
               </div>
            </div>
          </div>
          
          <div className="pt-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{user?.fullName}</h2>
              <p className="text-xs font-black text-primary uppercase tracking-widest mt-1">Tizim Administratori</p>
            </div>
            <button 
              onClick={() => { logout(); navigate('/login'); }}
              className="px-6 py-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all border border-red-100 dark:border-red-900/30"
            >
              <LogOut size={16} /> Chiqish
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-3 uppercase tracking-wider">
             <Shield size={18} className="text-primary" /> Hisob ma'lumotlari
          </h3>
          <div className="space-y-4">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-700"><UserIcon size={20}/></div>
                <div className="min-w-0 flex-1">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Foydalanuvchi nomi</p>
                   <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{user?.username || 'admin'}</p>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-700"><Calendar size={20}/></div>
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tizimdagi rol</p>
                   <p className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase">Administrator</p>
                </div>
             </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-3 uppercase tracking-wider">
             <Shield size={18} className="text-primary" /> Xavfsizlik
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Administrator huquqlari bilan tizimning barcha bo'limlariga kirish ruxsati mavjud. Shaxsiy kalitlarni maxfiy saqlang.</p>
          <button className="w-full py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-lg font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-black dark:hover:bg-slate-700 transition-all">
             Parolni yangilash
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
