
import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { User as UserIcon, GraduationCap, Phone, Shield, Hash, LogOut, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentProfile: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-hemis-accent to-hemis-primary opacity-90"></div>
        <div className="px-10 pb-10 relative">
          <div className="absolute -top-16 left-10">
            <div className="w-32 h-32 bg-white rounded-3xl shadow-xl p-1.5 border border-gray-50">
               <div className="w-full h-full bg-hemis-accent rounded-2xl flex items-center justify-center text-white font-heading text-4xl shadow-inner">
                  {user?.fullName?.charAt(0)}
               </div>
            </div>
          </div>
          
          <div className="pt-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-heading text-gray-900 tracking-tight">{user?.fullName}</h2>
              <p className="text-sm font-black text-hemis-accent uppercase tracking-widest mt-1">Talaba • {user?.course}-kurs</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-8">
            <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-3">
               <UserIcon size={20} className="text-hemis-accent" /> Shaxsiy Ma'lumotlar
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-hemis-primary border border-gray-100"><Hash size={20}/></div>
                  <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Talaba ID (Hemis)</p>
                     <p className="text-sm font-bold text-gray-800">{user?.hemisId}</p>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-hemis-primary border border-gray-100"><GraduationCap size={20}/></div>
                  <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Fakultet</p>
                     <p className="text-sm font-bold text-gray-800 truncate max-w-[150px]">{user?.facultet?.name || '---'}</p>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-hemis-primary border border-gray-100"><Phone size={20}/></div>
                  <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Telefon raqami</p>
                     <p className="text-sm font-bold text-gray-800">{user?.phoneNumber || 'Kiritilmagan'}</p>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-hemis-primary border border-gray-100"><BookOpen size={20}/></div>
                  <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Kurs</p>
                     <p className="text-sm font-bold text-gray-800">{user?.course}-kurs</p>
                  </div>
               </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
            <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-3">
               <Shield size={20} className="text-hemis-accent" /> Xavfsizlik
            </h3>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">Hisobingiz xavfsizligini ta'minlash uchun parolingizni hech kimga bermang.</p>
            <button className="w-full py-4 bg-hemis-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-hemis-primary/20 hover:bg-hemis-dark transition-all">
               Parolni o'zgartirish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
