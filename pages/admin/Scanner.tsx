
import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { apiService } from '../../services/api';
import { QrCode, CheckCircle, AlertCircle, RefreshCw, X, User as UserIcon, GraduationCap, Calendar, Clock, Zap } from 'lucide-react';

const AdminScanner: React.FC = () => {
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerId = "reader";

  useEffect(() => {
    const startScanner = async () => {
      try {
        // DOM tayyorligini kutish
        await new Promise(r => setTimeout(r, 200));
        
        // Agar eski skaner bo'lsa to'xtatish
        if (scannerRef.current) {
          try { await scannerRef.current.clear(); } catch(e) {}
        }

        const html5QrCode = new Html5Qrcode(scannerId);
        scannerRef.current = html5QrCode;

        const config = { 
          fps: 24, // Yuqori kadr tezligi (Telegram kabi tez ishlashi uchun)
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
              const minEdgeId = Math.min(viewfinderWidth, viewfinderHeight);
              const fontSize = Math.floor(minEdgeId * 0.7);
              return { width: fontSize, height: fontSize };
          },
          aspectRatio: 1.0,
          formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ] // Faqat QR qidirish tezlikni oshiradi
        };

        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          onScanSuccess,
          (errorMessage) => {
              // Har bir kadrda QR topilmasa xato bermaslik uchun bo'sh qoldiramiz
          }
        );
      } catch (err) {
        console.error("Scanner startup error:", err);
        setError("Kameraga ulanishda xatolik yuz berdi. Iltimos, kamera ruxsatini tekshiring.");
      }
    };

    if (scanning && !loading && !result) {
        startScanner();
    }

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(e => console.error("Error stopping scanner", e));
      }
    };
  }, [scanning, loading, result]);

  const onScanSuccess = async (decodedText: string) => {
    if (loading || result) return;
    
    // Muvaffaqiyatli topilganda tebranish (vibration)
    if (window.navigator.vibrate) window.navigator.vibrate([100]);

    setLoading(true);
    setScanning(false);

    // Skanerni darhol to'xtatish
    if (scannerRef.current) {
        try {
            await scannerRef.current.stop();
            await scannerRef.current.clear();
        } catch(e) {}
    }

    try {
      const data = await apiService.scanQr(decodedText);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "QR kod bazadan topilmadi yoki yaroqsiz.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setScanning(true);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-6 lg:p-10 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center relative overflow-hidden">
        {/* Yuqori dekorativ chiziq */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-hemis-accent via-blue-400 to-hemis-accent opacity-30"></div>
        
        <div className="text-center mb-8">
            <h2 className="text-xl font-heading text-gray-900 flex items-center justify-center gap-2 tracking-tight">
                <Zap className="text-hemis-accent fill-hemis-accent" size={24} /> Tezkor Skaner
            </h2>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2">QR kodni avtomatik aniqlash</p>
        </div>

        {scanning ? (
          <div className="w-full relative max-w-[320px]">
            {/* Skaner konteyneri */}
            <div 
                id={scannerId} 
                className="overflow-hidden rounded-[2.5rem] border-[6px] border-white shadow-2xl bg-black aspect-square relative"
            >
                {/* Telegram uslubidagi burchaklar */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                    <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-hemis-accent rounded-tl-lg"></div>
                    <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-hemis-accent rounded-tr-lg"></div>
                    <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-hemis-accent rounded-bl-lg"></div>
                    <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-hemis-accent rounded-br-lg"></div>
                    
                    {/* Skanerlash chizig'i (Scanning Line) */}
                    <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-start">
                         <div className="w-full h-1 bg-gradient-to-r from-transparent via-hemis-accent to-transparent shadow-[0_0_15px_rgba(52,152,219,0.8)] animate-[scan_3s_linear_infinite]"></div>
                    </div>
                </div>
            </div>
            
            <div className="mt-8 flex flex-col items-center gap-2">
                <div className="px-4 py-2 bg-gray-50 rounded-full border border-gray-100 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Kamera faol</span>
                </div>
                <p className="text-[10px] font-bold text-gray-400 text-center mt-2">
                    QR kodni ramka ichiga joylashtiring
                </p>
            </div>
          </div>
        ) : (
          <div className="w-full space-y-6 py-4 animate-in zoom-in duration-300">
            {loading ? (
                <div className="text-center py-16 flex flex-col items-center">
                    <div className="relative mb-6">
                        <RefreshCw className="text-hemis-accent animate-spin" size={64} />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <QrCode size={24} className="text-hemis-accent/30" />
                        </div>
                    </div>
                    <h3 className="font-heading text-lg text-gray-900 tracking-tight">Ma'lumotlar o'qilmoqda</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2">Iltimos, kuting...</p>
                </div>
            ) : error ? (
                <div className="text-center space-y-6">
                    <div className="bg-red-50 w-24 h-24 rounded-full flex items-center justify-center text-red-500 mx-auto shadow-inner">
                        <X size={48} />
                    </div>
                    <div>
                        <h3 className="text-xl font-heading text-red-600 tracking-tight">Xatolik</h3>
                        <p className="text-sm text-gray-500 font-medium mt-2 max-w-xs mx-auto">{error}</p>
                    </div>
                    <button 
                        onClick={handleReset}
                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-95"
                    >
                        Qayta urinish
                    </button>
                </div>
            ) : (
                <div className="text-center space-y-8 animate-in slide-in-from-bottom duration-500">
                    <div className="bg-green-50 w-24 h-24 rounded-[2rem] flex items-center justify-center text-green-500 mx-auto shadow-lg shadow-green-100/50">
                        <CheckCircle size={48} />
                    </div>
                    
                    <div className="bg-gray-50/50 rounded-[2.5rem] border-2 border-gray-100 overflow-hidden text-left shadow-sm">
                        <div className="bg-white p-5 border-b border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-hemis-accent/10 rounded-xl flex items-center justify-center text-hemis-accent">
                                <UserIcon size={24} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Talaba ma'lumoti</p>
                                <p className="font-heading text-base text-gray-900 tracking-tight">{result?.student?.fullName || result?.studentName || 'Ma\'lumot topilmadi'}</p>
                            </div>
                        </div>
                        
                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Fakultet</p>
                                    <p className="text-xs font-bold text-gray-800 leading-tight">{result?.student?.facultet?.name || '---'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Guruh/Kurs</p>
                                    <p className="text-xs font-bold text-gray-800">{result?.student?.course}-kurs</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Vaqti</p>
                                    <p className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><Clock size={12}/> {result?.selectedTimeSlot || '---'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Holat</p>
                                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-[9px] font-black uppercase rounded-md">Qabul qilindi</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleReset}
                        className="w-full py-4 bg-hemis-primary text-white rounded-2xl font-heading text-xs uppercase tracking-widest hover:bg-hemis-dark transition-all shadow-xl shadow-hemis-primary/20 active:scale-95"
                    >
                        Keyingi talaba
                    </button>
                </div>
            )}
          </div>
        )}
      </div>

      {/* Qo'shimcha CSS animatsiya uchun */}
      <style>{`
        @keyframes scan {
          0% { transform: translateY(20px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(260px); opacity: 0; }
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminScanner;
