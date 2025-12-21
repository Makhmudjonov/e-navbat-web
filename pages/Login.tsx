
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { apiService } from '../services/api';
import { UserRole } from '../types';
import { LogIn, Globe, ShieldCheck, GraduationCap, ArrowRight } from 'lucide-react';

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
        login(response.user, response.token);
        navigate('/admin');
      } else {
        response = await apiService.loginStudent(username, password);
        login(response.user, response.token);
        navigate('/student');
      }
    } catch (error: any) {
      alert(error.message || 'ID yoki parol noto\'g\'ri');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e1e5ea] flex flex-col font-sans">
      {/* Top Navbar */}
      <div className="h-14 bg-white border-b flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <img src="https://tashmeduni.uz/web/wp-content/uploads/2025/08/tsmu_logo_200.png" alt="Logo" className="h-9" />
          <span className="font-heading text-hemis-dark text-lg tracking-tighter uppercase">e-Navbat</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
          <button className="flex items-center gap-1.5 hover:text-hemis-accent transition-colors">
            <Globe size={14} /> O'zbekcha
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[420px] bg-white shadow-2xl rounded-lg overflow-hidden border border-gray-100">
          <div className="p-10">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-heading text-gray-800 tracking-tight">Tizimga kirish</h2>
              <div className="h-1.5 w-12 bg-hemis-accent mx-auto mt-3 rounded-full"></div>
            </div>

            <div className="flex mb-8 bg-gray-100 p-1.5 rounded-lg border border-gray-200">
              <button
                onClick={() => setRole(UserRole.STUDENT)}
                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-md transition-all duration-300 ${role === UserRole.STUDENT ? 'bg-white text-hemis-accent shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Talaba
              </button>
              <button
                onClick={() => setRole(UserRole.ADMIN)}
                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-md transition-all duration-300 ${role === UserRole.ADMIN ? 'bg-white text-hemis-accent shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Xodim
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  {role === UserRole.STUDENT ? 'Talaba ID (Hemis)' : 'Login'}
                </label>
                <input
                  type="text" required
                  className="w-full px-4 py-3 border-2 border-gray-100 rounded-lg focus:ring-4 focus:ring-hemis-accent/10 focus:border-hemis-accent outline-none text-sm font-semibold transition-all"
                  placeholder={role === UserRole.STUDENT ? "316221100xxx" : "admin"}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Parol</label>
                <input
                  type="password" required
                  className="w-full px-4 py-3 border-2 border-gray-100 rounded-lg focus:ring-4 focus:ring-hemis-accent/10 focus:border-hemis-accent outline-none text-sm font-semibold transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <div className="flex items-center justify-between text-[11px] pt-1">
                <label className="flex items-center gap-2 text-gray-500 cursor-pointer font-bold">
                  <input type="checkbox" className="rounded border-gray-300 text-hemis-accent focus:ring-hemis-accent" /> Eslab qolish
                </label>
                <a href="#" className="text-hemis-accent hover:underline font-bold">Parolni unutdingizmi?</a>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full py-4 bg-hemis-primary text-white font-heading text-xs uppercase tracking-widest rounded-lg hover:bg-hemis-dark transition-all flex items-center justify-center gap-3 mt-6 shadow-lg shadow-hemis-primary/20 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Tekshirilmoqda...' : 'Tizimga kirish'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          </div>
          <div className="bg-gray-50 px-8 py-5 border-t text-[10px] text-gray-400 text-center uppercase tracking-[0.2em] font-black">
            TMA TERMIZ FILIALI &copy; {new Date().getFullYear()}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
        Elektron Navbat Boshqaruv Tizimi • {new Date().getFullYear()}
      </div>
    </div>
  );
};

export default Login;
