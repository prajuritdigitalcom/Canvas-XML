import React, { useState, useEffect } from 'react';
import { 
  Info, X, Menu, Cpu, RefreshCw, Heart, Settings, FileText, Lock
} from 'lucide-react';
import { ConverterSettings, ConversionHistoryItem, ConversionStats } from './types';
import ConverterPage from './components/ConverterPage';

const STORAGE_KEYS = {
  SETTINGS: 'canvas_blogger_settings',
  HISTORY: 'canvas_blogger_history',
  STATS: 'canvas_blogger_stats'
};

const DEFAULT_SETTINGS: ConverterSettings = {
  autoDownload: false,
  beautifyXml: true,
  compressXml: false,
  rememberLastSettings: true,
  autoSaveHistory: true
};

const DEFAULT_STATS: ConversionStats = {
  totalProcessed: 0,
  totalSuccess: 0,
  totalFailed: 0,
  lastConvertTime: null
};

export default function App() {
  const [settings, setSettings] = useState<ConverterSettings>(DEFAULT_SETTINGS);
  const [history, setHistory] = useState<ConversionHistoryItem[]>([]);
  const [stats, setStats] = useState<ConversionStats>(DEFAULT_STATS);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('pd_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;

    setIsVerifying(true);
    setAuthError('');

    try {
      const response = await fetch('/api/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: passwordInput.trim() }),
      });
      const data = await response.json();
      if (data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem('pd_auth', 'true');
      } else {
        setAuthError(data.error || 'Password salah!');
      }
    } catch (err) {
      setAuthError('Gagal menghubungkan ke server untuk verifikasi.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Initialize state from local storage
  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }

      const storedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }

      const storedStats = localStorage.getItem(STORAGE_KEYS.STATS);
      if (storedStats) {
        setStats(JSON.parse(storedStats));
      }
    } catch (e) {
      console.error('Error loading data from localStorage', e);
    }
  }, []);

  // Save Settings when changed
  const handleUpdateSettings = (newSettings: Partial<ConverterSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    if (updated.rememberLastSettings) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    } else {
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    }
  };

  const handleResetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  };

  // Add Item to History
  const handleSaveHistory = (
    fileName: string,
    status: 'success' | 'failed',
    inputSize: number,
    outputSize: number,
    xmlContent?: string,
    errorMessage?: string
  ) => {
    // 1. Update stats
    const updatedStats: ConversionStats = {
      totalProcessed: stats.totalProcessed + 1,
      totalSuccess: status === 'success' ? stats.totalSuccess + 1 : stats.totalSuccess,
      totalFailed: status === 'failed' ? stats.totalFailed + 1 : stats.totalFailed,
      lastConvertTime: new Date().toISOString()
    };
    setStats(updatedStats);
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(updatedStats));

    // 2. Add history entry if autoSaveHistory is true
    if (settings.autoSaveHistory) {
      const newItem: ConversionHistoryItem = {
        id: crypto.randomUUID(),
        fileName,
        timestamp: new Date().toISOString(),
        status,
        inputSize,
        outputSize,
        xmlContent,
        errorMessage
      };

      const updatedHistory = [newItem, ...history];
      setHistory(updatedHistory);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updatedHistory));
    }
  };

  const handleResetAllStats = () => {
    setStats(DEFAULT_STATS);
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(DEFAULT_STATS));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-xl space-y-6 animate-fade-in">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-[#fe4c6f]/10 text-[#fe4c6f] flex items-center justify-center shadow-inner">
              <Lock size={28} className="animate-bounce" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Website Terkunci</h2>
              <p className="text-xs text-slate-500 mt-1">Silakan masukkan password untuk mengakses konverter.</p>
            </div>
          </div>

          <form onSubmit={handleVerifyPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="password-input" className="text-xs font-bold text-slate-600 block">Password</label>
              <input
                id="password-input"
                type="password"
                placeholder="Masukkan password di sini..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                disabled={isVerifying}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#fe4c6f] text-sm font-semibold transition disabled:bg-slate-50"
              />
              {authError && (
                <p className="text-xs text-rose-600 font-bold mt-1 flex items-center gap-1">
                  <span>⚠️</span> {authError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3 bg-[#fe4c6f] hover:bg-[#e03a5a] text-white font-extrabold rounded-xl transition cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed text-sm shadow-md shadow-[#fe4c6f]/20 flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Memverifikasi...
                </>
              ) : (
                'Buka Akses'
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">&copy; 2026 Karya Prajurit Digital</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* LEFT CONTROL SIDEBAR (Desktop) */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 shrink-0 shadow-sm">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#fe4c6f] flex items-center justify-center text-white shadow-sm shadow-[#fe4c6f]/30">
            <Cpu size={18} className="animate-pulse" />
          </div>
          <div>
            <span className="font-extrabold text-slate-800 text-sm tracking-tight block leading-none">Canvas XML</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider block">Blogger Builder</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 px-5 py-6 space-y-6 overflow-y-auto">
          {/* Quick Settings Section */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Settings size={12} /> Pengaturan Konversi
            </h3>
            
            <div className="space-y-3">
              {/* Auto Download */}
              <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-700 block">Unduhan Otomatis</span>
                  <span className="text-[10px] text-slate-400 block leading-tight">Unduh XML setelah selesai</span>
                </div>
                <button
                  onClick={() => handleUpdateSettings({ autoDownload: !settings.autoDownload })}
                  className={`w-9 h-5 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                    settings.autoDownload ? 'bg-[#fe4c6f]' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                      settings.autoDownload ? 'right-0.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Beautify XML */}
              <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-700 block">Rapikan Kode</span>
                  <span className="text-[10px] text-slate-400 block leading-tight">Tata letak XML rapi</span>
                </div>
                <button
                  disabled={settings.compressXml}
                  onClick={() => handleUpdateSettings({ beautifyXml: !settings.beautifyXml })}
                  className={`w-9 h-5 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                    settings.compressXml ? 'bg-slate-100 opacity-50 cursor-not-allowed' : (settings.beautifyXml ? 'bg-[#fe4c6f]' : 'bg-slate-200')
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                      !settings.compressXml && settings.beautifyXml ? 'right-0.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Compress XML */}
              <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-700 block">Kompresi XML</span>
                  <span className="text-[10px] text-slate-400 block leading-tight">Hapus spasi/baris baru</span>
                </div>
                <button
                  onClick={() => {
                    const newCompress = !settings.compressXml;
                    handleUpdateSettings({
                      compressXml: newCompress,
                      beautifyXml: newCompress ? false : settings.beautifyXml
                    });
                  }}
                  className={`w-9 h-5 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                    settings.compressXml ? 'bg-[#fe4c6f]' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                      settings.compressXml ? 'right-0.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <FileText size={12} /> Statistik Sesi
            </h3>
            
            <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-bold block">Diproses</span>
                  <span className="text-lg font-bold text-slate-700">{stats.totalProcessed}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-bold block">Berhasil</span>
                  <span className="text-lg font-bold text-emerald-600">{stats.totalSuccess}</span>
                </div>
              </div>

              <button
                onClick={handleResetAllStats}
                className="flex items-center justify-center gap-1.5 py-1.5 w-full bg-white hover:bg-rose-50 hover:text-rose-600 border border-slate-200 hover:border-rose-100 rounded-lg text-[10px] font-bold text-slate-500 transition cursor-pointer"
              >
                <RefreshCw size={10} />
                Reset Statistik
              </button>
            </div>
          </div>
        </div>

      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP NAVIGATION BAR */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-sm">
          {/* Mobile hamburger menu / Brand */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 cursor-pointer"
              title="Menu Pengaturan"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#fe4c6f] flex items-center justify-center text-white">
                <Cpu size={14} />
              </div>
              <span className="font-bold text-slate-800 text-xs tracking-tight">Canvas XML</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-sm font-semibold text-slate-700">
            <span className="text-slate-400 font-medium">Blogger Builder</span>
            <span className="text-slate-300">/</span>
            <span className="text-[#fe4c6f] font-bold">Studio Konversi Instant</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-[#fe4c6f] bg-[#fe4c6f]/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
              v1.0.0 Stable
            </span>
          </div>
        </header>

        {/* MOBILE SETTINGS & STATS DRAWER */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 bg-slate-900/40 z-40" onClick={() => setIsMobileMenuOpen(false)}>
            <div 
              className="w-72 bg-white h-full flex flex-col p-4 animate-slide-right animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#fe4c6f] flex items-center justify-center text-white">
                    <Cpu size={16} />
                  </div>
                  <span className="font-bold text-slate-800 text-sm">Canvas XML</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded text-slate-500 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Mobile settings form elements */}
              <div className="flex-1 space-y-6 overflow-y-auto">
                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pengaturan Konversi</h3>
                  
                  {/* Auto Download */}
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-700 block">Unduhan Otomatis</span>
                    </div>
                    <button
                      onClick={() => handleUpdateSettings({ autoDownload: !settings.autoDownload })}
                      className={`w-9 h-5 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                        settings.autoDownload ? 'bg-[#fe4c6f]' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                          settings.autoDownload ? 'right-0.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Beautify */}
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-700 block">Rapikan Kode</span>
                    </div>
                    <button
                      disabled={settings.compressXml}
                      onClick={() => handleUpdateSettings({ beautifyXml: !settings.beautifyXml })}
                      className={`w-9 h-5 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                        settings.compressXml ? 'bg-slate-100 opacity-50 cursor-not-allowed' : (settings.beautifyXml ? 'bg-[#fe4c6f]' : 'bg-slate-200')
                      }`}
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                          !settings.compressXml && settings.beautifyXml ? 'right-0.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Compress */}
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-700 block">Kompresi XML</span>
                    </div>
                    <button
                      onClick={() => {
                        const newCompress = !settings.compressXml;
                        handleUpdateSettings({
                          compressXml: newCompress,
                          beautifyXml: newCompress ? false : settings.beautifyXml
                        });
                      }}
                      className={`w-9 h-5 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                        settings.compressXml ? 'bg-[#fe4c6f]' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                          settings.compressXml ? 'right-0.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Statistik Sesi</h3>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block">Diproses</span>
                      <span className="text-base font-bold text-slate-700">{stats.totalProcessed}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block">Berhasil</span>
                      <span className="text-base font-bold text-emerald-600">{stats.totalSuccess}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleResetAllStats}
                    className="flex items-center justify-center gap-1 px-3 py-2 w-full border border-slate-200 rounded text-xs font-bold text-slate-500 cursor-pointer"
                  >
                    <RefreshCw size={11} />
                    Reset Statistik
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* MAIN BODY SCROLLABLE WINDOW */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl w-full mx-auto">
          <ConverterPage settings={settings} onSaveHistory={handleSaveHistory} />
        </main>

        {/* BOTTOM GLOBAL FOOTER */}
        <footer className="bg-white border-t border-slate-200 py-6 px-4 md:px-8 text-center">
          <div className="max-w-7xl mx-auto text-xs text-slate-500 font-medium">
            &copy; 2026 Karya Prajurit Digital
          </div>
        </footer>
      </div>

      {/* ABOUT POPUP MODAL */}
      {isAboutOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setIsAboutOpen(false)}
        >
          <div 
            className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 max-w-lg w-full relative space-y-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsAboutOpen(false)}
              className="absolute right-4 top-4 p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 rounded-xl bg-[#fe4c6f] text-white flex items-center justify-center shadow-lg shadow-[#fe4c6f]/20 shrink-0">
                <Cpu size={24} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-800">Canvas HTML to Blogger XML</h2>
                <p className="text-xs text-slate-500">Versi Stable v1.0.0 • Pemrosesan Berkas Lokal</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
              <p>
                Aplikasi ini dikembangkan untuk mempermudah para narablog (Blogger Indonesia) dan Web Developer mengonversi hasil ekspor HTML interaktif dari <strong>Gemini Canvas</strong> menjadi Template XML siap unggah di Blogger.com.
              </p>
              <p>
                Membawa seluruh algoritma andal dari notebook Google Colab ke sebuah platform web modern, konverter ini menyederhanakan alur konversi tanpa perlu memasang library Python atau mendelegasikan data Anda ke server awan luar.
              </p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2">
                <h3 className="font-bold text-slate-800">Prinsip Privasi &amp; Keamanan Data</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Semua dokumen HTML murni yang Anda pilih dianalisis, dimodifikasi, dan dirapikan seutuhnya di memori browser lokal Anda. Sistem kami tidak akan pernah mengirimkan berkas atau potongan kode apa pun ke server mana pun di internet. Keamanan privasi kode Anda adalah jaminan 100%.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <span className="text-slate-700 font-extrabold flex items-center gap-1">
                <Heart size={12} className="text-[#fe4c6f] fill-[#fe4c6f]" /> Karya Prajurit Digital
              </span>
              <button
                onClick={() => setIsAboutOpen(false)}
                className="px-5 py-2 bg-[#fe4c6f] hover:bg-[#e03a5a] text-white font-bold rounded-lg cursor-pointer transition text-center"
              >
                Tutup Info
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
