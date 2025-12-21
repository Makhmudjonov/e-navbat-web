
import React, { useState, useContext } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Layers, GraduationCap, LogOut, Building2, QrCode, Menu, X, Bell, User, ChevronDown } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import DashboardHome from '../pages/admin/Dashboard';
import Faculties from '../pages/admin/Faculties';
import Students from '../pages/admin/Students';
import Queues from '../pages/admin/Queues';
import Buildings from '../pages/admin/Buildings';
import AdminScanner from '../pages/admin/Scanner';
import AdminProfile from '../pages/admin/Profile';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin', icon: <LayoutDashboard size={18} />, label: 'Boshqaruv' },
    { path: '/admin/scanner', icon: <QrCode size={18} />, label: 'QR Skaner' },
    { path: '/admin/buildings', icon: <Building2 size={18} />, label: 'Binolar' },
    { path: '/admin/faculties', icon: <GraduationCap size={18} />, label: 'Fakultetlar' },
    { path: '/admin/queues', icon: <Layers size={18} />, label: 'Navbatlar' },
    { path: '/admin/students', icon: <Users size={18} />, label: 'Talabalar' },
    { path: '/admin/profile', icon: <User size={18} />, label: 'Profil' },
  ];

  return (
    <div className="min-h-screen flex bg-hemis-bg font-sans">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-hemis-dark sidebar-transition flex flex-col z-50 fixed lg:relative inset-y-0 shadow-2xl`}>
        <div className="h-14 flex items-center px-5 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <img src="https://tashmeduni.uz/web/wp-content/uploads/2025/08/tsmu_logo_200.png" alt="Logo" className="w-8 h-8 shrink-0" />
            {isSidebarOpen && <span className="font-heading text-white text-xs uppercase tracking-widest whitespace-nowrap">e-Navbat Admin</span>}
          </div>
        </div>

        <nav className="flex-1 py-6 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && item.path !== '/admin/profile' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-6 py-3.5 text-sm transition-all border-l-4 ${isActive ? 'bg-white/10 text-white border-hemis-accent' : 'text-gray-400 border-transparent hover:bg-white/5 hover:text-white'}`}
              >
                <span className="shrink-0">{item.icon}</span>
                {isSidebarOpen && <span className="ml-4 font-semibold tracking-tight">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-5 py-3 text-xs font-black uppercase tracking-widest text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
          >
            <LogOut size={16} />
            {isSidebarOpen && <span className="ml-4">Chiqish</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-50 rounded-lg text-hemis-primary transition-colors">
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest gap-2">
              <span>Boshqaruv</span>
              <ChevronDown size={12} className="-rotate-90 opacity-30" />
              <span className="text-hemis-accent">{menuItems.find(i => i.path === location.pathname)?.label || 'Bosh sahifa'}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-gray-400 hover:text-hemis-primary transition-colors p-2 hover:bg-gray-50 rounded-full">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 border-l pl-6">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-gray-800 leading-none tracking-tight">{user?.fullName}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Administrator</p>
              </div>
              <div className="w-10 h-10 bg-hemis-primary rounded-xl text-white flex items-center justify-center font-heading text-lg shadow-lg shadow-hemis-primary/10 cursor-pointer" onClick={() => navigate('/admin/profile')}>
                {user?.fullName?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<DashboardHome />} />
              <Route path="/scanner" element={<AdminScanner />} />
              <Route path="/buildings" element={<Buildings />} />
              <Route path="/faculties" element={<Faculties />} />
              <Route path="/students" element={<Students />} />
              <Route path="/queues" element={<Queues />} />
              <Route path="/profile" element={<AdminProfile />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
