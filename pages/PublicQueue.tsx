
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { CatchupSchedule, QueueRegistration } from '../types';
import { 
  Calendar, Clock, MapPin, Users, ArrowLeft, RefreshCw, 
  LayoutGrid, Building2, CheckCircle2, UserCheck, Timer, Search,
  AlertCircle, GraduationCap
} from 'lucide-react';

const PublicQueue: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState<CatchupSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<QueueRegistration[]>([]);

  const fetchData = async () => {
    if (!id) return;
    try {
      const details = await apiService.getScheduleById(id);
      if (details) {
          setSchedule(details);
          const queueData = await apiService.getQueueDetails(id);
          setStudents(queueData?.students || []);
      } else {
          setError('Ma’lumot topilmadi');
      }
    } catch (e) {
      setError('Yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); 
    return () => clearInterval(interval);
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-contentBg flex flex-col items-center justify-center gap-4">
      <RefreshCw className="animate-spin text-primary" size={60} />
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ma'lumotlar yuklanmoqda...</p>
    </div>
  );

  if (error || !schedule) return (
    <div className="min-h-screen bg-contentBg flex items-center justify-center p-8">
       <div className="bg-white p-12 rounded shadow-2xl text-center max-w-lg border-t-4 border-red-500">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Xatolik</h2>
          <p className="text-slate-500 mb-8 font-medium">{error}</p>
          <button onClick={() => navigate(-1)} className="otm-btn-primary px-8 py-3 rounded text-xs font-bold uppercase">Orqaga qaytish</button>
       </div>
    </div>
  );

  const filteredStudents = students.filter(s => {
      const matchesSlot = selectedSlot === 'all' || s.selectedTimeSlot === selectedSlot;
      const matchesSearch = s.student?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            s.student?.hemisId?.includes(searchQuery);
      return matchesSlot && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-contentBg font-sans">
      {/* Institutional Top Bar */}
      <div className="bg-primary text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-4">
              <img src="https://jurnal.tashmeduni.uz/assets/logo-BTn80Xba.png" className="w-14 h-14 brightness-0 invert" alt="logo" />
              <div>
                 <h1 className="text-2xl font-bold leading-tight uppercase">{schedule.name}</h1>
                 <p className="text-[11px] font-bold text-blue-100 uppercase tracking-widest">TDTU Elektron Navbat Tizimi</p>
              </div>
           </div>
           
           <div className="flex gap-4">
              <div className="bg-white/10 px-6 py-3 rounded border border-white/20 text-center">
                 <p className="text-2xl font-bold leading-none mb-1">{schedule.registrationCount}</p>
                 <p className="text-[9px] font-bold uppercase opacity-70">Ro'yxatda</p>
              </div>
              <div className="bg-white text-primary px-6 py-3 rounded shadow-lg text-center">
                 <p className="text-2xl font-bold leading-none mb-1">{schedule.attendeesCount}</p>
                 <p className="text-[9px] font-bold uppercase opacity-70">Kelganlar</p>
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-6">
         {/* Info & Filters */}
         <div className="otm-box p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
            <div className="lg:col-span-1 space-y-4">
               <div className="flex items-center gap-3 text-slate-600">
                  <MapPin size={20} className="text-primary" />
                  <span className="font-bold text-sm uppercase">{schedule.building?.name || 'Binoda'}</span>
               </div>
               <div className="flex items-center gap-3 text-slate-600">
                  <Calendar size={20} className="text-primary" />
                  <span className="font-bold text-sm uppercase">{new Date(schedule.date).toLocaleDateString()}</span>
               </div>
               <div className="flex items-center gap-3 text-slate-600">
                  {/* Fixed: Added missing GraduationCap import */}
                  <GraduationCap size={20} className="text-primary" />
                  <span className="font-bold text-sm uppercase">{schedule.courses?.length > 0 ? schedule.courses.join(', ') : '?'}-kurslar</span>
               </div>
            </div>

            <div className="lg:col-span-3 flex overflow-x-auto gap-2 no-scrollbar pb-2">
               <button 
                   onClick={() => setSelectedSlot('all')}
                   className={`px-6 py-3 rounded text-[11px] font-bold uppercase border whitespace-nowrap transition-all ${selectedSlot === 'all' ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-slate-500 border-slate-200'}`}
               >
                   Barchasi
               </button>
               {schedule.timeSlotStatistics?.map((slot, i) => (
                   <button 
                       key={i}
                       onClick={() => setSelectedSlot(slot.timeSlot)}
                       className={`px-6 py-3 rounded text-[11px] font-bold uppercase border whitespace-nowrap transition-all ${selectedSlot === slot.timeSlot ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-slate-500 border-slate-200'}`}
                   >
                       {slot.timeSlot} ({slot.registeredCount})
                   </button>
               ))}
            </div>
         </div>

         {/* Queue List */}
         <div className="otm-box overflow-hidden">
            <div className="p-4 border-b bg-[#f9fafb] flex justify-between items-center">
               <h3 className="font-bold text-slate-700 uppercase text-sm">Navbatdagi talabalar ro'yxati</h3>
               <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="ID yoki Ism bo'yicha..." 
                    className="pl-9 pr-4 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-primary w-48 md:w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
            </div>
            
            <div className="overflow-x-auto">
               <table className="w-full border-collapse otm-table">
                  <thead>
                     <tr className="border-b">
                        <th className="px-6 py-4 text-left w-24">Navbat</th>
                        <th className="px-6 py-4 text-left">F.I.Sh</th>
                        <th className="px-6 py-4 text-center">Vaqt Oralig'i</th>
                        <th className="px-6 py-4 text-center">Xolati</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {filteredStudents.map((reg, idx) => (
                        <tr key={reg.id} className={`${reg.status === 'completed' ? 'bg-green-50/30' : 'bg-white'} hover:bg-slate-50 transition-colors`}>
                           <td className="px-6 py-6 text-4xl font-black text-primary italic">#{reg.queueNumber || idx + 1}</td>
                           <td className="px-6 py-6">
                              <p className="text-xl font-bold text-slate-800 uppercase leading-none mb-2">{reg.student?.fullName}</p>
                              <p className="text-xs font-mono font-bold text-slate-400 tracking-widest">HEMIS ID: {reg.student?.hemisId}</p>
                           </td>
                           <td className="px-6 py-6 text-center">
                              <div className="inline-flex items-center gap-2 bg-slate-100 px-4 py-2 rounded font-bold text-slate-700 border border-slate-200">
                                 <Timer size={18} className="text-primary" />
                                 <span className="text-lg">{reg.selectedTimeSlot}</span>
                              </div>
                           </td>
                           <td className="px-6 py-6 text-center">
                              {reg.status === 'completed' ? (
                                 <span className="flex items-center justify-center gap-1 text-green-600 font-bold uppercase text-xs">
                                    <CheckCircle2 size={16} /> Yakunlandi
                                 </span>
                              ) : (
                                 <span className="flex items-center justify-center gap-1 text-orange-500 font-bold uppercase text-xs animate-pulse">
                                    <Clock size={16} /> Kutilmoqda
                                 </span>
                              )}
                           </td>
                        </tr>
                     ))}
                     {filteredStudents.length === 0 && (
                        <tr>
                           <td colSpan={4} className="py-32 text-center text-slate-300 italic font-bold uppercase tracking-[0.2em]">Hozircha navbatda hech kim yo'q</td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
      
      {/* Footer Info */}
      <div className="max-w-7xl mx-auto px-6 py-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-[11px] font-bold uppercase tracking-widest">
         <span>© TDTU Elektron Navbat Monitoring Portali</span>
         <div className="flex gap-6">
            <span className="flex items-center gap-1.5"><Clock size={14}/> Oxirgi yangilanish: {new Date().toLocaleTimeString()}</span>
            <span className="flex items-center gap-1.5 text-primary"><RefreshCw size={14}/> Avtomatik yangilanmoqda</span>
         </div>
      </div>
    </div>
  );
};

export default PublicQueue;
