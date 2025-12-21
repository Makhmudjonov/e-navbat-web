
import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { User as UserIcon, Shield, Mail, Calendar, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminProfile: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-hemis-primary to-hemis-dark"></div>
        <div className="px-10 pb-10 relative">
          <div className="absolute -top-16 left-10">
            <div className="w-32 h-32 bg-white rounded-3xl shadow-xl p-1.5">
               <div className="w-full h-full bg-hemis-primary rounded-2xl flex items-center justify-center text-white font-heading text-4xl shadow-inner">
                  {user?.fullName?.charAt(0)}
               </div>
            </div>
          </div>
          
          <div className="pt-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-heading text-gray-900 tracking-tight">{user?.fullName}</h2>
              <p className="text-sm font-black text-hemis-accent uppercase tracking-widest mt-1">Tizim Administratori</p>
            </div>
            <button 
              onClick={() => { logout(); navigate('/login'); }}
              className="px-6 py-3 bg-red-50 text-red-600 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-red-100 transition-all border border-red-100 shadow-sm"
            >
              <LogOut size={16} /> Chiqish
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-3">
             <Shield size={20} className="text-hemis-accent" /> Hisob Ma'lumotlari
          </h3>
          <div className="space-y-4">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 border border-gray-100"><UserIcon size={20}/></div>
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Login</p>
                   <p className="text-sm font-bold text-gray-800">{user?.username || 'admin'}</p>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 border border-gray-100"><Calendar size={20}/></div>
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ro'yxatdan o'tilgan</p>
                   <p className="text-sm font-bold text-gray-800">Yanvar 2024</p>
                </div>
             </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-3">
             <Shield size={20} className="text-hemis-accent" /> Xavfsizlik
          </h3>
          <p className="text-xs text-gray-500 font-medium leading-relaxed">Administrator huquqlari bilan tizimning barcha bo'limlariga kirish ruxsati mavjud. Parolni muntazam ravishda yangilab turish tavsiya etiladi.</p>
          <button className="w-full py-4 bg-gray-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-gray-200 hover:bg-black transition-all">
             Parolni o'zgartirish
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
