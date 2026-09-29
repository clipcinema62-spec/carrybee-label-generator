import React, { useRef, useState, useEffect } from 'react';
import { LabelConfig, LabelElement } from '../types/label';
import { ThermalCanvasElement } from './ThermalCanvasElement';
import { ZoomIn, ZoomOut, Maximize2, Grid, RotateCw, FileDown, FileText } from 'lucide-react';

interface Canvas3x4Props {
  elements: LabelElement[];
  config: LabelConfig;
  selectedId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<LabelElement>) => void;
  onDeleteElement: (id: string) => void;
  onDownloadPdf?: () => void;
  onDownloadWord?: () => void;
}

export const Canvas3x4: React.FC<Canvas3x4Props> = ({
  elements,
  config,
  selectedId,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  onDownloadPdf,
  onDownloadWord
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [zoom, setZoom] = useState<number>(0.85); // default comfortable zoom
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Dimensions calculated from config (supports 3x4 portrait and 4x3 landscape)
  const baseWidthDots = Math.round(config.widthInches * config.dpi);
  const baseHeightDots = Math.round(config.heightInches * config.dpi);

  // Actual canvas display width/height in px
  const canvasDisplayWidth = baseWidthDots * zoom;
  const canvasDisplayHeight = baseHeightDots * zoom;

  // Keyboard navigation / nudge / delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedId) return;
      // Do not intercept if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      const selected = elements.find((el) => el.id === selectedId);
      if (!selected) return;

      const step = e.shiftKey ? 10 : 2;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onUpdateElement(selectedId, { x: Math.max(0, selected.x - step) });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onUpdateElement(selectedId, { x: selected.x + step });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        onUpdateElement(selectedId, { y: Math.max(0, selected.y - step) });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        onUpdateElement(selectedId, { y: selected.y + step });
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onDeleteElement(selectedId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, elements, onUpdateElement, onDeleteElement]);

  // Pointer drag handling for selected element
  const handlePointerDown = (e: React.PointerEvent, element: LabelElement) => {
    e.stopPropagation();
    onSelectElement(element.id);

    if (element.locked) return;

    setIsDragging(true);
    const canvasRect = containerRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    // Pointer position relative to canvas top-left in dots
    const pointerXInDots = (e.clientX - canvasRect.left) / zoom;
    const pointerYInDots = (e.clientY - canvasRect.top) / zoom;

    setDragOffset({
      x: pointerXInDots - element.x,
      y: pointerYInDots - element.y
    });

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !selectedId) return;

    const canvasRect = containerRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const rawX = (e.clientX - canvasRect.left) / zoom - dragOffset.x;
    const rawY = (e.clientY - canvasRect.top) / zoom - dragOffset.y;

    let targetX = Math.round(rawX);
    let targetY = Math.round(rawY);

    if (snapToGrid) {
      const gridSize = 8; // 8 dots (~1mm)
      targetX = Math.round(targetX / gridSize) * gridSize;
      targetY = Math.round(targetY / gridSize) * gridSize;
    }

    // Keep within reasonable bounds
    targetX = Math.max(0, Math.min(baseWidthDots - 20, targetX));
    targetY = Math.max(0, Math.min(baseHeightDots - 20, targetY));

    onUpdateElement(selectedId, { x: targetX, y: targetY });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-neutral-950 relative overflow-hidden select-none">
      {/* Top Canvas Control Bar */}
      <div className="h-10 border-b border-neutral-800 bg-neutral-900/90 px-4 flex items-center justify-between z-20 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-mono text-neutral-400">
            Thermal Media: <strong className="text-neutral-200">{config.widthInches}.0" × {config.heightInches}.0" ({Math.round(config.widthInches * 25.4)} × {Math.round(config.heightInches * 25.4)} mm)</strong>
          </span>
          <span className="text-neutral-600">|</span>
          <span className="font-mono text-neutral-400">
            Resolution: <strong className="text-neutral-200">{config.dpi} DPI ({baseWidthDots}×{baseHeightDots} dots)</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Snap to grid */}
          <button
            onClick={() => setSnapToGrid(!snapToGrid)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
              snapToGrid
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
            title="Toggle 1mm Snap to Grid"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Snap Grid</span>
          </button>

          <span className="text-neutral-700">|</span>

          {/* Zoom controls */}
          <button
            onClick={() => setZoom((z) => Math.max(0.4, Number((z - 0.1).toFixed(2))))}
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="font-mono text-neutral-300 w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(1.8, Number((z + 0.1).toFixed(2))))}
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(0.85)}
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 ml-1"
            title="Fit Canvas"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {(onDownloadPdf || onDownloadWord) && <span className="text-neutral-700">|</span>}

          {onDownloadPdf && (
            <button
              onClick={onDownloadPdf}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-[11px] font-semibold transition-colors cursor-pointer"
              title="Download Canvas as PDF"
            >
              <FileDown className="w-3 h-3 text-rose-400" />
              <span>PDF</span>
            </button>
          )}

          {onDownloadWord && (
            <button
              onClick={onDownloadWord}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-sky-300 hover:text-white bg-sky-950/40 hover:bg-sky-900/60 border border-sky-800/50 text-[11px] font-semibold transition-colors cursor-pointer"
              title="Download Canvas as Word (.docx)"
            >
              <FileText className="w-3 h-3 text-sky-400" />
              <span>Word</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace Scroll Area */}
      <div
        className="flex-1 overflow-auto flex items-center justify-center p-8 thermal-grid-pattern relative"
        onClick={() => onSelectElement(null)}
      >
        {/* Roll Backing Visual Simulation */}
        <div className="relative flex flex-col items-center">
          {/* Top Roll Feed Indicator */}
          <div className="w-full flex items-center justify-between text-[11px] font-mono text-neutral-500 mb-1 px-2">
            <span>▲ FEED DIRECTION (Roll Core)</span>
            <span>GAP: {config.gapMm}mm</span>
          </div>

          {/* Thermal Label Paper Body */}
          <div
            ref={containerRef}
            style={{
              width: `${canvasDisplayWidth}px`,
              height: `${canvasDisplayHeight}px`
            }}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="relative bg-white text-black shadow-2xl rounded-sm transition-shadow border-2 border-neutral-300 overflow-hidden cursor-crosshair"
          >
            {/* Subtle thermal grid overlay for visual guidance */}
            {snapToGrid && (
              <div className="absolute inset-0 pointer-events-none thermal-paper-grid opacity-50 z-0" />
            )}

            {/* Printable Boundary Safe Margins Line (2mm / 16 dots) */}
            <div
              className="absolute pointer-events-none border border-dashed border-neutral-300 z-0"
              style={{
                left: `${16 * zoom}px`,
                top: `${16 * zoom}px`,
                width: `${(baseWidthDots - 32) * zoom}px`,
                height: `${(baseHeightDots - 32) * zoom}px`
              }}
            />

            {/* Render Elements */}
            {elements.map((el) => (
              <ThermalCanvasElement
                key={el.id}
                element={el}
                isSelected={el.id === selectedId}
                scale={zoom}
                onSelect={(e) => {
                  e.stopPropagation();
                  onSelectElement(el.id);
                }}
                onPointerDown={(e) => handlePointerDown(e, el)}
              />
            ))}
          </div>

          {/* Bottom Tear-Off Bar Simulation */}
          <div className="w-full flex items-center justify-between text-[11px] font-mono text-neutral-500 mt-2 px-2">
            <span>▼ TEAR-OFF CUTTER EDGE</span>
            <span>3x4 INCHES DIE-CUT</span>
          </div>
        </div>
      </div>
    </div>
  );
};
