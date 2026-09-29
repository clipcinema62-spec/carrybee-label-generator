import { jsPDF } from 'jspdf';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  AlignmentType, 
  UnderlineType, 
  BorderStyle,
  ImageRun
} from 'docx';
import { saveAs } from 'file-saver';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { HubCardItem } from '../components/HubCartonModal';
import { LabelConfig, LabelElement } from '../types/label';

/**
 * Split text into wrapped lines given a max width and canvas context
 */
function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const lines: string[] = [];
  const rawParagraphs = (text || '').split('\n');

  for (const para of rawParagraphs) {
    if (!para.trim()) {
      lines.push('');
      continue;
    }
    const words = para.trim().split(/\s+/);
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = ctx.measureText(testLine).width;
      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
  }

  return lines;
}

/**
 * Render a single Hub Card to an offscreen high-resolution (300 DPI) canvas
 */
export function renderCardToCanvas(card: HubCardItem, isLandscape: boolean): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  // 300 DPI dimensions: 4x3 in = 1200x900, 3x4 in = 900x1200
  const width = isLandscape ? 1200 : 900;
  const height = isLandscape ? 900 : 1200;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d')!;
  if (!ctx) return canvas;

  // 1. Crisp white background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  const centerX = width / 2;
  const marginX = isLandscape ? 60 : 50;
  const maxContentWidth = width - marginX * 2;

  // 2. Hub / Destination Name (Bold, Underlined)
  const hubText = card.hub || 'Untitled Hub';
  const hubFontSize = isLandscape ? 48 : 44;
  ctx.font = `bold ${hubFontSize}px "Plus Jakarta Sans", "Segoe UI", Arial, sans-serif`;
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  const hubY = isLandscape ? 45 : 55;
  ctx.fillText(hubText, centerX, hubY);

  // Underline
  const hubMetrics = ctx.measureText(hubText);
  const underlineY = hubY + hubFontSize + 8;
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#000000';
  ctx.beginPath();
  ctx.moveTo(centerX - hubMetrics.width / 2, underlineY);
  ctx.lineTo(centerX + hubMetrics.width / 2, underlineY);
  ctx.stroke();

  // 3. Equipment / Items list
  const itemFontSize = isLandscape ? 28 : 26;
  ctx.font = `bold ${itemFontSize}px "Plus Jakarta Sans", "Segoe UI", Arial, sans-serif`;
  const itemLineHeight = itemFontSize + 12;
  const itemLines = wrapCanvasText(ctx, card.items || '', maxContentWidth);

  let currentY = underlineY + 35;
  for (const line of itemLines) {
    ctx.fillText(line, centerX, currentY);
    currentY += itemLineHeight;
  }

  // 4. Staff Name & CL-ID
  const staffFontSize = isLandscape ? 24 : 22;
  ctx.font = `bold ${staffFontSize}px "Plus Jakarta Sans", "Segoe UI", Arial, sans-serif`;
  const staffLineHeight = staffFontSize + 10;
  const staffLines = wrapCanvasText(ctx, card.staff || '', maxContentWidth);

  currentY += 15;
  for (const line of staffLines) {
    ctx.fillText(line, centerX, currentY);
    currentY += staffLineHeight;
  }

  // Optional Barcode if tracking number provided
  if (card.showBarcode && card.tracking) {
    try {
      const barcodeCanvas = document.createElement('canvas');
      JsBarcode(barcodeCanvas, card.tracking, {
        format: 'CODE128',
        width: 2,
        height: isLandscape ? 45 : 50,
        displayValue: true,
        fontSize: 14,
        margin: 0
      });
      const bcX = centerX - barcodeCanvas.width / 2;
      ctx.drawImage(barcodeCanvas, bcX, currentY + 10);
      currentY += barcodeCanvas.height + 25;
    } catch {
      // fallback if invalid barcode format
    }
  }

  // 5. Solid Divider Line
  const dividerY = isLandscape ? 580 : 740;
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#000000';
  ctx.beginPath();
  ctx.moveTo(marginX, dividerY);
  ctx.lineTo(width - marginX, dividerY);
  ctx.stroke();

  // 6. Notice ("Please keep all cartons for future return")
  const noticeFontSize = isLandscape ? 44 : 38;
  ctx.font = `italic bold ${noticeFontSize}px "Plus Jakarta Sans", "Segoe UI", Arial, sans-serif`;
  const noticeLineHeight = noticeFontSize + 14;
  const noticeText = card.notice || 'Please keep all cartons\nfor future return';
  const noticeLines = wrapCanvasText(ctx, noticeText, maxContentWidth);

  let noticeY = dividerY + 45;
  for (const line of noticeLines) {
    ctx.fillText(line, centerX, noticeY);
    noticeY += noticeLineHeight;
  }

  return canvas;
}

/**
 * Render arbitrary LabelElement[] to high-resolution canvas
 */
export async function renderElementsToCanvas(
  elements: LabelElement[],
  config: LabelConfig
): Promise<HTMLCanvasElement> {
  const isLandscape = config.orientation === 'landscape' || config.widthInches > config.heightInches;
  const canvas = document.createElement('canvas');
  const targetDpi = 300;
  const width = Math.round((isLandscape ? 4 : 3) * targetDpi);
  const height = Math.round((isLandscape ? 3 : 4) * targetDpi);
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Scale from element coords (dots at config.dpi, e.g. 203) to canvas coords (300 DPI)
  const scale = targetDpi / config.dpi;

  for (const el of elements) {
    const x = Math.round(el.x * scale);
    const y = Math.round(el.y * scale);
    const w = Math.round(el.width * scale);
    const h = Math.round(el.height * scale);

    if (el.type === 'shape') {
      ctx.fillStyle = '#000000';
      ctx.strokeStyle = '#000000';
      const strokeW = Math.max(1, Math.round((el.strokeWidth || 2) * scale));
      ctx.lineWidth = strokeW;

      if (el.shapeType === 'hline') {
        ctx.beginPath();
        ctx.moveTo(x, y + strokeW / 2);
        ctx.lineTo(x + w, y + strokeW / 2);
        ctx.stroke();
      } else if (el.shapeType === 'vline') {
        ctx.beginPath();
        ctx.moveTo(x + strokeW / 2, y);
        ctx.lineTo(x + strokeW / 2, y + h);
        ctx.stroke();
      } else if (el.shapeType === 'rect') {
        if (el.isFilled) {
          ctx.fillRect(x, y, w, h);
        } else {
          ctx.strokeRect(x, y, w, h);
        }
      }
    } else if (el.type === 'text') {
      const fontSizePx = Math.round((el.fontSize || 16) * scale);
      const fontStyle = el.fontStyle === 'italic' ? 'italic' : 'normal';
      const fontWeight = el.fontWeight === 'black' ? '900' : el.fontWeight === 'bold' ? 'bold' : 'normal';
      ctx.font = `${fontStyle} ${fontWeight} ${fontSizePx}px "Plus Jakarta Sans", "Segoe UI", Arial, sans-serif`;

      if (el.isInverted) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#FFFFFF';
      } else {
        ctx.fillStyle = '#000000';
      }

      ctx.textAlign = el.textAlign === 'center' ? 'center' : el.textAlign === 'right' ? 'right' : 'left';
      ctx.textBaseline = 'top';

      const drawX = el.textAlign === 'center' ? x + w / 2 : el.textAlign === 'right' ? x + w : x;
      const lines = wrapCanvasText(ctx, el.content || '', w);
      const lineHeight = fontSizePx + Math.round(6 * scale);

      let lineY = y;
      for (const line of lines) {
        ctx.fillText(line, drawX, lineY);
        if (el.textDecoration === 'underline') {
          const m = ctx.measureText(line);
          const startX = el.textAlign === 'center' ? drawX - m.width / 2 : el.textAlign === 'right' ? drawX - m.width : drawX;
          ctx.lineWidth = Math.max(2, Math.round(2 * scale));
          ctx.strokeStyle = el.isInverted ? '#FFFFFF' : '#000000';
          ctx.beginPath();
          ctx.moveTo(startX, lineY + fontSizePx + 4);
          ctx.lineTo(startX + m.width, lineY + fontSizePx + 4);
          ctx.stroke();
        }
        lineY += lineHeight;
      }
    } else if (el.type === 'barcode' && el.barcodeValue) {
      try {
        const bc = document.createElement('canvas');
        JsBarcode(bc, el.barcodeValue, {
          format: el.barcodeFormat === 'EAN13' ? 'EAN13' : 'CODE128',
          width: Math.max(1, Math.round((el.barWidth || 2) * scale)),
          height: Math.round((el.barHeight || 60) * scale),
          displayValue: el.showBarcodeText ?? true,
          fontSize: Math.round(14 * scale),
          margin: 0
        });
        ctx.drawImage(bc, x, y, Math.min(w, bc.width), Math.min(h, bc.height));
      } catch {
        // ignore format issues
      }
    } else if (el.type === 'qrcode' && el.qrValue) {
      try {
        const qrDataUrl = await QRCode.toDataURL(el.qrValue, {
          errorCorrectionLevel: el.qrEcl || 'M',
          margin: 1,
          width: Math.min(w, h)
        });
        const img = new Image();
        await new Promise((res) => {
          img.onload = res;
          img.src = qrDataUrl;
        });
        ctx.drawImage(img, x, y, Math.min(w, h), Math.min(w, h));
      } catch {
        // ignore
      }
    }
  }

  return canvas;
}

/**
 * Export Hub labels to a precision PDF (3x4" or 4x3" page size)
 */
export async function exportCardsToPdf(
  cards: HubCardItem[],
  config: LabelConfig,
  filename?: string
): Promise<void> {
  const isLandscape = config.orientation === 'landscape' || config.widthInches > config.heightInches;
  const wIn = isLandscape ? 4 : 3;
  const hIn = isLandscape ? 3 : 4;

  const doc = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'in',
    format: [wIn, hIn]
  });

  cards.forEach((card, index) => {
    if (index > 0) {
      doc.addPage([wIn, hIn], isLandscape ? 'landscape' : 'portrait');
    }

    const canvas = renderCardToCanvas(card, isLandscape);
    const imgData = canvas.toDataURL('image/png', 1.0);
    doc.addImage(imgData, 'PNG', 0, 0, wIn, hIn, undefined, 'FAST');
  });

  const finalName = filename || `Carrybee_Hub_Labels_${cards.length}.pdf`;
  doc.save(finalName);
}

/**
 * Export arbitrary Canvas elements to a precision PDF (3x4" or 4x3" page size)
 */
export async function exportCanvasToPdf(
  elements: LabelElement[],
  config: LabelConfig,
  filename?: string
): Promise<void> {
  const isLandscape = config.orientation === 'landscape' || config.widthInches > config.heightInches;
  const wIn = isLandscape ? 4 : 3;
  const hIn = isLandscape ? 3 : 4;

  const doc = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'in',
    format: [wIn, hIn]
  });

  const canvas = await renderElementsToCanvas(elements, config);
  const imgData = canvas.toDataURL('image/png', 1.0);
  doc.addImage(imgData, 'PNG', 0, 0, wIn, hIn, undefined, 'FAST');

  const finalName = filename || `Thermal_Label_3x4_${Date.now()}.pdf`;
  doc.save(finalName);
}

/**
 * Helper to convert canvas to Uint8Array buffer for Word docx ImageRun
 */
function canvasToUint8Array(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve(new Uint8Array(0));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        resolve(new Uint8Array(arrayBuffer));
      };
      reader.readAsArrayBuffer(blob);
    }, 'image/png');
  });
}

/**
 * Export Hub labels to Microsoft Word (.docx) document
 */
export async function exportCardsToWord(
  cards: HubCardItem[],
  config: LabelConfig,
  filename?: string
): Promise<void> {
  const isLandscape = config.orientation === 'landscape' || config.widthInches > config.heightInches;

  // 1 inch = 1440 twips in Word
  const pageW = (isLandscape ? 4 : 3) * 1440;
  const pageH = (isLandscape ? 3 : 4) * 1440;

  const sections = await Promise.all(
    cards.map(async (card) => {
      const itemParas = card.items.split('\n').filter(Boolean).map((line) => {
        return new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 30, after: 30 },
          children: [
            new TextRun({
              text: line.trim(),
              bold: true,
              size: isLandscape ? 24 : 22,
              font: 'Calibri'
            })
          ]
        });
      });

      const staffParas = card.staff.split('\n').filter(Boolean).map((line) => {
        return new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 20, after: 20 },
          children: [
            new TextRun({
              text: line.trim(),
              bold: true,
              size: isLandscape ? 20 : 18,
              font: 'Calibri'
            })
          ]
        });
      });

      const noticeParas = card.notice.split('\n').filter(Boolean).map((line) => {
        return new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 30, after: 30 },
          children: [
            new TextRun({
              text: line.trim(),
              bold: true,
              italics: true,
              size: isLandscape ? 30 : 26,
              font: 'Calibri'
            })
          ]
        });
      });

      // Also render high-res image of the exact label for embedding in docx
      const cardCanvas = renderCardToCanvas(card, isLandscape);
      const imgBytes = await canvasToUint8Array(cardCanvas);

      return {
        properties: {
          page: {
            size: {
              width: pageW,
              height: pageH
            },
            margin: {
              top: 240,    // ~0.16 inch
              bottom: 240,
              left: 240,
              right: 240
            }
          }
        },
        children: [
          // Visual Label Image
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 100 },
            children: [
              new ImageRun({
                data: imgBytes,
                transformation: {
                  width: (isLandscape ? 3.6 : 2.6) * 72,
                  height: (isLandscape ? 2.6 : 3.6) * 72
                },
                type: 'png'
              })
            ]
          }),

          // Editable Hub Name
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 80 },
            children: [
              new TextRun({
                text: card.hub,
                bold: true,
                underline: {
                  type: UnderlineType.SINGLE
                },
                size: isLandscape ? 36 : 32,
                font: 'Calibri'
              })
            ]
          }),

          // Items
          ...itemParas,

          // Staff
          ...staffParas,

          // Horizontal Line Divider
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 80, after: 80 },
            border: {
              bottom: {
                color: '000000',
                space: 1,
                style: BorderStyle.SINGLE,
                size: 16
              }
            }
          }),

          // Return Notice
          ...noticeParas
        ]
      };
    })
  );

  const doc = new Document({
    sections: sections
  });

  const blob = await Packer.toBlob(doc);
  const finalName = filename || `Carrybee_Hub_Labels_${cards.length}.docx`;
  saveAs(blob, finalName);
}

/**
 * Export arbitrary Canvas elements to Microsoft Word (.docx) document
 */
export async function exportCanvasToWord(
  elements: LabelElement[],
  config: LabelConfig,
  filename?: string
): Promise<void> {
  const isLandscape = config.orientation === 'landscape' || config.widthInches > config.heightInches;
  const pageW = (isLandscape ? 4 : 3) * 1440;
  const pageH = (isLandscape ? 3 : 4) * 1440;

  const canvas = await renderElementsToCanvas(elements, config);
  const imgBytes = await canvasToUint8Array(canvas);

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: pageW,
              height: pageH
            },
            margin: {
              top: 200,
              bottom: 200,
              left: 200,
              right: 200
            }
          }
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new ImageRun({
                data: imgBytes,
                transformation: {
                  width: (isLandscape ? 3.7 : 2.7) * 72,
                  height: (isLandscape ? 2.7 : 3.7) * 72
                },
                type: 'png'
              })
            ]
          })
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const finalName = filename || `Thermal_Label_3x4_${Date.now()}.docx`;
  saveAs(blob, finalName);
}
