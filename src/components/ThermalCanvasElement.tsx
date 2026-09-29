import React from 'react';
import { LabelElement } from '../types/label';
import { BarcodeRenderer } from './BarcodeRenderer';
import { QrCodeRenderer } from './QrCodeRenderer';
import { 
  Wine, 
  ArrowUp, 
  Umbrella, 
  DollarSign, 
  Ban, 
  Weight, 
  AlertTriangle 
} from 'lucide-react';

interface ThermalCanvasElementProps {
  element: LabelElement;
  isSelected?: boolean;
  scale?: number; // scale relative to canvas dots
  isPrintMode?: boolean;
  onSelect?: (e: React.MouseEvent) => void;
  onPointerDown?: (e: React.PointerEvent) => void;
}

export const ThermalCanvasElement: React.FC<ThermalCanvasElementProps> = ({
  element,
  isSelected = false,
  scale = 1,
  isPrintMode = false,
  onSelect,
  onPointerDown
}) => {
  const {
    type,
    x,
    y,
    width,
    height,
    rotation = 0,
    content,
    fontSize = 14,
    fontWeight = 'normal',
    fontFamily = 'sans',
    fontStyle = 'normal',
    textDecoration = 'none',
    textAlign = 'left',
    isInverted = false,
    barcodeFormat = 'CODE128',
    barcodeValue = '12345678',
    showBarcodeText = true,
    barWidth = 2,
    barHeight = 70,
    qrValue = 'https://example.com',
    qrEcl = 'M',
    shapeType = 'hline',
    strokeWidth = 2,
    isFilled = false,
    badgeType = 'FRAGILE',
    badgeLabel,
    imageSrc
  } = element;

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${x * scale}px`,
    top: `${y * scale}px`,
    width: `${width * scale}px`,
    height: `${height * scale}px`,
    transform: rotation ? `rotate(${rotation}deg)` : undefined,
    transformOrigin: 'top left',
    cursor: isPrintMode ? 'default' : 'move',
    userSelect: 'none',
    boxSizing: 'border-box'
  };

  const renderBadgeIcon = () => {
    switch (badgeType) {
      case 'FRAGILE':
      case 'GLASS':
        return <Wine className="w-4 h-4 stroke-[2.5]" />;
      case 'THIS_WAY_UP':
        return <ArrowUp className="w-4 h-4 stroke-[2.5]" />;
      case 'KEEP_DRY':
        return <Umbrella className="w-4 h-4 stroke-[2.5]" />;
      case 'COD':
        return <DollarSign className="w-4 h-4 stroke-[2.5]" />;
      case 'DO_NOT_BEND':
        return <Ban className="w-4 h-4 stroke-[2.5]" />;
      case 'HEAVY':
        return <Weight className="w-4 h-4 stroke-[2.5]" />;
      default:
        return <AlertTriangle className="w-4 h-4 stroke-[2.5]" />;
    }
  };

  const renderContent = () => {
    switch (type) {
      case 'text': {
        const fontFamClass =
          fontFamily === 'mono'
            ? 'font-mono'
            : fontFamily === 'serif'
            ? 'font-serif'
            : 'font-sans';

        const weightClass =
          fontWeight === 'black'
            ? 'font-black'
            : fontWeight === 'bold'
            ? 'font-bold'
            : fontWeight === 'medium'
            ? 'font-semibold'
            : 'font-normal';

        const alignClass =
          textAlign === 'center'
            ? 'text-center justify-center'
            : textAlign === 'right'
            ? 'text-right justify-end'
            : 'text-left justify-start';

        const styleClass = fontStyle === 'italic' ? 'italic' : '';
        const decorClass = textDecoration === 'underline' ? 'underline underline-offset-4 decoration-2' : '';

        return (
          <div
            className={`w-full h-full flex items-center ${alignClass} ${
              isInverted
                ? 'bg-black text-white px-2 py-0.5'
                : 'text-black'
            } ${fontFamClass} ${weightClass} ${styleClass} ${decorClass} leading-snug overflow-hidden break-words`}
            style={{
              fontSize: `${fontSize * scale}px`
            }}
          >
            <span className="w-full whitespace-pre-line">{content || 'Text Element'}</span>
          </div>
        );
      }

      case 'barcode': {
        return (
          <div className="w-full h-full bg-white flex flex-col items-center justify-center p-0.5 overflow-hidden">
            <BarcodeRenderer
              value={barcodeValue}
              format={barcodeFormat}
              width={barWidth}
              height={barHeight * scale}
              displayValue={showBarcodeText}
            />
          </div>
        );
      }

      case 'qrcode': {
        return (
          <div className="w-full h-full bg-white flex items-center justify-center p-0.5 overflow-hidden">
            <QrCodeRenderer
              value={qrValue}
              ecl={qrEcl}
              size={Math.min(width, height) * scale}
            />
          </div>
        );
      }

      case 'shape': {
        const strokePx = Math.max(1, Math.round(strokeWidth * scale));
        if (shapeType === 'hline') {
          return (
            <div
              className="w-full bg-black"
              style={{ height: `${strokePx}px`, marginTop: `${(height * scale - strokePx) / 2}px` }}
            />
          );
        } else if (shapeType === 'vline') {
          return (
            <div
              className="h-full bg-black"
              style={{ width: `${strokePx}px`, marginLeft: `${(width * scale - strokePx) / 2}px` }}
            />
          );
        } else if (shapeType === 'fillBox' || isFilled) {
          return <div className="w-full h-full bg-black" />;
        } else {
          return (
            <div
              className="w-full h-full border-black"
              style={{ borderWidth: `${strokePx}px`, borderStyle: 'solid' }}
            />
          );
        }
      }

      case 'badge': {
        const text = badgeLabel || badgeType;
        return (
          <div className="w-full h-full border-2 border-black flex items-center justify-center gap-1.5 px-2 bg-white text-black font-mono font-bold text-xs uppercase tracking-wider">
            {renderBadgeIcon()}
            <span className="truncate">{text}</span>
          </div>
        );
      }

      case 'image': {
        if (!imageSrc) {
          return (
            <div className="w-full h-full border border-dashed border-neutral-400 flex items-center justify-center text-neutral-400 text-xs font-mono">
              [Logo / Image]
            </div>
          );
        }
        return (
          <img
            src={imageSrc}
            alt="Thermal Graphic"
            className="w-full h-full object-contain filter grayscale contrast-200"
            style={{ imageRendering: 'pixelated' }}
          />
        );
      }
    }
  };

  return (
    <div
      style={style}
      onClick={onSelect}
      onPointerDown={onPointerDown}
      className={`group ${
        !isPrintMode && isSelected
          ? 'ring-2 ring-amber-500 ring-offset-1 z-30'
          : !isPrintMode
          ? 'hover:outline-1 hover:outline-dashed hover:outline-neutral-400 z-10'
          : ''
      }`}
    >
      {renderContent()}

      {/* Selection Handles (Screen Mode only) */}
      {!isPrintMode && isSelected && (
        <>
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-amber-500 rounded-sm pointer-events-none" />
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-amber-500 rounded-sm pointer-events-none" />
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-amber-500 rounded-sm pointer-events-none" />
          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-amber-500 rounded-sm pointer-events-none" />
        </>
      )}
    </div>
  );
};
