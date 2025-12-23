
import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { apiService } from '../../services/api';
import { QrCode, CheckCircle, AlertCircle, RefreshCw, X, User as UserIcon, Clock, Zap, CameraOff } from 'lucide-react';

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
        // DOM element tayyorligini kutish
        await new Promise(r => setTimeout(r, 600));
        
        if (scannerRef.current) {
          try {
            if (scannerRef.current.isScanning) {
              await scannerRef.current.stop();
            }
            await scannerRef.current.clear();
          } catch(e) {}
        }

        const html5QrCode = new Html5Qrcode(scannerId);
        scannerRef.current = html5QrCode;

        const config = { 
          fps: 15,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
              const minEdgeId = Math.min(viewfinderWidth, viewfinderHeight);
              const boxSize = Math.floor(minEdgeId * 0.7);
              return { width: boxSize, height: boxSize };
          },
          aspectRatio: 1.0,
          formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ]
        };

        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          onScanSuccess,
          () => {} // Ignored
        );
      } catch (err: any) {
        console.error("Scanner startup error:", err);
        setScanning(false);
        const errStr = err.toString();
        if (errStr.includes('NotFoundError') || errStr.includes('Requested device not found')) {
          setError("Kamera qurilmasi topilmadi. Iltimos, qurilmada kamera mavjudligini va brauzerda unga ruxsat berilganini tekshiring.");
        } else if (errStr.includes('NotAllowedError')) {
          setError("Kameradan foydalanish uchun ruxsat berilmagan.");
        } else {
          setError("Kamerani ishga tushirishda kutilmagan xatolik yuz berdi.");
        }
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
    
    if (window.navigator.vibrate) window.navigator.vibrate([100]);

    setLoading(true);
    setScanning(false);

    if (scannerRef.current) {
        try {
            if (scannerRef.current.isScanning) {
                await scannerRef.current.stop();
            }
            await scannerRef.current.clear();
        } catch(e) {}
    }

    try {
      const data = await apiService.scanQr(decodedText);
      
      // Talabani keldi deb belgilash
      if (data && data.student?.hemisId && data.catchupScheduleId) {
          await apiService.markStudentArrived(data.student.hemisId, data.catchupScheduleId);
      }
      
      setResult(data);
    } catch (err: any) {
      setError(err.message || "QR kod yaroqsiz yoki tasdiqlashda xatolik.");
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
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="bg-white dark:bg-slate-900 p-6 lg:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center relative overflow-hidden transition-colors">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-blue-400 to-primary opacity-30"></div>
        
        <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-2 tracking-tight">
                <Zap className="text-primary fill-primary" size={24} /> QR SKANER
            </h2>
            <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-2">Talaba kelganligini tasdiqlash</p>
        </div>

        {scanning ? (
          <div className="w-full relative max-w-[320px]">
            <div 
                id={scannerId} 
                className="overflow-hidden rounded-[2.5rem] border-[6px] border-white dark:border-slate-800 shadow-2xl bg-black aspect-square relative"
            >
                {!error && (
                  <div className="absolute inset-0 z-10 pointer-events-none">
                      <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                      <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                      <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                      <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                      
                      <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-start">
                           <div className="w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_rgba(30,64,175,0.8)] animate-[scan_3s_linear_infinite]"></div>
                      </div>
                  </div>
                )}
            </div>
          </div>
        ) : (
          <div className="w-full space-y-6 py-4 animate-in zoom-in duration-300">
            {loading ? (
                <div className="text-center py-16 flex flex-col items-center">
                    <RefreshCw className="text-primary animate-spin mb-6" size={64} />
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Qabul qilinmoqda...</h3>
                </div>
            ) : error ? (
                <div className="text-center space-y-6">
                    <div className="bg-red-50 dark:bg-red-900/10 w-24 h-24 rounded-full flex items-center justify-center text-red-500 mx-auto border border-red-100 dark:border-red-900/20 shadow-inner">
                        <CameraOff size={48} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-red-600 tracking-tight">Xatolik</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-2 max-w-xs mx-auto leading-relaxed">{error}</p>
                    </div>
                    <button onClick={handleReset} className="w-full py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl">
                        Qayta urinib ko'rish
                    </button>
                </div>
            ) : (
                <div className="text-center space-y-8 animate-in slide-in-from-bottom duration-500">
                    <div className="bg-green-50 dark:bg-green-900/10 w-24 h-24 rounded-[2rem] flex items-center justify-center text-green-500 mx-auto shadow-lg border border-green-100 dark:border-green-900/20">
                        <CheckCircle size={48} />
                    </div>
                    
                    <div className="bg-slate-50/50 dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-700 overflow-hidden text-left shadow-sm">
                        <div className="bg-white dark:bg-slate-900 p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
                            <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black text-xl">
                                {result?.student?.fullName?.charAt(0) || 'S'}
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Talaba ma'lumoti</p>
                                <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{result?.student?.fullName || result?.studentName}</p>
                            </div>
                        </div>
                        
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Hemis ID</p>
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{result?.student?.hemisId || 'Noma\'lum'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Fakultet / Kurs</p>
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{result?.student?.facultet?.name || '---'} ({result?.student?.course}-kurs)</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Belgilangan vaqt</p>
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"><Clock size={16}/> {result?.selectedTimeSlot || 'Noma\'lum'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Holati</p>
                                    <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-black uppercase rounded-md shadow-sm border border-green-200 dark:border-green-800">Tasdiqlandi</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button onClick={handleReset} className="w-full py-5 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 active:scale-95">
                        Keyingi talaba
                    </button>
                </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(20px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(260px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default AdminScanner;
