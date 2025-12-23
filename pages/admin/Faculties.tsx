
import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { Faculty, Building } from '../../types';
import { Plus, Trash2, GraduationCap, Pencil, X, RefreshCw, ChevronRight, Search, Building2, Loader2 } from 'lucide-react';

const Faculties: React.FC = () => {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [formData, setFormData] = useState({ name: '', buildingId: '' });
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
        const [f, b] = await Promise.all([
            apiService.getFaculties(),
            apiService.getBuildings()
        ]);
        setFaculties(f || []);
        setBuildings(b || []);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.buildingId) return;
    setSubmitting(true);
    try {
      const payload = { 
          name: formData.name, 
          buildingId: Number(formData.buildingId) 
      };

      if (editingId) {
          await apiService.updateFaculty(editingId, payload);
      } else {
          await apiService.createFaculty(payload);
      }
      
      setFormData({ name: '', buildingId: '' });
      setEditingId(null);
      fetchData();
    } catch (e) {
      console.error(e);
      alert("Amal bajarilmadi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSync = async () => {
      setSyncing(true);
      try {
          const res = await apiService.syncFaculties();
          if (res.status) {
              alert(res.data.message || 'Muvaffaqiyatli sinxronlashtirildi');
              fetchData();
          }
      } catch (e: any) {
          alert('Sinxronlashda xatolik yuz berdi');
      } finally {
          setSyncing(false);
      }
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Ishonchingiz komilmi?')) {
      await apiService.deleteFaculty(id);
      fetchData();
    }
  };

  const handleEdit = (faculty: Faculty) => {
      setEditingId(faculty.id);
      setFormData({
          name: faculty.name,
          buildingId: faculty.buildingId ? String(faculty.buildingId) : ''
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
      setEditingId(null);
      setFormData({ name: '', buildingId: '' });
  };

  const filteredFaculties = faculties.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2">
              <span>ADMIN</span> <ChevronRight size={10} /> <span className="text-slate-500">FAKULTETLAR</span>
           </div>
           <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">Fakultetlar boshqaruvi</h1>
           <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Sinxronlash va fakultetlar tahriri</p>
        </div>
        <button 
          onClick={handleSync}
          disabled={syncing}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg shadow-emerald-600/20 active:scale-95"
        >
          <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Yangilanmoqda...' : 'HEMIS dan yangilash'}
        </button>
      </div>

      {/* Form Section */}
      <div className="bg-white dark:bg-navy-900 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm">
        <h2 className="text-xs font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3 uppercase tracking-[0.2em]">
           <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${editingId ? 'bg-orange-500' : 'bg-blue-600'}`}>
              {editingId ? <Pencil size={16} /> : <Plus size={16} />}
           </div>
           {editingId ? 'Fakultetni tahrirlash' : 'Yangi fakultet qo\'shish'}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-5 items-end">
          <div className="w-full lg:flex-1 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fakultet nomi</label>
            <input
              type="text" required
              className="w-full px-4 py-3 bg-slate-50 dark:bg-navy-950/50 border border-slate-200 dark:border-white/5 rounded-xl outline-none text-xs font-black uppercase text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 transition-all"
              placeholder="Fakultet nomini kiriting..."
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="w-full lg:w-72 space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bino</label>
             <select
                 required
                 className="w-full px-4 py-3 bg-slate-50 dark:bg-navy-950/50 border border-slate-200 dark:border-white/5 rounded-xl outline-none text-xs font-black uppercase text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 transition-all"
                 value={formData.buildingId}
                 onChange={e => setFormData({ ...formData, buildingId: e.target.value })}
             >
                 <option value="">Binoni tanlang</option>
                 {buildings.map(b => (
                     <option key={b.id} value={b.id}>{b.name}</option>
                 ))}
             </select>
          </div>
          <div className="w-full lg:w-auto flex gap-3">
            <button
                type="submit"
                disabled={submitting}
                className={`flex-1 lg:flex-none px-8 py-3.5 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all active:scale-95 ${
                    editingId ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                }`}
            >
                {submitting ? 'Saqlanmoqda...' : editingId ? 'Yangilash' : 'Qo\'shish'}
            </button>
            {editingId && (
                <button 
                    type="button" 
                    onClick={handleCancel}
                    className="p-3.5 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-xl border border-slate-200 dark:border-white/5 hover:bg-slate-200 transition-all"
                >
                    <X size={20}/>
                </button>
            )}
          </div>
        </form>
      </div>

      {/* List Section */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="p-4 sm:p-6 border-b dark:border-white/5 bg-slate-50/50 dark:bg-navy-900/50 flex flex-col sm:flex-row justify-between items-center gap-4">
           <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Fakultetlar ro'yxati</h3>
           <div className="relative group w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Fakultet nomi..." 
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-navy-950 border border-slate-200 dark:border-white/5 rounded-xl text-[11px] outline-none focus:ring-1 focus:ring-blue-500 dark:text-white transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
        </div>

        <div className="overflow-x-auto no-scrollbar min-h-[400px]">
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest border-b dark:border-white/5">
                <th className="px-6 py-4 text-left w-16">#</th>
                <th className="px-6 py-4 text-left">Fakultet nomi</th>
                <th className="px-6 py-4 text-left">Joylashgan binosi</th>
                <th className="px-6 py-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {loading ? (
                <tr><td colSpan={4} className="py-24 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={32} /></td></tr>
              ) : filteredFaculties.length === 0 ? (
                <tr><td colSpan={4} className="py-24 text-center text-slate-400 font-bold uppercase tracking-widest opacity-40">Ma'lumot topilmadi</td></tr>
              ) : filteredFaculties.map((f, idx) => (
                <tr key={f.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all group">
                  <td className="px-6 py-5 text-xs font-bold text-slate-400">{idx + 1}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                       <div className="w-9 h-9 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <GraduationCap size={18}/>
                       </div>
                       <span className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white tracking-tight uppercase">{f.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                       <Building2 size={14} className="text-blue-500" /> 
                       {buildings.find(b => b.id === f.buildingId)?.name || 'Kiritilmagan'}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2 sm:opacity-0 group-hover:opacity-100 transition-all">
                       <button onClick={() => handleEdit(f)} className="p-2 bg-slate-100 dark:bg-white/5 hover:bg-blue-600 hover:text-white rounded-lg text-slate-500 transition-all shadow-sm">
                          <Pencil size={16}/>
                       </button>
                       <button onClick={() => handleDelete(f.id)} className="p-2 bg-slate-100 dark:bg-white/5 hover:bg-red-500 hover:text-white rounded-lg text-slate-500 transition-all shadow-sm">
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
    </div>
  );
};

export default Faculties;
