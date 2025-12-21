
import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import { generateQueueInsights } from '../../services/geminiService';
import { CatchupSchedule } from '../../types';
import { Sparkles, Users, Calendar, Building2, ClipboardCheck, ArrowRight, Activity, TrendingUp, GraduationCap } from 'lucide-react';

const StatCard = ({ title, value, subtext, icon, color, trend }: { title: string, value: string | number, subtext?: string, icon: React.ReactNode, color: string, trend?: string }) => (
  <div className="bg-white p-5 lg:p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-all relative overflow-hidden group">
    <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-5 group-hover:scale-150 transition-transform duration-700 ${color}`}></div>
    <div className="flex flex-col gap-3 relative">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-white shadow-lg`}>
        {icon}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{title}</p>
          {trend && <span className="flex items-center text-[10px] font-black text-green-500"><TrendingUp size={10} className="mr-0.5"/> {trend}</span>}
        </div>
        <p className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tighter">{value}</p>
        {subtext && <p className="text-[10px] font-bold text-gray-500 mt-1 flex items-center gap-1 opacity-70 truncate"><Activity size={10}/> {subtext}</p>}
      </div>
    </div>
  </div>
);

const DashboardHome: React.FC = () => {
  const [schedules, setSchedules] = useState<CatchupSchedule[]>([]);
  const [stats, setStats] = useState({
      students: 0,
      faculties: 0,
      buildings: 0,
      registrations: 0,
      attendees: 0
  });
  
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
          const [studentsData, facultiesData, buildingsData, schedulesData] = await Promise.all([
              apiService.getStudents(1, 1),
              apiService.getFaculties(),
              apiService.getBuildings(),
              apiService.getCatchupSchedules()
          ]);

          const totalReg = (schedulesData || []).reduce((acc, curr) => acc + (curr.registrationCount || 0), 0);
          const totalAtt = (schedulesData || []).reduce((acc, curr) => acc + (curr.attendeesCount || 0), 0);

          setStats({
              students: studentsData?.totalElements || 0,
              faculties: facultiesData?.length || 0,
              buildings: buildingsData?.length || 0,
              registrations: totalReg,
              attendees: totalAtt
          });
          setSchedules(schedulesData || []);
      } catch (e) {
          console.error("Dashboard error:", e);
      }
    };
    fetchData();
  }, []);

  const handleGenerateInsight = async () => {
    setLoadingAI(true);
    try {
        const result = await generateQueueInsights(schedules, {
            totalStudents: stats.students,
            totalFaculties: stats.faculties,
            totalBuildings: stats.buildings,
            totalRegistrations: stats.registrations,
            totalAttendees: stats.attendees
        });
        setInsight(result);
    } catch (err) {
        setInsight("AI tahlilini amalga oshirib bo'lmadi.");
    } finally {
        setLoadingAI(false);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard title="Talabalar" value={stats.students} trend="+5%" icon={<Users size={20} />} color="bg-blue-600" />
        <StatCard title="Jadvallar" value={schedules.length} subtext="Faol" icon={<Calendar size={20} />} color="bg-orange-500" />
        <StatCard title="Navbatdagilar" value={stats.registrations} subtext={`${stats.attendees} qatnashgan`} icon={<ClipboardCheck size={20} />} color="bg-green-500" />
        <StatCard title="Binolar" value={stats.buildings} subtext={`${stats.faculties} Fakultetlar`} icon={<Building2 size={20} />} color="bg-indigo-600" />
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 lg:p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-br from-blue-50/30 to-white">
          <div className="space-y-1">
            <h3 className="text-lg lg:text-xl font-black text-gray-900 flex items-center gap-2 tracking-tighter">
              <Sparkles size={20} className="text-primary animate-pulse" />
              AI Tahlil va Bashorat
            </h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gemini 3 Flash Pro orqali</p>
          </div>
          <button
            onClick={handleGenerateInsight}
            disabled={loadingAI}
            className="w-full md:w-auto px-6 py-3 bg-primary text-white text-xs font-black rounded-xl hover:bg-blue-600 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loadingAI ? 'Tahlil...' : 'Ma\'lumotlarni Tahlil Qilish'}
            <ArrowRight size={14} />
          </button>
        </div>
        <div className="p-6 lg:p-8 min-h-[100px] flex items-center justify-center">
          {insight ? (
            <div className="text-gray-700 font-bold leading-relaxed text-base w-full animate-in slide-in-from-bottom-2">
              {insight}
            </div>
          ) : (
            <p className="text-gray-400 font-bold italic text-sm text-center">
                Tizim samaradorligi haqida AI xulosasini olish uchun tugmani bosing.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <h3 className="text-lg font-black text-gray-900 tracking-tight mb-4">So'nggi Jadvallar</h3>
          <div className="space-y-3">
            {schedules.slice(-4).reverse().map(schedule => (
                <div key={schedule.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:border-primary/20 border border-transparent transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                            <Calendar size={18} />
                        </div>
                        <div className="min-w-0">
                            <p className="font-black text-gray-900 text-sm truncate">{schedule.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(schedule.date).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <span className="text-base font-black text-primary">#{schedule.registrationCount || 0}</span>
                </div>
            ))}
            {schedules.length === 0 && <p className="text-xs text-gray-400 text-center py-4">Jadvallar yo'q</p>}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <h3 className="text-lg font-black text-gray-900 tracking-tight mb-4">Infratuzilma</h3>
            <div className="space-y-3">
                {[
                    { label: "Fakultetlar", value: stats.faculties, icon: <GraduationCap size={18}/>, color: "text-blue-500" },
                    { label: "Binolar", value: stats.buildings, icon: <Building2 size={18}/>, color: "text-indigo-500" },
                    { label: "Talabalar", value: stats.students, icon: <Users size={18}/>, color: "text-orange-500" }
                ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-3">
                            <div className={`${item.color} bg-current/10 p-2 rounded-lg`}>{item.icon}</div>
                            <span className="text-sm font-bold text-gray-600">{item.label}</span>
                        </div>
                        <span className="text-base font-black text-gray-900">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
