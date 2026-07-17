import React from 'react';
import { Trash2, Download, CheckCircle, XCircle, FileCode, Search, History } from 'lucide-react';
import { ConversionHistoryItem } from '../types';

interface HistoryPageProps {
  history: ConversionHistoryItem[];
  onDeleteHistoryItem: (id: string) => void;
  onClearAllHistory: () => void;
}

export default function HistoryPage({ history, onDeleteHistoryItem, onClearAllHistory }: HistoryPageProps) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownloadXml = (item: ConversionHistoryItem) => {
    if (!item.xmlContent) return;
    const baseName = item.fileName.replace(/\.[^/.]+$/, "");
    const outputFilename = `${baseName}_blogger_theme.xml`;
    const blob = new Blob([item.xmlContent], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', outputFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredHistory = history.filter(item => 
    item.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Riwayat Konversi</h1>
          <p className="text-xs text-slate-500 font-medium">Sesi riwayat konversi Anda tersimpan secara aman di dalam penyimpanan browser (Local Storage).</p>
        </div>
        
        {history.length > 0 && (
          <button
            onClick={onClearAllHistory}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold border border-rose-100 cursor-pointer transition active:scale-95"
          >
            <Trash2 size={13} />
            Hapus Semua Riwayat
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="mx-auto w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center">
            <History size={22} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-700 text-sm">Riwayat Kosong</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Anda belum melakukan konversi file apa pun dalam sesi ini. Mulai konversi pertama Anda sekarang!
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Search box header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama berkas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#fe4c6f] w-full transition-all"
              />
            </div>
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
              Total {filteredHistory.length} entri
            </span>
          </div>

          {/* History List Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                  <th className="p-4">Nama File</th>
                  <th className="p-4">Waktu Konversi</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Ukuran Input</th>
                  <th className="p-4">Ukuran Output</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 font-semibold text-slate-800 flex items-center gap-2">
                      <FileCode size={14} className="text-[#fe4c6f]" />
                      <span className="truncate max-w-[200px] md:max-w-xs" title={item.fileName}>
                        {item.fileName}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 whitespace-nowrap">
                      {new Date(item.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {new Date(item.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4">
                      {item.status === 'success' ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 font-semibold px-2 py-0.5 rounded text-[10px]">
                          <CheckCircle size={10} /> Sukses
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-600 font-semibold px-2 py-0.5 rounded text-[10px]" title={item.errorMessage}>
                          <XCircle size={10} /> Gagal
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-500 whitespace-nowrap">{formatFileSize(item.inputSize)}</td>
                    <td className="p-4 text-slate-500 whitespace-nowrap">
                      {item.status === 'success' ? formatFileSize(item.outputSize) : '-'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.status === 'success' && item.xmlContent && (
                          <button
                            onClick={() => handleDownloadXml(item)}
                            className="p-1.5 hover:bg-slate-100 hover:text-[#fe4c6f] border border-slate-150 rounded text-slate-500 cursor-pointer transition"
                            title="Unduh XML Lagi"
                          >
                            <Download size={13} />
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteHistoryItem(item.id)}
                          className="p-1.5 hover:bg-rose-50 hover:text-rose-600 border border-slate-150 rounded text-slate-500 cursor-pointer transition"
                          title="Hapus Entri"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
