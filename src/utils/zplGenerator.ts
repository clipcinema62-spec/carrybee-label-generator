import { LabelConfig, LabelElement } from '../types/label';

/**
 * ZPL II command generator for Zebra (GK420d, ZD420, ZT series), POSLogic, etc.
 * Reference: Zebra ZPL II Programming Guide
 */
export function generateZPL(elements: LabelElement[], config: LabelConfig): string {
  const { widthInches, heightInches, dpi, darkness, speed } = config;
  const dotsPerInch = dpi;
  const totalWidthDots = Math.round(widthInches * dotsPerInch);
  const totalHeightDots = Math.round(heightInches * dotsPerInch);

  const lines: string[] = [];

  // Start format
  lines.push('^XA');
  lines.push(`^PW${totalWidthDots}`);
  lines.push(`^LL${totalHeightDots}`);
  lines.push('^LH0,0'); // Label home position
  lines.push(`^PR${speed}`); // Print rate
  lines.push(`^MD${darkness}`); // Media darkness (burn temp)

  for (const el of elements) {
    const x = Math.round(el.x);
    const y = Math.round(el.y);
    const w = Math.round(el.width);
    const h = Math.round(el.height);

    switch (el.type) {
      case 'text': {
        const text = el.content || '';
        const fontSize = Math.round(el.fontSize || 14) * 2; // rough point-to-dot scale
        const fontH = Math.max(16, fontSize);
        const fontW = Math.max(12, Math.round(fontSize * 0.8));

        if (el.isInverted) {
          // Draw solid black block, then reverse color for white text
          lines.push(`^FO${x},${y}^GB${w},${h},${h}^FS`);
          lines.push(`^FO${x + 8},${y + 4}^FR^A0N,${fontH},${fontW}^FD${text}^FS`);
        } else {
          lines.push(`^FO${x},${y}^A0N,${fontH},${fontW}^FD${text}^FS`);
        }
        break;
      }

      case 'barcode': {
        const val = el.barcodeValue || '12345678';
        const barH = Math.round(el.barHeight || (h - 20));
        const showText = el.showBarcodeText ? 'Y' : 'N';
        const narrow = el.barWidth || 2;
        
        // Code 128: ^BCo,h,f,g,e,m
        lines.push(`^FO${x},${y}^BY${narrow},3,${barH}^BCN,${barH},${showText},N,N^FD${val}^FS`);
        break;
      }

      case 'qrcode': {
        const val = el.qrValue || 'https://example.com';
        const mag = Math.max(2, Math.min(8, Math.round(w / 35)));
        // QR Code: ^BQo,2,mag,Q,7
        lines.push(`^FO${x},${y}^BQN,2,${mag}^FDLA,${val}^FS`);
        break;
      }

      case 'shape': {
        const stroke = el.strokeWidth || 2;
        if (el.shapeType === 'hline') {
          lines.push(`^FO${x},${y}^GB${w},${stroke},${stroke}^FS`);
        } else if (el.shapeType === 'vline') {
          lines.push(`^FO${x},${y}^GB${stroke},${h},${stroke}^FS`);
        } else if (el.shapeType === 'fillBox' || el.isFilled) {
          lines.push(`^FO${x},${y}^GB${w},${h},${h}^FS`);
        } else {
          // Outline box
          lines.push(`^FO${x},${y}^GB${w},${h},${stroke}^FS`);
        }
        break;
      }

      case 'badge': {
        const label = el.badgeLabel || el.badgeType || 'BADGE';
        lines.push(`^FO${x},${y}^GB${w},${h},2^FS`);
        lines.push(`^FO${x + 8},${y + Math.round(h / 3)}^A0N,20,18^FD${label}^FS`);
        break;
      }

      case 'image': {
        lines.push(`^FX Image bitmap at X:${x} Y:${y} ^FS`);
        break;
      }
    }
  }

  // End format and print 1 label
  lines.push('^XZ');
  return lines.join('\r\n') + '\r\n';
}
