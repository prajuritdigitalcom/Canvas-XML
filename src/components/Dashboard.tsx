import React from 'react';
import { Play, History, BookOpen, Settings, FileText, CheckCircle2, XCircle, Clock, Cpu } from 'lucide-react';
import { ConversionStats } from '../types';

interface DashboardProps {
  stats: ConversionStats;
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ stats, onNavigate }: DashboardProps) {
  const formattedTime = stats.lastConvertTime
    ? new Date(stats.lastConvertTime).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }) + ' ' + new Date(stats.lastConvertTime).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : 'Belum ada aktivitas';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#fe4c6f]/10 to-[#fe4c6f]/5 border border-[#fe4c6f]/20 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
            Canvas HTML to Blogger Template Builder
          </h1>
          <p className="text-sm md:text-base text-slate-600 max-w-2xl leading-relaxed">
            Konversi file HTML hasil ekspor Gemini Canvas Anda menjadi Template Blogger XML yang valid, siap pakai, dan bebas dari error secara instan langsung di browser Anda.
          </p>
        </div>
        <button
          id="btn-quick-start"
          onClick={() => onNavigate('converter')}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#fe4c6f] hover:bg-[#e03a5a] text-white font-medium rounded-xl transition shadow-sm hover:shadow active:scale-95 cursor-pointer whitespace-nowrap self-start md:self-auto"
        >
          <Play size={18} fill="currentColor" />
          Mulai Konversi
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Processed */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:border-[#fe4c6f]/30 transition-colors">
          <div className="p-3 bg-slate-100 rounded-lg text-slate-600">
            <FileText size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total File Diproses</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">{stats.totalProcessed}</p>
          </div>
        </div>

        {/* Total Success */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:border-[#fe4c6f]/30 transition-colors">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Berhasil</p>
            <p className="text-2xl font-bold text-emerald-600 mt-0.5">{stats.totalSuccess}</p>
          </div>
        </div>

        {/* Total Failed */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:border-[#fe4c6f]/30 transition-colors">
          <div className="p-3 bg-rose-50 rounded-lg text-rose-600">
            <XCircle size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Gagal</p>
            <p className="text-2xl font-bold text-rose-600 mt-0.5">{stats.totalFailed}</p>
          </div>
        </div>

        {/* Last Conversion */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:border-[#fe4c6f]/30 transition-colors">
          <div className="p-3 bg-[#fe4c6f]/5 rounded-lg text-[#fe4c6f]">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Waktu Konversi Terakhir</p>
            <p className="text-sm font-semibold text-slate-700 mt-1 line-clamp-1">{formattedTime}</p>
          </div>
        </div>
      </div>

      {/* Extra Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Menu */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Cpu size={20} className="text-[#fe4c6f]" /> Menu Pintas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => onNavigate('converter')}
              className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-[#fe4c6f]/30 hover:bg-[#fe4c6f]/5 transition text-left group cursor-pointer"
            >
              <div className="p-2.5 bg-[#fe4c6f]/10 text-[#fe4c6f] rounded-lg group-hover:scale-105 transition-transform">
                <Play size={18} fill="currentColor" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">Konverter Utama</h3>
                <p className="text-xs text-slate-500 mt-0.5">Unggah, validasi, dan unduh Template Blogger XML Anda sekarang.</p>
              </div>
            </button>

            <button
              onClick={() => onNavigate('history')}
              className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-[#fe4c6f]/30 hover:bg-[#fe4c6f]/5 transition text-left group cursor-pointer"
            >
              <div className="p-2.5 bg-slate-100 text-slate-600 rounded-lg group-hover:scale-105 transition-transform">
                <History size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">Riwayat Konversi</h3>
                <p className="text-xs text-slate-500 mt-0.5">Lihat kembali file-file XML yang pernah Anda konversi secara lokal.</p>
              </div>
            </button>

            <button
              onClick={() => onNavigate('documentation')}
              className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-[#fe4c6f]/30 hover:bg-[#fe4c6f]/5 transition text-left group cursor-pointer"
            >
              <div className="p-2.5 bg-slate-100 text-slate-600 rounded-lg group-hover:scale-105 transition-transform">
                <BookOpen size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">Dokumentasi</h3>
                <p className="text-xs text-slate-500 mt-0.5">Panduan lengkap langkah konversi dan penyetelan template.</p>
              </div>
            </button>

            <button
              onClick={() => onNavigate('settings')}
              className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-[#fe4c6f]/30 hover:bg-[#fe4c6f]/5 transition text-left group cursor-pointer"
            >
              <div className="p-2.5 bg-slate-100 text-slate-600 rounded-lg group-hover:scale-105 transition-transform">
                <Settings size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">Pengaturan</h3>
                <p className="text-xs text-slate-500 mt-0.5">Ubah aturan unduhan otomatis, beautify XML, atau kompresi.</p>
              </div>
            </button>
          </div>
        </div>

        {/* Info Column */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Cpu size={20} className="text-[#fe4c6f]" /> Info Sistem
            </h2>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                <span className="text-slate-500">Versi Konverter</span>
                <span className="font-bold text-[#fe4c6f] bg-[#fe4c6f]/5 px-2 py-0.5 rounded text-xs">v1.0.0</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                <span className="text-slate-500">Penyimpanan Lokal</span>
                <span className="font-medium text-slate-700">Tersedia</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                <span className="text-slate-500">Keamanan File</span>
                <span className="font-medium text-slate-700 text-right">In-Browser (100% Aman)</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Platform Target</span>
                <span className="font-medium text-slate-700">Blogger / Blogspot</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              Setiap berkas diproses sepenuhnya di browser Anda. Tidak ada data yang diunggah ke server luar atau disimpan secara daring.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
