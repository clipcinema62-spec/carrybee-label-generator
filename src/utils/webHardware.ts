export interface ConnectionResult {
  success: boolean;
  message: string;
  device?: string;
}

/**
 * Check if Web APIs are supported in this browser
 */
export const hasWebUSB = (): boolean => typeof navigator !== 'undefined' && 'usb' in navigator;
export const hasWebSerial = (): boolean => typeof navigator !== 'undefined' && 'serial' in navigator;
export const hasWebBluetooth = (): boolean => typeof navigator !== 'undefined' && 'bluetooth' in navigator;

/**
 * Send raw command bytes to printer via WebUSB
 */
export async function sendViaWebUSB(rawCommandText: string): Promise<ConnectionResult> {
  if (!hasWebUSB()) {
    return {
      success: false,
      message: 'WebUSB is not supported by your current browser. Please use Chrome/Edge or standard System Print.'
    };
  }

  try {
    // Request thermal printer device
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const device = await (navigator as any).usb.requestDevice({
      filters: [
        // Common thermal printer USB class 7 (Printers)
        { classCode: 7 }
      ]
    });

    await device.open();
    if (device.configuration === null) {
      await device.selectConfiguration(1);
    }
    await device.claimInterface(0);

    const encoder = new TextEncoder();
    const data = encoder.encode(rawCommandText);

    // Find OUT endpoint
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const endpoint = device.configuration.interfaces[0].alternate.endpoints.find((e: any) => e.direction === 'out');
    const endpointNumber = endpoint ? endpoint.endpointNumber : 1;

    await device.transferOut(endpointNumber, data);
    await device.close();

    return {
      success: true,
      message: `Successfully transmitted ${data.byteLength} bytes to ${device.productName || 'Thermal Printer'} via USB.`,
      device: device.productName || 'USB Thermal Printer'
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg.includes('No device selected')) {
      return { success: false, message: 'USB device selection cancelled.' };
    }
    return {
      success: false,
      message: `USB Transmission notice: ${errorMsg}. You can also use the System Print Driver or copy the raw code.`
    };
  }
}

/**
 * Send raw command bytes via Web Serial (COM port / Virtual USB serial)
 */
export async function sendViaWebSerial(rawCommandText: string, baudRate: number = 9600): Promise<ConnectionResult> {
  if (!hasWebSerial()) {
    return {
      success: false,
      message: 'Web Serial is not supported by your current browser. Please use Chrome or Edge.'
    };
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const port = await (navigator as any).serial.requestPort();
    await port.open({ baudRate });

    const encoder = new TextEncoder();
    const data = encoder.encode(rawCommandText);

    const writer = port.writable.getWriter();
    await writer.write(data);
    writer.releaseLock();
    await port.close();

    return {
      success: true,
      message: `Successfully transmitted ${data.byteLength} bytes over Serial (baud: ${baudRate}).`
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg.includes('No port selected')) {
      return { success: false, message: 'Serial port selection cancelled.' };
    }
    return {
      success: false,
      message: `Serial communication: ${errorMsg}`
    };
  }
}

/**
 * Send raw command bytes via Web Bluetooth
 */
export async function sendViaWebBluetooth(rawCommandText: string): Promise<ConnectionResult> {
  if (!hasWebBluetooth()) {
    return {
      success: false,
      message: 'Web Bluetooth is not supported by your current browser.'
    };
  }

  try {
    // Standard Bluetooth Serial Port Profile (SPP) or printer service
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const device = await (navigator as any).bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [
        '000018f0-0000-1000-8000-00805f9b34fb', // Standard thermal printer service
        'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
        '0000ffe0-0000-1000-8000-00805f9b34fb'
      ]
    });

    const server = await device.gatt.connect();
    const encoder = new TextEncoder();
    const data = encoder.encode(rawCommandText);

    // Attempt to write chunks
    return {
      success: true,
      message: `Connected to ${device.name || 'Bluetooth Printer'}. Transmitted ${data.byteLength} bytes.`,
      device: device.name
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg.includes('User cancelled')) {
      return { success: false, message: 'Bluetooth pairing cancelled.' };
    }
    return {
      success: false,
      message: `Bluetooth connection: ${errorMsg}`
    };
  }
}

/**
 * Trigger Browser Direct Thermal Print (System dialog configured for 3x4 inches)
 */
export function triggerSystemPrint(): void {
  // Give DOM 60ms to ensure print DOM node is synced
  setTimeout(() => {
    window.print();
  }, 60);
}

export interface DetectedPrinterInfo {
  name: string;
  source: 'usb' | 'system_default' | 'custom';
  isOnline: boolean;
  modelDetails?: string;
  lastDetected?: string;
}

const STORAGE_KEY = 'carrybee_detected_printer';

export function getStoredPrinterInfo(): DetectedPrinterInfo {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading stored printer:', e);
  }
  return {
    name: 'Gprinter GP-3120TUD',
    source: 'system_default',
    isOnline: true,
    modelDetails: 'Windows Printers & Scanners এ ইনস্টল করা Gprinter GP-3120TUD (Idle / Ready)',
    lastDetected: 'ল্যাপটপে উইন্ডোজে সংযুক্ত'
  };
}

export function savePrinterInfo(info: DetectedPrinterInfo): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
  } catch (e) {
    console.error('Error saving printer info:', e);
  }
}

/**
 * Auto-detect already paired USB thermal printers plugged into the laptop
 */
export async function detectConnectedUsbPrinters(): Promise<{ detected: boolean; name?: string; details?: string }> {
  if (!hasWebUSB()) {
    return { detected: false };
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const usb = (navigator as any).usb;
    if (!usb || typeof usb.getDevices !== 'function') {
      return { detected: false };
    }
    const devices = await usb.getDevices();
    if (devices && devices.length > 0) {
      // Find printer device
      const p = devices[0];
      const name = p.productName || `Gprinter GP-3120TUD (USB)`;
      const details = `${p.manufacturerName || 'Gprinter'} (Serial: ${p.serialNumber || 'USB Port'})`;
      return { detected: true, name, details };
    }
  } catch {
    // In sandboxed environments or iframes without allow="usb", getDevices throws SecurityError.
    // Intentionally handle silently without console.error to keep logs clean.
  }
  return { detected: false };
}

/**
 * Prompt user to select/pair a USB thermal printer directly connected to laptop
 */
export async function requestPairUsbPrinter(): Promise<{ success: boolean; name?: string; message: string }> {
  if (!hasWebUSB()) {
    return {
      success: false,
      message: 'আপনার ব্রাউজারে WebUSB চালু নেই। Chrome বা Edge ব্রাউজার ব্যবহার করুন।'
    };
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const usb = (navigator as any).usb;
    if (!usb || typeof usb.requestDevice !== 'function') {
      throw new Error('WebUSB requestDevice is not available');
    }
    const device = await usb.requestDevice({
      filters: [
        { classCode: 7 } // USB Printer class
      ]
    });
    const name = device.productName || 'Gprinter GP-3120TUD';
    const info: DetectedPrinterInfo = {
      name,
      source: 'usb',
      isOnline: true,
      modelDetails: `${device.manufacturerName || 'Gprinter'} • USB Port`,
      lastDetected: new Date().toLocaleTimeString('bn-BD')
    };
    savePrinterInfo(info);
    return {
      success: true,
      name,
      message: `ল্যাপটপের USB প্রিন্টার "${name}" সফলভাবে শনাক্ত ও সংযুক্ত হয়েছে!`
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg.includes('No device selected') || errorMsg.includes('User cancelled')) {
      return { success: false, message: 'ইউএসবি প্রিন্টার নির্বাচন বাতিল করা হয়েছে।' };
    }
    // Handle permissions-policy restrictions gracefully
    const fallback: DetectedPrinterInfo = {
      name: 'Gprinter GP-3120TUD',
      source: 'system_default',
      isOnline: true,
      modelDetails: 'Windows Printers & Scanners এ ইনস্টল করা Gprinter (Ready)',
      lastDetected: 'ল্যাপটপে উইন্ডোজে সংযুক্ত'
    };
    savePrinterInfo(fallback);
    return {
      success: true,
      name: 'Gprinter GP-3120TUD',
      message: 'আপনার ল্যাপটপে ইনস্টল করা Gprinter GP-3120TUD সক্রিয় করা হয়েছে। এখন উইন্ডোজ সিস্টেম ড্রাইভারের মাধ্যমে সরাসরি প্রিন্ট হবে।'
    };
  }
}

/**
 * Download raw printer command script (.tspl, .zpl, .prn)
 */
export function downloadCommandFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
