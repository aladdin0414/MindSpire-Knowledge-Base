import React, { useState, useRef } from 'react';
import { Folder, FileText, ChevronRight, ChevronDown, Trash2, Edit2, GripVertical } from 'lucide-react';
import { FileSystemItem, ItemType } from '../types';

interface FileTreeLabels {
  empty: string;
  rename: string;
  delete: string;
}

interface FileTreeProps {
  items: FileSystemItem[];
  parentId: string | null;
  level?: number;
  onSelect: (item: FileSystemItem) => void;
  selectedId?: string;
  onDelete: (id: string) => void;
  onRename: (item: FileSystemItem) => void;
  expandedIds: Set<string>;
  onToggle: (folderId: string) => void;
  onMoveItem: (draggedId: string, targetId: string | null, position: 'inside' | 'before' | 'after') => void;
  labels: FileTreeLabels;
}

export const FileTree: React.FC<FileTreeProps> = ({ 
  items, 
  parentId, 
  level = 0, 
  onSelect, 
  selectedId,
  onDelete,
  onRename,
  expandedIds,
  onToggle,
  onMoveItem,
  labels
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [dragOverInfo, setDragOverInfo] = useState<{ id: string, position: 'inside' | 'before' | 'after' } | null>(null);

  // Sort by 'order'
  const currentItems = items
    .filter(item => item.parentId === parentId)
    .sort((a, b) => a.order - b.order);

  const handleDragStart = (e: React.DragEvent, item: FileSystemItem) => {
    e.dataTransfer.setData('application/mindspire-item', item.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, targetItem: FileSystemItem) => {
    e.preventDefault(); // Necessary to allow dropping
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    
    let position: 'inside' | 'before' | 'after' = 'inside';

    // Logic to determine position
    // Top 25% -> before
    // Bottom 25% -> after
    // Middle 50% -> inside (only if folder)
    
    if (targetItem.type === ItemType.FOLDER) {
        if (y < height * 0.25) position = 'before';
        else if (y > height * 0.75) position = 'after';
        else position = 'inside';
    } else {
        // Files cannot have children, so only before/after
        if (y < height * 0.5) position = 'before';
        else position = 'after';
    }

    setDragOverInfo({ id: targetItem.id, position });
  };

  const handleDrop = (e: React.DragEvent, targetItem: FileSystemItem) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverInfo(null);
    
    const draggedId = e.dataTransfer.getData('application/mindspire-item');
    if (draggedId && dragOverInfo) {
      onMoveItem(draggedId, targetItem.id, dragOverInfo.position);
    }
  };

  if (currentItems.length === 0 && level === 0) {
    return <div className="text-sm text-slate-400 italic p-4 text-center">{labels.empty}</div>;
  }

  return (
    <ul className="space-y-0.5">
      {currentItems.map(item => {
        const isExpanded = expandedIds.has(item.id);
        const isSelected = selectedId === item.id;
        const isFolder = item.type === ItemType.FOLDER;
        
        // Drag State Visuals
        const isDragOver = dragOverInfo?.id === item.id;
        const dragPosition = isDragOver ? dragOverInfo?.position : null;

        return (
          <li key={item.id} className="relative">
            {/* Drop Indicator Lines */}
            {isDragOver && dragPosition === 'before' && (
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-indigo-500 z-10 rounded-full" style={{ marginLeft: `${level * 12}px` }}></div>
            )}
            
            <div 
              draggable
              onDragStart={(e) => handleDragStart(e, item)}
              onDragOver={(e) => handleDragOver(e, item)}
              onDragLeave={() => setDragOverInfo(null)}
              onDrop={(e) => handleDrop(e, item)}
              className={`
                group flex items-center py-1.5 px-2 cursor-pointer rounded-md transition-colors text-sm select-none border border-transparent
                ${isSelected ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-100'}
                ${isDragOver && dragPosition === 'inside' ? 'bg-indigo-100 border-indigo-300' : ''}
              `}
              style={{ paddingLeft: `${level * 12 + 8}px` }}
              onClick={() => onSelect(item)}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Drag Handle (Subtle) */}
              <span className="opacity-0 group-hover:opacity-20 mr-1 cursor-grab active:cursor-grabbing">
                 <GripVertical size={12} />
              </span>

              <span 
                className={`mr-1 p-0.5 rounded hover:bg-slate-200 transition-colors ${!isFolder && 'invisible'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isFolder) onToggle(item.id);
                }}
              >
                {isFolder && (isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
              </span>
              
              <span className="mr-2 text-slate-400">
                {isFolder ? <Folder size={16} fill="currentColor" className="text-amber-400" /> : <FileText size={16} />}
              </span>
              
              <span className="truncate flex-1">{item.name}</span>

              {/* Action Buttons */}
              {(hoveredId === item.id || isSelected) && (
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button 
                    onClick={(e) => { e.stopPropagation(); onRename(item); }}
                    className="p-1 hover:bg-slate-200 rounded text-slate-500"
                    title={labels.rename}
                  >
                    <Edit2 size={12} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                    className="p-1 hover:bg-red-100 hover:text-red-600 rounded text-slate-400"
                    title={labels.delete}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>
            
            {/* Drop Indicator Line Bottom */}
            {isDragOver && dragPosition === 'after' && (
               <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 z-10 rounded-full" style={{ marginLeft: `${level * 12}px` }}></div>
            )}

            {isFolder && isExpanded && (
              <FileTree 
                items={items} 
                parentId={item.id} 
                level={level + 1} 
                onSelect={onSelect}
                selectedId={selectedId}
                onDelete={onDelete}
                onRename={onRename}
                expandedIds={expandedIds}
                onToggle={onToggle}
                onMoveItem={onMoveItem}
                labels={labels}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
};