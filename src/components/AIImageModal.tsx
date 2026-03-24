import React, { useState } from 'react';
import { X, Sparkles, Loader2, Search, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

interface AIImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (url: string) => void;
}

const AIImageModal: React.FC<AIImageModalProps> = ({ isOpen, onClose, onSelectImage }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API Key is missing. Please add your API key in the Secrets panel (gear icon) with the name GEMINI_API_KEY.");
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }],
        },
      });

      const images: string[] = [];
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          images.push(`data:image/png;base64,${part.inlineData.data}`);
        }
      }
      setGeneratedImages(images);
    } catch (error) {
      console.error('Failed to generate image:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            <div className="p-8 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">AI Image Generator</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">Describe the image you want to create</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 flex flex-col gap-6">
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A futuristic city with neon lights and flying cars..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-sm text-white focus:border-emerald-500 outline-none transition-colors min-h-[120px] resize-none"
                />
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="absolute bottom-4 right-4 px-6 py-2.5 bg-emerald-500 text-white text-sm font-black rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-all flex items-center gap-2"
                >
                  {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  {isGenerating ? 'Generating...' : 'Generate'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {generatedImages.map((url, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    className="group relative aspect-video rounded-2xl overflow-hidden border border-zinc-800 cursor-pointer"
                    onClick={() => onSelectImage(url)}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-white text-emerald-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl">
                        Select Image
                      </div>
                    </div>
                  </motion.div>
                ))}
                {!isGenerating && generatedImages.length === 0 && (
                  <div className="col-span-2 py-12 flex flex-col items-center justify-center text-zinc-600 border-2 border-dashed border-zinc-800 rounded-2xl">
                    <ImageIcon size={48} className="mb-4 opacity-20" />
                    <p className="text-sm font-bold uppercase tracking-widest opacity-50">No images generated yet</p>
                  </div>
                )}
                {isGenerating && (
                  <div className="col-span-2 py-12 flex flex-col items-center justify-center text-emerald-500/50">
                    <Loader2 size={48} className="animate-spin mb-4" />
                    <p className="text-sm font-bold uppercase tracking-widest animate-pulse">Crafting your image...</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AIImageModal;
