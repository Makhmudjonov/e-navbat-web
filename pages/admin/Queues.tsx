import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { CatchupSchedule, Building, TimeSlotStatistic } from '../../types';
import { Layers, Calendar, Trash2, Building2, Users, Eye, Clock, BarChart3, X, Info } from 'lucide-react';

const Queues: React.FC = () => {
  const [schedules, setSchedules] = useState<CatchupSchedule[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<CatchupSchedule | null>(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  
  const [newSchedule, setNewSchedule] = useState({
      name: '',
      date: '',
      startTime: '09:00',
      endTime: '18:00',
      course: 1,
      buildingId: ''
  });
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [s, b] = await Promise.all([
      apiService.getCatchupSchedules(),
      apiService.getBuildings(),
    ]);
    setSchedules(s);
    setBuildings(b);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchedule.name || !newSchedule.date || !newSchedule.buildingId) return;
    
    try {
        await apiService.createCatchupSchedule({
            name: newSchedule.name,
            date: new Date(newSchedule.date).toISOString(),
            startTime: newSchedule.startTime,
            endTime: newSchedule.endTime,
            course: Number(newSchedule.course),
            buildingId: Number(newSchedule.buildingId)
        });
        setNewSchedule({ name: '', date: '', startTime: '09:00', endTime: '18:00', course: 1, buildingId: '' });
        fetchData();
    } catch (e: any) {
        alert(e.message || 'Jadval yaratishda xatolik');
    }
  };

  const handleDelete = async (id: number) => {
      if(confirm('Ushbu jadvalni o\'chirmoqchimisiz?')) {
          try {
            await apiService.deleteCatchupSchedule(id);
            fetchData();
          } catch(e) {
              alert("O'chirishda xatolik");
          }
      }
  };

  const handleShowStats = async (id: number) => {
      setLoadingStats(true);
      setShowStatsModal(true);
      try {
          const detailed = await apiService.getScheduleById(id);
          setSelectedSchedule(detailed);
      } catch (e) {
          alert('Ma\'lumotlarni yuklashda xatolik');
          setShowStatsModal(false);
      } finally {
          setLoadingStats(false);
      }
  };

  return (
    <div className="space-y-6">
       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
           <Layers size={20} className="text-primary"/> Yangi Jadval Yaratish
        </h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jadval Nomi</label>
                <input
                    type="text"
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary outline-none"
                    placeholder="Masalan, Yakuniy Imtihon"
                    value={newSchedule.name}
                    onChange={e => setNewSchedule({ ...newSchedule, name: e.target.value })}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sana</label>
                <input
                    type="date"
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary outline-none"
                    value={newSchedule.date}
                    onChange={e => setNewSchedule({ ...newSchedule, date: e.target.value })}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bino</label>
                <select
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary outline-none"
                    value={newSchedule.buildingId}
                    onChange={e => setNewSchedule({ ...newSchedule, buildingId: e.target.value })}
                >
                    <option value="">Binoni Tanlang</option>
                    {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Clock size={14} /> Boshlanish vaqti
                </label>
                <input
                    type="time"
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary outline-none"
                    value={newSchedule.startTime}
                    onChange={e => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Clock size={14} /> Tugash vaqti
                </label>
                <input
                    type="time"
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary outline-none"
                    value={newSchedule.endTime}
                    onChange={e => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kurs</label>
                <select
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary outline-none"
                    value={newSchedule.course}
                    onChange={e => setNewSchedule({ ...newSchedule, course: Number(e.target.value) })}
                >
                    {[1, 2, 3, 4, 5, 6].map(c => <option key={c} value={c}>Kurs {c}</option>)}
                </select>
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <button
                type="submit"
                className="px-8 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm font-medium"
            >
                Jadvalni Yaratish
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-semibold text-gray-900">Rejalashtirilgan Jadvallar</h3>
            <span className="text-sm text-gray-500">{schedules.length} ta jami</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nomi</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sana va Vaqt</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bino</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kurs</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Navbatdagilar</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amallar</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {schedules.map(schedule => {
                        const building = buildings.find(b => b.id === schedule.buildingId);
                        return (
                            <tr key={schedule.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {schedule.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} className="text-gray-400" />
                                            {new Date(schedule.date).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-primary font-medium">
                                            <Clock size={12} />
                                            {schedule.startTime} - {schedule.endTime}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <Building2 size={14} />
                                        {building ? building.name : `Bino #${schedule.buildingId}`}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {schedule.course}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <Users size={14} className="text-gray-400" />
                                        <span className="font-bold text-gray-700">{schedule.registrationCount}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-1">
                                    <button 
                                        onClick={() => handleShowStats(schedule.id)}
                                        className="text-orange-600 hover:text-orange-900 p-2 hover:bg-orange-50 rounded-lg transition-colors"
                                        title="Statistika"
                                    >
                                        <BarChart3 size={18} />
                                    </button>
                                    <button 
                                        onClick={() => window.open(`#/queue/${schedule.id}`, '_blank')}
                                        className="text-primary hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Jamoat ekranida ko'rish"
                                    >
                                        <Eye size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(schedule.id)} 
                                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        )
                    })}
                     {schedules.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">Hali jadvallar rejalashtirilmagan.</td>
                        </tr>
                    )}
                </tbody>
            </table>
          </div>
      </div>

      {/* Stats Modal */}
      {showStatsModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Jadval Statistikasi</h3>
                        <p className="text-sm text-gray-500">{selectedSchedule?.name}</p>
                      </div>
                      <button onClick={() => setShowStatsModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                          <X size={20} />
                      </button>
                  </div>

                  <div className="flex-1 overflow-auto p-6">
                      {loadingStats ? (
                          <div className="py-20 text-center flex flex-col items-center">
                              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-4"></div>
                              <p className="text-gray-500">Statistika yuklanmoqda...</p>
                          </div>
                      ) : (
                          <div className="space-y-6">
                              {/* Header Stats */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                      <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Jami O'rinlar</p>
                                      <p className="text-2xl font-black text-blue-900">{selectedSchedule?.timeSlotStatistics?.reduce((acc, curr) => acc + curr.totalSeats, 0) || 0}</p>
                                  </div>
                                  <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                                      <p className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1">Ro'yxatdan o'tganlar</p>
                                      <p className="text-2xl font-black text-green-900">{selectedSchedule?.registrationCount}</p>
                                  </div>
                                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                      <p className="text-xs text-purple-600 font-bold uppercase tracking-wider mb-1">Bo'sh O'rinlar</p>
                                      <p className="text-2xl font-black text-purple-900">{selectedSchedule?.timeSlotStatistics?.reduce((acc, curr) => acc + curr.availableSeats, 0) || 0}</p>
                                  </div>
                              </div>

                              {/* Slots Table */}
                              <div className="border border-gray-100 rounded-xl overflow-hidden">
                                  <table className="min-w-full divide-y divide-gray-200">
                                      <thead className="bg-gray-50">
                                          <tr>
                                              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Vaqt Oralig'i</th>
                                              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Bandlik</th>
                                              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Soni</th>
                                              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Holat</th>
                                          </tr>
                                      </thead>
                                      <tbody className="bg-white divide-y divide-gray-200">
                                          {selectedSchedule?.timeSlotStatistics?.map((stat, i) => {
                                              const percent = (stat.registeredCount / stat.totalSeats) * 100;
                                              return (
                                                <tr key={i} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 flex items-center gap-2">
                                                        <Clock size={14} className="text-gray-400"/> {stat.timeSlot}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="w-full bg-gray-100 rounded-full h-2 max-w-[100px]">
                                                            <div 
                                                                className={`h-2 rounded-full ${percent > 90 ? 'bg-red-500' : percent > 50 ? 'bg-orange-500' : 'bg-green-500'}`} 
                                                                style={{ width: `${Math.min(percent, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        <span className="font-bold text-gray-900">{stat.registeredCount}</span> / {stat.totalSeats}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {stat.isFullyBooked ? (
                                                            <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-black uppercase rounded-lg">To'lgan</span>
                                                        ) : (
                                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded-lg">Ochiq</span>
                                                        )}
                                                    </td>
                                                </tr>
                                              );
                                          })}
                                      </tbody>
                                  </table>
                              </div>
                              
                              <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 p-3 rounded-lg">
                                  <Info size={14} />
                                  <span>Bu statistika real vaqtda yangilanadi. Bo'sh o'rinlar bino sig'imidan kelib chiqib hisoblangan.</span>
                              </div>
                          </div>
                      )}
                  </div>

                  <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                      <button onClick={() => setShowStatsModal(false)} className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-colors">
                          Yopish
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Queues;