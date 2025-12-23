
import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { User, Faculty, TwoMBRecord } from '../../types';
import { 
  Plus, ChevronLeft, ChevronRight, RefreshCw, Search, 
  User as UserIcon, Filter, GraduationCap, 
  SearchX, Loader2, ChevronDown, UserCheck, ShieldCheck,
  BookOpen, X, AlertCircle, Calendar, Book
} from 'lucide-react';

const Students: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [fetching, setFetching] = useState(true);
  const pageSize = 15;

  // Arrears Modal State
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [arrears, setArrears] = useState<TwoMBRecord[]>([]);
  const [fetchingArrears, setFetchingArrears] = useState(false);
  const [showArrearsModal, setShowArrearsModal] = useState(false);

  const fetchStudents = async (page: number) => {
    setFetching(true);
    try {
        const result = await apiService.getStudents(page, pageSize);
        setStudents(result?.data || []);
        setTotalPages(result?.totalPages || 1);
        setTotalElements(result?.totalElements || 0);
        setCurrentPage(result?.currentPage || 1);
    } catch (e) {
        console.error(e);
    } finally {
        setFetching(false);
    }
  };

  useEffect(() => {
    apiService.getFaculties().then(setFaculties);
    fetchStudents(1);
  }, []);

  const openArrearsModal = async (student: User) => {
    setSelectedStudent(student);
    setShowArrearsModal(true);
    setFetchingArrears(true);
    setArrears([]);
    try {
      if (student.hemisId) {
        const data = await apiService.getStudentArrears(student.hemisId);
        setArrears(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFetchingArrears(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.hemisId?.includes(searchQuery)
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Talabalar bazasi</h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 uppercase">Jami {totalElements} ta ro'yxatdan o'tgan talabalar</p>
         </div>
         <div className="flex items-center gap-3">
            <button 
              onClick={() => fetchStudents(currentPage)}
              className="p-2.5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/5 rounded-xl text-slate-500 hover:text-blue-500 transition-all shadow-sm"
            >
              <RefreshCw size={20} className={fetching ? 'animate-spin' : ''} />
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95">
              <Plus size={18} strokeWidth={2.5} /> Talaba qo'shish
            </button>
         </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-navy-900 p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
             <input 
                type="text" 
                placeholder="F.I.Sh yoki HEMIS ID bo'yicha qidirish..." 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-navy-950/50 border border-slate-200 dark:border-white/5 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-blue-500 transition-all dark:text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
             />
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-50 dark:bg-navy-950/50 border border-slate-200 dark:border-white/5 rounded-xl text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
             <Filter size={16} /> Saralash <ChevronDown size={14} />
          </button>
      </div>

      {/* Students List */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
        <div className="overflow-x-auto flex-1 no-scrollbar">
          <table className="w-full border-collapse">
            <thead className="bg-slate-50/50 dark:bg-navy-950/50 sticky top-0 z-10 backdrop-blur-md">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b dark:border-white/5">
                <th className="px-6 py-5 text-left w-16">#</th>
                <th className="px-6 py-5 text-left">Talaba ma'lumotlari</th>
                <th className="px-6 py-5 text-left">Fakultet</th>
                <th className="px-6 py-4 text-center">Kurs</th>
                <th className="px-6 py-4 text-center">Holat</th>
                <th className="px-6 py-4 text-right">Qarzdorlik</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {fetching ? (
                 <tr>
                    <td colSpan={6} className="py-32">
                       <div className="flex flex-col items-center justify-center gap-3">
                          <Loader2 className="animate-spin text-blue-500" size={40} />
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Yuklanmoqda...</p>
                       </div>
                    </td>
                 </tr>
              ) : filteredStudents.length === 0 ? (
                 <tr>
                    <td colSpan={6} className="py-32">
                       <div className="flex flex-col items-center justify-center gap-4 opacity-40">
                          <SearchX size={64} className="text-slate-300" />
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Ma'lumot topilmadi</p>
                       </div>
                    </td>
                 </tr>
              ) : filteredStudents.map((student, idx) => (
                <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all group">
                  <td className="px-6 py-5">
                     <span className="text-xs font-bold text-slate-400">{(currentPage - 1) * pageSize + idx + 1}</span>
                  </td>
                  <td className="px-6 py-5">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center font-black text-sm border border-blue-200/50 dark:border-blue-500/20 group-hover:scale-110 transition-transform">
                           {student.fullName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                           <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight truncate leading-none mb-1 uppercase">{student.fullName}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{student.hemisId}</p>
                        </div>
                     </div>
                  </td>
                  <td className="px-6 py-5">
                     <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                        <GraduationCap size={14} className="text-indigo-500 shrink-0" />
                        <span className="truncate max-w-[200px]">{student.facultet?.name || 'Kiritilmagan'}</span>
                     </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                     <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-white/5">
                        {student.course}-kurs
                     </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                     <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Faol</span>
                     </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                     <button 
                        onClick={() => openArrearsModal(student)}
                        className="p-2.5 bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-100 transition-all border border-rose-100 dark:border-rose-900/20 flex items-center gap-2 ml-auto group/btn"
                     >
                        <BookOpen size={16} className="group-hover/btn:scale-110 transition-transform" />
                        <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">2/NB</span>
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-8 py-5 border-t dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50 dark:bg-navy-950/50">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
             Sahifa {currentPage} / {totalPages}
           </p>
           <div className="flex items-center gap-2">
              <button 
                disabled={currentPage === 1 || fetching} 
                onClick={() => fetchStudents(currentPage - 1)} 
                className="p-2.5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/5 text-slate-500 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm"
              >
                <ChevronLeft size={18}/>
              </button>
              <button 
                disabled={currentPage === totalPages || fetching} 
                onClick={() => fetchStudents(currentPage + 1)} 
                className="p-2.5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/5 text-slate-500 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm"
              >
                <ChevronRight size={18}/>
              </button>
           </div>
        </div>
      </div>

      {/* Arrears Modal */}
      {showArrearsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-navy-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-white/5 overflow-hidden animate-in zoom-in-95">
             <div className="px-8 py-6 border-b dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-navy-950/50">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-600/20">
                      <BookOpen size={24} />
                   </div>
                   <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-1">{selectedStudent?.fullName}</h3>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Akademik qarzdorliklar (2/NB)</p>
                   </div>
                </div>
                <button onClick={() => setShowArrearsModal(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl text-slate-500 transition-all">
                   <X size={24}/>
                </button>
             </div>

             <div className="p-8 max-h-[60vh] overflow-y-auto no-scrollbar space-y-4">
                {fetchingArrears ? (
                   <div className="py-20 flex flex-col items-center justify-center gap-4">
                      <Loader2 className="animate-spin text-rose-500" size={40} />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ma'lumotlar olinmoqda...</p>
                   </div>
                ) : arrears.length === 0 ? (
                   <div className="py-20 text-center space-y-4 opacity-40">
                      <AlertCircle size={64} className="mx-auto text-slate-300" />
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Qarzdorliklar topilmadi</p>
                   </div>
                ) : (
                   <div className="grid grid-cols-1 gap-4">
                      {arrears.map((record, i) => (
                         <div key={i} className="p-5 bg-slate-50 dark:bg-navy-950/50 border border-slate-100 dark:border-white/5 rounded-[1.5rem] hover:border-rose-500/30 transition-all group">
                            <div className="flex justify-between items-start mb-3">
                               <div>
                                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1 group-hover:text-rose-600 transition-colors">{record.journalSubjectName}</h4>
                                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                                     <Book size={12} className="text-rose-500" /> {record.journalType}
                                  </div>
                               </div>
                               <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${record.mark ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                  {record.mark || 'NB'}
                               </div>
                            </div>
                            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 italic mb-4 leading-relaxed">"{record.topicName}"</p>
                            <div className="flex items-center justify-between pt-3 border-t dark:border-white/5">
                               <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                  <Calendar size={14} /> {new Date(record.date).toLocaleDateString()}
                               </div>
                               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest opacity-60">Semestr: {record.semester}</span>
                            </div>
                         </div>
                      ))}
                   </div>
                )}
             </div>

             <div className="p-8 bg-slate-50/50 dark:bg-navy-950/50 border-t dark:border-white/5 text-center">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-relaxed italic">
                   Talabaning barcha ko'rsatilgan qarzdorliklari HEMIS tizimi bilan real vaqtda sinxronlashgan.
                </p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
