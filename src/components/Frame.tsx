import React from 'react';
import { Rnd } from 'react-rnd';
import { motion } from 'motion/react';
import { Frame as FrameType, WebsiteElement, ElementType } from '../types';
import { Trash2, Settings, Plus, Link } from 'lucide-react';

interface FrameProps {
  frame: FrameType;
  elements: WebsiteElement[];
  selectedId: string | null;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
  onSelectFrame: (id: string | null) => void;
  onUpdateFrame: (id: string, updates: Partial<FrameType>) => void;
  onDeleteFrame: (id: string) => void;
  onUpdateElement: (id: string, updates: Partial<WebsiteElement>) => void;
  onDeleteElement: (id: string) => void;
  onAddElement: (type: ElementType, config?: Partial<WebsiteElement>) => void;
  scale: number;
  onStartLinking?: (id: string, e: React.MouseEvent) => void;
  onEndLinking?: (id: string) => void;
  isSimplePreview?: boolean;
  onElementClick?: (id: string) => void;
  isLinking?: boolean;
  linkingSourceId?: string | null;
  connections?: any[];
}

const Frame: React.FC<FrameProps> = ({
  frame,
  elements,
  selectedId,
  isSelected,
  onSelect,
  onSelectFrame,
  onUpdateFrame,
  onDeleteFrame,
  onUpdateElement,
  onDeleteElement,
  onAddElement,
  scale,
  onStartLinking,
  onEndLinking,
  isSimplePreview,
  onElementClick,
  isLinking,
  linkingSourceId,
  connections = []
}) => {
  const frameElements = elements.filter(el => el.frameId === frame.id);
  const isSourceFrame = elements.some(el => el.id === linkingSourceId && el.frameId === frame.id);

  const handleDragStop = (e: any, d: any) => {
    onUpdateFrame(frame.id, { position: { left: d.x, top: d.y } });
  };

  const handleResizeStop = (e: any, direction: any, ref: any, delta: any, position: any) => {
    onUpdateFrame(frame.id, {
      size: {
        width: ref.offsetWidth,
        height: ref.offsetHeight,
      },
      position: {
        left: position.x,
        top: position.y
      }
    });
  };

  const renderElement = (element: WebsiteElement) => {
    const isElementSelected = selectedId === element.id;
    const hasLink = connections.some(c => c.from === element.id);

    const renderContent = () => {
      const elementStyles = {
        ...element.styles,
        fontFamily: element.styles.fontFamily || 'inherit',
      };

      const baseStyles: React.CSSProperties = {
        color: elementStyles.color,
        backgroundColor: elementStyles.backgroundColor,
        backgroundImage: elementStyles.backgroundGradient,
        padding: elementStyles.padding,
        borderRadius: elementStyles.borderRadius,
        textAlign: elementStyles.textAlign,
        boxShadow: elementStyles.boxShadow,
        fontFamily: elementStyles.fontFamily,
        fontSize: elementStyles.fontSize,
        fontWeight: elementStyles.fontWeight as any,
        lineHeight: elementStyles.lineHeight,
        letterSpacing: elementStyles.letterSpacing,
        textTransform: elementStyles.textTransform,
        textDecoration: elementStyles.textDecoration,
        border: elementStyles.border || `${elementStyles.borderWidth} ${elementStyles.borderStyle} ${elementStyles.borderColor}`,
        width: '100%',
        height: '100%',
        opacity: elementStyles.opacity,
        transform: `rotate(${elementStyles.rotate || '0deg'}) scale(${elementStyles.scale || '1'})`,
        visibility: elementStyles.visibility,
        display: elementStyles.display,
        flexDirection: elementStyles.flexDirection,
        justifyContent: elementStyles.justifyContent,
        alignItems: elementStyles.alignItems,
        gap: elementStyles.gap,
        cursor: elementStyles.cursor,
      };

      switch (element.type) {
        case 'text':
          return (
            <div style={baseStyles} className="font-bold tracking-tight leading-tight break-words">
              {element.content || 'Click to edit text'}
            </div>
          );
        case 'button':
          return (
            <div className="flex justify-center w-full h-full pointer-events-none">
              <button
                style={{
                  ...baseStyles,
                  backgroundColor: elementStyles.backgroundColor || '#10b981',
                  color: elementStyles.color || '#fff',
                  borderRadius: elementStyles.borderRadius || '9999px',
                }}
                className="font-bold shadow-lg shadow-emerald-500/20"
              >
                {element.content || 'Click Me'}
              </button>
            </div>
          );
        case 'image':
          return (
            <div className="w-full h-full pointer-events-none">
              <img
                src={element.imageUrl || 'https://picsum.photos/seed/zerocode/800/400'}
                alt=""
                style={{ ...baseStyles, borderRadius: elementStyles.borderRadius || '1.5rem' }}
                className="object-cover shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </div>
          );
        case 'shape':
          const getClipPath = () => {
            switch (element.shapeType) {
              case 'triangle': return 'polygon(50% 0%, 0% 100%, 100% 100%)';
              case 'star': return 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
              default: return 'none';
            }
          };
          return (
            <div 
              style={{ ...baseStyles, clipPath: getClipPath(), overflow: 'hidden' }}
              className="flex items-center justify-center relative"
            >
              {element.imageUrl ? (
                <img src={element.imageUrl} alt="" className="w-full h-full pointer-events-none" style={{ objectFit: elementStyles.objectFit }} referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full" style={{ backgroundColor: elementStyles.backgroundColor }} />
              )}
            </div>
          );
        case 'navbar':
          return (
            <div 
              style={{ ...baseStyles, backgroundColor: elementStyles.backgroundColor || '#09090b', color: elementStyles.color || '#fff' }}
              className="flex items-center justify-between w-full"
            >
              <div
                className="font-black tracking-tighter"
                style={{ fontSize: '1.25em' }}
              >
                {element.title}
              </div>
              <div className="hidden md:flex items-center gap-8">
                {element.links?.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    className="font-medium opacity-70 hover:opacity-100 transition-opacity"
                    style={{ color: elementStyles.color, fontSize: '0.875em' }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <button
                className="px-5 py-2 rounded-xl bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-colors"
                style={{ fontSize: '0.875em' }}
              >
                {element.buttonText}
              </button>
            </div>
          );
        case 'footer':
          return (
            <div 
              style={{ ...baseStyles, backgroundColor: elementStyles.backgroundColor || '#09090b', color: elementStyles.color || '#fff' }}
              className="w-full flex flex-col items-center gap-8"
            >
              <div className="text-2xl font-black tracking-tighter">{element.title}</div>
              <div className="flex items-center gap-8">
                {element.links?.map((link, i) => (
                  <a key={i} href={link.url} className="text-sm font-medium opacity-70 hover:opacity-100 transition-opacity" style={{ color: elementStyles.color }}>{link.label}</a>
                ))}
              </div>
              <div className="text-xs opacity-50 font-medium">{element.content}</div>
            </div>
          );
        case 'hero':
          return (
            <div 
              style={{ ...baseStyles, color: elementStyles.color || '#fff', backgroundColor: elementStyles.backgroundColor || '#09090b' }}
              className="w-full flex flex-col items-center gap-6"
            >
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter max-w-4xl leading-[0.9]">{element.title}</h1>
              <p className="text-lg md:text-xl opacity-70 max-w-2xl font-medium leading-relaxed">{element.description}</p>
              <button className="mt-4 px-8 py-4 rounded-2xl bg-emerald-500 text-white text-lg font-black shadow-2xl shadow-emerald-500/20 hover:scale-105 hover:bg-emerald-400 transition-all">
                {element.buttonText}
              </button>
            </div>
          );
        case 'card':
          return (
            <div 
              style={{ ...baseStyles, backgroundColor: elementStyles.backgroundColor || 'rgba(255,255,255,0.05)', borderRadius: elementStyles.borderRadius || '2rem' }}
              className="flex flex-col group hover:border-emerald-500/50 transition-all duration-500"
            >
              <img src={element.imageUrl} alt="" className="w-full aspect-[4/3] object-cover" />
              <div className="p-8 flex flex-col gap-4">
                <h3 className="text-xl font-bold tracking-tight" style={{ color: elementStyles.color || '#fff' }}>{element.title}</h3>
                <p className="text-sm opacity-70 leading-relaxed" style={{ color: elementStyles.color }}>{element.description}</p>
                <button className="mt-2 w-full py-3 rounded-xl bg-zinc-800 text-white text-sm font-bold hover:bg-emerald-500 transition-colors">
                  {element.buttonText}
                </button>
              </div>
            </div>
          );
        case 'form':
          return (
            <div 
              style={{ ...baseStyles, backgroundColor: elementStyles.backgroundColor || 'rgba(255,255,255,0.05)', borderRadius: elementStyles.borderRadius || '2rem' }}
              className="flex flex-col gap-8"
            >
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-bold tracking-tight" style={{ color: elementStyles.color || '#fff' }}>{element.title}</h3>
                <p className="text-sm opacity-70 leading-relaxed" style={{ color: elementStyles.color }}>{element.description}</p>
              </div>
              <div className="flex flex-col gap-4">
                <input type="text" placeholder="Full Name" className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none transition-colors" />
                <input type="email" placeholder="Email Address" className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none transition-colors" />
                <textarea placeholder="Your Message" className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none transition-colors min-h-[120px] resize-none" />
                <button className="w-full py-4 rounded-xl bg-emerald-500 text-white text-sm font-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-colors">
                  {element.buttonText}
                </button>
              </div>
            </div>
          );
        case 'section':
          return (
            <div 
              style={{ ...baseStyles, backgroundColor: elementStyles.backgroundColor || '#09090b', borderRadius: elementStyles.borderRadius || '1.5rem' }}
              className="min-h-[100px] flex flex-col items-center justify-center gap-4 shadow-2xl relative overflow-hidden"
            >
              <div className="text-zinc-500 text-xs uppercase tracking-widest font-bold opacity-30 pointer-events-none">Section Container</div>
            </div>
          );
        case 'table':
          if (!element.tableData) return null;
          return (
            <div style={{ ...baseStyles, overflow: 'auto' }} className="w-full h-full">
              <table 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  borderCollapse: 'collapse',
                  border: `${element.tableData.borderWidth || '1px'} solid ${element.tableData.borderColor || 'rgba(255,255,255,0.2)'}`
                }}
              >
                <tbody>
                  {element.tableData.rows.map((row, rowIndex) => (
                    <tr key={row.id}>
                      {row.cells.map((cell, cellIndex) => {
                        const isHeader = element.tableData?.headerRow && rowIndex === 0;
                        const CellTag = isHeader ? 'th' : 'td';
                        return (
                          <CellTag 
                            key={cell.id}
                            style={{
                              border: `${element.tableData?.borderWidth || '1px'} solid ${element.tableData?.borderColor || 'rgba(255,255,255,0.2)'}`,
                              padding: '8px',
                              backgroundColor: cell.styles?.backgroundColor || (isHeader ? 'rgba(255,255,255,0.1)' : 'transparent'),
                              color: cell.styles?.color || 'inherit',
                              fontWeight: cell.styles?.fontWeight || (isHeader ? 'bold' : 'normal'),
                              textAlign: cell.styles?.textAlign || 'left',
                            }}
                          >
                            {cell.content}
                          </CellTag>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <Rnd
        key={element.id}
        size={{ width: element.styles.width, height: element.styles.height }}
        position={{ x: element.styles.left, y: element.styles.top }}
        scale={scale}
        minWidth={20}
        minHeight={20}
        bounds="parent"
        onDragStart={(e) => {
          e.stopPropagation();
          onSelect(element.id);
          onSelectFrame(frame.id);
        }}
        onDragStop={(e, d) => {
          onUpdateElement(element.id, { styles: { ...element.styles, left: d.x, top: d.y } });
        }}
        onResizeStart={(e) => {
          e.stopPropagation();
          onSelect(element.id);
          onSelectFrame(frame.id);
        }}
        onResizeStop={(e, direction, ref, delta, position) => {
          onUpdateElement(element.id, {
            styles: {
              ...element.styles,
              width: ref.offsetWidth,
              height: ref.offsetHeight,
              left: position.x,
              top: position.y,
            }
          });
        }}
        className={`group rnd-element ${isElementSelected ? 'z-50' : ''}`}
        style={{ zIndex: element.styles.zIndex || 0 }}
      >
        <div 
          className={`relative w-full h-full ${isElementSelected ? 'ring-2 ring-emerald-500' : ''} ${hasLink && !isSimplePreview ? 'ring-1 ring-blue-500/50' : ''} ${isLinking && !isElementSelected ? 'cursor-alias' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            if (onElementClick) {
              onElementClick(element.id);
            } else {
              onSelect(element.id);
              onSelectFrame(frame.id);
            }
          }}
          onMouseUp={(e) => {
            if (isLinking) {
              e.stopPropagation();
              onEndLinking?.(element.id);
            }
          }}
        >
          {isLinking && !isElementSelected && (
            <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-[1px] z-50 pointer-events-none border-2 border-dashed border-blue-500/50 rounded-lg flex items-center justify-center">
              <Link size={12} className="text-blue-500" />
            </div>
          )}
          {hasLink && !isSimplePreview && (
            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm z-[60]" />
          )}
          {isElementSelected && !isSimplePreview && (
            <div className="absolute -top-10 left-0 flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-lg shadow-2xl z-50">
              <button onClick={(e) => { e.stopPropagation(); onDeleteElement(element.id); }} className="p-1.5 hover:bg-red-500/10 rounded text-zinc-400 hover:text-red-500 transition-colors">
                <Trash2 size={12} />
              </button>
            </div>
          )}
          {isElementSelected && !isSimplePreview && (
            <div 
              className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-crosshair z-[60] hover:scale-125 transition-transform"
              onMouseDown={(e) => onStartLinking?.(element.id, e)}
              title="Link to Frame"
            />
          )}
          {renderContent()}
        </div>
      </Rnd>
    );
  };

  return (
    <Rnd
      size={{ width: frame.size.width, height: frame.size.height }}
      position={{ x: frame.position.left, y: frame.position.top }}
      scale={scale}
      onDragStart={() => {
        if (isSimplePreview) return;
        onSelect(null);
        onSelectFrame(frame.id);
      }}
      onDragStop={handleDragStop}
      onResizeStart={() => {
        if (isSimplePreview) return;
        onSelect(null);
        onSelectFrame(frame.id);
      }}
      onResizeStop={handleResizeStop}
      onMouseUp={() => onEndLinking?.(frame.id)}
      disableDragging={isSimplePreview}
      enableResizing={isSelected && !isSimplePreview}
      cancel=".rnd-element"
      className={`group/frame ${isSelected ? 'z-40' : 'z-0'} ${isSimplePreview ? 'pointer-events-auto' : ''} ${isLinking && !isSourceFrame ? 'ring-4 ring-blue-500/40 ring-dashed' : ''}`}
      resizeHandleStyles={{
        topRight: { width: 10, height: 10, borderRadius: '50%', background: '#10b981', right: -5, top: -5, display: isSelected ? 'block' : 'none' },
        bottomRight: { width: 10, height: 10, borderRadius: '50%', background: '#10b981', right: -5, bottom: -5, display: isSelected ? 'block' : 'none' },
        bottomLeft: { width: 10, height: 10, borderRadius: '50%', background: '#10b981', left: -5, bottom: -5, display: isSelected ? 'block' : 'none' },
        topLeft: { width: 10, height: 10, borderRadius: '50%', background: '#10b981', left: -5, top: -5, display: isSelected ? 'block' : 'none' },
      }}
    >
      <div 
        className={`relative w-full h-full shadow-2xl transition-all duration-300 ${isLinking && !isSourceFrame ? 'bg-blue-500/5' : ''}`}
        style={{ background: frame.background }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(null);
          onSelectFrame(frame.id);
        }}
      >
        {/* Link Target Overlay */}
        {isLinking && !isSourceFrame && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-500/10 backdrop-blur-[1px] z-50 pointer-events-none border-2 border-dashed border-blue-500/50 rounded-lg">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-blue-600 text-white px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-2 shadow-2xl shadow-blue-500/40"
            >
              <Link size={12} />
              Drop to Link
            </motion.div>
          </div>
        )}

        {/* Frame Label */}
        <div className="absolute -top-8 left-0 flex items-center gap-2 frame-handle cursor-move">
          <span className={`text-xs font-bold px-2 py-1 rounded ${isSelected ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
            {frame.name}
          </span>
          {isSelected && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDeleteFrame(frame.id); }}
              className="p-1 bg-zinc-800 text-zinc-400 hover:text-red-500 rounded"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>

        {/* Elements */}
        {frameElements.map(renderElement)}

        {/* Selection Border */}
        {isSelected && (
          <div className="absolute inset-0 border-2 border-emerald-500 pointer-events-none" />
        )}
      </div>
    </Rnd>
  );
};

export default Frame;
