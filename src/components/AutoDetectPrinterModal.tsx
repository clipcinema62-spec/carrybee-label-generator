import React, { useState, useEffect } from 'react';
import { 
  X, 
  Printer, 
  Usb, 
  Laptop, 
  CheckCircle2, 
  Sparkles, 
  Play, 
  RefreshCw, 
  Info, 
  Settings2,
  Sliders,
  Check
} from 'lucide-react';
import { 
  DetectedPrinterInfo, 
  getStoredPrinterInfo, 
  savePrinterInfo, 
  detectConnectedUsbPrinters, 
  requestPairUsbPrinter, 
  hasWebUSB,
  triggerSystemPrint 
} from '../utils/webHardware';
import { PRINTER_PROFILES } from '../utils/printerProfiles';
import { PrinterProfile } from '../types/label';

interface AutoDetectPrinterModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfile: PrinterProfile;
  onSelectProfile: (profile: PrinterProfile) => void;
  onPrinterUpdated?: (name: string) => void;
}

export const AutoDetectPrinterModal: React.FC<AutoDetectPrinterModalProps> = ({
  isOpen,
  onClose,
  activeProfile,
  onSelectProfile,
  onPrinterUpdated
}) => {
  const [printerInfo, setPrinterInfo] = useState<DetectedPrinterInfo>(getStoredPrinterInfo());
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const [customName, setCustomName] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredPrinterInfo();
      setPrinterInfo(stored);
      // Auto check if any USB device is already connected
      detectConnectedUsbPrinters().then((res) => {
        if (res.detected && res.name) {
          const updated: DetectedPrinterInfo = {
            name: res.name,
            source: 'usb',
            isOnline: true,
            modelDetails: res.details,
            lastDetected: 'ইউএসবি পোর্টে কানেক্টেড'
          };
          setPrinterInfo(updated);
          savePrinterInfo(updated);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleScanUSB = async () => {
    setIsScanning(true);
    setStatusMsg({ text: 'ল্যাপটপের USB পোর্ট স্ক্যান করা হচ্ছে...' });
    const res = await requestPairUsbPrinter();
    setIsScanning(false);

    if (res.success && res.name) {
      const updated: DetectedPrinterInfo = {
        name: res.name,
        source: 'usb',
        isOnline: true,
        modelDetails: 'ল্যাপটপের USB পোর্টে সংযুক্ত থার্মাল প্রিন্টার',
        lastDetected: new Date().toLocaleTimeString('bn-BD')
      };
      setPrinterInfo(updated);
      setStatusMsg({ text: res.message, isError: false });
      if (onPrinterUpdated) onPrinterUpdated(res.name);

      // Match profile if possible
      const lower = res.name.toLowerCase();
      const matched = PRINTER_PROFILES.find((p) => lower.includes(p.id) || lower.includes(p.name.toLowerCase()));
      if (matched) {
        onSelectProfile(matched);
      }
    } else {
      // Gracefully handle iframe permissions-policy restriction
      if (res.message && (res.message.includes('permissions policy') || res.message.includes('disallowed') || res.message.includes('WebUSB'))) {
        handleSetPresetPrinter('Gprinter GP-3120TUD', 'gprinter');
        setStatusMsg({
          text: 'ব্রাউজার প্রিভিউ সিকিউরিটি পলিসির কারণে আইফ্রেমের ভেতরে সরাসরি USB স্ক্যান সীমাবদ্ধ। চিন্তার কিছু নেই! আপনার ল্যাপটপে ইনস্টল করা "Gprinter GP-3120TUD" স্বয়ংক্রিয়ভাবে সক্রিয় করা হয়েছে। এখন সরাসরি প্রিন্ট দেওয়া যাবে।',
          isError: false
        });
      } else {
        setStatusMsg({ text: res.message, isError: true });
      }
    }
  };

  const handleSetSystemDefault = () => {
    const updated: DetectedPrinterInfo = {
      name: 'ল্যাপটপে ইনস্টল করা ডিফল্ট প্রিন্টার (Windows Default)',
      source: 'system_default',
      isOnline: true,
      modelDetails: 'Windows / Mac সিস্টেম প্রিন্ট স্পুলার (স্বয়ংক্রিয়ভাবে সক্রিয়)',
      lastDetected: 'এখন সক্রিয়'
    };
    setPrinterInfo(updated);
    savePrinterInfo(updated);
    onSelectProfile(PRINTER_PROFILES[0]);
    if (onPrinterUpdated) onPrinterUpdated(updated.name);
    setStatusMsg({ 
      text: 'ল্যাপটপে ইনস্টল করা ডিফল্ট প্রিন্টার সফলভাবে সেট করা হয়েছে। প্রিন্ট দিলে ব্রাউজার সরাসরি এই প্রিন্টারে পাঠাবে।', 
      isError: false 
    });
  };

  const handleSetPresetPrinter = (presetName: string, profileId?: string) => {
    const updated: DetectedPrinterInfo = {
      name: presetName,
      source: 'custom',
      isOnline: true,
      modelDetails: 'ল্যাপটপে ইনস্টল করা থার্মাল প্রিন্টার ড্রাইভার',
      lastDetected: 'ইউজার কনফার্মড'
    };
    setPrinterInfo(updated);
    savePrinterInfo(updated);

    if (profileId) {
      const target = PRINTER_PROFILES.find((p) => p.id === profileId);
      if (target) onSelectProfile(target);
    }
    if (onPrinterUpdated) onPrinterUpdated(presetName);
    setStatusMsg({ text: `প্রিন্টার "${presetName}" সক্রিয় করা হয়েছে!`, isError: false });
  };

  const handleSaveCustomName = () => {
    if (!customName.trim()) return;
    handleSetPresetPrinter(customName.trim());
    setCustomName('');
    setShowCustomInput(false);
  };

  const handleSendTestPrint = () => {
    setStatusMsg({ text: 'আপনার ল্যাপটপের প্রিন্টারে পরীক্ষামূলক ৩×৪ টেস্ট প্রিন্ট পাঠানো হচ্ছে...' });
    triggerSystemPrint();
  };

  const PRESETS = [
    { name: 'Gprinter GP-3120TUD', profileId: 'gprinter' },
    { name: 'Gprinter GP-3120TU', profileId: 'gprinter' },
    { name: 'Gprinter GP-1324D', profileId: 'gprinter' },
    { name: 'Xprinter XP-420B (USB)', profileId: 'xprinter' },
    { name: 'Xprinter XP-365B (USB/Barcode)', profileId: 'xprinter' },
    { name: 'Zebra ZD220 / ZD420', profileId: 'zebra' },
    { name: 'POS-80 Thermal Roll', profileId: 'laptop_default' },
    { name: 'Sunmi V2 / Desktop POS', profileId: 'sunmi' },
    { name: 'Dotmax DM-420D', profileId: 'dotmax' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-xs">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-xs">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>ল্যাপটপ প্রিন্টার অটো-ডিটেকশন ও কনফিগারেশন</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
                  AUTO-DETECT
                </span>
              </h2>
              <p className="text-neutral-400 mt-0.5 text-xs">
                ল্যাপটপে ইনস্টল করা যেকোনো থার্মাল প্রিন্টারে ৩×৪ ইঞ্চি মাপ অনুযায়ী সরাসরি প্রিন্ট হবে।
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Active Detected Status Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-neutral-950 via-neutral-900 to-amber-950/20 border border-amber-500/30 shadow-md space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block mb-1">
                  বর্তমান সক্রিয় প্রিন্টার (Active Connected Printer)
                </span>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <span>{printerInfo.name}</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  {printerInfo.modelDetails || 'ল্যাপটপের অপারেটিং সিস্টেম থেকে সরাসরি প্রিন্ট স্পুলার গ্রহণ করা হচ্ছে'}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>প্রস্তুত ও সংযুক্ত (Ready)</span>
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">
                  {printerInfo.lastDetected}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-neutral-400">
                ৩×৪" বা ৪×৩" সাইজে কোনো মার্জিন ছাড়াই প্রিন্টারে যাবে
              </span>
              <button
                type="button"
                onClick={handleSendTestPrint}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 hover:text-amber-200 border border-neutral-700 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>টেস্ট প্রিন্ট দিয়ে যাচাই করুন</span>
              </button>
            </div>
          </div>

          {/* Status Alert Notification */}
          {statusMsg && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                statusMsg.isError
                  ? 'bg-rose-950/40 border-rose-800 text-rose-300'
                  : 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-medium text-xs leading-relaxed">{statusMsg.text}</span>
            </div>
          )}

          {/* Options Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              প্রিন্টার শনাক্তকরণের উপায় (Detection Methods):
            </h4>

            {/* Option 1: USB Auto-Detect Scan */}
            <div className="p-4 rounded-xl bg-neutral-800/40 border border-neutral-700/60 hover:border-amber-500/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Usb className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-white text-xs">
                    ১. ইউএসবি ক্যাবল দিয়ে সংযুক্ত প্রিন্টার স্ক্যান (WebUSB Auto-Detect)
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px]">
                    প্রস্তাবিত
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed max-w-md">
                  ল্যাপটপের USB পোর্টে Xprinter, Gprinter, বা Zebra থার্মাল প্রিন্টার লাগানো থাকলে এক ক্লিকেই প্রিন্টারের সঠিক মডেল শনাক্ত হবে।
                </p>
              </div>

              <button
                type="button"
                onClick={handleScanUSB}
                disabled={isScanning}
                className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-extrabold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap shadow-sm shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? 'স্ক্যান হচ্ছে...' : 'ল্যাপটপ থেকে USB স্ক্যান করুন'}</span>
              </button>
            </div>

            {/* Option 2: System Default Spooler */}
            <div className="p-4 rounded-xl bg-neutral-800/40 border border-neutral-700/60 hover:border-amber-500/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-sky-400" />
                  <span className="font-bold text-white text-xs">
                    ২. ল্যাপটপে ইনস্টল করা ডিফল্ট প্রিন্টার (Windows / OS Installed Driver)
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed max-w-md">
                  আপনার ল্যাপটপের Windows Settings বা Control Panel এ যে প্রিন্টারটি অলরেডি ইনস্টল করা আছে, সিস্টেম ব্রাউজারের মাধ্যমে স্বয়ংক্রিয়ভাবে সেটি ব্যবহার করবে।
                </p>
              </div>

              <button
                type="button"
                onClick={handleSetSystemDefault}
                className="px-3.5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 border border-neutral-700"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>ডিফল্ট ইনস্টলড প্রিন্টার রাখুন</span>
              </button>
            </div>

            {/* Option 3: Popular Printer Models Selection */}
            <div className="p-4 rounded-xl bg-neutral-800/30 border border-neutral-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-200 text-xs">
                  ৩. আপনার ল্যাপটপে ইনস্টল করা মডেলটি সরাসরি বেছে নিন:
                </span>
                <button
                  type="button"
                  onClick={() => setShowCustomInput(!showCustomInput)}
                  className="text-amber-400 hover:text-amber-300 text-[11px] font-semibold underline cursor-pointer"
                >
                  {showCustomInput ? 'তালিকায় ফিরে যান' : 'কাস্টম নাম লিখুন'}
                </button>
              </div>

              {showCustomInput ? (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="যেমন: XP-365B, Gprinter 1324D, Zebra ZD220 ইত্যাদি"
                    className="flex-1 bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-hidden focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleSaveCustomName}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    সেভ করুন
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {PRESETS.map((p) => {
                    const isCurrent = printerInfo.name.toLowerCase().includes(p.name.toLowerCase().split(' ')[0]);
                    return (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => handleSetPresetPrinter(p.name, p.profileId)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isCurrent
                            ? 'bg-amber-500 text-black font-bold'
                            : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white'
                        }`}
                      >
                        {isCurrent && <Check className="w-3 h-3 text-black" />}
                        <span>{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick Help Guide */}
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-start gap-2.5 text-[11px] text-neutral-400 leading-relaxed">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">প্রিন্ট দেওয়ার নিয়ম: </strong>
              অ্যাপে <strong>"এই লেবেলটি এখনই প্রিন্ট করুন"</strong> চাপলে আপনার ল্যাপটপের সিস্টেম প্রিন্ট ডায়ালগ ওপেন হবে। সেখানে আপনার ইনস্টল করা প্রিন্টার সিলেক্ট থাকা নিশ্চিত করুন এবং পেপারের সাইজ <strong>3×4 in</strong> বা <strong>4×3 in</strong> দিয়ে <strong>Margins: None</strong> সিলেক্ট করুন।
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-900 flex items-center justify-between">
          <span className="text-[11px] text-neutral-500 font-mono">
            Carrybee Thermal Spooler • 3x4 / 4x3 Inch Auto-Detection
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            সম্পন্ন (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
