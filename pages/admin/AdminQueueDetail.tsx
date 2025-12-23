
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { CatchupSchedule, QueueRegistration } from '../../types';
import { 
  Calendar, Clock, MapPin, Users, ArrowLeft, RefreshCw, 
  CheckCircle2, Timer, Search, Filter,
  AlertCircle, Loader2, GraduationCap, ChevronRight, XCircle, Info
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass }: { title: string, value: string | number, icon: any, colorClass: string }) => (
  <div className="dark:bg-navy-900 p-3 sm:p-4 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center gap-2 sm:gap-3 group transition-all hover:scale-[1.02] overflow-hidden bg-white shadow-sm">
    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white shrink-0 ${colorClass}`}>
      <Icon size={18} className="sm:w-5 sm:h-5" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{title}</p>
      <p className="text-sm sm:text-lg font-black text-slate-900 dark:text-white mt-0.5 truncate">{value}</p>
    </div>
  </div>
);

const AdminQueueDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const [schedule, setSchedule] = useState<CatchupSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  
  const [selectedSlot, setSelectedSlot] = useState<string | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<QueueRegistration[]>([]);
  const [fetchingStudents, setFetchingStudents] = useState(false);

  const statusOptions = [
    { id: 'all', label: 'Barchasi' },
    { id: 'pending', label: 'Kutilmoqda' },
    { id: 'arrived', label: 'Kelganlar' },
    { id: 'absent', label: 'Kelmaganlar' },
    { id: 'cancelled', label: 'Bekor qilingan' },
  ];

  const formatCourse = (course: any) => {
    return course ? `${course}-kurs` : '?';
  };

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const onMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const fetchScheduleInfo = async () => {
    if (!id) return;
    try {
      const details = await apiService.getScheduleById(id);
      if (details) setSchedule(details);
      else setError('Navbat ma’lumotlari topilmadi');
    } catch (e) {
      setError('Ma’lumotlarni yuklashda texnik xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsList = async () => {
    if (!id) return;
    setFetchingStudents(true);
    try {
      const list = await apiService.getQueueStudentsBySlot(id, selectedSlot, selectedStatus);
      setStudents(list);
    } catch (e) {
      console.error(e);
    } finally {
      setFetchingStudents(false);
    }
  };

  useEffect(() => {
    fetchScheduleInfo();
  }, [id]);

  useEffect(() => {
    fetchStudentsList();
  }, [id, selectedSlot, selectedStatus]);

  const handleMarkArrived = async (hemisId: string, registrationId: number) => {
    if (!id || processingId) return;
    setProcessingId(registrationId);
    try {
      await apiService.markStudentArrived(hemisId, Number(id));
      await fetchStudentsList();
      await fetchScheduleInfo();
    } catch (err: any) {
      alert(err.message || "Xatolik yuz berdi");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-48 gap-4">
      <Loader2 className="animate-spin text-blue-600" size={48} />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Navbat yuklanmoqda...</p>
    </div>
  );

  if (error || !schedule) return (
    <div className="dark:bg-navy-900 p-8 sm:p-16 text-center rounded-3xl border border-white/5 mx-auto max-w-2xl bg-white shadow-xl">
        <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Xatolik yuz berdi</h2>
        <p className="text-sm text-slate-500 mb-8">{error}</p>
        <button onClick={() => navigate('/admin/queues')} className="w-full sm:w-auto bg-blue-600 text-white px-10 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">Ro'yxatga qaytish</button>
    </div>
  );

  const filteredStudents = students.filter(s => {
      const studentName = s.student?.fullName || (s.student as any)?.fullname || '';
      return studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
             s.student?.hemisId?.includes(searchQuery);
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'arrived':
        return <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-wider"><CheckCircle2 size={10}/> Kelgan</span>;
      case 'absent':
        return <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-wider"><XCircle size={10}/> Kelmagan</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-wider"><AlertCircle size={10}/> Bekor qilingan</span>;
      case 'pending':
      default:
        return <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-wider"><Clock size={10}/> Kutilmoqda</span>;
    }
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
             <div className="flex items-center gap-2 text-[8px] sm:text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1 overflow-x-auto no-scrollbar whitespace-nowrap">
                <button onClick={() => navigate('/admin')} className="hover:text-blue-400">ADMIN</button> 
                <ChevronRight size={10} className="text-slate-600 shrink-0" /> 
                <button onClick={() => navigate('/admin/queues')} className="hover:text-blue-400">NAVBATLAR</button> 
                <ChevronRight size={10} className="text-slate-600 shrink-0" /> 
                <span className="text-slate-500 truncate">TAFSILOTLAR</span>
             </div>
             <div className="flex items-center gap-2 sm:gap-3">
                <button onClick={() => navigate('/admin/queues')} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-500 dark:text-slate-400 transition-all shrink-0 bg-white dark:bg-navy-900 shadow-sm border border-slate-100 dark:border-white/5">
                   <ArrowLeft size={18} />
                </button>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate uppercase leading-none">{schedule.name}</h1>
             </div>
          </div>
          <button onClick={fetchStudentsList} className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all shadow-sm">
             <RefreshCw size={14} className={fetchingStudents ? 'animate-spin' : ''}/>
             Yangilash
          </button>
        </div>

        {/* Stats Cards Grid - Highly Responsive */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard title="Ro'yxatda" value={schedule.registrationCount} icon={Users} colorClass="bg-blue-600" />
            <StatCard title="Kelganlar" value={schedule.attendeesCount} icon={CheckCircle2} colorClass="bg-emerald-600" />
            <StatCard title="Kurs" value={schedule.courses?.length > 0 ? schedule.courses.join(', ') : '?'} icon={GraduationCap} colorClass="bg-indigo-600" />
            <StatCard title="Vaqt" value={schedule.startTime?.slice(0,5)} icon={Clock} colorClass="bg-slate-600" />
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm flex flex-col">
        {/* Filters Panel */}
        <div className="p-4 sm:p-6 border-b dark:border-white/5 space-y-4 sm:space-y-6 bg-slate-50/50 dark:bg-navy-900/50">
           {/* Row 1: Time Slots & Search */}
           <div className="flex flex-col lg:flex-row gap-4">
              {/* Slots with drag-scroll */}
              <div className="flex-1 min-w-0">
                 <div 
                    ref={scrollContainerRef}
                    onMouseDown={onMouseDown}
                    onMouseLeave={onMouseUpOrLeave}
                    onMouseUp={onMouseUpOrLeave}
                    onMouseMove={onMouseMove}
                    className="flex flex-nowrap overflow-x-auto gap-2 p-1.5 bg-slate-200/50 dark:bg-navy-950/50 rounded-2xl scroll-smooth cursor-grab active:cursor-grabbing select-none no-scrollbar touch-pan-x"
                 >
                    <button 
                        onClick={() => setSelectedSlot('all')}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 ${selectedSlot === 'all' ? 'bg-white dark:bg-white/10 text-blue-600 dark:text-white shadow-sm ring-1 ring-slate-100 dark:ring-white/10' : 'text-slate-500'}`}
                    >
                        Barchasi
                    </button>
                    {schedule.timeSlotStatistics?.map((slot, i) => (
                        <button 
                            key={i}
                            onClick={() => setSelectedSlot(slot.timeSlot)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 ${selectedSlot === slot.timeSlot ? 'bg-white dark:bg-white/10 text-blue-600 dark:text-white shadow-sm ring-1 ring-slate-100 dark:ring-white/10' : 'text-slate-500'}`}
                        >
                            {slot.timeSlot} <span className="opacity-40 ml-1">({slot.registeredCount})</span>
                        </button>
                    ))}
                 </div>
              </div>

              {/* Search input */}
              <div className="relative group shrink-0 w-full lg:w-72">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                 <input 
                   type="text" 
                   placeholder="F.I.Sh yoki ID bo'yicha..." 
                   className="w-full pl-10 pr-4 py-3 bg-white dark:bg-navy-950/50 border border-slate-200 dark:border-white/5 rounded-2xl text-[11px] sm:text-xs outline-none focus:ring-1 focus:ring-blue-500 transition-all dark:text-white shadow-sm"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                 />
              </div>
           </div>

           {/* Row 2: Status Filters */}
           <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0">
                 <Filter size={12}/> Holat:
              </div>
              <div className="flex flex-wrap gap-2">
                 {statusOptions.map(opt => (
                    <button
                       key={opt.id}
                       onClick={() => setSelectedStatus(opt.id)}
                       className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${selectedStatus === opt.id ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white dark:bg-navy-950/50 border-slate-200 dark:border-white/5 text-slate-500 hover:border-blue-500'}`}
                    >
                       {opt.label}
                    </button>
                 ))}
              </div>
           </div>
        </div>

        {/* Scrollable Table Area */}
        <div className="overflow-x-auto no-scrollbar min-w-0">
          <table className="w-full border-collapse min-w-[700px]">
            <thead className="bg-slate-50/80 dark:bg-navy-950/80 backdrop-blur-md sticky top-0 z-10 border-b dark:border-white/5">
              <tr className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4 text-left w-16">#</th>
                <th className="px-6 py-4 text-left">Talaba</th>
                <th className="px-6 py-4 text-center">Kurs</th>
                <th className="px-6 py-4 text-center">Vaqt</th>
                <th className="px-6 py-4 text-center">Holat</th>
                <th className="px-6 py-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
               {fetchingStudents ? (
                  <tr><td colSpan={6} className="py-24 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={32} /></td></tr>
               ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-24 text-center">
                       <div className="flex flex-col items-center gap-2 opacity-30">
                          <Users size={48} />
                          <p className="text-xs font-black uppercase tracking-widest">Ma'lumot topilmadi</p>
                       </div>
                    </td>
                  </tr>
               ) : filteredStudents.map((reg, idx) => {
                  const studentName = reg.student?.fullName || (reg.student as any)?.fullname || 'Noma\'lum talaba';
                  return (
                    <tr key={reg.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                         <span className="text-sm font-black text-slate-900 dark:text-white">#{reg.queueNumber || idx + 1}</span>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-xl flex items-center justify-center font-black text-xs shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                               {studentName.charAt(0)}
                            </div>
                            <div className="min-w-0">
                               <p className="font-black text-slate-900 dark:text-slate-100 truncate text-[11px] sm:text-xs uppercase leading-tight tracking-tight">{studentName}</p>
                               <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest">ID: {reg.student?.hemisId || '---'}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                          <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-wider">
                              {formatCourse(reg.student?.course)}
                          </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-lg text-[9px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5 whitespace-nowrap">
                            <Timer size={10} className="text-blue-500"/> {reg.selectedTimeSlot}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                         {getStatusBadge(reg.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex justify-end">
                          {reg.status === 'pending' ? (
                              <button 
                                 onClick={() => handleMarkArrived(reg.student?.hemisId || '', reg.id)}
                                 disabled={processingId === reg.id}
                                 className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap"
                              >
                                 {processingId === reg.id ? <RefreshCw size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                                 Keldi
                              </button>
                           ) : (
                              <div className="flex items-center gap-1.5 text-slate-400 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/5">
                                 <Info size={12}/>
                                 <span className="text-[8px] font-black uppercase tracking-widest">Yopilgan</span>
                              </div>
                           )}
                         </div>
                      </td>
                    </tr>
                  );
               })}
            </tbody>
          </table>
        </div>
        
        {/* Footer info */}
        <div className="px-6 py-4 border-t dark:border-white/5 bg-slate-50/50 dark:bg-navy-950/50 flex flex-col sm:flex-row justify-between items-center gap-2">
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Jami talabalar: {filteredStudents.length} ta</p>
           <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Tizim holati faol</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminQueueDetail;
