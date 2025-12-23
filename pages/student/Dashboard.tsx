
import React, { useEffect, useState, useCallback } from 'react';
import { apiService } from '../../services/api';
import { CatchupSchedule, QueueRegistration, TwoMBRecord, TimeSlotStatistic } from '../../types';
import { 
  Calendar, Clock, CheckCircle, RefreshCw, Ticket, X, 
  AlertCircle, MapPin, UserCheck, BookOpen, Layers, Loader2, 
  ArrowRight, Building2, Timer, Star, Monitor, AlertTriangle
} from 'lucide-react';

// Chiroyli bildirishnoma (Toast) komponenti
const Toast = ({ message, type, onClose }: { message: string, type: 'error' | 'success', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-md animate-in slide-in-from-top-full duration-500 ease-out">
      <div className={`p-4 rounded-2xl shadow-2xl flex items-center gap-4 border backdrop-blur-xl ${
        type === 'error' 
          ? 'bg-rose-500/95 border-rose-400 text-white' 
          : 'bg-emerald-500/95 border-emerald-400 text-white'
      }`}>
        <div className="shrink-0 w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
          {type === 'error' ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
        </div>
        <div className="flex-1">
          <p className="text-[11px] font-black uppercase tracking-widest opacity-80 leading-none mb-1">
            {type === 'error' ? 'Xatolik' : 'Muvaffaqiyat'}
          </p>
          <p className="text-xs font-bold leading-tight">{message}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, colorClass, subtitle }: { title: string, value: string | number, icon: any, colorClass: string, subtitle?: string }) => (
  <div className="bg-white dark:bg-navy-900 p-5 rounded-xl border border-slate-100 dark:border-white/5 flex flex-col gap-3 group transition-all hover:translate-y-[-2px] shadow-sm relative overflow-hidden">
    <div className={`absolute -right-2 -bottom-2 opacity-5 transition-transform group-hover:scale-110 duration-500 ${colorClass.split(' ')[0]}`}>
       <Icon size={70} />
    </div>
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 shadow-md ${colorClass}`}>
      <Icon size={20} />
    </div>
    <div className="min-w-0 relative">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-0.5">{title}</p>
      <div className="flex items-baseline gap-2">
         <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value}</p>
         {subtitle && <span className="text-[9px] font-bold text-slate-500 uppercase">{subtitle}</span>}
      </div>
    </div>
  </div>
);

const StudentHome: React.FC = () => {
  const [availableSchedules, setAvailableSchedules] = useState<CatchupSchedule[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<(QueueRegistration & { position?: number })[]>([]);
  const [twoMBRecords, setTwoMBRecords] = useState<TwoMBRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [showRegModal, setShowRegModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<CatchupSchedule | null>(null);
  const [timeSlotStats, setTimeSlotStats] = useState<TimeSlotStatistic[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{message: string, type: 'error' | 'success'} | null>(null);

  const registeredScheduleIds = new Set(myRegistrations.map(reg => reg.catchupScheduleId));

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    
    try {
        const [schedules, registrations, records] = await Promise.all([
            apiService.getStudentAvailableSchedules(),
            apiService.getStudentQueues(),
            apiService.getTwoMBRecords()
        ]);
        setAvailableSchedules(schedules || []);
        setTwoMBRecords(records || []);
        setMyRegistrations(registrations || []);
    } catch (e) {
        console.error("Fetch data error:", e);
    } finally { 
        setLoading(false); 
        setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openRegModal = async (schedule: CatchupSchedule) => {
    if (registeredScheduleIds.has(schedule.id)) {
      setToast({ message: "Siz ushbu fan uchun allaqachon navbatga yozilgansiz.", type: 'error' });
      return;
    }

    setSelectedSchedule(schedule);
    setSelectedSlot('');
    setModalError(null);
    setRegSuccess(false);
    setShowRegModal(true);
    try {
      const stats = await apiService.getTimeSlotStatistics(schedule.id);
      setTimeSlotStats(stats);
    } catch (e: any) {
      console.error("Stats fetching error:", e);
      // Agar 403 yoki boshqa xato bo'lsa modal ichida xabar berish
      if (e.message?.includes('403')) {
        setModalError("Ma'lumotlarni yuklash ruxsati yo'q (403). Iltimos, qayta kiring.");
      }
    }
  };

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault(); 
    if (!selectedSchedule || !selectedSlot) return;
    
    const slotData = timeSlotStats.find(s => s.timeSlot === selectedSlot);
    if (slotData?.isFullyBooked) {
      setModalError("Bu vaqt oralig'ida bo'sh joy qolmagan.");
      return;
    }

    setSubmitting(true);
    setModalError(null);
    try {
      await apiService.registerStudentQueue(selectedSchedule.id, selectedSlot);
      setRegSuccess(true);
      setToast({ message: "Siz muvaffaqiyatli navbatga yozildingiz!", type: 'success' });
      
      setTimeout(() => {
        setShowRegModal(false);
        setRegSuccess(false);
        fetchData(true); 
      }, 1500);

    } catch (e: any) { 
        // Backend'dan kelgan aniq xabar
        const errMsg = e.message || "Xatolik yuz berdi.";
        setModalError(errMsg);
        // Toast bildirishnoma ko'rsatamiz
        setToast({ message: errMsg, type: 'error' });
    } finally {
        setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-48 gap-4">
      <Loader2 className="animate-spin text-indigo-600" size={56} />
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Ma'lumotlar yuklanmoqda...</p>
    </div>
  );

  return (
    <div className="relative space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none mb-1">Talaba portali</h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Navbatlarni boshqarish tizimi</p>
         </div>
         <button 
           onClick={() => fetchData(true)} 
           disabled={refreshing}
           className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-70"
         >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> 
            {refreshing ? 'Yangilanmoqda...' : 'Yangilash'}
         </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
         <StatCard title="Mening navbatlarim" value={myRegistrations.length} subtitle="ta faol" icon={Ticket} colorClass="bg-indigo-600 shadow-indigo-600/10" />
         <StatCard title="Mavjud fanlar" value={availableSchedules.length} subtitle="ta ochiq" icon={Layers} colorClass="bg-emerald-600 shadow-emerald-600/10" />
         <StatCard title="Qarzdorliklar" value={twoMBRecords.length} subtitle="ta (2/NB)" icon={AlertCircle} colorClass="bg-rose-600 shadow-rose-600/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
            
            {/* Active Queue Tickets */}
            <div className="bg-white dark:bg-navy-900 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
                <div className="p-5 border-b dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-navy-950/50">
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.15em] flex items-center gap-2">
                       <Ticket size={16} className="text-indigo-500" /> Mening faol navbatlarim
                    </h3>
                </div>
                
                <div className="divide-y divide-slate-50 dark:divide-white/5">
                    {myRegistrations.map((reg) => (
                        <div key={reg.id} className="p-5 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all group">
                            <div className="flex flex-col sm:flex-row gap-4 items-center">
                                <div className="w-14 h-14 bg-indigo-600 rounded-lg flex flex-col items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                                   <span className="text-[9px] font-black uppercase tracking-widest opacity-70 leading-none">№</span>
                                   <span className="text-xl font-black leading-none">{reg.queueNumber || '?'}</span>
                                </div>
                                <div className="flex-1 text-center sm:text-left min-w-0">
                                   <h4 className="text-base font-black text-slate-900 dark:text-white tracking-tight uppercase mb-1 truncate">{reg.catchupSchedule?.name}</h4>
                                   <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                         <MapPin size={12} className="text-indigo-500"/> {reg.catchupSchedule?.building?.name}
                                      </div>
                                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                         <Timer size={12} className="text-indigo-500"/> {reg.selectedTimeSlot}
                                      </div>
                                   </div>
                                </div>
                                <div className="shrink-0">
                                   <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${reg.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                                       {reg.status === 'pending' ? <Clock size={12} className="animate-spin-slow"/> : <CheckCircle size={12}/>}
                                       {reg.status === 'pending' ? 'Kutilmoqda' : 'Yakunlandi'}
                                   </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {myRegistrations.length === 0 && (
                        <div className="p-16 text-center space-y-3 opacity-30">
                            <Ticket size={48} className="mx-auto text-slate-300" />
                            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Sizda hozircha faol navbatlar yo'q</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Available Schedules List */}
            <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.15em] flex items-center gap-2 px-1">
                  <Layers size={16} className="text-emerald-500" /> Yangi navbatga ro'yxatdan o'tish
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {availableSchedules.map(schedule => {
                        const isRegistered = registeredScheduleIds.has(schedule.id);
                        
                        return (
                          <div key={schedule.id} className={`group bg-white dark:bg-navy-900 p-6 rounded-xl border transition-all relative overflow-hidden ${isRegistered ? 'border-emerald-500/30 opacity-95' : 'border-slate-100 dark:border-white/5 hover:border-indigo-500/50 shadow-sm'}`}>
                              <div className="absolute top-0 right-0 p-4">
                                 <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${isRegistered ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400'}`}>
                                   {schedule.courses?.length > 0 ? schedule.courses.join(', ') : '?'}-kurs
                                 </span>
                              </div>
                              <h4 className="text-base font-black text-slate-900 dark:text-white leading-tight mb-4 pr-12 uppercase tracking-tight">{schedule.name}</h4>
                              <div className="space-y-2 mb-6">
                                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest"><Building2 size={14} className="text-indigo-500"/> {schedule.building?.name}</div>
                                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest"><Calendar size={14} className="text-indigo-500"/> {new Date(schedule.date).toLocaleDateString()}</div>
                              </div>
                              
                              {isRegistered ? (
                                <div className="w-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-emerald-500/20">
                                   <CheckCircle size={16} /> Siz ro'yxatdan o'tgansiz
                                </div>
                              ) : (
                                <button 
                                    onClick={() => openRegModal(schedule)}
                                    className="w-full bg-indigo-600 hover:bg-emerald-600 text-white py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-indigo-600/20"
                                >
                                    <UserCheck size={16} /> Navbatga yozilish <ArrowRight size={14} />
                                </button>
                              )}
                          </div>
                        );
                    })}
                </div>
            </div>
        </div>

        {/* Arrears Panel */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-navy-900 rounded-xl border border-rose-500/10 shadow-sm overflow-hidden">
                <div className="p-4 bg-rose-600 text-white flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <BookOpen size={18} />
                      <h3 className="text-xs font-black uppercase tracking-[0.15em]">Qarzdorliklar</h3>
                   </div>
                   <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-black">{twoMBRecords.length} ta</span>
                </div>
                
                <div className="p-3 space-y-2">
                    {twoMBRecords.map(record => (
                        <div key={record.id} className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-lg hover:border-rose-500/30 transition-all group">
                            <h5 className="text-[11px] font-black text-slate-900 dark:text-white leading-tight mb-1 uppercase tracking-tight truncate">{record.journalSubjectName}</h5>
                            <div className="flex justify-between items-center border-t border-slate-100 dark:border-white/5 pt-2 mt-2">
                               <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                  <Calendar size={12}/> {new Date(record.date).toLocaleDateString()}
                               </div>
                               <div className="px-2 py-0.5 bg-rose-500 text-white rounded text-[9px] font-black uppercase tracking-widest">
                                  {record.mark || 'NB'}
                               </div>
                            </div>
                        </div>
                    ))}
                    {twoMBRecords.length === 0 && (
                        <div className="text-center py-12 flex flex-col items-center gap-3 opacity-30">
                            <CheckCircle size={32} className="text-emerald-500" />
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em]">Qarzdorliklar yo'q</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6 bg-slate-900 dark:bg-indigo-950 rounded-xl text-white shadow-lg relative overflow-hidden">
               <div className="flex items-center gap-2 font-black uppercase text-[9px] tracking-widest mb-3 text-indigo-300">
                  <Star size={14} className="fill-indigo-300" /> Eslatma
               </div>
               <p className="text-[10px] font-medium leading-relaxed tracking-tight italic opacity-80">
                  Navbatga yozilishdan oldin belgilangan vaqtni va binoni diqqat bilan tekshiring.
               </p>
            </div>
        </div>
      </div>

      {/* Registration Modal */}
      {showRegModal && selectedSchedule && (
        <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white dark:bg-navy-900 rounded-xl shadow-2xl w-full max-w-md border border-slate-100 dark:border-white/5 overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-5 border-b dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-navy-950/50">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
                       <Ticket size={20} />
                    </div>
                    <div>
                       <h3 className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-tight leading-none mb-1 truncate max-w-[220px]">{selectedSchedule.name}</h3>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Vaqtni tanlang</p>
                    </div>
                 </div>
                 <button onClick={() => setShowRegModal(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-white/5 rounded-lg text-slate-500 transition-all"><X size={20}/></button>
              </div>
              
              <div className="p-5">
                 {regSuccess ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-4 animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                            <CheckCircle size={48} />
                        </div>
                        <div className="text-center">
                            <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase">Muvaffaqiyatli!</h4>
                            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">Siz navbatga yozildingiz.</p>
                        </div>
                    </div>
                 ) : (
                    <>
                        {modalError && (
                            <div className="mb-4 p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
                               <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={20} />
                               <p className="text-[12px] font-black text-rose-600 dark:text-rose-400 leading-tight uppercase tracking-tight">{modalError}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 mb-6 max-h-[350px] overflow-y-auto no-scrollbar pr-1 mt-2">
                            {timeSlotStats.map((slot, i) => (
                            <button 
                                key={i}
                                type="button"
                                disabled={slot.isFullyBooked}
                                onClick={() => { setSelectedSlot(slot.timeSlot); setModalError(null); }}
                                className={`p-4 border-2 rounded-xl text-center transition-all group relative overflow-hidden flex flex-col items-center justify-center ${
                                    selectedSlot === slot.timeSlot 
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-[1.02]' 
                                    : slot.isFullyBooked 
                                        ? 'bg-slate-50 dark:bg-white/5 text-slate-300 dark:text-slate-600 border-slate-100 dark:border-white/5 cursor-not-allowed opacity-60' 
                                        : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-white/5 hover:border-indigo-500 hover:bg-slate-50'
                                }`}
                            >
                                <p className="font-black text-sm tracking-tight mb-1">{slot.timeSlot}</p>
                                <div className={`flex items-center gap-1 text-[8px] font-black uppercase tracking-widest ${selectedSlot === slot.timeSlot ? 'text-indigo-200' : slot.isFullyBooked ? 'text-rose-400' : 'text-slate-400'}`}>
                                    {slot.isFullyBooked ? 'To\'lgan' : <><Monitor size={10} /> {slot.availableSeats} o'rin</>}
                                </div>
                            </button>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button type="button" onClick={() => setShowRegModal(false)} className="flex-1 py-3 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-lg font-black text-[10px] uppercase tracking-widest">Bekor qilish</button>
                            <button 
                                type="button"
                                onClick={handleRegister} 
                                disabled={!selectedSlot || submitting}
                                className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-black text-[10px] uppercase tracking-[0.15em] shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {submitting ? <RefreshCw className="animate-spin" size={16}/> : <UserCheck size={16}/>}
                                {submitting ? 'Kutilmoqda...' : 'Tasdiqlash'}
                            </button>
                        </div>
                    </>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default StudentHome;
