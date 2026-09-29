import React from 'react';
import { LabelConfig, LabelElement } from '../types/label';
import { 
  Trash2, 
  Copy, 
  AlignCenter, 
  RotateCw, 
  Sliders, 
  Check, 
  Layers
} from 'lucide-react';

interface ElementPropertyPanelProps {
  element: LabelElement | null;
  config: LabelConfig;
  onUpdateElement: (id: string, updates: Partial<LabelElement>) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (element: LabelElement) => void;
  onUpdateConfig: (updates: Partial<LabelConfig>) => void;
}

export const ElementPropertyPanel: React.FC<ElementPropertyPanelProps> = ({
  element,
  config,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onUpdateConfig
}) => {
  const baseWidthDots = config.dpi === 300 ? 900 : 608;
  const baseHeightDots = config.dpi === 300 ? 1200 : 812;

  // When no element is selected: show Label Media & Thermal Head Settings
  if (!element) {
    const isLandscape = config.orientation === 'landscape' || config.widthInches > config.heightInches;

    return (
      <aside className="w-72 border-l border-neutral-800 bg-neutral-900/90 flex flex-col h-full z-10 overflow-y-auto p-4 text-xs">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-800">
          <Sliders className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-neutral-200 uppercase tracking-wider">3x4" Media Settings</span>
        </div>

        <div className="space-y-4">
          {/* Orientation Switcher */}
          <div>
            <label className="text-neutral-400 block mb-1">Label Media Layout</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() =>
                  onUpdateConfig({
                    orientation: 'portrait',
                    widthInches: 3,
                    heightInches: 4
                  })
                }
                className={`py-2 px-2.5 rounded font-mono text-center transition-colors border ${
                  !isLandscape
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'
                }`}
              >
                <div className="text-xs">3" × 4" Portrait</div>
                <div className="text-[10px] opacity-75">76 × 102 mm</div>
              </button>
              <button
                onClick={() =>
                  onUpdateConfig({
                    orientation: 'landscape',
                    widthInches: 4,
                    heightInches: 3
                  })
                }
                className={`py-2 px-2.5 rounded font-mono text-center transition-colors border ${
                  isLandscape
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'
                }`}
              >
                <div className="text-xs">4" × 3" Landscape</div>
                <div className="text-[10px] opacity-75">102 × 76 mm</div>
              </button>
            </div>
            <span className="text-[10px] text-neutral-500 block mt-1">
              {isLandscape ? 'Matched with wider carton & parcel tags' : 'Standard courier roll feed'}
            </span>
          </div>

          {/* Paper Size Display */}
          <div>
            <label className="text-neutral-400 block mb-1">Roll Dimensions</label>
            <div className="p-2.5 bg-neutral-800/80 rounded border border-neutral-700/80 font-mono text-neutral-200">
              <div className="font-bold text-sm">
                {config.widthInches}.00 × {config.heightInches}.00 Inches
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">
                {Math.round(config.widthInches * 25.4)} × {Math.round(config.heightInches * 25.4)} mm (Die-cut roll)
              </div>
            </div>
          </div>

          {/* Thermal Print Resolution */}
          <div>
            <label className="text-neutral-400 block mb-1">Thermal Head Resolution (DPI)</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateConfig({ dpi: 203 })}
                className={`py-2 px-3 rounded font-mono text-center transition-colors ${
                  config.dpi === 203
                    ? 'bg-amber-500 text-black font-bold'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                <div>203 DPI</div>
                <div className="text-[10px] opacity-80">8 dots/mm</div>
              </button>
              <button
                onClick={() => onUpdateConfig({ dpi: 300 })}
                className={`py-2 px-3 rounded font-mono text-center transition-colors ${
                  config.dpi === 300
                    ? 'bg-amber-500 text-black font-bold'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                <div>300 DPI</div>
                <div className="text-[10px] opacity-80">12 dots/mm</div>
              </button>
            </div>
          </div>

          {/* Gap Calibration */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-neutral-400">Media Gap Length</span>
              <span className="font-mono text-neutral-200">{config.gapMm} mm</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={config.gapMm}
              onChange={(e) => onUpdateConfig({ gapMm: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Darkness / Burn Temp */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-neutral-400">Thermal Darkness (Density)</span>
              <span className="font-mono text-neutral-200">{config.darkness} / 15</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              value={config.darkness}
              onChange={(e) => onUpdateConfig({ darkness: parseInt(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <span className="text-[10px] text-neutral-500 block mt-1">
              Higher value gives darker barcodes for Gprinter/Xprinter/Zebra.
            </span>
          </div>

          {/* Print Speed */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-neutral-400">Print Speed</span>
              <span className="font-mono text-neutral-200">{config.speed} IPS</span>
            </div>
            <input
              type="range"
              min="2"
              max="6"
              value={config.speed}
              onChange={(e) => onUpdateConfig({ speed: parseInt(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Tips box */}
          <div className="p-3 bg-neutral-800/50 rounded border border-neutral-700/50 text-[11px] text-neutral-400 leading-relaxed">
            <strong className="text-neutral-300 block mb-1">💡 Quick Tip:</strong>
            Click any element on the 3x4 canvas to adjust its coordinates, barcode format, text size, or inverted thermal styling.
          </div>
        </div>
      </aside>
    );
  }

  // Element is selected: Show specific property controls
  const handleUpdate = (updates: Partial<LabelElement>) => {
    onUpdateElement(element.id, updates);
  };

  // Center horizontally
  const handleCenterHorizontal = () => {
    const newX = Math.round((baseWidthDots - element.width) / 2);
    handleUpdate({ x: Math.max(0, newX) });
  };

  // Rotate 90 degrees
  const handleRotate = () => {
    const cur = element.rotation || 0;
    const next = (cur + 90) % 360 as 0 | 90 | 180 | 270;
    handleUpdate({ rotation: next });
  };

  return (
    <aside className="w-72 border-l border-neutral-800 bg-neutral-900/90 flex flex-col h-full z-10 overflow-y-auto p-4 text-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-800">
        <div className="flex items-center gap-1.5 font-semibold text-neutral-200 uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>{element.type} Element</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onDuplicateElement(element)}
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800"
            title="Duplicate Element"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDeleteElement(element.id)}
            className="p-1 rounded text-rose-400 hover:text-rose-200 hover:bg-rose-950/40"
            title="Delete Element"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Geometry (X, Y, W, H) */}
        <div>
          <span className="text-[11px] text-neutral-400 block mb-1.5 font-medium">Position & Size (Dots)</span>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-neutral-400 block mb-0.5">X (dots)</label>
              <input
                type="number"
                value={Math.round(element.x)}
                onChange={(e) => handleUpdate({ x: parseInt(e.target.value) || 0 })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-neutral-200 font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-neutral-400 block mb-0.5">Y (dots)</label>
              <input
                type="number"
                value={Math.round(element.y)}
                onChange={(e) => handleUpdate({ y: parseInt(e.target.value) || 0 })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-neutral-200 font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-neutral-400 block mb-0.5">Width</label>
              <input
                type="number"
                value={Math.round(element.width)}
                onChange={(e) => handleUpdate({ width: Math.max(10, parseInt(e.target.value) || 10) })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-neutral-200 font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-neutral-400 block mb-0.5">Height</label>
              <input
                type="number"
                value={Math.round(element.height)}
                onChange={(e) => handleUpdate({ height: Math.max(2, parseInt(e.target.value) || 2) })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-neutral-200 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Quick Position Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCenterHorizontal}
            className="flex-1 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[11px] flex items-center justify-center gap-1 font-medium transition-colors"
          >
            <AlignCenter className="w-3 h-3" />
            <span>Center Horiz</span>
          </button>
          <button
            onClick={handleRotate}
            className="py-1.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[11px] flex items-center justify-center gap-1 font-mono transition-colors"
          >
            <RotateCw className="w-3 h-3" />
            <span>{element.rotation || 0}°</span>
          </button>
        </div>

        {/* TYPE SPECIFIC CONTROLS */}

        {/* Text Element Controls */}
        {element.type === 'text' && (
          <div className="space-y-3 pt-2 border-t border-neutral-800">
            <div>
              <label className="text-neutral-400 block mb-1">Text Content</label>
              <textarea
                rows={3}
                value={element.content || ''}
                onChange={(e) => handleUpdate({ content: e.target.value })}
                placeholder="Enter text or multi-line address/items..."
                className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-neutral-100 text-xs font-medium resize-none"
              />
            </div>

            {/* Styling Toggles: Italic & Underline */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  handleUpdate({
                    fontStyle: element.fontStyle === 'italic' ? 'normal' : 'italic'
                  })
                }
                className={`py-1.5 px-2 rounded text-xs flex items-center justify-center gap-1 border transition-colors ${
                  element.fontStyle === 'italic'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'
                }`}
              >
                <span className="italic font-serif font-bold text-sm">I</span>
                <span>Italic Text</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleUpdate({
                    textDecoration: element.textDecoration === 'underline' ? 'none' : 'underline'
                  })
                }
                className={`py-1.5 px-2 rounded text-xs flex items-center justify-center gap-1 border transition-colors ${
                  element.textDecoration === 'underline'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'
                }`}
              >
                <span className="underline font-bold text-sm">U</span>
                <span>Underline</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-neutral-400 block mb-1">Font Size</label>
                <input
                  type="number"
                  min="8"
                  max="72"
                  value={element.fontSize || 14}
                  onChange={(e) => handleUpdate({ fontSize: parseInt(e.target.value) || 14 })}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 font-mono text-neutral-100"
                />
              </div>
              <div>
                <label className="text-neutral-400 block mb-1">Weight</label>
                <select
                  value={element.fontWeight || 'normal'}
                  onChange={(e) =>
                    handleUpdate({
                      fontWeight: e.target.value as 'normal' | 'medium' | 'bold' | 'black'
                    })
                  }
                  className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-neutral-100"
                >
                  <option value="normal">Regular</option>
                  <option value="medium">Medium</option>
                  <option value="bold">Bold</option>
                  <option value="black">Black Heavy</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-neutral-400 block mb-1">Font Family</label>
                <select
                  value={element.fontFamily || 'sans'}
                  onChange={(e) =>
                    handleUpdate({
                      fontFamily: e.target.value as 'sans' | 'mono' | 'serif'
                    })
                  }
                  className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-neutral-100"
                >
                  <option value="sans">Clean Sans</option>
                  <option value="mono">JetBrains Mono</option>
                </select>
              </div>
              <div>
                <label className="text-neutral-400 block mb-1">Align</label>
                <select
                  value={element.textAlign || 'left'}
                  onChange={(e) =>
                    handleUpdate({
                      textAlign: e.target.value as 'left' | 'center' | 'right'
                    })
                  }
                  className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-neutral-100"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>

            {/* Inverted Thermal Block Toggle */}
            <label className="flex items-center gap-2 p-2 bg-neutral-800/80 rounded border border-neutral-700 cursor-pointer">
              <input
                type="checkbox"
                checked={element.isInverted || false}
                onChange={(e) => handleUpdate({ isInverted: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded"
              />
              <span className="font-semibold text-neutral-200">
                Inverted (White on Black Box)
              </span>
            </label>
          </div>
        )}

        {/* Barcode Element Controls */}
        {element.type === 'barcode' && (
          <div className="space-y-3 pt-2 border-t border-neutral-800">
            <div>
              <label className="text-neutral-400 block mb-1">Barcode Value / Code</label>
              <input
                type="text"
                value={element.barcodeValue || ''}
                onChange={(e) => handleUpdate({ barcodeValue: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1.5 text-neutral-100 font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-neutral-400 block mb-1">Symbology</label>
                <select
                  value={element.barcodeFormat || 'CODE128'}
                  onChange={(e) =>
                    handleUpdate({
                      barcodeFormat: e.target.value as any
                    })
                  }
                  className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-neutral-100"
                >
                  <option value="CODE128">Code 128 (Logistics)</option>
                  <option value="EAN13">EAN-13 (Retail)</option>
                  <option value="CODE39">Code 39 (Alphanumeric)</option>
                  <option value="ITF14">ITF-14 (Carton)</option>
                </select>
              </div>
              <div>
                <label className="text-neutral-400 block mb-1">Bar Height</label>
                <input
                  type="number"
                  min="30"
                  max="160"
                  value={element.barHeight || 70}
                  onChange={(e) => handleUpdate({ barHeight: parseInt(e.target.value) || 70 })}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 font-mono text-neutral-100"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
              <input
                type="checkbox"
                checked={element.showBarcodeText ?? true}
                onChange={(e) => handleUpdate({ showBarcodeText: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded"
              />
              <span>Show human-readable text below</span>
            </label>
          </div>
        )}

        {/* QR Code Element Controls */}
        {element.type === 'qrcode' && (
          <div className="space-y-3 pt-2 border-t border-neutral-800">
            <div>
              <label className="text-neutral-400 block mb-1">QR Value / Tracking URL</label>
              <textarea
                rows={2}
                value={element.qrValue || ''}
                onChange={(e) => handleUpdate({ qrValue: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-neutral-100 font-mono text-xs resize-none"
              />
            </div>
            <div>
              <label className="text-neutral-400 block mb-1">Error Correction Level (ECC)</label>
              <select
                value={element.qrEcl || 'M'}
                onChange={(e) => handleUpdate({ qrEcl: e.target.value as any })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-neutral-100"
              >
                <option value="L">L - 7% damage recovery</option>
                <option value="M">M - 15% standard</option>
                <option value="Q">Q - 25% industrial</option>
                <option value="H">H - 30% maximum durability</option>
              </select>
            </div>
          </div>
        )}

        {/* Shape Element Controls */}
        {element.type === 'shape' && (
          <div className="space-y-3 pt-2 border-t border-neutral-800">
            <div>
              <label className="text-neutral-400 block mb-1">Shape Type</label>
              <select
                value={element.shapeType || 'hline'}
                onChange={(e) => handleUpdate({ shapeType: e.target.value as any })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-neutral-100"
              >
                <option value="hline">Horizontal Divider Line</option>
                <option value="vline">Vertical Divider Line</option>
                <option value="rect">Border Rectangle Box</option>
                <option value="fillBox">Solid Black Box</option>
              </select>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-neutral-400">Stroke Thickness</span>
                <span className="font-mono text-neutral-200">{element.strokeWidth || 2} dots</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                value={element.strokeWidth || 2}
                onChange={(e) => handleUpdate({ strokeWidth: parseInt(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Badge Element Controls */}
        {element.type === 'badge' && (
          <div className="space-y-3 pt-2 border-t border-neutral-800">
            <div>
              <label className="text-neutral-400 block mb-1">Thermal Badge Preset</label>
              <select
                value={element.badgeType || 'FRAGILE'}
                onChange={(e) =>
                  handleUpdate({
                    badgeType: e.target.value as any,
                    badgeLabel: e.target.value.replace(/_/g, ' ')
                  })
                }
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-neutral-100"
              >
                <option value="FRAGILE">FRAGILE (Wine Glass)</option>
                <option value="THIS_WAY_UP">THIS WAY UP (Arrows)</option>
                <option value="KEEP_DRY">KEEP DRY (Umbrella)</option>
                <option value="COD">COD (Cash on Delivery)</option>
                <option value="DO_NOT_BEND">DO NOT BEND</option>
                <option value="HEAVY">HEAVY PACKAGE</option>
              </select>
            </div>
            <div>
              <label className="text-neutral-400 block mb-1">Badge Text Label</label>
              <input
                type="text"
                value={element.badgeLabel || ''}
                onChange={(e) => handleUpdate({ badgeLabel: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 font-mono text-neutral-100"
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
