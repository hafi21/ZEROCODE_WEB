import React from 'react';
import { WebsiteElement, Frame, TableRow } from '../types';
import { Settings, Type, Palette, Trash2, X, Sparkles, Image as ImageIcon, Box, Layers, Maximize, Move, AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Underline, Strikethrough, Eye, EyeOff, RotateCw, ZoomIn, MousePointer2, Layout, Table as TableIcon, Plus, Minus } from 'lucide-react';

interface PropertiesPanelProps {
  element: WebsiteElement | null;
  frame: Frame | null;
  onUpdateElement: (id: string, updates: Partial<WebsiteElement>) => void;
  onUpdateFrame: (id: string, updates: Partial<Frame>) => void;
  onDelete: () => void;
  onClose: () => void;
  onOpenAIModal?: () => void;
}

const SectionHeader: React.FC<{
  icon: React.ComponentType<{ size?: number }>;
  title: string;
}> = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-4 first:mt-0">
    <Icon size={12} />
    {title}
  </div>
);

const PropertyGroup: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] text-zinc-500 font-medium">{label}</label>
    {children}
  </div>
);

const ColorPicker: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
  presets?: string[];
}> = ({ label, value, onChange, presets }) => (
  <PropertyGroup label={label}>
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 cursor-pointer overflow-hidden"
        />
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 text-xs text-zinc-300 outline-none focus:border-emerald-500"
          placeholder="#000000"
        />
      </div>
      {presets && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {presets.map((preset) => (
            <button
              key={preset}
              onClick={() => onChange(preset)}
              className={`w-5 h-5 rounded-full border border-zinc-800 transition-transform hover:scale-125 ${value === preset ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-zinc-950' : ''}`}
              style={{ backgroundColor: preset }}
            />
          ))}
        </div>
      )}
    </div>
  </PropertyGroup>
);

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ 
  element, 
  frame, 
  onUpdateElement, 
  onUpdateFrame, 
  onDelete, 
  onClose, 
  onOpenAIModal 
}) => {
  if (!element && !frame) return null;

  const handleStyleChange = (key: string, value: any) => {
    if (!element) return;
    onUpdateElement(element.id, {
      styles: {
        ...element.styles,
        [key]: value,
      },
    });
  };

  const handleTopLevelChange = (key: string, value: any) => {
    if (element) {
      if (['top', 'left', 'width', 'height'].includes(key)) {
        onUpdateElement(element.id, {
          styles: {
            ...element.styles,
            [key]: value
          }
        });
      } else {
        onUpdateElement(element.id, { [key]: value });
      }
    } else if (frame) {
      if (['top', 'left'].includes(key)) {
        onUpdateFrame(frame.id, {
          position: {
            ...frame.position,
            [key]: value
          }
        });
      } else if (['width', 'height'].includes(key)) {
        onUpdateFrame(frame.id, {
          size: {
            ...frame.size,
            [key]: value
          }
        });
      } else {
        onUpdateFrame(frame.id, { [key]: value });
      }
    }
  };

  const addRow = () => {
    if (!element || !element.tableData) return;
    const numCols = element.tableData.rows[0]?.cells.length || 1;
    const newRow: TableRow = {
      id: Math.random().toString(36).substr(2, 9),
      cells: Array.from({ length: numCols }, () => ({
        id: Math.random().toString(36).substr(2, 9),
        content: 'New Cell',
      })),
    };
    onUpdateElement(element.id, {
      tableData: {
        ...element.tableData,
        rows: [...element.tableData.rows, newRow],
      },
    });
  };

  const removeRow = (rowId: string) => {
    if (!element || !element.tableData || element.tableData.rows.length <= 1) return;
    onUpdateElement(element.id, {
      tableData: {
        ...element.tableData,
        rows: element.tableData.rows.filter(r => r.id !== rowId),
      },
    });
  };

  const addColumn = () => {
    if (!element || !element.tableData) return;
    const newRows = element.tableData.rows.map(row => ({
      ...row,
      cells: [
        ...row.cells,
        { id: Math.random().toString(36).substr(2, 9), content: 'New' }
      ]
    }));
    onUpdateElement(element.id, {
      tableData: {
        ...element.tableData,
        rows: newRows,
      },
    });
  };

  const removeColumn = (colIndex: number) => {
    if (!element || !element.tableData || element.tableData.rows[0].cells.length <= 1) return;
    const newRows = element.tableData.rows.map(row => ({
      ...row,
      cells: row.cells.filter((_, i) => i !== colIndex)
    }));
    onUpdateElement(element.id, {
      tableData: {
        ...element.tableData,
        rows: newRows,
      },
    });
  };

  const updateCell = (rowId: string, cellId: string, content: string) => {
    if (!element || !element.tableData) return;
    const newRows = element.tableData.rows.map(row => {
      if (row.id !== rowId) return row;
      return {
        ...row,
        cells: row.cells.map(cell => {
          if (cell.id !== cellId) return cell;
          return { ...cell, content };
        })
      };
    });
    onUpdateElement(element.id, {
      tableData: {
        ...element.tableData,
        rows: newRows,
      },
    });
  };

  const fontFamilies = [
    { label: 'Inter', value: '"Inter", sans-serif' },
    { label: 'Space Grotesk', value: '"Space Grotesk", sans-serif' },
    { label: 'System Sans', value: 'system-ui, sans-serif' },
    { label: 'Serif', value: 'Georgia, serif' },
    { label: 'Mono', value: '"JetBrains Mono", monospace' },
  ];

  const fontWeights = [
    { label: 'Light', value: '300' },
    { label: 'Normal', value: '400' },
    { label: 'Medium', value: '500' },
    { label: 'Semi-Bold', value: '600' },
    { label: 'Bold', value: '700' },
    { label: 'Extra-Bold', value: '800' },
    { label: 'Black', value: '900' },
  ];

  const colorPresets = [
    '#ffffff', '#000000', '#10b981', '#3b82f6', '#ef4444', 
    '#f59e0b', '#8b5cf6', '#ec4899', '#71717a', '#27272a'
  ];

  const shapeTypes = [
    { value: 'rectangle', label: 'Rectangle' },
    { value: 'circle', label: 'Circle' },
    { value: 'square', label: 'Square' },
    { value: 'rounded-rectangle', label: 'Rounded' },
    { value: 'triangle', label: 'Triangle' },
    { value: 'star', label: 'Star' },
  ];

  return (
    <div className="w-80 bg-zinc-950/80 backdrop-blur-xl border-l border-zinc-800 p-6 flex flex-col gap-8 h-full overflow-y-auto custom-scrollbar shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            {element ? <Settings size={18} /> : <Layout size={18} />}
          </div>
          <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-widest">
            {element ? 'Element Properties' : 'Frame Properties'}
          </h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-200 transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="flex flex-col gap-8 pb-12">
        {/* Frame Name (if frame selected) */}
        {frame && !element && (
          <div className="flex flex-col gap-4">
            <SectionHeader icon={Type} title="Frame Info" />
            <PropertyGroup label="Frame Name">
              <input
                type="text"
                value={frame.name || ''}
                onChange={(e) => onUpdateFrame(frame.id, { name: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-200 focus:border-emerald-500 outline-none transition-colors"
              />
            </PropertyGroup>
            <ColorPicker 
              label="Background" 
              value={frame.background || '#000000'} 
              onChange={(val) => onUpdateFrame(frame.id, { background: val })}
              presets={colorPresets}
            />
          </div>
        )}

        {/* 1. CONTENT SECTION (if element selected) */}
        {element && (
          <div className="flex flex-col gap-4">
            <SectionHeader icon={Type} title="Content" />
            
            {/* Shape Type */}
            {element.type === 'shape' && (
              <PropertyGroup label="Shape Type">
                <select
                  value={element.shapeType || 'rectangle'}
                  onChange={(e) => onUpdateElement(element.id, { shapeType: e.target.value as any })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none focus:border-emerald-500"
                >
                  {shapeTypes.map((shape) => (
                    <option key={shape.value} value={shape.value}>{shape.label}</option>
                  ))}
                </select>
              </PropertyGroup>
            )}

            {/* Table Controls */}
            {element.type === 'table' && element.tableData && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Structure</label>
                    <div className="flex gap-2">
                      <button 
                        onClick={addRow}
                        className="p-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/50 transition-all flex items-center gap-1 text-[10px] font-bold"
                      >
                        <Plus size={12} /> ROW
                      </button>
                      <button 
                        onClick={addColumn}
                        className="p-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/50 transition-all flex items-center gap-1 text-[10px] font-bold"
                      >
                        <Plus size={12} /> COL
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={element.tableData.headerRow}
                      onChange={(e) => onUpdateElement(element.id, { tableData: { ...element.tableData!, headerRow: e.target.checked } })}
                      className="w-4 h-4 rounded bg-zinc-900 border-zinc-800 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-xs text-zinc-400">Header Row</span>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Cell Content</label>
                  <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-2">
                    {element.tableData.rows.map((row, rIdx) => (
                      <div key={row.id} className="flex flex-col gap-1 p-2 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">Row {rIdx + 1}</span>
                          <button 
                            onClick={() => removeRow(row.id)}
                            className="p-1 text-zinc-600 hover:text-red-400 transition-colors"
                          >
                            <Minus size={10} />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {row.cells.map((cell, cIdx) => (
                            <div key={cell.id} className="flex flex-col gap-1">
                              <input 
                                type="text"
                                value={cell.content || ''}
                                onChange={(e) => updateCell(row.id, cell.id, e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-[11px] text-zinc-300 focus:border-emerald-500 outline-none"
                                placeholder={`Cell ${cIdx + 1}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Columns</label>
                  <div className="flex flex-wrap gap-2">
                    {element.tableData.rows[0].cells.map((_, cIdx) => (
                      <button 
                        key={cIdx}
                        onClick={() => removeColumn(cIdx)}
                        className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] text-zinc-500 hover:text-red-400 hover:border-red-500/50 transition-all flex items-center gap-1"
                      >
                        <Trash2 size={10} /> Col {cIdx + 1}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <PropertyGroup label="Border Width">
                    <input 
                      type="text"
                      value={element.tableData.borderWidth || '1px'}
                      onChange={(e) => onUpdateElement(element.id, { tableData: { ...element.tableData!, borderWidth: e.target.value } })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none focus:border-emerald-500"
                    />
                  </PropertyGroup>
                  <ColorPicker 
                    label="Border Color"
                    value={element.tableData.borderColor || 'rgba(255,255,255,0.2)'}
                    onChange={(val) => onUpdateElement(element.id, { tableData: { ...element.tableData!, borderColor: val } })}
                    presets={colorPresets}
                  />
                </div>
              </div>
            )}

            {/* Title Field */}
            {('title' in element) && (
              <PropertyGroup label="Title">
                <input
                  type="text"
                  value={element.title || ''}
                  onChange={(e) => onUpdateElement(element.id, { title: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-200 focus:border-emerald-500 outline-none transition-colors"
                  placeholder="Enter title..."
                />
              </PropertyGroup>
            )}

            {/* Description Field */}
            {('description' in element) && (
              <PropertyGroup label="Description">
                <textarea
                  value={element.description || ''}
                  onChange={(e) => onUpdateElement(element.id, { description: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-200 focus:border-emerald-500 outline-none transition-colors min-h-[80px] resize-none"
                  placeholder="Enter description..."
                />
              </PropertyGroup>
            )}

            {/* Button Text Field */}
            {('buttonText' in element) && (
              <PropertyGroup label="Button Text">
                <input
                  type="text"
                  value={element.buttonText || ''}
                  onChange={(e) => onUpdateElement(element.id, { buttonText: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-200 focus:border-emerald-500 outline-none transition-colors"
                  placeholder="Enter button text..."
                />
              </PropertyGroup>
            )}

            {/* Main Content Field */}
            {(element.type === 'text' || element.type === 'button' || element.type === 'footer') && (
              <PropertyGroup label={element.type === 'footer' ? 'Copyright Text' : 'Text Content'}>
                <textarea
                  value={element.content || ''}
                  onChange={(e) => onUpdateElement(element.id, { content: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-200 focus:border-emerald-500 outline-none transition-colors min-h-[100px] resize-none"
                  placeholder="Enter text content..."
                />
              </PropertyGroup>
            )}

            {/* Image URL Field */}
            {(element.type === 'image' || element.type === 'card' || element.type === 'shape') && (
              <PropertyGroup label="Image Source">
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={element.imageUrl || ''}
                    onChange={(e) => onUpdateElement(element.id, { imageUrl: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-200 focus:border-emerald-500 outline-none transition-colors"
                    placeholder="Image URL..."
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              onUpdateElement(element.id, { imageUrl: e.target?.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        };
                        input.click();
                      }}
                      className="flex items-center justify-center gap-2 p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all text-[10px] font-bold uppercase"
                    >
                      <ImageIcon size={14} />
                      Upload
                    </button>
                    <button 
                      onClick={onOpenAIModal}
                      className="flex items-center justify-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all text-[10px] font-bold uppercase"
                    >
                      <Sparkles size={14} />
                      AI Gen
                    </button>
                  </div>
                </div>
              </PropertyGroup>
            )}
          </div>
        )}

        {/* Styling Section */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            <Palette size={12} />
            {element ? 'Styling' : 'Dimensions'}
          </div>
          
          <div className="grid gap-6">
            {/* Position & Size */}
            <div className="flex flex-col gap-4 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Position & Size</div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-zinc-500 font-medium">X Position</label>
                  <input
                    type="number"
                    value={element ? (element.styles.left ?? 0) : (frame?.position.left ?? 0)}
                    onChange={(e) => handleTopLevelChange('left', parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-zinc-500 font-medium">Y Position</label>
                  <input
                    type="number"
                    value={element ? (element.styles.top ?? 0) : (frame?.position.top ?? 0)}
                    onChange={(e) => handleTopLevelChange('top', parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-zinc-500 font-medium">Width</label>
                  <input
                    type="number"
                    value={element ? (element.styles.width ?? 0) : (frame?.size.width ?? 0)}
                    onChange={(e) => handleTopLevelChange('width', parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-zinc-500 font-medium">Height</label>
                  <input
                    type="number"
                    value={element ? (element.styles.height ?? 0) : (frame?.size.height ?? 0)}
                    onChange={(e) => handleTopLevelChange('height', parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none"
                  />
                </div>
              </div>

              {element && (
                <>
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2">Spacing</div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-zinc-500 font-medium">Padding</label>
                    <input
                      type="text"
                      value={element.styles.padding || '1rem'}
                      onChange={(e) => handleStyleChange('padding', e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none"
                      placeholder="e.g. 1rem 2rem"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-zinc-500 font-medium">Margin</label>
                    <input
                      type="text"
                      value={element.styles.margin || '0px'}
                      onChange={(e) => handleStyleChange('margin', e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none"
                      placeholder="e.g. 10px 0px"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-zinc-500 font-medium">Max Width</label>
                    <input
                      type="text"
                      value={element.styles.maxWidth || 'none'}
                      onChange={(e) => handleStyleChange('maxWidth', e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none"
                      placeholder="e.g. 1200px"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-zinc-500 font-medium flex items-center gap-1">
                      <Layers size={10} />
                      Z-Index (Layering)
                    </label>
                    <input
                      type="number"
                      value={element.styles.zIndex || 0}
                      onChange={(e) => handleStyleChange('zIndex', e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none focus:border-emerald-500"
                      placeholder="0"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Typography (if element selected) */}
            {element && (
              <div className="flex flex-col gap-4 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Typography</div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-zinc-500 font-medium">Text Align</label>
                  <div className="flex gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                    {['left', 'center', 'right'].map((align) => (
                      <button
                        key={align}
                        onClick={() => handleStyleChange('textAlign', align)}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${
                          (element.styles.textAlign || 'center') === align 
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                            : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-zinc-500 font-medium">Font Family</label>
                  <select
                    value={element.styles.fontFamily || ''}
                    onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none focus:border-emerald-500"
                  >
                    <option value="">Default</option>
                    {fontFamilies.map((font) => (
                      <option key={font.value} value={font.value}>{font.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-zinc-500 font-medium">Font Size</label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="range"
                      min="8"
                      max="120"
                      value={parseInt(element.styles.fontSize || '16')}
                      onChange={(e) => handleStyleChange('fontSize', `${e.target.value}px`)}
                      className="flex-1 accent-emerald-500"
                    />
                    <input
                      type="text"
                      value={element.styles.fontSize || '16px'}
                      onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                      className="w-16 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-300 outline-none"
                    />
                  </div>
                </div>

                <ColorPicker 
                  label="Text Color" 
                  value={element.styles.color || '#ffffff'} 
                  onChange={(val) => handleStyleChange('color', val)}
                  presets={colorPresets}
                />
              </div>
            )}

            {/* Background & Border (if element selected) */}
            {element && (
              <div className="flex flex-col gap-4 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Colors & Borders</div>
                
                <ColorPicker 
                  label="Background Color" 
                  value={element.styles.backgroundColor || ''} 
                  onChange={(val) => handleStyleChange('backgroundColor', val)}
                  presets={colorPresets}
                />

                <div className="w-full h-px bg-zinc-800 my-1" />

                <ColorPicker 
                  label="Border Color" 
                  value={element.styles.borderColor || '#27272a'} 
                  onChange={(val) => handleStyleChange('borderColor', val)}
                  presets={colorPresets}
                />

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-zinc-500 font-medium">Border Width</label>
                    <input
                      type="text"
                      value={element.styles.borderWidth || '1px'}
                      onChange={(e) => handleStyleChange('borderWidth', e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none"
                      placeholder="1px"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-zinc-500 font-medium">Border Style</label>
                    <select
                      value={element.styles.borderStyle || 'solid'}
                      onChange={(e) => handleStyleChange('borderStyle', e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none"
                    >
                      <option value="none">None</option>
                      <option value="solid">Solid</option>
                      <option value="dashed">Dashed</option>
                      <option value="dotted">Dotted</option>
                      <option value="double">Double</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-zinc-500 font-medium">Border Radius</label>
                  <input
                    type="text"
                    value={element.styles.borderRadius || '1rem'}
                    onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none"
                    placeholder="e.g. 1rem or 9999px"
                  />
                </div>
              </div>
            )}

            {/* Delete Button */}
            <button 
              onClick={onDelete}
              className="w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all font-bold text-xs flex items-center justify-center gap-2"
            >
              <Trash2 size={14} />
              Delete {element ? 'Element' : 'Frame'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;
