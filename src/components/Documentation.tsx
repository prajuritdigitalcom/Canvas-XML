import React from 'react';
import { BookOpen, Upload, Cpu, Eye, FileCheck, ArrowRight, Settings, ExternalLink } from 'lucide-react';

export default function Documentation() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-b border-slate-100 pb-2">
        <h1 className="text-xl font-bold text-slate-800">Panduan &amp; Dokumentasi</h1>
        <p className="text-xs text-slate-500">Mempelajari cara kerja konverter dan panduan menerapkan hasil ke Blogger.</p>
      </div>

      {/* Main steps cards */}
      <div className="space-y-6">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Cpu size={16} className="text-[#fe4c6f]" /> 5 Langkah Mudah Konversi
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Step 1 */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 relative space-y-3 shadow-sm hover:border-[#fe4c6f]/30 transition-colors">
            <div className="w-8 h-8 rounded-full bg-[#fe4c6f]/15 text-[#fe4c6f] font-bold flex items-center justify-center text-xs">1</div>
            <h3 className="font-bold text-slate-800 text-sm">Upload HTML</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Unggah berkas HTML hasil export dari Gemini Canvas atau template HTML mentah Anda.</p>
          </div>

          {/* Step 2 */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 relative space-y-3 shadow-sm hover:border-[#fe4c6f]/30 transition-colors">
            <div className="w-8 h-8 rounded-full bg-[#fe4c6f]/15 text-[#fe4c6f] font-bold flex items-center justify-center text-xs">2</div>
            <h3 className="font-bold text-slate-800 text-sm">Analisis Berkas</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Sistem akan otomatis menganalisis jumlah CSS, JavaScript, gambar, dan elemen DOM.</p>
          </div>

          {/* Step 3 */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 relative space-y-3 shadow-sm hover:border-[#fe4c6f]/30 transition-colors">
            <div className="w-8 h-8 rounded-full bg-[#fe4c6f]/15 text-[#fe4c6f] font-bold flex items-center justify-center text-xs">3</div>
            <h3 className="font-bold text-slate-800 text-sm">Klik Convert</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Tekan tombol konversi untuk meluncurkan pipeline transformasi XML Blogger aman.</p>
          </div>

          {/* Step 4 */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 relative space-y-3 shadow-sm hover:border-[#fe4c6f]/30 transition-colors">
            <div className="w-8 h-8 rounded-full bg-[#fe4c6f]/15 text-[#fe4c6f] font-bold flex items-center justify-center text-xs">4</div>
            <h3 className="font-bold text-slate-800 text-sm">Lihat Pratinjau</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Periksa XML, gunakan fitur pencarian untuk verifikasi baris kode spesifik Anda.</p>
          </div>

          {/* Step 5 */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 relative space-y-3 shadow-sm hover:border-[#fe4c6f]/30 transition-colors">
            <div className="w-8 h-8 rounded-full bg-[#fe4c6f]/15 text-[#fe4c6f] font-bold flex items-center justify-center text-xs">5</div>
            <h3 className="font-bold text-slate-800 text-sm">Download XML</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Unduh berkas .xml yang valid dan siap diunggah ke platform Blogger.</p>
          </div>
        </div>
      </div>

      {/* Installing XML into Blogger step */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8 space-y-6">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <FileCheck size={20} className="text-[#fe4c6f]" /> Cara Memasang Template XML di Blogger
          </h2>
          <p className="text-xs text-slate-500">Ikuti langkah-langkah di bawah ini untuk memasang template baru ke blog Anda:</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
          <div className="bg-white border border-slate-150 p-5 rounded-xl space-y-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-[10px] text-slate-500">A</span>
              Metode Restore (Sangat Direkomendasikan)
            </h3>
            <ol className="list-decimal list-inside space-y-2 leading-relaxed">
              <li>Masuk ke dasbor utama <strong>Blogger.com</strong> Anda.</li>
              <li>Klik menu samping kiri <strong>Tema (Theme)</strong>.</li>
              <li>Temukan tombol panah bawah disamping tombol <strong>Sesuaikan (Customize)</strong>.</li>
              <li>Pilih opsi <strong>Pulihkan (Restore)</strong> dari menu drop-down.</li>
              <li>Klik <strong>Upload</strong> lalu pilih file <code className="bg-slate-100 text-[#fe4c6f] px-1 rounded font-mono">*_blogger_theme.xml</code> hasil unduhan dari konverter ini.</li>
            </ol>
          </div>

          <div className="bg-white border border-slate-150 p-5 rounded-xl space-y-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-[10px] text-slate-500">B</span>
              Metode Edit HTML (Cadangan)
            </h3>
            <ol className="list-decimal list-inside space-y-2 leading-relaxed">
              <li>Masuk ke dasbor <strong>Blogger.com</strong> lalu klik menu <strong>Tema</strong>.</li>
              <li>Klik panah kecil disamping <strong>Sesuaikan</strong>, lalu pilih <strong>Edit HTML</strong>.</li>
              <li>Salin seluruh kode XML dari hasil konverter ini dengan tombol <strong>Salin XML</strong>.</li>
              <li>Hapus semua baris kode yang ada di editor Blogger, lalu tempel kode baru Anda.</li>
              <li>Klik tombol ikon <strong>Simpan (Save)</strong> di sudut kanan atas editor Blogger.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Rules implemented */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <Settings size={18} className="text-[#fe4c6f]" /> Standar Transformasi XML yang Diterapkan
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Konverter ini menerapkan teknik-teknik parsing lanjutan yang disederhanakan dari skrip Google Colab referensi untuk menjamin kompatibilitas mutlak:
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
          <li className="flex gap-2">
            <span className="text-[#fe4c6f] font-bold">✓</span>
            <div>
              <strong>Self-Closing Tags:</strong> Mengubah tag tunggal XHTML seperti <code>&lt;img&gt;</code>, <code>&lt;br&gt;</code>, <code>&lt;input&gt;</code>, dan <code>&lt;link&gt;</code> agar tertutup penuh demi kepatuhan aturan strict XML Blogger.
            </div>
          </li>
          <li className="flex gap-2">
            <span className="text-[#fe4c6f] font-bold">✓</span>
            <div>
              <strong>In-script CDATA Safeguards:</strong> Menyelubungi semua script internal ke dalam block <code>//&lt;![CDATA[</code> agar tidak diinterupsi oleh parser backend Blogger Google.
            </div>
          </li>
          <li className="flex gap-2">
            <span className="text-[#fe4c6f] font-bold">✓</span>
            <div>
              <strong>Blogger Section Boilerplate:</strong> Menyisipkan widget default <code>Blog1</code> tersembunyi agar tema valid disimpan tanpa memicu error "0 skins found".
            </div>
          </li>
          <li className="flex gap-2">
            <span className="text-[#fe4c6f] font-bold">✓</span>
            <div>
              <strong>Ampersand Entity Fixes:</strong> Mengonversi URL bersimbol ampersand <code>&amp;</code> menjadi <code>&amp;amp;</code> secara otomatis pada atribut <code>href</code> maupun <code>src</code>.
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
