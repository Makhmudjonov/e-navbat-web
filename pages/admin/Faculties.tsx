import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { Faculty, Building } from '../../types';
import { Plus, Trash2, GraduationCap, Pencil, X } from 'lucide-react';

const Faculties: React.FC = () => {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [formData, setFormData] = useState({ name: '', buildingId: '' });
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [f, b] = await Promise.all([
        apiService.getFaculties(),
        apiService.getBuildings()
    ]);
    setFaculties(f);
    setBuildings(b);
    setLoading(false);
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
  };

  const handleCancel = () => {
      setEditingId(null);
      setFormData({ name: '', buildingId: '' });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
           {editingId ? <Pencil size={20} className="text-warning"/> : <Plus size={20} className="text-primary"/>}
           {editingId ? 'Fakultetni Tahrirlash' : 'Yangi Fakultet Qo\'shish'}
        </h2>
        <form onSubmit={handleSubmit} className="flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Fakultet Nomi</label>
            <input
              type="text"
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary outline-none"
              placeholder="Masalan, Axborot texnologiyalari"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="w-64">
             <label className="block text-sm font-medium text-gray-700 mb-1">Bino</label>
             <select
                 required
                 className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary outline-none"
                 value={formData.buildingId}
                 onChange={e => setFormData({ ...formData, buildingId: e.target.value })}
             >
                 <option value="">Binoni Tanlang</option>
                 {buildings.map(b => (
                     <option key={b.id} value={b.id}>{b.name}</option>
                 ))}
             </select>
          </div>
          <div className="flex gap-2">
            <button
                type="submit"
                disabled={submitting}
                className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2 ${
                    editingId ? 'bg-warning hover:bg-yellow-600' : 'bg-primary hover:bg-blue-600'
                }`}
            >
                {submitting ? 'Saqlanmoqda...' : editingId ? 'Yangilash' : 'Qo\'shish'}
            </button>
            {editingId && (
                <button 
                    type="button" 
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                >
                    <X size={18}/>
                </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nomi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bino</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amallar</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {faculties.map((faculty) => {
              const building = buildings.find(b => b.id == faculty.buildingId);
              return (
                <tr key={faculty.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{faculty.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center gap-2">
                    <GraduationCap size={16} className="text-gray-400" />
                    {faculty.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {building ? building.name : `Bino #${faculty.buildingId}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2">
                         <button onClick={() => handleEdit(faculty)} className="text-blue-600 hover:text-blue-900 p-1">
                            <Pencil size={16} />
                        </button>
                        <button
                            onClick={() => handleDelete(faculty.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                        >
                            <Trash2 size={16} />
                        </button>
                    </td>
                </tr>
              );
            })}
            {faculties.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">Fakultetlar topilmadi.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Faculties;