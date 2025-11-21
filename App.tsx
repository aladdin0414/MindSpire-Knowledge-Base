import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Book, Plus, FolderPlus, FilePlus, Save, Sparkles, 
  Menu, ChevronLeft, Settings, Search, Check, Globe
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { KnowledgeBase, FileSystemItem, ItemType, AIAction, Language, Theme } from './types';
import { FileTree } from './components/FileTree';
import { Button } from './components/Button';
import { Modal } from './components/Modal';
import { SettingsModal } from './components/SettingsModal';
import { generateAIContent } from './services/geminiService';

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

// --- Translations ---
const TRANSLATIONS = {
  en: {
    welcomeTitle: "Welcome to MindSpire",
    welcomeSubtitle: "Select or create a Knowledge Base to begin.",
    noFileSelected: "Select a file to start writing",
    noFileSubtitle: "or create a new one from the sidebar",
    preview: "Preview",
    edit: "Edit",
    improve: "Improve",
    fixGrammar: "Fix Grammar",
    continue: "Continue",
    aiWriting: "AI is writing...",
    file: "File",
    folder: "Folder",
    createKb: "Create Knowledge Base",
    name: "Name",
    cancel: "Cancel",
    create: "Create",
    renameItem: "Rename Item",
    newName: "New Name",
    rename: "Rename",
    deleteConfirm: "Are you sure you want to delete this item?",
    createInside: "Creating inside:",
    sibling: "(sibling)",
    unknown: "Unknown",
    unsaved: "Unsaved",
    folderEmpty: "Folder empty. Create a file!",
    renameTooltip: "Rename",
    deleteTooltip: "Delete",
    kbNamePlaceholder: "e.g., Engineering Docs",
    fileNamePlaceholder: "e.g., Getting Started",
    folderNamePlaceholder: "e.g., Resources",
    summaryPrefix: "Summary",
    aiError: "AI Generation failed. Check console.",
    // Settings
    settings: "Settings",
    language: "Language",
    appearance: "Appearance",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    system: "System",
    editor: "Editor",
    autoSave: "Auto Save",
    autoSaveDesc: "Automatically save changes while typing",
  },
  zh: {
    welcomeTitle: "欢迎使用 MindSpire",
    welcomeSubtitle: "选择或创建一个知识库以开始。",
    noFileSelected: "选择一个文件开始写作",
    noFileSubtitle: "或从侧边栏创建一个新文件",
    preview: "预览",
    edit: "编辑",
    improve: "优化",
    fixGrammar: "修复语法",
    continue: "续写",
    aiWriting: "AI 正在写作...",
    file: "文件",
    folder: "文件夹",
    createKb: "创建知识库",
    name: "名称",
    cancel: "取消",
    create: "创建",
    renameItem: "重命名项目",
    newName: "新名称",
    rename: "重命名",
    deleteConfirm: "您确定要删除此项目吗？",
    createInside: "创建于：",
    sibling: "(同级)",
    unknown: "未知",
    unsaved: "未保存",
    folderEmpty: "文件夹为空。请创建文件！",
    renameTooltip: "重命名",
    deleteTooltip: "删除",
    kbNamePlaceholder: "例如：工程文档",
    fileNamePlaceholder: "例如：快速开始",
    folderNamePlaceholder: "例如：资源",
    summaryPrefix: "总结",
    aiError: "AI 生成失败。请检查控制台。",
    // Settings
    settings: "设置",
    language: "语言",
    appearance: "外观",
    theme: "主题",
    light: "亮色",
    dark: "暗色",
    system: "跟随系统",
    editor: "编辑器",
    autoSave: "自动保存",
    autoSaveDesc: "输入时自动保存更改",
  }
};

// --- Seed Data ---
const SEED_KBS: KnowledgeBase[] = [
  {
    id: 'kb-eng',
    name: 'Engineering Guide',
    description: 'Technical documentation and standards',
    createdAt: Date.now()
  },
  {
    id: 'kb-product',
    name: 'Product Roadmap',
    description: 'Future plans and feature specs',
    createdAt: Date.now()
  },
  {
    id: 'kb-notes',
    name: 'Meeting Notes',
    description: 'Internal meeting records',
    createdAt: Date.now()
  }
];

const SEED_ITEMS: FileSystemItem[] = [
  // KB 1: Engineering Guide
  { id: 'f-eng-1', kbId: 'kb-eng', parentId: null, type: ItemType.FOLDER, name: 'Onboarding', order: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'doc-eng-1', kbId: 'kb-eng', parentId: 'f-eng-1', type: ItemType.FILE, name: 'Setup Environment', content: '# Environment Setup\n\n## Prerequisites\n\n- Node.js v18+\n- Docker\n- VS Code\n\n## Installation\n\n```bash\nnpm install\nnpm start\n```', order: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'doc-eng-2', kbId: 'kb-eng', parentId: 'f-eng-1', type: ItemType.FILE, name: 'Key Contacts', content: '# Key Contacts\n\n| Role | Name | Email |\n|------|------|-------|\n| CTO | Sarah | sarah@example.com |\n| Lead | Mike | mike@example.com |', order: 1, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'f-eng-2', kbId: 'kb-eng', parentId: null, type: ItemType.FOLDER, name: 'Best Practices', order: 1, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'doc-eng-3', kbId: 'kb-eng', parentId: 'f-eng-2', type: ItemType.FILE, name: 'React Patterns', content: '# React Patterns\n\nWe prefer functional components and hooks.\n\n## Custom Hooks\n\nAlways prefix with `use`.\n\n```typescript\nconst useUser = () => { ... }\n```', order: 0, createdAt: Date.now(), updatedAt: Date.now() },

  // KB 2: Product Roadmap
  { id: 'f-prod-1', kbId: 'kb-product', parentId: null, type: ItemType.FOLDER, name: '2024 Q1', order: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'doc-prod-1', kbId: 'kb-product', parentId: 'f-prod-1', type: ItemType.FILE, name: 'Features List', content: '# Q1 Features\n\n1. **Dark Mode**: Support system preference.\n2. **Mobile App**: Beta release.\n3. **API v2**: GraphQL support.', order: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'f-prod-2', kbId: 'kb-product', parentId: null, type: ItemType.FOLDER, name: 'Ideas', order: 1, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'doc-prod-2', kbId: 'kb-product', parentId: 'f-prod-2', type: ItemType.FILE, name: 'Backlog', content: '# Backlog\n\n- [ ] User avatars\n- [ ] Social login\n- [ ] Export to PDF', order: 0, createdAt: Date.now(), updatedAt: Date.now() },

  // KB 3: Meeting Notes
  { id: 'f-meet-1', kbId: 'kb-notes', parentId: null, type: ItemType.FOLDER, name: 'Weekly Sync', order: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'doc-meet-1', kbId: 'kb-notes', parentId: 'f-meet-1', type: ItemType.FILE, name: '2023-10-01', content: '# Sync 2023-10-01\n\n## Attendees\n\n- All team\n\n## Updates\n\n- Project X is 80% complete.\n- Need more design resources.', order: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'doc-meet-2', kbId: 'kb-notes', parentId: null, type: ItemType.FILE, name: 'All Hands', content: '# All Hands Meeting\n\n**Date**: Monthly\n\n## Agenda\n\n1. Company Metrics\n2. Team Shoutouts\n3. Q&A', order: 1, createdAt: Date.now(), updatedAt: Date.now() },
];

const App: React.FC = () => {
  // --- State ---
  const [language, setLanguage] = useState<Language>('zh');
  const [theme, setTheme] = useState<Theme>('light');
  const [autoSave, setAutoSave] = useState(true);
  
  const [kbs, setKbs] = useState<KnowledgeBase[]>([]);
  const [items, setItems] = useState<FileSystemItem[]>([]);
  const [activeKbId, setActiveKbId] = useState<string | null>(null);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  
  // Tree State
  const [selectedTreeItemId, setSelectedTreeItemId] = useState<string | null>(null);
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(new Set());
  
  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Modals
  const [isKbModalOpen, setIsKbModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [itemModalType, setItemModalType] = useState<ItemType>(ItemType.FILE);
  const [newItemName, setNewItemName] = useState("");
  const [newKbName, setNewKbName] = useState("");
  
  // Rename State
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [itemToRename, setItemToRename] = useState<FileSystemItem | null>(null);

  const t = TRANSLATIONS[language];

  // --- Initialization ---
  useEffect(() => {
    // Load Settings
    const storedLang = localStorage.getItem('mindspire_lang') as Language | null;
    if (storedLang && (storedLang === 'en' || storedLang === 'zh')) {
      setLanguage(storedLang);
    }

    const storedTheme = localStorage.getItem('mindspire_theme') as Theme | null;
    if (storedTheme) setTheme(storedTheme);

    const storedAutoSave = localStorage.getItem('mindspire_autosave');
    if (storedAutoSave !== null) setAutoSave(storedAutoSave === 'true');

    // Load Data
    const storedKbs = localStorage.getItem('mindspire_kbs');
    const storedItems = localStorage.getItem('mindspire_items');
    
    let kbsToSet = [];
    if (storedKbs && JSON.parse(storedKbs).length > 0) {
      kbsToSet = JSON.parse(storedKbs);
      setKbs(kbsToSet);
    } else {
      kbsToSet = SEED_KBS;
      setKbs(SEED_KBS);
    }

    if (storedItems && JSON.parse(storedItems).length > 0) {
      setItems(JSON.parse(storedItems));
    } else {
      setItems(SEED_ITEMS);
    }

    // Auto select first KB if none selected and we have KBs
    if (!activeKbId && kbsToSet.length > 0) {
      setActiveKbId(kbsToSet[0].id);
    }
  }, []);

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('mindspire_kbs', JSON.stringify(kbs));
  }, [kbs]);

  useEffect(() => {
    localStorage.setItem('mindspire_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('mindspire_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('mindspire_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('mindspire_autosave', String(autoSave));
  }, [autoSave]);


  // --- Derived State ---
  const activeKb = useMemo(() => kbs.find(k => k.id === activeKbId), [kbs, activeKbId]);
  const activeFile = useMemo(() => items.find(i => i.id === activeFileId), [items, activeFileId]);

  // --- Handlers ---

  const handleCreateKb = () => {
    if (!newKbName.trim()) return;
    const newKb: KnowledgeBase = {
      id: generateId(),
      name: newKbName,
      description: 'New Knowledge Base',
      createdAt: Date.now()
    };
    setKbs([...kbs, newKb]);
    setActiveKbId(newKb.id);
    setActiveFileId(null);
    setSelectedTreeItemId(null);
    setNewKbName("");
    setIsKbModalOpen(false);
  };

  const handleToggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolderIds);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolderIds(newExpanded);
  };

  const handleTreeSelect = (item: FileSystemItem) => {
    setSelectedTreeItemId(item.id);
    if (item.type === ItemType.FILE) {
      setActiveFileId(item.id);
    }
  };

  const handleCreateItem = () => {
    if (!newItemName.trim() || !activeKbId) return;
    
    // Determine parent based on selection
    let parentId: string | null = null;
    
    if (selectedTreeItemId) {
      const selectedItem = items.find(i => i.id === selectedTreeItemId);
      if (selectedItem) {
        if (selectedItem.type === ItemType.FOLDER) {
          parentId = selectedItem.id;
        } else {
          parentId = selectedItem.parentId;
        }
      }
    }

    // Calculate order (last in list)
    const siblings = items.filter(i => i.parentId === parentId && i.kbId === activeKbId);
    const maxOrder = siblings.length > 0 ? Math.max(...siblings.map(i => i.order)) : -1;
    
    const newItem: FileSystemItem = {
      id: generateId(),
      kbId: activeKbId,
      parentId: parentId, 
      type: itemModalType,
      name: newItemName,
      content: itemModalType === ItemType.FILE ? '# ' + newItemName : undefined,
      order: maxOrder + 1,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    setItems([...items, newItem]);
    
    setSelectedTreeItemId(newItem.id);
    
    if (newItem.type === ItemType.FILE) {
      setActiveFileId(newItem.id);
    }

    if (parentId) {
      setExpandedFolderIds(prev => {
        const next = new Set(prev);
        next.add(parentId!);
        return next;
      });
    }

    setNewItemName("");
    setIsItemModalOpen(false);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm(t.deleteConfirm)) {
      const getAllDescendants = (itemId: string): string[] => {
        const children = items.filter(i => i.parentId === itemId);
        let descendants = children.map(c => c.id);
        children.forEach(c => {
          if (c.type === ItemType.FOLDER) {
            descendants = [...descendants, ...getAllDescendants(c.id)];
          }
        });
        return descendants;
      };

      const idsToDelete = [id, ...getAllDescendants(id)];
      
      setItems(prev => prev.filter(i => !idsToDelete.includes(i.id)));
      
      if (activeFileId && idsToDelete.includes(activeFileId)) setActiveFileId(null);
      if (selectedTreeItemId && idsToDelete.includes(selectedTreeItemId)) setSelectedTreeItemId(null);
    }
  };
  
  const handleRenameItem = () => {
    if (!itemToRename || !newItemName.trim()) return;
    
    setItems(prev => prev.map(item => 
      item.id === itemToRename.id 
        ? { ...item, name: newItemName, updatedAt: Date.now() } 
        : item
    ));
    
    setIsRenameModalOpen(false);
    setItemToRename(null);
    setNewItemName("");
  };
  
  const openRenameModal = (item: FileSystemItem) => {
    setItemToRename(item);
    setNewItemName(item.name);
    setIsRenameModalOpen(true);
  };

  const updateFileContent = useCallback((content: string) => {
    if (!activeFileId) return;
    setItems(prev => prev.map(item => 
      item.id === activeFileId 
        ? { ...item, content, updatedAt: Date.now() }
        : item
    ));
    setUnsavedChanges(false);
  }, [activeFileId]);

  // --- Drag and Drop Logic ---
  const handleMoveItem = (draggedId: string, targetId: string | null, position: 'inside' | 'before' | 'after' | 'root') => {
    if (draggedId === targetId) return;

    const draggedItem = items.find(i => i.id === draggedId);
    if (!draggedItem) return;

    // Prevent dragging a folder into its own child (infinite loop)
    if (targetId) {
      let current = items.find(i => i.id === targetId);
      while (current) {
        if (current.id === draggedId) return; // Trying to drop into descendant
        current = current.parentId ? items.find(i => i.id === current.parentId) : undefined;
      }
    }

    setItems(prevItems => {
      let newItems = [...prevItems];
      const itemToMove = newItems.find(i => i.id === draggedId)!;
      
      // Remove item from current position logic (mentally) - we just need to change its properties
      
      if (position === 'root') {
        // Move to root
        itemToMove.parentId = null;
        // Put at the end of root list
        const rootItems = newItems.filter(i => i.kbId === itemToMove.kbId && i.parentId === null && i.id !== draggedId);
        itemToMove.order = rootItems.length > 0 ? Math.max(...rootItems.map(i => i.order)) + 1 : 0;
      } else if (position === 'inside' && targetId) {
        // Move inside folder
        itemToMove.parentId = targetId;
        // Put at the end of target folder
        const folderItems = newItems.filter(i => i.parentId === targetId && i.id !== draggedId);
        itemToMove.order = folderItems.length > 0 ? Math.max(...folderItems.map(i => i.order)) + 1 : 0;
        
        // Ensure folder is expanded
        setExpandedFolderIds(prev => new Set(prev).add(targetId));
      } else if ((position === 'before' || position === 'after') && targetId) {
        const targetItem = newItems.find(i => i.id === targetId)!;
        itemToMove.parentId = targetItem.parentId;
        
        // Get all siblings in the target group (excluding the moved item to avoid dupes during calc)
        const siblings = newItems
          .filter(i => i.parentId === targetItem.parentId && i.id !== draggedId)
          .sort((a, b) => a.order - b.order);
        
        // Find where to insert
        const targetIndex = siblings.findIndex(i => i.id === targetId);
        const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
        
        // Insert item into array
        siblings.splice(insertIndex, 0, itemToMove);
        
        // Reassign orders
        siblings.forEach((sibling, index) => {
          const realItem = newItems.find(i => i.id === sibling.id);
          if (realItem) realItem.order = index;
        });
      }

      return newItems;
    });
  };

  const handleRootDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('application/mindspire-item');
    if (draggedId) {
      // Check if dropping on a valid tree item handled by the tree component
      // If e.target is the container itself, it means we missed all items -> drop to root
      handleMoveItem(draggedId, null, 'root');
    }
  };

  const handleAIAction = async (action: AIAction) => {
    if (!activeFile || !activeFile.content) return;
    setAiLoading(true);
    try {
      const newContent = await generateAIContent(activeFile.content, action, language);
      
      let updatedContent = activeFile.content;
      if (action === AIAction.CONTINUE) {
         updatedContent += '\n\n' + newContent;
      } else if (action === AIAction.IMPROVE || action === AIAction.FIX_GRAMMAR) {
         updatedContent = newContent;
      } else if (action === AIAction.SUMMARIZE) {
         updatedContent = activeFile.content + `\n\n> **${t.summaryPrefix}**: ` + newContent;
      }

      updateFileContent(updatedContent);
    } catch (e) {
      alert(t.aiError);
    } finally {
      setAiLoading(false);
    }
  };

  // --- Render Helpers ---

  const renderEditor = () => {
    if (!activeFile) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
          <div className="bg-slate-100 p-6 rounded-full mb-4">
            <Book size={48} className="text-slate-300" />
          </div>
          <p className="text-lg font-medium">{t.noFileSelected}</p>
          <p className="text-sm">{t.noFileSubtitle}</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        {/* Editor Toolbar */}
        <div className="h-14 border-b border-slate-200 flex items-center justify-between px-6 bg-white shrink-0">
          <div className="flex items-center space-x-4">
            <span className="font-semibold text-lg text-slate-800 truncate max-w-md">{activeFile.name}</span>
            {unsavedChanges && <span className="text-xs text-amber-500 font-medium">{t.unsaved}</span>}
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setPreviewMode(!previewMode)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${previewMode ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {previewMode ? t.edit : t.preview}
            </button>
            <div className="h-6 w-px bg-slate-200 mx-2"></div>
            <Button 
              variant="secondary" 
              size="sm" 
              icon={<Sparkles size={14} />}
              onClick={() => handleAIAction(AIAction.IMPROVE)}
              disabled={aiLoading}
            >
              {t.improve}
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              icon={<Check size={14} />}
              onClick={() => handleAIAction(AIAction.FIX_GRAMMAR)}
              disabled={aiLoading}
            >
              {t.fixGrammar}
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => handleAIAction(AIAction.CONTINUE)}
              disabled={aiLoading}
            >
              {t.continue}
            </Button>
          </div>
        </div>

        {/* Editor/Preview Area */}
        <div className="flex-1 overflow-hidden relative group">
          {previewMode ? (
            <div className="h-full overflow-auto p-8 bg-white markdown-body">
              <ReactMarkdown>{activeFile.content || ''}</ReactMarkdown>
            </div>
          ) : (
            <textarea
              className="w-full h-full resize-none p-8 outline-none font-mono text-sm leading-relaxed text-slate-800 bg-white"
              value={activeFile.content || ''}
              onChange={(e) => {
                updateFileContent(e.target.value);
                setUnsavedChanges(true);
              }}
              placeholder={language === 'en' ? "Start writing..." : "开始写作..."}
            />
          )}
          
          {aiLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-xl border border-slate-100">
                <div className="animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
                <span className="text-indigo-900 font-medium">{t.aiWriting}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar 1: Knowledge Bases */}
      <div className="w-20 bg-slate-900 flex flex-col items-center py-6 space-y-4 shrink-0 z-20">
        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg mb-4">
           <Book className="text-white" size={20} />
        </div>
        
        <div className="flex-1 w-full flex flex-col items-center space-y-3 overflow-y-auto no-scrollbar">
          {kbs.map(kb => (
            <button
              key={kb.id}
              onClick={() => { 
                setActiveKbId(kb.id); 
                setActiveFileId(null); 
                setSelectedTreeItemId(null);
              }}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 group relative ${
                activeKbId === kb.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
              title={kb.name}
            >
              <span className="font-bold text-sm uppercase">{kb.name.substring(0, 2)}</span>
            </button>
          ))}
          
          <button 
            onClick={() => { setNewKbName(""); setIsKbModalOpen(true); }}
            className="w-10 h-10 rounded-lg border-2 border-dashed border-slate-700 text-slate-500 flex items-center justify-center hover:border-indigo-500 hover:text-indigo-500 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>
        
        {/* Settings Toggle */}
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="text-slate-500 hover:text-slate-300 p-2 transition-colors"
          title={t.settings}
        >
          <Settings size={22} />
        </button>
      </div>

      {/* Sidebar 2: File Explorer */}
      {activeKbId && sidebarOpen && (
        <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0 transition-all duration-300">
          <div className="h-14 border-b border-slate-200 flex items-center justify-between px-4">
            <span className="font-semibold text-slate-700 truncate">{activeKb?.name}</span>
             <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-slate-600">
              <ChevronLeft size={18} />
            </button>
          </div>
          
          <div className="p-3 flex space-x-2">
             <Button 
              variant="secondary" 
              size="sm" 
              className="flex-1" 
              icon={<FilePlus size={14} />}
              onClick={() => { setItemModalType(ItemType.FILE); setIsItemModalOpen(true); }}
            >
              {t.file}
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="flex-1"
              icon={<FolderPlus size={14} />}
              onClick={() => { setItemModalType(ItemType.FOLDER); setIsItemModalOpen(true); }}
            >
              {t.folder}
            </Button>
          </div>

          <div 
            className="flex-1 overflow-y-auto p-2"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleRootDrop}
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedTreeItemId(null);
            }}
          >
            <FileTree 
              items={items.filter(i => i.kbId === activeKbId)}
              parentId={null} // Root items of current KB
              onSelect={handleTreeSelect}
              selectedId={selectedTreeItemId || undefined}
              onDelete={handleDeleteItem}
              onRename={openRenameModal}
              expandedIds={expandedFolderIds}
              onToggle={handleToggleFolder}
              onMoveItem={handleMoveItem}
              labels={{
                empty: t.folderEmpty,
                rename: t.renameTooltip,
                delete: t.deleteTooltip
              }}
            />
            {/* Explicit Root Drop Zone Area (Visible when dragging?) - using CSS minimal approach via container onDrop */}
            <div className="h-12 w-full"></div>
          </div>
        </div>
      )}
      
      {/* Collapsed Sidebar Toggle */}
      {!sidebarOpen && activeKbId && (
        <div className="w-4 bg-slate-50 border-r border-slate-200 flex items-start pt-4 justify-center hover:bg-slate-100 cursor-pointer" onClick={() => setSidebarOpen(true)}>
          <Menu size={14} className="text-slate-400" />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 bg-white h-full">
        {activeKbId ? (
          renderEditor()
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400">
             <h1 className="text-2xl font-bold text-slate-800 mb-2">{t.welcomeTitle}</h1>
             <p>{t.welcomeSubtitle}</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal
        isOpen={isKbModalOpen}
        onClose={() => setIsKbModalOpen(false)}
        title={t.createKb}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.name}</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder={t.kbNamePlaceholder}
              value={newKbName}
              onChange={(e) => setNewKbName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <Button variant="ghost" onClick={() => setIsKbModalOpen(false)}>{t.cancel}</Button>
            <Button onClick={handleCreateKb} disabled={!newKbName.trim()}>{t.create}</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        title={`${t.create} ${itemModalType === ItemType.FOLDER ? t.folder : t.file}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.name}</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder={itemModalType === ItemType.FOLDER ? t.folderNamePlaceholder : t.fileNamePlaceholder}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateItem()}
            />
          </div>
           {selectedTreeItemId && (
              <p className="text-xs text-slate-500 italic">
                {t.createInside} <span className="font-medium">{items.find(i => i.id === selectedTreeItemId)?.name || t.unknown}</span>
                {items.find(i => i.id === selectedTreeItemId)?.type === ItemType.FILE && ` ${t.sibling}`}
              </p>
            )}
          <div className="flex justify-end space-x-3 pt-2">
            <Button variant="ghost" onClick={() => setIsItemModalOpen(false)}>{t.cancel}</Button>
            <Button onClick={handleCreateItem} disabled={!newItemName.trim()}>{t.create}</Button>
          </div>
        </div>
      </Modal>
      
      <Modal
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        title={t.renameItem}
      >
         <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.newName}</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleRenameItem()}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <Button variant="ghost" onClick={() => setIsRenameModalOpen(false)}>{t.cancel}</Button>
            <Button onClick={handleRenameItem} disabled={!newItemName.trim()}>{t.rename}</Button>
          </div>
        </div>
      </Modal>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        setTheme={setTheme}
        autoSave={autoSave}
        setAutoSave={setAutoSave}
        translations={t}
      />
    </div>
  );
};

export default App;