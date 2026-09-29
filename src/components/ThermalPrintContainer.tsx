import React from 'react';
import { LabelConfig, LabelElement, BatchItem } from '../types/label';
import { ThermalCanvasElement } from './ThermalCanvasElement';

interface ThermalPrintContainerProps {
  elements: LabelElement[];
  config: LabelConfig;
  batchItems: BatchItem[] | null;
}

export const ThermalPrintContainer: React.FC<ThermalPrintContainerProps> = ({
  elements,
  config,
  batchItems
}) => {
  // CSS 96 DPI scale relative to thermal dots:
  // printScale = 96 / config.dpi
  const printScale = 96 / config.dpi;
  const widthInches = config.widthInches || 3;
  const heightInches = config.heightInches || 4;

  const getSubstitutedElements = (base: LabelElement[], item: BatchItem): LabelElement[] => {
    return base.map((el) => {
      let content = el.content;
      let barcodeVal = el.barcodeValue;
      let qrVal = el.qrValue;

      if (content) {
        if (content.includes('Tanzir') || content.includes('TO:')) {
          content = `TO: ${item.NAME}`;
        } else if (content.includes('TEL:') || content.includes('01819')) {
          content = `TEL: ${item.PHONE}`;
        } else if (content.includes('Uttara') || content.includes('Sector 11')) {
          content = item.ADDRESS;
        } else if (content.includes('BDT ৳') || content.includes('1,650')) {
          content = `BDT ৳ ${item.COD}`;
        } else if (content.includes('HUB:')) {
          content = `HUB: ${item.HUB}  |  SORT: ${item.HUB}`;
        } else if (item.HUB && (el.id.includes('hub') || el.textDecoration === 'underline')) {
          content = item.HUB;
        } else if (item.ITEMS && el.id.includes('items')) {
          content = item.ITEMS;
        } else if (item.STAFF && el.id.includes('staff')) {
          content = item.STAFF;
        }
      }

      if (barcodeVal) {
        barcodeVal = item.TRACKING || barcodeVal;
      }

      if (qrVal) {
        qrVal = `https://track.carrybee.com/${item.TRACKING}`;
      }

      return {
        ...el,
        content,
        barcodeValue: barcodeVal,
        qrValue: qrVal
      };
    });
  };

  return (
    <>
      <style>
        {`
          #thermal-print-area {
            display: none;
          }
          @media print {
            @page {
              size: ${widthInches}in ${heightInches}in !important;
              margin: 0mm !important;
            }
            html, body, #root {
              width: ${widthInches}in !important;
              height: auto !important;
              min-height: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              color: #000000 !important;
              overflow: visible !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            #thermal-print-area {
              display: block !important;
              visibility: visible !important;
              position: static !important;
              width: ${widthInches}in !important;
              height: auto !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              color: #000000 !important;
            }
            .thermal-page-break {
              display: block !important;
              visibility: visible !important;
              position: relative !important;
              width: ${widthInches}in !important;
              height: ${heightInches}in !important;
              max-height: ${heightInches}in !important;
              page-break-after: always !important;
              break-after: page !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              overflow: hidden !important;
              background: #ffffff !important;
              color: #000000 !important;
              box-sizing: border-box !important;
            }
          }
        `}
      </style>

      {batchItems && batchItems.length > 0 ? (
        <div id="thermal-print-area" className="print:block bg-white text-black">
          {batchItems.map((item, idx) => {
            const itemElements = getSubstitutedElements(elements, item);
            return (
              <div
                key={item.id || idx}
                className="thermal-page-break relative bg-white text-black"
                style={{
                  width: `${widthInches}in`,
                  height: `${heightInches}in`,
                  maxHeight: `${heightInches}in`,
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                {itemElements.map((el) => (
                  <ThermalCanvasElement
                    key={el.id}
                    element={el}
                    scale={printScale}
                    isPrintMode={true}
                  />
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        <div id="thermal-print-area" className="print:block bg-white text-black">
          <div
            className="thermal-page-break relative bg-white text-black"
            style={{
              width: `${widthInches}in`,
              height: `${heightInches}in`,
              maxHeight: `${heightInches}in`,
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            {elements.map((el) => (
              <ThermalCanvasElement
                key={el.id}
                element={el}
                scale={printScale}
                isPrintMode={true}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};
