import React, { useState } from 'react';
import { LabelConfig, LabelElement, BatchItem } from '../types/label';
import { ThermalCanvasElement } from './ThermalCanvasElement';
import { X, Upload, Printer, Plus, Trash2, ArrowRight } from 'lucide-react';

interface BatchPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseElements: LabelElement[];
  config: LabelConfig;
  onPrintBatch: (batchItems: BatchItem[]) => void;
}

const DEFAULT_BATCH: BatchItem[] = [
  {
    id: 'b-1',
    TRACKING: 'CB-2026-98421-BD',
    NAME: 'Tanzir Rahman',
    PHONE: '01819-987654',
    ADDRESS: 'House 24, Road 14, Sector 11, Uttara, Dhaka',
    COD: '1,650.00',
    SKU: 'CRB-EL-9042',
    HUB: 'DAC-NORTH-04'
  },
  {
    id: 'b-2',
    TRACKING: 'CB-2026-98422-BD',
    NAME: 'Fahim Shakil',
    PHONE: '01712-445566',
    ADDRESS: 'Plot 8, Block D, Bashundhara R/A, Dhaka-1229',
    COD: '2,300.00',
    SKU: 'CRB-EL-8812',
    HUB: 'DAC-EAST-02'
  },
  {
    id: 'b-3',
    TRACKING: 'CB-2026-98423-BD',
    NAME: 'Samira Akter',
    PHONE: '01911-332211',
    ADDRESS: 'Road 7, Dhanmondi 27, Dhaka-1209',
    COD: '850.00',
    SKU: 'CRB-AP-1044',
    HUB: 'DAC-SOUTH-01'
  },
  {
    id: 'b-4',
    TRACKING: 'CB-2026-98424-BD',
    NAME: 'Kamal Hossain',
    PHONE: '01678-990011',
    ADDRESS: 'GEC Circle, Nasirabad, Chattogram',
    COD: '3,400.00',
    SKU: 'CRB-HW-5002',
    HUB: 'CTG-MAIN-01'
  }
];

export const BatchPrintModal: React.FC<BatchPrintModalProps> = ({
  isOpen,
  onClose,
  baseElements,
  config,
  onPrintBatch
}) => {
  const [batchItems, setBatchItems] = useState<BatchItem[]>(DEFAULT_BATCH);
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  const [seqPrefix, setSeqPrefix] = useState<string>('CB-2026-');
  const [seqStart, setSeqStart] = useState<number>(98500);
  const [seqCount, setSeqCount] = useState<number>(10);

  if (!isOpen) return null;

  // Substitute dynamic fields in elements
  const getSubstitutedElements = (item: BatchItem): LabelElement[] => {
    return baseElements.map((el) => {
      let content = el.content;
      let barcodeVal = el.barcodeValue;
      let qrVal = el.qrValue;

      // Replace common keywords or values
      if (content) {
        if (content.includes('Tanzir') || content.includes('TO:')) {
          content = `TO: ${item.NAME}`;
        } else if (content.includes('TEL:') || content.includes('01819')) {
          content = `TEL: ${item.PHONE}`;
        } else if (content.includes('Uttara') || content.includes('Sector 11')) {
          content = item.ADDRESS;
        } else if (content.includes('BDT ৳') || content.includes('1,650')) {
          content = `BDT ৳ ${item.COD}`;
        } else if (content.includes('HUB:')) {
          content = `HUB: ${item.HUB}  |  SORT: ${item.HUB}`;
        }
      }

      if (barcodeVal) {
        barcodeVal = item.TRACKING || barcodeVal;
      }

      if (qrVal) {
        qrVal = `https://track.carrybee.com/${item.TRACKING}`;
      }

      return {
        ...el,
        content,
        barcodeValue: barcodeVal,
        qrValue: qrVal
      };
    });
  };

  const handleGenerateSequence = () => {
    const newItems: BatchItem[] = [];
    for (let i = 0; i < seqCount; i++) {
      const code = `${seqPrefix}${seqStart + i}-BD`;
      newItems.push({
        id: `seq-${Date.now()}-${i}`,
        TRACKING: code,
        NAME: `Customer #${i + 1}`,
        PHONE: `01700-${String(100000 + i)}`,
        ADDRESS: `Express Delivery Hub Sorting Station #${(i % 5) + 1}`,
        COD: `${(1000 + i * 150).toFixed(2)}`,
        SKU: `SKU-${1000 + i}`,
        HUB: `DAC-HUB-0${(i % 4) + 1}`
      });
    }
    setBatchItems(newItems);
    setActiveItemIndex(0);
  };

  const currentPreviewElements = batchItems[activeItemIndex]
    ? getSubstitutedElements(batchItems[activeItemIndex])
    : baseElements;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Printer className="w-5 h-5 text-amber-400" />
              <span>Continuous 3x4" Batch Label Printing</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Print whole rolls of orders, tracking barcodes, or bin tags seamlessly.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left Side: Order / Batch List */}
          <div className="w-full md:w-1/2 p-6 border-r border-neutral-800 overflow-y-auto space-y-4">
            {/* Quick Sequence Generator */}
            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs">
              <div className="font-semibold text-neutral-200 mb-2 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Auto-Generate Sequential Barcodes</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-0.5">Prefix</label>
                  <input
                    type="text"
                    value={seqPrefix}
                    onChange={(e) => setSeqPrefix(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-neutral-200 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-0.5">Start #</label>
                  <input
                    type="number"
                    value={seqStart}
                    onChange={(e) => setSeqStart(parseInt(e.target.value) || 1)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-neutral-200 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-0.5">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={seqCount}
                    onChange={(e) => setSeqCount(parseInt(e.target.value) || 1)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-neutral-200 font-mono text-xs"
                  />
                </div>
              </div>
              <button
                onClick={handleGenerateSequence}
                className="w-full py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded font-semibold text-xs transition-colors"
              >
                Generate {seqCount} Sequential Labels
              </button>
            </div>

            {/* Batch Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-neutral-300">
                  Label Queue ({batchItems.length} labels ready)
                </span>
                <button
                  onClick={() => setBatchItems([])}
                  className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear Queue</span>
                </button>
              </div>

              <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                {batchItems.map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => setActiveItemIndex(idx)}
                    className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                      idx === activeItemIndex
                        ? 'bg-amber-500/10 border-amber-500/60 text-white'
                        : 'bg-neutral-800/40 border-neutral-800 hover:bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    <div>
                      <div className="font-mono font-bold text-amber-300">{item.TRACKING}</div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        {item.NAME} · COD: ৳{item.COD}
                      </div>
                    </div>
                    <div className="text-[11px] font-mono text-neutral-500">#{idx + 1}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side: Live 3x4 Label Preview */}
          <div className="w-full md:w-1/2 p-6 flex flex-col items-center justify-center bg-neutral-950">
            <span className="text-xs text-neutral-400 font-mono mb-2">
              Previewing Label {activeItemIndex + 1} of {batchItems.length}
            </span>

            {/* 3x4 Mini Canvas Display */}
            <div
              style={{
                width: `${608 * 0.42}px`,
                height: `${812 * 0.42}px`
              }}
              className="relative bg-white text-black shadow-xl rounded-sm border-2 border-neutral-300 overflow-hidden"
            >
              {currentPreviewElements.map((el) => (
                <ThermalCanvasElement
                  key={el.id}
                  element={el}
                  scale={0.42}
                  isPrintMode={true}
                />
              ))}
            </div>

            {/* Navigation Carousel */}
            <div className="flex items-center gap-3 mt-4 text-xs">
              <button
                disabled={activeItemIndex === 0}
                onClick={() => setActiveItemIndex((i) => Math.max(0, i - 1))}
                className="px-3 py-1 rounded bg-neutral-800 disabled:opacity-40 text-neutral-200"
              >
                Previous
              </button>
              <span className="font-mono text-neutral-400">
                {activeItemIndex + 1} / {batchItems.length}
              </span>
              <button
                disabled={activeItemIndex >= batchItems.length - 1}
                onClick={() => setActiveItemIndex((i) => Math.min(batchItems.length - 1, i + 1))}
                className="px-3 py-1 rounded bg-neutral-800 disabled:opacity-40 text-neutral-200"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-900/90 flex items-center justify-between">
          <div className="text-xs text-neutral-400 font-mono">
            Continuous Roll: 3" × 4" × {batchItems.length} labels
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={() => onPrintBatch(batchItems)}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-500/10 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print All ({batchItems.length}) 3×4 Labels</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
