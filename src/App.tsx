import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Play, History, BookOpen, Settings, Info, X, Menu, Cpu, Github, ExternalLink, RefreshCw
} from 'lucide-react';
import { ConverterSettings, ConversionHistoryItem, ConversionStats } from './types';
import Dashboard from './components/Dashboard';
import ConverterPage from './components/ConverterPage';
import HistoryPage from './components/HistoryPage';
import Documentation from './components/Documentation';
import SettingsPage from './components/SettingsPage';

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
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [settings, setSettings] = useState<ConverterSettings>(DEFAULT_SETTINGS);
  const [history, setHistory] = useState<ConversionHistoryItem[]>([]);
  const [stats, setStats] = useState<ConversionStats>(DEFAULT_STATS);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

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

  const handleDeleteHistoryItem = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
  };

  const handleClearAllHistory = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus seluruh riwayat konversi?')) {
      setHistory([]);
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
    }
  };

  const handleResetAllStats = () => {
    if (window.confirm('Apakah Anda yakin ingin menyetel ulang seluruh statistik dasbor?')) {
      setStats(DEFAULT_STATS);
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(DEFAULT_STATS));
    }
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard stats={stats} onNavigate={setActiveTab} />;
      case 'converter':
        return <ConverterPage settings={settings} onSaveHistory={handleSaveHistory} />;
      case 'history':
        return (
          <HistoryPage 
            history={history} 
            onDeleteHistoryItem={handleDeleteHistoryItem} 
            onClearAllHistory={handleClearAllHistory} 
          />
        );
      case 'documentation':
        return <Documentation />;
      case 'settings':
        return (
          <SettingsPage 
            settings={settings} 
            onUpdateSettings={handleUpdateSettings} 
            onResetSettings={handleResetSettings} 
          />
        );
      default:
        return <Dashboard stats={stats} onNavigate={setActiveTab} />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'converter', label: 'Converter', icon: <Play size={18} fill="currentColor" className="text-inherit" /> },
    { id: 'history', label: 'History', icon: <History size={18} /> },
    { id: 'documentation', label: 'Documentation', icon: <BookOpen size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* LEFT SIDEBAR (Desktop) */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 shrink-0">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#fe4c6f] flex items-center justify-center text-white shadow-sm shadow-[#fe4c6f]/30">
            <Cpu size={18} className="animate-pulse" />
          </div>
          <div>
            <span className="font-extrabold text-slate-800 text-sm tracking-tight block leading-none">Canvas XML</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider block">Blogger Builder</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-semibold transition cursor-pointer ${
                  isActive 
                    ? 'bg-[#fe4c6f]/10 text-[#fe4c6f]' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer Area with reset and info */}
        <div className="p-4 border-t border-slate-100 space-y-2 shrink-0">
          <button
            onClick={handleResetAllStats}
            className="flex items-center justify-center gap-2 px-3 py-2 w-full border border-slate-150 rounded-lg text-xs font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 cursor-pointer transition"
          >
            <RefreshCw size={12} />
            Reset Dasbor Stats
          </button>
          
          <button
            onClick={() => setIsAboutOpen(true)}
            className="flex items-center justify-center gap-2 px-3 py-2 w-full bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer transition"
          >
            <Info size={13} />
            Tentang Pembuat
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER & DRAWER */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP NAVIGATION BAR */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
          
          {/* Mobile menu trigger / Brand */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 cursor-pointer"
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

          {/* Tab indicator for desktop */}
          <div className="hidden lg:flex items-center gap-2 text-sm font-semibold text-slate-700">
            <span className="text-slate-400 font-medium">Blogger Builder</span>
            <span className="text-slate-300">/</span>
            <span className="capitalize text-[#fe4c6f] font-bold">{activeTab}</span>
          </div>

          {/* Actions / Information Right elements */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-[#fe4c6f] bg-[#fe4c6f]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
              v1.0.0 Stable
            </span>
            <button
              onClick={() => setIsAboutOpen(true)}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition shrink-0 cursor-pointer"
              title="Tentang Konverter"
            >
              <Info size={16} />
            </button>
          </div>
        </header>

        {/* MOBILE MENU NAV DRAWER */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 bg-slate-900/40 z-40" onClick={() => setIsMobileMenuOpen(false)}>
            <div 
              className="w-64 bg-white h-full flex flex-col p-4 animate-slide-right"
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

              <nav className="flex-1 space-y-1">
                {navItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-xs font-semibold transition cursor-pointer ${
                        isActive 
                          ? 'bg-[#fe4c6f]/10 text-[#fe4c6f]' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-slate-100 space-y-2">
                <button
                  onClick={handleResetAllStats}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 w-full border border-slate-200 rounded text-[11px] font-bold text-slate-500 cursor-pointer"
                >
                  <RefreshCw size={11} />
                  Reset Dasbor Stats
                </button>
                <button
                  onClick={() => {
                    setIsAboutOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 w-full bg-slate-100 rounded text-[11px] font-semibold text-slate-700 cursor-pointer"
                >
                  <Info size={11} />
                  Tentang Pembuat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN BODY SCROLLABLE WINDOW */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl w-full mx-auto">
          {renderActivePage()}
        </main>
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
              <span className="text-slate-400 font-semibold">Dibuat oleh AI Studio Developer</span>
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
