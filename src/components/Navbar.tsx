import React from 'react';
import { Play, Download, Rocket, Sparkles, Undo2, Redo2, Trash2, Copy, Clipboard, Layers, Maximize2, Minimize2, Save, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';

interface NavbarProps {
  onPreview: () => void;
  onPublish: () => void;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onCopy: () => void;
  onPaste: () => void;
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
  isGenerating: boolean;
  isSimplePreview: boolean;
  onToggleSimplePreview: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  onPreview, onPublish, onSave,
  onUndo, onRedo, onDelete, onDuplicate, onCopy, onPaste,
  canUndo, canRedo, hasSelection, isGenerating,
  isSimplePreview, onToggleSimplePreview
}) => {
  return (
    <nav className="h-20 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800 px-8 flex items-center z-50">
      <div className="flex-1 flex items-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Rocket size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-black text-white tracking-tight">ZEROCODE <span className="text-emerald-400">WEB</span></h1>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            <Sparkles size={10} className="text-emerald-500" />
            AI Powered Design
          </div>
        </div>
      </div>

      {/* Editing Controls */}
      <div className="flex items-center gap-1 bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-800">
        <div className="flex items-center gap-1 px-1">
          <button 
            onClick={onUndo} 
            disabled={!canUndo}
            className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-emerald-400 disabled:opacity-30 disabled:hover:text-zinc-400 transition-all"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={18} />
          </button>
          <button 
            onClick={onRedo} 
            disabled={!canRedo}
            className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-emerald-400 disabled:opacity-30 disabled:hover:text-zinc-400 transition-all"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={18} />
          </button>
        </div>
        
        <div className="w-px h-6 bg-zinc-800 mx-1" />
        
        <div className="flex items-center gap-1 px-1">
          <button 
            onClick={onCopy} 
            disabled={!hasSelection}
            className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-emerald-400 disabled:opacity-30 disabled:hover:text-zinc-400 transition-all"
            title="Copy (Ctrl+C)"
          >
            <Copy size={18} />
          </button>
          <button 
            onClick={onPaste} 
            className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-emerald-400 transition-all"
            title="Paste (Ctrl+V)"
          >
            <Clipboard size={18} />
          </button>
        </div>

        <div className="w-px h-6 bg-zinc-800 mx-1" />

        <div className="flex items-center gap-1 px-1">
          <button 
            onClick={onDuplicate} 
            disabled={!hasSelection}
            className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-emerald-400 disabled:opacity-30 disabled:hover:text-zinc-400 transition-all"
            title="Duplicate (Ctrl+D)"
          >
            <Layers size={18} />
          </button>
          <button 
            onClick={onDelete} 
            disabled={!hasSelection}
            className="p-2 hover:bg-red-500/10 rounded-xl text-zinc-400 hover:text-red-400 disabled:opacity-30 disabled:hover:text-zinc-400 transition-all"
            title="Delete (Del)"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-end gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-bold text-zinc-300 hover:text-white hover:border-zinc-700 transition-all"
        >
          <Save size={16} className="text-emerald-400" />
          Save Project
        </motion.button>

        <motion.button
          whileHover={{ scale: isGenerating ? 1 : 1.05 }}
          whileTap={{ scale: isGenerating ? 1 : 0.95 }}
          onClick={onPreview}
          disabled={isGenerating}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-bold transition-all ${isGenerating ? 'bg-zinc-900/50 border-zinc-800/50 text-zinc-500 cursor-not-allowed' : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'}`}
        >
          <Play size={16} className={isGenerating ? 'text-emerald-400/50' : 'text-emerald-400'} />
          Preview
        </motion.button>

        <motion.button
          whileHover={{ scale: isGenerating ? 1 : 1.05 }}
          whileTap={{ scale: isGenerating ? 1 : 0.95 }}
          onClick={onPublish}
          disabled={isGenerating}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black text-white shadow-lg transition-all ${isGenerating ? 'bg-emerald-500/50 cursor-not-allowed shadow-none' : 'bg-emerald-500 shadow-emerald-500/20 hover:bg-emerald-400'}`}
        >
          {isGenerating ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Rocket size={16} />
          )}
          {isGenerating ? 'Publishing...' : 'Publish'}
        </motion.button>
      </div>
    </nav>
  );
};

export default Navbar;
