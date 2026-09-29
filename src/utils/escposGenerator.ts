import { LabelConfig, LabelElement } from '../types/label';

/**
 * ESC/POS generator for Sunmi, POSLogic, and generic thermal receipt/label printers.
 * Generates raw command sequences and human-readable command dump.
 */
export function generateESCPOS(elements: LabelElement[], config: LabelConfig): string {
  const lines: string[] = [];

  // ESC @ - Initialize printer
  lines.push('// ESC/POS Thermal Command Sequence');
  lines.push('HEX: 1B 40 // [ESC @] Initialize printer');
  lines.push(`// Media Size: ${config.widthInches} x ${config.heightInches} inches (${config.dpi} DPI)`);
  lines.push('HEX: 1B 33 18 // [ESC 3 24] Set line spacing to 24 dots');

  for (const el of elements) {
    switch (el.type) {
      case 'text': {
        const text = el.content || '';
        if (el.isInverted) {
          lines.push(`HEX: 1D 42 01 // [GS B 1] Turn ON white/black reverse print mode`);
          lines.push(`TEXT: "${text}"`);
          lines.push(`HEX: 1D 42 00 // [GS B 0] Turn OFF white/black reverse mode`);
        } else if (el.fontWeight === 'bold' || el.fontWeight === 'black') {
          lines.push(`HEX: 1B 45 01 // [ESC E 1] Turn ON bold mode`);
          lines.push(`TEXT: "${text}"`);
          lines.push(`HEX: 1B 45 00 // [ESC E 0] Turn OFF bold mode`);
        } else {
          lines.push(`TEXT: "${text}"`);
        }
        break;
      }

      case 'barcode': {
        const val = el.barcodeValue || '12345678';
        const h = Math.min(255, Math.max(20, Math.round(el.barHeight || 80)));
        lines.push(`HEX: 1D 68 ${h.toString(16).padStart(2, '0').toUpperCase()} // [GS h ${h}] Set barcode height`);
        lines.push(`HEX: 1D 77 03 // [GS w 3] Set barcode module width`);
        lines.push(`HEX: 1D 6B 49 ${val.length.toString(16).padStart(2, '0').toUpperCase()} // [GS k CODE128] Barcode: ${val}`);
        break;
      }

      case 'qrcode': {
        const val = el.qrValue || 'https://example.com';
        lines.push(`// QR Code: ${val}`);
        lines.push('HEX: 1D 28 6B 04 00 31 41 32 00 // Set QR Model 2');
        lines.push('HEX: 1D 28 6B 03 00 31 43 06 // Set QR module size 6');
        lines.push(`HEX: 1D 28 6B ... // Store data and print QR`);
        break;
      }

      case 'shape': {
        if (el.shapeType === 'hline') {
          lines.push('TEXT: "------------------------------------------"');
        }
        break;
      }

      case 'badge': {
        const label = el.badgeLabel || el.badgeType || 'BADGE';
        lines.push(`TEXT: "[ ${label} ]"`);
        break;
      }
    }
  }

  // Feed to tear-off position
  lines.push('HEX: 1B 64 04 // [ESC d 4] Feed 4 lines to tear-off edge');
  return lines.join('\n');
}
