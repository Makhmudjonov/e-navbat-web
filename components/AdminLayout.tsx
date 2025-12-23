
import React, { useState, useContext, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Layers, GraduationCap, LogOut, 
  Building2, QrCode, Menu, X, Search, ChevronRight, Shield
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import DashboardHome from '../pages/admin/Dashboard';
import Faculties from '../pages/admin/Faculties';
import Students from '../pages/admin/Students';
import Queues from '../pages/admin/Queues';
import Buildings from '../pages/admin/Buildings';
import AdminScanner from '../pages/admin/Scanner';
import AdminProfile from '../pages/admin/Profile';
import AdminQueueDetail from '../pages/admin/AdminQueueDetail';

const AdminLayout: React.FC = () => {
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
    { path: '/admin', icon: LayoutDashboard, label: 'Asosiy panel' },
    { path: '/admin/scanner', icon: QrCode, label: 'QR Skaner' },
    { path: '/admin/queues', icon: Layers, label: 'Navbatlar' },
    { path: '/admin/buildings', icon: Building2, label: 'O\'quv binolari' },
    { path: '/admin/faculties', icon: GraduationCap, label: 'Fakultetlar' },
    { path: '/admin/students', icon: Users, label: 'Talabalar bazasi' },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-navy-950 transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm z-[55] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-[60] transition-all duration-300 transform ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 w-0 lg:w-20'} bg-white dark:bg-navy-900 border-r border-slate-200 dark:border-white/5 flex flex-col overflow-hidden shadow-2xl lg:shadow-none`}>
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
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'}`}
              >
                <item.icon size={18} className={isActive ? 'text-white' : 'group-hover:text-blue-500'} />
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
      <div className={`flex-1 min-w-0 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} flex flex-col min-h-screen relative`}>
        {/* Header */}
        <header className="h-16 bg-white/80 dark:bg-navy-950/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 sticky top-0 z-50 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-all"
            >
              <Menu size={20} />
            </button>
            <div className="hidden md:flex relative group">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Qidirish..." 
                className="bg-slate-100 dark:bg-navy-900/50 border-none rounded-lg pl-9 pr-4 py-1.5 text-[11px] outline-none w-48 lg:w-64 focus:ring-1 focus:ring-blue-500 transition-all dark:text-white font-bold"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <ThemeToggle />
            <div 
              className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
              onClick={() => navigate('/admin/profile')}
            >
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-slate-900 dark:text-white leading-none uppercase max-w-[120px] truncate">{user?.fullName}</p>
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">Administrator</p>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white rounded-xl flex items-center justify-center font-black text-xs border border-slate-200 dark:border-white/10 group-hover:scale-105 transition-transform">
                {user?.fullName?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-10 min-w-0 overflow-x-hidden">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/scanner" element={<AdminScanner />} />
            <Route path="/buildings" element={<Buildings />} />
            <Route path="/faculties" element={<Faculties />} />
            <Route path="/students" element={<Students />} />
            <Route path="/queues" element={<Queues />} />
            <Route path="/queues/:id" element={<AdminQueueDetail />} />
            <Route path="/profile" element={<AdminProfile />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
