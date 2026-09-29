import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  FileDown, 
  FileText, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  Sliders, 
  HelpCircle,
  Copy,
  Check,
  RotateCcw
} from 'lucide-react';
import { HubCardItem } from './HubCartonModal';
import { LabelConfig, PrinterProfile } from '../types/label';
import { triggerSystemPrint } from '../utils/webHardware';

interface DirectPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: HubCardItem | null;
  config: LabelConfig;
  detectedPrinterName: string;
  activeProfile: PrinterProfile;
  onOpenAutoDetect: () => void;
  onDownloadPdf: () => Promise<void>;
  onDownloadWord: () => Promise<void>;
}

export const DirectPrintModal: React.FC<DirectPrintModalProps> = ({
  isOpen,
  onClose,
  card,
  config,
  detectedPrinterName,
  activeProfile,
  onOpenAutoDetect,
  onDownloadPdf,
  onDownloadWord
}) => {
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [isExportingWord, setIsExportingWord] = useState<boolean>(false);
  const [printStatusNotice, setPrintStatusNotice] = useState<string | null>(null);

  if (!isOpen || !card) return null;

  const isLandscape = config.orientation === 'landscape' || config.widthInches > config.heightInches;
  const widthLabel = isLandscape ? '৪×৩ ইঞ্চি (Landscape)' : '৩×৪ ইঞ্চি (Portrait)';

  const handlePrintSystem = () => {
    setIsPrinting(true);
    setPrintStatusNotice('উইন্ডোজ প্রিন্ট ডায়ালগ চালু করা হচ্ছে...');
    const result = triggerSystemPrint();
    setTimeout(() => {
      setIsPrinting(false);
      setPrintStatusNotice('প্রিন্ট কমান্ড উইন্ডোজ স্পুলারে পাঠানো হয়েছে। যদি প্রিভিউ ব্রাউজারের কারণে ডায়ালগ না আসে, নিচে "১-ক্লিকে PDF ডাউনলোড ও প্রিন্ট" বাটনে ক্লিক করুন।');
    }, 400);
  };

  const handlePdfClick = async () => {
    try {
      setIsExportingPdf(true);
      await onDownloadPdf();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleWordClick = async () => {
    try {
      setIsExportingWord(true);
      await onDownloadWord();
    } finally {
      setIsExportingWord(false);
    }
  };

  // Generate quick raw TSPL for Gprinter / Xprinter
  const tsplCode = `SIZE ${isLandscape ? '4,3' : '3,4'}\nGAP 2 mm,0 mm\nDIRECTION 1\nCLS\nTEXT 400,40,"4",0,2,2,"${card.hub}"\nTEXT 400,100,"3",0,1,1,"${card.items.replace(/\n/g, ' ')}"\nTEXT 400,160,"3",0,1,1,"${card.staff}"\nBAR 20,230,760,4\nTEXT 400,260,"4",0,2,2,"${card.notice}"\n${card.showBarcode && card.tracking ? `BARCODE 400,380,"128",60,1,0,2,2,"${card.tracking}"\n` : ''}PRINT 1\n`;

  const handleCopyTspl = () => {
    navigator.clipboard.writeText(tsplCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-xs overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 bg-neutral-900/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Printer className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">
                  ল্যাপটপ প্রিন্ট কনফার্মেশন ও রেডি অ্যাকশন
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30">
                  READY
                </span>
              </div>
              <p className="text-neutral-400 text-xs mt-0.5">
                হাব: <strong className="text-white">{card.hub}</strong> | সাইজ: {widthLabel}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 md:p-6 space-y-4 overflow-y-auto text-xs">
          {/* Active Printer Info Bar */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-neutral-950 via-neutral-900 to-amber-950/20 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Printer className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">ল্যাপটপের প্রিন্টার:</span>
                  <span className="text-emerald-400 font-bold font-mono text-[11px] inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    সক্রিয় ও প্রস্তুত
                  </span>
                </div>
                <p className="text-neutral-300 font-bold mt-0.5 text-xs">
                  {detectedPrinterName}
                  <span className="text-neutral-400 font-normal text-[11px] ml-1.5">
                    (Windows Default Spooler)
                  </span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenAutoDetect}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 hover:text-amber-200 border border-neutral-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-center shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>প্রিন্টার পরিবর্তন</span>
            </button>
          </div>

          {/* Label Card Visual Preview Mini-Card */}
          <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 flex items-center justify-between gap-4">
            <div className="flex-1 space-y-1">
              <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider block">
                যে লেবেলটি প্রিন্ট হচ্ছে (Label Preview)
              </span>
              <p className="text-sm font-extrabold text-white underline underline-offset-4 decoration-2">
                {card.hub}
              </p>
              <p className="text-xs text-neutral-300">
                মালামাল: <span className="font-semibold text-white">{card.items}</span>
              </p>
              <p className="text-xs text-neutral-400">
                দায়িত্বে: <span className="text-neutral-200 font-semibold">{card.staff}</span>
              </p>
              {card.showBarcode && card.tracking && (
                <p className="text-[11px] text-neutral-400 font-mono">
                  বারকোড ট্র্যাকিং: <span className="text-amber-400 font-bold">{card.tracking}</span>
                </p>
              )}
            </div>
            <div className="text-right shrink-0 border-l border-neutral-800 pl-4 space-y-1">
              <span className="inline-block px-2 py-0.5 bg-neutral-800 text-neutral-300 rounded font-mono text-[10px] font-bold">
                {isLandscape ? '4" × 3" Landscape' : '3" × 4" Portrait'}
              </span>
              <p className="text-[11px] text-amber-400/90 font-mono">
                {card.notice}
              </p>
            </div>
          </div>

          {/* Status notice banner if shown */}
          {printStatusNotice && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{printStatusNotice}</p>
            </div>
          )}

          {/* TWO PRIMARY 1-CLICK PRINT ACTIONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Primary Action 1: System Print Dialog */}
            <button
              type="button"
              onClick={handlePrintSystem}
              disabled={isPrinting}
              className="p-3.5 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-black font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/15 cursor-pointer transition-all"
            >
              <Printer className="w-5 h-5 stroke-[2.5]" />
              <div className="text-left">
                <div className="text-sm font-black">
                  {isPrinting ? 'প্রিন্ট পাঠানো হচ্ছে...' : '১. সরাসরি প্রিন্ট ডায়ালগ খুলুন'}
                </div>
                <div className="text-[10px] font-normal opacity-90">
                  উইন্ডোজ প্রিন্ট উইন্ডো চালু করবে
                </div>
              </div>
            </button>

            {/* Primary Action 2: 100% Guaranteed 1-Click PDF Print for Gprinter GP-3120TUD */}
            <button
              type="button"
              onClick={handlePdfClick}
              disabled={isExportingPdf}
              className="p-3.5 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-black font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/15 cursor-pointer transition-all"
            >
              <FileDown className="w-5 h-5 stroke-[2.5]" />
              <div className="text-left">
                <div className="text-sm font-black">
                  {isExportingPdf ? 'PDF তৈরি হচ্ছে...' : '২. রেডি PDF দিয়ে প্রিন্ট (১-ক্লিক)'}
                </div>
                <div className="text-[10px] font-normal opacity-90">
                  Gprinter GP-3120TUD এর জন্য ১০০% নিখুঁত ৩×৪"
                </div>
              </div>
            </button>
          </div>

          {/* Secondary Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleWordClick}
              disabled={isExportingWord}
              className="px-3 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-sky-300 border border-neutral-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-sky-400" />
              <span>{isExportingWord ? 'Word তৈরি হচ্ছে...' : 'Word (.docx) ডাউনলোড'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyTspl}
              className="px-3 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
              <span>{copiedCode ? 'TSPL কমান্ড কপি হয়েছে!' : 'Gprinter TSPL কোড কপি'}</span>
            </button>
          </div>

          {/* STEP-BY-STEP PRINTER SETUP GUIDE FOR WINDOWS / GPRINTER */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2.5">
            <div className="flex items-center gap-2 text-white font-bold text-xs">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>ল্যাপটপে প্রিন্ট দেওয়ার সময় Windows Print ডায়ালগ সেটিংস:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-neutral-300">
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                <span className="text-amber-400 font-bold block mb-0.5">১. Destination / Printer:</span>
                <span><strong>{detectedPrinterName}</strong> বা আপনার ল্যাপটপের থার্মাল প্রিন্টার সিলেক্ট করুন।</span>
              </div>
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                <span className="text-amber-400 font-bold block mb-0.5">২. Paper Size (কাগজের মাপ):</span>
                <span><strong>3.00 × 4.00 inches</strong> (বা 76mm × 100mm) নির্বাচন করুন।</span>
              </div>
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                <span className="text-amber-400 font-bold block mb-0.5">৩. Margins (মার্জিন):</span>
                <span>অবশ্যই <strong>None (শূন্য)</strong> রাখুন যাতে পুরো লেবেলটি কাগজে ফিট হয়।</span>
              </div>
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                <span className="text-amber-400 font-bold block mb-0.5">৪. Headers & Footers:</span>
                <span>আনচেক (টিক চিহ্ন তুলে দিন) যাতে কোনো অপ্রয়োজনীয় লেখা না আসে।</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-neutral-800 bg-neutral-900 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-neutral-400">
            Carrybee Logistics Express Hub Print Hub
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
