import React from 'react';
import { Settings, Save, RefreshCw, CheckCircle, HelpCircle } from 'lucide-react';
import { ConverterSettings } from '../types';

interface SettingsPageProps {
  settings: ConverterSettings;
  onUpdateSettings: (settings: Partial<ConverterSettings>) => void;
  onResetSettings: () => void;
}

export default function SettingsPage({ settings, onUpdateSettings, onResetSettings }: SettingsPageProps) {
  const [showToast, setShowToast] = React.useState(false);

  const handleToggle = (key: keyof ConverterSettings) => {
    onUpdateSettings({ [key]: !settings[key] });
    triggerSaveNotification();
  };

  const triggerSaveNotification = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Pengaturan</h1>
          <p className="text-xs text-slate-500 font-medium">Atur preferensi pemrosesan dan unduhan otomatis template Anda.</p>
        </div>
        
        <button
          onClick={() => {
            onResetSettings();
            triggerSaveNotification();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-semibold rounded-lg text-xs cursor-pointer transition active:scale-95"
        >
          <RefreshCw size={13} />
          Reset ke Bawaan
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
        {/* Toggle List */}
        <div className="space-y-5 divide-y divide-slate-100">
          
          {/* Auto Download */}
          <div className="flex items-start justify-between gap-4 pt-0">
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700 cursor-pointer block" htmlFor="auto-download">
                Unduhan Otomatis (Auto Download)
              </label>
              <p className="text-xs text-slate-500 leading-relaxed max-w-md">
                Secara otomatis mengunduh berkas XML tema Blogger setelah proses konversi selesai tanpa harus menekan tombol unduh.
              </p>
            </div>
            <button
              id="auto-download"
              onClick={() => handleToggle('autoDownload')}
              className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none shrink-0 cursor-pointer ${
                settings.autoDownload ? 'bg-[#fe4c6f]' : 'bg-slate-200'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  settings.autoDownload ? 'right-1 translate-x-0' : 'left-1 translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Beautify XML */}
          <div className="flex items-start justify-between gap-4 pt-5">
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700 cursor-pointer block" htmlFor="beautify-xml">
                Rapikan Kode XML (Beautify XML)
              </label>
              <p className="text-xs text-slate-500 leading-relaxed max-w-md">
                Mengindentasi dan merapikan susunan tag-tag XML Blogger agar rapi dan mudah dibaca oleh developer (rekomendasi: aktif).
              </p>
            </div>
            <button
              id="beautify-xml"
              disabled={settings.compressXml}
              onClick={() => handleToggle('beautifyXml')}
              className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none shrink-0 cursor-pointer ${
                settings.compressXml ? 'bg-slate-100 opacity-50 cursor-not-allowed' : (settings.beautifyXml ? 'bg-[#fe4c6f]' : 'bg-slate-200')
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  !settings.compressXml && settings.beautifyXml ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Compress XML */}
          <div className="flex items-start justify-between gap-4 pt-5">
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700 cursor-pointer block" htmlFor="compress-xml">
                Kompresi Kode XML (Compress XML)
              </label>
              <p className="text-xs text-slate-500 leading-relaxed max-w-md">
                Menghapus spasi berlebih, baris baru, dan komentar di luar blok CDATA untuk meminimalkan ukuran file template Blogger (kecepatan render terbaik).
              </p>
            </div>
            <button
              id="compress-xml"
              onClick={() => {
                const newCompress = !settings.compressXml;
                onUpdateSettings({ 
                  compressXml: newCompress,
                  // If compress is enabled, we cannot beautify at same time
                  beautifyXml: newCompress ? false : settings.beautifyXml
                });
                triggerSaveNotification();
              }}
              className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none shrink-0 cursor-pointer ${
                settings.compressXml ? 'bg-[#fe4c6f]' : 'bg-slate-200'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  settings.compressXml ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Remember Settings */}
          <div className="flex items-start justify-between gap-4 pt-5">
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700 cursor-pointer block" htmlFor="remember-settings">
                Ingat Pengaturan (Remember Last Settings)
              </label>
              <p className="text-xs text-slate-500 leading-relaxed max-w-md">
                Menyimpan pilihan pengaturan Anda agar tidak ter-reset saat halaman dimuat ulang kembali di browser.
              </p>
            </div>
            <button
              id="remember-settings"
              onClick={() => handleToggle('rememberLastSettings')}
              className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none shrink-0 cursor-pointer ${
                settings.rememberLastSettings ? 'bg-[#fe4c6f]' : 'bg-slate-200'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  settings.rememberLastSettings ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Auto Save History */}
          <div className="flex items-start justify-between gap-4 pt-5">
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700 cursor-pointer block" htmlFor="auto-save-history">
                Simpan Riwayat Otomatis (Auto Save History)
              </label>
              <p className="text-xs text-slate-500 leading-relaxed max-w-md">
                Secara otomatis menyimpan metadata konversi Anda (nama, status, ukuran file, waktu) ke dalam database riwayat lokal.
              </p>
            </div>
            <button
              id="auto-save-history"
              onClick={() => handleToggle('autoSaveHistory')}
              className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none shrink-0 cursor-pointer ${
                settings.autoSaveHistory ? 'bg-[#fe4c6f]' : 'bg-slate-200'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  settings.autoSaveHistory ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

        </div>
      </div>

      {/* Floating Save Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-slate-800 text-white text-xs px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 border border-slate-700 animate-slide-up z-50">
          <CheckCircle size={14} className="text-emerald-400" />
          <span>Pengaturan disimpan otomatis</span>
        </div>
      )}
    </div>
  );
}
