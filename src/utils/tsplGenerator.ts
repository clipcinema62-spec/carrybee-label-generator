import { LabelConfig, LabelElement } from '../types/label';

/**
 * TSPL2 command generator for Gprinter, Xprinter, Dotmax, etc.
 * Reference: TSPL/TSPL2 Programming Language Manual
 */
export function generateTSPL(elements: LabelElement[], config: LabelConfig): string {
  const { widthInches, heightInches, gapMm, darkness, speed } = config;
  const lines: string[] = [];

  // 1. Setup label dimensions and media gap
  lines.push(`SIZE ${widthInches},${heightInches}`);
  lines.push(`GAP ${gapMm} mm,0 mm`);
  lines.push(`SPEED ${speed}`);
  lines.push(`DENSITY ${darkness}`);
  lines.push(`DIRECTION 1`);
  lines.push(`REFERENCE 0,0`);
  lines.push(`OFFSET 0 mm`);
  lines.push(`SET PEEL OFF`);
  lines.push(`SET TEAR ON`);
  lines.push(`CLS`); // Clear image buffer

  // 2. Render each element
  for (const el of elements) {
    const x = Math.round(el.x);
    const y = Math.round(el.y);
    const w = Math.round(el.width);
    const h = Math.round(el.height);
    const rot = el.rotation || 0;

    switch (el.type) {
      case 'text': {
        const text = (el.content || '').replace(/"/g, '\\"');
        const fontSize = el.fontSize || 14;
        
        // Map font size to TSPL magnification (Font "3" or "4" is standard bitmap)
        const xMul = Math.max(1, Math.min(6, Math.round(fontSize / 10)));
        const yMul = xMul;

        if (el.isInverted) {
          // Inverted block: draw black bar first, then reverse text
          lines.push(`BAR ${x},${y},${w},${h}`);
          lines.push(`REVERSE ${x},${y},${w},${h}`);
          lines.push(`TEXT ${x + 8},${y + 4},"3",${rot},${xMul},${yMul},"${text}"`);
        } else {
          // Standard text
          lines.push(`TEXT ${x},${y},"3",${rot},${xMul},${yMul},"${text}"`);
        }
        break;
      }

      case 'barcode': {
        const val = (el.barcodeValue || '12345678').replace(/"/g, '');
        const barHeight = Math.round(el.barHeight || (h - 20));
        const showText = el.showBarcodeText ? 1 : 0;
        const narrow = el.barWidth || 2;
        const wide = narrow * 2;
        const codeType = el.barcodeFormat === 'EAN13' ? 'EAN13' : el.barcodeFormat === 'CODE39' ? '39' : '128';

        lines.push(`BARCODE ${x},${y},"${codeType}",${barHeight},${showText},${rot},${narrow},${wide},"${val}"`);
        break;
      }

      case 'qrcode': {
        const val = (el.qrValue || 'https://example.com').replace(/"/g, '\\"');
        const cellWidth = Math.max(3, Math.min(8, Math.round(w / 35)));
        const ecl = el.qrEcl || 'M';
        // TSPL format: QRCODE x,y,Ecc_level,cell_width,mode,rotation,"data"
        lines.push(`QRCODE ${x},${y},${ecl},${cellWidth},A,${rot},"${val}"`);
        break;
      }

      case 'shape': {
        const stroke = el.strokeWidth || 2;
        if (el.shapeType === 'hline') {
          lines.push(`BAR ${x},${y},${w},${stroke}`);
        } else if (el.shapeType === 'vline') {
          lines.push(`BAR ${x},${y},${stroke},${h}`);
        } else if (el.shapeType === 'fillBox' || el.isFilled) {
          lines.push(`BAR ${x},${y},${w},${h}`);
        } else {
          // Outline Box
          lines.push(`BOX ${x},${y},${x + w},${y + h},${stroke}`);
        }
        break;
      }

      case 'badge': {
        // Draw bordered badge with text label
        lines.push(`BOX ${x},${y},${x + w},${y + h},2`);
        const label = (el.badgeLabel || el.badgeType || 'BADGE').replace(/"/g, '');
        lines.push(`TEXT ${x + 6},${y + Math.round(h / 3)},"2",0,1,1,"[ ${label} ]"`);
        break;
      }

      case 'image': {
        // Bitmap command indicator
        lines.push(`; [IMAGE BITMAP AT ${x},${y} W:${w} H:${h}]`);
        break;
      }
    }
  }

  // 3. Print 1 set of 1 copy
  lines.push('PRINT 1,1');
  return lines.join('\r\n') + '\r\n';
}
