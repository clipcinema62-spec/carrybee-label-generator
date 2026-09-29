export type ElementType = 'text' | 'barcode' | 'qrcode' | 'shape' | 'badge' | 'image';

export type BarcodeFormat = 'CODE128' | 'EAN13' | 'CODE39' | 'ITF14' | 'UPC';

export type ShapeType = 'hline' | 'vline' | 'rect' | 'fillBox';

export type BadgeType = 
  | 'FRAGILE' 
  | 'THIS_WAY_UP' 
  | 'KEEP_DRY' 
  | 'COD' 
  | 'DO_NOT_BEND' 
  | 'HEAVY' 
  | 'PERISHABLE'
  | 'GLASS';

export interface LabelElement {
  id: string;
  type: ElementType;
  x: number; // in dots (based on 203 DPI: 608 x 812 dots for 3x4 inches)
  y: number;
  width: number;
  height: number;
  rotation?: 0 | 90 | 180 | 270;
  locked?: boolean;

  // Text specific
  content?: string;
  fontSize?: number; // pt or px
  fontWeight?: 'normal' | 'medium' | 'bold' | 'black';
  fontFamily?: 'sans' | 'mono' | 'serif';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  textAlign?: 'left' | 'center' | 'right';
  isInverted?: boolean; // white text on solid black background
  letterSpacing?: number;

  // Barcode specific
  barcodeFormat?: BarcodeFormat;
  barcodeValue?: string;
  showBarcodeText?: boolean;
  barWidth?: number; // 1 to 5 dots
  barHeight?: number; // dots

  // QR Code specific
  qrValue?: string;
  qrEcl?: 'L' | 'M' | 'Q' | 'H';

  // Shape specific
  shapeType?: ShapeType;
  strokeWidth?: number; // dots
  isFilled?: boolean;

  // Badge specific
  badgeType?: BadgeType;
  badgeLabel?: string;

  // Image specific
  imageSrc?: string;
  threshold?: number; // 0-255 for 1-bit thermal dithering
}

export type PrinterBrand = 'laptop_default' | 'gprinter' | 'xprinter' | 'sunmi' | 'dotmax' | 'poslogic' | 'zebra' | 'generic';

export type PrintProtocol = 'TSPL' | 'ZPL' | 'ESC_POS' | 'CPCL' | 'BROWSER';

export interface PrinterProfile {
  id: PrinterBrand;
  name: string;
  manufacturer: string;
  popularModels: string[];
  protocol: PrintProtocol;
  connectionTypes: ('USB' | 'Serial' | 'Bluetooth' | 'Network' | 'BrowserDriver')[];
  defaultDpi: 203 | 300;
  dpiModes: (203 | 300)[];
  calibrationGuide: string;
  hardwareNotes: string;
  dipSwitchAdvice: string;
}

export interface LabelConfig {
  widthInches: number; // Default 3
  heightInches: number; // Default 4
  dpi: 203 | 300; // 203 (8 dots/mm) -> 608x812, 300 (12 dots/mm) -> 900x1200
  orientation: 'portrait' | 'landscape';
  gapMm: number; // Thermal label gap in mm (standard 2mm or 3mm)
  darkness: number; // 1 - 15 (thermal burn temperature)
  speed: number; // 2 - 6 inches per second
}

export interface LabelTemplate {
  id: string;
  name: string;
  category: 'Logistics & Courier' | 'Warehouse & Inventory' | 'Retail & Product' | 'Food & Kitchen' | 'Test & Calibration';
  description: string;
  elements: LabelElement[];
}

export interface BatchItem {
  id: string;
  [key: string]: string;
}
