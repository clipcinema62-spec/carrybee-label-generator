import { useState, useCallback, useEffect } from 'react';
import { LabelConfig, LabelElement, LabelTemplate, PrinterProfile, BatchItem } from './types/label';
import { PRINTER_PROFILES } from './utils/printerProfiles';
import { LABEL_TEMPLATES } from './utils/templates';
import { Header } from './components/Header';
import { Canvas3x4 } from './components/Canvas3x4';
import { ElementToolbar } from './components/ElementToolbar';
import { ElementPropertyPanel } from './components/ElementPropertyPanel';
import { QuickFormView } from './components/QuickFormView';
import { PrinterProfilesModal } from './components/PrinterProfilesModal';
import { AutoDetectPrinterModal } from './components/AutoDetectPrinterModal';
import { DirectPrintModal } from './components/DirectPrintModal';
import { CodeExportModal } from './components/CodeExportModal';
import { BatchPrintModal } from './components/BatchPrintModal';
import { HardwareConnectModal } from './components/HardwareConnectModal';
import { HubCartonModal, HubCardItem, INITIAL_USER_CARDS } from './components/HubCartonModal';
import { ThermalPrintContainer } from './components/ThermalPrintContainer';
import { 
  triggerSystemPrint, 
  getStoredPrinterInfo, 
  detectConnectedUsbPrinters,
  savePrinterInfo 
} from './utils/webHardware';
import { 
  exportCardsToPdf, 
  exportCardsToWord, 
  exportCanvasToPdf, 
  exportCanvasToWord 
} from './utils/documentExport';

export default function App() {
  // Active printer profile - Defaults to Laptop Default Installed Printer
  const [activeProfile, setActiveProfile] = useState<PrinterProfile>(PRINTER_PROFILES[0]);
  const [detectedPrinterName, setDetectedPrinterName] = useState<string>(() => getStoredPrinterInfo().name);
  const [isAutoDetectOpen, setIsAutoDetectOpen] = useState<boolean>(false);
  const [isDirectPrintModalOpen, setIsDirectPrintModalOpen] = useState<boolean>(false);
  const [directPrintCard, setDirectPrintCard] = useState<HubCardItem | null>(null);

  // Auto-detect connected USB thermal printer on mount
  useEffect(() => {
    detectConnectedUsbPrinters().then((res) => {
      if (res.detected && res.name) {
        setDetectedPrinterName(res.name);
        savePrinterInfo({
          name: res.name,
          source: 'usb',
          isOnline: true,
          modelDetails: res.details,
          lastDetected: 'স্বয়ংক্রিয়ভাবে সক্রিয়'
        });
        // Match profile if exists
        const matched = PRINTER_PROFILES.find((p) => 
          res.name?.toLowerCase().includes(p.id) || 
          res.name?.toLowerCase().includes(p.name.toLowerCase())
        );
        if (matched) {
          setActiveProfile(matched);
        }
      }
    });
  }, []);

  // Primary View Mode: 'form' (direct input fields) or 'designer' (visual canvas)
  const [viewMode, setViewMode] = useState<'form' | 'designer'>('form');

  // Hub Cards State (Initialized with the user's exact cards from photo)
  const [cards, setCards] = useState<HubCardItem[]>(INITIAL_USER_CARDS);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);

  // 3x4 / 4x3 Thermal Label Configuration (Starts in 4x3" Landscape matching user's photo)
  const [config, setConfig] = useState<LabelConfig>({
    widthInches: 4,
    heightInches: 3,
    dpi: 203,
    orientation: 'landscape',
    gapMm: 2.0,
    darkness: 10,
    speed: 4
  });

  // Current template & canvas elements (starts with the user's exact Hub Carton return label)
  const [currentTemplateId, setCurrentTemplateId] = useState<string>('hub-carton-landscape');
  const [elements, setElements] = useState<LabelElement[]>(LABEL_TEMPLATES[0].elements);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Batch print state
  const [batchItems, setBatchItems] = useState<BatchItem[] | null>(null);

  // Modals
  const [isProfilesOpen, setIsProfilesOpen] = useState<boolean>(false);
  const [isCodeExportOpen, setIsCodeExportOpen] = useState<boolean>(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState<boolean>(false);
  const [isHardwareOpen, setIsHardwareOpen] = useState<boolean>(false);
  const [isHubCartonModalOpen, setIsHubCartonModalOpen] = useState<boolean>(false);

  // Quick toast banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Convert a HubCardItem to LabelElement[]
  const cardToElements = useCallback((card: HubCardItem, isLand: boolean): LabelElement[] => {
    let list: LabelElement[];
    if (isLand) {
      list = [
        {
          id: 'hcl-hub-title',
          type: 'text',
          content: card.hub,
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
          content: card.items,
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
          content: card.staff,
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
          content: card.notice,
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
      ];
    } else {
      list = [
        {
          id: 'hcp-hub-title',
          type: 'text',
          content: card.hub,
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
          content: card.items,
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
          content: card.staff,
          x: 20,
          y: 154,
          width: 568,
          height: 48,
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
          y: 216,
          width: 576,
          height: 3,
          strokeWidth: 3
        },
        {
          id: 'hcp-notice',
          type: 'text',
          content: card.notice,
          x: 16,
          y: 236,
          width: 576,
          height: 140,
          fontSize: 34,
          fontWeight: 'black',
          fontFamily: 'sans',
          fontStyle: 'italic',
          textAlign: 'center'
        }
      ];
    }

    if (card.showBarcode && card.tracking) {
      list.push({
        id: isLand ? 'hcl-barcode' : 'hcp-barcode',
        type: 'barcode',
        barcodeValue: card.tracking,
        barcodeFormat: 'CODE128',
        showBarcodeText: true,
        x: isLand ? 250 : 150,
        y: isLand ? 385 : 380,
        width: 300,
        height: 60,
        barHeight: 50,
        barWidth: 2
      });
    }

    return list;
  }, []);

  // Card list operations
  const handleUpdateCard = (id: string, updates: Partial<HubCardItem>) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const handleAddCard = (newCard: HubCardItem) => {
    setCards((prev) => [...prev, newCard]);
    showToast(`যোগ করা হয়েছে "${newCard.hub}"`);
  };

  const handleDeleteCard = (id: string) => {
    setCards((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (activeCardIndex >= filtered.length) {
        setActiveCardIndex(Math.max(0, filtered.length - 1));
      }
      return filtered;
    });
    showToast('কার্ড মুছে ফেলা হয়েছে');
  };

  const handleDuplicateCard = (card: HubCardItem) => {
    const copy: HubCardItem = {
      ...card,
      id: `hub-${Date.now().toString(36)}`,
      hub: `${card.hub} (Copy)`
    };
    setCards((prev) => [...prev, copy]);
    showToast(`ডুপ্লিকেট করা হয়েছে "${card.hub}"`);
  };

  // Print single active card from form
  const handlePrintCurrentFormCard = () => {
    const cur = cards[activeCardIndex] || cards[0];
    if (!cur) return;

    const isLand = config.orientation === 'landscape' || config.widthInches > config.heightInches;
    setElements(cardToElements(cur, isLand));
    setBatchItems(null);
    setDirectPrintCard(cur);
    setIsDirectPrintModalOpen(true);
    showToast(`"${cur.hub}" এর লেবেল ল্যাপটপের প্রিন্টারে (${detectedPrinterName}) পাঠানো হচ্ছে...`);
    triggerSystemPrint();
  };

  // Print all cards from form
  const handlePrintAllFormCards = () => {
    const isLand = config.orientation === 'landscape' || config.widthInches > config.heightInches;
    const baseTemplate = isLand ? LABEL_TEMPLATES[0] : LABEL_TEMPLATES[1];
    setElements(baseTemplate.elements);

    const batchList: BatchItem[] = cards.map((c) => ({
      id: c.id,
      HUB: c.hub,
      ITEMS: c.items,
      STAFF: c.staff,
      TRACKING: `CL-${c.hub.toUpperCase().replace(/\s+/g, '-')}`,
      NOTICE: c.notice
    }));

    setBatchItems(batchList);
    showToast(`সবগুলো (${cards.length}টি) হাব ল্যাপটপের প্রিন্টারে পাঠানো হচ্ছে...`);
    triggerSystemPrint();
  };

  // Add Element (Designer mode)
  const handleAddElement = useCallback((element: LabelElement) => {
    setElements((prev) => [...prev, element]);
    setSelectedId(element.id);
  }, []);

  // Update Element
  const handleUpdateElement = useCallback((id: string, updates: Partial<LabelElement>) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  }, []);

  // Delete Element
  const handleDeleteElement = useCallback((id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    setSelectedId((cur) => (cur === id ? null : cur));
  }, []);

  // Duplicate Element
  const handleDuplicateElement = useCallback((element: LabelElement) => {
    const duplicate: LabelElement = {
      ...element,
      id: `${element.id}-copy-${Date.now().toString(36)}`,
      x: element.x + 16,
      y: element.y + 16
    };
    setElements((prev) => [...prev, duplicate]);
    setSelectedId(duplicate.id);
    showToast('Element duplicated');
  }, []);

  // Apply Template
  const handleApplyTemplate = useCallback((template: LabelTemplate) => {
    setCurrentTemplateId(template.id);
    setElements(template.elements);
    setSelectedId(null);

    if (template.id.includes('landscape')) {
      setConfig((prev) => ({
        ...prev,
        widthInches: 4,
        heightInches: 3,
        orientation: 'landscape'
      }));
    } else if (template.id.includes('portrait')) {
      setConfig((prev) => ({
        ...prev,
        widthInches: 3,
        heightInches: 4,
        orientation: 'portrait'
      }));
    }

    showToast(`Loaded "${template.name}"`);
  }, []);

  // Single Direct Print
  const handleDirectPrint = () => {
    if (viewMode === 'form') {
      handlePrintCurrentFormCard();
    } else {
      setBatchItems(null);
      const cur = cards[activeCardIndex] || cards[0];
      setDirectPrintCard(cur);
      setIsDirectPrintModalOpen(true);
      showToast(`Preparing ${config.widthInches}"×${config.heightInches}" Thermal Print Job...`);
      triggerSystemPrint();
    }
  };

  // Batch Print
  const handlePrintBatch = (items: BatchItem[]) => {
    setBatchItems(items);
    setIsBatchModalOpen(false);
    showToast(`Sending ${items.length} thermal labels to queue...`);
    triggerSystemPrint();
  };

  // Hub Carton Batch Print from Modal
  const handlePrintHubCards = (cardsList: HubCardItem[], orientation: 'landscape' | 'portrait') => {
    const newConfig: Partial<LabelConfig> = orientation === 'landscape'
      ? { widthInches: 4, heightInches: 3, orientation: 'landscape' }
      : { widthInches: 3, heightInches: 4, orientation: 'portrait' };

    setConfig((prev) => ({ ...prev, ...newConfig }));

    const batchList: BatchItem[] = cardsList.map((c) => ({
      id: c.id,
      HUB: c.hub,
      ITEMS: c.items,
      STAFF: c.staff,
      TRACKING: `CL-${c.hub.toUpperCase().replace(/\s+/g, '-')}`,
      NOTICE: c.notice
    }));

    const template = orientation === 'landscape' ? LABEL_TEMPLATES[0] : LABEL_TEMPLATES[1];
    setElements(template.elements);

    setBatchItems(batchList);
    setIsHubCartonModalOpen(false);
    showToast(`Printing ${cardsList.length} Hub Carton labels to thermal roll...`);
    triggerSystemPrint();
  };

  // Load specific Hub Card into Designer
  const handleLoadCardIntoDesigner = (card: HubCardItem, orientation: 'landscape' | 'portrait') => {
    const isLand = orientation === 'landscape';
    const newConfig: Partial<LabelConfig> = isLand
      ? { widthInches: 4, heightInches: 3, orientation: 'landscape' }
      : { widthInches: 3, heightInches: 4, orientation: 'portrait' };

    setConfig((prev) => ({ ...prev, ...newConfig }));
    setElements(cardToElements(card, isLand));
    setViewMode('designer');
    setIsHubCartonModalOpen(false);
    showToast(`Loaded "${card.hub}" into Canvas Designer`);
  };

  // PDF & Word Document Download Handlers
  const handleDownloadPdf = async () => {
    try {
      showToast('PDF ফাইল তৈরি হচ্ছে...');
      if (viewMode === 'form') {
        const cur = cards[activeCardIndex] || cards[0];
        const filename = `Carrybee_Label_${(cur.hub || 'hub').replace(/[\s/\\?%*:|"<>]+/g, '_')}.pdf`;
        await exportCardsToPdf([cur], config, filename);
      } else {
        await exportCanvasToPdf(elements, config, `Thermal_Label_${Date.now()}.pdf`);
      }
      showToast('PDF ফাইল ডাউনলোড সম্পন্ন হয়েছে');
    } catch (e) {
      console.error('PDF export error:', e);
      showToast('PDF ডাউনলোডে সমস্যা হয়েছে');
    }
  };

  const handleDownloadWord = async () => {
    try {
      showToast('Word ফাইল তৈরি হচ্ছে...');
      if (viewMode === 'form') {
        const cur = cards[activeCardIndex] || cards[0];
        const filename = `Carrybee_Label_${(cur.hub || 'hub').replace(/[\s/\\?%*:|"<>]+/g, '_')}.docx`;
        await exportCardsToWord([cur], config, filename);
      } else {
        await exportCanvasToWord(elements, config, `Thermal_Label_${Date.now()}.docx`);
      }
      showToast('Word (.docx) ফাইল ডাউনলোড সম্পন্ন হয়েছে');
    } catch (e) {
      console.error('Word export error:', e);
      showToast('Word ডাউনলোডে সমস্যা হয়েছে');
    }
  };

  const selectedElement = elements.find((el) => el.id === selectedId) || null;

  return (
    <>
      <div className="screen-root w-screen h-screen flex flex-col bg-neutral-900 text-neutral-100 font-sans overflow-hidden print:hidden">
        {/* Screen Interactive UI Container */}
        <div className="screen-ui flex flex-col w-full h-full overflow-hidden">
          {/* Top Header */}
          <Header
            activeProfile={activeProfile}
            detectedPrinterName={detectedPrinterName}
            onOpenAutoDetect={() => setIsAutoDetectOpen(true)}
            viewMode={viewMode}
            onChangeViewMode={setViewMode}
            onOpenProfiles={() => setIsProfilesOpen(true)}
            onOpenCodeExport={() => setIsCodeExportOpen(true)}
            onOpenBatchModal={() => setIsBatchModalOpen(true)}
            onOpenHardwareConnect={() => setIsHardwareOpen(true)}
            onOpenHubCartonModal={() => setIsHubCartonModalOpen(true)}
            onDownloadPdf={handleDownloadPdf}
            onDownloadWord={handleDownloadWord}
            onDirectPrint={handleDirectPrint}
          />

          {/* Toast Alert */}
          {toastMessage && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-amber-500 text-black font-semibold text-xs rounded-full shadow-lg flex items-center gap-2 animate-bounce">
              <span>{toastMessage}</span>
            </div>
          )}

          {/* WORKSPACE AREA: Form Mode OR Designer Canvas Mode */}
          {viewMode === 'form' ? (
            /* Dedicated Direct Input Fields Form */
            <QuickFormView
              cards={cards}
              activeCardIndex={activeCardIndex}
              config={config}
              detectedPrinterName={detectedPrinterName}
              onOpenAutoDetect={() => setIsAutoDetectOpen(true)}
              onSelectCard={setActiveCardIndex}
              onUpdateCard={handleUpdateCard}
              onAddCard={handleAddCard}
              onDeleteCard={handleDeleteCard}
              onDuplicateCard={handleDuplicateCard}
              onPrintCurrent={handlePrintCurrentFormCard}
              onPrintAll={handlePrintAllFormCards}
              onUpdateConfig={(updates) => setConfig((prev) => ({ ...prev, ...updates }))}
            />
          ) : (
            /* 3-Column Studio Designer Workspace */
            <div className="flex-1 flex w-full overflow-hidden relative">
              {/* Left Column: Element Addition & 3x4 Template Catalog */}
              <ElementToolbar
                onAddElement={handleAddElement}
                onApplyTemplate={handleApplyTemplate}
                currentTemplateId={currentTemplateId}
              />

              {/* Center Column: High-Precision 3x4 Canvas Workspace */}
              <Canvas3x4
                elements={elements}
                config={config}
                selectedId={selectedId}
                onSelectElement={setSelectedId}
                onUpdateElement={handleUpdateElement}
                onDeleteElement={handleDeleteElement}
                onDownloadPdf={handleDownloadPdf}
                onDownloadWord={handleDownloadWord}
              />

              {/* Right Column: Properties & Thermal Media Settings */}
              <ElementPropertyPanel
                element={selectedElement}
                config={config}
                onUpdateElement={handleUpdateElement}
                onDeleteElement={handleDeleteElement}
                onDuplicateElement={handleDuplicateElement}
                onUpdateConfig={(updates) => setConfig((prev) => ({ ...prev, ...updates }))}
              />
            </div>
          )}
        </div>

        {/* Modals */}
        <HubCartonModal
          isOpen={isHubCartonModalOpen}
          onClose={() => setIsHubCartonModalOpen(false)}
          config={config}
          onPrintCards={handlePrintHubCards}
          onLoadIntoDesigner={handleLoadCardIntoDesigner}
        />

        <PrinterProfilesModal
          isOpen={isProfilesOpen}
          onClose={() => setIsProfilesOpen(false)}
          activeProfile={activeProfile}
          onOpenAutoDetect={() => setIsAutoDetectOpen(true)}
          onSelectProfile={(p) => {
            setActiveProfile(p);
            setDetectedPrinterName(p.name);
            showToast(`প্রিন্টার প্রোফাইল নির্বাচন: ${p.name}`);
          }}
        />

        <AutoDetectPrinterModal
          isOpen={isAutoDetectOpen}
          onClose={() => setIsAutoDetectOpen(false)}
          activeProfile={activeProfile}
          onSelectProfile={setActiveProfile}
          onPrinterUpdated={(name) => {
            setDetectedPrinterName(name);
            showToast(`প্রিন্টার সফলভাবে সেট হয়েছে: ${name}`);
          }}
        />

        <DirectPrintModal
          isOpen={isDirectPrintModalOpen}
          onClose={() => setIsDirectPrintModalOpen(false)}
          card={directPrintCard || cards[activeCardIndex] || cards[0]}
          config={config}
          detectedPrinterName={detectedPrinterName}
          activeProfile={activeProfile}
          onOpenAutoDetect={() => setIsAutoDetectOpen(true)}
          onDownloadPdf={handleDownloadPdf}
          onDownloadWord={handleDownloadWord}
        />

        <CodeExportModal
          isOpen={isCodeExportOpen}
          onClose={() => setIsCodeExportOpen(false)}
          elements={elements}
          config={config}
          defaultProtocol={activeProfile.protocol}
        />

        <BatchPrintModal
          isOpen={isBatchModalOpen}
          onClose={() => setIsBatchModalOpen(false)}
          baseElements={elements}
          config={config}
          onPrintBatch={handlePrintBatch}
        />

        <HardwareConnectModal
          isOpen={isHardwareOpen}
          onClose={() => setIsHardwareOpen(false)}
          activeProfile={activeProfile}
        />
      </div>

      {/* Hidden Print Container for CSS @media print (3x4 inches pure pagination) */}
      <ThermalPrintContainer
        elements={elements}
        config={config}
        batchItems={batchItems}
      />
    </>
  );
}
