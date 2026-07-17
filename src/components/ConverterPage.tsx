import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, FileText, CheckCircle, AlertTriangle, Play, Download, Copy, Search, 
  ChevronUp, ChevronDown, RefreshCw, Layers, ShieldCheck, Eye, Sparkles, Code
} from 'lucide-react';
import { FileAnalysis, ConverterSettings } from '../types';
import { analyzeHtmlFile, convertHtmlToBloggerXml } from '../utils/converter';

interface ConverterPageProps {
  settings: ConverterSettings;
  onSaveHistory: (fileName: string, status: 'success' | 'failed', inputSize: number, outputSize: number, xmlContent?: string, errorMessage?: string) => void;
}

const PIPELINE_STAGES = [
  'Reading HTML',
  'Parsing CSS',
  'Processing Assets',
  'Cleaning HTML',
  'Converting Blogger Tags',
  'Generating XML',
  'Optimizing XML',
  'Finalizing'
];

export default function ConverterPage({ settings, onSaveHistory }: ConverterPageProps) {
  // File state
  const [file, setFile] = useState<File | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [analysis, setAnalysis] = useState<FileAnalysis | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Conversion process state
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  
  // Results state
  const [xmlResult, setXmlResult] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (selectedFile: File) => {
    // Reset previous conversion result when a new file is loaded
    setXmlResult('');
    setErrorMessage('');
    setSearchQuery('');
    
    if (!selectedFile.name.endsWith('.html') && !selectedFile.name.endsWith('.htm')) {
      setErrorMessage('Hanya mendukung berkas dengan format .html atau .htm');
      setFile(null);
      setAnalysis(null);
      return;
    }

    setFile(selectedFile);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setHtmlContent(text);
      const fileAnalysis = analyzeHtmlFile(selectedFile.name, text);
      setAnalysis(fileAnalysis);
      if (!fileAnalysis.isValid && fileAnalysis.validationError) {
        setErrorMessage(fileAnalysis.validationError);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Gagal membaca file dari sistem.');
    };
    reader.readAsText(selectedFile);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + O -> Trigger file upload
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        fileInputRef.current?.click();
      }
      // Ctrl + Enter -> Trigger convert
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (file && analysis?.isValid && !isConverting) {
          handleConvert();
        }
      }
      // Ctrl + S -> Trigger download if xmlResult exists
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        if (xmlResult) {
          e.preventDefault();
          handleDownload();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [file, analysis, isConverting, xmlResult]);

  // Execute Conversion
  const handleConvert = () => {
    if (!htmlContent || !file) return;

    setIsConverting(true);
    setProgress(0);
    setCurrentStageIndex(0);
    setXmlResult('');
    setErrorMessage('');

    // Simulate conversion pipeline timeline beautifully
    const stageDuration = 250; // ms per stage
    let currentStage = 0;

    const interval = setInterval(() => {
      currentStage++;
      if (currentStage < PIPELINE_STAGES.length) {
        setCurrentStageIndex(currentStage);
        setProgress(Math.floor((currentStage / PIPELINE_STAGES.length) * 100));
      } else {
        clearInterval(interval);
        setProgress(100);
        
        try {
          // Perform actual robust conversion
          const finalXml = convertHtmlToBloggerXml(htmlContent, {
            beautify: settings.beautifyXml,
            compress: settings.compressXml
          });

          setXmlResult(finalXml);
          setIsConverting(false);

          // Save to Local History
          onSaveHistory(
            file.name,
            'success',
            new Blob([htmlContent]).size,
            new Blob([finalXml]).size,
            finalXml
          );

          // Auto download if setting is active
          if (settings.autoDownload) {
            triggerDownload(finalXml, file.name);
          }
        } catch (err: any) {
          const errorMsg = err.message || 'Error konversi tidak diketahui.';
          setErrorMessage(`Konversi Gagal: ${errorMsg}`);
          setIsConverting(false);
          onSaveHistory(
            file.name,
            'failed',
            new Blob([htmlContent]).size,
            0,
            undefined,
            errorMsg
          );
        }
      }
    }, stageDuration);
  };

  const handleDownload = () => {
    if (!xmlResult || !file) return;
    triggerDownload(xmlResult, file.name);
  };

  const triggerDownload = (xmlStr: string, originalName: string) => {
    const baseName = originalName.replace(/\.[^/.]+$/, "");
    const outputFilename = `${baseName}_blogger_theme.xml`;
    const blob = new Blob([xmlStr], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', outputFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = () => {
    if (!xmlResult) return;
    navigator.clipboard.writeText(xmlResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Safe Highlight Matching
  const getHighlightCount = () => {
    if (!searchQuery || !xmlResult) return 0;
    try {
      const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const matches = xmlResult.match(new RegExp(escapedQuery, 'gi'));
      return matches ? matches.length : 0;
    } catch {
      return 0;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const lines = xmlResult.split('\n');
  const isLargeFile = xmlResult.length > 500000; // > 500 KB limit for performance safety

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Converter Studio</h1>
          <p className="text-xs text-slate-500">Unggah berkas HTML Anda, konversikan, lalu salin atau unduh XML hasilnya.</p>
        </div>
        <div className="flex gap-2 text-xs text-slate-400">
          <span className="flex items-center gap-1"><ShieldCheck size={14} className="text-emerald-500" /> In-Browser Sandbox</span>
        </div>
      </div>

      {/* Upload Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              isDragging 
                ? 'border-[#fe4c6f] bg-[#fe4c6f]/5' 
                : file 
                  ? 'border-slate-300 bg-slate-50/50 hover:border-[#fe4c6f]/40' 
                  : 'border-slate-300 hover:border-[#fe4c6f]/40 hover:bg-[#fe4c6f]/5'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".html,.htm"
              className="hidden"
            />
            <div className="mx-auto w-12 h-12 rounded-full bg-[#fe4c6f]/10 text-[#fe4c6f] flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
              <Upload size={22} />
            </div>
            
            {file ? (
              <div className="space-y-1">
                <p className="font-semibold text-slate-800 text-sm max-w-md mx-auto truncate">
                  {file.name}
                </p>
                <p className="text-xs text-slate-400">
                  {formatFileSize(file.size)} • Format terdeteksi
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <p className="font-semibold text-slate-800 text-sm">
                  Seret & Letakkan file HTML di sini atau <span className="text-[#fe4c6f] underline decoration-[#fe4c6f]/40 decoration-2 underline-offset-2">Cari Berkas</span>
                </p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Mendukung file .html atau .htm hasil export Gemini Canvas, Blogger murni, dll.
                </p>
              </div>
            )}
            
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-3 text-[11px] text-slate-400">
              <span>Shortcut: <kbd className="bg-slate-100 border border-slate-200 px-1 rounded shadow-sm text-slate-500 font-mono">Ctrl</kbd> + <kbd className="bg-slate-100 border border-slate-200 px-1 rounded shadow-sm text-slate-500 font-mono">O</kbd> untuk buka berkas</span>
            </div>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs leading-relaxed">
              <AlertTriangle size={16} className="text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Terjadi Kendala</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* File Information Detail (Analysis results) */}
          {analysis && analysis.isValid && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Layers size={16} className="text-[#fe4c6f]" /> Ringkasan Analisis HTML
                </h3>
                <span className="text-xs bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <CheckCircle size={12} /> Valid
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50/60 p-3 rounded-lg border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Ukuran</p>
                  <p className="text-sm font-bold text-slate-700 mt-1">{formatFileSize(analysis.size)}</p>
                </div>
                <div className="bg-slate-50/60 p-3 rounded-lg border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Jumlah Style (CSS)</p>
                  <p className="text-sm font-bold text-slate-700 mt-1">{analysis.cssCount} tag style</p>
                </div>
                <div className="bg-slate-50/60 p-3 rounded-lg border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Jumlah Script (JS)</p>
                  <p className="text-sm font-bold text-slate-700 mt-1">{analysis.jsCount} tag script</p>
                </div>
                <div className="bg-slate-50/60 p-3 rounded-lg border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Jumlah Gambar</p>
                  <p className="text-sm font-bold text-slate-700 mt-1">{analysis.imageCount} tag img</p>
                </div>
                <div className="bg-slate-50/60 p-3 rounded-lg border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Jumlah Bagian</p>
                  <p className="text-sm font-bold text-slate-700 mt-1">{analysis.sectionCount} elemen</p>
                </div>
                <div className="bg-slate-50/60 p-3 rounded-lg border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Tag DOM</p>
                  <p className="text-sm font-bold text-slate-700 mt-1">{analysis.totalElements} nodes</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-[11px] text-slate-400">
                  Dokumen HTML siap diproses ke standar Template Blogger XML.
                </p>
                
                <button
                  onClick={handleConvert}
                  disabled={isConverting}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#fe4c6f] hover:bg-[#e03a5a] disabled:bg-slate-200 text-white font-medium text-xs rounded-lg transition active:scale-95 cursor-pointer w-full sm:w-auto"
                >
                  <Play size={14} fill="currentColor" />
                  Mulai Konversi (Ctrl + Enter)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info & Side Instructions */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Alur Konversi Blogger</h3>
            
            <div className="space-y-4 text-xs">
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-[#fe4c6f]/10 text-[#fe4c6f] font-bold flex items-center justify-center shrink-0">1</div>
                <div>
                  <h4 className="font-semibold text-slate-700">Analisis Aset</h4>
                  <p className="text-slate-500 mt-0.5">Memecah struktur file untuk memetakan tag Head, Body, Script, dan Style.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-[#fe4c6f]/10 text-[#fe4c6f] font-bold flex items-center justify-center shrink-0">2</div>
                <div>
                  <h4 className="font-semibold text-slate-700">Injeksi Tag &lt;b:skin&gt;</h4>
                  <p className="text-slate-500 mt-0.5">Membungkus seluruh CSS custom milik Canvas ke dalam pembungkus XML CDATA Blogger.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-[#fe4c6f]/10 text-[#fe4c6f] font-bold flex items-center justify-center shrink-0">3</div>
                <div>
                  <h4 className="font-semibold text-slate-700">Modifikasi Namespace</h4>
                  <p className="text-slate-500 mt-0.5">Menyisipkan XMLNS standard Blogger agar template dipahami parser Google.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-[#fe4c6f]/10 text-[#fe4c6f] font-bold flex items-center justify-center shrink-0">4</div>
                <div>
                  <h4 className="font-semibold text-slate-700">Escaping Karakter Khusus</h4>
                  <p className="text-slate-500 mt-0.5">Melindungi kode JS dengan CDATA & ampersand URL diganti &amp;amp;.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-[#fe4c6f]/10 text-[#fe4c6f] font-bold flex items-center justify-center shrink-0">5</div>
                <div>
                  <h4 className="font-semibold text-slate-700">Layout Sandwich (Premium)</h4>
                  <p className="text-slate-500 mt-0.5">Mengisolasi Header &amp; Footer bawaan, menampilkan layout beranda asli saat home, dan postingan artikel estetik di halaman post/detail!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      {isConverting && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 animate-pulse">
          <div className="flex justify-between items-center text-xs font-bold text-slate-600">
            <span className="flex items-center gap-2 text-[#fe4c6f]">
              <RefreshCw size={14} className="animate-spin" /> 
              Tahap: {PIPELINE_STAGES[currentStageIndex]}
            </span>
            <span>{progress}%</span>
          </div>
          
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-[#fe4c6f] h-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
            {PIPELINE_STAGES.map((stage, idx) => (
              <div 
                key={stage}
                className={`p-2 rounded border text-center text-[10px] font-semibold transition-all ${
                  idx < currentStageIndex 
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                    : idx === currentStageIndex
                      ? 'bg-[#fe4c6f]/5 border-[#fe4c6f]/20 text-[#fe4c6f]'
                      : 'bg-slate-50/50 border-slate-100 text-slate-400'
                }`}
              >
                {stage}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results Preview Panel */}
      {xmlResult && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col animate-fade-in">
          {/* Preview Header Actions */}
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Code size={18} className="text-[#fe4c6f]" />
              <div>
                <h3 className="text-sm font-bold text-slate-700">Hasil Konversi Blogger XML</h3>
                <p className="text-[11px] text-slate-400">Total {lines.length} baris kode • {formatFileSize(new Blob([xmlResult]).size)}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Search Box */}
              <div className="relative flex-grow sm:flex-grow-0">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari kode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#fe4c6f] w-full sm:w-44 transition-all"
                />
                {searchQuery && (
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-slate-100 text-[10px] px-1 rounded text-slate-500 font-bold">
                    {getHighlightCount()} cocok
                  </span>
                )}
              </div>

              {/* Copy */}
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-600 font-medium cursor-pointer transition active:scale-95"
              >
                <Copy size={13} />
                {copied ? 'Tersalin' : 'Salin XML'}
              </button>

              {/* Download */}
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#fe4c6f] hover:bg-[#e03a5a] text-white rounded-lg text-xs font-semibold cursor-pointer transition active:scale-95"
              >
                <Download size={13} />
                Unduh XML
              </button>

              {/* Expand/Collapse */}
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-pointer transition"
                title={isFullscreen ? 'Perkecil' : 'Perbesar'}
              >
                {isFullscreen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          </div>

          {/* Code Viewer Stage with Line Numbers */}
          <div 
            ref={previewContainerRef}
            className={`relative flex border-t border-slate-100 bg-[#1e1e24] text-slate-200 font-mono text-xs overflow-auto transition-all ${
              isFullscreen ? 'max-h-[700px] h-[650px]' : 'max-h-[400px] h-[350px]'
            }`}
          >
            {isLargeFile ? (
              // Fast viewer for massive files to prevent lag
              <div className="w-full h-full flex flex-col p-4 space-y-4">
                <div className="flex items-start gap-3 p-3 bg-[#e03a5a]/10 border border-[#e03a5a]/20 rounded-lg text-[#fe4c6f] text-xs">
                  <Eye size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Mode Performa Tinggi Aktif</p>
                    <p className="mt-0.5 text-slate-300">File hasil konversi berukuran besar ({formatFileSize(new Blob([xmlResult]).size)}). Untuk menjaga kelancaran browser Anda, penampil kode penuh dinonaktifkan. Anda masih dapat mencari atau mengunduh kode lengkap.</p>
                  </div>
                </div>
                <textarea
                  readOnly
                  value={xmlResult}
                  className="w-full flex-grow bg-[#141419] border border-slate-800 p-4 rounded-xl text-slate-300 font-mono text-xs resize-none focus:outline-none focus:border-[#fe4c6f]/50"
                />
              </div>
            ) : (
              // Full Line-by-Line Viewer with search query highlighting
              <div className="flex min-w-full">
                {/* Line numbers column */}
                <div className="select-none text-right pr-3 pl-4 py-4 bg-[#141419] text-slate-600 border-r border-slate-800 text-xs min-w-[50px]">
                  {lines.map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>

                {/* Main Code block */}
                <pre className="p-4 flex-1 overflow-x-auto text-slate-300 text-xs leading-relaxed">
                  <code>
                    {lines.map((line, idx) => {
                      // Highlight search match if query exists
                      if (searchQuery && line.toLowerCase().includes(searchQuery.toLowerCase())) {
                        const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        const regex = new RegExp(`(${escapedQuery})`, 'gi');
                        const parts = line.split(regex);
                        
                        return (
                          <div key={idx} className="bg-[#fe4c6f]/20 px-1 rounded -mx-1">
                            {parts.map((part, pIdx) => 
                              part.toLowerCase() === searchQuery.toLowerCase() 
                                ? <mark key={pIdx} className="bg-yellow-400 text-slate-900 font-bold rounded px-0.5">{part}</mark>
                                : part
                            )}
                          </div>
                        );
                      }

                      // Dynamic, elegant inline styling highlights for basic tags just using regex for low weights
                      let coloredLine: React.ReactNode = line;
                      if (line.trim().startsWith('&lt;!') || line.trim().startsWith('<!--')) {
                        coloredLine = <span className="text-slate-500">{line}</span>;
                      } else if (line.trim().startsWith('&lt;?xml')) {
                        coloredLine = <span className="text-pink-400 font-semibold">{line}</span>;
                      } else if (line.includes('&lt;b:') || line.includes('&lt;/b:') || line.includes('&lt;data:') || line.includes('&lt;/data:')) {
                        coloredLine = <span className="text-[#fe4c6f] font-semibold">{line}</span>;
                      } else if (line.includes('&lt;')) {
                        coloredLine = <span className="text-indigo-300">{line}</span>;
                      }

                      return <div key={idx}>{coloredLine}</div>;
                    })}
                  </code>
                </pre>
              </div>
            )}
          </div>

          {/* Download Shortcut Info Panel */}
          <div className="bg-slate-50 border-t border-slate-100 px-5 py-3 text-xs text-slate-500 flex justify-between items-center flex-wrap gap-2">
            <span>Berkas XML Anda aman diproses secara lokal.</span>
            <div className="flex gap-4">
              <span>Shortcut: <kbd className="bg-white border border-slate-200 px-1 rounded shadow-sm text-slate-500 font-mono">Ctrl</kbd> + <kbd className="bg-white border border-slate-200 px-1 rounded shadow-sm text-slate-500 font-mono">S</kbd> untuk simpan</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
