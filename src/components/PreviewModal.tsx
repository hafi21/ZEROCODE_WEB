import React, { useEffect, useState } from 'react';
import { X, Maximize2, Smartphone, Monitor, Laptop, Loader2, CheckCircle2, Copy, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  generatedCode: { html: string; css: string; js: string } | null;
  isGenerating: boolean;
  error?: string | null;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, onExport, generatedCode, isGenerating, error }) => {
  const [copied, setCopied] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleCopy = () => {
    if (!generatedCode) return;
    const fullCode = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My ZEROCODE Website</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      body { margin: 0; padding: 0; font-family: sans-serif; overflow-x: hidden; scroll-behavior: smooth; }
      ${generatedCode.css}
    </style>
</head>
<body>
    ${generatedCode.html}
    <script>${generatedCode.js}</script>
</body>
</html>`;
    navigator.clipboard.writeText(fullCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const iframeContent = generatedCode ? `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body { margin: 0; padding: 0; font-family: sans-serif; overflow-x: hidden; scroll-behavior: smooth; }
          ${generatedCode.css}
        </style>
      </head>
      <body>
        ${generatedCode.html}
        <script>${generatedCode.js}</script>
      </body>
    </html>
  ` : '';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-[100] bg-zinc-950/90 backdrop-blur-2xl flex items-center justify-center ${isFullScreen ? 'p-0' : 'p-8'}`}
        >
          <motion.div
            layout
            initial={{ scale: 0.9, y: 20 }}
            animate={{ 
              scale: 1, 
              y: 0,
              x: 0,
              width: '100%',
              height: '100%',
              maxWidth: isFullScreen ? '100%' : '80rem',
            }}
            exit={{ scale: 0.9, y: 20 }}
            className={`bg-zinc-900 rounded-[3rem] border border-zinc-800 shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden pointer-events-auto transition-all duration-500 ${isFullScreen ? 'rounded-none border-none' : ''}`}
          >
            {/* Header */}
            <div className="h-20 px-8 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2.5">
                  <button 
                    onClick={onClose}
                    className="w-3.5 h-3.5 rounded-full bg-[#FF5F57] hover:bg-[#FF5F57]/80 transition-colors shadow-inner" 
                    title="Close"
                  />
                  <button 
                    onClick={() => setIsFullScreen(false)}
                    className="w-3.5 h-3.5 rounded-full bg-[#FEBC2E] hover:bg-[#FEBC2E]/80 transition-colors shadow-inner" 
                    title="Restore"
                  />
                  <button 
                    onClick={() => setIsFullScreen(true)}
                    className="w-3.5 h-3.5 rounded-full bg-[#28C840] hover:bg-[#28C840]/80 transition-colors shadow-inner" 
                    title="Full Screen"
                  />
                </div>
                <div className="h-8 w-px bg-zinc-800" />
                <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
                  Live Preview
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 text-sm font-bold text-zinc-300 hover:text-white transition-all"
                >
                  {copied ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
                <button 
                  onClick={onExport}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-sm font-black text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all"
                >
                  <Download size={16} />
                  Export HTML
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 bg-zinc-950 p-12 flex items-center justify-center overflow-hidden">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-6">
                  <div className="relative">
                    <div className="absolute inset-0 blur-2xl bg-emerald-500/20 animate-pulse" />
                    <Loader2 size={64} className="text-emerald-400 animate-spin relative" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-black text-white mb-2">Generating Your Website</h3>
                    <p className="text-zinc-500 text-sm">Our AI is crafting your custom code...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center gap-6 max-w-md text-center">
                  <div className="p-4 rounded-2xl bg-red-500/10 text-red-500">
                    <X size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white mb-2">Generation Failed</h3>
                    <p className="text-zinc-500 text-sm mb-4">{error}</p>
                    <button 
                      onClick={onClose}
                      className="px-6 py-2 rounded-xl bg-zinc-800 text-sm font-bold text-zinc-300 hover:text-white transition-all"
                    >
                      Close and Try Again
                    </button>
                  </div>
                </div>
              ) : generatedCode ? (
                <motion.div 
                  layout
                  className="w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 border border-zinc-800"
                >
                  <iframe
                    srcDoc={iframeContent}
                    title="Website Preview"
                    className="w-full h-full border-none"
                  />
                </motion.div>
              ) : (
                <div className="text-zinc-600 text-center">
                  <p>No code generated yet. Try adding some elements!</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PreviewModal;
