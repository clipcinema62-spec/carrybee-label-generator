import React, { useState } from 'react';
import { 
  hasWebUSB, 
  hasWebSerial, 
  hasWebBluetooth, 
  sendViaWebUSB, 
  sendViaWebSerial, 
  sendViaWebBluetooth 
} from '../utils/webHardware';
import { PrinterProfile } from '../types/label';
import { X, Usb, Bluetooth, Radio, CheckCircle2, AlertCircle, Play } from 'lucide-react';

interface HardwareConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfile: PrinterProfile;
}

export const HardwareConnectModal: React.FC<HardwareConnectModalProps> = ({
  isOpen,
  onClose,
  activeProfile
}) => {
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const [isBusy, setIsBusy] = useState<boolean>(false);

  if (!isOpen) return null;

  const testCommand =
    activeProfile.protocol === 'ZPL'
      ? '^XA^PW608^LL812^FO50,50^A0N,40,40^FDZEBRA 3x4 OK^FS^FO50,120^BY2,3,60^BCN,60,Y,N,N^FDTEST123^FS^XZ'
      : 'SIZE 3,4\r\nGAP 3 mm,0 mm\r\nCLS\r\nTEXT 50,50,"3",0,2,2,"3x4 THERMAL OK"\r\nBARCODE 50,120,"128",60,1,0,2,4,"TEST123"\r\nPRINT 1,1\r\n';

  const handleTestUSB = async () => {
    setIsBusy(true);
    setStatusMsg({ text: 'Requesting USB device permissions...' });
    const res = await sendViaWebUSB(testCommand);
    setIsBusy(false);
    setStatusMsg({ text: res.message, isError: !res.success });
  };

  const handleTestSerial = async () => {
    setIsBusy(true);
    setStatusMsg({ text: 'Opening Serial port selection...' });
    const res = await sendViaWebSerial(testCommand, 9600);
    setIsBusy(false);
    setStatusMsg({ text: res.message, isError: !res.success });
  };

  const handleTestBluetooth = async () => {
    setIsBusy(true);
    setStatusMsg({ text: 'Scanning for nearby Bluetooth thermal printers...' });
    const res = await sendViaWebBluetooth(testCommand);
    setIsBusy(false);
    setStatusMsg({ text: res.message, isError: !res.success });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-xs">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Usb className="w-5 h-5 text-amber-400" />
              <span>Direct Thermal Hardware Connection</span>
            </h2>
            <p className="text-neutral-400 mt-0.5">
              Connect directly to {activeProfile.name} without installing complex driver suites.
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
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Status Message */}
          {statusMsg && (
            <div
              className={`p-3 rounded-lg border flex items-start gap-2 ${
                statusMsg.isError
                  ? 'bg-rose-950/40 border-rose-800 text-rose-300'
                  : 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
              }`}
            >
              {statusMsg.isError ? (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span className="font-mono">{statusMsg.text}</span>
            </div>
          )}

          {/* Connection Options */}
          <div className="space-y-3">
            {/* WebUSB */}
            <div className="p-4 rounded-lg bg-neutral-800/50 border border-neutral-700/60 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 font-bold text-white">
                  <Usb className="w-4 h-4 text-amber-400" />
                  <span>WebUSB Direct (Recommended for Desktop)</span>
                </div>
                <p className="text-neutral-400 mt-1 max-w-md">
                  Send raw TSPL/ZPL commands straight to USB thermal printers like Xprinter XP-420B, Gprinter GP-1324D, or Zebra ZD420.
                </p>
                <span className="text-[10px] font-mono text-neutral-500 mt-1 block">
                  Support: {hasWebUSB() ? '✅ Supported in this browser' : '❌ Requires Chrome or Edge'}
                </span>
              </div>
              <button
                disabled={!hasWebUSB() || isBusy}
                onClick={handleTestUSB}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black rounded font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Test USB Print</span>
              </button>
            </div>

            {/* Web Serial */}
            <div className="p-4 rounded-lg bg-neutral-800/50 border border-neutral-700/60 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 font-bold text-white">
                  <Radio className="w-4 h-4 text-amber-400" />
                  <span>Web Serial (COM Port / Virtual Serial)</span>
                </div>
                <p className="text-neutral-400 mt-1 max-w-md">
                  Connect via USB Virtual COM Port (baud 9600 / 115200) for Dotmax, POSLogic, and industrial serial interfaces.
                </p>
                <span className="text-[10px] font-mono text-neutral-500 mt-1 block">
                  Support: {hasWebSerial() ? '✅ Supported' : '❌ Requires Chrome or Edge'}
                </span>
              </div>
              <button
                disabled={!hasWebSerial() || isBusy}
                onClick={handleTestSerial}
                className="px-3.5 py-2 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-40 text-white rounded font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Test Serial</span>
              </button>
            </div>

            {/* Web Bluetooth */}
            <div className="p-4 rounded-lg bg-neutral-800/50 border border-neutral-700/60 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 font-bold text-white">
                  <Bluetooth className="w-4 h-4 text-sky-400" />
                  <span>Web Bluetooth (Portable & Sunmi)</span>
                </div>
                <p className="text-neutral-400 mt-1 max-w-md">
                  Wireless thermal printing for Sunmi V2s handhelds and Bluetooth mobile courier printers.
                </p>
                <span className="text-[10px] font-mono text-neutral-500 mt-1 block">
                  Support: {hasWebBluetooth() ? '✅ Supported' : '❌ Requires Bluetooth enabled browser'}
                </span>
              </div>
              <button
                disabled={!hasWebBluetooth() || isBusy}
                onClick={handleTestBluetooth}
                className="px-3.5 py-2 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-40 text-white rounded font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Pair Bluetooth</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
