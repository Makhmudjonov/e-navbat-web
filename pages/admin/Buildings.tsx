
import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { Building } from '../../types';
import { 
  Building2, Plus, Pencil, Trash2, X, Search, 
  MapPin, Users, CheckCircle2, AlertCircle, Loader2,
  TrendingUp, Monitor, ChevronRight
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass }: { title: string, value: string | number, icon: any, colorClass: string }) => (
  <div className="bg-white dark:bg-navy-900 p-5 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center gap-4 transition-all hover:scale-[1.02] shadow-sm">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 ${colorClass}`}>
      <Icon size={24} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{title}</p>
      <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{value}</p>
    </div>
  </div>
);

const Buildings: React.FC = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', computerCount: 0 });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBuildings = async () => {
    setLoading(true);
    try {
      const data = await apiService.getBuildings();
      setBuildings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBuildings(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        if (editingId) await apiService.updateBuilding(editingId, formData);
        else await apiService.createBuilding(formData);
        
        setFormData({ name: '', computerCount: 0 });
        setEditingId(null);
        setIsAdding(false);
        fetchBuildings();
    } catch (error) { 
      alert('Amal bajarilmadi'); 
    }
  };

  const handleEdit = (b: Building) => {
      setEditingId(b.id);
      setFormData({ name: b.name, computerCount: b.computerCount });
      setIsAdding(true);
  };

  const closeForm = () => {
      setIsAdding(false);
      setEditingId(null);
      setFormData({ name: '', computerCount: 0 });
  };

  const filteredBuildings = buildings.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCapacity = buildings.reduce((acc, b) => acc + b.computerCount, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Header & Stats */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2">
                 <span>ADMIN</span> <ChevronRight size={10} /> <span className="text-slate-500">BINOLAR</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">O'quv binolari</h1>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Binolar sig'imi va holati boshqaruvi</p>
           </div>
           <button 
             onClick={() => setIsAdding(true)} 
             className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
           >
             <Plus size={18} strokeWidth={2.5} /> Bino qo'shish
           </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           <StatCard title="Jami binolar" value={buildings.length} icon={Building2} colorClass="bg-blue-600" />
           <StatCard title="Umumiy sig'im" value={`${totalCapacity} o'rin`} icon={Monitor} colorClass="bg-emerald-600" />
           <StatCard title="Faol binolar" value={buildings.filter(b => b.isActive).length} icon={CheckCircle2} colorClass="bg-indigo-600" />
           <StatCard title="O'rtacha sig'im" value={buildings.length ? Math.round(totalCapacity / buildings.length) : 0} icon={TrendingUp} colorClass="bg-slate-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Buildings Table */}
        <div className="lg:col-span-8 bg-white dark:bg-navy-900 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
          <div className="p-6 border-b dark:border-white/5 bg-slate-50/50 dark:bg-navy-950/50 flex flex-col sm:flex-row justify-between items-center gap-4">
             <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Binolar ro'yxati</h3>
             <div className="relative group w-full sm:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Bino nomi..." 
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500 dark:text-white transition-all shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
          </div>

          <div className="overflow-x-auto no-scrollbar min-h-[400px]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b dark:border-white/5">
                  <th className="px-6 py-4 text-left w-16">#</th>
                  <th className="px-6 py-4 text-left">Bino nomi</th>
                  <th className="px-6 py-4 text-center">Sig'imi</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                {loading ? (
                   <tr><td colSpan={5} className="py-24 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={32} /></td></tr>
                ) : filteredBuildings.length === 0 ? (
                   <tr><td colSpan={5} className="py-24 text-center text-slate-400 font-bold uppercase tracking-widest opacity-40">Bino topilmadi</td></tr>
                ) : filteredBuildings.map((b, idx) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all group">
                    <td className="px-6 py-5 text-xs font-bold text-slate-400">{idx + 1}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                         <div className="w-9 h-9 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <MapPin size={18}/>
                         </div>
                         <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{b.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold border border-blue-100 dark:border-blue-900/30">
                         <Monitor size={14}/> {b.computerCount} o'rin
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                       <div className="flex items-center justify-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${b.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}></div>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${b.isActive ? 'text-emerald-500' : 'text-red-500'}`}>
                             {b.isActive ? 'Faol' : 'Nofaol'}
                          </span>
                       </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                         <button onClick={() => handleEdit(b)} className="p-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/5 hover:bg-blue-600 hover:text-white rounded-lg text-slate-500 transition-all shadow-sm">
                            <Pencil size={16}/>
                         </button>
                         <button className="p-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/5 hover:bg-red-500 hover:text-white rounded-lg text-slate-500 transition-all shadow-sm">
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

        {/* Form Panel (Side or Modal-like) */}
        {isAdding ? (
           <div className="lg:col-span-4 bg-white dark:bg-navy-900 rounded-3xl border border-blue-500/30 dark:border-blue-500/20 shadow-xl overflow-hidden animate-in slide-in-from-right duration-500">
              <div className="p-6 border-b dark:border-white/5 bg-blue-600 flex justify-between items-center">
                 <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                    {editingId ? <Pencil size={18}/> : <Plus size={18}/>}
                    {editingId ? 'Binoni tahrirlash' : 'Yangi bino'}
                 </h3>
                 <button onClick={closeForm} className="text-white/60 hover:text-white transition-colors p-1">
                    <X size={24}/>
                 </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Bino nomi</label>
                    <input 
                       type="text" required 
                       className="w-full px-4 py-3 bg-slate-50 dark:bg-navy-950/50 border border-slate-200 dark:border-white/5 rounded-2xl text-sm outline-none focus:ring-1 focus:ring-blue-500 dark:text-white shadow-inner"
                       placeholder="Masalan: 1-o'quv binosi"
                       value={formData.name} 
                       onChange={e => setFormData({...formData, name: e.target.value})} 
                    />
                 </div>
                 
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Sig'imi (o'rinlar)</label>
                    <input 
                       type="number" required 
                       className="w-full px-4 py-3 bg-slate-50 dark:bg-navy-950/50 border border-slate-200 dark:border-white/5 rounded-2xl text-sm outline-none focus:ring-1 focus:ring-blue-500 dark:text-white shadow-inner"
                       placeholder="0"
                       value={formData.computerCount} 
                       onChange={e => setFormData({...formData, computerCount: parseInt(e.target.value) || 0})} 
                    />
                 </div>

                 <div className="pt-4 flex flex-col gap-3">
                    <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-600/20 transition-all active:scale-95">
                       {editingId ? 'O\'zgarishlarni saqlash' : 'Binoni qo\'shish'}
                    </button>
                    <button type="button" onClick={closeForm} className="w-full py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition-all">
                       Bekor qilish
                    </button>
                 </div>
              </form>
           </div>
        ) : (
           <div className="lg:col-span-4 p-8 bg-blue-50/50 dark:bg-navy-900 rounded-3xl border border-blue-100 dark:border-white/5 text-center flex flex-col items-center justify-center gap-4 min-h-[300px]">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/10 text-blue-600 rounded-2xl flex items-center justify-center mb-2">
                 <Building2 size={32}/>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-tight">Yangi bino qo'shing</h3>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed uppercase tracking-widest max-w-[200px]">Tizimga yangi o'quv binolarini qo'shish uchun tugmani bosing</p>
              <button 
                onClick={() => setIsAdding(true)}
                className="mt-4 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
              >
                Boshlash
              </button>
           </div>
        )}
      </div>
    </div>
  );
};

export default Buildings;
