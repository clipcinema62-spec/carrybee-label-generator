import React from 'react';
import { ElementType, LabelElement, LabelTemplate } from '../types/label';
import { 
  Type, 
  Barcode, 
  QrCode, 
  Minus, 
  Square, 
  ShieldAlert, 
  Image as ImageIcon,
  FolderOpen,
  Sparkles
} from 'lucide-react';
import { LABEL_TEMPLATES } from '../utils/templates';

interface ElementToolbarProps {
  onAddElement: (element: LabelElement) => void;
  onApplyTemplate: (template: LabelTemplate) => void;
  currentTemplateId?: string;
}

export const ElementToolbar: React.FC<ElementToolbarProps> = ({
  onAddElement,
  onApplyTemplate,
  currentTemplateId
}) => {
  // Helper to generate unique ID
  const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}`;

  // Quick Add Text
  const handleAddText = (type: 'title' | 'body' | 'inverted') => {
    if (type === 'inverted') {
      onAddElement({
        id: newId('txt-inv'),
        type: 'text',
        content: 'PRIORITY SHIPMENT',
        x: 40,
        y: 60,
        width: 300,
        height: 38,
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'sans',
        isInverted: true
      });
    } else if (type === 'title') {
      onAddElement({
        id: newId('txt-title'),
        type: 'text',
        content: 'CARRYBEE LOGISTICS',
        x: 40,
        y: 40,
        width: 360,
        height: 32,
        fontSize: 20,
        fontWeight: 'black',
        fontFamily: 'sans'
      });
    } else {
      onAddElement({
        id: newId('txt-body'),
        type: 'text',
        content: 'Delivery Address / Order Notes',
        x: 40,
        y: 120,
        width: 320,
        height: 24,
        fontSize: 12,
        fontWeight: 'normal',
        fontFamily: 'sans'
      });
    }
  };

  // Quick Add Barcode
  const handleAddBarcode = (format: 'CODE128' | 'EAN13') => {
    onAddElement({
      id: newId('barcode'),
      type: 'barcode',
      barcodeFormat: format,
      barcodeValue: format === 'EAN13' ? '890123456789' : 'CB-2026-98421',
      showBarcodeText: true,
      barWidth: 2,
      barHeight: 80,
      x: 40,
      y: 200,
      width: 520,
      height: 105
    });
  };

  // Quick Add QR Code
  const handleAddQr = () => {
    onAddElement({
      id: newId('qr'),
      type: 'qrcode',
      qrValue: 'https://carrybee.com/track/CB-2026',
      qrEcl: 'M',
      x: 420,
      y: 120,
      width: 140,
      height: 140
    });
  };

  // Quick Add Divider Line
  const handleAddLine = () => {
    onAddElement({
      id: newId('line'),
      type: 'shape',
      shapeType: 'hline',
      x: 20,
      y: 150,
      width: 568,
      height: 2,
      strokeWidth: 2
    });
  };

  // Quick Add Box
  const handleAddBox = (filled: boolean) => {
    onAddElement({
      id: newId(filled ? 'box-fill' : 'box-border'),
      type: 'shape',
      shapeType: filled ? 'fillBox' : 'rect',
      x: 40,
      y: 220,
      width: 528,
      height: 60,
      strokeWidth: 2,
      isFilled: filled
    });
  };

  // Quick Add Thermal Badge
  const handleAddBadge = (badgeType: 'FRAGILE' | 'THIS_WAY_UP' | 'COD' | 'KEEP_DRY') => {
    onAddElement({
      id: newId('badge'),
      type: 'badge',
      badgeType: badgeType,
      badgeLabel: badgeType.replace(/_/g, ' '),
      x: 40,
      y: 400,
      width: 160,
      height: 44
    });
  };

  // Handle Logo Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      onAddElement({
        id: newId('logo'),
        type: 'image',
        imageSrc: src,
        threshold: 128,
        x: 40,
        y: 40,
        width: 140,
        height: 70
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <aside className="w-64 border-r border-neutral-800 bg-neutral-900/90 flex flex-col h-full z-10 overflow-y-auto">
      {/* Templates Section */}
      <div className="p-3 border-b border-neutral-800">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-neutral-300 uppercase tracking-wider">
          <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>3x4" Templates</span>
        </div>
        <div className="space-y-1">
          {LABEL_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => onApplyTemplate(tmpl)}
              className={`w-full text-left p-2 rounded transition-colors text-xs flex flex-col ${
                currentTemplateId === tmpl.id
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
                  : 'hover:bg-neutral-800 text-neutral-300'
              }`}
            >
              <span className="font-semibold">{tmpl.name}</span>
              <span className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">{tmpl.category}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Add Elements Section */}
      <div className="p-3 border-b border-neutral-800 space-y-3">
        <div className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
          Add Element
        </div>

        {/* Text Actions */}
        <div>
          <span className="text-[11px] text-neutral-400 block mb-1.5 font-medium">Text & Headings</span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => handleAddText('title')}
              className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs flex items-center gap-1.5 font-medium transition-colors"
            >
              <Type className="w-3.5 h-3.5 text-neutral-400" />
              <span>Title</span>
            </button>
            <button
              onClick={() => handleAddText('body')}
              className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs flex items-center gap-1.5 font-medium transition-colors"
            >
              <Type className="w-3.5 h-3.5 text-neutral-400" />
              <span>Body</span>
            </button>
            <button
              onClick={() => handleAddText('inverted')}
              className="col-span-2 px-2.5 py-1.5 bg-black hover:bg-neutral-950 border border-neutral-700 text-white rounded text-xs flex items-center justify-center gap-1.5 font-mono font-bold transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Inverted Black Box</span>
            </button>
          </div>
        </div>

        {/* Barcode & QR */}
        <div>
          <span className="text-[11px] text-neutral-400 block mb-1.5 font-medium">Barcodes & 2D</span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => handleAddBarcode('CODE128')}
              className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs flex items-center gap-1.5 font-medium transition-colors"
            >
              <Barcode className="w-3.5 h-3.5 text-neutral-400" />
              <span>Code 128</span>
            </button>
            <button
              onClick={() => handleAddBarcode('EAN13')}
              className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs flex items-center gap-1.5 font-medium transition-colors"
            >
              <Barcode className="w-3.5 h-3.5 text-neutral-400" />
              <span>EAN-13</span>
            </button>
            <button
              onClick={handleAddQr}
              className="col-span-2 px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs flex items-center justify-center gap-1.5 font-medium transition-colors"
            >
              <QrCode className="w-3.5 h-3.5 text-neutral-400" />
              <span>QR Code (URL/Text)</span>
            </button>
          </div>
        </div>

        {/* Lines & Shapes */}
        <div>
          <span className="text-[11px] text-neutral-400 block mb-1.5 font-medium">Shapes & Dividers</span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={handleAddLine}
              className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs flex items-center gap-1.5 font-medium transition-colors"
            >
              <Minus className="w-3.5 h-3.5 text-neutral-400" />
              <span>Divider Line</span>
            </button>
            <button
              onClick={() => handleAddBox(false)}
              className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs flex items-center gap-1.5 font-medium transition-colors"
            >
              <Square className="w-3.5 h-3.5 text-neutral-400" />
              <span>Border Box</span>
            </button>
          </div>
        </div>

        {/* Logistics Badges */}
        <div>
          <span className="text-[11px] text-neutral-400 block mb-1.5 font-medium">Thermal Logistics Badges</span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => handleAddBadge('FRAGILE')}
              className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs flex items-center gap-1 font-mono transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Fragile</span>
            </button>
            <button
              onClick={() => handleAddBadge('THIS_WAY_UP')}
              className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs flex items-center gap-1 font-mono transition-colors"
            >
              <span>↑↑ Up</span>
            </button>
            <button
              onClick={() => handleAddBadge('COD')}
              className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs flex items-center gap-1 font-mono transition-colors"
            >
              <span>COD</span>
            </button>
            <button
              onClick={() => handleAddBadge('KEEP_DRY')}
              className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs flex items-center gap-1 font-mono transition-colors"
            >
              <span>Keep Dry</span>
            </button>
          </div>
        </div>

        {/* Logo / Image Upload */}
        <div>
          <span className="text-[11px] text-neutral-400 block mb-1.5 font-medium">Merchant Logo</span>
          <label className="w-full px-2.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs flex items-center justify-center gap-1.5 font-medium transition-colors cursor-pointer border border-neutral-700">
            <ImageIcon className="w-3.5 h-3.5 text-neutral-400" />
            <span>Upload Logo / PNG</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        </div>
      </div>
    </aside>
  );
};
