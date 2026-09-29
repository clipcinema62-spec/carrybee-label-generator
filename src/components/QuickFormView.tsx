import React, { useState } from 'react';
import { LabelConfig, LabelElement } from '../types/label';
import { ThermalCanvasElement } from './ThermalCanvasElement';
import { 
  Printer, 
  Plus, 
  Trash2, 
  Copy, 
  Sparkles,
  FileDown,
  FileText,
  Barcode,
  Check,
  RotateCw,
  Layers,
  ArrowRight,
  Download
} from 'lucide-react';
import { HubCardItem } from './HubCartonModal';
import { exportCardsToPdf, exportCardsToWord } from '../utils/documentExport';

interface QuickFormViewProps {
  cards: HubCardItem[];
  activeCardIndex: number;
  config: LabelConfig;
  detectedPrinterName?: string;
  onOpenAutoDetect?: () => void;
  onSelectCard: (index: number) => void;
  onUpdateCard: (id: string, updates: Partial<HubCardItem>) => void;
  onAddCard: (card: HubCardItem) => void;
  onDeleteCard: (id: string) => void;
  onDuplicateCard: (card: HubCardItem) => void;
  onPrintCurrent: () => void;
  onPrintAll: () => void;
  onUpdateConfig: (updates: Partial<LabelConfig>) => void;
}

export const QuickFormView: React.FC<QuickFormViewProps> = ({
  cards,
  activeCardIndex,
  config,
  detectedPrinterName = 'ল্যাপটপে ইনস্টল করা প্রিন্টার',
  onOpenAutoDetect,
  onSelectCard,
  onUpdateCard,
  onAddCard,
  onDeleteCard,
  onDuplicateCard,
  onPrintCurrent,
  onPrintAll,
  onUpdateConfig
}) => {
  const currentCard = cards[activeCardIndex] || cards[0];
  const isLandscape = config.orientation === 'landscape' || config.widthInches > config.heightInches;
  const [downloading, setDownloading] = useState<'pdf-single' | 'pdf-all' | 'word-single' | 'word-all' | null>(null);

  // Quick preset options for one-click filling
  const HUB_PRESETS = [
    'Demra',
    'Mirpur 60',
    'Rangamati-Sadar',
    'Central Sort',
    'Uttara Hub',
    'Chittagong Hub',
    'Sylhet Hub',
    'Bogura Hub'
  ];

  const ITEM_PRESETS = [
    'Laptop (475) + Charger',
    'Laptop Charger',
    'Mouse (118, 119, 120)\nNumeric Keypad (112, 113, 114)',
    'POS Terminal + Adapter',
    'Barcode Scanner + Stand + Cable',
    'Desktop PC + Monitor + Cables'
  ];

  const STAFF_PRESETS = [
    'Jana Prio Chakma, CL-84977',
    'Md. Nahid Akand, CL-84944',
    'Md. Saif Uddin, CL-84266',
    'Md. Maksudur Rahman Tamim, CL-84695',
    'Joyanto Karmokar, CL-84714\nMd. Abidur Rahman Abid, CL-84896'
  ];

  const NOTICE_PRESETS = [
    'Please keep all cartons\nfor future return',
    'অনুগ্রহ করে সব কার্টন\nভবিষ্যতে ফেরতের জন্য সংরক্ষণ করুন',
    'Return to Central Sort Warehouse\nCarrybee Logistics Ltd.',
    'Handle With Care - Fragile Electronic Items\nKeep all packaging intact'
  ];

  const handleDownloadPdf = async (all: boolean = false) => {
    try {
      setDownloading(all ? 'pdf-all' : 'pdf-single');
      const targetCards = all ? cards : [currentCard];
      const filename = all
        ? `Carrybee_All_Hub_Labels_${cards.length}.pdf`
        : `Carrybee_Label_${(currentCard.hub || 'hub').replace(/[\s/\\?%*:|"<>]+/g, '_')}.pdf`;
      await exportCardsToPdf(targetCards, config, filename);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadWord = async (all: boolean = false) => {
    try {
      setDownloading(all ? 'word-all' : 'word-single');
      const targetCards = all ? cards : [currentCard];
      const filename = all
        ? `Carrybee_All_Hub_Labels_${cards.length}.docx`
        : `Carrybee_Label_${(currentCard.hub || 'hub').replace(/[\s/\\?%*:|"<>]+/g, '_')}.docx`;
      await exportCardsToWord(targetCards, config, filename);
    } catch (err) {
      console.error('Word export failed:', err);
    } finally {
      setDownloading(null);
    }
  };

  // Convert current card to thermal canvas elements for real-time live preview
  const generatePreviewElements = (card: HubCardItem): LabelElement[] => {
    if (isLandscape) {
      const els: LabelElement[] = [
        {
          id: 'live-hub',
          type: 'text',
          content: card.hub,
          x: 40,
          y: 20,
          width: 732,
          height: 52,
          fontSize: 34,
          fontWeight: 'black',
          fontFamily: 'sans',
          textAlign: 'center',
          textDecoration: 'underline'
        },
        {
          id: 'live-items',
          type: 'text',
          content: card.items,
          x: 40,
          y: 84,
          width: 732,
          height: 60,
          fontSize: 18,
          fontWeight: 'bold',
          fontFamily: 'sans',
          textAlign: 'center'
        },
        {
          id: 'live-staff',
          type: 'text',
          content: card.staff,
          x: 40,
          y: 154,
          width: 732,
          height: 76,
          fontSize: 15,
          fontWeight: 'bold',
          fontFamily: 'sans',
          textAlign: 'center'
        }
      ];

      // Optional barcode
      if (card.showBarcode && card.tracking) {
        els.push({
          id: 'live-bc',
          type: 'barcode',
          barcodeValue: card.tracking,
          barcodeFormat: 'CODE128',
          x: 250,
          y: 220,
          width: 312,
          height: 55,
          barHeight: 40,
          showBarcodeText: true
        });
      }

      els.push(
        {
          id: 'live-divider',
          type: 'shape',
          shapeType: 'hline',
          x: 20,
          y: card.showBarcode && card.tracking ? 285 : 242,
          width: 772,
          height: 3,
          strokeWidth: 3
        },
        {
          id: 'live-notice',
          type: 'text',
          content: card.notice,
          x: 20,
          y: card.showBarcode && card.tracking ? 295 : 260,
          width: 772,
          height: 110,
          fontSize: 36,
          fontWeight: 'black',
          fontFamily: 'sans',
          fontStyle: 'italic',
          textAlign: 'center'
        }
      );

      return els;
    } else {
      const els: LabelElement[] = [
        {
          id: 'live-hub-p',
          type: 'text',
          content: card.hub,
          x: 20,
          y: 30,
          width: 568,
          height: 52,
          fontSize: 32,
          fontWeight: 'black',
          fontFamily: 'sans',
          textAlign: 'center',
          textDecoration: 'underline'
        },
        {
          id: 'live-items-p',
          type: 'text',
          content: card.items,
          x: 20,
          y: 96,
          width: 568,
          height: 48,
          fontSize: 20,
          fontWeight: 'bold',
          fontFamily: 'sans',
          textAlign: 'center'
        },
        {
          id: 'live-staff-p',
          type: 'text',
          content: card.staff,
          x: 20,
          y: 154,
          width: 568,
          height: 48,
          fontSize: 17,
          fontWeight: 'bold',
          fontFamily: 'sans',
          textAlign: 'center'
        }
      ];

      if (card.showBarcode && card.tracking) {
        els.push({
          id: 'live-bc-p',
          type: 'barcode',
          barcodeValue: card.tracking,
          barcodeFormat: 'CODE128',
          x: 150,
          y: 215,
          width: 308,
          height: 55,
          barHeight: 40,
          showBarcodeText: true
        });
      }

      els.push(
        {
          id: 'live-divider-p',
          type: 'shape',
          shapeType: 'hline',
          x: 16,
          y: card.showBarcode && card.tracking ? 280 : 216,
          width: 576,
          height: 3,
          strokeWidth: 3
        },
        {
          id: 'live-notice-p',
          type: 'text',
          content: card.notice,
          x: 16,
          y: card.showBarcode && card.tracking ? 295 : 236,
          width: 576,
          height: 140,
          fontSize: 34,
          fontWeight: 'black',
          fontFamily: 'sans',
          fontStyle: 'italic',
          textAlign: 'center'
        }
      );

      return els;
    }
  };

  const previewElements = currentCard ? generatePreviewElements(currentCard) : [];

  const handleAddNew = () => {
    const newCard: HubCardItem = {
      id: `hub-${Date.now().toString(36)}`,
      hub: 'New Hub',
      items: 'Laptop + Charger',
      staff: 'Officer Name, CL-84000',
      notice: 'Please keep all cartons\nfor future return'
    };
    onAddCard(newCard);
    onSelectCard(cards.length);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-neutral-950">
      {/* LEFT COLUMN: Hub List Sidebar */}
      <div className="w-full md:w-72 border-r border-neutral-800 bg-neutral-900/90 flex flex-col h-full overflow-hidden select-none">
        {/* Sidebar Header */}
        <div className="p-3 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <span className="font-bold text-xs text-white uppercase tracking-wider block">
              হাবের তালিকা ({cards.length})
            </span>
            <span className="text-[11px] text-neutral-400">Hub Dispatch Queue</span>
          </div>
          <button
            onClick={handleAddNew}
            className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>নতুন হাব</span>
          </button>
        </div>

        {/* Hub Cards list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {cards.map((card, idx) => (
            <div
              key={card.id}
              onClick={() => onSelectCard(idx)}
              className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-start justify-between group ${
                idx === activeCardIndex
                  ? 'bg-amber-500/15 border-amber-500/80 text-white shadow-sm ring-1 ring-amber-500/50'
                  : 'bg-neutral-800/40 border-neutral-800 hover:bg-neutral-800 text-neutral-300'
              }`}
            >
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-1.5 font-bold text-sm text-neutral-100 truncate">
                  <span className="text-[11px] font-mono text-amber-400">#{idx + 1}</span>
                  <span className="underline underline-offset-2 decoration-1">{card.hub || 'Untitled Hub'}</span>
                </div>
                <div className="text-[11px] text-neutral-400 truncate mt-0.5 font-medium">
                  {card.items || 'No items listed'}
                </div>
                <div className="text-[10px] text-neutral-500 truncate mt-0.5">
                  {card.staff || 'No staff assigned'}
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateCard(card);
                  }}
                  className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-700 cursor-pointer"
                  title="ডুপ্লিকেট করুন"
                >
                  <Copy className="w-3 h-3" />
                </button>
                {cards.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCard(card.id);
                    }}
                    className="p-1 rounded text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 cursor-pointer"
                    title="ডিলিট করুন"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Print All & Download All Bottom Actions */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-900 space-y-2">
          <button
            onClick={onPrintAll}
            className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-neutral-700 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>সবগুলো ({cards.length}টি) হাব প্রিন্ট</span>
          </button>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => handleDownloadPdf(true)}
              disabled={downloading !== null}
              className="py-1.5 px-2 bg-neutral-950 hover:bg-neutral-800 text-rose-300 border border-neutral-800 hover:border-rose-800/60 rounded-md font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
              title="সবগুলো হাব একসাথে PDF ফাইলে ডাউনলোড করুন"
            >
              <FileDown className="w-3.5 h-3.5 text-rose-400" />
              <span>{downloading === 'pdf-all' ? 'ডাউনলোড...' : 'সবগুলো PDF'}</span>
            </button>

            <button
              onClick={() => handleDownloadWord(true)}
              disabled={downloading !== null}
              className="py-1.5 px-2 bg-neutral-950 hover:bg-neutral-800 text-sky-300 border border-neutral-800 hover:border-sky-800/60 rounded-md font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
              title="সবগুলো হাব একসাথে Word .docx ফাইলে ডাউনলোড করুন"
            >
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              <span>{downloading === 'word-all' ? 'ডাউনলোড...' : 'সবগুলো Word'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* CENTER COLUMN: Direct Input Form Fields */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 border-r border-neutral-800 bg-neutral-900/40">
        {/* Top Header of the Editor */}
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-neutral-800 gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>হাব তথ্য ইনপুট ফরম (Hub Label Input Fields)</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold">
                লেবেল #{activeCardIndex + 1}
              </span>
            </h2>
            <p className="text-neutral-400 text-xs mt-0.5">
              নিচের ফিল্ডগুলোতে আপনি যা লিখবেন তা সাথে সাথে ডানপাশের ৩×৪" লেবেলে আপডেট হবে।
            </p>
          </div>

          {/* Orientation switch */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-neutral-400 font-medium">রোল সাইজ:</span>
            <div className="flex items-center bg-neutral-800 p-0.5 rounded-lg border border-neutral-700">
              <button
                type="button"
                onClick={() =>
                  onUpdateConfig({
                    orientation: 'landscape',
                    widthInches: 4,
                    heightInches: 3
                  })
                }
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  isLandscape
                    ? 'bg-amber-500 text-black font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                4" × 3" Landscape
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdateConfig({
                    orientation: 'portrait',
                    widthInches: 3,
                    heightInches: 4
                  })
                }
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  !isLandscape
                    ? 'bg-amber-500 text-black font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                3" × 4" Portrait
              </button>
            </div>
          </div>
        </div>

        {/* INPUT FIELDS */}
        {currentCard && (
          <div className="space-y-4">
            {/* Field 1: Hub Name */}
            <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2 focus-within:border-amber-500/80 transition-colors">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <span>১. হাব / ব্রাঞ্চের নাম (Hub / Destination Name)</span>
                  <span className="text-rose-400">*</span>
                </label>
                <span className="text-[10px] text-neutral-400 font-mono">উপরে বড় করে আন্ডারলাইন হবে</span>
              </div>
              <input
                type="text"
                value={currentCard.hub}
                onChange={(e) => onUpdateCard(currentCard.id, { hub: e.target.value })}
                placeholder="যেমন: Demra, Mirpur 60, Rangamati-Sadar, Central Sort"
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white font-bold text-sm focus:outline-hidden focus:border-amber-500"
              />
              {/* Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-neutral-400">দ্রুত নির্বাচন:</span>
                {HUB_PRESETS.map((hubName) => (
                  <button
                    key={hubName}
                    type="button"
                    onClick={() => onUpdateCard(currentCard.id, { hub: hubName })}
                    className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-amber-300 rounded text-[11px] transition-colors cursor-pointer"
                  >
                    {hubName}
                  </button>
                ))}
              </div>
            </div>

            {/* Field 2: Items & Serial Numbers */}
            <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2 focus-within:border-amber-500/80 transition-colors">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <span>২. মালামাল ও সিরিয়াল নম্বর (Items / Equipment & Serials)</span>
                  <span className="text-rose-400">*</span>
                </label>
                <span className="text-[10px] text-neutral-400 font-mono">এন্টার দিয়ে নতুন লাইন লিখতে পারেন</span>
              </div>
              <textarea
                rows={3}
                value={currentCard.items}
                onChange={(e) => onUpdateCard(currentCard.id, { items: e.target.value })}
                placeholder="যেমন:
Laptop (475) + Charger
অথবা:
Mouse (118, 119, 120)
Numeric Keypad (112, 113, 114)"
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-3 text-white text-xs font-semibold focus:outline-hidden focus:border-amber-500 resize-none leading-relaxed"
              />
              {/* Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-neutral-400">আইটেম টেমপ্লেট:</span>
                {ITEM_PRESETS.map((itemPreset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onUpdateCard(currentCard.id, { items: itemPreset })}
                    className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-amber-300 rounded text-[11px] transition-colors cursor-pointer truncate max-w-[200px]"
                    title={itemPreset}
                  >
                    {itemPreset.split('\n')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Field 3: Employee Name & Staff ID */}
            <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2 focus-within:border-amber-500/80 transition-colors">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <span>৩. কর্মকর্তার নাম ও CL আইডি (Staff Name & CL Number)</span>
                </label>
                <span className="text-[10px] text-neutral-400 font-mono">একাধিক নাম থাকলে প্রতি লাইনে একটি</span>
              </div>
              <textarea
                rows={3}
                value={currentCard.staff}
                onChange={(e) => onUpdateCard(currentCard.id, { staff: e.target.value })}
                placeholder="যেমন:
Jana Prio Chakma, CL-84977
অথবা:
Md. Maksudur Rahman Tamim, CL-84695
Joyanto Karmokar, CL-84714"
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-3 text-white text-xs font-medium focus:outline-hidden focus:border-amber-500 resize-none leading-relaxed"
              />
              {/* Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-neutral-400">নমুনা কর্মকর্তা:</span>
                {STAFF_PRESETS.map((staffPreset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onUpdateCard(currentCard.id, { staff: staffPreset })}
                    className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-amber-300 rounded text-[11px] transition-colors cursor-pointer truncate max-w-[200px]"
                    title={staffPreset}
                  >
                    {staffPreset.split(',')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Field 4: Carton Return Notice */}
            <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2 focus-within:border-amber-500/80 transition-colors">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <span>৪. নিচের রিটার্ন সতর্কবার্তা (Carton Return Notice)</span>
                </label>
                <span className="text-[10px] text-neutral-400 font-mono">বোল্ড ও ইটালিকে প্রিন্ট হবে</span>
              </div>
              <textarea
                rows={2}
                value={currentCard.notice}
                onChange={(e) => onUpdateCard(currentCard.id, { notice: e.target.value })}
                placeholder="Please keep all cartons
for future return"
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-3 text-white text-xs font-black italic focus:outline-hidden focus:border-amber-500 resize-none leading-tight"
              />
              {/* Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-neutral-400">বার্তার ধরণ:</span>
                {NOTICE_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onUpdateCard(currentCard.id, { notice: preset })}
                    className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-amber-300 rounded text-[11px] transition-colors cursor-pointer truncate max-w-[220px]"
                    title={preset}
                  >
                    {preset.split('\n')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Field 5: Optional Scannable Barcode & Tracking */}
            <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-200 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!currentCard.showBarcode}
                    onChange={(e) =>
                      onUpdateCard(currentCard.id, {
                        showBarcode: e.target.checked,
                        tracking: currentCard.tracking || `CB-${currentCard.hub.replace(/\s+/g, '').toUpperCase()}-${Date.now().toString().slice(-5)}`
                      })
                    }
                    className="rounded border-neutral-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span>৫. স্ক্যানযোগ্য বারকোড যোগ করুন (Optional Barcode)</span>
                </label>
                <span className="text-[10px] text-neutral-400 font-mono">Code 128 Standard</span>
              </div>

              {currentCard.showBarcode && (
                <div className="pt-1 space-y-1">
                  <span className="text-[11px] text-neutral-400">ট্র্যাকিং নম্বর বা বারকোড কোড:</span>
                  <input
                    type="text"
                    value={currentCard.tracking || ''}
                    onChange={(e) => onUpdateCard(currentCard.id, { tracking: e.target.value })}
                    placeholder="যেমন: CB-DEMRA-98421 বা CL-84695"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              )}
            </div>

            {/* DETECTED LAPTOP PRINTER STATUS CARD */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/20 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">ল্যাপটপের প্রিন্টার:</span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      অটো-ডিটেক্টেড ও রেডি
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 font-bold mt-0.5">
                    {detectedPrinterName}
                    <span className="text-neutral-400 font-normal text-[11px] ml-1.5">
                      (প্রিন্ট দিলে ৩×৪" থার্মাল মাপে সরাসরি এই প্রিন্টারে যাবে)
                    </span>
                  </p>
                </div>
              </div>

              {onOpenAutoDetect && (
                <button
                  type="button"
                  onClick={onOpenAutoDetect}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 hover:text-amber-200 border border-neutral-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-center shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>প্রিন্টার স্ক্যান / পরিবর্তন</span>
                </button>
              )}
            </div>

            {/* DIRECT PRINT BUTTON */}
            <div className="pt-1 space-y-2">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onPrintCurrent}
                  className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-black font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 cursor-pointer transition-all"
                >
                  <Printer className="w-5 h-5 stroke-[2.5]" />
                  <span>এই লেবেলটি এখনই প্রিন্ট করুন (Print Now)</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddNew}
                  className="px-4 py-3.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন হাব</span>
                </button>
              </div>

              {/* Instant Ready-to-Print PDF for Gprinter GP-3120TUD */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/30 to-neutral-900 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 text-xs text-neutral-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span><strong>Gprinter GP-3120TUD</strong> এর জন্য সরাসরি রেডি-টু-প্রিন্ট ফাইল (১-ক্লিক):</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadPdf(false)}
                  disabled={downloading !== null}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                >
                  <FileDown className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{downloading === 'pdf-single' ? 'তৈরি হচ্ছে...' : 'Gprinter PDF ডাউনলোড ও প্রিন্ট'}</span>
                </button>
              </div>
            </div>

            {/* DOCUMENT DOWNLOAD OPTIONS (WORD & PDF) */}
            <div className="p-4 bg-gradient-to-r from-neutral-900 to-neutral-900/80 rounded-xl border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider block">
                    ফাইল ডাউনলোড অপশন (Word & PDF Download)
                  </span>
                </div>
                <span className="text-[10px] text-neutral-400 font-mono">3×4" / 4×3" Thermal Sizing</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                আপনার প্রয়োজন অনুযায়ী এই লেবেলটির মাইক্রোসফট ওয়ার্ড (.docx) অথবা প্রিন্ট উপযোগী PDF ফাইল ডাউনলোড করুন:
              </p>

              {/* Main Download Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* PDF Download Button */}
                <button
                  type="button"
                  onClick={() => handleDownloadPdf(false)}
                  disabled={downloading !== null}
                  className="p-3 bg-rose-950/30 hover:bg-rose-950/60 active:scale-[0.99] text-rose-200 border border-rose-800/60 hover:border-rose-500 rounded-xl font-bold text-xs flex flex-col gap-1 transition-all cursor-pointer shadow-sm text-left group"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                      <FileDown className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                      <span>PDF ফাইল ডাউনলোড</span>
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-mono">
                      .pdf
                    </span>
                  </div>
                  <span className="text-[11px] text-rose-200/70">
                    {downloading === 'pdf-single' ? 'তৈরি হচ্ছে...' : 'বর্তমান লেবেলটি 3x4 / 4x3 সাইজে PDF হিসেবে ডাউনলোড'}
                  </span>
                </button>

                {/* Word Download Button */}
                <button
                  type="button"
                  onClick={() => handleDownloadWord(false)}
                  disabled={downloading !== null}
                  className="p-3 bg-sky-950/30 hover:bg-sky-950/60 active:scale-[0.99] text-sky-200 border border-sky-800/60 hover:border-sky-500 rounded-xl font-bold text-xs flex flex-col gap-1 transition-all cursor-pointer shadow-sm text-left group"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-2 text-sky-300 font-bold text-sm">
                      <FileText className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                      <span>Word ফাইল ডাউনলোড</span>
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-mono">
                      .docx
                    </span>
                  </div>
                  <span className="text-[11px] text-sky-200/70">
                    {downloading === 'word-single' ? 'তৈরি হচ্ছে...' : 'মাইক্রোসফট ওয়ার্ডে এডিট ও প্রিন্ট উপযোগী ডকুমেণ্ট'}
                  </span>
                </button>
              </div>

              {/* Batch Download Links */}
              <div className="flex flex-wrap items-center justify-between pt-2 border-t border-neutral-800 text-xs">
                <span className="text-neutral-400 text-[11px]">এক ফাইলে সবগুলো হাব ({cards.length}টি):</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleDownloadPdf(true)}
                    disabled={downloading !== null}
                    className="text-rose-400 hover:text-rose-300 font-semibold underline text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <FileDown className="w-3 h-3" />
                    <span>সবগুলো হাব PDF</span>
                  </button>
                  <span className="text-neutral-700">|</span>
                  <button
                    type="button"
                    onClick={() => handleDownloadWord(true)}
                    disabled={downloading !== null}
                    className="text-sky-400 hover:text-sky-300 font-semibold underline text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <FileText className="w-3 h-3" />
                    <span>সবগুলো হাব Word (.docx)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Live Real-Time Visual 3x4 / 4x3 Label Preview */}
      <div className="w-full md:w-[420px] lg:w-[460px] p-6 flex flex-col items-center justify-center bg-neutral-950 select-none overflow-y-auto">
        <div className="w-full flex items-center justify-between mb-3 text-xs">
          <span className="font-bold text-neutral-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>লাইভ থার্মাল প্রিভিউ (Live Preview)</span>
          </span>
          <span className="font-mono text-[11px] text-neutral-400">
            {isLandscape ? '4.0" × 3.0" (812×608 dots)' : '3.0" × 4.0" (608×812 dots)'}
          </span>
        </div>

        {/* Paper Container Simulation */}
        <div className="p-3 bg-neutral-900/90 rounded-xl border border-neutral-800 shadow-2xl flex flex-col items-center">
          <div className="text-[10px] font-mono text-neutral-500 mb-1">
            ▲ FEED ROLL (203 DPI DIRECT THERMAL)
          </div>

          <div
            style={{
              width: isLandscape ? '360px' : '270px',
              height: isLandscape ? '270px' : '360px'
            }}
            className="relative bg-white text-black shadow-lg rounded-xs border-2 border-neutral-300 overflow-hidden flex flex-col justify-between p-3"
          >
            {/* Render Canvas Elements matching the input fields */}
            {previewElements.map((el) => {
              const scale = isLandscape ? 360 / 812 : 270 / 608;
              return (
                <ThermalCanvasElement
                  key={el.id}
                  element={el}
                  scale={scale}
                  isPrintMode={true}
                />
              );
            })}
          </div>

          <div className="text-[10px] font-mono text-neutral-500 mt-1">
            ▼ TEAR-OFF CUTTER
          </div>
        </div>

        {/* Quick Download Action Buttons directly under Preview */}
        <div className="mt-3 flex items-center gap-2 w-full max-w-sm">
          <button
            type="button"
            onClick={() => handleDownloadPdf(false)}
            disabled={downloading !== null}
            className="flex-1 py-2 px-2.5 bg-neutral-900 hover:bg-neutral-800 text-rose-300 border border-neutral-700 hover:border-rose-500 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <FileDown className="w-4 h-4 text-rose-400" />
            <span>PDF ডাউনলোড</span>
          </button>
          <button
            type="button"
            onClick={() => handleDownloadWord(false)}
            disabled={downloading !== null}
            className="flex-1 py-2 px-2.5 bg-neutral-900 hover:bg-neutral-800 text-sky-300 border border-neutral-700 hover:border-sky-500 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <FileText className="w-4 h-4 text-sky-400" />
            <span>Word ডাউনলোড</span>
          </button>
        </div>

        {/* Quick Instructions below preview */}
        <div className="mt-4 p-3 bg-neutral-900/60 rounded-lg border border-neutral-800 text-[11px] text-neutral-400 leading-relaxed max-w-sm space-y-1">
          <p className="text-neutral-200 font-semibold">💡 কীভাবে প্রিন্ট ও ফাইল ব্যবহার করবেন:</p>
          <p>১. ফিল্ডে তথ্য লিখুন — সাথে সাথে প্রিভিউ দেখুন।</p>
          <p>২. সরাসরি থার্মাল প্রিন্টারে পাঠাতে <strong>"প্রিন্ট করুন"</strong> চাপুন।</p>
          <p>৩. সংরক্ষণ বা পাঠানোর জন্য <strong>PDF</strong> অথবা <strong>Word (.docx)</strong> ফাইল ডাউনলোড করুন।</p>
        </div>
      </div>
    </div>
  );
};
