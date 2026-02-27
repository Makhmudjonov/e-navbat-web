
import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { CatchupSchedule, Building, Faculty } from '../../types';
import { 
  Plus, Calendar, Clock, Eye, Trash2, Search, MapPin, 
  X, Loader2, CheckCircle, GraduationCap, ChevronRight,
  Layers, School, Timer
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Queues: React.FC = () => {
  const [schedules, setSchedules] = useState<CatchupSchedule[]>([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    courses: [] as number[],
    buildingId: '',
    facultetIds: [] as number[],
    startTime: '09:00',
    endTime: '18:00',
    registrationStartTime: '',
    registrationEndTime: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sRes, bRes] = await Promise.all([
        apiService.getCatchupSchedules(),
        apiService.getBuildings()
      ]);
      setSchedules(sRes);
      setBuildings(bRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (formData.buildingId) {
      apiService.getFacultiesByBuilding(Number(formData.buildingId))
        .then(setFaculties)
        .catch(() => setFaculties([]));
    } else {
      setFaculties([]);
    }
  }, [formData.buildingId]);

  const toggleCourse = (course: number) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.includes(course) 
        ? prev.courses.filter(c => c !== course) 
        : [...prev.courses, course]
    }));
  };

  const toggleFaculty = (id: number) => {
    setFormData(prev => ({
      ...prev,
      facultetIds: prev.facultetIds.includes(id)
        ? prev.facultetIds.filter(f => f !== id)
        : [...prev.facultetIds, id]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.courses.length === 0) {
      alert("Iltimos, kamida bitta kursni tanlang");
      return;
    }
    if (formData.facultetIds.length === 0) {
      alert("Iltimos, kamida bitta fakultetni tanlang");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        buildingId: Number(formData.buildingId),
        date: new Date(formData.date).toISOString(),
        registrationStartTime: formData.registrationStartTime ? new Date(formData.registrationStartTime).toISOString() : undefined,
        registrationEndTime: formData.registrationEndTime ? new Date(formData.registrationEndTime).toISOString() : undefined
      };
      await apiService.createCatchupSchedule(payload);
      setShowModal(false);
      setFormData({
        name: '', date: '', courses: [], buildingId: '', facultetIds: [],
        startTime: '09:00', endTime: '18:00',
        registrationStartTime: '', registrationEndTime: ''
      });
      fetchData();
    } catch (err: any) {
      alert(err.message || "Navbat yaratishda xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Ushbu navbatni o'chirib tashlamoqchimisiz?")) {
      try {
        await apiService.deleteCatchupSchedule(id);
        fetchData();
      } catch (e) { console.error(e); }
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
         <div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2">
               <span>ADMIN</span> <ChevronRight size={10} /> <span className="text-slate-500">NAVBATLAR</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Navbatlar boshqaruvi</h1>
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Barcha faol navbatlar ro'yxati</p>
         </div>
         <button 
           onClick={() => setShowModal(true)}
           className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
         >
           <Plus size={18} /> Yangi navbat
         </button>
      </div>

      <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b dark:border-white/5 bg-slate-50/50 dark:bg-navy-900/50">
           <div className="relative group w-full sm:w-72">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Qidirish..." 
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-navy-950/50 border border-slate-200 dark:border-white/5 rounded-xl text-[11px] outline-none focus:ring-1 focus:ring-blue-500 transition-all text-slate-900 dark:text-white font-bold" 
              />
           </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest border-b dark:border-white/5 bg-slate-50/50 dark:bg-navy-950/50">
                <th className="px-6 py-4 w-12 text-center">#</th>
                <th className="px-6 py-4">Navbat Ma'lumotlari</th>
                <th className="px-6 py-4">Joylashuv</th>
                <th className="px-6 py-4">Vaqt (24s)</th>
                <th className="px-6 py-4 text-center">Kurs</th>
                <th className="px-6 py-4 text-center">Talabalar</th>
                <th className="px-6 py-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {loading ? (
                <tr><td colSpan={7} className="py-24 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" size={32} /></td></tr>
              ) : schedules.length === 0 ? (
                <tr><td colSpan={7} className="py-24 text-center text-slate-400 font-bold uppercase tracking-widest opacity-40">Hozircha navbatlar yaratilmagan</td></tr>
              ) : schedules.map((schedule, idx) => (
                <tr key={schedule.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-6 text-slate-400 font-bold text-xs text-center">{idx + 1}</td>
                  <td className="px-6 py-6">
                    <p className="font-black text-slate-900 dark:text-white uppercase text-[11px] tracking-tight">{schedule.name}</p>
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                       <Calendar size={12} className="text-blue-500"/> {new Date(schedule.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                       <MapPin size={14} className="text-blue-500" /> {schedule.building?.name}
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 dark:text-slate-200 uppercase tracking-widest">
                       <Clock size={14} className="text-blue-500" /> {schedule.startTime} - {schedule.endTime}
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className="bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest">
                       {schedule.courses?.join(', ')}-kurs
                    </span>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <div className="text-sm font-black text-slate-900 dark:text-white leading-none">{schedule.registrationCount}</div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ro'yxatda</div>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="flex justify-end gap-2 lg:opacity-0 group-hover:opacity-100 transition-all">
                       <button onClick={() => navigate(`/admin/queues/${schedule.id}`)} className="p-2 bg-slate-100 dark:bg-white/5 hover:bg-blue-500 hover:text-white rounded-xl text-slate-500 transition-all shadow-sm">
                          <Eye size={16}/>
                       </button>
                       <button onClick={() => handleDelete(schedule.id)} className="p-2 bg-slate-100 dark:bg-white/5 hover:bg-red-500 hover:text-white rounded-xl text-slate-500 transition-all shadow-sm">
                          <Trash2 size={16}/>
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL - Navbat yaratish */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white dark:bg-navy-900 w-full max-w-xl rounded-[2rem] shadow-2xl border border-slate-100 dark:border-white/5 overflow-hidden animate-in zoom-in-95">
              <div className="px-6 py-5 border-b dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-navy-950/50">
                 <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Yangi navbat yaratish</h3>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Sana va vaqtni tanlang</p>
                 </div>
                 <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-white/5 rounded-xl text-slate-500 transition-all"><X size={20}/></button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto no-scrollbar">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Navbat nomi</label>
                       <input 
                         type="text" required 
                         className="w-full px-4 py-3 bg-slate-50 dark:bg-navy-950/50 border border-slate-200 dark:border-white/5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white font-bold" 
                         placeholder="Masalan: Yakuniy nazorat topshirish" 
                         value={formData.name} 
                         onChange={e => setFormData({...formData, name: e.target.value})}
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Sana</label>
                       <input 
                         type="date" required 
                         className="w-full px-4 py-3 bg-slate-50 dark:bg-navy-950/50 border border-slate-200 dark:border-white/5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white font-bold" 
                         value={formData.date} 
                         onChange={e => setFormData({...formData, date: e.target.value})}
                       />
                    </div>
                 </div>

                 {/* Dars bo'lish vaqti */}
                 <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                          <Clock size={10} /> Dars Boshlanish (24s)
                       </label>
                       <input 
                         type="time" required 
                         className="w-full px-4 py-3 bg-slate-50 dark:bg-navy-950/50 border border-slate-200 dark:border-white/5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white font-bold" 
                         value={formData.startTime} 
                         onChange={e => setFormData({...formData, startTime: e.target.value})}
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                          <Clock size={10} /> Dars Tugash (24s)
                       </label>
                       <input 
                         type="time" required 
                         className="w-full px-4 py-3 bg-slate-50 dark:bg-navy-950/50 border border-slate-200 dark:border-white/5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white font-bold" 
                         value={formData.endTime} 
                         onChange={e => setFormData({...formData, endTime: e.target.value})}
                       />
                    </div>
                 </div>

                 {/* Ro'yxatdan o'tish vaqti */}
                 <div className="p-4 bg-blue-50 dark:bg-blue-500/5 rounded-2xl border border-blue-100 dark:border-blue-500/10 space-y-4">
                    <h4 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2">
                       <Timer size={14} /> Ro'yxatdan o'tish davri
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Boshlanish</label>
                          <input 
                            type="datetime-local" required 
                            className="w-full px-4 py-3 bg-white dark:bg-navy-950 border border-slate-200 dark:border-white/5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white font-bold" 
                            value={formData.registrationStartTime} 
                            onChange={e => setFormData({...formData, registrationStartTime: e.target.value})}
                          />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tugash</label>
                          <input 
                            type="datetime-local" required 
                            className="w-full px-4 py-3 bg-white dark:bg-navy-950 border border-slate-200 dark:border-white/5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white font-bold" 
                            value={formData.registrationEndTime} 
                            onChange={e => setFormData({...formData, registrationEndTime: e.target.value})}
                          />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                       <Layers size={14} className="text-blue-500" /> Kurslar
                    </label>
                    <div className="flex flex-wrap gap-2">
                       {[1, 2, 3, 4, 5, 6].map(course => (
                          <button 
                            key={course} 
                            type="button" 
                            onClick={() => toggleCourse(course)} 
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${formData.courses.includes(course) ? 'bg-blue-500 border-blue-500 text-white shadow-md' : 'bg-slate-50 dark:bg-navy-950 border-slate-200 dark:border-white/5 text-slate-500'}`}
                          >
                             {course}-kurs
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                       <MapPin size={14} className="text-blue-500" /> O'quv binosi
                    </label>
                    <select 
                      required 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-navy-950/50 border border-slate-200 dark:border-white/5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white font-bold" 
                      value={formData.buildingId} 
                      onChange={e => setFormData({...formData, buildingId: e.target.value, facultetIds: []})}
                    >
                       <option value="">Binoni tanlang</option>
                       {buildings.map(b => (<option key={b.id} value={b.id}>{b.name}</option>))}
                    </select>
                 </div>

                 {formData.buildingId && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                          <School size={14} className="text-blue-500" /> Fakultetlar
                       </label>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[150px] overflow-y-auto no-scrollbar border border-slate-100 dark:border-white/5 rounded-xl p-3 bg-slate-50 dark:bg-navy-950/50">
                          {faculties.length === 0 ? (
                             <p className="col-span-full text-center text-[10px] font-bold text-slate-400 py-4 italic uppercase">Fakultetlar topilmadi</p>
                          ) : faculties.map(f => (
                             <button 
                                key={f.id} 
                                type="button" 
                                onClick={() => toggleFaculty(Number(f.id))} 
                                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-tight text-left transition-all border ${formData.facultetIds.includes(Number(f.id)) ? 'bg-indigo-500 border-indigo-500 text-white shadow-sm' : 'bg-white dark:bg-navy-900 border-slate-200 dark:border-white/10 text-slate-500 hover:border-indigo-500'}`}
                             >
                                <div className={`w-1.5 h-1.5 rounded-full ${formData.facultetIds.includes(Number(f.id)) ? 'bg-white' : 'bg-slate-300'}`}></div>
                                {f.name}
                             </button>
                          ))}
                       </div>
                    </div>
                 )}

                 <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setShowModal(false)} 
                      className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                    >
                       Bekor qilish
                    </button>
                    <button 
                      type="submit" 
                      disabled={submitting} 
                      className="flex-[2] py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                       {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                       {submitting ? 'Yaratilmoqda...' : 'Navbatni yaratish'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Queues;
