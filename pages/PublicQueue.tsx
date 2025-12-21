import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { CatchupSchedule } from '../types';
import { Calendar, Clock, MapPin, Users, ArrowLeft, RefreshCw, LayoutGrid, Info } from 'lucide-react';

const PublicQueue: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [schedule, setSchedule] = useState<CatchupSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    if (!id) return;
    try {
      const [details, queueData] = await Promise.all([
          apiService.getScheduleById(id),
          apiService.getQueueDetails(id)
      ]);

      if (details) {
          setSchedule({
              ...details,
              students: queueData?.students || []
          });
      } else {
          setError('Jadval topilmadi');
      }
    } catch (e) {
      setError('Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !schedule) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md w-full">
            <h2 className="text-xl font-bold text-red-600 mb-2">Xatolik</h2>
            <p className="text-gray-600 mb-6">{error || 'Jadval topilmadi'}</p>
            <Link to="/login" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors">
                Bosh sahibaga qaytish
            </Link>
        </div>
      </div>
    );
  }

  const students = schedule.students || [];

  return (
    <div className="min-h-screen bg-gray-100 font-sans pb-12">
      <div className="bg-primary text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 opacity-90 text-sm font-bold uppercase tracking-widest">
                        <Link to="/login" className="hover:text-blue-200 transition-colors flex items-center gap-1">
                            <ArrowLeft size={16} /> Kirish
                        </Link>
                        <span>•</span>
                        <span>Jonli Elektron Navbat</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter">{schedule.name}</h1>
                    <div className="flex items-center gap-2 text-blue-100">
                        <MapPin size={22} />
                        <span className="font-bold text-xl">{schedule.building?.name || 'Bino #' + schedule.buildingId}</span>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-4 md:gap-6">
                    <div className="bg-white/10 px-8 py-4 rounded-3xl backdrop-blur-md border border-white/20 flex flex-col items-center min-w-[140px]">
                        <Calendar size={28} className="mb-1 text-blue-200"/>
                        <span className="font-black text-2xl">{new Date(schedule.date).toLocaleDateString()}</span>
                        <span className="text-xs font-bold uppercase tracking-widest opacity-70">Sana</span>
                    </div>
                    <div className="bg-white/10 px-8 py-4 rounded-3xl backdrop-blur-md border border-white/20 flex flex-col items-center min-w-[140px]">
                        <Clock size={28} className="mb-1 text-blue-200"/>
                        <span className="font-black text-2xl">{schedule.startTime?.slice(0, 5)} - {schedule.endTime?.slice(0, 5)}</span>
                        <span className="text-xs font-bold uppercase tracking-widest opacity-70">Vaqt Oralig'i</span>
                    </div>
                    <div className="bg-white/10 px-8 py-4 rounded-3xl backdrop-blur-md border border-white/20 flex flex-col items-center min-w-[140px]">
                        <Users size={28} className="mb-1 text-blue-200"/>
                        <span className="font-black text-2xl">{schedule.registrationCount}</span>
                        <span className="text-xs font-bold uppercase tracking-widest opacity-70">Navbatdagilar</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* Time Slot Availability Section */}
        {schedule.timeSlotStatistics && schedule.timeSlotStatistics.length > 0 && (
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-200">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                    <LayoutGrid size={28} className="text-primary"/> O'rinlar Bandligi
                </h2>
                <div className="flex items-center gap-6 text-xs font-black uppercase tracking-wider">
                    <div className="flex items-center gap-2"><span className="w-4 h-4 bg-green-500 rounded-full shadow-lg shadow-green-100"></span> Bo'sh</div>
                    <div className="flex items-center gap-2"><span className="w-4 h-4 bg-orange-500 rounded-full shadow-lg shadow-orange-100"></span> O'rta</div>
                    <div className="flex items-center gap-2"><span className="w-4 h-4 bg-red-500 rounded-full shadow-lg shadow-red-100"></span> To'la</div>
                </div>
             </div>
             
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                 {schedule.timeSlotStatistics.map((slot, i) => {
                     const percent = (slot.registeredCount / slot.totalSeats) * 100;
                     let colorClass = "bg-green-50 border-green-100 text-green-800";
                     let barColor = "bg-green-500";
                     
                     if (slot.isFullyBooked || percent >= 100) {
                        colorClass = "bg-red-50 border-red-100 text-red-800";
                        barColor = "bg-red-500";
                     } else if (percent > 60) {
                        colorClass = "bg-orange-50 border-orange-100 text-orange-800";
                        barColor = "bg-orange-500";
                     }

                     return (
                        <div key={i} className={`p-6 rounded-3xl border-2 flex flex-col items-center justify-center text-center transition-all hover:scale-105 shadow-sm ${colorClass}`}>
                            <span className="text-xs opacity-70 mb-1 font-black uppercase tracking-tighter">{slot.timeSlot}</span>
                            <span className="text-2xl font-black">{slot.availableSeats}</span>
                            <span className="text-[10px] uppercase font-black tracking-widest">Bo'sh joy</span>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-3 overflow-hidden">
                                <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${Math.min(percent, 100)}%` }}></div>
                            </div>
                        </div>
                     );
                 })}
             </div>
             
             <div className="mt-8 flex items-center gap-3 text-sm text-gray-500 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                 <Info size={20} className="text-primary" />
                 <span className="font-bold tracking-tight">Har bir interval uchun maksimal sig'im: <b>{schedule.building?.computerCount || 0}</b> kishi. Iltimos, o'zingizga qulay vaqtni oldindan rejalashtiring.</span>
             </div>
          </div>
        )}

        {/* Student List */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                    <Users size={28} className="text-primary"/> Navbatdagi Talabalar
                </h2>
                <button onClick={fetchData} className="flex items-center gap-2 text-sm font-black text-gray-700 hover:text-primary transition-all bg-white px-6 py-3 rounded-2xl border border-gray-200 shadow-sm active:scale-95">
                    <RefreshCw size={18} /> Yangilash
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest w-16">#</th>
                            <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Navbat raqami</th>
                            <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">F.I.Sh</th>
                            <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Tanlangan vaqt</th>
                            <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Holat</th>
                            <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Yozilgan vaqti</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {students.map((reg, index) => (
                            <tr key={reg.id} className={`${index < 3 ? 'bg-blue-50/20' : ''} hover:bg-gray-50 transition-colors`}>
                                <td className="px-8 py-6 whitespace-nowrap text-sm font-black text-gray-400">{index + 1}</td>
                                <td className="px-8 py-6 whitespace-nowrap text-lg font-black text-primary">#{reg.queueNumber || reg.id}</td>
                                <td className="px-8 py-6 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-primary font-black mr-4 shadow-inner text-lg">
                                            {reg.student?.fullName?.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-base font-black text-gray-900 leading-tight">{reg.student?.fullName}</div>
                                            <div className="text-xs text-gray-400 font-bold font-mono tracking-tighter">ID: {reg.student?.hemisId}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 whitespace-nowrap">
                                    <span className="px-4 py-1.5 bg-blue-50 text-primary border border-blue-100 rounded-xl font-black text-sm">
                                        {reg.selectedTimeSlot}
                                    </span>
                                </td>
                                <td className="px-8 py-6 whitespace-nowrap">
                                    <span className={`px-4 py-1.5 inline-flex text-xs font-black uppercase tracking-widest rounded-full ${
                                        reg.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        reg.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {reg.status === 'pending' ? 'Navbatda' : reg.status === 'completed' ? 'Tugatildi' : reg.status}
                                    </span>
                                </td>
                                <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-400 font-bold italic">
                                    {new Date(reg.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                </td>
                            </tr>
                        ))}
                        {students.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-8 py-32 text-center text-gray-400">
                                    <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <LayoutGrid size={48} className="opacity-10"/>
                                    </div>
                                    <p className="font-black text-2xl opacity-20 tracking-tighter italic">Hozircha navbatda hech kim yo'q.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PublicQueue;