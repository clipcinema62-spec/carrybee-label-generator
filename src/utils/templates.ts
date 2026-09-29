import { LabelTemplate } from '../types/label';

export const LABEL_TEMPLATES: LabelTemplate[] = [
  {
    id: 'hub-carton-landscape',
    name: 'Carrybee Hub Carton Return (Exact User Photo - 4x3")',
    category: 'Logistics & Courier',
    description: 'Exact match from your photo: Hub destination with underline, equipment & serials, employee CL-ID, solid separator line, and "Please keep all cartons for future return".',
    elements: [
      {
        id: 'hcl-hub-title',
        type: 'text',
        content: 'Demra',
        x: 40,
        y: 20,
        width: 732,
        height: 52,
        fontSize: 34,
        fontWeight: 'black',
        fontFamily: 'sans',
        textAlign: 'center',
        textDecoration: 'underline'
      },
      {
        id: 'hcl-items',
        type: 'text',
        content: 'Mouse (118, 119, 120)\nNumeric Keypad (112, 113, 114)',
        x: 40,
        y: 84,
        width: 732,
        height: 60,
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'sans',
        textAlign: 'center'
      },
      {
        id: 'hcl-staff',
        type: 'text',
        content: 'Md. Maksudur Rahman Tamim, CL-84695\nJoyanto Karmokar, CL-84714\nMd. Abidur Rahman Abid, CL-84896',
        x: 40,
        y: 154,
        width: 732,
        height: 76,
        fontSize: 15,
        fontWeight: 'bold',
        fontFamily: 'sans',
        textAlign: 'center'
      },
      {
        id: 'hcl-divider',
        type: 'shape',
        shapeType: 'hline',
        x: 20,
        y: 242,
        width: 772,
        height: 3,
        strokeWidth: 3
      },
      {
        id: 'hcl-notice',
        type: 'text',
        content: 'Please keep all cartons\nfor future return',
        x: 20,
        y: 260,
        width: 772,
        height: 120,
        fontSize: 38,
        fontWeight: 'black',
        fontFamily: 'sans',
        fontStyle: 'italic',
        textAlign: 'center'
      }
    ]
  },
  {
    id: 'hub-carton-portrait',
    name: 'Carrybee Hub Carton Return (3x4" Portrait)',
    category: 'Logistics & Courier',
    description: '3x4 inch vertical orientation of the Hub carton equipment return label.',
    elements: [
      {
        id: 'hcp-hub-title',
        type: 'text',
        content: 'Rangamati-Sadar',
        x: 20,
        y: 30,
        width: 568,
        height: 52,
        fontSize: 32,
        fontWeight: 'black',
        fontFamily: 'sans',
        textAlign: 'center',
        textDecoration: 'underline'
      },
      {
        id: 'hcp-items',
        type: 'text',
        content: 'Laptop (475) + Charger',
        x: 20,
        y: 96,
        width: 568,
        height: 48,
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'sans',
        textAlign: 'center'
      },
      {
        id: 'hcp-staff',
        type: 'text',
        content: 'Jana Prio Chakma, CL-84977',
        x: 20,
        y: 154,
        width: 568,
        height: 40,
        fontSize: 17,
        fontWeight: 'bold',
        fontFamily: 'sans',
        textAlign: 'center'
      },
      {
        id: 'hcp-divider',
        type: 'shape',
        shapeType: 'hline',
        x: 16,
        y: 210,
        width: 576,
        height: 3,
        strokeWidth: 3
      },
      {
        id: 'hcp-notice',
        type: 'text',
        content: 'Please keep all cartons\nfor future return',
        x: 16,
        y: 230,
        width: 576,
        height: 140,
        fontSize: 34,
        fontWeight: 'black',
        fontFamily: 'sans',
        fontStyle: 'italic',
        textAlign: 'center'
      },
      {
        id: 'hcp-barcode',
        type: 'barcode',
        barcodeFormat: 'CODE128',
        barcodeValue: 'CL-84977-RANGAMATI',
        showBarcodeText: true,
        barWidth: 2,
        barHeight: 65,
        x: 30,
        y: 400,
        width: 548,
        height: 95
      }
    ]
  },
  {
    id: 'carrybee-express',
    name: 'Carrybee Express Delivery (3x4" Courier COD)',
    category: 'Logistics & Courier',
    description: 'Optimized for parcel delivery with merchant info, recipient address, high-contrast COD box, Code 128 barcode, and route QR code.',
    elements: [
      // Top Brand Header Block
      {
        id: 'cb-header-box',
        type: 'shape',
        shapeType: 'fillBox',
        x: 20,
        y: 20,
        width: 568,
        height: 64,
        isFilled: true
      },
      {
        id: 'cb-brand-title',
        type: 'text',
        content: 'CARRYBEE LOGISTICS',
        x: 36,
        y: 38,
        width: 320,
        height: 36,
        fontSize: 22,
        fontWeight: 'black',
        fontFamily: 'sans',
        isInverted: true
      },
      {
        id: 'cb-service-badge',
        type: 'text',
        content: 'EXPRESS 24H',
        x: 430,
        y: 42,
        width: 140,
        height: 28,
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: 'mono',
        isInverted: true,
        textAlign: 'right'
      },

      // Routing Hub Subheader
      {
        id: 'cb-hub-route',
        type: 'text',
        content: 'HUB: DAC-NORTH-04  |  SORT: UTTARA-ZONE-B',
        x: 24,
        y: 96,
        width: 560,
        height: 24,
        fontSize: 13,
        fontWeight: 'bold',
        fontFamily: 'mono'
      },
      {
        id: 'cb-div-1',
        type: 'shape',
        shapeType: 'hline',
        x: 20,
        y: 126,
        width: 568,
        height: 2,
        strokeWidth: 2
      },

      // Sender Section
      {
        id: 'cb-sender-lbl',
        type: 'text',
        content: 'FROM: Carrybee Merchant Hub  (01700-123456)',
        x: 24,
        y: 136,
        width: 550,
        height: 20,
        fontSize: 11,
        fontWeight: 'medium',
        fontFamily: 'sans'
      },
      {
        id: 'cb-sender-addr',
        type: 'text',
        content: 'Mirpur DOHS, Road 09, House 142, Dhaka',
        x: 24,
        y: 158,
        width: 550,
        height: 18,
        fontSize: 10,
        fontFamily: 'sans'
      },
      {
        id: 'cb-div-2',
        type: 'shape',
        shapeType: 'hline',
        x: 20,
        y: 182,
        width: 568,
        height: 2,
        strokeWidth: 2
      },

      // Recipient Section (Large & Prominent)
      {
        id: 'cb-recipient-header',
        type: 'text',
        content: 'DELIVER TO:',
        x: 24,
        y: 194,
        width: 150,
        height: 20,
        fontSize: 12,
        fontWeight: 'black',
        fontFamily: 'mono'
      },
      {
        id: 'cb-recipient-name',
        type: 'text',
        content: 'Tanzir Rahman',
        x: 24,
        y: 218,
        width: 380,
        height: 28,
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'sans'
      },
      {
        id: 'cb-recipient-phone',
        type: 'text',
        content: 'TEL: 01819-987654  /  01711-223344',
        x: 24,
        y: 248,
        width: 400,
        height: 22,
        fontSize: 13,
        fontWeight: 'bold',
        fontFamily: 'mono'
      },
      {
        id: 'cb-recipient-addr',
        type: 'text',
        content: 'House 24, Road 14, Sector 11, Uttara Model Town, Dhaka-1230',
        x: 24,
        y: 274,
        width: 420,
        height: 38,
        fontSize: 12,
        fontWeight: 'medium',
        fontFamily: 'sans'
      },

      // QR Code for routing
      {
        id: 'cb-qrcode',
        type: 'qrcode',
        qrValue: 'https://track.carrybee.com/CB-2026-98421-BD',
        qrEcl: 'M',
        x: 460,
        y: 196,
        width: 116,
        height: 116
      },

      // High-Contrast COD Cash on Delivery Block
      {
        id: 'cb-cod-bg',
        type: 'shape',
        shapeType: 'fillBox',
        x: 20,
        y: 322,
        width: 568,
        height: 60,
        isFilled: true
      },
      {
        id: 'cb-cod-label',
        type: 'text',
        content: 'CASH ON DELIVERY (COD):',
        x: 36,
        y: 342,
        width: 250,
        height: 24,
        fontSize: 13,
        fontWeight: 'bold',
        fontFamily: 'mono',
        isInverted: true
      },
      {
        id: 'cb-cod-amount',
        type: 'text',
        content: 'BDT ৳ 1,650.00',
        x: 320,
        y: 338,
        width: 250,
        height: 34,
        fontSize: 22,
        fontWeight: 'black',
        fontFamily: 'mono',
        isInverted: true,
        textAlign: 'right'
      },

      // Tracking Barcode Section
      {
        id: 'cb-barcode-header',
        type: 'text',
        content: 'TRACKING NUMBER / WAYBILL',
        x: 24,
        y: 396,
        width: 300,
        height: 18,
        fontSize: 11,
        fontWeight: 'bold',
        fontFamily: 'mono'
      },
      {
        id: 'cb-barcode-main',
        type: 'barcode',
        barcodeFormat: 'CODE128',
        barcodeValue: 'CB-2026-98421-BD',
        showBarcodeText: true,
        barWidth: 2,
        barHeight: 80,
        x: 30,
        y: 420,
        width: 548,
        height: 104
      },

      {
        id: 'cb-div-3',
        type: 'shape',
        shapeType: 'hline',
        x: 20,
        y: 538,
        width: 568,
        height: 2,
        strokeWidth: 2
      },

      // Package Specs & Badges
      {
        id: 'cb-badge-fragile',
        type: 'badge',
        badgeType: 'FRAGILE',
        badgeLabel: 'FRAGILE',
        x: 24,
        y: 554,
        width: 140,
        height: 44
      },
      {
        id: 'cb-badge-up',
        type: 'badge',
        badgeType: 'THIS_WAY_UP',
        badgeLabel: 'THIS WAY UP',
        x: 180,
        y: 554,
        width: 160,
        height: 44
      },
      {
        id: 'cb-pkg-weight',
        type: 'text',
        content: 'WEIGHT: 1.25 KG  |  PIECES: 1/1',
        x: 360,
        y: 568,
        width: 220,
        height: 22,
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: 'mono',
        textAlign: 'right'
      },

      // Footer Instructions
      {
        id: 'cb-footer-note',
        type: 'text',
        content: 'Standard Delivery Terms Apply. Customer OTP Verification Required for COD Handover.',
        x: 24,
        y: 618,
        width: 560,
        height: 18,
        fontSize: 9,
        fontFamily: 'sans'
      }
    ]
  },
  {
    id: 'warehouse-bin-pallet',
    name: 'Warehouse Bin & Inventory Pallet (3x4")',
    category: 'Warehouse & Inventory',
    description: 'High-visibility warehouse rack tag with giant bin locator, SKU, lot tracking, and 2D matrix for long-distance scanner guns.',
    elements: [
      // Giant Inverted Bin Banner
      {
        id: 'wh-bin-box',
        type: 'shape',
        shapeType: 'fillBox',
        x: 20,
        y: 20,
        width: 568,
        height: 100,
        isFilled: true
      },
      {
        id: 'wh-bin-lbl',
        type: 'text',
        content: 'LOCATION BIN',
        x: 36,
        y: 36,
        width: 200,
        height: 20,
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: 'mono',
        isInverted: true
      },
      {
        id: 'wh-bin-code',
        type: 'text',
        content: 'A-04-12-C',
        x: 36,
        y: 62,
        width: 530,
        height: 50,
        fontSize: 42,
        fontWeight: 'black',
        fontFamily: 'mono',
        isInverted: true
      },

      // SKU and Description
      {
        id: 'wh-sku-header',
        type: 'text',
        content: 'ITEM SKU:',
        x: 24,
        y: 136,
        width: 150,
        height: 18,
        fontSize: 11,
        fontWeight: 'bold',
        fontFamily: 'mono'
      },
      {
        id: 'wh-sku-val',
        type: 'text',
        content: 'CRB-EL-9042-PRO',
        x: 24,
        y: 158,
        width: 380,
        height: 32,
        fontSize: 22,
        fontWeight: 'black',
        fontFamily: 'mono'
      },
      {
        id: 'wh-item-desc',
        type: 'text',
        content: 'Thermal Label Roll 3x4" Direct Thermal (500 pcs/roll)',
        x: 24,
        y: 196,
        width: 380,
        height: 36,
        fontSize: 13,
        fontWeight: 'medium',
        fontFamily: 'sans'
      },

      // QR Code
      {
        id: 'wh-qr',
        type: 'qrcode',
        qrValue: 'SKU:CRB-EL-9042-PRO|LOT:202609A|LOC:A-04-12-C',
        qrEcl: 'Q',
        x: 430,
        y: 136,
        width: 150,
        height: 150
      },

      {
        id: 'wh-div-1',
        type: 'shape',
        shapeType: 'hline',
        x: 20,
        y: 300,
        width: 568,
        height: 2,
        strokeWidth: 2
      },

      // Lot / Batch / Date Table
      {
        id: 'wh-batch-txt',
        type: 'text',
        content: 'BATCH / LOT: 2026-SEP-09-A',
        x: 24,
        y: 316,
        width: 270,
        height: 22,
        fontSize: 13,
        fontWeight: 'bold',
        fontFamily: 'mono'
      },
      {
        id: 'wh-qty-txt',
        type: 'text',
        content: 'STD PACK: 24 ROLLS / BOX',
        x: 320,
        y: 316,
        width: 260,
        height: 22,
        fontSize: 13,
        fontWeight: 'bold',
        fontFamily: 'mono',
        textAlign: 'right'
      },

      // Primary Inventory Barcode
      {
        id: 'wh-barcode',
        type: 'barcode',
        barcodeFormat: 'CODE128',
        barcodeValue: 'CRBEL9042PRO202609A',
        showBarcodeText: true,
        barWidth: 2,
        barHeight: 90,
        x: 30,
        y: 350,
        width: 548,
        height: 120
      },

      {
        id: 'wh-div-2',
        type: 'shape',
        shapeType: 'hline',
        x: 20,
        y: 486,
        width: 568,
        height: 2,
        strokeWidth: 2
      },

      // Minimum / Maximum Stock Levels
      {
        id: 'wh-stock-box-1',
        type: 'shape',
        shapeType: 'rect',
        x: 24,
        y: 504,
        width: 170,
        height: 60,
        strokeWidth: 2
      },
      {
        id: 'wh-min-lbl',
        type: 'text',
        content: 'MIN LEVEL: 50',
        x: 36,
        y: 524,
        width: 150,
        height: 20,
        fontSize: 13,
        fontWeight: 'bold',
        fontFamily: 'mono'
      },

      {
        id: 'wh-stock-box-2',
        type: 'shape',
        shapeType: 'rect',
        x: 218,
        y: 504,
        width: 170,
        height: 60,
        strokeWidth: 2
      },
      {
        id: 'wh-max-lbl',
        type: 'text',
        content: 'MAX LEVEL: 500',
        x: 230,
        y: 524,
        width: 150,
        height: 20,
        fontSize: 13,
        fontWeight: 'bold',
        fontFamily: 'mono'
      },

      {
        id: 'wh-stock-box-3',
        type: 'shape',
        shapeType: 'rect',
        x: 412,
        y: 504,
        width: 170,
        height: 60,
        strokeWidth: 2
      },
      {
        id: 'wh-reorder-lbl',
        type: 'text',
        content: 'STATUS: ACTIVE',
        x: 424,
        y: 524,
        width: 150,
        height: 20,
        fontSize: 13,
        fontWeight: 'bold',
        fontFamily: 'mono'
      }
    ]
  },
  {
    id: 'retail-product-tag',
    name: 'Retail Barcode & Price Tag (3x4")',
    category: 'Retail & Product',
    description: 'Crisp EAN-13 retail label with price callout, product specs, size, material composition, and return policy.',
    elements: [
      {
        id: 'rt-brand',
        type: 'text',
        content: 'URBAN APPAREL CO.',
        x: 24,
        y: 28,
        width: 560,
        height: 28,
        fontSize: 18,
        fontWeight: 'black',
        fontFamily: 'sans',
        textAlign: 'center'
      },
      {
        id: 'rt-div-1',
        type: 'shape',
        shapeType: 'hline',
        x: 40,
        y: 64,
        width: 528,
        height: 2,
        strokeWidth: 2
      },
      {
        id: 'rt-title',
        type: 'text',
        content: 'Premium Organic Cotton Hoodie',
        x: 24,
        y: 84,
        width: 560,
        height: 26,
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'sans',
        textAlign: 'center'
      },
      {
        id: 'rt-sku-color',
        type: 'text',
        content: 'COLOR: HEATHER GREY  |  SIZE: L (LARGE)',
        x: 24,
        y: 118,
        width: 560,
        height: 20,
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: 'mono',
        textAlign: 'center'
      },

      // Large Price Box
      {
        id: 'rt-price-box',
        type: 'shape',
        shapeType: 'fillBox',
        x: 120,
        y: 154,
        width: 368,
        height: 70,
        isFilled: true
      },
      {
        id: 'rt-price-val',
        type: 'text',
        content: '$49.99',
        x: 120,
        y: 172,
        width: 368,
        height: 40,
        fontSize: 34,
        fontWeight: 'black',
        fontFamily: 'mono',
        isInverted: true,
        textAlign: 'center'
      },

      // Retail EAN-13 Barcode
      {
        id: 'rt-barcode',
        type: 'barcode',
        barcodeFormat: 'EAN13',
        barcodeValue: '890123456789',
        showBarcodeText: true,
        barWidth: 2,
        barHeight: 80,
        x: 60,
        y: 250,
        width: 488,
        height: 110
      },

      {
        id: 'rt-div-2',
        type: 'shape',
        shapeType: 'hline',
        x: 40,
        y: 380,
        width: 528,
        height: 2,
        strokeWidth: 1
      },

      {
        id: 'rt-materials',
        type: 'text',
        content: '100% GOTS Certified Cotton. Pre-shrunk fabric.',
        x: 24,
        y: 400,
        width: 560,
        height: 18,
        fontSize: 11,
        fontFamily: 'sans',
        textAlign: 'center'
      },
      {
        id: 'rt-care',
        type: 'text',
        content: 'Machine wash cold with like colors. Tumble dry low.',
        x: 24,
        y: 424,
        width: 560,
        height: 18,
        fontSize: 10,
        fontFamily: 'sans',
        textAlign: 'center'
      }
    ]
  },
  {
    id: 'thermal-calibration-test',
    name: 'Thermal Head 3x4" Calibration & Diagnostics',
    category: 'Test & Calibration',
    description: 'Precision test print for Gprinter, Xprinter, Sunmi, Dotmax, POSLogic & Zebra to test boundary margins, dead dots, and barcode scan speeds.',
    elements: [
      // Outer 3x4 border boundary check
      {
        id: 'cal-border',
        type: 'shape',
        shapeType: 'rect',
        x: 8,
        y: 8,
        width: 592,
        height: 796,
        strokeWidth: 2
      },
      {
        id: 'cal-inner-border',
        type: 'shape',
        shapeType: 'rect',
        x: 18,
        y: 18,
        width: 572,
        height: 776,
        strokeWidth: 1
      },

      {
        id: 'cal-title',
        type: 'text',
        content: '3x4" THERMAL HEAD CALIBRATION TEST',
        x: 30,
        y: 32,
        width: 548,
        height: 24,
        fontSize: 14,
        fontWeight: 'black',
        fontFamily: 'mono',
        textAlign: 'center'
      },
      {
        id: 'cal-specs',
        type: 'text',
        content: '76.2mm x 101.6mm  |  203 DPI (608x812 dots) / 300 DPI (900x1200 dots)',
        x: 30,
        y: 58,
        width: 548,
        height: 18,
        fontSize: 10,
        fontFamily: 'mono',
        textAlign: 'center'
      },

      // Dead dot pin test (continuous 1px and 2px parallel lines)
      {
        id: 'cal-line-1',
        type: 'shape',
        shapeType: 'hline',
        x: 30,
        y: 88,
        width: 548,
        height: 1,
        strokeWidth: 1
      },
      {
        id: 'cal-line-2',
        type: 'shape',
        shapeType: 'hline',
        x: 30,
        y: 96,
        width: 548,
        height: 2,
        strokeWidth: 2
      },
      {
        id: 'cal-line-3',
        type: 'shape',
        shapeType: 'hline',
        x: 30,
        y: 106,
        width: 548,
        height: 4,
        strokeWidth: 4
      },

      // Contrast ladder
      {
        id: 'cal-barcode-test',
        type: 'barcode',
        barcodeFormat: 'CODE128',
        barcodeValue: 'TEST-3X4-OK',
        showBarcodeText: true,
        barWidth: 2,
        barHeight: 70,
        x: 60,
        y: 130,
        width: 488,
        height: 95
      },

      // QR alignment test
      {
        id: 'cal-qr',
        type: 'qrcode',
        qrValue: 'THERMAL_CALIBRATION_OK_3X4_INCHES_203DPI',
        qrEcl: 'H',
        x: 234,
        y: 240,
        width: 140,
        height: 140
      },

      {
        id: 'cal-diag-text',
        type: 'text',
        content: 'COMPATIBILITY: Gprinter, Xprinter, Sunmi, Dotmax, POSLogic, Zebra',
        x: 30,
        y: 400,
        width: 548,
        height: 20,
        fontSize: 11,
        fontWeight: 'bold',
        fontFamily: 'mono',
        textAlign: 'center'
      }
    ]
  }
];
