import React, { useState } from 'react';
import { Type, Image as ImageIcon, MousePointer2, Layout, Plus, Navigation, Mail, CreditCard, Footprints, Monitor, Palette as PaletteIcon, History, Save, Clock, X, Trash2, Square, Circle, Triangle, Star, Table as TableIcon } from 'lucide-react';
import { ElementType, Project, Palette, WebsiteElement, TableRow, TableCell } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  onAddElement: (type: ElementType, config?: Partial<WebsiteElement>) => void;
  onAddFrame: () => void;
  projects: Project[];
  onLoadProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  palette: Palette;
  onApplyColor: (color: string) => void;
  onAddColor: (color: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  onAddElement, onAddFrame, projects, onLoadProject, onDeleteProject, palette, onApplyColor, onAddColor
}) => {
  const [customColor, setCustomColor] = useState('#ffffff');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const basicComponents = [
    { type: 'section' as ElementType, icon: Layout, label: 'Section', description: 'Container for elements' },
    { type: 'text' as ElementType, icon: Type, label: 'Text', description: 'Heading or paragraph' },
    { type: 'button' as ElementType, icon: MousePointer2, label: 'Button', description: 'Clickable action' },
    { type: 'image' as ElementType, icon: ImageIcon, label: 'Image', description: 'Visual content' },
  ];

  const intermediateComponents = [
    { type: 'navbar' as ElementType, icon: Navigation, label: 'Navbar', description: 'Header navigation' },
    { type: 'hero' as ElementType, icon: Monitor, label: 'Hero', description: 'Main heading section' },
    { type: 'card' as ElementType, icon: CreditCard, label: 'Card', description: 'Product or feature card' },
    { type: 'form' as ElementType, icon: Mail, label: 'Form', description: 'Contact or sign up form' },
    { type: 'footer' as ElementType, icon: Footprints, label: 'Footer', description: 'Bottom navigation' },
  ];

  const shapes = [
    { type: 'shape' as ElementType, shapeType: 'rectangle', icon: Square, label: 'Rectangle' },
    { type: 'shape' as ElementType, shapeType: 'circle', icon: Circle, label: 'Circle' },
    { type: 'shape' as ElementType, shapeType: 'square', icon: Square, label: 'Square' },
    { type: 'shape' as ElementType, shapeType: 'rounded-rectangle', icon: Square, label: 'Rounded' },
    { type: 'shape' as ElementType, shapeType: 'triangle', icon: Triangle, label: 'Triangle' },
    { type: 'shape' as ElementType, shapeType: 'star', icon: Star, label: 'Star' },
  ];

  const generateTableData = (rows: number, cols: number) => {
    const tableRows: TableRow[] = Array.from({ length: rows }, () => ({
      id: Math.random().toString(36).substr(2, 9),
      cells: Array.from({ length: cols }, () => ({
        id: Math.random().toString(36).substr(2, 9),
        content: 'Cell',
      })),
    }));
    return {
      rows: tableRows,
      headerRow: true,
      borderWidth: '1px',
      borderColor: 'rgba(255,255,255,0.2)',
    };
  };

  const tables = [
    { rows: 2, cols: 2, label: '2x2 Table' },
    { rows: 3, cols: 3, label: '3x3 Table' },
    { rows: 4, cols: 4, label: '4x4 Table' },
    { rows: 5, cols: 5, label: '5x5 Table' },
  ];

  return (
    <div className="w-80 bg-zinc-950/80 backdrop-blur-xl border-r border-zinc-800 p-6 flex flex-col gap-8 h-full overflow-y-auto custom-scrollbar relative">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Workspace</h2>
          <button 
            onClick={onAddFrame}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all text-[10px] font-bold uppercase tracking-wider"
          >
            <Plus size={12} />
            Add Frame
          </button>
        </div>
        <div className="grid gap-4">
          {basicComponents.map((comp) => (
            <motion.div
              key={comp.type}
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(39, 39, 42, 0.8)' }}
              whileTap={{ scale: 0.98 }}
              className="group flex items-start gap-4 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/50 transition-all text-left cursor-grab active:cursor-grabbing"
            >
              <button
                draggable
                onDragStart={(e: React.DragEvent) => {
                  e.dataTransfer.setData('componentType', comp.type);
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                onClick={() => onAddElement(comp.type)}
                className="flex items-start gap-4 w-full h-full text-left"
              >
                <div className="p-2.5 rounded-xl bg-zinc-800 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-colors">
                  <comp.icon size={20} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-zinc-200">{comp.label}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">{comp.description}</div>
                </div>
                <Plus size={14} className="ml-auto text-zinc-600 group-hover:text-emerald-400 self-center" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6">Intermediate</h2>
        <div className="grid gap-4">
          {intermediateComponents.map((comp) => (
            <motion.div
              key={comp.type}
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(39, 39, 42, 0.8)' }}
              whileTap={{ scale: 0.98 }}
              className="group flex items-start gap-4 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/50 transition-all text-left cursor-grab active:cursor-grabbing"
            >
              <button
                draggable
                onDragStart={(e: React.DragEvent) => {
                  e.dataTransfer.setData('componentType', comp.type);
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                onClick={() => onAddElement(comp.type)}
                className="flex items-start gap-4 w-full h-full text-left"
              >
                <div className="p-2.5 rounded-xl bg-zinc-800 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-colors">
                  <comp.icon size={20} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-zinc-200">{comp.label}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">{comp.description}</div>
                </div>
                <Plus size={14} className="ml-auto text-zinc-600 group-hover:text-emerald-400 self-center" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6">Shapes</h2>
        <div className="grid grid-cols-2 gap-3">
          {shapes.map((shape) => (
            <motion.div
              key={shape.shapeType}
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(39, 39, 42, 0.8)' }}
              whileTap={{ scale: 0.95 }}
              className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/50 transition-all text-center cursor-grab active:cursor-grabbing"
            >
              <button
                draggable
                onDragStart={(e: React.DragEvent) => {
                  e.dataTransfer.setData('componentType', shape.type);
                  e.dataTransfer.setData('shapeType', shape.shapeType);
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                onClick={() => onAddElement(shape.type, { shapeType: shape.shapeType as any })}
                className="flex flex-col items-center gap-2 w-full h-full text-center"
              >
                <div className="p-3 rounded-xl bg-zinc-800 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-colors">
                  <shape.icon size={24} />
                </div>
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{shape.label}</div>
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6">Tables</h2>
        <div className="grid grid-cols-2 gap-3">
          {tables.map((table) => (
            <motion.div
              key={table.label}
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(39, 39, 42, 0.8)' }}
              whileTap={{ scale: 0.95 }}
              className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/50 transition-all text-center cursor-grab active:cursor-grabbing"
            >
              <button
                draggable
                onDragStart={(e: React.DragEvent) => {
                  e.dataTransfer.setData('componentType', 'table');
                  e.dataTransfer.setData('tableRows', table.rows.toString());
                  e.dataTransfer.setData('tableCols', table.cols.toString());
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                onClick={() => onAddElement('table', { tableData: generateTableData(table.rows, table.cols) })}
                className="flex flex-col items-center gap-2 w-full h-full text-center"
              >
                <div className="p-3 rounded-xl bg-zinc-800 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-colors">
                  <TableIcon size={24} />
                </div>
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{table.label}</div>
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Projects Section */}
      <div className="mt-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-xl bg-zinc-800 text-zinc-400 flex items-center justify-center">
            <History size={16} />
          </div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-200">Recent Projects</h2>
        </div>
        
        <div className="flex flex-col gap-3">
          {projects.length === 0 ? (
            <div className="p-6 rounded-2xl border border-dashed border-zinc-800 text-center">
              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">No saved drafts</p>
            </div>
          ) : (
            projects.slice(0, 5).map((project) => (
              <div key={project.id} className="group relative">
                <button
                  onClick={() => onLoadProject(project)}
                  className="w-full flex items-center gap-4 p-3 rounded-xl bg-zinc-900/30 border border-zinc-800 hover:border-emerald-500/30 hover:bg-zinc-900/50 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-emerald-400 transition-colors">
                    <Save size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-zinc-300 truncate">{project.name}</div>
                    <div className="flex items-center gap-1 text-[9px] text-zinc-600 mt-0.5">
                      <Clock size={10} />
                      {new Date(project.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteProject(project.id);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-zinc-800 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete Project"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-auto pt-8 border-t border-zinc-800">
        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Pro Tip</div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Intermediate components are pre-built sections that speed up your design process.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
