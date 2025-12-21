
import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import { CatchupSchedule, QueueRegistration } from '../../types';
import { Calendar, Clock, CheckCircle, RefreshCw, QrCode as QrIcon, Ticket, Info, GraduationCap, Sparkles, X } from 'lucide-react';

const StudentHome: React.FC = () => {
  const [availableSchedules, setAvailableSchedules] = useState<CatchupSchedule[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<(QueueRegistration & { position?: number })[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [showRegModal, setShowRegModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<CatchupSchedule | null>(null);
  const [selectedReg, setSelectedReg] = useState<QueueRegistration | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>('');

  const fetchData = async () => {
    try {
        const [schedules, registrations] = await Promise.all([
            apiService.getStudentAvailableSchedules(),
            apiService.getStudentQueues()
        ]);
        setAvailableSchedules(schedules || []);
        
        // Calculate positions
        const updatedRegs = await Promise.all(registrations.map(async (reg) => {
          try {
            const queueData = await apiService.getQueueDetails(reg.catchupScheduleId);
            if (queueData && queueData.students) {
              const pendingStudents = (queueData.students || []).filter(s => s.status === 'pending');
              const pos = pendingStudents.findIndex(s => s.id === reg.id);
              return { ...reg, position: pos !== -1 ? pos + 1 : undefined };
            }
          } catch (e) {}
          return reg;
        }));
        setMyRegistrations(updatedRegs);
    } catch (e) {}
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRegister = async () => {
    if (!selectedSchedule || !selectedSlot) return;
    setLoading(true);
    try {
      await apiService.registerStudentQueue(selectedSchedule.id, selectedSlot);
      setShowRegModal(false);
      await fetchData();
    } catch (error: any) {
      alert(error.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Welcome Card */}
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
           <Sparkles size={120} className="text-hemis-accent" />
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl font-heading text-gray-800 tracking-tight">Xush kelibsiz!</h2>
          <p className="text-sm font-medium text-gray-500 mt-2">Bugungi elektron navbatlar holati va yangi jadvallar bilan tanishing.</p>
        </div>
        <button onClick={fetchData} className="px-6 py-3 bg-gray-50 text-hemis-primary rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-gray-100 transition-all border border-gray-100 shadow-sm active:scale-95">
          <RefreshCw size={14} /> Yangilash
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
            <div className="px-8 py-5 border-b bg-gray-50/50 flex items-center justify-between">
              <h3 className="font-black text-hemis-primary flex items-center gap-3 uppercase text-[10px] tracking-[0.2em]">
                <Ticket size={18} className="text-hemis-accent"/> Mening Navbatlarim
              </h3>
            </div>
            <div className="p-8">
              {myRegistrations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {myRegistrations.map(reg => (
                    <div key={reg.id} onClick={() => { setSelectedReg(reg); setShowTicketModal(true); }} className="border-2 border-gray-50 rounded-2xl p-6 hover:border-hemis-accent transition-all cursor-pointer bg-gray-50/30 group shadow-sm hover:shadow-md">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-black text-hemis-accent uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-gray-100">{reg.selectedTimeSlot}</span>
                        <QrIcon size={24} className="text-gray-300 group-hover:text-hemis-accent transition-colors" />
                      </div>
                      <h4 className="font-heading text-gray-800 text-sm mb-4 leading-tight">{reg.catchupSchedule?.name}</h4>
                      {reg.status === 'pending' ? (
                        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                          <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Kutilmoqda</span>
                          <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-heading text-hemis-primary">#{reg.position || '?'}</span>
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">-o'rin</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-green-600 border-t border-gray-100 pt-4">
                          <CheckCircle size={16} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Muvaffaqiyatli topshirildi</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                  <Info size={48} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-xs text-gray-400 font-black uppercase tracking-widest">Faol navbatlar mavjud emas</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
            <div className="px-8 py-5 border-b bg-gray-50/50">
              <h3 className="font-black text-hemis-primary flex items-center gap-3 uppercase text-[10px] tracking-[0.2em]">
                <Calendar size={18} className="text-hemis-accent"/> Yangi Jadvallar
              </h3>
            </div>
            <div className="divide-y divide-gray-50">
              {availableSchedules.map(schedule => (
                <div key={schedule.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="min-w-0 flex-1 pr-6">
                    <h4 className="font-heading text-gray-800 text-sm tracking-tight truncate">{schedule.name}</h4>
                    <div className="flex items-center gap-6 text-[10px] text-gray-400 font-black uppercase tracking-widest mt-2">
                      <span className="flex items-center gap-1.5"><Calendar size={14} className="text-hemis-accent"/> {new Date(schedule.date).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1.5"><Clock size={14} className="text-hemis-accent"/> {schedule.startTime?.slice(0, 5)}</span>
                    </div>
                  </div>
                  <button onClick={() => { setSelectedSchedule(schedule); setShowRegModal(true); }} className="px-5 py-3 bg-hemis-accent text-white text-[10px] font-black rounded-lg uppercase tracking-widest hover:bg-hemis-primary transition-all shadow-lg shadow-hemis-accent/20 active:scale-95">
                    Yozilish
                  </button>
                </div>
              ))}
              {availableSchedules.length === 0 && <div className="p-16 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest italic">Yangi jadvallar topilmadi</div>}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-br from-hemis-primary to-hemis-dark rounded-xl p-8 text-white shadow-2xl relative overflow-hidden group">
             <div className="relative z-10">
                <h4 className="text-xl font-heading mb-3 tracking-tight">Eslatma</h4>
                <p className="text-xs opacity-70 mb-6 font-medium leading-relaxed">Navbatga yozilishda bino sig'imi va tanlangan vaqtni hisobga oling. QR kodni skanerlashda ehtiyot bo'ling.</p>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                    <Info size={16} /> Muhim ma'lumot
                </div>
             </div>
             <QrIcon size={140} className="absolute -bottom-8 -right-8 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-700" />
          </div>
          
          <div className="p-6 border-2 border-dashed border-gray-200 rounded-xl flex items-center gap-4 text-gray-400">
              <GraduationCap size={24} className="shrink-0 opacity-50" />
              <p className="text-[10px] font-bold uppercase tracking-widest leading-normal">O'quv jarayoni va yakuniy nazoratlar uchun navbatlarni doimiy kuzatib boring.</p>
          </div>
        </div>
      </div>

      {/* Modals are still needed here as they are state-dependent on Dashboard content */}
      {showTicketModal && selectedReg && (
        <div className="fixed inset-0 bg-hemis-dark/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-xs shadow-2xl animate-in zoom-in duration-300 flex flex-col items-center p-10 border border-white/20">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-hemis-accent mb-8 shadow-inner border border-gray-100">
              <Ticket size={40} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Navbat raqamingiz</p>
            <h3 className="text-5xl font-heading text-hemis-dark mb-8 tracking-tighter">#{selectedReg.queueNumber || selectedReg.id}</h3>
            <div className="w-52 h-52 bg-white rounded-2xl border-2 border-gray-50 flex items-center justify-center p-6 mb-8 shadow-sm">
              {selectedReg.qrCode ? <img src={selectedReg.qrCode} alt="QR" className="w-full h-full" /> : <QrIcon size={64} className="text-gray-100" />}
            </div>
            <div className="w-full space-y-3 mb-10">
              <div className="flex justify-between text-[11px] font-black uppercase border-b border-gray-100 pb-3"><span className="text-gray-400">Vaqt:</span><span className="text-gray-800">{selectedReg.selectedTimeSlot}</span></div>
            </div>
            <button onClick={() => setShowTicketModal(false)} className="w-full py-4 bg-hemis-primary text-white text-[11px] font-black rounded-lg uppercase tracking-widest shadow-lg shadow-hemis-primary/20 hover:bg-hemis-dark transition-all">Yopish</button>
          </div>
        </div>
      )}

      {showRegModal && selectedSchedule && (
        <div className="fixed inset-0 bg-hemis-dark/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl animate-in slide-in-from-bottom duration-300 overflow-hidden border border-white/20">
            <div className="px-8 py-5 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-heading text-hemis-primary text-xs uppercase tracking-widest">Vaqtni tanlang</h3>
              <button onClick={() => setShowRegModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={24}/></button>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-2 gap-4">
                {selectedSchedule.timeSlotStatistics?.map((slot, i) => (
                  <button
                    key={i}
                    disabled={slot.isFullyBooked}
                    onClick={() => setSelectedSlot(slot.timeSlot)}
                    className={`p-6 border-2 rounded-2xl text-center transition-all duration-300 ${selectedSlot === slot.timeSlot ? 'bg-hemis-accent border-hemis-accent text-white shadow-xl shadow-hemis-accent/20 scale-105' : slot.isFullyBooked ? 'bg-gray-100 text-gray-300 cursor-not-allowed opacity-50' : 'border-gray-50 hover:border-hemis-accent hover:bg-gray-50'}`}
                  >
                    <p className="text-base font-black">{slot.timeSlot}</p>
                    <p className="text-[10px] font-black uppercase opacity-70 mt-2">{slot.availableSeats} bo'sh</p>
                  </button>
                ))}
              </div>
              <button disabled={!selectedSlot || loading} onClick={handleRegister} className="w-full mt-10 py-5 bg-hemis-primary text-white font-heading text-xs uppercase tracking-widest rounded-xl disabled:opacity-50 shadow-xl shadow-hemis-primary/20 hover:bg-hemis-dark transition-all active:scale-[0.98]">
                {loading ? 'Yozilmoqda...' : 'Navbatni tasdiqlash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentHome;
