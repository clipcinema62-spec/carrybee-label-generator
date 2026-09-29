import { PrinterProfile } from '../types/label';

export const PRINTER_PROFILES: PrinterProfile[] = [
  {
    id: 'laptop_default',
    name: 'ল্যাপটপে ইনস্টল করা প্রিন্টার (System Default Printer)',
    manufacturer: 'Windows / macOS / Linux Print Spooler (Auto-Detect)',
    popularModels: [
      'ল্যাপটপের ডিফল্ট প্রিন্টার (Windows Default)',
      'Xprinter Driver (XP-365B / XP-420B)',
      'Gprinter Driver (GP-1324D)',
      'Zebra Designer / ZD Series',
      'POS-80 / POS-58 Thermal Driver',
      'যেকোনো ইনস্টল করা থার্মাল প্রিন্টার'
    ],
    protocol: 'BROWSER',
    connectionTypes: ['BrowserDriver', 'USB'],
    defaultDpi: 203,
    dpiModes: [203, 300],
    calibrationGuide: 'আপনার ল্যাপটপের যে প্রিন্টারটি উইন্ডোজে (বা ম্যাক-এ) ইনস্টল করা আছে, সিস্টেম স্বয়ংক্রিয়ভাবে সেটি শনাক্ত করে ৩×৪ বা ৪×৩ ইঞ্চি মাপে সরাসরি প্রিন্ট দেবে। কোনো আলাদা সফটওয়্যার ছাড়াই এটি কাজ করবে।',
    hardwareNotes: 'Direct Windows/Mac driver integration via system print spooler with exact 3"x4" / 4"x3" roll dimensions and zero margins.',
    dipSwitchAdvice: 'Windows Print Dialog এ পেপার সাইজ ৩×৪ ইঞ্চি (বা 76mm × 102mm) এবং Margins: None সেট থাকলেই নিখুঁত প্রিন্ট পাবেন।'
  },
  {
    id: 'gprinter',
    name: 'Gprinter',
    manufacturer: 'Zhuhai Gprinter Information Co.',
    popularModels: ['GP-1324D', 'GP-1324T', 'GP-2120TF', 'GP-3120TU', 'GP-1124T'],
    protocol: 'TSPL',
    connectionTypes: ['USB', 'Serial', 'Network', 'BrowserDriver'],
    defaultDpi: 203,
    dpiModes: [203, 300],
    calibrationGuide: 'Turn off the printer. Press and hold the PAUSE/FEED button, then turn on the power switch. When the indicator flashes purple/red twice, release the button. The printer will feed 2-3 labels to calibrate the transmissive gap sensor automatically.',
    hardwareNotes: 'Direct thermal & thermal transfer supported. Fully native TSPL/TSPL2 command set. Accepts standard 3x4 inch rolls (76.2mm x 101.6mm) with 1-inch or 1.5-inch inner cores.',
    dipSwitchAdvice: 'Ensure DIP Switch #1 is set for Gap Sensor (Transmissive) rather than Black Mark (Reflective) when using die-cut 3x4 labels.'
  },
  {
    id: 'xprinter',
    name: 'Xprinter',
    manufacturer: 'Zhuhai Xprinter Electronic Co.',
    popularModels: ['XP-420B', 'XP-460B', 'XP-470B', 'XP-365B', 'XP-DT108A', 'XP-TT424B'],
    protocol: 'TSPL',
    connectionTypes: ['USB', 'Bluetooth', 'Network', 'BrowserDriver'],
    defaultDpi: 203,
    dpiModes: [203, 300],
    calibrationGuide: 'With the printer powered on and labels loaded, press and hold the FEED button until the blue LED flashes red 2 times, then immediately release. The printer will auto-detect the 3x4 inch label gap.',
    hardwareNotes: 'The XP-420B is one of the world\'s most popular 4-inch desktop thermal shipping label printers. Fits rolls up to 108mm width (perfect for 3x4" / 76x102mm). Ultra-fast 152mm/s print speed.',
    dipSwitchAdvice: 'Set label mode to "Label with Gaps" in Diagnostic Tool or DIP switch 2 OFF.'
  },
  {
    id: 'sunmi',
    name: 'Sunmi',
    manufacturer: 'Shanghai Sunmi Technology Co.',
    popularModels: ['V2s Plus Label', 'V2 Pro', 'T2s Label', 'K2', 'Cloud Thermal Printer 80mm'],
    protocol: 'ESC_POS',
    connectionTypes: ['Bluetooth', 'USB', 'Network', 'BrowserDriver'],
    defaultDpi: 203,
    dpiModes: [203],
    calibrationGuide: 'On Sunmi POS screen, go to Settings -> Thermal Printer -> Media Type -> Select "Label Paper" (Black Mark / Die Cut Gap). Run "Label Feed Calibration". Ensure black mark / gap detector is aligned with roll backing.',
    hardwareNotes: 'Supports raster ESC/POS mode and Sunmi InnerPrinter label mode. Compatible with 76mm-80mm width thermal label rolls (3 inch wide). Excellent for mobile logistics handhelds.',
    dipSwitchAdvice: 'Set print density to High (Level 3 or 4) on handheld Sunmi terminals for crisp 1D barcodes.'
  },
  {
    id: 'dotmax',
    name: 'Dotmax',
    manufacturer: 'Dotmax Thermal Systems',
    popularModels: ['DM-420D', 'DM-400T', 'DM-200B', 'DM-LP80'],
    protocol: 'TSPL',
    connectionTypes: ['USB', 'Serial', 'Network', 'BrowserDriver'],
    defaultDpi: 203,
    dpiModes: [203],
    calibrationGuide: 'Press FEED button while powering on until the buzzer beeps three times. The printer calibrates paper length and sensor threshold for 3x4" media.',
    hardwareNotes: 'Industrial POS and logistics desktop thermal printer. Emulates TSPL-EZ and ESC/POS protocols with 5 inches/sec print speed.',
    dipSwitchAdvice: 'Verify media sensor position is centered over the 3-inch backing liner.'
  },
  {
    id: 'poslogic',
    name: 'POSLogic',
    manufacturer: 'POSLogic Solutions',
    popularModels: ['PL-420BT', 'PL-80U', 'PL-3200', 'PL-400'],
    protocol: 'ZPL',
    connectionTypes: ['USB', 'Bluetooth', 'Serial', 'BrowserDriver'],
    defaultDpi: 203,
    dpiModes: [203, 300],
    calibrationGuide: 'Power on while holding FEED button. Wait for 2 beeps to enter Sensor Auto-tuning mode. Printer will feed 2 labels to map die-cut gap.',
    hardwareNotes: 'Dual emulation mode: supports both ZPL (Zebra) and TSPL. High thermal head endurance (up to 50km printed length).',
    dipSwitchAdvice: 'Emulation switch: DIP 1 ON for ZPL mode, OFF for TSPL mode.'
  },
  {
    id: 'zebra',
    name: 'Zebra',
    manufacturer: 'Zebra Technologies Corp.',
    popularModels: ['ZD421d', 'ZD420', 'ZD220', 'GK420d', 'GX420t', 'ZT230', 'ZT411'],
    protocol: 'ZPL',
    connectionTypes: ['USB', 'Network', 'Bluetooth', 'BrowserDriver'],
    defaultDpi: 203,
    dpiModes: [203, 300],
    calibrationGuide: 'Press and hold FEED until the green status light blinks 2 times (Standard Media Calibration), then release. The printer feeds several 3x4 labels and measures backing translucency.',
    hardwareNotes: 'Global standard for shipping, logistics, and enterprise barcoding. Native ZPL II (Zebra Programming Language) yields instantaneous zero-lag prints with flawless barcode scannability.',
    dipSwitchAdvice: 'In Zebra Setup Utilities: Set Media Type to "Web/Mark Sensing" and Print Mode to "Tear-off".'
  }
];
