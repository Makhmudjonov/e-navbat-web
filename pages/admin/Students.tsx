
import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { User, Faculty } from '../../types';
import { Plus, ChevronLeft, ChevronRight, RefreshCw, User as UserIcon, GraduationCap } from 'lucide-react';

const Students: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  const [formData, setFormData] = useState({
      hemisId: '',
      password: '',
      fullname: '',
      phoneNumber: '',
      course: 1,
      facultetId: ''
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchStudents = async (page: number) => {
    setFetching(true);
    try {
        const result = await apiService.getStudents(page, pageSize);
        setStudents(result?.data || []);
        setTotalPages(result?.totalPages || 1);
        setTotalElements(result?.totalElements || 0);
        setCurrentPage(result?.currentPage || 1);
    } catch (e) {
        console.error("Students error:", e);
    } finally {
        setFetching(false);
    }
  };

  useEffect(() => {
    apiService.getFaculties().then(setFaculties);
    fetchStudents(1);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        await apiService.createStudent(formData);
        setFormData({ hemisId: '', password: '', fullname: '', phoneNumber: '', course: 1, facultetId: '' });
        fetchStudents(1);
    } catch (e: any) {
        alert(e.message || 'Xatolik yuz berdi');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
        <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
           <Plus size={20} className="text-primary"/> Yangi Talaba
        </h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">F.I.Sh</label>
                <input
                    type="text" required
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-xl outline-none transition-all font-bold text-sm text-gray-900"
                    placeholder="Azizbek Mahmudov"
                    value={formData.fullname}
                    onChange={e => setFormData({ ...formData, fullname: e.target.value })}
                />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Hemis ID</label>
                <input
                    type="text" required
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-xl outline-none transition-all font-bold text-sm text-gray-900"
                    placeholder="364211..."
                    value={formData.hemisId}
                    onChange={e => setFormData({ ...formData, hemisId: e.target.value })}
                />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Telefon</label>
                <input
                    type="text" required
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-xl outline-none transition-all font-bold text-sm text-gray-900"
                    placeholder="99890..."
                    value={formData.phoneNumber}
                    onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fakultet</label>
                <select
                    required
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-xl outline-none transition-all font-bold text-sm text-gray-900"
                    value={formData.facultetId}
                    onChange={e => setFormData({ ...formData, facultetId: e.target.value })}
                >
                    <option value="">Tanlang</option>
                    {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kurs</label>
                <select
                    required
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-xl outline-none transition-all font-bold text-sm text-gray-900"
                    value={formData.course}
                    onChange={e => setFormData({ ...formData, course: Number(e.target.value) })}
                >
                    {[1, 2, 3, 4, 5, 6].map(c => <option key={c} value={c}>{c}-kurs</option>)}
                </select>
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Parol</label>
                <input
                    type="password" required
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-xl outline-none transition-all font-bold text-sm text-gray-900"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
            </div>
          </div>
          <button
              type="submit" disabled={loading}
              className="w-full lg:w-auto px-8 py-3.5 bg-primary text-white rounded-xl font-black text-xs shadow-md disabled:opacity-50"
          >
              {loading ? 'Yozilmoqda...' : 'TALABANI QO\'SHISH'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
            <h3 className="font-black text-gray-900 text-sm">Talabalar Bazasi</h3>
            <span className="text-[10px] font-black text-primary bg-blue-50 px-2 py-1 rounded-md uppercase tracking-widest">Jami: {totalElements}</span>
        </div>
        
        {fetching ? (
            <div className="p-12 text-center flex flex-col items-center gap-3">
                <RefreshCw size={32} className="text-primary animate-spin" />
                <p className="font-bold text-gray-400 text-xs">Yuklanmoqda...</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 divide-y divide-gray-50">
                {students.map((student) => (
                    <div key={student.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black">
                                {student.fullName?.charAt(0)}
                            </div>
                            <div>
                                <p className="font-black text-gray-900 text-sm leading-tight">{student.fullName}</p>
                                <p className="text-[10px] text-gray-400 font-bold font-mono">ID: {student.hemisId}</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                             <span className="px-3 py-1 bg-gray-100 text-[10px] font-black rounded-lg">{student.course}-kurs</span>
                             <span className="px-3 py-1 bg-blue-50 text-primary text-[10px] font-black rounded-lg max-w-[120px] truncate">
                                {student.facultet?.name || '---'}
                             </span>
                             <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-mono font-bold rounded-lg">
                                {student.phoneNumber}
                             </span>
                        </div>
                    </div>
                ))}
                {students.length === 0 && <p className="p-10 text-center text-gray-400 font-bold italic">Talabalar topilmadi</p>}
            </div>
        )}

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Sahifa {currentPage} / {totalPages}
            </p>
            <div className="flex gap-2">
                <button
                    onClick={() => fetchStudents(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-white border border-gray-200 text-gray-400 disabled:opacity-30"
                >
                    <ChevronLeft size={16} />
                </button>
                <button
                    onClick={() => fetchStudents(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-white border border-gray-200 text-gray-400 disabled:opacity-30"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Students;
