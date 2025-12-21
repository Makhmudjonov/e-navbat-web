
import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { Building } from '../../types';
import { Building2, Monitor, Plus, Pencil, Trash2, X, RefreshCw, Layers } from 'lucide-react';

const Buildings: React.FC = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', computerCount: 0 });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchBuildings = async () => {
    setLoading(true);
    const data = await apiService.getBuildings();
    setBuildings(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    setSubmitting(true);
    try {
        if (editingId) {
            await apiService.updateBuilding(editingId, formData);
        } else {
            await apiService.createBuilding(formData);
        }
        setFormData({ name: '', computerCount: 0 });
        setEditingId(null);
        fetchBuildings();
    } catch (error) {
        alert('Xatolik yuz berdi');
    } finally {
        setSubmitting(false);
    }
  };

  const handleEdit = (building: Building) => {
      setEditingId(building.id);
      setFormData({ name: building.name, computerCount: building.computerCount });
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
      if(!window.confirm('Ishonchingiz komilmi?')) return;
      try {
          await apiService.deleteBuilding(id);
          fetchBuildings();
      } catch (error) {
          alert('O\'chirishda xatolik');
      }
  };

  return (
    <div className="space-y-6 lg:space-y-10">
      {/* Responsive Form Card */}
      <div className="bg-white p-6 lg:p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
        <h2 className="text-xl lg:text-2xl font-black text-gray-900 mb-8 flex items-center gap-3 tracking-tighter">
           {editingId ? <Pencil className="text-warning" size={28}/> : <Plus className="text-primary" size={28}/>} 
           {editingId ? 'Binoni Tahrirlash' : 'Yangi Bino Qo\'shish'}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          <div className="md:col-span-7 lg:col-span-8 space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Bino Nomi</label>
            <input
              type="text" required
              className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-900 shadow-inner"
              placeholder="Masalan: Bosh Bino yoki 2-O'quv binosi"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="md:col-span-3 lg:col-span-2 space-y-2">
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Kompyuterlar</label>
             <input
              type="number" required min="0"
              className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-900 shadow-inner"
              value={formData.computerCount}
              onChange={e => setFormData({ ...formData, computerCount: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="md:col-span-2 flex gap-3">
            <button
                type="submit" disabled={submitting}
                className={`flex-1 px-4 py-4 text-white rounded-2xl font-black transition-all shadow-xl active:scale-95 disabled:opacity-50 ${
                    editingId ? 'bg-warning shadow-yellow-100 hover:bg-yellow-500' : 'bg-primary shadow-blue-100 hover:bg-blue-600'
                }`}
            >
                {submitting ? '...' : editingId ? 'Yangilash' : 'Saqlash'}
            </button>
            {editingId && (
                <button 
                    type="button" onClick={() => { setEditingId(null); setFormData({name:'', computerCount:0}); }}
                    className="p-4 bg-gray-100 text-gray-500 rounded-2xl hover:bg-gray-200 transition-colors"
                >
                    <X size={24}/>
                </button>
            )}
          </div>
        </form>
      </div>

      {/* Buildings List - Adaptive Table/Cards */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
            <h3 className="font-black text-gray-900 flex items-center gap-2">
                <Layers size={20} className="text-gray-400" /> Binolar Ro'yxati
            </h3>
            <span className="text-[10px] font-black text-primary bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">
                Jami: {buildings.length}
            </span>
        </div>
        
        {loading ? (
            <div className="p-20 text-center flex flex-col items-center gap-4">
                <RefreshCw className="text-primary animate-spin" size={40} />
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Ma'lumotlar yuklanmoqda...</p>
            </div>
        ) : (
            <>
                {/* Desktop View Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Nomi</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Sig'imi</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Holati</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Amallar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {buildings.map((building) => (
                                <tr key={building.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-6 text-sm font-bold text-gray-400 font-mono">#{building.id}</td>
                                    <td className="px-8 py-6 font-black text-gray-900 flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            <Building2 size={18} />
                                        </div>
                                        {building.name}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                                            <Monitor size={16} className="text-gray-300"/>
                                            {building.computerCount} <span className="text-gray-400 font-normal">ta kompyuter</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${
                                            building.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {building.isActive ? 'Faol' : 'Nofaol'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right space-x-2">
                                        <button onClick={() => handleEdit(building)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors">
                                            <Pencil size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(building.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View Cards */}
                <div className="md:hidden grid grid-cols-1 divide-y divide-gray-100">
                    {buildings.map((building) => (
                        <div key={building.id} className="p-6 space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                                        <Building2 size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-gray-900 leading-none">{building.name}</h4>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">ID: #{building.id}</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${
                                    building.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {building.isActive ? 'Faol' : 'X'}
                                </span>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                                    <Monitor size={16} className="text-gray-400"/>
                                    {building.computerCount} kompyuterlar
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(building)} className="p-2.5 bg-white text-blue-500 border border-gray-100 rounded-xl shadow-sm">
                                        <Pencil size={20} />
                                    </button>
                                    <button onClick={() => handleDelete(building.id)} className="p-2.5 bg-white text-red-500 border border-gray-100 rounded-xl shadow-sm">
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {buildings.length === 0 && (
                    <div className="p-20 text-center text-gray-400">
                        <Building2 size={48} className="mx-auto opacity-10 mb-4" />
                        <p className="font-bold">Binolar mavjud emas</p>
                    </div>
                )}
            </>
        )}
      </div>
    </div>
  );
};

export default Buildings;
