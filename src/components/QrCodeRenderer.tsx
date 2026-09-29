import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QrCodeRendererProps {
  value: string;
  ecl?: 'L' | 'M' | 'Q' | 'H';
  size?: number;
  className?: string;
}

export const QrCodeRenderer: React.FC<QrCodeRendererProps> = ({
  value,
  ecl = 'M',
  size = 120,
  className = ''
}) => {
  const [svgString, setSvgString] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    QRCode.toString(
      value || 'https://example.com',
      {
        type: 'svg',
        errorCorrectionLevel: ecl,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        width: size
      },
      (err, string) => {
        if (!err && isMounted && string) {
          setSvgString(string);
        }
      }
    );
    return () => {
      isMounted = false;
    };
  }, [value, ecl, size]);

  if (!svgString) {
    return <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-[10px] font-mono">QR...</div>;
  }

  return (
    <div
      className={`w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full ${className}`}
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  );
};
