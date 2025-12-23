
import React, { useState, useContext, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, User, LogOut, Menu, ChevronRight, 
  GraduationCap, X
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import StudentHome from '../pages/student/Dashboard';
import StudentProfile from '../pages/student/Profile';

const StudentLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/student', icon: LayoutDashboard, label: 'Asosiy panel' },
    { path: '/student/profile', icon: User, label: 'Profil' },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-navy-950 transition-colors duration-300">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm z-[55] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-[60] transition-all duration-300 transform ${isSidebarOpen ? 'translate-x-0 w-60' : '-translate-x-full lg:translate-x-0 w-0 lg:w-20'} bg-white dark:bg-navy-900 border-r border-slate-200 dark:border-white/5 flex flex-col overflow-hidden shadow-2xl lg:shadow-none`}>
        <div className="h-16 flex items-center justify-between px-5 shrink-0 border-b dark:border-white/5">
          <div className="flex items-center gap-3">
            <img src="https://jurnal.tashmeduni.uz/assets/logo-BTn80Xba.png" className="w-8 h-8 object-contain dark:brightness-125" alt="logo" />
            {(isSidebarOpen || window.innerWidth < 1024) && (
              <span className="font-black text-[12px] text-slate-900 dark:text-white tracking-tight truncate uppercase leading-tight">Elektron<br/>Navbat</span>
            )}
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-500 p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg">
            <X size={20}/>
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'}`}
              >
                <item.icon size={18} className={isActive ? 'text-white' : 'group-hover:text-indigo-500'} />
                {isSidebarOpen && <span className="text-[10px] font-black uppercase tracking-widest truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t dark:border-white/5 shrink-0">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut size={18} />
            {isSidebarOpen && <span className="text-[10px] font-black uppercase tracking-widest truncate">Chiqish</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 min-w-0 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-60' : 'lg:ml-20'} flex flex-col min-h-screen relative`}>
        {/* Header */}
        <header className="h-16 bg-white/80 dark:bg-navy-950/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 sticky top-0 z-50 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-all"
            >
              <Menu size={20} />
            </button>
            <div className="hidden xs:flex items-center gap-2 text-[9px] sm:text-[10px] font-black text-indigo-500 uppercase tracking-widest">
               TDTU <ChevronRight size={10} className="mx-1" /> {location.pathname === '/student' ? 'PANEL' : 'PROFIL'}
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <ThemeToggle />
            
            <div 
              className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
              onClick={() => navigate('/student/profile')}
            >
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-slate-900 dark:text-white leading-none uppercase truncate max-w-[150px]">{user?.fullName}</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Talaba</p>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center font-black text-xs border border-indigo-200/50 dark:border-indigo-500/20 group-hover:scale-105 transition-transform">
                {user?.fullName?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
          <Routes>
            <Route path="/" element={<StudentHome />} />
            <Route path="/profile" element={<StudentProfile />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
