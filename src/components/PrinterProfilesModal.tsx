import React from 'react';
import { PRINTER_PROFILES } from '../utils/printerProfiles';
import { PrinterProfile } from '../types/label';
import { X, Check, Info, Settings2, SlidersHorizontal, Sparkles } from 'lucide-react';

interface PrinterProfilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfile: PrinterProfile;
  onSelectProfile: (profile: PrinterProfile) => void;
  onOpenAutoDetect?: () => void;
}

export const PrinterProfilesModal: React.FC<PrinterProfilesModalProps> = ({
  isOpen,
  onClose,
  activeProfile,
  onSelectProfile,
  onOpenAutoDetect
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-amber-400" />
              <span>Thermal Printer Compatibility & Calibration</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Optimized for 3×4 inches (76.2 × 101.6 mm) continuous thermal rolls and die-cut gap sensors.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Printer Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Quick Auto-Detect Promotion Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-neutral-800/80 to-neutral-800/80 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white">
                  ল্যাপটপের প্রিন্টার স্বয়ংক্রিয়ভাবে শনাক্ত করুন (Auto-Detect Laptop Printer)
                </h4>
              </div>
              <p className="text-[11px] text-neutral-300 mt-1 max-w-xl">
                আপনার ল্যাপটপের USB পোর্ট বা Windows এ ইনস্টল করা যেকোনো থার্মাল প্রিন্টার এক ক্লিকেই ডিটেক্ট করে সংযুক্ত করতে পারেন।
              </p>
            </div>
            {onOpenAutoDetect && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAutoDetect();
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-sm shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 fill-black" />
                <span>অটো-ডিটেক্ট টুল খুলুন</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PRINTER_PROFILES.map((profile) => {
              const isSelected = profile.id === activeProfile.id;
              return (
                <div
                  key={profile.id}
                  onClick={() => onSelectProfile(profile)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500'
                      : 'bg-neutral-800/40 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/70'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{profile.name}</h3>
                          <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-neutral-800 text-amber-300 font-semibold border border-neutral-700">
                            {profile.protocol}
                          </span>
                        </div>
                        <span className="text-[11px] text-neutral-400">{profile.manufacturer}</span>
                      </div>

                      {isSelected ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-400/20 px-2 py-0.5 rounded">
                          <Check className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <button className="text-[11px] text-neutral-400 hover:text-neutral-200 py-0.5 px-2 rounded bg-neutral-800">
                          Select
                        </button>
                      )}
                    </div>

                    {/* Popular Models */}
                    <div className="mb-3">
                      <span className="text-[10px] uppercase font-mono text-neutral-500 block mb-1">
                        Verified 3x4" Models:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {profile.popularModels.map((m) => (
                          <span
                            key={m}
                            className="font-mono text-[11px] text-neutral-300 bg-neutral-800 px-1.5 py-0.5 rounded"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Calibration Guide */}
                    <div className="p-2.5 rounded bg-neutral-900/80 border border-neutral-800 text-[11px] space-y-1 mb-2">
                      <div className="font-semibold text-neutral-300 flex items-center gap-1">
                        <SlidersHorizontal className="w-3 h-3 text-amber-400" />
                        <span>3x4 Gap Calibration:</span>
                      </div>
                      <p className="text-neutral-400 leading-relaxed">
                        {profile.calibrationGuide}
                      </p>
                    </div>

                    {/* Hardware Notes */}
                    <div className="text-[11px] text-neutral-400 leading-relaxed">
                      <strong className="text-neutral-300">Driver / Media: </strong>
                      {profile.hardwareNotes}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Universal 3x4 Thermal Printing Guidelines */}
          <div className="p-4 rounded-xl bg-neutral-800/60 border border-neutral-700/60 text-xs space-y-2">
            <h4 className="font-bold text-neutral-200 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-400" />
              <span>How 3×4 Inch (76×102mm) Printing Works</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-neutral-300 text-[11px] leading-relaxed pt-1">
              <div>
                <strong className="text-white block mb-0.5">1. Browser System Print</strong>
                In the Print Dialog, select your thermal printer (e.g. XP-420B, GP-1324D, or Zebra ZD420). Choose Paper Size: <strong>3 x 4 in</strong> (or User-Defined 76mm × 102mm) and set <strong>Margins: None (0mm)</strong>.
              </div>
              <div>
                <strong className="text-white block mb-0.5">2. Direct Raw Commands</strong>
                If printing via server or direct USB, export our <strong>TSPL</strong> (Gprinter/Xprinter) or <strong>ZPL</strong> (Zebra) code. This bypasses raster drivers for instantaneous 150mm/s zero-lag printing.
              </div>
              <div>
                <strong className="text-white block mb-0.5">3. Media Sensor Calibration</strong>
                Thermal 3x4 labels have a standard 2mm-3mm die-cut gap. Always perform gap calibration when inserting a new roll to prevent label skipping or print offset.
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
