import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { BarcodeFormat } from '../types/label';

interface BarcodeRendererProps {
  value: string;
  format?: BarcodeFormat;
  width?: number; // bar width multiplier
  height?: number; // barcode height in dots/px
  displayValue?: boolean;
  className?: string;
}

export const BarcodeRenderer: React.FC<BarcodeRendererProps> = ({
  value,
  format = 'CODE128',
  width = 2,
  height = 70,
  displayValue = true,
  className = ''
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    try {
      let jsBarcodeFormat: string = 'CODE128';
      if (format === 'EAN13') jsBarcodeFormat = 'EAN13';
      else if (format === 'CODE39') jsBarcodeFormat = 'CODE39';
      else if (format === 'ITF14') jsBarcodeFormat = 'ITF14';
      else if (format === 'UPC') jsBarcodeFormat = 'UPC';

      JsBarcode(svgRef.current, value || '12345678', {
        format: jsBarcodeFormat,
        width: Math.max(1, Math.min(4, width)),
        height: Math.max(30, Math.min(200, height)),
        displayValue: displayValue,
        font: 'JetBrains Mono, monospace',
        fontSize: 13,
        textMargin: 3,
        margin: 4,
        background: '#ffffff',
        lineColor: '#000000',
        flat: true
      });
    } catch {
      // Fallback for invalid characters or checksum mismatch
      try {
        JsBarcode(svgRef.current, value || '12345678', {
          format: 'CODE128',
          width: 2,
          height: height,
          displayValue: true,
          margin: 4
        });
      } catch {
        // quiet fail
      }
    }
  }, [value, format, width, height, displayValue]);

  return <svg ref={svgRef} className={`w-full h-full object-contain ${className}`} />;
};
