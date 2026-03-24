import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WebsiteElement, ElementType, WebsiteLayout, Project, Palette, Frame, Connection, CanvasTransform } from './types';
import Sidebar from './components/Sidebar';
import Workspace from './components/Workspace';
import PropertiesPanel from './components/PropertiesPanel';
import Navbar from './components/Navbar';
import PreviewModal from './components/PreviewModal';
import AIImageModal from './components/AIImageModal';
import { generateWebsiteCode } from './services/aiService';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Rocket, 
  CheckCircle2, 
  X, 
  Save, 
  Trash2, 
  AlertCircle, 
  Palette as PaletteIcon, 
  Layout, 
  Monitor, 
  Smartphone, 
  Plus, 
  Undo2, 
  Redo2, 
  Copy, 
  Clipboard, 
  MousePointer2, 
  Hand, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  ChevronRight, 
  ChevronLeft, 
  Layers, 
  Settings, 
  Palette as PaletteIconLayout, 
  Type, 
  Box, 
  Image as ImageIcon, 
  Sparkles 
} from 'lucide-react';
import { HistoryManager } from './utils/HistoryManager';

export default function App() {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [elements, setElements] = useState<WebsiteElement[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [canvasTransform, setCanvasTransform] = useState<CanvasTransform>({ x: 0, y: 0, scale: 1 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);
  const [tool, setTool] = useState<'select' | 'hand'>('select');
  const [showFrameModal, setShowFrameModal] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isFullScreenPreview, setIsFullScreenPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<{ html: string; css: string; js: string } | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isSimplePreview, setIsSimplePreview] = useState(false);
  const [currentPreviewFrameId, setCurrentPreviewFrameId] = useState<string | null>(null);

  useEffect(() => {
    if (isSimplePreview && !currentPreviewFrameId && frames.length > 0) {
      setCurrentPreviewFrameId(frames[0].id);
    }
  }, [isSimplePreview, currentPreviewFrameId, frames]);
  const [linkingSourceId, setLinkingSourceId] = useState<string | null>(null);
  const [linkingMousePos, setLinkingMousePos] = useState<{ x: number, y: number } | null>(null);
  const [clipboard, setClipboard] = useState<WebsiteElement | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [palette, setPalette] = useState<Palette>({
    id: 'default',
    name: 'Default Palette',
    colors: ['#3b82f6', '#8b5cf6', '#10b981', '#18181b', '#f43f5e', '#f59e0b']
  });

  // Load projects from localStorage on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem('zerocode_projects');
    if (savedProjects) {
      try {
        setProjects(JSON.parse(savedProjects));
      } catch (e) {
        console.error("Failed to parse projects", e);
      }
    }
  }, []);

  const saveProject = () => {
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Project ${projects.length + 1}`,
      data: { frames, elements, connections, canvasTransform },
      timestamp: Date.now()
    };
    const updatedProjects = [newProject, ...projects];
    setProjects(updatedProjects);
    localStorage.setItem('zerocode_projects', JSON.stringify(updatedProjects));
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3000);
  };

  const loadProject = (project: Project) => {
    setFrames(project.data.frames || []);
    setElements(project.data.elements || []);
    setConnections(project.data.connections || []);
    setCanvasTransform(project.data.canvasTransform || { x: 0, y: 0, scale: 1 });
    setSelectedId(null);
    setSelectedFrameId(null);
    updateHistory({
      frames: project.data.frames || [],
      elements: project.data.elements || [],
      connections: project.data.connections || [],
      canvasTransform: project.data.canvasTransform || { x: 0, y: 0, scale: 1 }
    });
  };

  const deleteProject = (id: string) => {
    const updatedProjects = projects.filter(p => p.id !== id);
    setProjects(updatedProjects);
    localStorage.setItem('zerocode_projects', JSON.stringify(updatedProjects));
  };

  const handleClearCanvas = () => {
    setFrames([]);
    setElements([]);
    setConnections([]);
    setCanvasTransform({ x: 0, y: 0, scale: 1 });
    setSelectedId(null);
    setSelectedFrameId(null);
    updateHistory({ frames: [], elements: [], connections: [], canvasTransform: { x: 0, y: 0, scale: 1 } });
    setShowClearConfirm(false);
  };

  const applyColor = (color: string) => {
    if (!selectedId) return;
    const element = elements.find(el => el.id === selectedId);
    if (!element) return;

    let updates: any = {};
    if (element.type === 'text') {
      updates = { color };
    } else if (element.type === 'button') {
      updates = { backgroundColor: color };
    } else {
      updates = { backgroundColor: color };
    }
    
    updateElement(selectedId, { styles: { ...element.styles, ...updates } });
  };

  const addPaletteColor = (color: string) => {
    if (palette.colors.includes(color)) return;
    setPalette({
      ...palette,
      colors: [...palette.colors, color]
    });
  };

  // History Management
  const historyRef = useRef<HistoryManager>(new HistoryManager({ frames: [], elements: [], connections: [], canvasTransform: { x: 0, y: 0, scale: 1 } }));
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const updateHistory = useCallback((layout: WebsiteLayout) => {
    historyRef.current.push(layout);
    setCanUndo(historyRef.current.canUndo());
    setCanRedo(historyRef.current.canRedo());
  }, []);

  const handleUndo = useCallback(() => {
    const prevState = historyRef.current.undo();
    if (prevState) {
      setFrames(prevState.frames);
      setElements(prevState.elements);
      setConnections(prevState.connections);
      setCanvasTransform(prevState.canvasTransform);
      setCanUndo(historyRef.current.canUndo());
      setCanRedo(historyRef.current.canRedo());
    }
  }, []);

  const handleRedo = useCallback(() => {
    const nextState = historyRef.current.redo();
    if (nextState) {
      setFrames(nextState.frames);
      setElements(nextState.elements);
      setConnections(nextState.connections);
      setCanvasTransform(nextState.canvasTransform);
      setCanUndo(historyRef.current.canUndo());
      setCanRedo(historyRef.current.canRedo());
    }
  }, []);

  const addElement = (type: ElementType, config?: Partial<WebsiteElement>) => {
    // If no frame exists, show frame modal
    if (frames.length === 0) {
      setShowFrameModal(true);
      return;
    }

    const targetFrameId = config?.frameId || selectedFrameId || frames[0].id;

    let newElement: WebsiteElement = {
      id: Math.random().toString(36).substr(2, 9),
      frameId: targetFrameId,
      type,
      content: '',
      styles: {
        top: config?.styles?.top ?? 50,
        left: config?.styles?.left ?? 50,
        width: config?.styles?.width ?? (type === 'section' || type === 'navbar' || type === 'footer' || type === 'hero' ? 800 : 300),
        height: config?.styles?.height ?? (type === 'section' || type === 'hero' ? 400 : type === 'navbar' || type === 'footer' ? 80 : 200),
        textAlign: 'center',
        padding: type === 'section' ? '4rem 2rem' : '1rem',
        borderRadius: '1rem',
      },
      ...config,
    };

    // Merge styles if config has them
    if (config?.styles) {
      newElement.styles = { ...newElement.styles, ...config.styles };
    }

    switch (type) {
      case 'text':
        newElement.content = newElement.content || 'New Text Element';
        newElement.styles.fontSize = newElement.styles.fontSize || '2rem';
        newElement.styles.color = newElement.styles.color || 'var(--primary)';
        break;
      case 'button':
        newElement.content = newElement.content || 'Click Me';
        newElement.styles.backgroundColor = newElement.styles.backgroundColor || 'var(--primary)';
        newElement.styles.color = newElement.styles.color || '#ffffff';
        break;
      case 'image':
        newElement.imageUrl = newElement.imageUrl || 'https://picsum.photos/seed/zerocode/800/400';
        newElement.styles.padding = '0px';
        break;
      case 'shape':
        newElement.shapeType = newElement.shapeType || 'rectangle';
        newElement.styles.width = newElement.styles.width || 200;
        newElement.styles.height = newElement.styles.height || 200;
        newElement.styles.backgroundColor = newElement.styles.backgroundColor || '#3b82f6';
        if (newElement.shapeType === 'circle') newElement.styles.borderRadius = '50%';
        else if (newElement.shapeType === 'rounded-rectangle') newElement.styles.borderRadius = '2rem';
        else newElement.styles.borderRadius = '0px';
        break;
      case 'navbar':
        newElement.title = newElement.title || 'ZEROCODE';
        newElement.links = newElement.links || [
          { label: 'Home', url: '#' },
          { label: 'About', url: '#' },
          { label: 'Contact', url: '#' },
        ];
        newElement.buttonText = newElement.buttonText || 'Get Started';
        newElement.styles.padding = newElement.styles.padding || '1rem 2rem';
        newElement.styles.backgroundColor = newElement.styles.backgroundColor || 'var(--background)';
        newElement.styles.borderBottom = newElement.styles.borderBottom || '1px solid rgba(255,255,255,0.1)';
        break;
      case 'footer':
        newElement.title = newElement.title || 'ZEROCODE';
        newElement.content = newElement.content || '© 2026 ZEROCODE Web. All rights reserved.';
        newElement.links = newElement.links || [
          { label: 'Privacy', url: '#' },
          { label: 'Terms', url: '#' },
          { label: 'Twitter', url: '#' },
        ];
        newElement.styles.padding = newElement.styles.padding || '4rem 2rem';
        newElement.styles.backgroundColor = newElement.styles.backgroundColor || 'var(--background)';
        newElement.styles.borderTop = newElement.styles.borderTop || '1px solid rgba(255,255,255,0.1)';
        break;
      case 'card':
        newElement.title = newElement.title || 'Premium Product';
        newElement.description = newElement.description || 'Experience the future of web design with our AI-powered builder.';
        newElement.buttonText = newElement.buttonText || 'Learn More';
        newElement.imageUrl = newElement.imageUrl || 'https://picsum.photos/seed/card/400/300';
        newElement.styles.backgroundColor = newElement.styles.backgroundColor || 'rgba(255,255,255,0.05)';
        newElement.styles.padding = newElement.styles.padding || '0';
        newElement.styles.width = newElement.styles.width || 350;
        break;
      case 'form':
        newElement.title = newElement.title || 'Contact Us';
        newElement.description = newElement.description || 'Send us a message and we will get back to you soon.';
        newElement.buttonText = newElement.buttonText || 'Send Message';
        newElement.styles.padding = newElement.styles.padding || '3rem';
        newElement.styles.backgroundColor = newElement.styles.backgroundColor || 'rgba(255,255,255,0.05)';
        newElement.styles.width = newElement.styles.width || 500;
        newElement.styles.maxWidth = newElement.styles.maxWidth || '500px';
        newElement.styles.margin = newElement.styles.margin || '0 auto';
        break;
      case 'hero':
        newElement.title = newElement.title || 'Build Your Dream Website';
        newElement.description = newElement.description || 'The most powerful AI-driven website builder for modern creators and startups.';
        newElement.buttonText = newElement.buttonText || 'Start Building Free';
        newElement.styles.padding = newElement.styles.padding || '8rem 2rem';
        newElement.styles.textAlign = newElement.styles.textAlign || 'center';
        newElement.styles.backgroundColor = newElement.styles.backgroundColor || 'var(--background)';
        break;
      case 'section':
        newElement.styles.backgroundColor = newElement.styles.backgroundColor || 'var(--background)';
        break;
      case 'table':
        newElement.styles.width = newElement.styles.width || 400;
        newElement.styles.height = newElement.styles.height || 200;
        newElement.styles.backgroundColor = newElement.styles.backgroundColor || 'transparent';
        newElement.styles.padding = '0px';
        if (!newElement.tableData) {
          const rows = 2;
          const cols = 2;
          newElement.tableData = {
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
        break;
    }

    const newElements = [...elements, newElement];
    setElements(newElements);
    setSelectedId(newElement.id);
    setSelectedFrameId(targetFrameId);
    updateHistory({ frames, elements: newElements, connections, canvasTransform });
  };

  const addFrame = (config?: Partial<Frame>) => {
    const newFrame: Frame = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Frame ${frames.length + 1}`,
      position: {
        left: config?.position?.left ?? (frames.length * 1000),
        top: config?.position?.top ?? 0,
      },
      size: {
        width: config?.size?.width ?? 600,
        height: config?.size?.height ?? 600,
      },
      background: config?.background ?? '#ffffff',
    };
    const newFrames = [...frames, newFrame];
    setFrames(newFrames);
    setSelectedFrameId(newFrame.id);
    setSelectedId(null);
    updateHistory({ frames: newFrames, elements, connections, canvasTransform });
    setShowFrameModal(false);
  };

  const updateFrame = (id: string, updates: Partial<Frame>) => {
    const newFrames = frames.map(f => f.id === id ? { ...f, ...updates } : f);
    setFrames(newFrames);
    updateHistory({ frames: newFrames, elements, connections, canvasTransform });
  };

  const deleteFrame = (id: string) => {
    const newFrames = frames.filter(f => f.id !== id);
    const newElements = elements.filter(el => el.frameId !== id);
    const newConnections = connections.filter(c => c.from !== id && c.to !== id && !newElements.find(el => el.id === c.from || el.id === c.to));
    setFrames(newFrames);
    setElements(newElements);
    setConnections(newConnections);
    if (selectedFrameId === id) setSelectedFrameId(null);
    updateHistory({ frames: newFrames, elements: newElements, connections: newConnections, canvasTransform });
  };

  const addConnection = (from: string, to: string) => {
    const newConnection: Connection = {
      id: Math.random().toString(36).substr(2, 9),
      from,
      to,
    };
    const newConnections = [...connections, newConnection];
    
    // Update linkTo on the source element
    const newElements = elements.map(el => 
      el.id === from ? { ...el, linkTo: to } : el
    );
    
    setConnections(newConnections);
    setElements(newElements);
    updateHistory({ frames, elements: newElements, connections: newConnections, canvasTransform });
  };

  const startLinking = (sourceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLinkingSourceId(sourceId);
    setLinkingMousePos({ x: e.clientX, y: e.clientY });
  };

  const updateLinking = (e: MouseEvent) => {
    if (linkingSourceId) {
      setLinkingMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const endLinking = (targetId: string) => {
    if (linkingSourceId && targetId !== linkingSourceId) {
      addConnection(linkingSourceId, targetId);
    }
    setLinkingSourceId(null);
    setLinkingMousePos(null);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      updateLinking(e);
    };
    const handleMouseUp = () => {
      if (linkingSourceId) {
        setLinkingSourceId(null);
        setLinkingMousePos(null);
      }
    };

    if (linkingSourceId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [linkingSourceId]);

  const handleElementClick = (elementId: string) => {
    if (isSimplePreview) {
      const element = elements.find(el => el.id === elementId);
      if (element?.linkTo) {
        // If linkTo is a frame, use it. If it's an element, find its frame.
        const targetFrame = frames.find(f => f.id === element.linkTo);
        if (targetFrame) {
          setCurrentPreviewFrameId(element.linkTo);
        } else {
          const targetElement = elements.find(el => el.id === element.linkTo);
          if (targetElement) {
            setCurrentPreviewFrameId(targetElement.frameId);
          }
        }
      } else {
        // Fallback to connections array for legacy support
        const connection = connections.find(c => c.from === elementId);
        if (connection) {
          const targetFrame = frames.find(f => f.id === connection.to);
          if (targetFrame) {
            setCurrentPreviewFrameId(connection.to);
          } else {
            const targetElement = elements.find(el => el.id === connection.to);
            if (targetElement) {
              setCurrentPreviewFrameId(targetElement.frameId);
            }
          }
        }
      }
    } else {
      setSelectedId(elementId);
      const element = elements.find(el => el.id === elementId);
      if (element) setSelectedFrameId(element.frameId);
    }
  };

  const deleteConnection = (id: string) => {
    const connection = connections.find(c => c.id === id);
    const newConnections = connections.filter(c => c.id !== id);
    
    let newElements = elements;
    if (connection) {
      newElements = elements.map(el => 
        el.id === connection.from ? { ...el, linkTo: undefined } : el
      );
    }
    
    setConnections(newConnections);
    setElements(newElements);
    updateHistory({ frames, elements: newElements, connections: newConnections, canvasTransform });
  };

  const updateElement = (id: string, updates: Partial<WebsiteElement>) => {
    const newElements = elements.map((el) => (el.id === id ? { ...el, ...updates } : el));
    setElements(newElements);
    // We don't update history on every keystroke, maybe on blur or after a delay
    // For now, let's update it for simplicity, but in a real app we'd debounce this
  };

  // Debounced history update for style changes
  const lastHistoryUpdate = useRef<number>(0);
  useEffect(() => {
    const now = Date.now();
    if (now - lastHistoryUpdate.current > 500) {
      updateHistory({ frames, elements, connections, canvasTransform });
      lastHistoryUpdate.current = now;
    }
  }, [frames, elements, connections, canvasTransform, updateHistory]);

  const deleteElement = useCallback((id: string) => {
    const newElements = elements.filter((el) => el.id !== id);
    setElements(newElements);
    if (selectedId === id) setSelectedId(null);
    updateHistory({ frames, elements: newElements, connections, canvasTransform });
  }, [frames, elements, connections, canvasTransform, selectedId, updateHistory]);

  const duplicateElement = useCallback((id: string) => {
    const elementToDuplicate = elements.find(el => el.id === id);
    if (!elementToDuplicate) return;

    const duplicatedElement: WebsiteElement = {
      ...JSON.parse(JSON.stringify(elementToDuplicate)),
      id: Math.random().toString(36).substr(2, 9),
    };
    
    const index = elements.findIndex(el => el.id === id);
    const newElements = [...elements];
    newElements.splice(index + 1, 0, duplicatedElement);
    
    setElements(newElements);
    setSelectedId(duplicatedElement.id);
    updateHistory({ frames, elements: newElements, connections, canvasTransform });
  }, [frames, elements, connections, canvasTransform, updateHistory]);

  const handleCopy = useCallback(() => {
    const element = elements.find(el => el.id === selectedId);
    if (element) {
      setClipboard(JSON.parse(JSON.stringify(element)));
    }
  }, [elements, selectedId]);

  const handlePaste = useCallback(() => {
    if (!clipboard) return;

    const pastedElement: WebsiteElement = {
      ...JSON.parse(JSON.stringify(clipboard)),
      id: Math.random().toString(36).substr(2, 9),
    };

    const newElements = [...elements, pastedElement];
    setElements(newElements);
    setSelectedId(pastedElement.id);
    updateHistory({ frames, elements: newElements, connections, canvasTransform });
  }, [frames, elements, connections, canvasTransform, clipboard, updateHistory]);

  const moveElement = (id: string, direction: 'up' | 'down') => {
    const index = elements.findIndex((el) => el.id === id);
    if (index === -1) return;
    
    const newElements = [...elements];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= elements.length) return;
    
    [newElements[index], newElements[newIndex]] = [newElements[newIndex], newElements[index]];
    setElements(newElements);
    updateHistory({ frames, elements: newElements, connections, canvasTransform });
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) handleRedo();
            else handleUndo();
            break;
          case 'y':
            e.preventDefault();
            handleRedo();
            break;
          case 'c':
            if (selectedId) {
              if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                e.preventDefault();
                handleCopy();
              }
            }
            break;
          case 'v':
            if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
              e.preventDefault();
              handlePaste();
            }
            break;
          case 'd':
            if (selectedId) {
              e.preventDefault();
              duplicateElement(selectedId);
            }
            break;
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          if (selectedId) {
            e.preventDefault();
            deleteElement(selectedId);
          } else if (selectedFrameId) {
            e.preventDefault();
            deleteFrame(selectedFrameId);
          }
        }
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          const step = e.shiftKey ? 10 : 1;
          if (selectedId) {
            e.preventDefault();
            const element = elements.find(el => el.id === selectedId);
            if (element) {
              const updates: any = { styles: { ...element.styles } };
              if (e.key === 'ArrowUp') updates.styles.top = element.styles.top - step;
              if (e.key === 'ArrowDown') updates.styles.top = element.styles.top + step;
              if (e.key === 'ArrowLeft') updates.styles.left = element.styles.left - step;
              if (e.key === 'ArrowRight') updates.styles.left = element.styles.left + step;
              updateElement(selectedId, updates);
            }
          } else if (selectedFrameId) {
            e.preventDefault();
            const frame = frames.find(f => f.id === selectedFrameId);
            if (frame) {
              const updates: any = { position: { ...frame.position } };
              if (e.key === 'ArrowUp') updates.position.top = frame.position.top - step;
              if (e.key === 'ArrowDown') updates.position.top = frame.position.top + step;
              if (e.key === 'ArrowLeft') updates.position.left = frame.position.left - step;
              if (e.key === 'ArrowRight') updates.position.left = frame.position.left + step;
              updateFrame(selectedFrameId, updates);
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, selectedFrameId, elements, frames, handleUndo, handleRedo, handleCopy, handlePaste, deleteElement, deleteFrame, duplicateElement, updateElement, updateFrame]);

  const validateLinks = () => {
    const frameIds = new Set(frames.map(f => f.id));
    const elementIds = new Set(elements.map(el => el.id));
    let hasChanges = false;
    
    const validatedElements = elements.map(el => {
      if (el.linkTo && !frameIds.has(el.linkTo) && !elementIds.has(el.linkTo)) {
        hasChanges = true;
        return { ...el, linkTo: undefined };
      }
      return el;
    });

    const validatedConnections = connections.filter(c => 
      (frameIds.has(c.to) || elementIds.has(c.to)) && elements.some(el => el.id === c.from)
    );

    if (validatedConnections.length !== connections.length) {
      hasChanges = true;
    }

    if (hasChanges) {
      setElements(validatedElements);
      setConnections(validatedConnections);
    }
    
    return { elements: validatedElements, connections: validatedConnections };
  };

  const handlePreview = async () => {
    setIsPreviewOpen(true);
    setIsGenerating(true);
    setGenerationError(null);
    const { elements: validatedElements, connections: validatedConnections } = validateLinks();
    try {
      const code = await generateWebsiteCode({
        frames,
        elements: validatedElements,
        connections: validatedConnections,
        canvasTransform
      });
      setGeneratedCode(code);
    } catch (error) {
      console.error("Failed to generate code:", error);
      setGenerationError(error instanceof Error ? error.message : "An unexpected error occurred during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async () => {
    setIsGenerating(true);
    const { elements: validatedElements, connections: validatedConnections } = validateLinks();
    try {
      const code = await generateWebsiteCode({
        frames,
        elements: validatedElements,
        connections: validatedConnections,
        canvasTransform
      });
      const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My ZEROCODE Website</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      body { margin: 0; padding: 0; font-family: sans-serif; overflow-x: hidden; scroll-behavior: smooth; }
      ${code.css}
    </style>
</head>
<body>
    ${code.html}
    <script>${code.js}</script>
</body>
</html>`;
      
      const blob = new Blob([fullHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'zerocode-website.html';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    // Open a new tab immediately to bypass popup blockers
    const netlifyWindow = window.open('about:blank', '_blank');
    if (netlifyWindow) {
      netlifyWindow.document.write('<div style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #09090b; color: #10b981;"><h2>Generating your website... Please wait.</h2></div>');
    }

    const { elements: validatedElements, connections: validatedConnections } = validateLinks();
    try {
      const code = await generateWebsiteCode({
        frames,
        elements: validatedElements,
        connections: validatedConnections,
        canvasTransform
      });
      const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My ZEROCODE Website</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      body { margin: 0; padding: 0; font-family: sans-serif; overflow-x: hidden; scroll-behavior: smooth; }
      ${code.css}
    </style>
</head>
<body>
    ${code.html}
    <script>${code.js}</script>
</body>
</html>`;
      
      const blob = new Blob([fullHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'index.html';
      a.click();
      URL.revokeObjectURL(url);

      // Redirect the opened tab to Netlify
      if (netlifyWindow) {
        netlifyWindow.location.href = 'https://app.netlify.com/drop';
      } else {
        window.open('https://app.netlify.com/drop', '_blank');
      }

      setTimeout(() => {
        alert("Upload the downloaded file to Netlify to publish your website");
      }, 500);
    } catch (error) {
      if (netlifyWindow) netlifyWindow.close();
      console.error("Failed to publish:", error);
      alert("Failed to generate website for publishing.");
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedElement = elements.find((el) => el.id === selectedId) || null;

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30">
      <Navbar 
        onPreview={handlePreview} 
        onPublish={handlePublish}
        onSave={saveProject}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onDelete={() => selectedId && deleteElement(selectedId)}
        onDuplicate={() => selectedId && duplicateElement(selectedId)}
        onCopy={handleCopy}
        onPaste={handlePaste}
        canUndo={canUndo}
        canRedo={canRedo}
        hasSelection={!!selectedId}
        isGenerating={isGenerating}
        isSimplePreview={isSimplePreview}
        onToggleSimplePreview={() => setIsSimplePreview(!isSimplePreview)}
      />
      
      <div className="flex-1 flex overflow-hidden relative">
        {!isFullScreenPreview && (
          <Sidebar 
            onAddElement={addElement}
            onAddFrame={() => addFrame()}
            projects={projects}
            onLoadProject={loadProject}
            onDeleteProject={deleteProject}
            palette={palette}
            onApplyColor={(color) => {
              if (selectedId) {
                const el = elements.find(e => e.id === selectedId);
                if (el) {
                  updateElement(selectedId, {
                    styles: { ...el.styles, backgroundColor: color }
                  });
                }
              } else if (selectedFrameId) {
                updateFrame(selectedFrameId, { background: color });
              }
            }}
            onAddColor={addPaletteColor}
          />
        )}
        
        <div className="flex-1 relative flex flex-col">
          {/* External UI Layer for Clear Button */}
          {!isFullScreenPreview && (frames.length > 0 || elements.length > 0) && (
            <div className="absolute top-4 right-4 z-50">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowClearConfirm(true)}
                className="p-3 rounded-xl bg-zinc-900/80 backdrop-blur-md border border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-500/30 transition-all shadow-xl"
                title="Clear Canvas"
              >
                <Trash2 size={18} />
              </motion.button>
            </div>
          )}

          <Workspace 
            frames={frames}
            elements={elements}
            connections={connections}
            canvasTransform={canvasTransform}
            selectedId={selectedId}
            selectedFrameId={selectedFrameId}
            tool={tool}
            onSelect={setSelectedId}
            onSelectFrame={setSelectedFrameId}
            onUpdateFrame={updateFrame}
            onDeleteFrame={deleteFrame}
            onUpdateElement={updateElement}
            onDeleteElement={deleteElement}
            onAddElement={addElement}
            onAddFrame={addFrame}
            onUpdateCanvasTransform={(updates) => setCanvasTransform(prev => ({ ...prev, ...updates }))}
            onSetTool={setTool}
            onStartLinking={startLinking}
            onEndLinking={endLinking}
            onDeleteConnection={deleteConnection}
            linkingSourceId={linkingSourceId}
            linkingMousePos={linkingMousePos}
            isSimplePreview={isSimplePreview}
            currentPreviewFrameId={currentPreviewFrameId}
            onElementClick={handleElementClick}
          />
        </div>
        
        <AnimatePresence>
          {(selectedId || selectedFrameId) && !isFullScreenPreview && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <PropertiesPanel 
                element={elements.find(el => el.id === selectedId) || null}
                frame={frames.find(f => f.id === selectedFrameId) || null}
                onUpdateElement={updateElement}
                onUpdateFrame={updateFrame}
                onDelete={() => {
                  if (selectedId) deleteElement(selectedId);
                  else if (selectedFrameId) deleteFrame(selectedFrameId);
                }}
                onClose={() => {
                  setSelectedId(null);
                  setSelectedFrameId(null);
                }}
                onOpenAIModal={() => setIsAIModalOpen(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Frame Creation Modal */}
      <AnimatePresence>
        {showFrameModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
                    <Layout size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Create Frame</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">Start with a canvas for your design</p>
                  </div>
                </div>
                <button onClick={() => setShowFrameModal(false)} className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-500 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <button 
                  onClick={() => addFrame({ size: { width: 600, height: 600 }, name: 'Square' })}
                  className="flex flex-col items-center gap-4 p-6 rounded-[2rem] bg-zinc-800/50 border border-zinc-700 hover:border-emerald-500/50 hover:bg-zinc-800 transition-all group"
                >
                  <div className="p-4 rounded-2xl bg-zinc-900 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-colors">
                    <Monitor size={32} />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-white">Square</div>
                    <div className="text-[10px] text-zinc-500 mt-1">600 x 600</div>
                  </div>
                </button>
                <button 
                  onClick={() => addFrame({ size: { width: 375, height: 812 }, name: 'Mobile' })}
                  className="flex flex-col items-center gap-4 p-6 rounded-[2rem] bg-zinc-800/50 border border-zinc-700 hover:border-emerald-500/50 hover:bg-zinc-800 transition-all group"
                >
                  <div className="p-4 rounded-2xl bg-zinc-900 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-colors">
                    <Rocket size={32} />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-white">Mobile</div>
                    <div className="text-[10px] text-zinc-500 mt-1">375 x 812</div>
                  </div>
                </button>
              </div>

              <button 
                onClick={() => addFrame()}
                className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
              >
                Custom Frame
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <PreviewModal 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        onExport={handleExport}
        generatedCode={generatedCode}
        isGenerating={isGenerating}
        error={generationError}
      />

      <AIImageModal 
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onSelectImage={(imageUrl) => {
          if (selectedId) {
            const element = elements.find(el => el.id === selectedId);
            if (element) {
              if (element.type === 'image' || element.type === 'card') {
                updateElement(selectedId, { imageUrl });
              } else {
                updateElement(selectedId, { imageUrl: imageUrl });
              }
            }
          }
          setIsAIModalOpen(false);
        }}
      />

      {/* Publish Success Modal */}
      <AnimatePresence>
        {showPublishModal && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[200]"
          >
            <div className="bg-emerald-500 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 border border-emerald-400/50">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div className="font-black text-lg leading-none">Website Published!</div>
                <div className="text-emerald-100 text-xs font-bold uppercase tracking-widest mt-1">Live on ZEROCODE Cloud</div>
              </div>
              <button onClick={() => setShowPublishModal(false)} className="ml-4 p-1 hover:bg-white/10 rounded-lg">
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Success Modal */}
      <AnimatePresence>
        {showSaveToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[200]"
          >
            <div className="bg-zinc-900 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 border border-zinc-800">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Save size={20} />
              </div>
              <div>
                <div className="font-black text-lg leading-none">Project Saved!</div>
                <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Stored in Local Storage</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClearConfirm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl max-w-md w-full"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Clear Canvas?</h3>
                  <p className="text-zinc-400 text-sm">This will remove all elements permanently.</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-300 font-bold hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearCanvas}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  Clear All
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              opacity: Math.random() * 0.3
            }}
            animate={{ 
              y: [null, Math.random() * -100],
              opacity: [null, 0]
            }}
            transition={{ 
              duration: Math.random() * 10 + 5, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute w-1 h-1 bg-emerald-500 rounded-full"
          />
        ))}
      </div>
    </div>
  );
}
