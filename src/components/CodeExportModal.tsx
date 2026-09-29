import React, { useState } from 'react';
import { LabelConfig, LabelElement, PrintProtocol } from '../types/label';
import { generateTSPL } from '../utils/tsplGenerator';
import { generateZPL } from '../utils/zplGenerator';
import { generateESCPOS } from '../utils/escposGenerator';
import { downloadCommandFile, sendViaWebUSB, sendViaWebSerial } from '../utils/webHardware';
import { X, Copy, Download, Check, Terminal, Play } from 'lucide-react';

interface CodeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  elements: LabelElement[];
  config: LabelConfig;
  defaultProtocol?: PrintProtocol;
}

export const CodeExportModal: React.FC<CodeExportModalProps> = ({
  isOpen,
  onClose,
  elements,
  config,
  defaultProtocol = 'TSPL'
}) => {
  const [activeTab, setActiveTab] = useState<'TSPL' | 'ZPL' | 'ESC_POS'>(
    defaultProtocol === 'ZPL' ? 'ZPL' : defaultProtocol === 'ESC_POS' ? 'ESC_POS' : 'TSPL'
  );
  const [copied, setCopied] = useState<boolean>(false);
  const [directPrintStatus, setDirectPrintStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const tsplCode = generateTSPL(elements, config);
  const zplCode = generateZPL(elements, config);
  const escposCode = generateESCPOS(elements, config);

  const currentCode =
    activeTab === 'TSPL' ? tsplCode : activeTab === 'ZPL' ? zplCode : escposCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = activeTab === 'TSPL' ? 'tspl' : activeTab === 'ZPL' ? 'zpl' : 'prn';
    downloadCommandFile(currentCode, `thermal_label_3x4_${Date.now()}.${ext}`);
  };

  const handleSendUSB = async () => {
    setDirectPrintStatus('Sending to USB thermal printer...');
    const res = await sendViaWebUSB(currentCode);
    setDirectPrintStatus(res.message);
    setTimeout(() => setDirectPrintStatus(null), 6000);
  };

  const handleSendSerial = async () => {
    setDirectPrintStatus('Opening Serial COM port...');
    const res = await sendViaWebSerial(currentCode, 9600);
    setDirectPrintStatus(res.message);
    setTimeout(() => setDirectPrintStatus(null), 6000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white">Raw Thermal Printer Commands</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Exact binary and text command scripts for 3x4" direct thermal labels.
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

        {/* Tab Bar */}
        <div className="px-6 pt-3 border-b border-neutral-800 flex items-center gap-2 bg-neutral-950/40">
          <button
            onClick={() => setActiveTab('TSPL')}
            className={`px-4 py-2 text-xs font-mono font-bold border-b-2 transition-all ${
              activeTab === 'TSPL'
                ? 'border-amber-400 text-amber-300 bg-neutral-800/40'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            TSPL (Gprinter / Xprinter / Dotmax)
          </button>
          <button
            onClick={() => setActiveTab('ZPL')}
            className={`px-4 py-2 text-xs font-mono font-bold border-b-2 transition-all ${
              activeTab === 'ZPL'
                ? 'border-amber-400 text-amber-300 bg-neutral-800/40'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            ZPL II (Zebra / POSLogic)
          </button>
          <button
            onClick={() => setActiveTab('ESC_POS')}
            className={`px-4 py-2 text-xs font-mono font-bold border-b-2 transition-all ${
              activeTab === 'ESC_POS'
                ? 'border-amber-400 text-amber-300 bg-neutral-800/40'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            ESC/POS (Sunmi / Receipt Label)
          </button>
        </div>

        {/* Code Content View */}
        <div className="flex-1 p-6 overflow-hidden flex flex-col">
          {directPrintStatus && (
            <div className="mb-3 p-2.5 rounded bg-neutral-800 text-xs font-mono text-amber-300 border border-neutral-700">
              {directPrintStatus}
            </div>
          )}

          <div className="flex-1 bg-black rounded-lg border border-neutral-800 p-4 overflow-auto font-mono text-xs text-neutral-200 selection:bg-amber-500 selection:text-black leading-relaxed">
            <pre>{currentCode}</pre>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-900/90 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSendUSB}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded font-semibold transition-colors flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 text-amber-400" />
              <span>Send via WebUSB</span>
            </button>
            <button
              onClick={handleSendSerial}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded font-semibold transition-colors flex items-center gap-1.5"
            >
              <span>Send via Serial COM</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded font-semibold transition-colors flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black rounded font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
