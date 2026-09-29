import React from 'react';
import { Printer, Code2, Users, Cpu, PrinterCheck, LayoutTemplate, FileDown, FileText } from 'lucide-react';
import { PrinterProfile } from '../types/label';

interface HeaderProps {
  activeProfile: PrinterProfile;
  detectedPrinterName?: string;
  onOpenAutoDetect?: () => void;
  viewMode: 'form' | 'designer';
  onChangeViewMode: (mode: 'form' | 'designer') => void;
  onOpenProfiles: () => void;
  onOpenCodeExport: () => void;
  onOpenBatchModal: () => void;
  onOpenHardwareConnect: () => void;
  onOpenHubCartonModal: () => void;
  onDownloadPdf?: () => void;
  onDownloadWord?: () => void;
  onDirectPrint: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeProfile,
  detectedPrinterName = 'ল্যাপটপের প্রিন্টার',
  onOpenAutoDetect,
  viewMode,
  onChangeViewMode,
  onOpenProfiles,
  onOpenCodeExport,
  onOpenBatchModal,
  onOpenHardwareConnect,
  onOpenHubCartonModal,
  onDownloadPdf,
  onDownloadWord,
  onDirectPrint
}) => {
  return (
    <header className="h-14 border-b border-neutral-800 bg-neutral-900 px-4 md:px-6 flex items-center justify-between select-none z-30">
      {/* Zone 1: Single text element wordmark + View Mode Switcher */}
      <div className="flex items-center gap-3">
        <a href="/" className="font-display text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-amber-500 flex items-center justify-center text-black font-black text-xs">
            3×4
          </div>
          <span>ThermalPrint</span>
        </a>

        {/* Primary View Switcher: Form vs Canvas Designer */}
        <div className="flex items-center bg-neutral-950 p-0.5 rounded-lg border border-neutral-800 ml-2">
          <button
            onClick={() => onChangeViewMode('form')}
            className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'form'
                ? 'bg-amber-500 text-black shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            📝 সহজ ইনপুট ফর্ম (Form)
          </button>
          <button
            onClick={() => onChangeViewMode('designer')}
            className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'designer'
                ? 'bg-amber-500 text-black shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            🎨 ক্যানভাস ডিজাইনার
          </button>
        </div>

        {/* Laptop Detected Printer Badge */}
        <div className="hidden xl:flex items-center ml-2 pl-3 border-l border-neutral-800">
          <button
            onClick={onOpenAutoDetect || onOpenProfiles}
            className="px-2.5 py-1 rounded-lg bg-neutral-800/90 hover:bg-neutral-700/90 border border-neutral-700/80 hover:border-amber-500/50 text-neutral-200 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            title="ল্যাপটপের প্রিন্টার অটো-ডিটেকশন ও কনফিগারেশন"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-white font-bold text-xs truncate max-w-[160px]">
              {detectedPrinterName}
            </span>
            <span className="px-1.5 py-0.2 rounded bg-neutral-900 text-amber-300 text-[10px] font-mono border border-neutral-700 font-semibold">
              অটো-ডিটেক্ট
            </span>
          </button>
        </div>
      </div>

      {/* Zone 2: Navigation links / modal triggers */}
      <nav className="hidden lg:flex items-center gap-4 text-xs font-medium text-neutral-300">
        <button
          onClick={onOpenHubCartonModal}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold transition-colors cursor-pointer"
        >
          <LayoutTemplate className="w-3.5 h-3.5 text-amber-400" />
          <span>Hub Carton Dispatch (Photo Match)</span>
        </button>

        <button
          onClick={onOpenProfiles}
          className="hover:text-amber-400 transition-colors flex items-center gap-1.5 py-1 cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Printers</span>
        </button>

        <button
          onClick={onOpenCodeExport}
          className="hover:text-amber-400 transition-colors flex items-center gap-1.5 py-1 cursor-pointer"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>TSPL / ZPL</span>
        </button>

        <button
          onClick={onOpenBatchModal}
          className="hover:text-amber-400 transition-colors flex items-center gap-1.5 py-1 cursor-pointer"
        >
          <Users className="w-3.5 h-3.5" />
          <span>Batch (CSV)</span>
        </button>

        <button
          onClick={onOpenHardwareConnect}
          className="hover:text-amber-400 transition-colors flex items-center gap-1.5 py-1 cursor-pointer"
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Direct USB/BT</span>
        </button>
      </nav>

      {/* Zone 3: Primary Actions (Download PDF, Download Word, Print) */}
      <div className="flex items-center gap-2">
        {onDownloadPdf && (
          <button
            onClick={onDownloadPdf}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-rose-300 border border-neutral-700 hover:border-rose-500 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-[0.98]"
            title="PDF ফাইল ডাউনলোড করুন (.pdf)"
          >
            <FileDown className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">PDF</span>
          </button>
        )}

        {onDownloadWord && (
          <button
            onClick={onDownloadWord}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sky-300 border border-neutral-700 hover:border-sky-500 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-[0.98]"
            title="Word ফাইল ডাউনলোড করুন (.docx)"
          >
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Word</span>
          </button>
        )}

        <button
          onClick={onDirectPrint}
          className="px-3.5 py-1.5 md:px-4 md:py-2 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-black rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/10 whitespace-nowrap cursor-pointer"
        >
          <PrinterCheck className="w-4 h-4 stroke-[2.5]" />
          <span>প্রিন্ট করুন</span>
        </button>
      </div>
    </header>
  );
};
