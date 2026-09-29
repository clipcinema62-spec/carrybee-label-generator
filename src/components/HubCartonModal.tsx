import React, { useState } from 'react';
import { LabelConfig, LabelElement } from '../types/label';
import { X, Printer, Plus, Trash2, Edit3, ArrowRight, LayoutTemplate, Copy, Sparkles, Check, FileDown, FileText } from 'lucide-react';
import { exportCardsToPdf, exportCardsToWord } from '../utils/documentExport';

export interface HubCardItem {
  id: string;
  hub: string;
  items: string;
  staff: string;
  notice: string;
  showBarcode?: boolean;
  tracking?: string;
}

interface HubCartonModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: LabelConfig;
  onPrintCards: (cards: HubCardItem[], orientation: 'landscape' | 'portrait') => void;
  onLoadIntoDesigner: (card: HubCardItem, orientation: 'landscape' | 'portrait') => void;
}

// Initial 5 cards strictly matched to the user's uploaded image
export const INITIAL_USER_CARDS: HubCardItem[] = [
  {
    id: 'hub-1',
    hub: 'Rangamati-Sadar',
    items: 'Laptop (475) + Charger',
    staff: 'Jana Prio Chakma, CL-84977',
    notice: 'Please keep all cartons\nfor future return'
  },
  {
    id: 'hub-2',
    hub: 'Mirpur 60',
    items: 'Laptop (931) + Charger',
    staff: 'Md. Nahid Akand, CL-84944',
    notice: 'Please keep all cartons\nfor future return'
  },
  {
    id: 'hub-3',
    hub: 'Central Sort',
    items: 'Laptop Charger',
    staff: 'Md. Saif Uddin, CL-84266',
    notice: 'Please keep all cartons\nfor future return'
  },
  {
    id: 'hub-4',
    hub: 'Demra',
    items: 'Laptop Charger',
    staff: 'Md. Maksudur Rahman Tamim, CL-84695',
    notice: 'Please keep all cartons\nfor future return'
  },
  {
    id: 'hub-5',
    hub: 'Demra',
    items: 'Mouse (118, 119, 120)\nNumeric Keypad (112, 113, 114)',
    staff: 'Md. Maksudur Rahman Tamim, CL-84695\nJoyanto Karmokar, CL-84714\nMd. Abidur Rahman Abid, CL-84896',
    notice: 'Please keep all cartons\nfor future return'
  }
];

export const HubCartonModal: React.FC<HubCartonModalProps> = ({
  isOpen,
  onClose,
  config,
  onPrintCards,
  onLoadIntoDesigner
}) => {
  const [cards, setCards] = useState<HubCardItem[]>(INITIAL_USER_CARDS);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New card form state
  const [newHub, setNewHub] = useState<string>('');
  const [newItems, setNewItems] = useState<string>('');
  const [newStaff, setNewStaff] = useState<string>('');
  const [isExporting, setIsExporting] = useState<'pdf' | 'word' | null>(null);

  if (!isOpen) return null;

  const handleAddCard = () => {
    if (!newHub.trim()) return;
    const newCard: HubCardItem = {
      id: `hub-${Date.now().toString(36)}`,
      hub: newHub.trim(),
      items: newItems.trim() || 'Equipment + Charger',
      staff: newStaff.trim() || 'Officer, CL-84000',
      notice: 'Please keep all cartons\nfor future return'
    };
    setCards([...cards, newCard]);
    setNewHub('');
    setNewItems('');
    setNewStaff('');
  };

  const handleDeleteCard = (id: string) => {
    setCards(cards.filter((c) => c.id !== id));
  };

  const handleUpdateCard = (id: string, updates: Partial<HubCardItem>) => {
    setCards(cards.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const handleDuplicateCard = (card: HubCardItem) => {
    const copy: HubCardItem = {
      ...card,
      id: `hub-copy-${Date.now().toString(36)}`
    };
    setCards([...cards, copy]);
  };

  const handleDownloadPdf = async () => {
    try {
      setIsExporting('pdf');
      const tempConfig: LabelConfig = {
        ...config,
        orientation,
        widthInches: orientation === 'landscape' ? 4 : 3,
        heightInches: orientation === 'landscape' ? 3 : 4
      };
      await exportCardsToPdf(cards, tempConfig, `Carrybee_Hub_Labels_${cards.length}.pdf`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(null);
    }
  };

  const handleDownloadWord = async () => {
    try {
      setIsExporting('word');
      const tempConfig: LabelConfig = {
        ...config,
        orientation,
        widthInches: orientation === 'landscape' ? 4 : 3,
        heightInches: orientation === 'landscape' ? 3 : 4
      };
      await exportCardsToWord(cards, tempConfig, `Carrybee_Hub_Labels_${cards.length}.docx`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-xs">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-xs">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Hub Carton Equipment Return Labels</h2>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold">
                  Carrybee Hub Asset Transfer
                </span>
              </div>
              <p className="text-neutral-400 mt-0.5 text-xs">
                Matches your exact print template with Branch/Hub underline, Equipment serials, Officer CL-ID, and return notice.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Orientation Toggle */}
            <div className="flex items-center bg-neutral-950 p-1 rounded-lg border border-neutral-800">
              <button
                onClick={() => setOrientation('landscape')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  orientation === 'landscape'
                    ? 'bg-amber-500 text-black shadow-xs font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                4" × 3" Landscape (Photo)
              </button>
              <button
                onClick={() => setOrientation('portrait')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  orientation === 'portrait'
                    ? 'bg-amber-500 text-black shadow-xs font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                3" × 4" Portrait
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-neutral-950/60">
          {/* Quick Add Bar */}
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
            <span className="text-neutral-200 font-bold text-xs uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Quick Add New Hub Shipment</span>
            </span>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
              <div>
                <label className="text-[10px] text-neutral-400 block mb-1">Hub / Destination Name</label>
                <input
                  type="text"
                  placeholder="e.g. Gazipur, Uttara, Demra"
                  value={newHub}
                  onChange={(e) => setNewHub(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-neutral-100 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 block mb-1">Items / Serials</label>
                <input
                  type="text"
                  placeholder="e.g. Laptop (520) + Charger"
                  value={newItems}
                  onChange={(e) => setNewItems(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-neutral-100 text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 block mb-1">Staff Name & CL Number</label>
                <input
                  type="text"
                  placeholder="e.g. Md. Hasan Ali, CL-84112"
                  value={newStaff}
                  onChange={(e) => setNewStaff(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-neutral-100 text-xs"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleAddCard}
                  disabled={!newHub.trim()}
                  className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer h-[34px]"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Add Hub Label</span>
                </button>
              </div>
            </div>
          </div>

          {/* Cards Grid - Visual representation matching user image */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-neutral-300">
                Ready for Thermal Roll ({cards.length} labels queued)
              </span>
              <span className="text-[11px] font-mono text-neutral-500">
                Print Format: {orientation === 'landscape' ? '4.0" × 3.0" (Wide)' : '3.0" × 4.0" (Tall)'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cards.map((card, idx) => (
                <div
                  key={card.id}
                  className="relative group bg-white text-black rounded-md border-2 border-neutral-300 shadow-md p-4 flex flex-col justify-between transition-all hover:shadow-xl hover:border-amber-400"
                  style={{
                    aspectRatio: orientation === 'landscape' ? '4 / 3' : '3 / 4'
                  }}
                >
                  {/* Top Hub Title */}
                  <div className="text-center pt-1">
                    <h3 className="text-xl font-black underline underline-offset-4 decoration-2 tracking-tight">
                      {card.hub}
                    </h3>
                  </div>

                  {/* Items Description */}
                  <div className="text-center my-auto py-2 space-y-1">
                    <p className="text-xs font-bold leading-tight whitespace-pre-line text-neutral-900">
                      {card.items}
                    </p>
                    <p className="text-[11px] font-semibold text-neutral-800 whitespace-pre-line mt-1">
                      {card.staff}
                    </p>
                  </div>

                  {/* Divider Line & Notice Footer */}
                  <div className="mt-auto">
                    <hr className="border-t-2 border-black mb-2" />
                    <div className="text-center pb-1">
                      <p className="text-sm font-black italic tracking-normal leading-tight whitespace-pre-line">
                        {card.notice}
                      </p>
                    </div>
                  </div>

                  {/* Hover Control Overlay */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900/90 p-1 rounded-md shadow-lg">
                    <button
                      onClick={() => handleDuplicateCard(card)}
                      className="p-1 rounded text-neutral-300 hover:text-white hover:bg-neutral-800"
                      title="Duplicate Label"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onLoadIntoDesigner(card, orientation)}
                      className="p-1 rounded text-amber-400 hover:text-amber-300 hover:bg-neutral-800"
                      title="Open in Full 3x4 Canvas Editor"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-neutral-800"
                      title="Remove Label"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Badge Index */}
                  <div className="absolute top-2 left-2 text-[10px] font-mono font-bold bg-neutral-100 text-neutral-500 px-1 rounded border border-neutral-300 pointer-events-none">
                    #{idx + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-900 flex flex-wrap items-center justify-between gap-3">
          <div className="text-neutral-400 text-xs">
            Direct output to <strong className="text-white">Gprinter / Xprinter / Sunmi / Zebra / Dotmax / POSLogic</strong>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleDownloadPdf}
              disabled={isExporting !== null}
              className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-rose-300 border border-neutral-700 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-rose-400" />
              <span>{isExporting === 'pdf' ? 'PDF তৈরি হচ্ছে...' : 'PDF ফাইল ডাউনলোড'}</span>
            </button>

            <button
              onClick={handleDownloadWord}
              disabled={isExporting !== null}
              className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-sky-300 border border-neutral-700 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-sky-400" />
              <span>{isExporting === 'word' ? 'Word তৈরি হচ্ছে...' : 'Word ফাইল ডাউনলোড (.docx)'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onPrintCards(cards, orientation)}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/10 cursor-pointer"
            >
              <Printer className="w-4 h-4 stroke-[2.5]" />
              <span>Print All ({cards.length}) Hub Labels</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
