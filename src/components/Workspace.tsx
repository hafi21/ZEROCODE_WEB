import React, { useRef, useState, useEffect } from 'react';
import { Frame as FrameType, WebsiteElement, ElementType, Connection, CanvasTransform } from '../types';
import Frame from './Frame';
import { Plus, MousePointer2, Hand, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface WorkspaceProps {
  frames: FrameType[];
  elements: WebsiteElement[];
  connections: Connection[];
  canvasTransform: CanvasTransform;
  selectedId: string | null;
  selectedFrameId: string | null;
  tool: 'select' | 'hand';
  onSelect: (id: string | null) => void;
  onSelectFrame: (id: string | null) => void;
  onUpdateFrame: (id: string, updates: Partial<FrameType>) => void;
  onDeleteFrame: (id: string) => void;
  onUpdateElement: (id: string, updates: Partial<WebsiteElement>) => void;
  onDeleteElement: (id: string) => void;
  onAddElement: (type: ElementType, config?: Partial<WebsiteElement>) => void;
  onAddFrame: (config?: Partial<FrameType>) => void;
  onUpdateCanvasTransform: (updates: Partial<CanvasTransform>) => void;
  onSetTool: (tool: 'select' | 'hand') => void;
  onStartLinking?: (id: string, e: React.MouseEvent) => void;
  onEndLinking?: (id: string) => void;
  onDeleteConnection?: (id: string) => void;
  linkingSourceId?: string | null;
  linkingMousePos?: { x: number, y: number } | null;
  isSimplePreview?: boolean;
  currentPreviewFrameId?: string | null;
  onElementClick?: (id: string) => void;
}

const Workspace: React.FC<WorkspaceProps> = ({
  frames,
  elements,
  connections,
  canvasTransform,
  selectedId,
  selectedFrameId,
  tool,
  onSelect,
  onSelectFrame,
  onUpdateFrame,
  onDeleteFrame,
  onUpdateElement,
  onDeleteElement,
  onAddElement,
  onAddFrame,
  onUpdateCanvasTransform,
  onSetTool,
  onStartLinking,
  onEndLinking,
  onDeleteConnection,
  linkingSourceId,
  linkingMousePos,
  isSimplePreview,
  currentPreviewFrameId,
  onElementClick
}) => {
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (tool === 'hand' || e.button === 1) {
      setIsPanning(true);
      setLastPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastPos.x;
      const dy = e.clientY - lastPos.y;
      onUpdateCanvasTransform({
        x: canvasTransform.x + dx,
        y: canvasTransform.y + dy
      });
      setLastPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.min(Math.max(canvasTransform.scale * delta, 0.1), 5);
      onUpdateCanvasTransform({ scale: newScale });
    } else if (!isPanning) {
      onUpdateCanvasTransform({
        x: canvasTransform.x - e.deltaX,
        y: canvasTransform.y - e.deltaY
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('componentType') as ElementType;
    if (!type) return;

    const shapeType = e.dataTransfer.getData('shapeType');
    const tableRows = e.dataTransfer.getData('tableRows');
    const tableCols = e.dataTransfer.getData('tableCols');

    // Find which frame the element was dropped into
    const rect = workspaceRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left - canvasTransform.x) / canvasTransform.scale;
    const y = (e.clientY - rect.top - canvasTransform.y) / canvasTransform.scale;

    const droppedFrame = frames.find(f => 
      x >= f.position.left && x <= f.position.left + f.size.width &&
      y >= f.position.top && y <= f.position.top + f.size.height
    );

    const config: any = {
      styles: {
        left: x - (droppedFrame?.position.left ?? 0),
        top: y - (droppedFrame?.position.top ?? 0),
      },
      frameId: droppedFrame?.id ?? frames[0]?.id
    };

    if (shapeType) config.shapeType = shapeType;
    if (tableRows && tableCols) {
      const rows = parseInt(tableRows);
      const cols = parseInt(tableCols);
      config.tableData = {
        rows: Array.from({ length: rows }, () => ({
          id: Math.random().toString(36).substr(2, 9),
          cells: Array.from({ length: cols }, () => ({
            id: Math.random().toString(36).substr(2, 9),
            content: 'Cell',
          })),
        })),
        headerRow: true,
        borderWidth: '1px',
        borderColor: 'rgba(255,255,255,0.2)',
      };
    }

    if (config.frameId) {
      onAddElement(type, config);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  return (
    <div 
      ref={workspaceRef}
      className={`flex-1 bg-zinc-950 relative overflow-hidden select-none ${tool === 'hand' ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => {
        onSelect(null);
        onSelectFrame(null);
      }}
    >
      {/* Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(#fff 1px, transparent 1px)`,
          backgroundSize: `${40 * canvasTransform.scale}px ${40 * canvasTransform.scale}px`,
          backgroundPosition: `${canvasTransform.x}px ${canvasTransform.y}px`
        }}
      />

      {/* Canvas Content */}
      <div 
        className="absolute inset-0 origin-top-left"
        style={{
          transform: `translate(${canvasTransform.x}px, ${canvasTransform.y}px) scale(${canvasTransform.scale})`
        }}
      >
        {/* Connections SVG Layer */}
        {!isSimplePreview && (
          <svg className="absolute inset-0 pointer-events-none overflow-visible w-full h-full">
            {connections.map(conn => {
              const fromEl = elements.find(el => el.id === conn.from);
              if (!fromEl) return null;

              const fromFrame = frames.find(f => f.id === fromEl.frameId);
              if (!fromFrame) return null;

              let toX, toY;
              const toFrame = frames.find(f => f.id === conn.to);
              if (toFrame) {
                toX = toFrame.position.left;
                toY = toFrame.position.top + toFrame.size.height / 2;
              } else {
                const toEl = elements.find(el => el.id === conn.to);
                if (!toEl) return null;
                const toElFrame = frames.find(f => f.id === toEl.frameId);
                if (!toElFrame) return null;
                toX = toElFrame.position.left + (toEl.styles.left || 0);
                toY = toElFrame.position.top + (toEl.styles.top || 0) + (toEl.styles.height || 0) / 2;
              }

              const fromX = fromFrame.position.left + (fromEl.styles.left || 0) + (fromEl.styles.width || 0);
              const fromY = fromFrame.position.top + (fromEl.styles.top || 0) + (fromEl.styles.height || 0) / 2;

              const midX = (fromX + toX) / 2;
              const midY = (fromY + toY) / 2;

              // Prevent NaN errors if calculations fail
              if (isNaN(fromX) || isNaN(fromY) || isNaN(toX) || isNaN(toY)) return null;

              return (
                <g key={conn.id} className="group/conn cursor-pointer pointer-events-auto">
                  <path 
                    d={`M ${fromX} ${fromY} C ${fromX + 50} ${fromY}, ${toX - 50} ${toY}, ${toX} ${toY}`}
                    fill="none"
                    stroke="rgba(59, 130, 246, 0.5)"
                    strokeWidth={3 / canvasTransform.scale}
                    className="group-hover/conn:stroke-blue-400 transition-colors"
                  />
                  <circle cx={fromX} cy={fromY} r={4 / canvasTransform.scale} fill="#3b82f6" />
                  <circle cx={toX} cy={toY} r={4 / canvasTransform.scale} fill="#3b82f6" />
                  
                  {/* Delete Connection Button */}
                  <g 
                    className="opacity-0 group-hover/conn:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConnection?.(conn.id);
                    }}
                  >
                    <circle 
                      cx={midX} 
                      cy={midY} 
                      r={10 / canvasTransform.scale} 
                      fill="#ef4444" 
                      className="hover:fill-red-500"
                    />
                    <line 
                      x1={midX - 4 / canvasTransform.scale} y1={midY - 4 / canvasTransform.scale} 
                      x2={midX + 4 / canvasTransform.scale} y2={midY + 4 / canvasTransform.scale} 
                      stroke="white" strokeWidth={2 / canvasTransform.scale} 
                    />
                    <line 
                      x1={midX + 4 / canvasTransform.scale} y1={midY - 4 / canvasTransform.scale} 
                      x2={midX - 4 / canvasTransform.scale} y2={midY + 4 / canvasTransform.scale} 
                      stroke="white" strokeWidth={2 / canvasTransform.scale} 
                    />
                  </g>
                </g>
              );
            })}

            {/* Temporary Linking Line */}
            {linkingSourceId && linkingMousePos && (
              (() => {
                const sourceEl = elements.find(el => el.id === linkingSourceId);
                if (!sourceEl) return null;
                const sourceFrame = frames.find(f => f.id === sourceEl.frameId);
                if (!sourceFrame) return null;

                const startX = sourceFrame.position.left + (sourceEl.styles.left || 0) + (sourceEl.styles.width || 0);
                const startY = sourceFrame.position.top + (sourceEl.styles.top || 0) + (sourceEl.styles.height || 0) / 2;
                
                // Convert mouse pos to canvas coords
                const rect = workspaceRef.current?.getBoundingClientRect();
                if (!rect) return null;
                const endX = (linkingMousePos.x - rect.left - canvasTransform.x) / canvasTransform.scale;
                const endY = (linkingMousePos.y - rect.top - canvasTransform.y) / canvasTransform.scale;

                if (isNaN(startX) || isNaN(startY) || isNaN(endX) || isNaN(endY)) return null;

                return (
                  <line 
                    x1={startX} y1={startY} x2={endX} y2={endY}
                    stroke="#3b82f6"
                    strokeWidth={2 / canvasTransform.scale}
                    strokeDasharray="4 4"
                  />
                );
              })()
            )}
          </svg>
        )}

        {/* Frames */}
        {frames
          .filter(f => !isSimplePreview || f.id === currentPreviewFrameId || (!currentPreviewFrameId && f === frames[0]))
          .map(frame => (
            <Frame 
              key={frame.id}
              frame={frame}
              elements={elements}
              selectedId={selectedId}
              isSelected={selectedFrameId === frame.id}
              onSelect={onSelect}
              onSelectFrame={onSelectFrame}
              onUpdateFrame={onUpdateFrame}
              onDeleteFrame={onDeleteFrame}
              onUpdateElement={onUpdateElement}
              onDeleteElement={onDeleteElement}
              onAddElement={onAddElement}
              scale={canvasTransform.scale}
              onStartLinking={onStartLinking}
              onEndLinking={onEndLinking}
              isSimplePreview={isSimplePreview}
              onElementClick={onElementClick}
              isLinking={!!linkingSourceId}
              linkingSourceId={linkingSourceId}
              connections={connections}
            />
          ))}

        {/* Empty State */}
        {frames.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-12 bg-zinc-900/50 border-2 border-dashed border-zinc-800 rounded-[3rem] backdrop-blur-xl">
              <Plus size={48} className="mx-auto mb-4 text-zinc-700" />
              <h3 className="text-xl font-bold text-zinc-400 mb-2">No Frames Yet</h3>
              <p className="text-zinc-600 mb-6">Create your first frame to start building</p>
              <button 
                onClick={() => onAddFrame()}
                className="px-8 py-3 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
              >
                Create First Frame
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 p-2 rounded-2xl shadow-2xl z-50">
        <div className="flex items-center gap-1 p-1 bg-zinc-950 rounded-xl border border-zinc-800">
          <button 
            onClick={() => onSetTool('select')}
            className={`p-2 rounded-lg transition-all ${tool === 'select' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-zinc-500 hover:text-white'}`}
            title="Select Tool (V)"
          >
            <MousePointer2 size={18} />
          </button>
          <button 
            onClick={() => onSetTool('hand')}
            className={`p-2 rounded-lg transition-all ${tool === 'hand' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-zinc-500 hover:text-white'}`}
            title="Hand Tool (H)"
          >
            <Hand size={18} />
          </button>
        </div>
        <div className="w-px h-6 bg-zinc-800 mx-1" />
        <div className="flex items-center gap-1">
          <button 
            onClick={() => onUpdateCanvasTransform({ scale: Math.max(canvasTransform.scale - 0.1, 0.1) })}
            className="p-2 text-zinc-500 hover:text-white transition-colors"
          >
            <ZoomOut size={18} />
          </button>
          <span className="text-[10px] font-bold text-zinc-500 w-12 text-center">
            {Math.round(canvasTransform.scale * 100)}%
          </span>
          <button 
            onClick={() => onUpdateCanvasTransform({ scale: Math.min(canvasTransform.scale + 0.1, 5) })}
            className="p-2 text-zinc-500 hover:text-white transition-colors"
          >
            <ZoomIn size={18} />
          </button>
          <button 
            onClick={() => onUpdateCanvasTransform({ x: 0, y: 0, scale: 1 })}
            className="p-2 text-zinc-500 hover:text-white transition-colors"
            title="Reset View"
          >
            <Maximize2 size={18} />
          </button>
        </div>
        <div className="w-px h-6 bg-zinc-800 mx-1" />
        <button 
          onClick={() => onAddFrame()}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl transition-all font-bold text-xs"
        >
          <Plus size={16} />
          Add Frame
        </button>
      </div>
    </div>
  );
};

export default Workspace;
