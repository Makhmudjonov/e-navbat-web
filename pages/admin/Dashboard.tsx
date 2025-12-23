
import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import { generateQueueInsights } from '../../services/geminiService';
import { 
  Users, Layers, Building2, TrendingUp, Activity, Sparkles, ChevronRight, Loader2
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, colorClass }: { title: string, value: string | number, icon: any, trend?: string, colorClass: string }) => (
  <div className="bg-white dark:bg-navy-900 p-5 rounded-3xl border border-slate-100 dark:border-white/5 flex items-center gap-4 group transition-all hover:scale-[1.02] shadow-sm">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg ${colorClass}`}>
      <Icon size={24} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate pr-2">{title}</p>
        {trend && (
          <span className="text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-lg flex items-center gap-0.5 shrink-0">
             <TrendingUp size={10} /> {trend}
          </span>
        )}
      </div>
      <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 leading-none">{value}</p>
    </div>
  </div>
);

const DashboardHome: React.FC = () => {
  const [stats, setStats] = useState({ students: 0, faculties: 0, buildings: 0, registrations: 0, attendees: 0 });
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
          const [studentsData, facultiesData, buildingsData, schedulesData] = await Promise.all([
              apiService.getStudents(1, 1), apiService.getFaculties(),
              apiService.getBuildings(), apiService.getCatchupSchedules()
          ]);
          setStats({
              students: studentsData?.totalElements || 0,
              faculties: facultiesData?.length || 0,
              buildings: buildingsData?.length || 0,
              registrations: (schedulesData || []).reduce((acc, s) => acc + (s.registrationCount || 0), 0),
              attendees: (schedulesData || []).reduce((acc, s) => acc + (s.attendeesCount || 0), 0)
          });
      } catch (e) { console.error(e); }
    };
    fetchData();
  }, []);

  const handleAiAnalysis = async () => {
    setIsAiLoading(true);
    try {
      const schedules = await apiService.getCatchupSchedules();
      const insights = await generateQueueInsights(schedules, {
         totalStudents: stats.students, totalFaculties: stats.faculties,
         totalBuildings: stats.buildings, totalRegistrations: stats.registrations,
         totalAttendees: stats.attendees
      });
      setAiAnalysis(insights);
    } catch (e) { console.error(e); } finally { setIsAiLoading(false); }
  };

  return (
    <div className="space-y-6 sm:space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2">
              <span>ADMIN</span> <ChevronRight size={10} /> <span className="text-slate-500">DASHBOARD</span>
           </div>
           <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">Tizim tahlili</h1>
           <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Ko'rsatkichlarning umumiy holati</p>
        </div>
        <button 
          onClick={handleAiAnalysis}
          disabled={isAiLoading}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
        >
          {isAiLoading ? <Loader2 size={16} className="animate-spin" /> : <Activity size={16} />}
          AI Hisoboti
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard title="Talabalar" value={stats.students} icon={Users} trend="+12%" colorClass="bg-blue-600 shadow-blue-600/10" />
        <StatCard title="Jadvallar" value={stats.faculties} icon={Layers} colorClass="bg-indigo-600 shadow-indigo-600/10" />
        <StatCard title="Ro'yxatlar" value={stats.registrations} icon={Activity} trend="+28%" colorClass="bg-emerald-600 shadow-emerald-600/10" />
        <StatCard title="Binolar" value={stats.buildings} icon={Building2} colorClass="bg-slate-600 shadow-slate-600/10" />
      </div>

      <div className="bg-white dark:bg-navy-900 rounded-[2rem] border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm">
         <div className="px-6 py-5 border-b dark:border-white/5 flex flex-col xs:flex-row items-center justify-between gap-3 bg-slate-50/50 dark:bg-navy-950/50">
            <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
               <Sparkles size={16} className="text-blue-500" /> Sun'iy intellekt tahlili
            </h3>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-2 py-0.5 rounded-lg border border-slate-200 dark:border-white/10">Gemini V3.0</span>
         </div>
         <div className="p-8 sm:p-12 text-center min-h-[300px] flex flex-col items-center justify-center">
            {aiAnalysis ? (
               <div className="text-left max-w-2xl animate-in fade-in slide-in-from-bottom-2">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-lg font-medium italic border-l-4 border-blue-500 pl-6">
                    "{aiAnalysis}"
                  </p>
               </div>
            ) : (
               <div className="flex flex-col items-center gap-4 opacity-50">
                  <Activity size={48} className="text-slate-300" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest max-w-[200px] leading-loose">Tizim bo'yicha tahliliy hisobot yaratish uchun yuqoridagi tugmani bosing</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default DashboardHome;
